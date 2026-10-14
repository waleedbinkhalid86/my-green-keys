import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Server-only signed kiosk device tokens (HMAC-SHA256 with KIOSK_TOKEN_SECRET).
 * Revocation: token carries classes.kiosk_token_version; bumping it kills all
 * devices for that class (see supabase/migrations/stage2_kiosk_tokens.sql).
 */

export const KIOSK_COOKIE_NAME = "mgk_kiosk";
export const KIOSK_COOKIE_PATH = "/api/kid-login/kiosk";
export const KIOSK_TOKEN_TTL_SECONDS = 90 * 24 * 60 * 60;

const TOKEN_PREFIX = "v1";
const MIN_SECRET_LENGTH = 32;
const ROSTER_ID_LENGTH = 22;

export class KioskSecretMissingError extends Error {
  constructor() {
    super(
      "KIOSK_TOKEN_SECRET is missing or shorter than 32 characters. Kiosk mode is disabled until it is set."
    );
    this.name = "KioskSecretMissingError";
  }
}

export type KioskTokenPayload = {
  /** class id */
  cid: string;
  /** classes.kiosk_token_version at issue time */
  kv: number;
  /** random per-device id, used for rate limiting */
  jti: string;
  /** expiry, unix seconds */
  exp: number;
};

/** Throws KioskSecretMissingError if the secret is not configured (callers must fail closed). */
export function getKioskSecret(): string {
  const secret = process.env.KIOSK_TOKEN_SECRET?.trim() ?? "";
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new KioskSecretMissingError();
  }
  return secret;
}

function hmac(secret: string, label: string, data: string): Buffer {
  return createHmac("sha256", secret).update(`${label}:${data}`).digest();
}

export function signKioskToken(
  secret: string,
  input: { classId: string; version: number }
): { token: string; payload: KioskTokenPayload } {
  const payload: KioskTokenPayload = {
    cid: input.classId,
    kv: input.version,
    jti: randomBytes(16).toString("base64url"),
    exp: Math.floor(Date.now() / 1000) + KIOSK_TOKEN_TTL_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = hmac(secret, "kiosk-token", `${TOKEN_PREFIX}.${body}`).toString("base64url");
  return { token: `${TOKEN_PREFIX}.${body}.${sig}`, payload };
}

/** Checks format, signature and expiry only. Callers must still check kv against the database. */
export function verifyKioskTokenSignature(
  secret: string,
  token: string | undefined | null
): KioskTokenPayload | null {
  if (!token || token.length > 1024) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== TOKEN_PREFIX) return null;
  const [, body, sig] = parts;

  const expected = hmac(secret, "kiosk-token", `${TOKEN_PREFIX}.${body}`);
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  const p = payload as Partial<KioskTokenPayload>;
  if (
    typeof p.cid !== "string" ||
    typeof p.kv !== "number" ||
    typeof p.jti !== "string" ||
    typeof p.exp !== "number"
  ) {
    return null;
  }
  if (p.exp <= Math.floor(Date.now() / 1000)) return null;
  return p as KioskTokenPayload;
}

/** Opaque per-roster student id. Changes when the class kiosk version is bumped. */
export function kioskRosterId(
  secret: string,
  input: { classId: string; version: number; studentAuthUserId: string }
): string {
  return hmac(
    secret,
    "kiosk-roster-id",
    `${input.classId}:${input.version}:${input.studentAuthUserId}`
  )
    .toString("base64url")
    .slice(0, ROSTER_ID_LENGTH);
}

export function isWellFormedRosterId(rid: string): boolean {
  return rid.length === ROSTER_ID_LENGTH && /^[A-Za-z0-9_-]+$/.test(rid);
}

/** Constant-time string compare for login codes. */
export function safeEqualStrings(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export const KIOSK_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: KIOSK_COOKIE_PATH,
  maxAge: KIOSK_TOKEN_TTL_SECONDS,
};
