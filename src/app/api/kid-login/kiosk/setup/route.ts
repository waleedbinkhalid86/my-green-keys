import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { verifyTeacherOwnsClass } from "@/lib/teacher/verify-class-ownership";
import { fetchKioskClass } from "@/lib/kid-login/kiosk-server";
import {
  getKioskSecret,
  KIOSK_COOKIE_NAME,
  KIOSK_COOKIE_OPTIONS,
  KIOSK_COOKIE_PATH,
  signKioskToken,
} from "@/lib/kid-login/kiosk-token";

const UNAVAILABLE_ERROR = "Kiosk setup is not available right now. Please try again soon.";

type SetupBody = { class_id?: string };

/**
 * Turns this device into a class kiosk. Requires the logged-in teacher who owns
 * the class. Issues a signed device cookie, then signs the teacher out of this
 * device only (scope "local") so the shared tablet never keeps a teacher session.
 */
export async function POST(req: Request) {
  let secret: string;
  try {
    secret = getKioskSecret();
  } catch (err) {
    console.error("[kid-login/kiosk/setup] refusing setup:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  let body: SetupBody;
  try {
    body = (await req.json()) as SetupBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const classId = body.class_id?.trim() ?? "";
  if (!classId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const owned = await verifyTeacherOwnsClass(supabase, user.id, classId);
  if (!owned.ok) {
    return NextResponse.json({ error: "Class not found or access denied" }, { status: 403 });
  }

  let classRow: Awaited<ReturnType<typeof fetchKioskClass>>;
  try {
    classRow = await fetchKioskClass(createServiceRoleClient(), classId);
  } catch (err) {
    console.error(
      "[kid-login/kiosk/setup] class lookup failed (has stage2_kiosk_tokens.sql been run?):",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }
  if (!classRow) {
    return NextResponse.json({ error: "Class not found or access denied" }, { status: 403 });
  }

  // Sign the teacher out of THIS device only; their other devices stay signed in.
  const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
  if (signOutError) {
    console.error("[kid-login/kiosk/setup] teacher sign-out failed, not issuing token:", signOutError.message);
    return NextResponse.json(
      { error: "Could not finish setup. Please try again." },
      { status: 500 }
    );
  }

  const { token } = signKioskToken(secret, {
    classId: classRow.id,
    version: classRow.kiosk_token_version,
  });
  const cookieStore = await cookies();
  cookieStore.set(KIOSK_COOKIE_NAME, token, KIOSK_COOKIE_OPTIONS);

  return NextResponse.json({ ok: true, class_name: classRow.name });
}

/** Forgets the kiosk setup on this device only. */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: KIOSK_COOKIE_NAME, path: KIOSK_COOKIE_PATH });
  return NextResponse.json({ ok: true });
}
