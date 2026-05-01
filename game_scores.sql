-- Run in Supabase SQL editor (or migrate) to add game score history.
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  eco_points_earned INTEGER NOT NULL DEFAULT 0,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_scores_student_id ON game_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_name ON game_scores(game_name);

ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own game scores"
  ON game_scores FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own game scores"
  ON game_scores FOR INSERT
  WITH CHECK (auth.uid() = student_id);
