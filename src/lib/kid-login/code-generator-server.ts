import type { SupabaseClient } from "@supabase/supabase-js";
import {
  generateRandomCode,
  KID_CODE_LENGTH,
} from "@/lib/kid-login/code-core";

/** Server-only: unique 6-char kid login code via service-role client. */
export async function generateUniqueKidCodeAdmin(
  admin: SupabaseClient,
  maxAttempts = 10
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateRandomCode(KID_CODE_LENGTH);
    const { data } = await admin
      .from("children")
      .select("id")
      .eq("login_code", candidate)
      .maybeSingle();

    if (!data) return candidate;
  }
  throw new Error("Could not generate unique kid code");
}
