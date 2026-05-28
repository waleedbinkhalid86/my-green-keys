import type { SupabaseClient } from "@supabase/supabase-js";

export type StudentReportIdentity = {
  full_name: string;
  age: number | null;
  class_name: string | null;
};

/** Service role: resolve display name, age, and primary class for a student auth id. */
export async function fetchStudentReportIdentity(
  admin: SupabaseClient,
  studentId: string
): Promise<StudentReportIdentity> {
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, age")
    .eq("id", studentId)
    .maybeSingle();

  const { data: child } = await admin
    .from("children")
    .select("full_name, age")
    .eq("auth_user_id", studentId)
    .maybeSingle();

  const profileName = (profile as { full_name?: string | null } | null)?.full_name?.trim() ?? "";
  const childName = (child as { full_name?: string | null } | null)?.full_name?.trim() ?? "";
  const full_name = profileName || childName || "Student";

  const profileAge = (profile as { age?: number | null } | null)?.age;
  const childAge = (child as { age?: number | null } | null)?.age;
  const age =
    profileAge != null && Number.isFinite(Number(profileAge))
      ? Number(profileAge)
      : childAge != null && Number.isFinite(Number(childAge))
        ? Number(childAge)
        : null;

  const { data: enrollments } = await admin
    .from("class_enrollments")
    .select("class_id, joined_at, classes(name)")
    .eq("student_auth_user_id", studentId)
    .order("joined_at", { ascending: false })
    .limit(5);

  let class_name: string | null = null;
  for (const row of enrollments ?? []) {
    const classes = row.classes as { name?: string } | { name?: string }[] | null;
    const cls = Array.isArray(classes) ? classes[0] : classes;
    const name = cls?.name?.trim();
    if (name) {
      class_name = name;
      break;
    }
  }

  return { full_name, age, class_name };
}
