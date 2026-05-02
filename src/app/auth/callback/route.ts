import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const DASHBOARD_BY_ACCOUNT: Record<string, string> = {
  student: "/lesson",
  parent: "/dashboard/parent",
  teacher: "/dashboard/teacher",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (errorParam) {
    const msg = errorDescription || errorParam;
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(msg)}`, request.url)
    );
  }

  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL("/login?error=session", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();

  const accountType = profile?.account_type as string | undefined;

  if (!accountType) {
    return NextResponse.redirect(new URL("/signup?google=true", request.url));
  }

  const path = DASHBOARD_BY_ACCOUNT[accountType] ?? "/lesson";
  return NextResponse.redirect(new URL(path, request.url));
}
