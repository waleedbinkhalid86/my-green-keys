export const REPORT_TOTAL_LESSONS = 100;

export type ProgressRow = {
  lesson_id: number;
  completed?: boolean | null;
  wpm?: number | null;
  accuracy?: number | null;
  completed_at?: string | null;
  stars?: number | null;
  eco_points?: number | null;
};

export type ReportPeriod = "week" | "month" | "all";

export function periodBounds(period: ReportPeriod, now: Date): { start: Date | null; end: Date; label: string } {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  if (period === "all") {
    return { start: null, end, label: "All time" };
  }
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const days = period === "week" ? 7 : 30;
  start.setDate(start.getDate() - days);
  return {
    start,
    end,
    label: period === "week" ? "Last 7 days" : "Last 30 days",
  };
}

function dayKey(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function completedLessonIds(rows: ProgressRow[]): Set<number> {
  const set = new Set<number>();
  for (const r of rows) {
    if (r.completed) set.add(Number(r.lesson_id));
  }
  return set;
}

export function avgWpm(rows: ProgressRow[], start: Date | null, end: Date): number {
  const list = rows.filter((r) => {
    if (!r.completed) return false;
    const t = r.completed_at ? new Date(r.completed_at) : null;
    if (!t || !Number.isFinite(t.getTime())) return false;
    if (start && t < start) return false;
    if (t > end) return false;
    return true;
  });
  if (list.length === 0) return 0;
  const sum = list.reduce((a, r) => a + (Number(r.wpm) || 0), 0);
  return Math.round(sum / list.length);
}

/** Rolling last 7 days vs the 7 days before that (for "this week vs last week"). */
export function wpmThisWeekVsLast(rows: ProgressRow[], now: Date): { thisWeek: number; lastWeek: number } {
  const endThis = new Date(now);
  endThis.setHours(23, 59, 59, 999);
  const startThis = new Date(now);
  startThis.setDate(startThis.getDate() - 7);
  startThis.setHours(0, 0, 0, 0);

  const endLast = new Date(startThis);
  endLast.setMilliseconds(endLast.getMilliseconds() - 1);
  const startLast = new Date(startThis);
  startLast.setDate(startLast.getDate() - 7);

  return {
    thisWeek: avgWpm(rows, startThis, endThis),
    lastWeek: avgWpm(rows, startLast, endLast),
  };
}

export function avgAccuracy(rows: ProgressRow[], start: Date | null, end: Date): number {
  const list = rows.filter((r) => {
    if (!r.completed) return false;
    const t = r.completed_at ? new Date(r.completed_at) : null;
    if (!t || !Number.isFinite(t.getTime())) {
      return start === null;
    }
    if (start && t < start) return false;
    if (t > end) return false;
    return true;
  });
  if (list.length === 0) return 0;
  const sum = list.reduce((a, r) => a + (Number(r.accuracy) || 0), 0);
  return Math.round(sum / list.length);
}

export function lessonsCompletedInPeriod(rows: ProgressRow[], start: Date | null, end: Date): number {
  const done = new Set<number>();
  for (const r of rows) {
    if (!r.completed) continue;
    const t = r.completed_at ? new Date(r.completed_at) : null;
    if (t && Number.isFinite(t.getTime())) {
      if (start && t < start) continue;
      if (t > end) continue;
    } else if (start !== null) {
      continue;
    }
    done.add(Number(r.lesson_id));
  }
  return done.size;
}

function addCalendarDayUtc(isoDate: string, delta: number): string {
  const d = new Date(`${isoDate}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Consecutive calendar days with at least one completed lesson, ending on the most recent active day. */
export function streakFromProgress(rows: ProgressRow[]): number {
  const days = new Set<string>();
  for (const r of rows) {
    if (!r.completed) continue;
    const k = dayKey(r.completed_at ?? null);
    if (k) days.add(k);
  }
  if (days.size === 0) return 0;
  const sorted = [...days].sort((a, b) => b.localeCompare(a));
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === addCalendarDayUtc(sorted[i - 1], -1)) streak++;
    else break;
  }
  return streak;
}

export function sumLessonEcoInPeriod(rows: ProgressRow[], start: Date | null, end: Date): number {
  let sum = 0;
  for (const r of rows) {
    if (!r.completed) continue;
    const t = r.completed_at ? new Date(r.completed_at) : null;
    if (t && Number.isFinite(t.getTime())) {
      if (start && t < start) continue;
      if (t > end) continue;
    } else if (start !== null) continue;
    sum += Number(r.eco_points) || 0;
  }
  return sum;
}

export function avgStars(rows: ProgressRow[], start: Date | null, end: Date): number {
  const list = rows.filter((r) => {
    if (!r.completed) return false;
    const t = r.completed_at ? new Date(r.completed_at) : null;
    if (t && Number.isFinite(t.getTime())) {
      if (start && t < start) return false;
      if (t > end) return false;
    } else if (start !== null) return false;
    return (Number(r.stars) || 0) > 0;
  });
  if (list.length === 0) return 0;
  const sum = list.reduce((a, r) => a + (Number(r.stars) || 0), 0);
  return sum / list.length;
}

export function starRatingOutOf5(avgStars: number, accuracyFallback: number): number {
  if (avgStars > 0) {
    return Math.max(1, Math.min(5, Math.round((avgStars / 3) * 5) || 1));
  }
  return Math.max(1, Math.min(5, Math.round(accuracyFallback / 20) || 1));
}
