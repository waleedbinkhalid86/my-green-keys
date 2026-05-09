CREATE TABLE IF NOT EXISTS brain_sprint_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  track TEXT NOT NULL CHECK (track IN ('math', 'eco')),
  best_score INT NOT NULL DEFAULT 0,
  best_stars INT NOT NULL DEFAULT 0 CHECK (best_stars BETWEEN 0 AND 3),
  best_accuracy NUMERIC(5,2) DEFAULT 0,
  best_streak INT DEFAULT 0,
  total_attempts INT NOT NULL DEFAULT 0,
  eco_points_earned INT NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  first_completed_at TIMESTAMPTZ,
  last_attempted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE brain_sprint_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own brain sprint progress"
  ON brain_sprint_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_bs_progress_user_id ON brain_sprint_progress(user_id);
CREATE INDEX idx_bs_progress_track ON brain_sprint_progress(track);
CREATE INDEX idx_bs_progress_completed ON brain_sprint_progress(is_completed);
