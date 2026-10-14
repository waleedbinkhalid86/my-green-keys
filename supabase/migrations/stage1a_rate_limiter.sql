-- Stage 1a: rate limiter for kid login exchange, class-code lookup, and parent code checks.
-- Run in Supabase SQL Editor BEFORE deploying the Stage 1 code.
-- The new routes fail closed (HTTP 503) if these functions are missing.
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  failures int NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_window_start
  ON public.auth_rate_limits (window_start);

-- RLS on with no policies: only the service role can touch this table.
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.auth_rate_limits FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.rate_limit_is_blocked(
  p_key text,
  p_max int,
  p_window_seconds int
)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT failures >= p_max
       FROM public.auth_rate_limits
      WHERE key = p_key
        AND window_start > now() - make_interval(secs => p_window_seconds)),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.rate_limit_record_failure(
  p_key text,
  p_window_seconds int
)
RETURNS int
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v int;
BEGIN
  DELETE FROM public.auth_rate_limits
   WHERE window_start < now() - interval '1 day';

  INSERT INTO public.auth_rate_limits AS r (key, window_start, failures)
  VALUES (p_key, now(), 1)
  ON CONFLICT (key) DO UPDATE SET
    failures = CASE
      WHEN r.window_start <= now() - make_interval(secs => p_window_seconds) THEN 1
      ELSE r.failures + 1
    END,
    window_start = CASE
      WHEN r.window_start <= now() - make_interval(secs => p_window_seconds) THEN now()
      ELSE r.window_start
    END
  RETURNING failures INTO v;

  RETURN v;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rate_limit_is_blocked(text, int, int) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rate_limit_record_failure(text, int) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rate_limit_is_blocked(text, int, int) TO service_role;
GRANT EXECUTE ON FUNCTION public.rate_limit_record_failure(text, int) TO service_role;
