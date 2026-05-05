"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Check, Lock, Star } from "lucide-react";
import clsx from "clsx";
import { lessons } from "@/data/lessons";
import { createClient } from "@/lib/supabase/client";
import { CERTIFICATES, formatDate } from "@/lib/certificates";

type ProgressRow = {
  lesson_id: number;
  completed?: boolean | null;
  stars?: number | null;
  eco_points?: number | null;
};

type CertificateRow = {
  id: string;
  certificate_type: string | null;
  lessons_completed: number | null;
  wpm: number | null;
  accuracy: number | null;
  eco_points: number | null;
  earned_at: string | null;
};

type PhaseBook = {
  id: number;
  title: string;
  tagline: string;
  start: number;
  end: number;
};

const PHASE_BOOK_META = [
  { id: 1, title: "Home Row", tagline: "Where every typist begins" },
  { id: 2, title: "Top Row", tagline: "Reaching up the keyboard" },
  { id: 3, title: "Bottom Row", tagline: "Mastering the lower keys" },
  { id: 4, title: "Numbers", tagline: "Digits and number row" },
  { id: 5, title: "Capitals + Shift", tagline: "Uppercase mastery" },
  { id: 6, title: "Speed Drills", tagline: "Becoming a champion" },
] as const;

function buildPhaseBooks(): PhaseBook[] {
  return PHASE_BOOK_META.map((meta) => {
    const inPhase = lessons.filter((l) => l.phase === meta.id);
    const ids = inPhase.map((l) => l.id);
    const start = Math.min(...ids);
    const end = Math.max(...ids);
    return { ...meta, start, end };
  });
}

const PHASE_BOOKS = buildPhaseBooks();

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function isPhaseLocked(start: number, completedSet: Set<number>): boolean {
  if (start <= 1) return false;
  for (let i = 1; i < start; i++) {
    if (!completedSet.has(i)) return true;
  }
  return false;
}

function countCompletedInRange(start: number, end: number, completedSet: Set<number>): number {
  let n = 0;
  for (let i = start; i <= end; i++) {
    if (completedSet.has(i)) n++;
  }
  return n;
}

function isPhaseFullyComplete(start: number, end: number, completedSet: Set<number>): boolean {
  for (let i = start; i <= end; i++) {
    if (!completedSet.has(i)) return false;
  }
  return true;
}

type PhaseVisualStatus = "locked" | "current" | "completed";

function getPhaseVisualStatus(
  start: number,
  end: number,
  completedSet: Set<number>,
  currentLessonId: number
): Exclude<PhaseVisualStatus, "locked"> {
  if (isPhaseFullyComplete(start, end, completedSet)) return "completed";
  if (currentLessonId >= start && currentLessonId <= end) return "current";
  return "completed";
}

export default function LessonMapPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  const [starsTotal, setStarsTotal] = useState(0);
  const [ecoPointsTotal, setEcoPointsTotal] = useState(0);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      setCertsLoading(true);
      try {
        const supabase = createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) {
          setError("You must be logged in to view your lesson map.");
          setCompletedSet(new Set());
          setStarsTotal(0);
          setEcoPointsTotal(0);
          setCertificates([]);
          return;
        }

        let rows: ProgressRow[] = [];
        const attempt = await supabase
          .from("student_progress")
          .select("lesson_id, completed, stars, eco_points")
          .eq("student_id", userData.user.id);

        if (attempt.error) {
          const fallback = await supabase
            .from("student_progress")
            .select("lesson_id, completed")
            .eq("student_id", userData.user.id);
          if (fallback.error) throw fallback.error;
          rows = (fallback.data as unknown as ProgressRow[] | null) ?? [];
        } else {
          rows = (attempt.data as unknown as ProgressRow[] | null) ?? [];
        }

        const done = new Set<number>();
        let stars = 0;
        let eco = 0;
        for (const r of rows) {
          if (r.completed) done.add(Number(r.lesson_id));
          stars += Number(r.stars ?? 0) || 0;
          eco += Number(r.eco_points ?? 0) || 0;
        }

        setCompletedSet(done);
        setStarsTotal(stars);
        setEcoPointsTotal(eco);

        const { data: certRows, error: certErr } = await supabase
          .from("certificates")
          .select("id, certificate_type, lessons_completed, wpm, accuracy, eco_points, earned_at")
          .eq("student_id", userData.user.id)
          .order("earned_at", { ascending: false });
        if (certErr) throw certErr;
        setCertificates((certRows as CertificateRow[] | null) ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lesson map.");
        setCertificates([]);
      } finally {
        setLoading(false);
        setCertsLoading(false);
      }
    };
    void load();
  }, []);

  const completedCount = completedSet.size;
  const currentLessonId = useMemo(() => {
    for (let i = 1; i <= 100; i++) {
      if (!completedSet.has(i)) return i;
    }
    return 100;
  }, [completedSet]);

  const progressPct = clamp((completedCount / 100) * 100, 0, 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100">
      <section className="mgk-section-tight">
        <div className="mgk-container">
          <div className="rounded-md border border-black/[0.06] bg-white/95 p-[18px] shadow-[0_10px_35px_rgba(0,0,0,0.12)] backdrop-blur-[10px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black tracking-[0.18em] text-[#2d6a4f]">LESSON MAP</div>
                <div className="mt-1 text-[28px] font-black text-[#2c3e50]">
                  You completed {completedCount}/100 lessons
                </div>
                <div className="mt-1 font-semibold text-gray-600">Current lesson: #{currentLessonId}</div>
              </div>

              <div className="flex flex-wrap items-stretch gap-3">
                <div className="min-w-[160px] rounded-md border border-green-600/25 bg-[#E8F5E9] px-3 py-2.5">
                  <div className="text-xs font-black text-[#2e7d32]">Eco points</div>
                  <div className="text-[22px] font-black text-[#1b4d30]">{ecoPointsTotal}</div>
                </div>
                <div className="min-w-[160px] rounded-md border border-yellow-200 bg-[#FFFDE7] px-3 py-2.5">
                  <div className="text-xs font-black text-[#8a6d1b]">Stars earned</div>
                  <div className="text-[22px] font-black text-[#2c3e50]">{starsTotal}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    router.push("/lesson");
                  }}
                  className="cursor-pointer rounded-md border-none bg-[#4CAF50] px-3.5 py-3 font-black text-white"
                >
                  Back to Lesson
                </button>
              </div>
            </div>

            <div className="mt-3.5 h-2.5 overflow-hidden rounded-md bg-black/[0.06]">
              <div
                className="h-full bg-gradient-to-r from-[#4CAF50] to-[#2196F3] transition-[width] duration-[400ms] ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {error && (
              <div className="mt-3 rounded-md border border-[#ef5350] bg-[#ffebee] px-3 py-2.5 font-extrabold text-[#c62828]">
                {error}
              </div>
            )}
          </div>

          <div className="mt-[18px] rounded-md border border-black/[0.06] bg-white/95 p-[18px] shadow-[0_10px_35px_rgba(0,0,0,0.12)] backdrop-blur-[10px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black tracking-[0.18em] text-[#2d6a4f]">MY CERTIFICATES</div>
                <div className="mt-1 text-[22px] font-black text-[#2c3e50]">Your achievements</div>
                <div className="mt-1 font-bold text-gray-600">
                  Earn certificates at 10, 25, 50, and 100 lessons.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  router.push("/certificate");
                }}
                className="cursor-pointer rounded-md border-none bg-[#4CAF50] px-3.5 py-3 font-black text-white"
              >
                View Latest Certificate
              </button>
            </div>

            {certsLoading ? (
              <div className="mt-3 font-extrabold text-[#2c3e50]">Loading certificates...</div>
            ) : certificates.length === 0 ? (
              <div className="mt-3 font-extrabold text-gray-600">
                No certificates yet—finish lessons to unlock your first one!
              </div>
            ) : (
              <div className="mt-3.5 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
                {certificates.map((c) => {
                  const def = CERTIFICATES.find((d) => d.type === c.certificate_type) || null;
                  return (
                    <div
                      key={c.id}
                      className="rounded-md border border-green-600/25 bg-gradient-to-br from-[#E8F5E9] from-0% via-white via-60% to-[#FFFDE7] to-100% p-4 shadow-sm transition-shadow hover:shadow-lg"
                    >
                      <div className="flex justify-between gap-2.5">
                        <div className="font-black text-[#2c3e50]">{def?.title ?? "Certificate"}</div>
                      </div>
                      <div className="mt-2 text-xs font-extrabold text-gray-600">
                        Earned: {c.earned_at ? formatDate(c.earned_at) : "—"}
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-2.5 font-black text-[#1b4d30]">
                        <span>{c.lessons_completed ?? 0} lessons</span>
                        <span aria-hidden>•</span>
                        <span>{c.wpm ?? 0} WPM</span>
                        <span aria-hidden>•</span>
                        <span>{c.accuracy ?? 0}%</span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => window.open(`/certificate?id=${encodeURIComponent(c.id)}`, "_blank")}
                          className="cursor-pointer rounded-md border-none bg-[#4CAF50] px-3 py-2.5 font-black text-white"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            window.open(`/certificate?id=${encodeURIComponent(c.id)}&print=1`, "_blank")
                          }
                          className="cursor-pointer rounded-md border border-green-600/45 bg-white px-3 py-2.5 font-black text-[#2e7d32]"
                        >
                          PDF
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mgk-section">
        <div className="mgk-container">
          <header className="mb-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Your Learning Journey</h1>
            <p className="mt-2 text-base text-gray-600">
              100 lessons across 6 phases. Master one phase at a time.
            </p>
          </header>

          {loading ? (
            <p className="text-center font-extrabold text-gray-600">Loading progress...</p>
          ) : (
            <div className="mgk-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {PHASE_BOOKS.map((p) => {
                const locked = isPhaseLocked(p.start, completedSet);
                const visualUnlocked = getPhaseVisualStatus(p.start, p.end, completedSet, currentLessonId);
                const completedInPhase = countCompletedInRange(p.start, p.end, completedSet);
                const lessonsInPhase = p.end - p.start + 1;
                const phasePct = clamp((completedInPhase / lessonsInPhase) * 100, 0, 100);
                const showProgress =
                  !locked &&
                  (completedInPhase > 0 ||
                    (currentLessonId >= p.start && currentLessonId <= p.end) ||
                    visualUnlocked === "completed");
                const rangeLabel = `Lessons ${p.start}–${p.end}`;

                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={locked}
                    onClick={() => !locked && router.push(`/lesson-map/phase-${p.id}`)}
                    className={clsx(
                      "group relative w-full text-left",
                        "aspect-[3/4] overflow-hidden rounded-md border border-black/5 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg",
                      !locked &&
                        "cursor-pointer hover:-translate-y-2 hover:rotate-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600",
                      locked && "cursor-not-allowed"
                    )}
                  >
                    <div className="absolute top-0 right-0 left-0 z-0 h-[70%]">
                      <Image
                        src={`/images/lessons/lesson-phase-${p.id}.jpg`}
                        alt={p.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                        priority={p.id <= 2}
                      />
                    </div>

                    <div
                      className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-white"
                      aria-hidden
                    />

                    <div className="absolute top-4 left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-2xl font-bold text-green-600 shadow-md backdrop-blur-sm">
                      {p.id}
                    </div>

                    <div className="absolute top-4 right-4 z-20">
                      {locked ? (
                        <span className="inline-flex rounded-full bg-gray-400 p-2 text-white shadow-md">
                          <Lock className="h-5 w-5" aria-hidden />
                          <span className="sr-only">Locked</span>
                        </span>
                      ) : visualUnlocked === "current" ? (
                        <span className="inline-flex rounded-full bg-[#FFD700] p-2 text-white shadow-md">
                          <Star className="h-5 w-5" aria-hidden />
                          <span className="sr-only">Current phase</span>
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-green-500 p-2 text-white shadow-md">
                          <Check className="h-5 w-5" aria-hidden />
                          <span className="sr-only">Completed</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute right-0 bottom-0 left-0 z-20 flex min-h-[30%] max-h-[55%] flex-col justify-center overflow-y-auto bg-white p-5">
                      <h2 className="text-xl font-bold leading-tight text-gray-900">{p.title}</h2>
                      <p className="mt-1 text-xs text-gray-500">{rangeLabel}</p>
                      <p className="mt-1 text-xs italic text-gray-500">{p.tagline}</p>
                      {showProgress && (
                        <>
                          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-md bg-gray-200">
                            <div
                              className="h-full rounded-md bg-green-500 transition-[width] duration-300"
                              style={{ width: `${phasePct}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {completedInPhase} of {lessonsInPhase} complete
                          </p>
                        </>
                      )}
                    </div>

                    {locked && (
                      <div
                        className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm"
                        aria-hidden
                      >
                        <Lock className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
