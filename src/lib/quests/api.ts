import { createClient } from "@/lib/supabase/client";
import type { Quest, CreateQuestInput, QuestProgress } from "./types";

export async function fetchActiveQuests(): Promise<Quest[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchCompletedQuests(): Promise<Quest[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .in("status", ["completed", "failed"])
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createQuest(input: CreateQuestInput): Promise<Quest> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("quests")
    .insert({
      parent_id: user.id,
      title: input.title,
      action_plan: input.action_plan,
      days_target: input.days_target,
      reward: input.reward,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteQuest(questId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("quests").delete().eq("id", questId);
  if (error) throw error;
}

/** Active quests for the current user (kid); single-account families use parent_id = user.id. */
export async function fetchMyActiveQuests(): Promise<Quest[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .eq("parent_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Quests] fetchMyActiveQuests:", error);
    return [];
  }
  return data || [];
}

export async function fetchTodayProgress(questId: string): Promise<QuestProgress | null> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("quest_progress")
    .select("*")
    .eq("quest_id", questId)
    .eq("date", today)
    .maybeSingle();

  if (error) {
    console.error("[Quests] fetchTodayProgress:", error);
    return null;
  }
  return data;
}

export async function toggleQuestAction(
  questId: string,
  actionIndex: number,
  totalActionsCount: number
): Promise<QuestProgress | null> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("quest_progress")
    .select("*")
    .eq("quest_id", questId)
    .eq("date", today)
    .maybeSingle();

  const currentActions: number[] = existing?.completed_actions || [];
  let updatedActions: number[];

  if (currentActions.includes(actionIndex)) {
    updatedActions = currentActions.filter((i) => i !== actionIndex);
  } else {
    updatedActions = [...currentActions, actionIndex].sort((a, b) => a - b);
  }

  const isFullDayComplete = updatedActions.length === totalActionsCount;

  if (existing) {
    const { data, error } = await supabase
      .from("quest_progress")
      .update({
        completed_actions: updatedActions,
        is_full_day_complete: isFullDayComplete,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("[Quests] toggle update:", error);
      return null;
    }
    return data;
  }

  const { data, error } = await supabase
    .from("quest_progress")
    .insert({
      quest_id: questId,
      date: today,
      completed_actions: updatedActions,
      is_full_day_complete: isFullDayComplete,
    })
    .select()
    .single();

  if (error) {
    console.error("[Quests] toggle insert:", error);
    return null;
  }
  return data;
}
