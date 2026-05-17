import type { SupabaseClient } from "@supabase/supabase-js";
import { generateUniqueKidCodeAdmin } from "@/lib/kid-login/code-generator-server";
import { generateInternalPassword } from "@/lib/kid-login/internal-credentials";
import type { BulkStudentRowInput, BulkStudentRowResult } from "@/lib/kid-login/bulk-upload-types";

function teacherKidInternalEmail(loginCode: string): string {
  return `${loginCode.toLowerCase()}@mygreenkeys.local`;
}

async function insertOneTeacherClassStudent(
  admin: SupabaseClient,
  params: {
    teacherId: string;
    classId: string;
    schoolName: string | null;
    name: string;
    grade: number;
    loginCode: string;
  }
): Promise<{ authUserId: string }> {
  const { teacherId, classId, schoolName, name, grade, loginCode } = params;
  const internal_email = teacherKidInternalEmail(loginCode);
  const internal_password = generateInternalPassword();

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: internal_email,
    password: internal_password,
    email_confirm: true,
    user_metadata: {
      is_internal_kid_account: true,
      display_name: name,
      created_via: "teacher_bulk_upload",
    },
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message ?? "Failed to create student account");
  }

  const authUserId = authData.user.id;

  const { error: profileError } = await admin.from("profiles").insert({
    id: authUserId,
    full_name: name,
    email: internal_email,
    account_type: "student",
    age: grade + 5,
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
    full_name: name,
    grade,
    age: grade + 5,
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
    display_name: name,
  });

  if (enrollError) {
    throw new Error(enrollError.message);
  }

  return { authUserId };
}

export async function bulkInsertTeacherClassStudents(
  admin: SupabaseClient,
  params: {
    teacherId: string;
    classId: string;
    className: string;
    schoolName: string | null;
    students: BulkStudentRowInput[];
  }
): Promise<BulkStudentRowResult[]> {
  const results: BulkStudentRowResult[] = [];

  for (const student of params.students) {
    let lastError = "Unknown error";
    let added = false;
    let loginCode: string | null = null;

    for (let attempt = 0; attempt < 3 && !added; attempt++) {
      try {
        loginCode = await generateUniqueKidCodeAdmin(admin);
        await insertOneTeacherClassStudent(admin, {
          teacherId: params.teacherId,
          classId: params.classId,
          schoolName: params.schoolName,
          name: student.name,
          grade: student.grade,
          loginCode,
        });
        added = true;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        const isUniqueViolation =
          /duplicate|unique|already exists/i.test(lastError) ||
          /login_code/i.test(lastError);
        if (!isUniqueViolation) break;
      }
    }

    if (added && loginCode) {
      results.push({
        name: student.name,
        grade: student.grade,
        loginCode,
        status: "added",
      });
    } else {
      results.push({
        name: student.name,
        grade: student.grade,
        loginCode: null,
        status: "failed",
        reason: lastError,
      });
    }
  }

  return results;
}
