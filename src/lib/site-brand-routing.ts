/** Home path from `profiles.account_type` (Supabase convention). */
export function homeHrefForAccountType(accountType: string | null | undefined): string {
  if (accountType === "student") return "/home";
  if (accountType === "parent") return "/dashboard/parent";
  if (accountType === "teacher") return "/dashboard/teacher";
  return "/";
}
