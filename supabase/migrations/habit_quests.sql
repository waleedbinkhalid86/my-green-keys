-- Table 1: quests
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID, -- nullable for now (single-kid families)
  title TEXT NOT NULL,
  action_plan JSONB NOT NULL, -- array of strings, e.g. ["Read 20 min", "Help with dishes"]
  days_target INT NOT NULL CHECK (days_target IN (7, 14, 20, 30)),
  reward TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  current_day INT NOT NULL DEFAULT 0,
  skip_days_remaining INT NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

-- Table 2: quest_progress
CREATE TABLE IF NOT EXISTS quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed_actions JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of action indexes that are done
  is_full_day_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quest_id, date)
);

-- Table 3: quest_skips
CREATE TABLE IF NOT EXISTS quest_skips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  skipped_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: parents can only see their own quests
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_skips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents see their own quests" ON quests
  FOR ALL USING (auth.uid() = parent_id);

CREATE POLICY "Parents see progress for their quests" ON quest_progress
  FOR ALL USING (
    quest_id IN (SELECT id FROM quests WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents see skips for their quests" ON quest_skips
  FOR ALL USING (
    quest_id IN (SELECT id FROM quests WHERE parent_id = auth.uid())
  );

-- Index for fast lookups
CREATE INDEX idx_quests_parent_id ON quests(parent_id);
CREATE INDEX idx_quests_status ON quests(status);
CREATE INDEX idx_quest_progress_quest_date ON quest_progress(quest_id, date);
