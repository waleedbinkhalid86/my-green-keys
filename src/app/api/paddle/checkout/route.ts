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

type CheckoutBody = {
  priceId: string;
  planType: "family" | "school_starter" | "school_growth";
};

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<CheckoutBody>;
  if (!body.priceId || !body.planType) {
    return NextResponse.json(
      { error: "Missing required fields: priceId, planType" },
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type,email")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Failed to load user profile" },
      { status: 500 }
    );
  }

  const apiKey = getPaddleApiKey();
  const baseUrl = getPaddleApiBaseUrl();

  const transactionRes = await fetch(`${baseUrl}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Paddle-Version": PADDLE_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ price_id: body.priceId, quantity: 1 }],
      collection_mode: "automatic",
      custom_data: {
        userId: user.id,
        planType: body.planType,
        accountType: profile.account_type ?? null,
        email: profile.email ?? user.email ?? null,
      },
    }),
  });

  const json = (await transactionRes.json()) as unknown as {
    data?: { id?: string };
    error?: unknown;
  };

  if (!transactionRes.ok || !json?.data?.id) {
    return NextResponse.json(
      { error: "Failed to create Paddle transaction", details: json },
      { status: 502 }
    );
  }

  return NextResponse.json({ transactionId: json.data.id });
}

