/** Shared kid internal login identifiers (no Supabase client imports). */

export function generateInternalEmail(): string {
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `child-${random}@mygreenkeys.kids`;
}

export function generateInternalPassword(): string {
  const random = crypto.randomUUID() + crypto.randomUUID();
  return random.replace(/-/g, "").slice(0, 32);
}
