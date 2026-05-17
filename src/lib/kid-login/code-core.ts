/** Shared kid / class code alphabet and generators (no Supabase imports). */

// Excluded confusing chars: 0, O, I, 1, L
export const ALLOWED_CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const KID_CODE_LENGTH = 6;
export const CLASS_CODE_LENGTH = 8;

export function generateRandomCode(length: number): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * ALLOWED_CODE_CHARS.length);
    code += ALLOWED_CODE_CHARS[idx];
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
