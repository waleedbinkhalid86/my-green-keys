import { config } from "dotenv";
config({ path: ".env.local" });

/**
 * ONE-TIME: Repair student profiles with auth.users + profiles but no children row.
 * Hardcoded to exactly two auth_user_ids — do not extend without review.
 *
 * Run: npx tsx scripts/repair-two-profile-orphans.ts
 */

import { createServiceRoleClient } from "@/lib/supabase/admin";
import { generateUniqueKidCodeAdmin } from "@/lib/kid-login/code-generator-server";
import {
  generateInternalEmail,
  generateInternalPassword,
} from "@/lib/kid-login/internal-credentials";

const TARGET_AUTH_USER_IDS = [
  "01fb50b5-1381-4bfb-b02f-80f7c7263867", // Muhammad Rayyan
  "0aa563a1-6cb3-434b-80b5-5427607aa47e", // sad life
] as const;

type ClassLink = { class_id: string | null; teacher_id: string | null };

async function resolveClassLink(
  admin: ReturnType<typeof createServiceRoleClient>,
  authUserId: string
): Promise<ClassLink> {
  const { data: enrollment, error: enrollErr } = await admin
    .from("class_enrollments")
    .select("class_id")
    .eq("student_auth_user_id", authUserId)
    .limit(1)
    .maybeSingle();

  if (enrollErr) {
    throw new Error(`class_enrollments lookup: ${enrollErr.message}`);
  }
  if (!enrollment?.class_id) {
    return { class_id: null, teacher_id: null };
  }

  const { data: classRow, error: classErr } = await admin
    .from("classes")
    .select("id, teacher_id")
    .eq("id", enrollment.class_id)
    .maybeSingle();

  if (classErr) {
    throw new Error(`classes lookup: ${classErr.message}`);
  }
  if (!classRow) {
    return { class_id: enrollment.class_id, teacher_id: null };
  }

  return { class_id: classRow.id, teacher_id: classRow.teacher_id };
}

async function repairOne(
  admin: ReturnType<typeof createServiceRoleClient>,
  authUserId: string
): Promise<{ auth_user_id: string; full_name: string; login_code: string }> {
  const { data: existingChild } = await admin
    .from("children")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (existingChild) {
    throw new Error(`children row already exists (id=${existingChild.id})`);
  }

  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .select("id, full_name, account_type, age")
    .eq("id", authUserId)
    .maybeSingle();

  if (profileErr) {
    throw new Error(`profiles lookup: ${profileErr.message}`);
  }
  if (!profile) {
    throw new Error("profile not found");
  }
  if (profile.account_type !== "student") {
    throw new Error(`expected account_type=student, got ${profile.account_type}`);
  }

  const full_name = String(profile.full_name ?? "").trim() || "Student";
  const age = profile.age != null ? Number(profile.age) : null;
  const { class_id, teacher_id } = await resolveClassLink(admin, authUserId);

  const internal_email = generateInternalEmail();
  const internal_password = generateInternalPassword();

  let login_code: string | null = null;
  let lastError = "Unknown error";

  for (let attempt = 0; attempt < 3; attempt++) {
    login_code = await generateUniqueKidCodeAdmin(admin);
    const { error: childErr } = await admin.from("children").insert({
      parent_id: null,
      teacher_id,
      class_id,
      full_name,
      age,
      grade: age != null && Number.isFinite(age) ? Math.max(0, age - 5) : null,
      login_code,
      auth_user_id: authUserId,
      internal_email,
      internal_password,
      code_created_at: new Date().toISOString(),
    });

    if (!childErr) break;

    lastError = childErr.message;
    const isUniqueViolation =
      /duplicate|unique|already exists/i.test(lastError) || /login_code/i.test(lastError);
    if (!isUniqueViolation) {
      throw new Error(`children insert: ${lastError}`);
    }
    login_code = null;
  }

  if (!login_code) {
    throw new Error(`children insert failed after retries: ${lastError}`);
  }

  const { error: authErr } = await admin.auth.admin.updateUserById(authUserId, {
    email: internal_email,
    password: internal_password,
    email_confirm: true,
  });
  if (authErr) {
    throw new Error(`auth.admin.updateUserById: ${authErr.message}`);
  }

  const { error: profileUpdateErr } = await admin
    .from("profiles")
    .update({ email: internal_email })
    .eq("id", authUserId);
  if (profileUpdateErr) {
    throw new Error(`profiles email update: ${profileUpdateErr.message}`);
  }

  return { auth_user_id: authUserId, full_name, login_code };
}

async function main() {
  const admin = createServiceRoleClient();
  const results: Array<{
    auth_user_id: string;
    full_name: string;
    login_code: string;
  }> = [];
  const failures: Array<{ auth_user_id: string; error: string }> = [];

  for (const authUserId of TARGET_AUTH_USER_IDS) {
    try {
      const row = await repairOne(admin, authUserId);
      results.push(row);
      console.log(
        `[OK] ${row.full_name} (${authUserId}) → login_code=${row.login_code}`
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      failures.push({ auth_user_id: authUserId, error: msg });
      console.error(`[FAIL] ${authUserId}: ${msg}`);
    }
  }

  console.log("\n--- Login codes (save these) ---");
  for (const r of results) {
    console.log(`${r.full_name}: ${r.login_code}`);
  }

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
