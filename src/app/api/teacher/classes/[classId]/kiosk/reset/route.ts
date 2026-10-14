import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { verifyTeacherOwnsClass } from "@/lib/teacher/verify-class-ownership";
import { fetchKioskClass } from "@/lib/kid-login/kiosk-server";

/** Bumps classes.kiosk_token_version so every kiosk device for this class stops working. */
export async function POST(
  _req: Request,
  context: { params: Promise<{ classId: string }> }
) {
  const { classId } = await context.params;

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

  const admin = createServiceRoleClient();

  try {
    const classRow = await fetchKioskClass(admin, classId);
    if (!classRow) {
      return NextResponse.json({ error: "Class not found or access denied" }, { status: 403 });
    }

    const { error } = await admin
      .from("classes")
      .update({ kiosk_token_version: classRow.kiosk_token_version + 1 })
      .eq("id", classId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    console.error(
      "[teacher/kiosk/reset] failed (has stage2_kiosk_tokens.sql been run?):",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Could not reset kiosk devices." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
