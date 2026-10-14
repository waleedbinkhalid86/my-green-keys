-- ONE-OFF: sign out every kid account (all devices) by deleting their auth sessions.
-- Refresh tokens are removed with their sessions; access tokens already issued
-- stay valid until they expire (default 1 hour).
--
-- Run in Supabase SQL Editor AFTER stage1b_rls_hardening.sql and AFTER
-- scripts/rotate-kid-credentials.ts --apply. Kids just re-enter their login code
-- (or tap their name on a class kiosk).
--
-- Preview first:
-- SELECT count(*) FROM auth.sessions
--  WHERE user_id IN (SELECT auth_user_id FROM public.children WHERE auth_user_id IS NOT NULL);

DELETE FROM auth.sessions
 WHERE user_id IN (
   SELECT auth_user_id FROM public.children WHERE auth_user_id IS NOT NULL
 );
