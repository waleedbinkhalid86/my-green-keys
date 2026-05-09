export interface BrainSprintProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  track: "math" | "eco";
  best_score: number;
  best_stars: number;
  best_accuracy: number;
  best_streak: number;
  total_attempts: number;
  eco_points_earned: number;
  is_completed: boolean;
  first_completed_at: string | null;
  last_attempted_at: string;
}

export interface LessonResult {
  lesson_id: string;
  track: "math" | "eco";
  score: number;
  stars: number;
  accuracy: number;
  best_streak: number;
  eco_points: number;
}
