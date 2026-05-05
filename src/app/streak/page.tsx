"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Award, CheckCircle, Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentStreak, getStreakHistory, getTodayDate } from "@/lib/streakHelpers";
import { StreakCounter } from "@/components/StreakCounter";
import { cn } from "@/lib/utils";

const ROW_LABELS: (string | null)[] = ["Mon", null, "Wed", null, "Fri", null, "Sun"];

const MILESTONE_ROWS: { day: number; title: string; badge: string | null }[] = [
  { day: 3, title: "On a roll!", badge: null },
  { day: 7, title: "Week Warrior!", badge: "Week Warrior" },
  { day: 14, title: "Two-week streak!", badge: null },
  { day: 30, title: "Monthly Master!", badge: "Monthly Master" },
  { day: 60, title: "60-day legend!", badge: null },
  { day: 100, title: "Century Club!", badge: "Century Club" },
];

function toUtcDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
}

function toIsoUtc(d: Date): string {
  return d.toISOString().slice(0, 10) ?? "";
}

function startOfIsoWeekMonday(iso: string): string {
  const d = toUtcDate(iso);
  const day = d.getUTCDay();
  const mondayOffset = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - mondayOffset);
  return toIsoUtc(d);
}

function addDaysIso(iso: string, delta: number): string {
  const d = toUtcDate(iso);
  d.setUTCDate(d.getUTCDate() + delta);
  return toIsoUtc(d);
}

function monthShort(iso: string): string {
  return toUtcDate(iso).toLocaleString("en-US", { month: "short", timeZone: "UTC" });
}

function formatTooltipDate(iso: string): string {
  return toUtcDate(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function cellClasses(types: string[] | undefined, isToday: boolean): string {
  let base = "rounded-sm";
  if (isToday) {
    base += " ring-2 ring-yellow-400 ring-offset-1";
  }
  if (!types || types.length === 0) {
    return cn(base, "bg-gray-100");
  }
  const hasL = types.includes("lesson");
  const hasG = types.includes("game");
  if (hasL && hasG) {
    return cn(base, "bg-green-600");
  }
  if (hasL) {
    return cn(base, "bg-green-300");
  }
  if (hasG) {
    return cn(base, "bg-blue-300");
  }
  return cn(base, "bg-gray-100");
}

function activityDescription(types: string[] | undefined): string {
  if (!types || types.length === 0) {
    return "No activity";
  }
  const hasL = types.includes("lesson");
  const hasG = types.includes("game");
  if (hasL && hasG) {
    return "Lesson and game";
  }
  if (hasL) {
    return "Lesson";
  }
  if (hasG) {
    return "Game";
  }
  return "Activity";
}

export default function StreakPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [freezes, setFreezes] = useState(0);
  const [historyMap, setHistoryMap] = useState<Map<string, string[]>>(new Map());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      }
      if (!user) {
        setError("signin");
        setLoading(false);
        return;
      }

      const [profile, history] = await Promise.all([
        getCurrentStreak(user.id, supabase),
        getStreakHistory(user.id, supabase, 90),
      ]);

      if (!profile || !history) {
        throw new Error("load_failed");
      }

      setCurrentStreak(profile.current_streak);
      setLongestStreak(profile.longest_streak);
      setFreezes(profile.streak_freezes);

      const map = new Map<string, string[]>();
      for (const row of history) {
        map.set(row.date, row.types);
      }
      setHistoryMap(map);
    } catch {
      setError("load_failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const today = getTodayDate();
  const startDate90 = addDaysIso(today, -89);

  const { columns, monthLabels } = useMemo(() => {
    const endMonday = startOfIsoWeekMonday(today);
    const gridStartMonday = addDaysIso(endMonday, -12 * 7);
    const cols: (string | null)[][] = [];
    const labels: string[] = [];
    let prevMonth = "";

    for (let c = 0; c < 13; c++) {
      const col: (string | null)[] = [];
      for (let r = 0; r < 7; r++) {
        col.push(addDaysIso(gridStartMonday, c * 7 + r));
      }
      cols.push(col);
      const mid = col[3] ?? col[0];
      const m = mid ? monthShort(mid) : "";
      if (m && m !== prevMonth) {
        labels.push(m);
        prevMonth = m;
      } else {
        labels.push("");
      }
    }

    return { columns: cols, monthLabels: labels };
  }, [today]);

  const unlockedMilestones = useMemo(
    () => MILESTONE_ROWS.filter((m) => longestStreak >= m.day),
    [longestStreak],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 font-sans">
        <div className="mgk-container mgk-section">
          <div className="h-10 w-40 animate-pulse rounded-md bg-gray-200" />
          <div className="mx-auto mt-10 max-w-3xl animate-pulse rounded-md bg-white p-8 shadow-lg">
            <div className="mx-auto h-32 w-48 rounded-md bg-gray-100" />
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="h-24 rounded-md bg-gray-100" />
              <div className="h-24 rounded-md bg-gray-100" />
              <div className="h-24 rounded-md bg-gray-100" />
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-3xl animate-pulse rounded-md bg-white p-8 shadow-lg">
            <div className="h-6 w-48 rounded bg-gray-100" />
            <div className="mt-6 h-40 rounded-md bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error === "signin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 font-sans">
        <div className="mgk-container mgk-section">
          <div className="mx-auto max-w-md rounded-md bg-white p-8 text-center shadow-lg">
            <p className="text-lg font-semibold text-gray-800">Sign in to view your streak.</p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-md bg-green-500 px-8 py-3 font-bold text-white hover:bg-green-600"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 font-sans">
        <div className="mgk-container mgk-section">
          <div className="mx-auto max-w-md rounded-md bg-white p-8 text-center shadow-lg">
            <p className="text-lg font-semibold text-gray-800">Couldn&apos;t load streak data.</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-6 rounded-md bg-green-500 px-8 py-3 font-bold text-white hover:bg-green-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 font-sans">
      <header className="mgk-section-tight">
        <div className="mgk-container">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 font-bold text-gray-800 transition hover:text-green-700"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            Back
          </button>
        </div>

        <div className="mgk-container mt-8">
          <div className="mx-auto max-w-3xl rounded-md bg-white p-8 shadow-sm transition-shadow hover:shadow-lg">
            <div className="flex justify-center">
              <StreakCounter streak={currentStreak} variant="large" />
            </div>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 tabular-nums">{currentStreak}</p>
                <p className="mt-1 text-sm text-gray-500">current streak</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 tabular-nums">{longestStreak}</p>
                <p className="mt-1 text-sm text-gray-500">longest streak</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 tabular-nums">{freezes}</p>
                <p className="mt-1 text-sm text-gray-500">freezes available</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mgk-section-tight">
        <div className="mgk-container">
          <div className="mx-auto max-w-3xl rounded-md bg-white p-8 shadow-sm transition-shadow hover:shadow-lg">
            <h2 className="mb-2 text-xl font-bold text-gray-900">Last 90 days</h2>
            <p className="text-sm text-gray-500">Each square is a day. Brighter = more activity.</p>

            <div className="mt-6 overflow-x-auto pb-2">
              <div
                className="inline-grid gap-1"
                style={{
                  gridTemplateColumns: `auto repeat(13, 14px)`,
                }}
              >
                <div />
                {monthLabels.map((lab, i) => (
                  <div key={`mh-${i}`} className="text-center text-[10px] font-semibold leading-none text-gray-500">
                    {lab}
                  </div>
                ))}

                {ROW_LABELS.map((lab, rowIdx) => (
                  <div key={`row-${rowIdx}`} className="contents">
                    <div className="flex items-center justify-end pr-1 text-[10px] leading-none text-gray-500">
                      {lab ?? ""}
                    </div>
                    {columns.map((col, cIdx) => {
                      const date = col[rowIdx] ?? null;
                      if (!date) {
                        return <div key={`e-${cIdx}-${rowIdx}`} className="h-[14px] w-[14px]" />;
                      }
                      const inRange = date >= startDate90 && date <= today;
                      const types = inRange ? historyMap.get(date) : undefined;
                      const isToday = date === today;
                      const title = inRange
                        ? `${formatTooltipDate(date)} — ${activityDescription(types)}`
                        : `${formatTooltipDate(date)} — outside range`;

                      return (
                        <div
                          key={`${date}-${cIdx}-${rowIdx}`}
                          title={title}
                          className={cn(
                            "h-[14px] w-[14px] shrink-0",
                            inRange
                              ? cellClasses(types, isToday)
                              : cn("rounded-sm bg-gray-50", isToday && "ring-2 ring-yellow-400 ring-offset-1"),
                          )}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mgk-section-tight">
        <div className="mgk-container">
          <div className="mx-auto max-w-3xl rounded-md bg-white p-8 shadow-sm transition-shadow hover:shadow-lg">
            <h2 className="mb-2 text-xl font-bold text-gray-900">Your milestones</h2>
            {unlockedMilestones.length === 0 ? (
              <p className="mt-6 flex items-center gap-2 text-gray-600">
                <Flame className="h-5 w-5 shrink-0 text-orange-500" aria-hidden />
                Hit 3 days to earn your first milestone!
              </p>
            ) : (
              <ul className="mt-6 space-y-3">
                {unlockedMilestones.map((m) => (
                  <li
                    key={m.day}
                    className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50/80 px-4 py-3"
                  >
                    <span className="flex items-center gap-2 font-semibold text-gray-900">
                      <Award className="h-5 w-5 text-amber-500" aria-hidden />
                      {m.badge ?? m.title}
                    </span>
                    <span className="text-sm text-gray-500">{m.day}-day milestone</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="mgk-section-tight">
        <div className="mgk-container">
          <div className="mx-auto max-w-3xl rounded-md bg-blue-50 p-6">
            <h2 className="mb-2 text-lg font-bold text-gray-900">How streaks work</h2>
            <ul className="mt-4 space-y-3 text-gray-800">
              {[
                "Type one lesson OR play one game each day",
                "Miss a day? Use a streak freeze to keep going (you have 2 to start)",
                "Hit milestones at 3, 7, 14, 30, 60, and 100 days",
                "Earn eco points and badges as you go",
              ].map((line) => (
                <li key={line} className="flex gap-2 text-sm font-medium leading-relaxed">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
