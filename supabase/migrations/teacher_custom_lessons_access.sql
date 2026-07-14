-- Let a class-enrolled student (children.teacher_id set, no parent_id) read
-- custom_lessons their teacher assigned to them. The original policy in
-- family_custom_lessons_access.sql only recognized the parent -> child
-- relationship. Run manually in Supabase SQL Editor after review.

DROP POLICY IF EXISTS "Family members can read custom lessons" ON public.custom_lessons;

CREATE POLICY "Family members can read custom lessons"
  ON public.custom_lessons
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.children c
      WHERE c.id = custom_lessons.assigned_child_id
        AND c.auth_user_id = auth.uid()
        AND (
          c.parent_id = custom_lessons.created_by
          OR c.teacher_id = custom_lessons.created_by
        )
    )
  );
