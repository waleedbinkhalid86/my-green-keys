"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Flame,
  Gamepad2,
  Leaf,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getProgress,
  getRangerProfile,
  getXpBreakdown,
  getXpHistory,
  RANKS,
  type RangerRank,
  type XpLogEntry,
} from "@/lib/rangerHelpers";
import { RankBadge, rankProgressFillClassName } from "@/components/RankBadge";
import { cn } from "@/lib/utils";

const sourceLabels: Record<string, string> = {
  lesson_complete: "Lessons",
  lesson_three_stars: "3-star bonus",
  game_falling_leaves: "Falling Leaves",
  game_sort_recycling: "Sort Recycling",
  game_save_ocean: "Save the Ocean",
  game_eco_garden: "Eco Garden",
  game_kind_world: "Kind World",
  streak_day: "Daily streak",
  streak_milestone: "Streak milestones",
  eco_photo_approved: "Eco actions",
};

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const t = d.getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const days = Math.floor(hr / 24);
  if (days < 14) return `${days} day${days === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString();
}

function iconForSource(source: string) {
  if (source.startsWith("lesson_")) return BookOpen;
  if (source.startsWith("game_")) return Gamepad2;
  if (source.startsWith("streak_")) return Flame;
  if (source.includes("eco")) return Leaf;
  return Sparkles;
}

export default function RangerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [rankId, setRankId] = useState<RangerRank>("cadet");
  const [history, setHistory] = useState<XpLogEntry[]>([]);
  const [breakdown, setBreakdown] = useState<{ source: string; total: number; count: number }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!userData.user) {
        setUserId(null);
        setLoading(false);
        return;
      }
      const uid = userData.user.id;
      setUserId(uid);

      const [profile, hist, bd] = await Promise.all([
        getRangerProfile(uid, supabase),
        getXpHistory(uid, supabase, 20),
        getXpBreakdown(uid, supabase),
      ]);

      if (!profile) {
        throw new Error("Profile not found");
      }
      setXp(profile.ranger_xp);
      setRankId(profile.ranger_rank);
      setHistory(hist);
      setBreakdown(bd);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load ranger data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!loading && userId === null && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="mgk-container mgk-section flex flex-col items-center justify-center">
          <Shield className="h-14 w-14 text-purple-500" aria-hidden />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Planet Ranger</h1>
          <p className="mt-2 max-w-md text-center text-gray-600">Sign in to see your rank, XP, and activity.</p>
          <Link
            href="/login"
            className="mt-6 rounded-md bg-purple-500 px-8 py-3 font-semibold text-white transition hover:bg-purple-600"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const progress = getProgress(xp);
  const fillClass = rankProgressFillClassName(progress.currentRank.id);
  const maxBreakdown = breakdown.length > 0 ? Math.max(...breakdown.map((b) => b.total), 1) : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <header className="bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="mgk-container mgk-section-tight">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </button>
        </div>
      </header>

      <main className="mgk-section-tight">
        <div className="mgk-container">
        {loading ? (
          <div className="space-y-8">
            <div className="mx-auto max-w-3xl animate-pulse rounded-md bg-white p-8 shadow-lg">
              <div className="mx-auto h-32 w-48 rounded-md bg-gray-100" />
              <div className="mx-auto mt-6 h-3 max-w-md rounded-md bg-gray-100" />
            </div>
            <div className="mx-auto max-w-3xl animate-pulse rounded-md bg-white p-8 shadow-lg">
              <div className="h-6 w-40 rounded bg-gray-100" />
              <div className="mt-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 rounded-md bg-gray-100" />
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md rounded-md bg-white p-8 text-center shadow-lg">
            <p className="font-semibold text-gray-900">Couldn&apos;t load ranger data</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 rounded-md bg-purple-500 px-6 py-2 font-semibold text-white hover:bg-purple-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <section className="mx-auto max-w-3xl rounded-md bg-white p-8 shadow-sm transition-shadow hover:shadow-lg">
              <RankBadge xp={xp} rank={rankId} variant="large" className="mx-auto" />
              <div className="mx-auto mt-6 w-full max-w-md">
                {progress.nextRank ? (
                  <>
                    <div className="h-3 w-full overflow-hidden rounded-md bg-gray-200">
                      <div
                        className={cn("h-full rounded-md transition-all", fillClass)}
                        style={{ width: `${progress.progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-center text-sm text-gray-500">
                      {progress.xpToNext.toLocaleString()} XP to {progress.nextRank.label}
                    </p>
                  </>
                ) : (
                  <p className="flex items-center justify-center gap-2 text-center text-sm font-semibold text-purple-600">
                    <Sparkles className="h-4 w-4" aria-hidden />
                    You&apos;ve reached the top rank!
                  </p>
                )}
              </div>
            </section>

            <section className="mx-auto mt-8 max-w-3xl rounded-md bg-white p-8 shadow-sm transition-shadow hover:shadow-lg">
              <h2 className="mb-2 text-xl font-bold text-gray-900">All ranks</h2>
              <ul className="mt-6 space-y-3">
                {RANKS.map((r) => {
                  const earned = xp >= r.xpRequired;
                  return (
                    <li
                      key={r.id}
                      className={cn(
                        "flex items-center gap-4 rounded-md border p-4",
                        earned ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50",
                      )}
                    >
                      {earned ? (
                        <Shield className="h-8 w-8 shrink-0 text-green-600" aria-hidden />
                      ) : (
                        <Lock className="h-8 w-8 shrink-0 text-gray-400" aria-hidden />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900">{r.label}</p>
                        <p className="text-sm text-gray-500">
                          {r.xpRequired.toLocaleString()} XP · {r.description}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                          earned ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600",
                        )}
                      >
                        {earned ? "Earned" : "Locked"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="mx-auto mt-8 max-w-3xl rounded-md bg-white p-8 shadow-sm transition-shadow hover:shadow-lg">
              <h2 className="mb-2 text-xl font-bold text-gray-900">Where your XP came from</h2>
              <p className="mt-1 text-sm text-gray-600">Play variety of activities to climb faster</p>
              {breakdown.length === 0 ? (
                <p className="mt-6 text-center text-gray-500">Start typing or playing to see your XP breakdown!</p>
              ) : (
                <ul className="mt-6 space-y-4">
                  {breakdown.map((row) => {
                    const pct = (row.total / maxBreakdown) * 100;
                    const label = sourceLabels[row.source] ?? row.source.replace(/_/g, " ");
                    return (
                      <li key={row.source} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <span className="w-full shrink-0 text-sm font-medium text-gray-800 sm:w-40">{label}</span>
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-md bg-gray-100">
                            <div
                              className="h-full rounded-md bg-emerald-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums text-gray-800">
                            {row.total.toLocaleString()}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="mx-auto mt-8 max-w-3xl rounded-md bg-white p-8 shadow-sm transition-shadow hover:shadow-lg">
              <h2 className="mb-2 text-xl font-bold text-gray-900">Recent activity</h2>
              {history.length === 0 ? (
                <p className="mt-6 text-center text-gray-500">
                  Your XP history will show here as you play and learn
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-gray-100">
                  {history.map((entry) => {
                    const Icon = iconForSource(entry.source);
                    const desc =
                      entry.description?.trim() ||
                      sourceLabels[entry.source] ||
                      entry.source.replace(/_/g, " ");
                    return (
                      <li key={entry.id} className="flex items-start gap-3 py-3">
                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{desc}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{formatRelativeTime(entry.created_at)}</p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-green-600 tabular-nums">
                          +{entry.xp_amount} XP
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="mx-auto mt-8 max-w-3xl rounded-md bg-purple-50 p-6">
              <h2 className="mb-2 text-lg font-bold text-gray-900">How to earn XP</h2>
              <ul className="mt-4 space-y-3 text-sm text-gray-800">
                {[
                  "Complete lessons (10 XP each, 15 with 3 stars)",
                  "Play games (5+ XP based on score)",
                  "Daily streak days (5 XP each)",
                  "Streak milestones (25 XP and up)",
                  "Get eco photos approved (30 XP each)",
                  "Variety matters — earn XP from many activities to climb fastest",
                ].map((line) => (
                  <li key={line} className="flex gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
        </div>
      </main>
    </div>
  );
}
