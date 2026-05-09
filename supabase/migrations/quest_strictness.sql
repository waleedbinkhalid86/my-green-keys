-- Habit Quests: per-quest strictness (skip allowance + reset threshold)
-- Run manually in Supabase SQL Editor after review.

ALTER TABLE quests
  ADD COLUMN IF NOT EXISTS skip_days_allowed INT NOT NULL DEFAULT 2
  CHECK (skip_days_allowed >= 0 AND skip_days_allowed <= 10);

ALTER TABLE quests
  ADD COLUMN IF NOT EXISTS reset_after_misses INT NOT NULL DEFAULT 3
  CHECK (reset_after_misses >= 1 AND reset_after_misses <= 10);

-- Idempotent auto-skip inserts (quest_skips)
CREATE UNIQUE INDEX IF NOT EXISTS quest_skips_quest_id_skipped_date_key
  ON quest_skips (quest_id, skipped_date);
