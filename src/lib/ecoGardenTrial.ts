import type { SupabaseClient } from "@supabase/supabase-js";

export type TrialStatus =
  | "not_started"
  | "active"
  | "expired"
  | "paid"
  | "locked";

export interface TrialState {
  status: TrialStatus;
  daysRemaining: number;
  hoursRemaining: number;
  trialStartedAt: string | null;
  hasPaidPlan: boolean;
  hasCompletedLesson20: boolean;
}

export const TRIAL_DURATION_DAYS = 3;
export const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const PAID_PLANS = new Set(["family", "school_starter", "school_growth"]);

function lockedState(): TrialState {
  return {
    status: "locked",
    daysRemaining: 0,
    hoursRemaining: 0,
    trialStartedAt: null,
    hasPaidPlan: false,
    hasCompletedLesson20: false,
  };
}

function normalizePlanType(v: unknown): string {
  return String(v ?? "")
    .toLowerCase()
    .trim();
}

export async function getTrialState(userId: string, supabase: SupabaseClient): Promise<TrialState> {
  try {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("eco_garden_trial_started_at")
      .eq("id", userId)
      .maybeSingle();

    if (profileErr) throw profileErr;

    const trialStartedAt =
      (profile as { eco_garden_trial_started_at?: string | null } | null)?.eco_garden_trial_started_at ?? null;

    const { data: subRows, error: subErr } = await supabase
      .from("subscriptions")
      .select("status, plan_type")
      .eq("user_id", userId)
      .eq("status", "active");

    if (subErr) throw subErr;

    const hasPaidPlan = (subRows ?? []).some((row: { plan_type?: unknown }) =>
      PAID_PLANS.has(normalizePlanType(row.plan_type)),
    );

    const { data: progressRows, error: progErr } = await supabase
      .from("student_progress")
      .select("lesson_id")
      .eq("student_id", userId)
      .eq("completed", true)
      .gte("lesson_id", 1)
      .lte("lesson_id", 20);

    if (progErr) throw progErr;

    const uniqueLessons = new Set(
      (progressRows ?? [])
        .map((r: { lesson_id: unknown }) => r.lesson_id)
        .filter((n): n is number => typeof n === "number" && n >= 1 && n <= 20),
    );
    const hasCompletedLesson20 = uniqueLessons.size >= 20;

    if (!hasCompletedLesson20) {
      return {
        status: "locked",
        daysRemaining: 0,
        hoursRemaining: 0,
        trialStartedAt,
        hasPaidPlan,
        hasCompletedLesson20: false,
      };
    }

    if (hasPaidPlan) {
      return {
        status: "paid",
        daysRemaining: 0,
        hoursRemaining: 0,
        trialStartedAt,
        hasPaidPlan: true,
        hasCompletedLesson20: true,
      };
    }

    if (trialStartedAt == null || trialStartedAt === "") {
      return {
        status: "not_started",
        daysRemaining: 0,
        hoursRemaining: 0,
        trialStartedAt: null,
        hasPaidPlan: false,
        hasCompletedLesson20: true,
      };
    }

    const startMs = new Date(trialStartedAt).getTime();
    if (!Number.isFinite(startMs)) {
      return {
        status: "not_started",
        daysRemaining: 0,
        hoursRemaining: 0,
        trialStartedAt: null,
        hasPaidPlan: false,
        hasCompletedLesson20: true,
      };
    }

    const now = Date.now();
    const elapsed = now - startMs;

    if (elapsed < TRIAL_DURATION_MS) {
      const msLeft = TRIAL_DURATION_MS - elapsed;
      const daysRemaining = Math.floor(msLeft / DAY_MS);
      const hoursRemaining = Math.max(1, Math.ceil(msLeft / HOUR_MS));
      return {
        status: "active",
        daysRemaining,
        hoursRemaining,
        trialStartedAt,
        hasPaidPlan: false,
        hasCompletedLesson20: true,
      };
    }

    return {
      status: "expired",
      daysRemaining: 0,
      hoursRemaining: 0,
      trialStartedAt,
      hasPaidPlan: false,
      hasCompletedLesson20: true,
    };
  } catch (e) {
    console.error("getTrialState failed:", e);
    return lockedState();
  }
}

export async function startTrial(userId: string, supabase: SupabaseClient): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ eco_garden_trial_started_at: new Date().toISOString() })
      .eq("id", userId)
      .is("eco_garden_trial_started_at", null)
      .select("id");

    if (error) throw error;
    return Array.isArray(data) && data.length > 0;
  } catch (e) {
    console.error("startTrial failed:", e);
    return false;
  }
}

export function canFullyAccessGarden(state: TrialState): boolean {
  return state.status === "paid" || state.status === "active";
}

export function canViewGarden(state: TrialState): boolean {
  return state.status === "paid" || state.status === "active" || state.status === "expired";
}
