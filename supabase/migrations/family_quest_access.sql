-- Family quest access: kids (children.auth_user_id) share the parent's habit quest list.
-- Run manually in the Supabase SQL Editor after review (idempotent).

-- ---------------------------------------------------------------------------
-- Trigger: linked children may only change "progress / lifecycle" columns,
-- not quest setup (title, plan, reward, strictness, parent_id, child_id).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.quests_enforce_family_child_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.children c
    WHERE c.auth_user_id = auth.uid()
      AND c.parent_id = OLD.parent_id
  ) THEN
    IF NEW.parent_id IS DISTINCT FROM OLD.parent_id
       OR NEW.title IS DISTINCT FROM OLD.title
       OR NEW.action_plan IS DISTINCT FROM OLD.action_plan
       OR NEW.days_target IS DISTINCT FROM OLD.days_target
       OR NEW.reward IS DISTINCT FROM OLD.reward
       OR NEW.skip_days_allowed IS DISTINCT FROM OLD.skip_days_allowed
       OR NEW.reset_after_misses IS DISTINCT FROM OLD.reset_after_misses
       OR NEW.child_id IS DISTINCT FROM OLD.child_id
    THEN
      RAISE EXCEPTION 'Only parents can edit quest setup';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quests_enforce_family_child_fields ON public.quests;
CREATE TRIGGER quests_enforce_family_child_fields
  BEFORE UPDATE ON public.quests
  FOR EACH ROW
  EXECUTE PROCEDURE public.quests_enforce_family_child_fields();

-- ---------------------------------------------------------------------------
-- quests: replace single-owner ALL policy with granular family + parent rules
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Parents see their own quests" ON public.quests;
DROP POLICY IF EXISTS "Family members can read quests" ON public.quests;
DROP POLICY IF EXISTS "Parents insert their own quests" ON public.quests;
DROP POLICY IF EXISTS "Parents update their own quests" ON public.quests;
DROP POLICY IF EXISTS "Family children update shared quest progress" ON public.quests;
DROP POLICY IF EXISTS "Parents delete their own quests" ON public.quests;

CREATE POLICY "Family members can read quests"
  ON public.quests
  FOR SELECT
  TO authenticated
  USING (
    parent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.parent_id = quests.parent_id
        AND c.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents insert their own quests"
  ON public.quests
  FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents update their own quests"
  ON public.quests
  FOR UPDATE
  TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Family children update shared quest progress"
  ON public.quests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.parent_id = quests.parent_id
        AND c.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.parent_id = quests.parent_id
        AND c.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents delete their own quests"
  ON public.quests
  FOR DELETE
  TO authenticated
  USING (parent_id = auth.uid());

-- ---------------------------------------------------------------------------
-- quest_progress + quest_skips: family (parent or linked kid) full access
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Parents see progress for their quests" ON public.quest_progress;
DROP POLICY IF EXISTS "Family members can access quest_progress" ON public.quest_progress;

CREATE POLICY "Family members can access quest_progress"
  ON public.quest_progress
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_progress.quest_id
        AND (
          q.parent_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.children c
            WHERE c.parent_id = q.parent_id
              AND c.auth_user_id = auth.uid()
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_progress.quest_id
        AND (
          q.parent_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.children c
            WHERE c.parent_id = q.parent_id
              AND c.auth_user_id = auth.uid()
          )
        )
    )
  );

DROP POLICY IF EXISTS "Parents see skips for their quests" ON public.quest_skips;
DROP POLICY IF EXISTS "Family members can access quest_skips" ON public.quest_skips;

CREATE POLICY "Family members can access quest_skips"
  ON public.quest_skips
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_skips.quest_id
        AND (
          q.parent_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.children c
            WHERE c.parent_id = q.parent_id
              AND c.auth_user_id = auth.uid()
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_skips.quest_id
        AND (
          q.parent_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.children c
            WHERE c.parent_id = q.parent_id
              AND c.auth_user_id = auth.uid()
          )
        )
    )
  );
