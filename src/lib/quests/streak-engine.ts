import { createClient } from "@/lib/supabase/client";
import type { Quest } from "./types";

export interface QuestState {
  current_day: number;
  skip_days_remaining: number;
  is_completed: boolean;
  needs_reset: boolean;
  consecutive_miss_count: number;
}

function questRules(quest: Quest) {
  return {
    skip_days_allowed: quest.skip_days_allowed ?? 2,
    reset_after_misses: quest.reset_after_misses ?? 3,
  };
}

function getDateRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export async function computeQuestState(quest: Quest): Promise<QuestState> {
  const supabase = createClient();
  const { skip_days_allowed, reset_after_misses } = questRules(quest);

  const [progressRes, skipsRes] = await Promise.all([
    supabase.from("quest_progress").select("*").eq("quest_id", quest.id),
    supabase.from("quest_skips").select("*").eq("quest_id", quest.id),
  ]);

  const completedDates = new Set(
    (progressRes.data || [])
      .filter((p) => p.is_full_day_complete)
      .map((p) => p.date)
  );
  const skippedDates = new Set(
    (skipsRes.data || []).map((s) => s.skipped_date)
  );

  const startDate = new Date(quest.created_at);
  startDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const allDates = getDateRange(startDate, today);

  let completedDays = 0;
  let consecutiveMisses = 0;

  for (const dateStr of allDates) {
    if (completedDates.has(dateStr)) {
      completedDays++;
      consecutiveMisses = 0;
    } else if (skippedDates.has(dateStr)) {
      consecutiveMisses = 0;
    } else if (dateStr !== todayStr) {
      consecutiveMisses++;
    }
  }

  const skipDaysUsed = skippedDates.size;
  const skipDaysRemaining = Math.max(0, skip_days_allowed - skipDaysUsed);
  const needsReset = consecutiveMisses >= reset_after_misses;
  const isCompleted = completedDays >= quest.days_target;

  return {
    current_day: completedDays,
    skip_days_remaining: skipDaysRemaining,
    is_completed: isCompleted,
    needs_reset: needsReset,
    consecutive_miss_count: consecutiveMisses,
  };
}

export async function recordSkipDay(questId: string, date: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("quest_skips").upsert(
    { quest_id: questId, skipped_date: date },
    { onConflict: "quest_id,skipped_date", ignoreDuplicates: true }
  );
}

export async function resetQuest(questId: string): Promise<void> {
  const supabase = createClient();
  await Promise.all([
    supabase.from("quest_progress").delete().eq("quest_id", questId),
    supabase.from("quest_skips").delete().eq("quest_id", questId),
  ]);
  await supabase
    .from("quests")
    .update({
      current_day: 0,
      created_at: new Date().toISOString(),
    })
    .eq("id", questId);
}

/** Returns true if the quest was active and is now completed. */
export async function completeQuest(questId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quests")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", questId)
    .eq("status", "active")
    .select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function syncQuestStreakDisplay(
  questId: string,
  state: QuestState
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("quests")
    .update({
      current_day: state.current_day,
      skip_days_remaining: state.skip_days_remaining,
    })
    .eq("id", questId)
    .eq("status", "active");
}

/** Auto-record missed days as skips (up to quest.skip_days_allowed). */
export async function autoRecordSkips(quest: Quest): Promise<void> {
  const supabase = createClient();
  const { skip_days_allowed } = questRules(quest);

  const [progressRes, skipsRes] = await Promise.all([
    supabase
      .from("quest_progress")
      .select("date, is_full_day_complete")
      .eq("quest_id", quest.id),
    supabase.from("quest_skips").select("skipped_date").eq("quest_id", quest.id),
  ]);

  const completedDates = new Set(
    (progressRes.data || [])
      .filter((p) => p.is_full_day_complete)
      .map((p) => p.date)
  );
  const skippedDates = new Set(
    (skipsRes.data || []).map((s) => s.skipped_date)
  );

  const startDate = new Date(quest.created_at);
  startDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const allDates = getDateRange(startDate, today);
  let skipsUsed = skippedDates.size;

  for (const dateStr of allDates) {
    if (dateStr === todayStr) continue;
    if (completedDates.has(dateStr) || skippedDates.has(dateStr)) continue;

    if (skipsUsed < skip_days_allowed) {
      await supabase.from("quest_skips").upsert(
        { quest_id: quest.id, skipped_date: dateStr },
        { onConflict: "quest_id,skipped_date", ignoreDuplicates: true }
      );
      skippedDates.add(dateStr);
      skipsUsed++;
    }
  }
}

export async function runStreakMaintenanceForQuests(
  quests: Quest[]
): Promise<Record<string, QuestState>> {
  const byId: Record<string, QuestState> = {};
  for (const q of quests) {
    await autoRecordSkips(q);
    const state = await computeQuestState(q);
    await syncQuestStreakDisplay(q.id, state);
    byId[q.id] = state;
  }
  return byId;
}
