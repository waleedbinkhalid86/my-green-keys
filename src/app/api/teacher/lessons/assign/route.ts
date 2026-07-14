import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { verifyTeacherOwnsClass } from "@/lib/teacher/verify-class-ownership";

type AssignLessonBody = {
  classId?: string;
  title?: string;
  content?: string;
  difficulty?: string;
  assignTo?: "class" | "individual";
  studentAuthUserId?: string;
};

export type AssignLessonResponse = {
  assignedCount: number;
  className: string;
};

export async function POST(req: Request) {
  let body: AssignLessonBody;
  try {
    body = (await req.json()) as AssignLessonBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const classId = body.classId?.trim() ?? "";
  const title = body.title?.trim() ?? "";
  const content = body.content?.trim() ?? "";
  const difficulty = body.difficulty?.trim() || "Beginner";
  const assignTo = body.assignTo === "individual" ? "individual" : "class";
  const studentAuthUserId = body.studentAuthUserId?.trim() ?? "";

  if (!classId) {
    return NextResponse.json({ error: "A class must be selected." }, { status: 400 });
  }
  if (!title || !content) {
    return NextResponse.json({ error: "Add a lesson name and lesson text." }, { status: 400 });
  }
  if (assignTo === "individual" && !studentAuthUserId) {
    return NextResponse.json({ error: "Pick a student to assign this lesson to." }, { status: 400 });
  }

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
    .select("student_auth_user_id")
    .eq("class_id", classId);

  if (enrollError) {
    return NextResponse.json({ error: enrollError.message }, { status: 500 });
  }

  const enrolledAuthIds = new Set(
    (enrollments ?? []).map((e) => e.student_auth_user_id as string)
  );

  let targetAuthIds: string[];
  if (assignTo === "individual") {
    if (!enrolledAuthIds.has(studentAuthUserId)) {
      return NextResponse.json(
        { error: "That student isn't enrolled in this class." },
        { status: 400 }
      );
    }
    targetAuthIds = [studentAuthUserId];
  } else {
    targetAuthIds = Array.from(enrolledAuthIds);
  }

  if (targetAuthIds.length === 0) {
    return NextResponse.json(
      { error: "No students enrolled in this class yet." },
      { status: 400 }
    );
  }

  const { data: children, error: childrenError } = await admin
    .from("children")
    .select("id, auth_user_id")
    .eq("teacher_id", user.id)
    .in("auth_user_id", targetAuthIds);

  if (childrenError) {
    return NextResponse.json({ error: childrenError.message }, { status: 500 });
  }

  const childIds = (children ?? []).map((c) => c.id as string);
  if (childIds.length === 0) {
    return NextResponse.json(
      { error: "Couldn't find student records for this class." },
      { status: 500 }
    );
  }

  const createdAt = new Date().toISOString();
  const rows = childIds.map((childId) => ({
    created_by: user.id,
    title,
    content,
    difficulty,
    assigned_child_id: childId,
    created_at: createdAt,
  }));

  const { error: insertError } = await admin.from("custom_lessons").insert(rows);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const payload: AssignLessonResponse = {
    assignedCount: childIds.length,
    className: owned.classRow.name,
  };

  return NextResponse.json(payload);
}

type DeleteLessonBody = {
  ids?: string[];
};

export async function DELETE(req: Request) {
  let body: DeleteLessonBody;
  try {
    body = (await req.json()) as DeleteLessonBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ids = Array.isArray(body.ids)
    ? body.ids.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "No lesson ids provided." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  const { data: deleted, error } = await admin
    .from("custom_lessons")
    .delete()
    .eq("created_by", user.id)
    .in("id", ids)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deletedCount: deleted?.length ?? 0 });
}
