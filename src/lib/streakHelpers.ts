import type { SupabaseClient } from "@supabase/supabase-js";
import { awardXp, XP_SOURCES } from "@/lib/rangerHelpers";

export interface StreakProfile {
  current_streak: number;
  longest_streak: number;
  last_streak_date: string | null;
  streak_freezes: number;
}

export interface StreakUpdateResult {
  newStreak: number;
  isNewMilestone: boolean;
  milestoneDay: number | null;
  rewardEcoPoints: number;
  rewardBadge: string | null;
  rewardFreeze: number;
  freezeUsed: boolean;
  longestStreakBeaten: boolean;
}

const MILESTONES = {
  3: { ecoPoints: 10, badge: null, freeze: 0, label: "On a roll!" },
  7: { ecoPoints: 25, badge: "Week Warrior", freeze: 0, label: "Week Warrior!" },
  14: { ecoPoints: 50, badge: null, freeze: 1, label: "Two-week streak!" },
  30: { ecoPoints: 100, badge: "Monthly Master", freeze: 0, label: "Monthly Master!" },
  60: { ecoPoints: 200, badge: null, freeze: 1, label: "60-day legend!" },
  100: { ecoPoints: 500, badge: "Century Club", freeze: 2, label: "Century Club!" },
} as const;

type MilestoneDay = keyof typeof MILESTONES;

function isMilestoneDay(n: number): n is MilestoneDay {
  return Object.prototype.hasOwnProperty.call(MILESTONES, n);
}

type ProfileStreakRow = {
  current_streak: number | null;
  longest_streak: number | null;
  last_streak_date: string | null;
  streak_freezes: number | null;
  eco_points: number | null;
};

type StreakActivityRow = {
  activity_date: string;
  activity_type: string;
};

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

export function getYesterdayDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split("T")[0] ?? "";
}

export function daysBetween(date1: string, date2: string): number {
  const t1 = Date.parse(`${date1}T12:00:00.000Z`);
  const t2 = Date.parse(`${date2}T12:00:00.000Z`);
  if (Number.isNaN(t1) || Number.isNaN(t2)) {
    return 0;
  }
  return Math.abs(Math.round((t1 - t2) / 86_400_000));
}

function addCalendarDaysIso(isoDate: string, deltaDays: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) {
    return isoDate;
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().split("T")[0] ?? isoDate;
}

export async function updateStreak(
  userId: string,
  activityType: "lesson" | "game",
  supabase: SupabaseClient
): Promise<StreakUpdateResult | null> {
  try {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    const dayBeforeYesterday = addCalendarDaysIso(today, -2);

    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .select(
        "current_streak, longest_streak, last_streak_date, streak_freezes, eco_points"
      )
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profileRow) {
      if (profileError) {
        console.error("[streakHelpers] updateStreak profile fetch:", profileError);
      }
      return null;
    }

    const profile = profileRow as ProfileStreakRow;

    const { count: countBefore, error: countError } = await supabase
      .from("streaks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("activity_date", today);

    if (countError) {
      console.error("[streakHelpers] updateStreak count:", countError);
      return null;
    }

    const priorCount = countBefore ?? 0;

    const { error: insertError } = await supabase.from("streaks").upsert(
      {
        user_id: userId,
        activity_date: today,
        activity_type: activityType,
      },
      {
        onConflict: "user_id,activity_date,activity_type",
        ignoreDuplicates: true,
      }
    );

    if (insertError) {
      console.error("[streakHelpers] updateStreak insert:", insertError);
      return null;
    }

    // First qualifying activity of the day updates the streak; later activities only log.
    if (priorCount >= 1) {
      return null;
    }

    const currentStreak = profile.current_streak ?? 0;
    const streakFreezes = profile.streak_freezes ?? 0;
    const lastStreakDate = profile.last_streak_date;

    if (lastStreakDate === today) {
      return null;
    }

    let newStreak: number;
    let freezeUsed = false;

    if (lastStreakDate === yesterday) {
      newStreak = currentStreak + 1;
    } else if (lastStreakDate === null || lastStreakDate < yesterday) {
      if (streakFreezes > 0 && lastStreakDate === dayBeforeYesterday) {
        newStreak = currentStreak + 1;
        freezeUsed = true;
      } else {
        newStreak = 1;
      }
    } else {
      // Future or other unexpected last_streak_date: safe reset
      newStreak = 1;
    }

    const milestoneDay: MilestoneDay | null = isMilestoneDay(newStreak)
      ? newStreak
      : null;
    const milestone = milestoneDay !== null ? MILESTONES[milestoneDay] : null;

    const rewardEcoPoints = milestone?.ecoPoints ?? 0;
    const rewardBadge = milestone?.badge ?? null;
    const rewardFreeze = milestone?.freeze ?? 0;
    const isNewMilestone = milestoneDay !== null;

    const prevLongest = profile.longest_streak ?? 0;
    const longestStreakBeaten = newStreak > prevLongest;

    const ecoPoints = profile.eco_points ?? 0;
    const nextEcoPoints = ecoPoints + rewardEcoPoints;
    const nextFreezes = Math.max(
      0,
      streakFreezes - (freezeUsed ? 1 : 0) + rewardFreeze
    );

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(prevLongest, newStreak),
        last_streak_date: today,
        streak_freezes: nextFreezes,
        eco_points: nextEcoPoints,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("[streakHelpers] updateStreak profile update:", updateError);
      return null;
    }

    try {
      if (newStreak > 0) {
        await awardXp(
          userId,
          5,
          XP_SOURCES.STREAK_DAY,
          `Day ${newStreak} streak`,
          supabase
        );
      }

      if (milestoneDay && rewardEcoPoints > 0) {
        const milestoneXp = rewardEcoPoints * 5;
        await awardXp(
          userId,
          milestoneXp,
          XP_SOURCES.STREAK_MILESTONE,
          `${milestoneDay}-day streak milestone`,
          supabase
        );
      }
    } catch (err) {
      console.error("[streakHelpers] updateStreak ranger XP:", err);
    }

    return {
      newStreak,
      isNewMilestone,
      milestoneDay,
      rewardEcoPoints,
      rewardBadge,
      rewardFreeze,
      freezeUsed,
      longestStreakBeaten,
    };
  } catch (e) {
    console.error("[streakHelpers] updateStreak:", e);
    return null;
  }
}

export async function getStreakHistory(
  userId: string,
  supabase: SupabaseClient,
  daysBack: number = 90
): Promise<{ date: string; types: string[] }[] | null> {
  try {
    const today = getTodayDate();
    const startDate = addCalendarDaysIso(today, -Math.max(0, daysBack));

    const { data, error } = await supabase
      .from("streaks")
      .select("activity_date, activity_type")
      .eq("user_id", userId)
      .gte("activity_date", startDate)
      .lte("activity_date", today)
      .order("activity_date", { ascending: true });

    if (error) {
      console.error("[streakHelpers] getStreakHistory:", error);
      return null;
    }

    const rows = (data ?? []) as StreakActivityRow[];
    const byDate = new Map<string, Set<string>>();

    for (const row of rows) {
      const set = byDate.get(row.activity_date) ?? new Set<string>();
      set.add(row.activity_type);
      byDate.set(row.activity_date, set);
    }

    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, types]) => ({
        date,
        types: [...types].sort(),
      }));
  } catch (e) {
    console.error("[streakHelpers] getStreakHistory:", e);
    return null;
  }
}

export async function getCurrentStreak(
  userId: string,
  supabase: SupabaseClient
): Promise<StreakProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("current_streak, longest_streak, last_streak_date, streak_freezes")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[streakHelpers] getCurrentStreak:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    const row = data as Pick<
      ProfileStreakRow,
      "current_streak" | "longest_streak" | "last_streak_date" | "streak_freezes"
    >;

    return {
      current_streak: row.current_streak ?? 0,
      longest_streak: row.longest_streak ?? 0,
      last_streak_date: row.last_streak_date,
      streak_freezes: row.streak_freezes ?? 0,
    };
  } catch (e) {
    console.error("[streakHelpers] getCurrentStreak:", e);
    return null;
  }
}
