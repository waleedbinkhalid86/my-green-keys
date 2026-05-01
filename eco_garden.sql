-- Eco garden persistence (run in Supabase SQL editor)
CREATE TABLE IF NOT EXISTS eco_garden (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  garden_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_watered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_plants INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id)
);

CREATE INDEX IF NOT EXISTS idx_eco_garden_student_id ON eco_garden(student_id);

ALTER TABLE eco_garden ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own garden"
  ON eco_garden FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own garden"
  ON eco_garden FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own garden"
  ON eco_garden FOR UPDATE
  USING (auth.uid() = student_id);
