import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { fetchKioskRoster } from "@/lib/kid-login/kiosk-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const class_id = searchParams.get("class_id")?.trim() ?? "";

  if (!class_id) {
    return NextResponse.json({ error: "class_id is required" }, { status: 400 });
  }

  try {
    const admin = createServiceRoleClient();
    const roster = await fetchKioskRoster(admin, class_id);
    return NextResponse.json(roster);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Roster failed";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
