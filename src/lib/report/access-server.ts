import type { SupabaseClient } from "@supabase/supabase-js";

/** Server-side: student, parent of child, or teacher of an enrolled class. */
export async function canAccessStudentReport(
  supabase: SupabaseClient,
  viewerId: string,
  studentId: string
): Promise<boolean> {
  if (viewerId === studentId) return true;

  const { data: childByAuth } = await supabase
    .from("children")
    .select("id")
    .eq("parent_id", viewerId)
    .eq("auth_user_id", studentId)
    .maybeSingle();
  if (childByAuth) return true;

  const { data: classes } = await supabase.from("classes").select("id").eq("teacher_id", viewerId);
  const classIds = (classes as { id: string }[] | null)?.map((c) => c.id) ?? [];
  if (classIds.length > 0) {
    const { data: en } = await supabase
      .from("class_enrollments")
      .select("student_auth_user_id")
      .eq("student_auth_user_id", studentId)
      .in("class_id", classIds)
      .limit(1)
      .maybeSingle();
    if (en) return true;
  }

  const { data: prof } = await supabase.from("profiles").select("email").eq("id", studentId).maybeSingle();
  const email = ((prof as { email?: string } | null)?.email ?? "").trim().toLowerCase();
  if (email) {
    const { data: child } = await supabase
      .from("children")
      .select("id")
      .eq("parent_id", viewerId)
      .ilike("username", email)
      .maybeSingle();
    if (child) return true;
  }

  return false;
}
