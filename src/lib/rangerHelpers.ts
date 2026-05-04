import type { SupabaseClient } from "@supabase/supabase-js";

export type RangerRank = "cadet" | "scout" | "ranger" | "captain" | "hero";

export interface RankInfo {
  id: RangerRank;
  label: string;
  xpRequired: number;
  description: string;
  color: string;
  emoji: string;
}

export interface RangerProfile {
  ranger_xp: number;
  ranger_rank: RangerRank;
}

export interface RangerProgress {
  currentXp: number;
  currentRank: RankInfo;
  nextRank: RankInfo | null;
  xpToNext: number;
  progressPercent: number;
}

export interface XpLogEntry {
  id: string;
  source: string;
  xp_amount: number;
  description: string | null;
  created_at: string;
}

export interface XpAwardResult {
  awarded: number;
  totalXp: number;
  rankBefore: RangerRank;
  rankAfter: RangerRank;
  rankUp: boolean;
}

export const RANKS: RankInfo[] = [
  { id: "cadet", label: "Cadet", xpRequired: 0, description: "Just starting out", color: "gray", emoji: "🌱" },
  { id: "scout", label: "Scout", xpRequired: 500, description: "Found your footing", color: "green", emoji: "🍃" },
  { id: "ranger", label: "Ranger", xpRequired: 2000, description: "Skilled and consistent", color: "emerald", emoji: "🌳" },
  { id: "captain", label: "Captain", xpRequired: 5000, description: "Mastery achieved", color: "blue", emoji: "🦅" },
  { id: "hero", label: "Planet Hero", xpRequired: 10000, description: "Top of the world", color: "purple", emoji: "🌍" },
];

export const XP_SOURCES = {
  LESSON_COMPLETE: "lesson_complete",
  LESSON_THREE_STARS: "lesson_three_stars",
  GAME_FALLING_LEAVES: "game_falling_leaves",
  GAME_SORT_RECYCLING: "game_sort_recycling",
  GAME_SAVE_OCEAN: "game_save_ocean",
  GAME_ECO_GARDEN: "game_eco_garden",
  GAME_KIND_WORLD: "game_kind_world",
  STREAK_DAY: "streak_day",
  STREAK_MILESTONE: "streak_milestone",
  ECO_PHOTO_APPROVED: "eco_photo_approved",
} as const;

const RANK_ORDER: RangerRank[] = ["cadet", "scout", "ranger", "captain", "hero"];

function isRangerRank(value: unknown): value is RangerRank {
  return typeof value === "string" && (RANK_ORDER as readonly string[]).includes(value);
}

export function getRankFromXp(xp: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    const rank = RANKS[i]!;
    if (rank.xpRequired <= xp) {
      return rank;
    }
  }
  return RANKS[0]!;
}

export function getProgress(xp: number): RangerProgress {
  const currentRank = getRankFromXp(xp);
  const index = RANKS.findIndex((r) => r.id === currentRank.id);
  const nextRank = index >= 0 && index < RANKS.length - 1 ? RANKS[index + 1]! : null;
  const xpToNext = nextRank ? nextRank.xpRequired - xp : 0;
  let progressPercent: number;
  if (nextRank) {
    const span = nextRank.xpRequired - currentRank.xpRequired;
    progressPercent = span > 0 ? ((xp - currentRank.xpRequired) / span) * 100 : 100;
  } else {
    progressPercent = 100;
  }
  progressPercent = Math.max(0, Math.min(100, progressPercent));
  return {
    currentXp: xp,
    currentRank,
    nextRank,
    xpToNext,
    progressPercent,
  };
}

export function calculateGameXp(score: number): number {
  const raw = 5 + Math.floor(score / 20);
  return Math.min(100, Math.max(5, raw));
}

type ProfileRangerRow = {
  ranger_xp: number | null;
  ranger_rank: string | null;
};

type XpLogRow = {
  id: string;
  source: string;
  xp_amount: number;
  description: string | null;
  created_at: string;
};

export async function awardXp(
  userId: string,
  amount: number,
  source: string,
  description: string,
  supabase: SupabaseClient,
): Promise<XpAwardResult | null> {
  try {
    if (!(amount > 0) || typeof source !== "string" || source.trim().length === 0) {
      return null;
    }

    const { data: profileRow, error: fetchError } = await supabase
      .from("profiles")
      .select("ranger_xp, ranger_rank")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError || !profileRow) {
      if (fetchError) {
        console.error("[rangerHelpers] awardXp profile fetch:", fetchError);
      }
      return null;
    }

    const row = profileRow as ProfileRangerRow;
    const currentXp = Number(row.ranger_xp ?? 0);
    const newTotal = currentXp + amount;
    const rankBefore = getRankFromXp(currentXp).id;
    const rankAfter = getRankFromXp(newTotal).id;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ranger_xp: newTotal, ranger_rank: rankAfter })
      .eq("id", userId);

    if (updateError) {
      console.error("[rangerHelpers] awardXp profile update:", updateError);
      return null;
    }

    const { error: insertError } = await supabase.from("ranger_xp_log").insert({
      user_id: userId,
      source: source.trim(),
      xp_amount: amount,
      description,
    });

    if (insertError) {
      console.error("[rangerHelpers] awardXp xp log insert:", insertError);
      return null;
    }

    return {
      awarded: amount,
      totalXp: newTotal,
      rankBefore,
      rankAfter,
      rankUp: rankBefore !== rankAfter,
    };
  } catch (err) {
    console.error("[rangerHelpers] awardXp:", err);
    return null;
  }
}

export async function getRangerProfile(
  userId: string,
  supabase: SupabaseClient,
): Promise<RangerProfile | null> {
  try {
    const { data: profileRow, error } = await supabase
      .from("profiles")
      .select("ranger_xp, ranger_rank")
      .eq("id", userId)
      .maybeSingle();

    if (error || !profileRow) {
      if (error) {
        console.error("[rangerHelpers] getRangerProfile:", error);
      }
      return null;
    }

    const row = profileRow as ProfileRangerRow;
    const ranger_xp = Number(row.ranger_xp ?? 0);
    const ranger_rank: RangerRank = isRangerRank(row.ranger_rank) ? row.ranger_rank : "cadet";

    return { ranger_xp, ranger_rank };
  } catch (err) {
    console.error("[rangerHelpers] getRangerProfile:", err);
    return null;
  }
}

export async function getXpHistory(
  userId: string,
  supabase: SupabaseClient,
  limit = 20,
): Promise<XpLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from("ranger_xp_log")
      .select("id, source, xp_amount, description, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[rangerHelpers] getXpHistory:", error);
      return [];
    }

    return (data ?? []) as XpLogEntry[];
  } catch (err) {
    console.error("[rangerHelpers] getXpHistory:", err);
    return [];
  }
}

export async function getXpBreakdown(
  userId: string,
  supabase: SupabaseClient,
): Promise<{ source: string; total: number; count: number }[]> {
  try {
    const { data, error } = await supabase
      .from("ranger_xp_log")
      .select("source, xp_amount")
      .eq("user_id", userId);

    if (error) {
      console.error("[rangerHelpers] getXpBreakdown:", error);
      return [];
    }

    const rows = (data ?? []) as Pick<XpLogRow, "source" | "xp_amount">[];
    const bySource = new Map<string, { total: number; count: number }>();

    for (const r of rows) {
      const key = r.source;
      const prev = bySource.get(key) ?? { total: 0, count: 0 };
      prev.total += Number(r.xp_amount ?? 0);
      prev.count += 1;
      bySource.set(key, prev);
    }

    return [...bySource.entries()]
      .map(([source, { total, count }]) => ({ source, total, count }))
      .sort((a, b) => b.total - a.total);
  } catch (err) {
    console.error("[rangerHelpers] getXpBreakdown:", err);
    return [];
  }
}
