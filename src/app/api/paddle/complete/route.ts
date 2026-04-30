import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PADDLE_VERSION = "1";

function getPaddleApiBaseUrl() {
  return "https://sandbox-api.paddle.com";
}

function getPaddleApiKey() {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing PADDLE_API_KEY in environment.");
  }
  return apiKey;
}

type CompleteBody = {
  transactionId: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<CompleteBody>;
  if (!body.transactionId) {
    return NextResponse.json(
      { error: "Missing required field: transactionId" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = getPaddleApiKey();
  const baseUrl = getPaddleApiBaseUrl();

  const txnRes = await fetch(
    `${baseUrl}/transactions/${encodeURIComponent(body.transactionId)}?include=customer,subscription`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Paddle-Version": PADDLE_VERSION,
      },
    }
  );

  const txnJson = (await txnRes.json()) as any;
  if (!txnRes.ok || !txnJson?.data) {
    return NextResponse.json(
      { error: "Failed to fetch transaction", details: txnJson },
      { status: 502 }
    );
  }

  const custom = (txnJson.data.custom_data || {}) as Record<string, unknown>;
  const customUserId = typeof custom.userId === "string" ? custom.userId : null;
  const planType = typeof custom.planType === "string" ? custom.planType : null;

  if (!customUserId || customUserId !== user.id) {
    return NextResponse.json(
      { error: "Transaction does not belong to current user" },
      { status: 403 }
    );
  }

  if (!planType) {
    return NextResponse.json(
      { error: "Missing planType in transaction custom_data" },
      { status: 422 }
    );
  }

  // Mark subscription active for this user (idempotent).
  const { error: subUpdateError } = await supabase.from("subscriptions").upsert(
    {
      user_id: user.id,
      plan_type: planType,
      status: "active",
    },
    { onConflict: "user_id" }
  );

  if (subUpdateError) {
    return NextResponse.json(
      { error: "Failed to update subscriptions table", details: subUpdateError },
      { status: 500 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Failed to load account type" },
      { status: 500 }
    );
  }

  const redirectTo =
    profile.account_type === "teacher"
      ? "/dashboard/teacher"
      : "/dashboard/parent";

  return NextResponse.json({ ok: true, redirectTo });
}

