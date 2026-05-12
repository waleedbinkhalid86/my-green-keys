import { config } from "dotenv";
config({ path: ".env.local" });

/**
 * ONE-TIME ADMIN: Repair Phase 1 kid accounts that have login_code + auth_user_id
 * but no stored internal_email/internal_password (credentials were discarded).
 *
 * HOW TO RUN (from project root, with env loaded):
 *   npx tsx scripts/migrate-orphaned-kids.ts
 *
 * REQUIRED ENV VARS:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY   (server only — never expose in browser code)
 *
 * ENV:
 *   `.env.local` at the project root is loaded automatically via dotenv.
 *
 * WARNINGS:
 *   - This is DESTRUCTIVE for each affected auth.users row: it replaces email and password.
 *   - Intended to be run ONCE after verifying the orphan count. Re-running on already-fixed
 *     children should find zero rows (they no longer match the orphan filter).
 *   - Kid-facing data (names, Brain Sprint, streaks, eco-points, quests, etc.) is NOT
 *     touched; only auth credentials and matching profile email + children credential columns.
 */

import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { createServiceRoleClient } from "@/lib/supabase/admin";
import { generateInternalEmail, generateInternalPassword } from "@/lib/kid-login/internal-credentials";

type OrphanChild = {
  id: string;
  auth_user_id: string | null;
  login_code: string | null;
  internal_email: string | null;
  internal_password: string | null;
};

async function fetchOrphans(admin: ReturnType<typeof createServiceRoleClient>): Promise<OrphanChild[]> {
  const { data, error } = await admin
    .from("children")
    .select("id, auth_user_id, login_code, internal_email, internal_password")
    .not("login_code", "is", null)
    .or("internal_email.is.null,internal_password.is.null");

  if (error) {
    throw new Error(`Failed to query orphaned children: ${error.message}`);
  }
  return (data ?? []) as OrphanChild[];
}

async function migrateOneChild(
  admin: ReturnType<typeof createServiceRoleClient>,
  child: OrphanChild,
  internal_email: string,
  internal_password: string
): Promise<void> {
  const userId = child.auth_user_id;
  if (!userId) {
    throw new Error("missing auth_user_id");
  }

  const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
    email: internal_email,
    password: internal_password,
    email_confirm: true,
  });
  if (authErr) {
    throw new Error(`auth.admin.updateUserById: ${authErr.message}`);
  }

  const { error: profileErr } = await admin
    .from("profiles")
    .update({ email: internal_email })
    .eq("id", userId);
  if (profileErr) {
    throw new Error(`profiles update: ${profileErr.message}`);
  }

  const { error: childErr } = await admin
    .from("children")
    .update({ internal_email, internal_password })
    .eq("id", child.id);
  if (childErr) {
    throw new Error(`children update: ${childErr.message}`);
  }
}

async function main() {
  const admin = createServiceRoleClient();

  const orphans = await fetchOrphans(admin);
  console.log(`Found ${orphans.length} orphaned child row(s) (login_code set, internal_email or internal_password missing).`);

  if (orphans.length === 0) {
    console.log("Nothing to do. Exiting.");
    return;
  }

  const rl = readline.createInterface({ input, output });
  const answer = (await rl.question('Type YES to proceed (anything else aborts): ')).trim();
  rl.close();

  if (answer !== "YES") {
    console.log("Aborted (confirmation not YES).");
    return;
  }

  let migrated = 0;
  let failed = 0;
  let skipped = 0;

  for (const child of orphans) {
    const label = `child id=${child.id} login_code=${child.login_code ?? "(null)"}`;

    if (!child.auth_user_id) {
      skipped++;
      console.log(`[SKIP] ${label} — no auth_user_id, cannot repair auth.`);
      continue;
    }

    const internal_email = generateInternalEmail();
    const internal_password = generateInternalPassword();

    try {
      await migrateOneChild(admin, child, internal_email, internal_password);
      migrated++;
      console.log(`[OK] ${label} auth_user_id=${child.auth_user_id} → internal_email set (password stored on children row).`);
    } catch (e) {
      failed++;
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[FAIL] ${label} auth_user_id=${child.auth_user_id}: ${msg}`);
    }
  }

  console.log(`\nSummary: ${migrated} migrated, ${failed} failed, ${skipped} skipped (of ${orphans.length} orphan row(s) examined).`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
