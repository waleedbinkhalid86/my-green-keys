export const DEFAULT_PRACTICE_GOAL = 5;
export const MIN_PRACTICE_GOAL = 1;
export const MAX_PRACTICE_GOAL = 20;
export const PRACTICE_GOAL_PRESETS = [3, 5, 10] as const;

export function effectivePracticeGoal(goal: number | null | undefined): number {
  const n = Number(goal);
  if (!Number.isFinite(n) || n < MIN_PRACTICE_GOAL) return DEFAULT_PRACTICE_GOAL;
  return Math.min(MAX_PRACTICE_GOAL, Math.max(MIN_PRACTICE_GOAL, Math.round(n)));
}

export function practiceProgressPct(count: number, goal: number): number {
  const g = effectivePracticeGoal(goal);
  if (g <= 0) return 0;
  return Math.min(100, Math.round((Math.max(0, count) / g) * 100));
}

export type LessonPracticeProgressRow = {
  lesson_id: number;
  completion_count?: number | null;
  practice_goal?: number | null;
  completed?: boolean | null;
};
