import { createClient } from "@/lib/supabase/client";
import type { Quest, CreateQuestInput } from "./types";

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
