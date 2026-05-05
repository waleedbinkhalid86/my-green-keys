"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Lock, Play, Star } from "lucide-react";
import clsx from "clsx";
import { lessons } from "@/data/lessons";
import { createClient } from "@/lib/supabase/client";

import type { Lesson } from "@/data/lessons";

type ProgressRow = {
  lesson_id: number;
  completed?: boolean | null;
  stars?: number | null;
  wpm?: number | null;
  accuracy?: number | string | null;
};

const phaseInfo = {
  1: {
    name: "Home Row",
    subtitle: "Where every typist begins",
    range: "1–20",
    image: "/images/lessons/lesson-phase-1.jpg",
  },
  2: {
    name: "Top Row",
    subtitle: "Reaching up the keyboard",
    range: "21–45",
    image: "/images/lessons/lesson-phase-2.jpg",
  },
  3: {
    name: "Bottom Row",
    subtitle: "Mastering the lower keys",
    range: "46–65",
    image: "/images/lessons/lesson-phase-3.jpg",
  },
  4: {
    name: "Numbers",
    subtitle: "Digits and number row",
    range: "66–70",
    image: "/images/lessons/lesson-phase-4.jpg",
  },
  5: {
    name: "Capitals + Shift",
    subtitle: "Uppercase mastery",
    range: "71–85",
    image: "/images/lessons/lesson-phase-5.jpg",
  },
  6: {
    name: "Speed Drills",
    subtitle: "Becoming a champion",
    range: "86–100",
    image: "/images/lessons/lesson-phase-6.jpg",
  },
} as const;

function parsePhaseParam(raw: string | string[] | undefined): number | null {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s || typeof s !== "string") return null;
  const m = /^phase-(\d+)$/.exec(s);
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1 || n > 6) return null;
  return n;
}

/** Fallback if `phase` on lessons ever changed; matches curriculum bands. */
function phaseFromLessonId(id: number): number {
  if (id <= 20) return 1;
  if (id <= 45) return 2;
  if (id <= 65) return 3;
  if (id <= 70) return 4;
  if (id <= 85) return 5;
  return 6;
}

function lessonsForPhase(phaseNum: number): Lesson[] {
  return lessons.filter((l) => (l.phase ?? phaseFromLessonId(l.id)) === phaseNum);
}

function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

type CardState = "completed" | "locked" | "in_progress" | "current" | "open";

function getCardState(args: {
  lessonId: number;
  currentLessonId: number;
  row: ProgressRow | undefined;
}): CardState {
  const { lessonId, currentLessonId, row } = args;
  const completed = Boolean(row?.completed);
  if (completed) return "completed";
  if (lessonId > currentLessonId) return "locked";
  if (row && row.completed === false) return "in_progress";
  if (lessonId === currentLessonId) return "current";
  return "open";
}

export default function LessonPhaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const phaseNum = parsePhaseParam(params?.phase);

  const phaseLessons = useMemo(
    () => (phaseNum != null ? lessonsForPhase(phaseNum) : []),
    [phaseNum]
  );
  const meta =
    phaseNum != null ? phaseInfo[phaseNum as keyof typeof phaseInfo] : phaseInfo[1];
  const lessonIdsInPhase = useMemo(
    () => phaseLessons.map((l) => l.id).sort((a, b) => a - b),
    [phaseLessons]
  );
  const rangeLabel = useMemo(() => {
    if (lessonIdsInPhase.length === 0) return meta.range;
    const lo = lessonIdsInPhase[0]!;
    const hi = lessonIdsInPhase[lessonIdsInPhase.length - 1]!;
    return `${lo}–${hi}`;
  }, [lessonIdsInPhase, meta.range]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentLessonId, setCurrentLessonId] = useState(1);
  const [progressByLesson, setProgressByLesson] = useState<Map<number, ProgressRow>>(new Map());

  const [completedInPhase, setCompletedInPhase] = useState(0);
  const [avgWpm, setAvgWpm] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(0);

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (toast === null) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (phaseNum == null) {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const supabase = createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) {
          setError("You must be logged in to view phase progress.");
          setProgressByLesson(new Map());
          setCurrentLessonId(1);
          setCompletedInPhase(0);
          setAvgWpm(0);
          setAvgAccuracy(0);
          return;
        }

        let rows: ProgressRow[] = [];
        const attempt = await supabase
          .from("student_progress")
          .select("lesson_id, completed, stars, wpm, accuracy")
          .eq("student_id", userData.user.id);

        if (attempt.error) {
          const fallback = await supabase
            .from("student_progress")
            .select("lesson_id, completed, stars")
            .eq("student_id", userData.user.id);
          if (fallback.error) throw fallback.error;
          rows = (fallback.data as unknown as ProgressRow[] | null) ?? [];
        } else {
          rows = (attempt.data as unknown as ProgressRow[] | null) ?? [];
        }

        const map = new Map<number, ProgressRow>();
        for (const r of rows) {
          map.set(Number(r.lesson_id), r);
        }
        setProgressByLesson(map);

        let firstIncomplete = 101;
        for (let i = 1; i <= 100; i++) {
          const pr = map.get(i);
          if (!pr?.completed) {
            firstIncomplete = i;
            break;
          }
        }
        if (firstIncomplete === 101) firstIncomplete = 100;
        setCurrentLessonId(firstIncomplete);

        const inPhase = lessonIdsInPhase;
        const setIds = new Set(inPhase);
        let done = 0;
        let wpmSum = 0;
        let wpmN = 0;
        let accSum = 0;
        let accN = 0;
        for (const id of inPhase) {
          const pr = map.get(id);
          if (pr?.completed) {
            done += 1;
            wpmSum += num(pr.wpm);
            wpmN += 1;
            accSum += num(pr.accuracy);
            accN += 1;
          }
        }
        setCompletedInPhase(done);
        setAvgWpm(wpmN ? Math.round(wpmSum / wpmN) : 0);
        setAvgAccuracy(accN ? Math.round(accSum / accN) : 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load progress.");
        setProgressByLesson(new Map());
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [lessonIdsInPhase, phaseNum]);

  const totalInPhase = phaseLessons.length;

  const handleLessonClick = (lessonId: number, state: CardState) => {
    if (state === "locked") {
      setToast("Complete previous lessons first");
      return;
    }
    router.push(`/lesson?lesson=${lessonId}`);
  };

  if (phaseNum === null) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100 font-sans">
      <section className="relative h-64 w-full md:h-80">
        <Image
          src={meta.image}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-0 flex items-end">
          <div className="mgk-container pb-8">
            <Link
              href="/lesson-map"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to Lesson Map
            </Link>
            <p className="text-sm font-semibold text-green-300">Phase {phaseNum}</p>
            <h1 className="text-4xl font-bold text-white md:text-5xl">{meta.name}</h1>
            <p className="mt-1 text-base text-white/80">{meta.subtitle}</p>
            <p className="mt-2 text-sm text-white/70">Lessons {rangeLabel}</p>
          </div>
        </div>
      </section>

      <div className="mgk-container relative z-10 -mt-8">
        <div className="mgk-card p-6">
          {error ? (
            <p className="text-center font-bold text-red-600">{error}</p>
          ) : loading ? (
            <p className="text-center font-bold text-gray-600">Loading progress...</p>
          ) : (
            <div className="mgk-grid grid-cols-3 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {completedInPhase} / {totalInPhase || "0"}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{avgWpm} WPM</div>
                <div className="text-sm text-gray-500">Avg Speed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{avgAccuracy}%</div>
                <div className="text-sm text-gray-500">Accuracy</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="mgk-section">
        <div className="mgk-container">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">All Lessons</h2>

          {phaseLessons.length === 0 ? (
            <p className="text-center font-semibold text-gray-600">Lessons coming soon for this phase</p>
          ) : (
            <div className="mgk-grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {phaseLessons.map((lesson) => {
                const row = progressByLesson.get(lesson.id);
                const state = getCardState({
                  lessonId: lesson.id,
                  currentLessonId,
                  row,
                });
                const starsEarned = Math.min(3, Math.max(0, Math.round(num(row?.stars))));

                const baseCard =
                  "rounded-lg border border-black/5 bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-lg";
                const interactive = state !== "locked";

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    disabled={state === "locked"}
                    onClick={() => handleLessonClick(lesson.id, state)}
                    className={clsx(
                      baseCard,
                      interactive && "cursor-pointer hover:border-[#2ECC71]",
                      state === "completed" && "border-green-200 bg-green-50/30",
                      state === "current" &&
                        "border-[#2ECC71] ring-2 ring-[#2ECC71]/30 shadow-[0_0_0_1px_rgba(46,204,113,0.2)]",
                      state === "locked" && "cursor-not-allowed opacity-50 hover:border-black/5 hover:shadow-none"
                    )}
                  >
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                      {lesson.id}
                    </div>
                    <div className="mb-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-gray-900">
                      {lesson.title}
                    </div>

                    <div className="flex min-h-[28px] items-center justify-center gap-1 text-xs font-semibold">
                      {state === "completed" && (
                        <div className="flex items-center justify-center gap-0.5">
                          {[0, 1, 2].map((i) => (
                            <Star
                              key={i}
                              className={clsx(
                                "h-4 w-4",
                                i < starsEarned ? "fill-[#2ECC71] text-[#2ECC71]" : "text-gray-200"
                              )}
                              aria-hidden
                            />
                          ))}
                        </div>
                      )}
                      {state === "in_progress" && (
                        <span className="flex items-center gap-1.5 text-amber-700">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                          </span>
                          In progress
                        </span>
                      )}
                      {state === "current" && (
                        <span className="flex items-center gap-1.5 text-[#2ECC71]">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2ECC71] opacity-40" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2ECC71]" />
                          </span>
                          <Play className="h-3.5 w-3.5" aria-hidden />
                          Start now
                        </span>
                      )}
                      {state === "locked" && (
                        <span className="text-gray-400">
                          <Lock className="mx-auto h-4 w-4" aria-hidden />
                          <span className="sr-only">Locked</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
