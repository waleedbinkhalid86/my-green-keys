import { createClient } from "@/lib/supabase/client";
import type { BrainSprintProgress, LessonResult } from "./progress-types";

function mapProgressRow(row: Record<string, unknown>): BrainSprintProgress {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    lesson_id: String(row.lesson_id),
    track: row.track as "math" | "eco",
    best_score: Number(row.best_score ?? 0),
    best_stars: Number(row.best_stars ?? 0),
    best_accuracy: Number(row.best_accuracy ?? 0),
    best_streak: Number(row.best_streak ?? 0),
    total_attempts: Number(row.total_attempts ?? 0),
    eco_points_earned: Number(row.eco_points_earned ?? 0),
    is_completed: Boolean(row.is_completed),
    first_completed_at:
      row.first_completed_at === null || row.first_completed_at === undefined
        ? null
        : String(row.first_completed_at),
    last_attempted_at: String(row.last_attempted_at ?? ""),
  };
}

export async function fetchAllProgress(): Promise<BrainSprintProgress[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("brain_sprint_progress")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("[BrainSprint] fetchAllProgress error:", error);
    return [];
  }
  return (data ?? []).map((row) => mapProgressRow(row as Record<string, unknown>));
}

export async function fetchProgressForTrack(
  track: "math" | "eco",
): Promise<BrainSprintProgress[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("brain_sprint_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("track", track);

  if (error) {
    console.error("[BrainSprint] fetchProgressForTrack error:", error);
    return [];
  }
  return (data ?? []).map((row) => mapProgressRow(row as Record<string, unknown>));
}

/** Adds points from this attempt only (same wallet as typing lessons & games: profiles.eco_points). */
async function addEcoPointsToProfile(points: number): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || points <= 0) return;

  const { data: profile, error: fetchErr } = await supabase
    .from("profiles")
    .select("eco_points")
    .eq("id", user.id)
    .single();

  if (fetchErr) {
    console.error("[BrainSprint] fetch profile failed:", fetchErr);
    return;
  }

  const current =
    Number((profile as { eco_points?: number } | null)?.eco_points ?? 0) || 0;
  const newTotal = current + points;

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ eco_points: newTotal })
    .eq("id", user.id);

  if (updateErr) {
    console.error("[BrainSprint] update eco_points failed:", updateErr);
  }
}

export async function saveLessonResult(result: LessonResult): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing, error: fetchError } = await supabase
    .from("brain_sprint_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("lesson_id", result.lesson_id)
    .maybeSingle();

  if (fetchError) {
    console.error("[BrainSprint] saveLessonResult fetch error:", fetchError);
    throw fetchError;
  }

  const existingRow = existing as Record<string, unknown> | null;
  const isFirstCompletion =
    !(existingRow?.is_completed as boolean | undefined) && result.stars > 0;

  if (existingRow) {
    const { error: updateError } = await supabase
      .from("brain_sprint_progress")
      .update({
        best_score: Math.max(
          Number(existingRow.best_score ?? 0),
          result.score,
        ),
        best_stars: Math.max(
          Number(existingRow.best_stars ?? 0),
          result.stars,
        ),
        best_accuracy: Math.max(
          Number(existingRow.best_accuracy ?? 0),
          result.accuracy,
        ),
        best_streak: Math.max(
          Number(existingRow.best_streak ?? 0),
          result.best_streak,
        ),
        total_attempts: Number(existingRow.total_attempts ?? 0) + 1,
        eco_points_earned:
          Number(existingRow.eco_points_earned ?? 0) + result.eco_points,
        is_completed:
          Boolean(existingRow.is_completed) || result.stars > 0,
        first_completed_at:
          (existingRow.first_completed_at as string | null) ||
          (isFirstCompletion ? new Date().toISOString() : null),
        last_attempted_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("lesson_id", result.lesson_id);

    if (updateError) {
      console.error("[BrainSprint] saveLessonResult update error:", updateError);
      throw updateError;
    }
  } else {
    const { error: insertError } = await supabase
      .from("brain_sprint_progress")
      .insert({
        user_id: user.id,
        lesson_id: result.lesson_id,
        track: result.track,
        best_score: result.score,
        best_stars: result.stars,
        best_accuracy: result.accuracy,
        best_streak: result.best_streak,
        total_attempts: 1,
        eco_points_earned: result.eco_points,
        is_completed: result.stars > 0,
        first_completed_at:
          result.stars > 0 ? new Date().toISOString() : null,
        last_attempted_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("[BrainSprint] saveLessonResult insert error:", insertError);
      throw insertError;
    }
  }

  await addEcoPointsToProfile(result.eco_points);
}

export function isLessonUnlocked(
  lessonId: string,
  lessonNumber: number,
  track: "math" | "eco",
  allProgress: BrainSprintProgress[],
): boolean {
  void lessonId;
  if (lessonNumber === 1) return true;

  const prevLessonId = `${track}-${lessonNumber - 1}`;
  const prevProgress = allProgress.find((p) => p.lesson_id === prevLessonId);

  return prevProgress?.is_completed === true;
}
