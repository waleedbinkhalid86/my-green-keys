import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { selfJoinClassWithCode } from "@/lib/kid-login/self-join-class-server";

const CLASS_CODE_LENGTH = 8;

type JoinClassBody = {
  class_code?: string;
  display_name?: string;
};

export async function POST(req: Request) {
  let body: JoinClassBody;
  try {
    body = (await req.json()) as JoinClassBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const class_code = body.class_code?.replace(/\s/g, "").toUpperCase() ?? "";
  const display_name = body.display_name?.trim() ?? "";

  if (class_code.length !== CLASS_CODE_LENGTH) {
    return NextResponse.json({ error: "Invalid class code" }, { status: 400 });
  }
  if (!display_name) {
    return NextResponse.json({ error: "Display name is required" }, { status: 400 });
  }

  try {
    const admin = createServiceRoleClient();
    const result = await selfJoinClassWithCode(admin, { class_code, display_name });

    return NextResponse.json({
      class_id: result.class_id,
      auth_user_id: result.auth_user_id,
      internal_email: result.internal_email,
      internal_password: result.internal_password,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Join failed";
    if (message.includes("Class not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
