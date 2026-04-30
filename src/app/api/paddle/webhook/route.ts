import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

const PADDLE_SIGNATURE_HEADER = "paddle-signature";

function getWebhookSecret() {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "Missing PADDLE_WEBHOOK_SECRET. Set it to your Paddle notification destination secret key (starts with pdl_ntf_...)."
    );
  }
  return secret;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment."
    );
  }
  return createSupabaseAdminClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

function timingSafeEqualHex(a: string, b: string) {
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function parseSignatureHeader(header: string) {
  const parts = header.split(";").map((p) => p.trim());
  const kv: Record<string, string> = {};
  for (const p of parts) {
    const [k, ...rest] = p.split("=");
    if (!k || rest.length === 0) continue;
    kv[k] = rest.join("=");
  }
  const ts = kv.ts ? Number(kv.ts) : NaN;
  const h1 = kv.h1 ?? "";
  return { ts, h1 };
}

function verifySignatureOrThrow(rawBody: string, signatureHeader: string) {
  const secret = getWebhookSecret();
  const { ts, h1 } = parseSignatureHeader(signatureHeader);

  if (!Number.isFinite(ts) || !h1) {
    throw new Error("Malformed Paddle-Signature header.");
  }

  // Replay tolerance: 5 minutes
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - ts) > 60 * 5) {
    throw new Error("Webhook timestamp outside tolerance window.");
  }

  const signedPayload = `${ts}:${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  if (!timingSafeEqualHex(expected, h1)) {
    throw new Error("Invalid webhook signature.");
  }
}

export async function POST(req: Request) {
  const signature = req.headers.get(PADDLE_SIGNATURE_HEADER) ?? "";
  const rawBody = await req.text();

  try {
    verifySignatureOrThrow(rawBody, signature);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Signature verification failed" },
      { status: 401 }
    );
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Paddle Billing webhooks: { event_type, data, ... }
  const eventType = event?.event_type as string | undefined;

  if (eventType === "transaction.completed") {
    const data = event?.data ?? {};
    const custom = (data.custom_data || {}) as Record<string, unknown>;
    const userId = typeof custom.userId === "string" ? custom.userId : null;
    const planType = typeof custom.planType === "string" ? custom.planType : null;

    if (userId && planType) {
      const supabaseAdmin = getSupabaseAdmin();
      const { error } = await supabaseAdmin.from("subscriptions").upsert(
        { user_id: userId, plan_type: planType, status: "active" },
        { onConflict: "user_id" }
      );

      if (error) {
        return NextResponse.json(
          { error: "Failed to update subscriptions table", details: error },
          { status: 500 }
        );
      }
    }
  }

  // Always ACK to avoid retries for unhandled event types.
  return NextResponse.json({ received: true });
}

