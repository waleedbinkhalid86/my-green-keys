import { createClient } from "@/lib/supabase/client";

/** True if the user has at least one promo redemption that has not expired yet. */
export async function hasActivePromoAccess(userId: string): Promise<boolean> {
  const supabase = createClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("promo_code_redemptions")
    .select("id")
    .eq("user_id", userId)
    .gt("expires_at", nowIso)
    .limit(1)
    .maybeSingle();

  if (error) {
    return false;
  }
  return data != null;
}
