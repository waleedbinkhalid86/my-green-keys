-- Scope the teacher RLS policy on student_progress so a teacher can only
-- read progress for students enrolled in their own classes.
--
-- ROLLBACK: drop the new policy and uncomment + run the block below.
--
-- /* ROLLBACK
-- DROP POLICY IF EXISTS "Teachers can view enrolled student progress" ON student_progress;
--
-- CREATE POLICY "Teachers can view student progress" ON student_progress
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.account_type = 'teacher'
--     )
--   );
-- */

DROP POLICY IF EXISTS "Teachers can view student progress" ON student_progress;

CREATE POLICY "Teachers can view enrolled student progress" ON student_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM class_enrollments ce
      JOIN classes c ON c.id = ce.class_id
      WHERE ce.student_auth_user_id = student_progress.student_id
        AND c.teacher_id = auth.uid()
    )
  );
