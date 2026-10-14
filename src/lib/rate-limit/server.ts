import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only fixed-window limiter backed by public.auth_rate_limits
 * (see supabase/migrations/stage1a_rate_limiter.sql). Service-role client only.
 */

export class RateLimiterUnavailableError extends Error {
  constructor(cause: string) {
    super(`Rate limiter unavailable: ${cause}`);
    this.name = "RateLimiterUnavailableError";
  }
}

/** Client IP from Vercel's x-forwarded-for (Vercel overwrites client-supplied values). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Hashed so raw IPs / user ids are never stored in the table. */
export function rateLimitKey(scope: string, identifier: string): string {
  const hash = createHash("sha256").update(identifier).digest("hex").slice(0, 32);
  return `${scope}:${hash}`;
}

/** Throws RateLimiterUnavailableError if the check cannot run (callers must fail closed). */
export async function isRateLimited(
  admin: SupabaseClient,
  key: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  const { data, error } = await admin.rpc("rate_limit_is_blocked", {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error || typeof data !== "boolean") {
    throw new RateLimiterUnavailableError(error?.message ?? "unexpected response");
  }
  return data;
}

/** Records one counted attempt. Throws RateLimiterUnavailableError on failure. */
export async function recordRateLimitHit(
  admin: SupabaseClient,
  key: string,
  windowSeconds: number
): Promise<void> {
  const { error } = await admin.rpc("rate_limit_record_failure", {
    p_key: key,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    throw new RateLimiterUnavailableError(error.message);
  }
}
