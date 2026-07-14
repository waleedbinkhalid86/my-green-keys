import { createClient } from "@/lib/supabase/client";
import { getFamilyOwnerId } from "@/lib/kid-login/family-resolver";

export type CustomLessonRow = {
  id: string;
  title: string | null;
  content: string | null;
  difficulty: string | null;
  assigned_child_id: string | null;
  created_at: string | null;
};

/**
 * Loads custom_lessons for the family owner (parent id for linked kids).
 * RLS also restricts rows: parents see lessons they created; kids only see lessons
 * assigned to their own children.id.
 */
export async function fetchCustomLessonsForViewer(): Promise<CustomLessonRow[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const ownerId = await getFamilyOwnerId(user.id);
  const { data, error } = await supabase
    .from("custom_lessons")
    .select("id, title, content, difficulty, assigned_child_id, created_at")
    .eq("created_by", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[custom-lessons-api] fetch:", error);
    return [];
  }
  return (data as CustomLessonRow[]) ?? [];
}

/**
 * Loads custom_lessons rows created by the signed-in teacher (one row per
 * assigned student — there's no batch/assignment id, so callers that want
 * "lessons" rather than "assignments" need to group rows themselves).
 */
export async function fetchTeacherCreatedLessons(): Promise<CustomLessonRow[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("custom_lessons")
    .select("id, title, content, difficulty, assigned_child_id, created_at")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[custom-lessons-api] fetchTeacherCreatedLessons:", error);
    return [];
  }
  return (data as CustomLessonRow[]) ?? [];
}
