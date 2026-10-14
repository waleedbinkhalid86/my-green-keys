-- Stage 2: kiosk device tokens.
-- Run in Supabase SQL Editor BEFORE deploying the Stage 2 code.
-- Kiosk routes fail closed (HTTP 503) if this column is missing.
-- Bumping kiosk_token_version revokes every kiosk device for that class.
-- Safe to re-run.

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS kiosk_token_version integer NOT NULL DEFAULT 1;
