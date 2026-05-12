-- Family custom lessons: parents create rows; linked kids (children.auth_user_id) can read
-- only lessons assigned to their own children.id. Run manually in Supabase SQL Editor after review.

-- ---------------------------------------------------------------------------
-- Schema: assignment by child row (canonical for RLS + app queries)
-- ---------------------------------------------------------------------------
ALTER TABLE public.custom_lessons
  ADD COLUMN IF NOT EXISTS assigned_child_id uuid REFERENCES public.children(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_custom_lessons_assigned_child_id
  ON public.custom_lessons(assigned_child_id)
  WHERE assigned_child_id IS NOT NULL;

COMMENT ON COLUMN public.custom_lessons.assigned_child_id IS
  'children.id for the assignee; kid visibility is scoped to this row.';

-- ---------------------------------------------------------------------------
-- children: linked account can read their own row (needed for RLS subqueries + client resolvers)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Linked child can read own children row" ON public.children;
CREATE POLICY "Linked child can read own children row"
  ON public.children
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- custom_lessons: replace / add policies (idempotent names)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Parents manage their custom lessons" ON public.custom_lessons;
DROP POLICY IF EXISTS "Parents insert their custom lessons" ON public.custom_lessons;
DROP POLICY IF EXISTS "Parents update their custom lessons" ON public.custom_lessons;
DROP POLICY IF EXISTS "Parents delete their custom lessons" ON public.custom_lessons;
DROP POLICY IF EXISTS "Family members can read custom lessons" ON public.custom_lessons;
DROP POLICY IF EXISTS "Family members read assigned custom lessons" ON public.custom_lessons;

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
        AND c.parent_id = custom_lessons.created_by
    )
  );

CREATE POLICY "Parents insert their custom lessons"
  ON public.custom_lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (
      assigned_child_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.children ch
        WHERE ch.id = assigned_child_id
          AND ch.parent_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents update their custom lessons"
  ON public.custom_lessons
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (
    created_by = auth.uid()
    AND (
      assigned_child_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.children ch
        WHERE ch.id = assigned_child_id
          AND ch.parent_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents delete their custom lessons"
  ON public.custom_lessons
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());
