import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { resolveKioskStudentCredentials } from "@/lib/kid-login/kiosk-server";
import { createClient } from "@/lib/supabase/server";

type SignInBody = {
  class_id?: string;
  student_auth_user_id?: string;
};

export async function POST(req: Request) {
  let body: SignInBody;
  try {
    body = (await req.json()) as SignInBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const class_id = body.class_id?.trim() ?? "";
  const student_auth_user_id = body.student_auth_user_id?.trim() ?? "";

  if (!class_id || !student_auth_user_id) {
    return NextResponse.json(
      { error: "class_id and student_auth_user_id are required" },
      { status: 400 }
    );
  }

  try {
    const admin = createServiceRoleClient();
    const creds = await resolveKioskStudentCredentials(admin, {
      class_id,
      student_auth_user_id,
    });

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: creds.internal_email,
      password: creds.internal_password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Sign-in failed. Try again or ask your teacher." },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign-in failed";
    const status =
      message.includes("not in this class") || message.includes("Could not")
        ? 403
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
