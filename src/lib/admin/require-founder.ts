import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const ADMIN_EMAIL = "mygreenkeys26@gmail.com";

function isFounderEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/** For API routes: returns the founder's user, or null if unauthorized. */
export async function requireFounder(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isFounderEmail(user.email)) return null;
  return user;
}

/** For server components: redirects non-founders, matching /admin's lock. */
export async function requireFounderPage(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isFounderEmail(user.email)) redirect("/");
  return user;
}
