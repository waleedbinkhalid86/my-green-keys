"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { BrainSprintLesson } from "@/lib/brain-sprint/types";
import { saveLessonResult } from "@/lib/brain-sprint/progress-api";
import { triggerAutoTrack } from "@/lib/quests/auto-track";
import { playSound } from "@/lib/sounds/play-sound";

type GameState = "ready" | "playing" | "feedback" | "finished";
type FeedbackType = "correct" | "wrong" | null;
type ProgressSaveState = "idle" | "saving" | "ok" | "err";

function normalizeAnswer(s: string): string {
  const v = s.trim().toLowerCase();
  if (v === "true") return "t";
  if (v === "false") return "f";
  return v;
}

function formatTime(s: number): string {
  const sec = Math.max(0, Math.floor(s));
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function starsForAccuracy(accPct: number): number {
  if (accPct >= 90) return 3;
  if (accPct >= 70) return 2;
  if (accPct >= 50) return 1;
  return 0;
}

function renderQuestion(text: string) {
  // Detect multi-choice: must have at least " a)" and " b)" in the text
  const isMC = /\sa\)/i.test(text) && /\sb\)/i.test(text);

  if (!isMC) {
    return (
      <div className="text-5xl md:text-6xl font-bold text-[#1B4332] text-center leading-tight">
        {text}
      </div>
    );
  }

  // Split into header + options
  // Pattern: "Header text: a) optA b) optB c) optC"
  const match = text.match(/^(.*?)\s*a\)\s*(.*?)(?:\s+b\)\s*(.*?))?(?:\s+c\)\s*(.*?))?$/i);

  if (!match) {
    return (
      <div className="text-5xl md:text-6xl font-bold text-[#1B4332] text-center leading-tight">
        {text}
      </div>
    );
  }

  const [, header, optA, optB, optC] = match;

  return (
    <div>
      <div className="text-4xl md:text-5xl font-bold text-[#1B4332] mb-8 text-center leading-tight">
        {header.trim().replace(/:$/, "")}
      </div>
      <div className="flex flex-col gap-3 max-w-md mx-auto">
        <div className="text-2xl font-semibold text-[#1B4332] bg-white/60 backdrop-blur rounded-xl px-6 py-3 border border-white/80 flex items-center">
          <span className="text-[#52B788] font-bold mr-3 text-3xl">a)</span>
          <span>{optA?.trim()}</span>
        </div>
        {optB && (
          <div className="text-2xl font-semibold text-[#1B4332] bg-white/60 backdrop-blur rounded-xl px-6 py-3 border border-white/80 flex items-center">
            <span className="text-[#52B788] font-bold mr-3 text-3xl">b)</span>
            <span>{optB.trim()}</span>
          </div>
        )}
        {optC && (
          <div className="text-2xl font-semibold text-[#1B4332] bg-white/60 backdrop-blur rounded-xl px-6 py-3 border border-white/80 flex items-center">
            <span className="text-[#52B788] font-bold mr-3 text-3xl">c)</span>
            <span>{optC.trim()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LessonClient({ lesson }: { lesson: BrainSprintLesson }) {
  const totalQuestions = lesson.questions.length;

  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [bestStreak, setBestStreak] = useState(0);
  const [progressSave, setProgressSave] = useState<ProgressSaveState>("idle");
  const finishRunIdRef = useRef(0);
  const lastPersistedFinishRunIdRef = useRef(-1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const questionStartAtRef = useRef<number>(0);

  const currentQuestion = lesson.questions[currentQuestionIndex] ?? null;
  const answeredCount = useMemo(() => {
    if (gameState === "finished") return totalQuestions;
    if (gameState === "feedback") return Math.min(totalQuestions, currentQuestionIndex + 1);
    return Math.min(totalQuestions, currentQuestionIndex);
  }, [currentQuestionIndex, gameState, totalQuestions]);

  const accuracyPct = useMemo(() => {
    if (totalQuestions <= 0) return 0;
    return Math.round((correctCount / totalQuestions) * 100);
  }, [correctCount, totalQuestions]);

  const starsEarned = useMemo(() => starsForAccuracy(accuracyPct), [accuracyPct]);
  const ecoPointsEarned = useMemo(() => 5 + correctCount, [correctCount]);

  const glassCardStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    borderRadius: "32px",
    padding: "60px 48px",
    boxShadow: "0 20px 60px rgba(27, 67, 50, 0.15)",
  };

  const hudPillStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    borderRadius: "9999px",
    padding: "12px 24px",
  };

  const finishLesson = () => {
    finishRunIdRef.current += 1;
    setGameState("finished");
    setFeedbackType(null);
    setIsLessonComplete(true);
  };

  const resetToReady = () => {
    setProgressSave("idle");
    setTimeRemaining(60);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setFeedbackType(null);
    setIsLessonComplete(false);
    setBestStreak(0);
    setGameState("ready");
    questionStartAtRef.current = 0;
  };

  const startLesson = () => {
    setProgressSave("idle");
    setTimeRemaining(60);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setFeedbackType(null);
    setIsLessonComplete(false);
    setBestStreak(0);
    setGameState("playing");
    questionStartAtRef.current = Date.now();
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const advanceAfterFeedback = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= totalQuestions) {
      finishLesson();
      return;
    }
    setCurrentQuestionIndex(nextIndex);
    setUserAnswer("");
    setFeedbackType(null);
    setGameState("playing");
    questionStartAtRef.current = Date.now();
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSubmit = () => {
    if (gameState !== "playing") return;
    if (!currentQuestion) return;

    const startedAt = questionStartAtRef.current || Date.now();
    const secondsSpent = (Date.now() - startedAt) / 1000;

    const isCorrect =
      normalizeAnswer(userAnswer) === normalizeAnswer(currentQuestion.answer);

    if (isCorrect) {
      const nextStreak = streak + 1;
      const base = 10 + streak * 2;
      const speedBonus = timerEnabled && secondsSpent < 3 ? 5 : 0;
      setScore((s) => s + base + speedBonus);
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
      setCorrectCount((n) => n + 1);
      setFeedbackType("correct");
      playSound("correct");
    } else {
      setStreak(0);
      setWrongCount((n) => n + 1);
      setFeedbackType("wrong");
      playSound("wrong");
    }

    setGameState("feedback");
  };

  useEffect(() => {
    if (gameState !== "playing" || !timerEnabled) return;
    const id = window.setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [gameState, timerEnabled]);

  useEffect(() => {
    if (!timerEnabled) return;
    if (gameState !== "playing") return;
    if (timeRemaining > 0) return;
    finishLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, timerEnabled, gameState]);

  useEffect(() => {
    if (gameState !== "feedback") return;
    const t = window.setTimeout(() => {
      advanceAfterFeedback();
    }, 1500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, currentQuestionIndex]);

  useEffect(() => {
    if (gameState !== "finished") return;

    const runId = finishRunIdRef.current;
    if (lastPersistedFinishRunIdRef.current === runId) return;
    lastPersistedFinishRunIdRef.current = runId;

    const accuracy =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const stars = starsForAccuracy(
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0,
    );
    const ecoPoints = 5 + correctCount;

    let cancelled = false;
    setProgressSave("saving");
    saveLessonResult({
      lesson_id: lesson.id,
      track: lesson.track,
      score,
      stars,
      accuracy,
      best_streak: bestStreak,
      eco_points: ecoPoints,
    })
      .then(async () => {
        if (!cancelled && finishRunIdRef.current === runId) {
          setProgressSave("ok");
          const activity =
            lesson.track === "math" ? "brain_sprint_math" : "brain_sprint_eco";
          await triggerAutoTrack(activity);
        }
      })
      .catch((err) => {
        console.error("Save failed:", err);
        if (!cancelled && finishRunIdRef.current === runId) setProgressSave("err");
      });

    return () => {
      cancelled = true;
    };
  }, [
    gameState,
    lesson.id,
    lesson.track,
    score,
    bestStreak,
    correctCount,
    totalQuestions,
  ]);

  const progressPct = useMemo(() => {
    if (totalQuestions <= 0) return 0;
    const clamped = Math.min(totalQuestions, Math.max(1, currentQuestionIndex + 1));
    return Math.round((clamped / totalQuestions) * 100);
  }, [currentQuestionIndex, totalQuestions]);

  return (
    <div
      style={{
        backgroundColor: "#FAFAF7",
        backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        minHeight: "100vh",
        fontFamily: "Poppins, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {gameState === "ready" && (
        <div className="mgk-container flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-3xl" style={glassCardStyle}>
            <div className="text-xs font-bold tracking-wider text-[#52B788] uppercase">BRAIN SPRINT</div>
            <h1 className="mt-3 text-6xl font-bold text-[#1B4332]">Ready to start?</h1>
            <p className="mt-4 text-base font-semibold text-[#4A6355]">
              {totalQuestions} questions · Type the answer · Press Enter to submit
            </p>

            <div className="mt-10 flex items-center justify-between rounded-2xl bg-white/50 p-6 ring-1 ring-white/40">
              <div>
                <div className="text-sm font-extrabold text-[#1B4332]">Use 60-second timer?</div>
                <div className="mt-1 text-xs font-bold text-[#4A6355]">Optional speed bonus included</div>
              </div>
              <button
                type="button"
                onClick={() => setTimerEnabled((v) => !v)}
                className={clsx(
                  "relative h-10 w-18 rounded-full transition",
                  timerEnabled ? "bg-[#52B788]" : "bg-gray-300"
                )}
                aria-pressed={timerEnabled}
              >
                <span
                  className={clsx(
                    "absolute top-1 h-7 w-7 rounded-full bg-white shadow transition",
                    timerEnabled ? "left-8" : "left-1"
                  )}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={startLesson}
              className="mt-10 w-full rounded-full bg-gradient-to-r from-[#52B788] to-[#40916C] py-5 text-2xl font-extrabold text-white shadow-md transition hover:scale-[1.02] hover:shadow-xl"
            >
              Start Lesson
            </button>

            <div className="mt-4 text-center">
              <Link href={`/brain-sprint/${lesson.track}`} className="text-sm font-extrabold text-[#1B4332] hover:underline">
                ← Back to {lesson.track === "math" ? "Math Mastery" : "Eco Genius"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {(gameState === "playing" || gameState === "feedback") && (
        <div className="pb-10">
          <div className="mx-auto mt-6 mb-12 flex max-w-3xl items-center justify-between gap-6 px-4" style={hudPillStyle}>
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider text-[#4A6355]">LESSON</div>
              <div className="truncate text-lg font-bold text-[#1B4332]">{lesson.title}</div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-wider text-[#4A6355]">QUESTION</div>
                <div className="text-lg font-bold text-[#1B4332]">
                  {currentQuestionIndex + 1}/{totalQuestions}
                </div>
              </div>

              {timerEnabled && (
                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#4A6355]">TIMER</div>
                  <div className={clsx("text-lg font-bold tabular-nums", timeRemaining < 10 ? "text-red-600" : "text-[#1B4332]")}>
                    ⏱ {formatTime(timeRemaining)}
                  </div>
                </div>
              )}

              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-wider text-[#4A6355]">SCORE</div>
                <div className="text-lg font-bold text-[#1B4332]">{score}</div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-wider text-[#4A6355]">STREAK</div>
                <div className="text-lg font-bold text-[#1B4332]">🔥 {streak}</div>
              </div>
            </div>
          </div>

          <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
            <div className="w-full max-w-3xl">
              <div style={glassCardStyle}>
                <div className="mb-12">
                  {currentQuestion ? renderQuestion(currentQuestion.question) : null}
                </div>

                {gameState === "playing" && (
                  <div>
                    <input
                      ref={inputRef}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      inputMode={lesson.track === "math" ? "numeric" : "text"}
                      autoFocus
                      className="w-full border-0 border-b-4 border-b-[#52B788] focus:border-b-[#1B4332] bg-transparent px-2 py-4 text-center text-5xl font-semibold text-[#1B4332] outline-none placeholder:text-[#4A6355]/50"
                      placeholder="Type answer & press Enter"
                      aria-label="Answer input"
                    />
                  </div>
                )}

                {gameState === "feedback" && feedbackType === "correct" && (
                  <div className="mt-6 rounded-2xl border-2 border-[#52B788] bg-[#E8F5EE] p-6">
                    <div className="flex items-center gap-5">
                      <CheckCircle2 className="h-16 w-16 text-[#52B788]" aria-hidden />
                      <div>
                        <div className="text-2xl font-bold text-[#1B4332]">Correct!</div>
                        <div className="mt-1 text-sm font-semibold text-[#52B788]">+10 points</div>
                      </div>
                    </div>
                  </div>
                )}

                {gameState === "feedback" && feedbackType === "wrong" && (
                  <div className="mt-6 rounded-2xl border-2 border-[#EF4444] bg-[#FEE2E2] p-6">
                    <div className="flex items-center gap-5">
                      <XCircle className="h-16 w-16 text-[#EF4444]" aria-hidden />
                      <div className="min-w-0">
                        <div className="text-2xl font-bold text-[#991B1B]">Not quite!</div>
                        <div className="mt-2 text-lg font-semibold text-[#1B2D23]">
                          The correct answer is:{" "}
                          <span className="font-bold">{currentQuestion?.answer ?? ""}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-12">
                  <div className="w-full h-2 bg-white/40 rounded-full">
                    <div
                      className="h-2 bg-[#52B788] rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                      aria-hidden
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === "finished" && (
        <div className="mgk-container flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-3xl" style={glassCardStyle}>
            <div className="text-xs font-bold tracking-wider text-[#52B788] uppercase">BRAIN SPRINT</div>
            <h1 className="mt-3 text-6xl font-bold text-[#1B4332]">🎉 Lesson Complete!</h1>

            {progressSave === "saving" ? (
              <div className="mt-10 flex flex-col items-center justify-center gap-4 py-8">
                <Loader2 className="h-12 w-12 animate-spin text-[#52B788]" aria-hidden />
                <p className="text-base font-semibold text-[#4A6355]">Saving progress…</p>
              </div>
            ) : (
              <>
                {isLessonComplete ? (
                  <p className="mt-4 text-base font-semibold text-[#4A6355]">
                    Nice work — your stats are ready.
                  </p>
                ) : null}

                {progressSave === "err" ? (
                  <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
                    Couldn&apos;t save progress. Your results are shown below — try again later or check your connection.
                  </p>
                ) : null}

                <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/45 p-5 ring-1 ring-white/40">
                    <div className="text-xs font-bold tracking-wider text-[#4A6355] uppercase">Score</div>
                    <div className="mt-2 text-4xl font-bold text-[#1B4332]">{score}</div>
                  </div>
                  <div className="rounded-2xl bg-white/45 p-5 ring-1 ring-white/40">
                    <div className="text-xs font-bold tracking-wider text-[#4A6355] uppercase">Accuracy</div>
                    <div className="mt-2 text-4xl font-bold text-[#1B4332]">{accuracyPct}%</div>
                  </div>
                  <div className="rounded-2xl bg-white/45 p-5 ring-1 ring-white/40">
                    <div className="text-xs font-bold tracking-wider text-[#4A6355] uppercase">Stars</div>
                    <div className="mt-2 text-4xl font-bold text-[#1B4332]">{starsEarned} / 3</div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetToReady}
                    className="flex-1 rounded-full bg-gradient-to-r from-[#52B788] to-[#40916C] py-4 text-lg font-extrabold text-white shadow-md transition hover:scale-[1.02] hover:shadow-xl"
                  >
                    Play Again
                  </button>
                  <Link
                    href={`/brain-sprint/${lesson.track}`}
                    className="flex-1 rounded-full border-2 border-[#1B4332] py-4 text-center text-lg font-extrabold text-[#1B4332] transition hover:bg-[#1B4332] hover:text-white"
                    style={{ textDecoration: "none" }}
                  >
                    Back to {lesson.track === "math" ? "Math Mastery" : "Eco Genius"}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

