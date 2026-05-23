-- Typing lesson repetition counter + kid-set practice goals (student_progress)

ALTER TABLE student_progress
  ADD COLUMN IF NOT EXISTS completion_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS practice_goal integer NOT NULL DEFAULT 5;

-- Backfill: existing completed rows count as one practice session
UPDATE student_progress
SET completion_count = 1
WHERE completed = true AND completion_count = 0;

-- Clamp practice_goal for any bad data
UPDATE student_progress
SET practice_goal = 5
WHERE practice_goal IS NULL OR practice_goal < 1 OR practice_goal > 20;

ALTER TABLE student_progress
  ALTER COLUMN practice_goal SET DEFAULT 5;

-- One progress row per kid per lesson (matches app upsert logic)
-- Remove duplicates first if any exist (keep latest completion)
DELETE FROM student_progress a
USING student_progress b
WHERE a.student_id = b.student_id
  AND a.lesson_id = b.lesson_id
  AND (
    COALESCE(a.completed_at, a.created_at, 'epoch'::timestamptz)
    < COALESCE(b.completed_at, b.created_at, 'epoch'::timestamptz)
    OR (
      COALESCE(a.completed_at, a.created_at, 'epoch'::timestamptz)
      = COALESCE(b.completed_at, b.created_at, 'epoch'::timestamptz)
      AND a.id < b.id
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_progress_student_lesson
  ON student_progress (student_id, lesson_id);

-- Students manage their own progress (read already existed; add write)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'student_progress'
      AND policyname = 'Students can insert their own progress'
  ) THEN
    CREATE POLICY "Students can insert their own progress"
      ON student_progress
      FOR INSERT
      WITH CHECK (auth.uid() = student_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'student_progress'
      AND policyname = 'Students can update their own progress'
  ) THEN
    CREATE POLICY "Students can update their own progress"
      ON student_progress
      FOR UPDATE
      USING (auth.uid() = student_id)
      WITH CHECK (auth.uid() = student_id);
  END IF;
END $$;

-- Secure server-side increment: only bumps count by 1 per call
CREATE OR REPLACE FUNCTION record_lesson_completion(
  p_lesson_id integer,
  p_wpm integer,
  p_accuracy numeric
)
RETURNS TABLE (completion_count integer, practice_goal integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id uuid := auth.uid();
  v_count integer;
  v_goal integer;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_lesson_id IS NULL OR p_lesson_id < 1 OR p_lesson_id > 100 THEN
    RAISE EXCEPTION 'Invalid lesson_id';
  END IF;

  IF p_wpm IS NULL OR p_wpm < 0 OR p_wpm > 300 THEN
    RAISE EXCEPTION 'Invalid wpm';
  END IF;

  IF p_accuracy IS NULL OR p_accuracy < 0 OR p_accuracy > 100 THEN
    RAISE EXCEPTION 'Invalid accuracy';
  END IF;

  INSERT INTO student_progress (
    student_id,
    lesson_id,
    completed,
    completion_count,
    practice_goal,
    wpm,
    accuracy,
    completed_at
  )
  VALUES (
    v_student_id,
    p_lesson_id,
    true,
    1,
    5,
    p_wpm,
    p_accuracy,
    now()
  )
  ON CONFLICT (student_id, lesson_id)
  DO UPDATE SET
    completed = true,
    completion_count = student_progress.completion_count + 1,
    wpm = EXCLUDED.wpm,
    accuracy = EXCLUDED.accuracy,
    completed_at = now()
  RETURNING student_progress.completion_count, student_progress.practice_goal
  INTO v_count, v_goal;

  RETURN QUERY SELECT v_count, v_goal;
END;
$$;

REVOKE ALL ON FUNCTION record_lesson_completion(integer, integer, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_lesson_completion(integer, integer, numeric) TO authenticated;

-- Kid-set practice goal (1–20); creates row if needed
CREATE OR REPLACE FUNCTION set_lesson_practice_goal(
  p_lesson_id integer,
  p_practice_goal integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id uuid := auth.uid();
  v_goal integer;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_lesson_id IS NULL OR p_lesson_id < 1 OR p_lesson_id > 100 THEN
    RAISE EXCEPTION 'Invalid lesson_id';
  END IF;

  IF p_practice_goal IS NULL OR p_practice_goal < 1 OR p_practice_goal > 20 THEN
    RAISE EXCEPTION 'practice_goal must be between 1 and 20';
  END IF;

  v_goal := p_practice_goal;

  INSERT INTO student_progress (
    student_id,
    lesson_id,
    completed,
    completion_count,
    practice_goal
  )
  VALUES (
    v_student_id,
    p_lesson_id,
    false,
    0,
    v_goal
  )
  ON CONFLICT (student_id, lesson_id)
  DO UPDATE SET practice_goal = EXCLUDED.practice_goal
  RETURNING student_progress.practice_goal INTO v_goal;

  RETURN v_goal;
END;
$$;

REVOKE ALL ON FUNCTION set_lesson_practice_goal(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION set_lesson_practice_goal(integer, integer) TO authenticated;
