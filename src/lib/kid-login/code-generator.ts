import {
  CLASS_CODE_LENGTH,
  generateRandomCode,
  isValidCustomCode as isValidCustomCodeCore,
  KID_CODE_LENGTH,
} from "@/lib/kid-login/code-core";

// Browser clients can no longer read other families' children or other
// teachers' classes, so these only generate a random code. Uniqueness is
// enforced by the UNIQUE constraints; callers retry on error code 23505.

// Generate kid login code (6 chars)
export function generateUniqueKidCode(): string {
  return generateRandomCode(KID_CODE_LENGTH);
}

// Generate class code (8 chars)
export function generateUniqueClassCode(): string {
  return generateRandomCode(CLASS_CODE_LENGTH);
}

export function isValidCustomCode(
  code: string,
  minLen = 4,
  maxLen = 12
): ReturnType<typeof isValidCustomCodeCore> {
  return isValidCustomCodeCore(code, minLen, maxLen);
}

/** Server-checked (parent session required, rate-limited). Throws if the check cannot run. */
export async function isKidCodeAvailable(code: string): Promise<boolean> {
  const res = await fetch(
    `/api/parent/kid-code-available?code=${encodeURIComponent(code.toUpperCase())}`,
    { credentials: "include" }
  );
  const data = (await res.json().catch(() => ({}))) as {
    available?: boolean;
    error?: string;
  };
  if (!res.ok || typeof data.available !== "boolean") {
    throw new Error(data.error ?? "Could not check that code.");
  }
  return data.available;
}
