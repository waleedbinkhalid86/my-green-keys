import { createClient } from "@/lib/supabase/client";

export type RedeemPromoResult = {
  success: boolean;
  message: string;
  expires_at?: string;
};

type RedeemRpcRow = {
  success?: boolean;
  message?: string;
  expires_at?: string;
};

function parseRpcPayload(data: unknown): RedeemRpcRow | null {
  if (data == null) return null;
  if (typeof data === "object" && !Array.isArray(data)) {
    return data as RedeemRpcRow;
  }
  return null;
}

/**
 * Redeem a promo code for the current session user (case-insensitive code).
 * Requires the `redeem_promo_code` RPC and tables from `supabase/migrations/promo_codes.sql`.
 */
export async function redeemPromoCode(code: string): Promise<RedeemPromoResult> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, message: "You must be signed in to redeem a code" };
  }

  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { success: false, message: "Invalid code" };
  }

  const { data, error } = await supabase.rpc("redeem_promo_code", {
    code_input: normalized,
    user_id_input: user.id,
  });

  if (error) {
    return {
      success: false,
      message: error.message || "Something went wrong. Please try again.",
    };
  }

  const row = parseRpcPayload(data);
  if (!row || typeof row.success !== "boolean" || typeof row.message !== "string") {
    return { success: false, message: "Something went wrong. Please try again." };
  }

  const out: RedeemPromoResult = {
    success: row.success,
    message: row.message,
  };
  if (row.success && typeof row.expires_at === "string") {
    out.expires_at = row.expires_at;
  }
  return out;
}

// TODO: Build admin view at /admin/promo-codes to see usage count, list of redemptions. Out of scope for this task.
