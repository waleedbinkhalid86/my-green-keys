import { createClient } from "@/lib/supabase/client";

/**
 * Single source of truth for "whose family quest data should we read/write?"
 * If the signed-in user is a kid (linked in `children.auth_user_id`), returns that row's `parent_id`.
 * Otherwise returns `currentUserId` (parent or solo account).
 */
export async function getFamilyOwnerId(currentUserId: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("children")
    .select("parent_id")
    .eq("auth_user_id", currentUserId)
    .maybeSingle();

  if (error) {
    console.error("[family-resolver] getFamilyOwnerId:", error);
    return currentUserId;
  }
  const pid = (data as { parent_id?: string } | null)?.parent_id;
  if (pid) return String(pid);
  return currentUserId;
}

/** True when this auth user is a linked child account (kid login). */
export async function isChildAccount(currentUserId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("children")
    .select("id")
    .eq("auth_user_id", currentUserId)
    .maybeSingle();

  if (error) {
    console.error("[family-resolver] isChildAccount:", error);
    return false;
  }
  return data != null;
}

export async function assertParentCanManageQuests(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  if (await isChildAccount(user.id)) {
    throw new Error("Only parents can manage quests.");
  }
}
