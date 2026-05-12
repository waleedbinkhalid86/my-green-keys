import { createClient } from "@/lib/supabase/client";
import {
  assertParentCanManageQuests,
  getFamilyOwnerId,
} from "@/lib/kid-login/family-resolver";
import type { Quest, CreateQuestInput, QuestProgress, UpdateQuestInput } from "./types";

export async function fetchActiveQuests(): Promise<Quest[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const ownerId = await getFamilyOwnerId(user.id);
  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .eq("parent_id", ownerId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchCompletedQuests(): Promise<Quest[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const ownerId = await getFamilyOwnerId(user.id);
  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .eq("parent_id", ownerId)
    .in("status", ["completed", "failed"])
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateQuest(questId: string, input: UpdateQuestInput): Promise<Quest> {
  await assertParentCanManageQuests();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quests")
    .update({
      title: input.title,
      action_plan: input.action_plan,
      days_target: input.days_target,
      reward: input.reward,
      skip_days_allowed: input.skip_days_allowed,
      reset_after_misses: input.reset_after_misses,
    })
    .eq("id", questId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createQuest(input: CreateQuestInput): Promise<Quest> {
  await assertParentCanManageQuests();
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
      skip_days_allowed: input.skip_days_allowed,
      reset_after_misses: input.reset_after_misses,
      skip_days_remaining: input.skip_days_allowed,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteQuest(questId: string): Promise<void> {
  await assertParentCanManageQuests();
  const supabase = createClient();
  const { error } = await supabase.from("quests").delete().eq("id", questId);
  if (error) throw error;
}

/** Active quests for the family: parent's list, or linked kid resolves to parent_id. */
export async function fetchMyActiveQuests(): Promise<Quest[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const ownerId = await getFamilyOwnerId(user.id);
  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .eq("parent_id", ownerId)
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
