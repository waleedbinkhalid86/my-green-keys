-- School inquiries from the /schools contact form.
-- Run in Supabase SQL Editor BEFORE deploying the inquiry code.
-- POST /api/schools/inquiry returns a generic 503 until this table exists.
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS public.school_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  school_name text CHECK (school_name IS NULL OR char_length(school_name) <= 150),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 30),
  message text CHECK (message IS NULL OR char_length(message) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted'))
);

CREATE INDEX IF NOT EXISTS idx_school_inquiries_created_at
  ON public.school_inquiries (created_at DESC);

-- RLS on with no policies: only the service role can touch this table.
ALTER TABLE public.school_inquiries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.school_inquiries FROM anon, authenticated;
