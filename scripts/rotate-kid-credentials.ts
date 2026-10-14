import { config } from "dotenv";
config({ path: ".env.local" });

/**
 * ONE-TIME ADMIN: rotate kid credentials after the public children RLS exposure.
 *
 * HOW TO RUN (from project root):
 *   npx tsx scripts/rotate-kid-credentials.ts                      # dry run, no writes
 *   npx tsx scripts/rotate-kid-credentials.ts --rotate-codes       # dry run incl. codes
 *   npx tsx scripts/rotate-kid-credentials.ts --apply              # passwords only
 *   npx tsx scripts/rotate-kid-credentials.ts --apply --rotate-codes
 *
 * REQUIRED ENV VARS (.env.local is loaded automatically):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY   (server only, never expose in browser code)
 *
 * ORDER:
 *   1. Deploy Stage 1 code, run stage1a, test kid login live, run stage1b.
 *   2. Run this script with --apply. Running it before stage1b would leak the new values.
 *   3. Optionally run scripts/revoke-kid-sessions.sql to end existing sessions.
 *
 * WHAT IT DOES (per child with auth_user_id + internal_email):
 *   - New internal password -> auth user (admin API), then children.internal_password.
 *   - With --rotate-codes: also a new 6-char login_code (old code stops working).
 *   - Kiosk and exchange routes read credentials server-side, so they keep working.
 *
 * OUTPUT (--apply --rotate-codes): scripts/output/kid-codes-<timestamp>.csv
 *   with child name, new login code, owner email, class. This file is sensitive
 *   (it is a list of working logins). It is gitignored; delete it after codes are handed out.
 *
 * FAILURES: if one child's update fails part-way, it is listed at the end with a
 * ready-made --only=<ids> command. Use it: a full re-run would change everyone's
 * codes again and make the first CSV useless.
 * Passwords are never printed or written to disk.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { createServiceRoleClient } from "@/lib/supabase/admin";
import { generateInternalPassword } from "@/lib/kid-login/internal-credentials";
import { generateRandomCode, KID_CODE_LENGTH } from "@/lib/kid-login/code-core";

type Admin = ReturnType<typeof createServiceRoleClient>;

type ChildRow = {
  id: string;
  full_name: string | null;
  auth_user_id: string | null;
  internal_email: string | null;
  parent_id: string | null;
  teacher_id: string | null;
  class_id: string | null;
};

type CsvRow = {
  child_name: string;
  new_login_code: string;
  owner_type: string;
  owner_email: string;
  class_name: string;
};

const PAGE_SIZE = 1000;
const DELAY_MS = 150;

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const ROTATE_CODES = args.has("--rotate-codes");
// --only=<child_id>,<child_id> limits a re-run to the failures from a previous run.
const ONLY_IDS = new Set(
  (process.argv.find((a) => a.startsWith("--only="))?.slice("--only=".length) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function csvCell(value: string): string {
  // Also neutralise spreadsheet formula injection.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

async function fetchAllChildren(admin: Admin): Promise<ChildRow[]> {
  const rows: ChildRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await admin
      .from("children")
      .select("id, full_name, auth_user_id, internal_email, parent_id, teacher_id, class_id")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`Failed to load children: ${error.message}`);
    rows.push(...((data ?? []) as ChildRow[]));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

async function loadLookups(admin: Admin, children: ChildRow[]) {
  const ownerIds = [
    ...new Set(children.flatMap((c) => [c.parent_id, c.teacher_id]).filter(Boolean) as string[]),
  ];
  const classIds = [...new Set(children.map((c) => c.class_id).filter(Boolean) as string[])];

  const emailById = new Map<string, string>();
  for (let i = 0; i < ownerIds.length; i += 200) {
    const { data, error } = await admin
      .from("profiles")
      .select("id, email")
      .in("id", ownerIds.slice(i, i + 200));
    if (error) throw new Error(`Failed to load owner profiles: ${error.message}`);
    for (const p of data ?? []) emailById.set(p.id as string, (p.email as string | null) ?? "");
  }

  const classNameById = new Map<string, string>();
  for (let i = 0; i < classIds.length; i += 200) {
    const { data, error } = await admin
      .from("classes")
      .select("id, name")
      .in("id", classIds.slice(i, i + 200));
    if (error) throw new Error(`Failed to load classes: ${error.message}`);
    for (const c of data ?? []) classNameById.set(c.id as string, (c.name as string | null) ?? "");
  }

  return { emailById, classNameById };
}

/** Writes new password (and optionally a new unique login_code) to the children row. */
async function updateChildRow(
  admin: Admin,
  childId: string,
  internalPassword: string
): Promise<string | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const patch: Record<string, string> = { internal_password: internalPassword };
    let newCode: string | null = null;
    if (ROTATE_CODES) {
      newCode = generateRandomCode(KID_CODE_LENGTH);
      patch.login_code = newCode;
      patch.code_created_at = new Date().toISOString();
    }

    const { error } = await admin.from("children").update(patch).eq("id", childId);
    if (!error) return newCode;
    if (!(ROTATE_CODES && error.code === "23505")) {
      throw new Error(`children update failed: ${error.message}`);
    }
  }
  throw new Error("children update failed: could not find a unique login code");
}

async function main() {
  const admin = createServiceRoleClient();
  const all = await fetchAllChildren(admin);

  const eligible = all.filter(
    (c) => c.auth_user_id && c.internal_email && (ONLY_IDS.size === 0 || ONLY_IDS.has(c.id))
  );
  const skipped = all.length - eligible.length;
  if (ONLY_IDS.size > 0) console.log(`Limited by --only to ${ONLY_IDS.size} child id(s).`);

  console.log(`Children total:            ${all.length}`);
  console.log(`Eligible (auth + email):   ${eligible.length}`);
  console.log(`Skipped (no login account): ${skipped}`);
  console.log(`Rotate passwords:          yes`);
  console.log(`Rotate login codes:        ${ROTATE_CODES ? "yes (parents/teachers need new codes)" : "no"}`);

  if (!APPLY) {
    console.log("\nDry run: nothing was changed. Re-run with --apply to rotate.");
    return;
  }

  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(
    `\nThis will rotate credentials for ${eligible.length} kid accounts. Type ROTATE to continue: `
  );
  rl.close();
  if (answer.trim() !== "ROTATE") {
    console.log("Aborted. Nothing was changed.");
    return;
  }

  const { emailById, classNameById } = ROTATE_CODES
    ? await loadLookups(admin, eligible)
    : { emailById: new Map<string, string>(), classNameById: new Map<string, string>() };

  const csvRows: CsvRow[] = [];
  const failures: { child_id: string; step: string; message: string }[] = [];
  let done = 0;

  for (const child of eligible) {
    const newPassword = generateInternalPassword();

    const { error: authError } = await admin.auth.admin.updateUserById(child.auth_user_id!, {
      password: newPassword,
    });
    if (authError) {
      failures.push({ child_id: child.id, step: "auth", message: authError.message });
      await sleep(DELAY_MS);
      continue;
    }

    try {
      const newCode = await updateChildRow(admin, child.id, newPassword);
      if (newCode) {
        const ownerId = child.parent_id ?? child.teacher_id;
        csvRows.push({
          child_name: child.full_name?.trim() || "(no name)",
          new_login_code: newCode,
          owner_type: child.parent_id ? "parent" : child.teacher_id ? "teacher" : "",
          owner_email: (ownerId && emailById.get(ownerId)) || "",
          class_name: (child.class_id && classNameById.get(child.class_id)) || "",
        });
      }
      done++;
    } catch (err) {
      // Auth password changed but children row did not: this kid cannot log in until re-run.
      failures.push({
        child_id: child.id,
        step: "children",
        message: err instanceof Error ? err.message : String(err),
      });
    }

    if (done % 25 === 0 && done > 0) console.log(`  ...${done} rotated`);
    await sleep(DELAY_MS);
  }

  console.log(`\nRotated: ${done}/${eligible.length}`);

  if (csvRows.length > 0) {
    const dir = join(process.cwd(), "scripts", "output");
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `kid-codes-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`);
    const header = "child_name,new_login_code,owner_type,owner_email,class_name";
    const lines = csvRows.map((r) =>
      [r.child_name, r.new_login_code, r.owner_type, r.owner_email, r.class_name]
        .map(csvCell)
        .join(",")
    );
    writeFileSync(file, [header, ...lines].join("\n") + "\n", "utf8");
    console.log(`New codes written to: ${file}`);
    console.log("This file contains working logins. Delete it once codes are handed out.");
  }

  if (failures.length > 0) {
    console.log(`\nFailures (${failures.length}):`);
    for (const f of failures) console.log(`  child ${f.child_id} [${f.step}]: ${f.message}`);
    const flags = ROTATE_CODES ? "--apply --rotate-codes" : "--apply";
    console.log(
      `\nFix only these with:\n  npx tsx scripts/rotate-kid-credentials.ts ${flags} --only=${failures
        .map((f) => f.child_id)
        .join(",")}`
    );
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
