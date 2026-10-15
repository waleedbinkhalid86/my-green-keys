import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { requireFounder } from "@/lib/admin/require-founder";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Marks a school inquiry as contacted. Founder only. */
export async function PATCH(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireFounder();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("school_inquiries")
    .update({ status: "contacted" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[admin/inquiries] update failed:", error.message);
    return NextResponse.json({ error: "Could not update inquiry" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
