import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ALLOWED_CODE_CHARS, KID_CODE_LENGTH } from "@/lib/kid-login/code-core";
import {
  getClientIp,
  isRateLimited,
  rateLimitKey,
  recordRateLimitHit,
  RateLimiterUnavailableError,
} from "@/lib/rate-limit/server";

// Only failed attempts count, so a whole class behind one school IP can still log in.
const MAX_FAILURES = 20;
const WINDOW_SECONDS = 15 * 60;

const GENERIC_ERROR = "That code didn't work.";
const TOO_MANY_ERROR = "Too many tries. Please wait a few minutes and try again.";
const UNAVAILABLE_ERROR = "Login is not available right now. Please try again soon.";

type ExchangeBody = { login_code?: string };

function isWellFormedKidCode(code: string): boolean {
  if (code.length !== KID_CODE_LENGTH) return false;
  for (const ch of code) {
    if (!ALLOWED_CODE_CHARS.includes(ch)) return false;
  }
  return true;
}

/** Exchange a 6-char parent kid code for a session cookie. Credentials never leave the server. */
export async function POST(req: Request) {
  let body: ExchangeBody;
  try {
    body = (await req.json()) as ExchangeBody;
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const loginCode = body.login_code?.replace(/\s/g, "").toUpperCase() ?? "";

  let admin: ReturnType<typeof createServiceRoleClient>;
  try {
    admin = createServiceRoleClient();
  } catch (err) {
    console.error("[kid-login/exchange] service role client unavailable:", err);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  const key = rateLimitKey("kid-login-exchange", getClientIp(req));

  try {
    if (await isRateLimited(admin, key, MAX_FAILURES, WINDOW_SECONDS)) {
      return NextResponse.json({ error: TOO_MANY_ERROR }, { status: 429 });
    }
  } catch (err) {
    // Fail closed: never allow a code lookup without a working limiter.
    console.error("[kid-login/exchange] rate limiter check failed, refusing login:", err);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  const fail = async () => {
    try {
      await recordRateLimitHit(admin, key, WINDOW_SECONDS);
    } catch (err) {
      const msg = err instanceof RateLimiterUnavailableError ? err.message : String(err);
      console.error("[kid-login/exchange] could not record failed attempt:", msg);
    }
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  };

  if (!isWellFormedKidCode(loginCode)) {
    return fail();
  }

  const { data: child, error: lookupError } = await admin
    .from("children")
    .select("internal_email, internal_password")
    .eq("login_code", loginCode)
    .maybeSingle();

  if (lookupError) {
    console.error("[kid-login/exchange] child lookup failed:", lookupError.message);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  if (!child?.internal_email || !child?.internal_password) {
    return fail();
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: child.internal_email as string,
    password: child.internal_password as string,
  });

  if (signInError) {
    console.error("[kid-login/exchange] sign-in failed for matched code:", signInError.message);
    return fail();
  }

  return NextResponse.json({ ok: true });
}
