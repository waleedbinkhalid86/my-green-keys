export type QuestStatus = "active" | "completed" | "failed";
export type QuestDays = 7 | 14 | 20 | 30;

export interface Quest {
  id: string;
  parent_id: string;
  child_id: string | null;
  title: string;
  action_plan: string[];
  days_target: QuestDays;
  reward: string;
  status: QuestStatus;
  current_day: number;
  skip_days_remaining: number;
  created_at: string;
  completed_at: string | null;
  failed_at: string | null;
}

export interface QuestProgress {
  id: string;
  quest_id: string;
  date: string;
  completed_actions: number[];
  is_full_day_complete: boolean;
}

export interface CreateQuestInput {
  title: string;
  action_plan: string[];
  days_target: QuestDays;
  reward: string;
}
