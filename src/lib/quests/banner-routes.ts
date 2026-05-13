/** Routes where the quest banner (and auto-track toast) may appear. */
export const QUEST_BANNER_ALLOWED_PREFIXES = [
  "/lesson",
  "/lesson-map",
  "/brain-sprint",
  "/games",
  "/dashboard/parent",
] as const;

export function isQuestBannerAllowedPath(
  pathname: string | null | undefined
): boolean {
  if (!pathname) return false;
  return QUEST_BANNER_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
