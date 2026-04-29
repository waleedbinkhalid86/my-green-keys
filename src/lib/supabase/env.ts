function stripWrappingQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function getSupabasePublicEnv() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabaseUrl = rawUrl ? stripWrappingQuotes(rawUrl) : "";
  const supabaseAnonKey = rawAnonKey ? stripWrappingQuotes(rawAnonKey) : "";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      [
        "Supabase environment variables are missing.",
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart the dev server.",
      ].join(" ")
    );
  }

  try {
    // Validates absolute URL, catches common copy/paste issues.
    new URL(supabaseUrl);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL is not a valid URL: ${JSON.stringify(supabaseUrl)}`
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

