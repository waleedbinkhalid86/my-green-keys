import { createClient } from "@/lib/supabase/client";

export async function getCurrentUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.user || null;
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function getUserProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}

export async function getUserRole(userId: string) {
  const profile = await getUserProfile(userId);
  return profile?.account_type || null;
}
