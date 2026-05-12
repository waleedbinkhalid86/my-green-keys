-- Kid login Phase 3: allow parents to update their own children's login_code (and timestamps).
-- Apply in Supabase SQL Editor or via CLI if you use migrations.
-- Safe to re-run: drops then recreates the policy by name.

DROP POLICY IF EXISTS "Parents can update their own children" ON public.children;

CREATE POLICY "Parents can update their own children" ON public.children
  FOR UPDATE
  USING (auth.uid() = parent_id)
  WITH CHECK (auth.uid() = parent_id);
