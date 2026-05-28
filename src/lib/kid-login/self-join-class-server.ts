import type { SupabaseClient } from "@supabase/supabase-js";
import { generateUniqueKidCodeAdmin } from "@/lib/kid-login/code-generator-server";
import {
  generateInternalEmail,
  generateInternalPassword,
} from "@/lib/kid-login/internal-credentials";

export type SelfJoinClassResult = {
  auth_user_id: string;
  class_id: string;
  login_code: string;
  internal_email: string;
  internal_password: string;
};

async function insertSelfJoinedClassStudent(
  admin: SupabaseClient,
  params: {
    classId: string;
    teacherId: string;
    schoolName: string | null;
    displayName: string;
    loginCode: string;
  }
): Promise<SelfJoinClassResult> {
  const { classId, teacherId, schoolName, displayName, loginCode } = params;
  const internal_email = generateInternalEmail();
  const internal_password = generateInternalPassword();

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: internal_email,
    password: internal_password,
    email_confirm: true,
    user_metadata: {
      is_internal_kid_account: true,
      display_name: displayName,
      joined_via: "class_code",
    },
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message ?? "Failed to create your account");
  }

  const authUserId = authData.user.id;

  const { error: profileError } = await admin.from("profiles").insert({
    id: authUserId,
    full_name: displayName,
    email: internal_email,
    account_type: "student",
    school_name: schoolName,
    eco_points: 0,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(authUserId);
    throw new Error(profileError.message);
  }

  const { error: childError } = await admin.from("children").insert({
    teacher_id: teacherId,
    class_id: classId,
    parent_id: null,
    full_name: displayName,
    login_code: loginCode,
    auth_user_id: authUserId,
    internal_email,
    internal_password,
    code_created_at: new Date().toISOString(),
  });

  if (childError) {
    await admin.auth.admin.deleteUser(authUserId);
    throw new Error(childError.message);
  }

  const { error: enrollError } = await admin.from("class_enrollments").insert({
    class_id: classId,
    student_auth_user_id: authUserId,
    display_name: displayName,
  });

  if (enrollError) {
    throw new Error(enrollError.message);
  }

  return {
    auth_user_id: authUserId,
    class_id: classId,
    login_code: loginCode,
    internal_email,
    internal_password,
  };
}

/** Self-join via 8-char class code (service role; mirrors bulk-student identity). */
export async function selfJoinClassWithCode(
  admin: SupabaseClient,
  input: { class_code: string; display_name: string }
): Promise<SelfJoinClassResult> {
  const classCode = input.class_code.toUpperCase();
  const displayName = input.display_name.trim();

  const { data: classData, error: classError } = await admin
    .from("classes")
    .select("id, school_name, teacher_id")
    .eq("class_code", classCode)
    .is("archived_at", null)
    .maybeSingle();

  if (classError || !classData) {
    throw new Error("Class not found. Check the code with your teacher.");
  }

  let lastError = "Unknown error";

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const loginCode = await generateUniqueKidCodeAdmin(admin);
      return await insertSelfJoinedClassStudent(admin, {
        classId: classData.id,
        teacherId: classData.teacher_id,
        schoolName: classData.school_name,
        displayName,
        loginCode,
      });
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      const isUniqueViolation =
        /duplicate|unique|already exists/i.test(lastError) ||
        /login_code/i.test(lastError);
      if (!isUniqueViolation) break;
    }
  }

  throw new Error(lastError);
}
