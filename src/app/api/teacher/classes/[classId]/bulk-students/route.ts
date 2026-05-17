import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { bulkInsertTeacherClassStudents } from "@/lib/kid-login/bulk-students-server";
import type { BulkStudentRowInput, BulkStudentsApiResponse } from "@/lib/kid-login/bulk-upload-types";
import { BULK_UPLOAD_MAX_ROWS } from "@/lib/kid-login/bulk-upload-parse";

type BulkStudentsBody = {
  students?: BulkStudentRowInput[];
};

export async function POST(
  req: Request,
  context: { params: Promise<{ classId: string }> }
) {
  const { classId } = await context.params;

  let body: BulkStudentsBody;
  try {
    body = (await req.json()) as BulkStudentsBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const students = body.students;
  if (!Array.isArray(students) || students.length === 0) {
    return NextResponse.json({ error: "No students provided" }, { status: 400 });
  }
  if (students.length > BULK_UPLOAD_MAX_ROWS) {
    return NextResponse.json(
      { error: `Maximum ${BULK_UPLOAD_MAX_ROWS} students per upload` },
      { status: 400 }
    );
  }

  for (const row of students) {
    if (!row.name?.trim()) {
      return NextResponse.json({ error: "Each student must have a name" }, { status: 400 });
    }
    if (!Number.isInteger(row.grade) || row.grade < 1 || row.grade > 8) {
      return NextResponse.json(
        { error: "Each student must have a grade between 1 and 8" },
        { status: 400 }
      );
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: classRow, error: classError } = await supabase
    .from("classes")
    .select("id, name, school_name, teacher_id")
    .eq("id", classId)
    .is("archived_at", null)
    .maybeSingle();

  if (classError) {
    return NextResponse.json({ error: classError.message }, { status: 500 });
  }
  if (!classRow || classRow.teacher_id !== user.id) {
    return NextResponse.json({ error: "Class not found or access denied" }, { status: 403 });
  }

  const admin = createServiceRoleClient();
  const normalized: BulkStudentRowInput[] = students.map((s) => ({
    name: s.name.trim(),
    grade: s.grade,
  }));

  const results = await bulkInsertTeacherClassStudents(admin, {
    teacherId: user.id,
    classId,
    className: classRow.name,
    schoolName: classRow.school_name,
    students: normalized,
  });

  const payload: BulkStudentsApiResponse = {
    results,
    className: classRow.name,
  };

  return NextResponse.json(payload);
}
