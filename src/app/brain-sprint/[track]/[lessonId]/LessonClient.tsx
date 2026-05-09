"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import type { BrainSprintLesson } from "@/lib/brain-sprint/types";

type GameState = "ready" | "playing" | "feedback" | "finished";
type FeedbackType = "correct" | "wrong" | null;

function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase();
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

  const finishLesson = () => {
    setGameState("finished");
    setFeedbackType(null);
    setIsLessonComplete(true);
  };

  const resetToReady = () => {
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
      console.log("[BrainSprint] ding (placeholder)");
    } else {
      setStreak(0);
      setWrongCount((n) => n + 1);
      setFeedbackType("wrong");
      console.log("[BrainSprint] buzz (placeholder)");
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
    }, 800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, currentQuestionIndex]);

  return (
    <div
      style={{
        backgroundColor: "#FAFAF7",
        backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        minHeight: "100vh",
      }}
    >
      {gameState === "ready" && (
        <div className="mgk-container flex min-h-[calc(100vh-64px)] items-center justify-center py-12">
          <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
            <div className="text-xs font-bold tracking-wider text-[#52B788] uppercase">BRAIN SPRINT</div>
            <h1 className="mt-2 text-3xl font-extrabold text-[#1B4332]">Ready to start?</h1>
            <p className="mt-2 text-sm font-semibold text-[#4A6355]">
              {totalQuestions} questions · Type the answer · Press Enter to submit
            </p>

            <div className="mt-6 flex items-center justify-between rounded-xl bg-[#E8F5EE] p-4">
              <div>
                <div className="text-sm font-extrabold text-[#1B4332]">Use 60-second timer?</div>
                <div className="text-xs font-bold text-[#4A6355]">Optional speed bonus included</div>
              </div>
              <button
                type="button"
                onClick={() => setTimerEnabled((v) => !v)}
                className={clsx(
                  "relative h-9 w-16 rounded-full transition",
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
              className="mt-7 w-full rounded-full bg-gradient-to-r from-[#52B788] to-[#40916C] py-3.5 text-lg font-extrabold text-white shadow-md transition hover:scale-[1.02] hover:shadow-xl"
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

      {gameState === "playing" && (
        <div className="pb-10">
          <div className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur">
            <div className="mgk-container flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold text-[#1B4332]">{lesson.title}</div>
                <div className="text-xs font-bold text-[#4A6355]">
                  Question {currentQuestionIndex + 1} / {totalQuestions}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {timerEnabled && (
                  <div
                    className={clsx(
                      "text-sm font-black tabular-nums",
                      timeRemaining < 10 ? "text-red-600" : "text-[#1B4332]"
                    )}
                    aria-label="Timer"
                  >
                    {formatTime(timeRemaining)}
                  </div>
                )}
                <div className="text-sm font-extrabold text-[#1B4332]">
                  Score: {score} <span className="opacity-40">·</span> Streak: 🔥{streak}
                </div>
              </div>
            </div>
          </div>

          <div className="mgk-container pt-10">
            <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5 transition">
              <div className="text-center font-mono text-5xl font-black text-[#1B4332]">
                {currentQuestion?.question ?? ""}
              </div>

              <div className="mt-8">
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
                  inputMode="numeric"
                  autoFocus
                  className="w-full border-b-4 border-[#52B788] bg-transparent px-2 py-4 text-center text-3xl font-black text-[#1B4332] outline-none placeholder:text-gray-300"
                  placeholder="Type your answer"
                  aria-label="Answer input"
                />
                <div className="mt-2 text-center text-xs font-bold text-[#4A6355]">
                  Press Enter to submit
                </div>
              </div>
            </div>

            <div className="mx-auto mt-8 flex max-w-2xl gap-1.5">
              {Array.from({ length: totalQuestions }).map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "h-2 flex-1 rounded-full transition",
                    i < answeredCount ? "bg-[#52B788]" : "bg-gray-200"
                  )}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {gameState === "feedback" && (
        <div
          className={clsx(
            "fixed inset-0 z-[60] flex items-center justify-center text-center transition",
            feedbackType === "correct" ? "bg-green-600" : "bg-red-600"
          )}
        >
          <div className="px-6">
            <div className="text-5xl font-black text-white">
              {feedbackType === "correct" ? "✓ Correct!" : "✗ Wrong"}
            </div>
            {feedbackType === "wrong" && (
              <div className="mt-4 text-xl font-extrabold text-white/95">
                The answer was:{" "}
                <span className="font-black">
                  {currentQuestion?.answer ?? ""}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === "finished" && (
        <div className="mgk-container flex items-center justify-center py-12">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
            <div className="text-xs font-bold tracking-wider text-[#52B788] uppercase">BRAIN SPRINT</div>
            <h1 className="mt-2 text-4xl font-black text-[#1B4332]">Lesson Complete!</h1>
            {isLessonComplete ? (
              <p className="mt-2 text-sm font-semibold text-[#4A6355]">
                Nice work — your stats are ready.
              </p>
            ) : null}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#E8F5EE] p-5">
                <div className="text-xs font-bold tracking-wider text-[#52B788] uppercase">Final score</div>
                <div className="mt-1 text-4xl font-black text-[#1B4332]">{score}</div>
              </div>
              <div className="rounded-2xl bg-[#E3F2FD] p-5">
                <div className="text-xs font-bold tracking-wider text-blue-600 uppercase">Accuracy</div>
                <div className="mt-1 text-4xl font-black text-[#1B4332]">{accuracyPct}%</div>
              </div>
              <div className="rounded-2xl bg-[#FFF8E1] p-5">
                <div className="text-xs font-bold tracking-wider text-amber-600 uppercase">Correct</div>
                <div className="mt-1 text-2xl font-black text-[#1B4332]">
                  {correctCount} / {totalQuestions}
                </div>
                <div className="mt-1 text-sm font-bold text-[#4A6355]">Wrong: {wrongCount}</div>
              </div>
              <div className="rounded-2xl bg-[#F1F5F9] p-5">
                <div className="text-xs font-bold tracking-wider text-slate-600 uppercase">Best streak</div>
                <div className="mt-1 text-2xl font-black text-[#1B4332]">🔥 {bestStreak}</div>
                <div className="mt-3 text-sm font-extrabold text-[#1B4332]">
                  Stars earned:{" "}
                  <span className="text-amber-600">{starsEarned} / 3</span>
                </div>
                <div className="mt-1 text-sm font-bold text-[#4A6355]">
                  Eco-points earned: <span className="font-black text-[#1B4332]">{ecoPointsEarned}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={resetToReady}
                className="flex-1 rounded-full bg-gradient-to-r from-[#52B788] to-[#40916C] py-3 text-base font-extrabold text-white shadow-md transition hover:scale-[1.02] hover:shadow-xl"
              >
                Play Again
              </button>
              <Link
                href={`/brain-sprint/${lesson.track}`}
                className="flex-1 rounded-full border-2 border-[#1B4332] py-3 text-center text-base font-extrabold text-[#1B4332] transition hover:bg-[#1B4332] hover:text-white"
                style={{ textDecoration: "none" }}
              >
                Back to {lesson.track === "math" ? "Math Mastery" : "Eco Genius"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

