import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { isValidCustomCode, KID_CODE_LENGTH } from "@/lib/kid-login/code-core";
import { isRateLimited, rateLimitKey, recordRateLimitHit } from "@/lib/rate-limit/server";

// Every check counts: a "taken" answer reveals a valid kid code.
const MAX_CHECKS = 60;
const WINDOW_SECONDS = 15 * 60;

/** Parent-only: is a 6-char kid login code free? */
export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  }

  const code = new URL(req.url).searchParams.get("code")?.trim().toUpperCase() ?? "";
  if (!isValidCustomCode(code, KID_CODE_LENGTH, KID_CODE_LENGTH).ok) {
    return NextResponse.json({ error: "Invalid code format." }, { status: 400 });
  }

  let admin: ReturnType<typeof createServiceRoleClient>;
  try {
    admin = createServiceRoleClient();
  } catch (err) {
    console.error("[parent/kid-code-available] service role client unavailable:", err);
    return NextResponse.json({ error: "Could not check that code right now." }, { status: 503 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.account_type !== "parent") {
    return NextResponse.json({ error: "Only parents can check codes." }, { status: 403 });
  }

  const key = rateLimitKey("parent-kid-code-check", user.id);
  try {
    if (await isRateLimited(admin, key, MAX_CHECKS, WINDOW_SECONDS)) {
      return NextResponse.json(
        { error: "Too many checks. Please wait a few minutes." },
        { status: 429 }
      );
    }
    await recordRateLimitHit(admin, key, WINDOW_SECONDS);
  } catch (err) {
    console.error("[parent/kid-code-available] rate limiter failed, refusing check:", err);
    return NextResponse.json({ error: "Could not check that code right now." }, { status: 503 });
  }

  const { data, error } = await admin
    .from("children")
    .select("id")
    .eq("login_code", code)
    .maybeSingle();
  if (error) {
    console.error("[parent/kid-code-available] lookup failed:", error.message);
    return NextResponse.json({ error: "Could not check that code right now." }, { status: 503 });
  }

  return NextResponse.json({ available: !data });
}
