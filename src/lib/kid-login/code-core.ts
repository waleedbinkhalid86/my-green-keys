/** Shared kid / class code alphabet and generators (no Supabase imports). */

// Excluded confusing chars: 0, O, I, 1, L
export const ALLOWED_CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const KID_CODE_LENGTH = 6;
export const CLASS_CODE_LENGTH = 8;

// Largest multiple of the alphabet size that fits in a byte; bytes at or above
// it are rejected so every character is equally likely (no modulo bias).
const UNBIASED_BYTE_LIMIT =
  256 - (256 % ALLOWED_CODE_CHARS.length);

/** Cryptographically random code (works in browser and Node 20+). */
export function generateRandomCode(length: number): string {
  let code = "";
  const buf = new Uint8Array(length * 2);
  while (code.length < length) {
    crypto.getRandomValues(buf);
    for (const byte of buf) {
      if (byte >= UNBIASED_BYTE_LIMIT) continue;
      code += ALLOWED_CODE_CHARS[byte % ALLOWED_CODE_CHARS.length];
      if (code.length === length) break;
    }
  }
  return code;
}

export function isValidCustomCode(
  code: string,
  minLen = 4,
  maxLen = 12
): {
  ok: boolean;
  reason?: string;
} {
  if (!code || code.length < minLen) {
    return { ok: false, reason: `Code must be at least ${minLen} characters` };
  }
  if (code.length > maxLen) {
    return { ok: false, reason: `Code must be ${maxLen} characters or less` };
  }

  const normalized = code.toUpperCase();
  for (const char of normalized) {
    if (!ALLOWED_CODE_CHARS.includes(char)) {
      return { ok: false, reason: `Character "${char}" not allowed (avoid 0, O, I, 1, L)` };
    }
  }

  return { ok: true };
}
