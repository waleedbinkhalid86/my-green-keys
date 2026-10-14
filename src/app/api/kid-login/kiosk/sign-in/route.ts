import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ALLOWED_CODE_CHARS, KID_CODE_LENGTH } from "@/lib/kid-login/code-core";
import {
  resolveKioskDevice,
  resolveKioskStudentByRosterId,
  type KioskDevice,
} from "@/lib/kid-login/kiosk-server";
import {
  getKioskSecret,
  isWellFormedRosterId,
  KIOSK_COOKIE_NAME,
  KIOSK_COOKIE_PATH,
  safeEqualStrings,
} from "@/lib/kid-login/kiosk-token";
import {
  getClientIp,
  isRateLimited,
  rateLimitKey,
  recordRateLimitHit,
  RateLimiterUnavailableError,
} from "@/lib/rate-limit/server";

// Only failed attempts count. IP limit is loose because a whole school shares one IP.
const WINDOW_SECONDS = 15 * 60;
const MAX_FAILURES_PER_IP = 30;
const MAX_FAILURES_PER_DEVICE = 15;
const MAX_FAILURES_PER_DEVICE_STUDENT = 5;

const GENERIC_ERROR = "That code didn't work.";
const RESET_ERROR = "Ask your teacher to set up this tablet again.";
const TOO_MANY_ERROR = "Too many tries. Please wait a few minutes and try again.";
const UNAVAILABLE_ERROR = "Login is not available right now. Please try again soon.";

type SignInBody = { rid?: string; login_code?: string };

function isWellFormedKidCode(code: string): boolean {
  if (code.length !== KID_CODE_LENGTH) return false;
  for (const ch of code) {
    if (!ALLOWED_CODE_CHARS.includes(ch)) return false;
  }
  return true;
}

/**
 * Kiosk sign-in: requires the signed device cookie, an opaque roster id AND the
 * child's 6-char login code. Credentials never leave the server.
 */
export async function POST(req: Request) {
  let secret: string;
  let admin: ReturnType<typeof createServiceRoleClient>;
  try {
    secret = getKioskSecret();
    admin = createServiceRoleClient();
  } catch (err) {
    console.error("[kid-login/kiosk/sign-in] refusing login:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  let body: SignInBody = {};
  try {
    body = (await req.json()) as SignInBody;
  } catch {
    /* treated as a failed attempt below */
  }
  const rid = typeof body.rid === "string" ? body.rid.trim() : "";
  const loginCode =
    typeof body.login_code === "string"
      ? body.login_code.replace(/\s/g, "").toUpperCase()
      : "";

  const ipKey = rateLimitKey("kiosk-sign-in-ip", getClientIp(req));
  const failKeys = [ipKey];

  const record = async () => {
    for (const key of failKeys) {
      try {
        await recordRateLimitHit(admin, key, WINDOW_SECONDS);
      } catch (err) {
        const msg = err instanceof RateLimiterUnavailableError ? err.message : String(err);
        console.error("[kid-login/kiosk/sign-in] could not record failed attempt:", msg);
      }
    }
  };
  const fail = async () => {
    await record();
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  };

  try {
    if (await isRateLimited(admin, ipKey, MAX_FAILURES_PER_IP, WINDOW_SECONDS)) {
      return NextResponse.json({ error: TOO_MANY_ERROR }, { status: 429 });
    }
  } catch (err) {
    // Fail closed: never check a code without a working limiter.
    console.error("[kid-login/kiosk/sign-in] rate limiter check failed, refusing login:", err);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(KIOSK_COOKIE_NAME)?.value;

  let device: KioskDevice | null;
  try {
    device = await resolveKioskDevice(admin, secret, token);
  } catch (err) {
    console.error("[kid-login/kiosk/sign-in] device lookup failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }
  if (!device) {
    await record();
    if (token) cookieStore.delete({ name: KIOSK_COOKIE_NAME, path: KIOSK_COOKIE_PATH });
    return NextResponse.json({ error: RESET_ERROR, code: "kiosk_reset" }, { status: 401 });
  }

  const deviceKey = rateLimitKey("kiosk-sign-in-device", device.jti);
  failKeys.push(deviceKey);
  const studentKey = isWellFormedRosterId(rid)
    ? rateLimitKey("kiosk-sign-in-student", `${device.jti}:${rid}`)
    : null;
  if (studentKey) failKeys.push(studentKey);

  try {
    if (await isRateLimited(admin, deviceKey, MAX_FAILURES_PER_DEVICE, WINDOW_SECONDS)) {
      return NextResponse.json({ error: TOO_MANY_ERROR }, { status: 429 });
    }
    if (
      studentKey &&
      (await isRateLimited(admin, studentKey, MAX_FAILURES_PER_DEVICE_STUDENT, WINDOW_SECONDS))
    ) {
      return NextResponse.json({ error: TOO_MANY_ERROR }, { status: 429 });
    }
  } catch (err) {
    console.error("[kid-login/kiosk/sign-in] rate limiter check failed, refusing login:", err);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  if (!studentKey || !isWellFormedKidCode(loginCode)) {
    return fail();
  }

  let creds: Awaited<ReturnType<typeof resolveKioskStudentByRosterId>>;
  try {
    creds = await resolveKioskStudentByRosterId(admin, secret, device, rid);
  } catch (err) {
    console.error("[kid-login/kiosk/sign-in] student lookup failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  if (!creds || !safeEqualStrings(creds.login_code.toUpperCase(), loginCode)) {
    return fail();
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: creds.internal_email,
    password: creds.internal_password,
  });

  if (signInError) {
    console.error("[kid-login/kiosk/sign-in] sign-in failed for matched code:", signInError.message);
    return fail();
  }

  return NextResponse.json({ ok: true });
}
