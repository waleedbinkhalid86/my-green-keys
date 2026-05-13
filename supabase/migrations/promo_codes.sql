-- Promo codes (GoGreen and future codes). Run manually in the Supabase SQL Editor after review (idempotent).

-- Promo codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  duration_months INTEGER NOT NULL CHECK (duration_months > 0),
  max_uses INTEGER NOT NULL CHECK (max_uses > 0),
  uses_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track redemptions (one row per user-code pair)
CREATE TABLE IF NOT EXISTS public.promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(promo_code_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_promo_code_redemptions_user_id
  ON public.promo_code_redemptions(user_id);

CREATE INDEX IF NOT EXISTS idx_promo_code_redemptions_expires
  ON public.promo_code_redemptions(user_id, expires_at);

-- Insert the GoGreen code (stored uppercase for matching)
INSERT INTO public.promo_codes (code, discount_percent, duration_months, max_uses)
VALUES ('GOGREEN', 100, 3, 30)
ON CONFLICT (code) DO NOTHING;

-- RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read active promo codes" ON public.promo_codes;
CREATE POLICY "Authenticated can read active promo codes"
  ON public.promo_codes FOR SELECT
  TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Users see their own redemptions" ON public.promo_code_redemptions;
CREATE POLICY "Users see their own redemptions"
  ON public.promo_code_redemptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert their own redemptions" ON public.promo_code_redemptions;
CREATE POLICY "Users insert their own redemptions"
  ON public.promo_code_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Atomic redeem: lock promo row, validate, insert redemption, increment uses_count.
CREATE OR REPLACE FUNCTION public.redeem_promo_code(code_input TEXT, user_id_input UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_code text;
  v_promo_id uuid;
  v_duration integer;
  v_max integer;
  v_uses integer;
  v_expires timestamptz;
  v_redemption_id uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'You must be signed in to redeem a code');
  END IF;
  IF user_id_input IS DISTINCT FROM v_uid THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid session');
  END IF;

  v_code := upper(trim(code_input));
  IF v_code = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid code');
  END IF;

  SELECT pc.id, pc.duration_months, pc.max_uses, pc.uses_count
  INTO v_promo_id, v_duration, v_max, v_uses
  FROM public.promo_codes pc
  WHERE pc.code = v_code
    AND pc.is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid code');
  END IF;

  IF v_uses >= v_max THEN
    RETURN jsonb_build_object('success', false, 'message', 'This code has reached its usage limit');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.promo_code_redemptions r
    WHERE r.promo_code_id = v_promo_id
      AND r.user_id = v_uid
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'You''ve already used this code');
  END IF;

  v_expires := timezone('utc', now()) + (v_duration::text || ' months')::interval;

  INSERT INTO public.promo_code_redemptions (promo_code_id, user_id, expires_at)
  VALUES (v_promo_id, v_uid, v_expires)
  RETURNING id INTO v_redemption_id;

  UPDATE public.promo_codes
  SET uses_count = uses_count + 1
  WHERE id = v_promo_id
    AND uses_count = v_uses
    AND uses_count < max_uses;

  IF NOT FOUND THEN
    DELETE FROM public.promo_code_redemptions WHERE id = v_redemption_id;
    RETURN jsonb_build_object('success', false, 'message', 'This code has reached its usage limit');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Code redeemed! Enjoy your complimentary access.',
    'expires_at', v_expires::text
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'message', 'You''ve already used this code');
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_promo_code(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_promo_code(TEXT, UUID) TO authenticated;
