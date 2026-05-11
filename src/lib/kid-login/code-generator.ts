import { createClient } from "@/lib/supabase/client";

// Excluded confusing chars: 0, O, I, 1, L
const ALLOWED_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const KID_CODE_LENGTH = 6;
const CLASS_CODE_LENGTH = 8;

function generateRandomCode(length: number): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * ALLOWED_CHARS.length);
    code += ALLOWED_CHARS[idx];
  }
  return code;
}

// Generate unique kid login code (6 chars), checking children table
export async function generateUniqueKidCode(): Promise<string> {
  const supabase = createClient();

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateRandomCode(KID_CODE_LENGTH);
    const { data } = await supabase
      .from("children")
      .select("id")
      .eq("login_code", candidate)
      .maybeSingle();

    if (!data) return candidate;
  }
  throw new Error("Could not generate unique kid code");
}

// Generate unique class code (8 chars), checking classes table
export async function generateUniqueClassCode(): Promise<string> {
  const supabase = createClient();

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateRandomCode(CLASS_CODE_LENGTH);
    const { data } = await supabase
      .from("classes")
      .select("id")
      .eq("class_code", candidate)
      .maybeSingle();

    if (!data) return candidate;
  }
  throw new Error("Could not generate unique class code");
}

// Validate custom code format
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
    if (!ALLOWED_CHARS.includes(char)) {
      return { ok: false, reason: `Character "${char}" not allowed (avoid 0, O, I, 1, L)` };
    }
  }

  return { ok: true };
}

export async function isKidCodeAvailable(code: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("children")
    .select("id")
    .eq("login_code", code.toUpperCase())
    .maybeSingle();
  return !data;
}

export async function isClassCodeAvailable(code: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("classes")
    .select("id")
    .eq("class_code", code.toUpperCase())
    .maybeSingle();
  return !data;
}
