import { createClient } from "@/lib/supabase/client";
import { fetchMyActiveQuests, fetchTodayProgress } from "./api";

// Examples of what gets auto-tracked:
//
// Action: "Practice typing for 15 minutes"
//   → matches typing_lesson ✅
//
// Action: "Do 1 Brain Sprint math lesson"
//   → matches brain_sprint_math ✅
//
// Action: "Read for 20 minutes"
//   → no match (manual checkbox only) ❌
//
// Action: "Help with dishes"
//   → no match (manual checkbox only) ❌

// Activity types that can trigger auto-track
export type AutoTrackActivity =
  | "typing_lesson"
  | "brain_sprint_math"
  | "brain_sprint_eco";

// Keyword sets — case-insensitive
const KEYWORD_SETS: Record<AutoTrackActivity, string[]> = {
  typing_lesson: ["typing", "type", "keyboard", "wpm", "lesson"],
  brain_sprint_math: [
    "brain sprint",
    "brainsprint",
    "math",
    "addition",
    "subtraction",
    "multiplication",
    "division",
    "times table",
    "arithmetic",
    "numbers",
  ],
  brain_sprint_eco: [
    "brain sprint",
    "brainsprint",
    "eco",
    "environment",
    "recycle",
    "recycling",
    "planet",
    "nature",
    "tree",
    "trees",
    "climate",
  ],
};

// Returns true if the action text matches the activity
export function actionMatchesActivity(
  actionText: string,
  activity: AutoTrackActivity
): boolean {
  const lower = actionText.toLowerCase();
  // "lesson" matches Brain Sprint lines too; those are tracked via brain_sprint_* only.
  if (
    activity === "typing_lesson" &&
    (lower.includes("brain sprint") || lower.includes("brainsprint"))
  ) {
    return false;
  }
  const keywords = KEYWORD_SETS[activity];
  return keywords.some((kw) => lower.includes(kw));
}

// Auto-tick matching actions across all active quests for today
export async function triggerAutoTrack(activity: AutoTrackActivity): Promise<{
  questsUpdated: number;
  actionsTicked: number;
}> {
  try {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    const activeQuests = await fetchMyActiveQuests();
    if (activeQuests.length === 0) return { questsUpdated: 0, actionsTicked: 0 };

    let questsUpdated = 0;
    let actionsTicked = 0;

    for (const quest of activeQuests) {
      const matchingActionIndexes: number[] = [];
      quest.action_plan.forEach((actionText, idx) => {
        if (actionMatchesActivity(actionText, activity)) {
          matchingActionIndexes.push(idx);
        }
      });

      if (matchingActionIndexes.length === 0) continue;

      const todayProgress = await fetchTodayProgress(quest.id);
      const currentCompleted: number[] = todayProgress?.completed_actions || [];

      const newToTick = matchingActionIndexes.filter(
        (idx) => !currentCompleted.includes(idx)
      );

      if (newToTick.length === 0) continue;

      const updatedActions = [...currentCompleted, ...newToTick].sort((a, b) => a - b);
      const isFullDayComplete = updatedActions.length === quest.action_plan.length;

      if (todayProgress) {
        const { error: updError } = await supabase
          .from("quest_progress")
          .update({
            completed_actions: updatedActions,
            is_full_day_complete: isFullDayComplete,
          })
          .eq("id", todayProgress.id);
        if (updError) {
          console.error("[AutoTrack] update:", updError);
          continue;
        }
      } else {
        const { error: insError } = await supabase.from("quest_progress").insert({
          quest_id: quest.id,
          date: today,
          completed_actions: updatedActions,
          is_full_day_complete: isFullDayComplete,
        });
        if (insError) {
          console.error("[AutoTrack] insert:", insError);
          continue;
        }
      }

      questsUpdated++;
      actionsTicked += newToTick.length;
    }

    if (actionsTicked > 0 && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("quest-auto-track", {
          detail: { actionsTicked, questsUpdated },
        })
      );
    }

    return { questsUpdated, actionsTicked };
  } catch (err) {
    console.error("[AutoTrack] error:", err);
    return { questsUpdated: 0, actionsTicked: 0 };
  }
}
