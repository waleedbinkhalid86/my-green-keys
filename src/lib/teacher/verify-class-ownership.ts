import type { SupabaseClient } from "@supabase/supabase-js";

export type OwnedClassRow = {
  id: string;
  name: string;
  school_name: string | null;
  teacher_id: string;
};

/** Returns the class row when the authenticated user owns it (not archived). */
export async function verifyTeacherOwnsClass(
  supabase: SupabaseClient,
  teacherId: string,
  classId: string
): Promise<{ ok: true; classRow: OwnedClassRow } | { ok: false }> {
  const { data: classRow, error } = await supabase
    .from("classes")
    .select("id, name, school_name, teacher_id")
    .eq("id", classId)
    .is("archived_at", null)
    .maybeSingle();

  if (error || !classRow || classRow.teacher_id !== teacherId) {
    return { ok: false };
  }

  return { ok: true, classRow: classRow as OwnedClassRow };
}
