import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { fetchKioskRoster, resolveKioskDevice } from "@/lib/kid-login/kiosk-server";
import {
  getKioskSecret,
  KIOSK_COOKIE_NAME,
  KIOSK_COOKIE_PATH,
} from "@/lib/kid-login/kiosk-token";

const UNAVAILABLE_ERROR = "Couldn't load your class right now. Please try again soon.";
const RESET_ERROR = "Ask your teacher to set up this tablet again.";

/** Roster for a set-up kiosk device. Requires the signed device cookie; no other input is accepted. */
export async function GET() {
  let secret: string;
  let admin: ReturnType<typeof createServiceRoleClient>;
  try {
    secret = getKioskSecret();
    admin = createServiceRoleClient();
  } catch (err) {
    console.error("[kid-login/kiosk/roster] refusing request:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(KIOSK_COOKIE_NAME)?.value;

  try {
    const device = await resolveKioskDevice(admin, secret, token);
    if (!device) {
      if (token) cookieStore.delete({ name: KIOSK_COOKIE_NAME, path: KIOSK_COOKIE_PATH });
      return NextResponse.json({ error: RESET_ERROR, code: "kiosk_reset" }, { status: 401 });
    }

    const roster = await fetchKioskRoster(admin, secret, device);
    return NextResponse.json(roster);
  } catch (err) {
    console.error("[kid-login/kiosk/roster] lookup failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }
}
