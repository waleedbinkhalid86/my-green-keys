import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { verifyTeacherOwnsClass } from "@/lib/teacher/verify-class-ownership";

export type StudentCodeRow = {
  student_auth_user_id: string;
  full_name: string;
  login_code: string | null;
};

export type StudentCodesResponse = {
  className: string;
  schoolName: string | null;
  students: StudentCodeRow[];
};

export async function GET(
  _req: Request,
  context: { params: Promise<{ classId: string }> }
) {
  const { classId } = await context.params;

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const owned = await verifyTeacherOwnsClass(supabase, user.id, classId);
  if (!owned.ok) {
    return NextResponse.json({ error: "Class not found or access denied" }, { status: 403 });
  }

  const admin = createServiceRoleClient();

  const { data: enrollments, error: enrollError } = await admin
    .from("class_enrollments")
    .select("student_auth_user_id, display_name")
    .eq("class_id", classId)
    .order("display_name", { ascending: true });

  if (enrollError) {
    return NextResponse.json({ error: enrollError.message }, { status: 500 });
  }

  const authIds = (enrollments ?? []).map((e) => e.student_auth_user_id as string).filter(Boolean);
  const codeByAuth = new Map<string, string | null>();
  const nameByAuth = new Map<string, string>();

  if (authIds.length > 0) {
    const { data: children, error: childError } = await admin
      .from("children")
      .select("auth_user_id, login_code, full_name")
      .in("auth_user_id", authIds);

    if (childError) {
      return NextResponse.json({ error: childError.message }, { status: 500 });
    }

    for (const row of children ?? []) {
      const authId = row.auth_user_id as string;
      const code = (row.login_code as string | null)?.trim().toUpperCase() || null;
      codeByAuth.set(authId, code);
      const childName = (row.full_name as string | null)?.trim();
      if (childName) nameByAuth.set(authId, childName);
    }
  }

  const students: StudentCodeRow[] = (enrollments ?? []).map((e) => {
    const authId = e.student_auth_user_id as string;
    const display = (e.display_name as string | null)?.trim() ?? "";
    const full_name = display || nameByAuth.get(authId) || "Student";
    return {
      student_auth_user_id: authId,
      full_name,
      login_code: codeByAuth.get(authId) ?? null,
    };
  });

  const payload: StudentCodesResponse = {
    className: owned.classRow.name,
    schoolName: owned.classRow.school_name,
    students,
  };

  return NextResponse.json(payload);
}
