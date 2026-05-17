import { createClient } from "@/lib/supabase/client";
import {
  CLASS_CODE_LENGTH,
  generateRandomCode,
  isValidCustomCode as isValidCustomCodeCore,
  KID_CODE_LENGTH,
} from "@/lib/kid-login/code-core";

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

export function isValidCustomCode(
  code: string,
  minLen = 4,
  maxLen = 12
): ReturnType<typeof isValidCustomCodeCore> {
  return isValidCustomCodeCore(code, minLen, maxLen);
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
