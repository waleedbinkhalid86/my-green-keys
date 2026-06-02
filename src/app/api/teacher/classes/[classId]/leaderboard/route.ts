import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { verifyTeacherOwnsClass } from "@/lib/teacher/verify-class-ownership";

export type LeaderboardStudent = {
  rank: number;
  studentId: string;
  name: string;
  avgWpm: number;
  avgAccuracy: number;
  lessonsCompleted: number;
};

export type LeaderboardResponse = {
  className: string;
  students: LeaderboardStudent[];
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

  // Fetch all students enrolled in this class
  const { data: enrollments, error: enrollError } = await admin
    .from("class_enrollments")
    .select("student_auth_user_id, display_name")
    .eq("class_id", classId)
    .order("display_name", { ascending: true });

  if (enrollError) {
    return NextResponse.json({ error: enrollError.message }, { status: 500 });
  }

  if (!enrollments?.length) {
    return NextResponse.json({ className: owned.classRow.name, students: [] } satisfies LeaderboardResponse);
  }

  const studentIds = enrollments.map((e) => e.student_auth_user_id as string);

  // Fetch all completed progress rows for these students
  const { data: progressRows, error: progressError } = await admin
    .from("student_progress")
    .select("student_id, wpm, accuracy")
    .in("student_id", studentIds)
    .eq("completed", true);

  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  // Aggregate per student: sum WPM readings, accuracy readings, lesson count
  type Stats = { wpms: number[]; accuracies: number[]; count: number };
  const statsMap = new Map<string, Stats>();

  for (const row of progressRows ?? []) {
    const sid = row.student_id as string;
    if (!statsMap.has(sid)) statsMap.set(sid, { wpms: [], accuracies: [], count: 0 });
    const s = statsMap.get(sid)!;
    s.count++;
    if (typeof row.wpm === "number" && row.wpm > 0) s.wpms.push(row.wpm);
    if (typeof row.accuracy === "number" && row.accuracy > 0) s.accuracies.push(row.accuracy);
  }

  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const students = enrollments.map((e) => {
    const sid = e.student_auth_user_id as string;
    const stats = statsMap.get(sid);
    return {
      rank: 0,
      studentId: sid,
      name: (e.display_name as string | null)?.trim() || "Student",
      avgWpm: avg(stats?.wpms ?? []),
      avgAccuracy: avg(stats?.accuracies ?? []),
      lessonsCompleted: stats?.count ?? 0,
    };
  });

  // Sort: most WPM first, accuracy as tiebreaker, then alphabetically
  students.sort((a, b) => {
    if (b.avgWpm !== a.avgWpm) return b.avgWpm - a.avgWpm;
    if (b.avgAccuracy !== a.avgAccuracy) return b.avgAccuracy - a.avgAccuracy;
    return a.name.localeCompare(b.name);
  });

  students.forEach((s, i) => { s.rank = i + 1; });

  return NextResponse.json({ className: owned.classRow.name, students } satisfies LeaderboardResponse);
}
