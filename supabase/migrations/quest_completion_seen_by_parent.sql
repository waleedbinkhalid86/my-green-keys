-- Run manually in Supabase SQL editor if you prefer not to use migration runner.
ALTER TABLE quests
  ADD COLUMN IF NOT EXISTS completion_seen_by_parent BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN quests.completion_seen_by_parent IS
  'When false, parent dashboard shows an in-app banner for completed quests the parent has not dismissed.';
