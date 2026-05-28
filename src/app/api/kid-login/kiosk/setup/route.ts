import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { resolveKioskClassByCode } from "@/lib/kid-login/kiosk-server";

type SetupBody = { class_code?: string };

export async function POST(req: Request) {
  let body: SetupBody;
  try {
    body = (await req.json()) as SetupBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const class_code = body.class_code ?? "";

  try {
    const admin = createServiceRoleClient();
    const info = await resolveKioskClassByCode(admin, class_code);
    return NextResponse.json(info);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Setup failed";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
