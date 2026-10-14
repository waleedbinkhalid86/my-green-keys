import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { CLASS_CODE_LENGTH, isValidCustomCode } from "@/lib/kid-login/code-core";
import {
  getClientIp,
  isRateLimited,
  rateLimitKey,
  recordRateLimitHit,
} from "@/lib/rate-limit/server";

const MAX_FAILURES = 20;
const WINDOW_SECONDS = 15 * 60;

const NOT_FOUND_ERROR = "Class not found. Check the code with your teacher.";
const UNAVAILABLE_ERROR = "Could not look up that class right now. Please try again.";

type LookupBody = { class_code?: string };

/** Signed-in users: resolve an exact active class code to { id, name } only. */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to join a class." }, { status: 401 });
  }

  let body: LookupBody;
  try {
    body = (await req.json()) as LookupBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const classCode = body.class_code?.replace(/\s/g, "").toUpperCase() ?? "";

  let admin: ReturnType<typeof createServiceRoleClient>;
  try {
    admin = createServiceRoleClient();
  } catch (err) {
    console.error("[classes/lookup] service role client unavailable:", err);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  const key = rateLimitKey("class-code-lookup", getClientIp(req));
  try {
    if (await isRateLimited(admin, key, MAX_FAILURES, WINDOW_SECONDS)) {
      return NextResponse.json(
        { error: "Too many tries. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }
  } catch (err) {
    console.error("[classes/lookup] rate limiter check failed, refusing lookup:", err);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  const notFound = async () => {
    try {
      await recordRateLimitHit(admin, key, WINDOW_SECONDS);
    } catch (err) {
      console.error("[classes/lookup] could not record failed attempt:", err);
    }
    return NextResponse.json({ error: NOT_FOUND_ERROR }, { status: 404 });
  };

  if (!isValidCustomCode(classCode, CLASS_CODE_LENGTH, CLASS_CODE_LENGTH).ok) {
    return notFound();
  }

  const { data, error } = await admin
    .from("classes")
    .select("id, name")
    .eq("class_code", classCode)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    console.error("[classes/lookup] lookup failed:", error.message);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }
  if (!data) {
    return notFound();
  }

  return NextResponse.json({ id: data.id as string, name: data.name as string });
}
