-- Stage 1b: remove public reads of children/classes, lock profiles.account_type.
-- Run in Supabase SQL Editor ONLY AFTER the new kid login (exchange route) has been
-- tested on the live site. Safe to re-run.
--
-- After running, the old browser-side kid login (direct children read) stops working,
-- which is intended: the deployed code no longer uses it.

-- ---------------------------------------------------------------------------
-- 1) children: drop the public lookup policy.
--    Parents already have SELECT policies ("Parents can view own children",
--    "Parents can view their own children"); this extra one is defensive and harmless
--    (policies are OR'd).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can lookup children by login_code" ON public.children;

DROP POLICY IF EXISTS "Parents can read their own children" ON public.children;
CREATE POLICY "Parents can read their own children"
  ON public.children
  FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_id);

-- ---------------------------------------------------------------------------
-- 2) classes: drop the public lookup policy; enrolled students can read their class.
--    Security definer helper avoids RLS recursion (class_enrollments policies query classes).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Class code lookup is public" ON public.classes;

CREATE OR REPLACE FUNCTION public.is_enrolled_in_class(p_class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.class_enrollments
     WHERE class_id = p_class_id
       AND student_auth_user_id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_enrolled_in_class(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_enrolled_in_class(uuid) TO authenticated;

DROP POLICY IF EXISTS "Enrolled students can read their classes" ON public.classes;
CREATE POLICY "Enrolled students can read their classes"
  ON public.classes
  FOR SELECT
  TO authenticated
  USING (public.is_enrolled_in_class(id));

-- ---------------------------------------------------------------------------
-- 3) profiles: end users cannot change account_type.
--    Service role and SQL Editor (no JWT role) are still allowed.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_account_type_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.account_type IS DISTINCT FROM OLD.account_type
     AND coalesce(auth.jwt() ->> 'role', '') IN ('authenticated', 'anon') THEN
    RAISE EXCEPTION 'account_type cannot be changed' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_lock_account_type ON public.profiles;
CREATE TRIGGER profiles_lock_account_type
  BEFORE UPDATE OF account_type ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_account_type_change();

-- ---------------------------------------------------------------------------
-- Verify afterwards:
-- SELECT tablename, policyname, cmd, roles, qual FROM pg_policies
--  WHERE tablename IN ('children', 'classes', 'profiles') ORDER BY 1, 2;
-- ---------------------------------------------------------------------------
