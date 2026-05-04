"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Flame, Heart, Lock, RefreshCw, Star } from "lucide-react";
import { kindWorldScenarios, type KindScenario } from "@/data/kindWorldScenarios";
import {
  calculateEcoPoints,
  checkAnswer,
  getRandomScenario,
} from "@/lib/kindWorldHelpers";
import { createClient } from "@/lib/supabase/client";
import { updateStreak, type StreakUpdateResult } from "@/lib/streakHelpers";
import { awardXp, calculateGameXp, XP_SOURCES, type XpAwardResult } from "@/lib/rangerHelpers";
import { MilestoneCelebration } from "@/components/MilestoneCelebration";
import { RankUpCelebration } from "@/components/RankUpCelebration";
import "@/app/globals.css";

type GameState = "intro" | "level_select" | "playing" | "game_over";

type LevelId = "seedling" | "explorer" | "guardian" | "champion";

const levelConfig = {
  seedling: {
    timeLimit: 8,
    lives: 5,
    multiplier: 1,
    label: "Seedling",
    description: "Easy — for beginners",
  },
  explorer: {
    timeLimit: 6,
    lives: 4,
    multiplier: 1.5,
    label: "Explorer",
    description: "Medium — for confident typers",
  },
  guardian: {
    timeLimit: 4,
    lives: 3,
    multiplier: 2,
    label: "Guardian",
    description: "Hard — for skilled typers",
  },
  champion: {
    timeLimit: 3,
    lives: 2,
    multiplier: 3,
    label: "Champion",
    description: "Expert — true masters only",
  },
} as const;

const LEVEL_ORDER: LevelId[] = ["seedling", "explorer", "guardian", "champion"];

const LEVEL_IMAGE_SRC: Record<LevelId, string> = {
  seedling: "/images/games/levels/level-seedling.png",
  explorer: "/images/games/levels/level-explorer.png",
  guardian: "/images/games/levels/level-guardian.png",
  champion: "/images/games/levels/level-champion.png",
};

const GAME_NAME = "kind_world";

function hasPaidPlan(planType: string | null | undefined): boolean {
  const p = (planType ?? "").toLowerCase().trim();
  if (!p) return false;
  return p === "family" || p === "school_starter" || p === "school_growth";
}

function encourageWrong(): string {
  const opts = ["Almost! Try again!", "Good try!", "Nice effort — keep going!"];
  return opts[Math.floor(Math.random() * opts.length)]!;
}

export default function KindWorldGamePage() {
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessOk, setAccessOk] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [lessonsOk, setLessonsOk] = useState(false);
  const [paidOk, setPaidOk] = useState(false);
  const [completedLessonsIn60, setCompletedLessonsIn60] = useState(0);

  const [petType, setPetType] = useState<"panda" | "turtle" | null>(null);
  const userIdRef = useRef<string | null>(null);

  const [gameState, setGameState] = useState<GameState>("intro");
  const [activeLevel, setActiveLevel] = useState<LevelId>("seedling");

  const [currentScenario, setCurrentScenario] = useState<KindScenario | null>(null);
  const [usedScenarioIds, setUsedScenarioIds] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [combo, setCombo] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [wrongBanner, setWrongBanner] = useState("");
  const [encourageLine, setEncourageLine] = useState("");

  const [flash, setFlash] = useState<"green" | "orange" | null>(null);
  const [floatPoints, setFloatPoints] = useState<{ key: number; text: string } | null>(
    null,
  );
  const [streakUpdate, setStreakUpdate] = useState<StreakUpdateResult | null>(null);
  const [xpAwarded, setXpAwarded] = useState<XpAwardResult | null>(null);

  const timeMaxRef = useRef(8);
  const timeLeftRef = useRef(8);
  const [, timerTick] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const processingRef = useRef(false);
  const gameSessionIdRef = useRef(0);
  const savedGameOverRef = useRef(false);
  const gameStateRef = useRef<GameState>("intro");
  const currentScenarioRef = useRef<KindScenario | null>(null);
  const activeLevelRef = useRef<LevelId>("seedling");

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    currentScenarioRef.current = currentScenario;
  }, [currentScenario]);

  useEffect(() => {
    activeLevelRef.current = activeLevel;
  }, [activeLevel]);

  const petHappySrc =
    petType === "turtle"
      ? "/images/pets/pet-turtle-happy.png"
      : "/images/pets/pet-panda-happy.png";

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createClient();
        const { data: userData, error: uErr } = await supabase.auth.getUser();
        if (uErr) throw uErr;
        if (!userData.user) {
          userIdRef.current = null;
          setSignedIn(false);
          setAccessOk(false);
          return;
        }

        userIdRef.current = userData.user.id;
        setSignedIn(true);

        const { data: profile } = await supabase
          .from("profiles")
          .select("pet_type")
          .eq("id", userData.user.id)
          .maybeSingle();

        const pt = (profile as { pet_type?: string } | null)?.pet_type;
        setPetType(pt === "turtle" ? "turtle" : pt === "panda" ? "panda" : null);
        const { data: progressRows, error: pErr } = await supabase
          .from("student_progress")
          .select("lesson_id")
          .eq("student_id", userData.user.id)
          .eq("completed", true)
          .gte("lesson_id", 1)
          .lte("lesson_id", 60);
        if (pErr) throw pErr;

        const uniqueIn60 = new Set(
          (progressRows ?? [])
            .map((r) => r.lesson_id)
            .filter((n): n is number => typeof n === "number"),
        );
        const n60 = uniqueIn60.size;
        setCompletedLessonsIn60(n60);
        setLessonsOk(n60 >= 60);

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("plan_type, status")
          .eq("user_id", userData.user.id)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const subStatus = ((sub as { status?: string } | null)?.status ?? "")
          .toLowerCase()
          .trim();
        const subPlan = (sub as { plan_type?: string } | null)?.plan_type ?? null;
        const active = subStatus === "active";
        const paid = active && hasPaidPlan(subPlan);
        setPaidOk(paid);

        setAccessOk(n60 >= 60 && paid);
      } catch {
        setAccessOk(false);
      } finally {
        setAccessLoading(false);
      }
    };
    void run();
  }, []);

  const bumpTimer = useCallback(() => {
    timerTick((t) => t + 1);
  }, []);

  const resetTimerForLevel = useCallback((level: LevelId) => {
    const lim = levelConfig[level].timeLimit;
    timeMaxRef.current = lim;
    timeLeftRef.current = lim;
    bumpTimer();
  }, [bumpTimer]);

  const loadNextScenarioAfterRound = useCallback(() => {
    setFeedback(null);
    setWrongBanner("");
    setEncourageLine("");
    setShowHint(false);
    setInputValue("");
    processingRef.current = false;

    setUsedScenarioIds((prev) => {
      const next = getRandomScenario(prev);
      setCurrentScenario(next);
      resetTimerForLevel(activeLevelRef.current);
      queueMicrotask(() => inputRef.current?.focus());
      return [...prev, next.id];
    });
  }, [resetTimerForLevel]);

  const goGameOver = useCallback(() => {
    setGameState("game_over");
    processingRef.current = true;
  }, []);

  const resolveWrong = useCallback(
    (banner: string) => {
      processingRef.current = true;
      setCombo(0);
      setFeedback("wrong");
      setWrongBanner(banner);
      setEncourageLine(encourageWrong());
      setShowHint(true);
      setFlash("orange");
      window.setTimeout(() => setFlash(null), 280);

      setLives((L) => {
        const nextL = Math.max(0, L - 1);
        if (nextL <= 0) {
          window.setTimeout(() => goGameOver(), 1500);
        } else {
          window.setTimeout(() => loadNextScenarioAfterRound(), 1500);
        }
        return nextL;
      });
    },
    [goGameOver, loadNextScenarioAfterRound],
  );

  const handleTimeUpRef = useRef<() => void>(() => {});

  handleTimeUpRef.current = () => {
    if (
      gameStateRef.current !== "playing" ||
      processingRef.current ||
      !currentScenarioRef.current
    ) {
      return;
    }
    processingRef.current = true;
    resolveWrong("Time's up!");
  };

  useEffect(() => {
    if (gameState !== "playing" || !currentScenario || feedback !== null) return;

    const id = window.setInterval(() => {
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 0.1);
      bumpTimer();
      if (timeLeftRef.current <= 0) {
        window.clearInterval(id);
        handleTimeUpRef.current();
      }
    }, 100);

    return () => window.clearInterval(id);
  }, [gameState, currentScenario?.id, feedback, bumpTimer]);

  const startLevel = (level: LevelId) => {
    gameSessionIdRef.current += 1;
    savedGameOverRef.current = false;
    setActiveLevel(level);
    const cfg = levelConfig[level];
    setLives(cfg.lives);
    setScore(0);
    setCombo(0);
    setUsedScenarioIds([]);
    setGameState("playing");
    const first = getRandomScenario([]);
    setUsedScenarioIds([first.id]);
    setCurrentScenario(first);
    setInputValue("");
    setShowHint(false);
    setFeedback(null);
    setWrongBanner("");
    setEncourageLine("");
    processingRef.current = false;
    timeMaxRef.current = cfg.timeLimit;
    timeLeftRef.current = cfg.timeLimit;
    bumpTimer();
    queueMicrotask(() => inputRef.current?.focus());
  };

  const submitAnswer = () => {
    if (gameState !== "playing" || !currentScenario || processingRef.current) return;
    if (timeLeftRef.current <= 0) return;
    const raw = inputValue.trim();
    if (!raw) return;

    processingRef.current = true;
    const ok = checkAnswer(raw, currentScenario);

    if (ok) {
      const nextCombo = combo + 1;
      const base = currentScenario.type === "magic_word" ? 10 : 20;
      const mult = levelConfig[activeLevel].multiplier;
      const bonus = nextCombo >= 3 ? 5 : 0;
      const delta = Math.round(base * mult + bonus);
      setCombo(nextCombo);
      setScore((s) => s + delta);
      setFeedback("correct");
      setFloatPoints({ key: Date.now(), text: `+${delta}` });
      window.setTimeout(() => setFloatPoints(null), 300);
      setFlash("green");
      window.setTimeout(() => setFlash(null), 280);

      window.setTimeout(() => {
        loadNextScenarioAfterRound();
      }, 200);
    } else {
      resolveWrong("Not quite — check the hint!");
    }
  };

  const ecoPointsEarned = calculateEcoPoints(score);

  useEffect(() => {
    if (gameState !== "game_over") return;
    const sid = gameSessionIdRef.current;
    const dedupeKey = `mgk-${GAME_NAME}-${userIdRef.current ?? "anon"}-${sid}`;

    const run = async () => {
      try {
        if (savedGameOverRef.current) return;
        const supabase = createClient();
        const { data: userData, error: uErr } = await supabase.auth.getUser();
        if (uErr) throw uErr;
        if (!userData.user) return;

        if (typeof sessionStorage !== "undefined") {
          if (sessionStorage.getItem(dedupeKey)) return;
          sessionStorage.setItem(dedupeKey, "1");
        }

        savedGameOverRef.current = true;
        const eco = ecoPointsEarned;

        await supabase.from("game_scores").insert({
          student_id: userData.user.id,
          game_name: GAME_NAME,
          score,
          eco_points_earned: eco,
        });

        const { data: row } = await supabase
          .from("profiles")
          .select("eco_points")
          .eq("id", userData.user.id)
          .single();
        const cur =
          Number((row as { eco_points?: number } | null)?.eco_points ?? 0) || 0;
        await supabase
          .from("profiles")
          .update({ eco_points: cur + eco })
          .eq("id", userData.user.id);

        // Update daily streak (game completion counts)
        if (!userData.user?.id) {
          console.warn("Cannot update streak — no authenticated user");
        } else {
          try {
            const streakResult = await updateStreak(userData.user.id, "game", supabase);
            if (streakResult) {
              setStreakUpdate(streakResult);
            }
          } catch (err) {
            console.error("Streak update failed:", err);
          }
        }

        if (userData.user?.id) {
          try {
            const xpAmount = calculateGameXp(score);
            const result = await awardXp(
              userData.user.id,
              xpAmount,
              XP_SOURCES.GAME_KIND_WORLD,
              `Kind World Academy - score ${score}`,
              supabase
            );
            if (result) setXpAwarded(result);
          } catch (err) {
            console.error("XP award failed:", err);
          }
        }

      } catch {
        if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(dedupeKey);
        savedGameOverRef.current = false;
      }
    };

    void run();
  }, [gameState, score, ecoPointsEarned]);

  const timeFraction =
    timeMaxRef.current > 0 ? timeLeftRef.current / timeMaxRef.current : 0;
  const barColorClass =
    timeFraction > 0.5
      ? "bg-[#2ECC71]"
      : timeFraction > 0.25
        ? "bg-yellow-500"
        : "bg-orange-500";

  if (accessLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center font-sans"
        style={{ background: "linear-gradient(180deg, #E8F8EF 0%, #D4EFDF 100%)" }}
      >
        <p className="text-lg font-bold text-gray-700">Loading Kind World…</p>
      </div>
    );
  }

  if (!accessOk) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6 font-sans"
        style={{ background: "linear-gradient(180deg, #E8F8EF 0%, #C8E6C9 100%)" }}
      >
        <div className="w-full max-w-md rounded-3xl bg-white p-12 text-center shadow-xl">
          <div className="mb-6 flex justify-center">
            <Lock className="h-14 w-14 text-[#2ECC71]" strokeWidth={2} aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Kind World Academy is locked</h1>
          <div className="mt-4 space-y-3 text-base font-semibold text-gray-600">
            {!signedIn && <p>Please sign in to play.</p>}
            {signedIn && !lessonsOk && (
              <p>
                Complete Lesson 60 first (you&apos;ve completed {completedLessonsIn60}{" "}
                lesson{completedLessonsIn60 === 1 ? "" : "s"})
              </p>
            )}
            {signedIn && !paidOk && (
              <p>Upgrade to Family Plan to unlock Kind World</p>
            )}
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {!signedIn ? (
              <Link
                href="/login"
                className="rounded-2xl bg-[#2ECC71] px-6 py-3 text-center text-lg font-bold text-white shadow-md transition hover:brightness-95"
              >
                Log In
              </Link>
            ) : (
              <Link
                href="/lesson-map"
                className="rounded-2xl bg-[#2ECC71] px-6 py-3 text-center text-lg font-bold text-white shadow-md transition hover:brightness-95"
              >
                Continue Lessons
              </Link>
            )}
            <Link
              href="/pricing"
              className="rounded-2xl border-2 border-[#2ECC71] bg-white px-6 py-3 text-center text-lg font-bold text-[#27AE60] shadow-sm transition hover:bg-green-50"
            >
              View Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const coverBg = (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Image
        src="/images/games/game-kind-world.jpg"
        alt=""
        fill
        className="object-cover"
        priority
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/70"
        aria-hidden
      />
    </div>
  );

  if (gameState === "intro") {
    return (
      <div className="relative min-h-screen font-sans text-white">
        {coverBg}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="text-5xl font-bold drop-shadow-lg">Kind World Academy</h1>
          <p className="mt-3 text-xl text-white/90">Where kindness becomes a superpower</p>
          <div className="mt-10 max-w-lg rounded-2xl bg-white p-6 text-left text-gray-900 shadow-xl">
            <p className="text-lg font-semibold leading-relaxed">
              Type kind words and responses to social situations. Be quick — the world needs
              your kindness!
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-base font-medium text-gray-700">
              <li>Type the right answer before time runs out</li>
              <li>Build streaks for bonus points</li>
              <li>Wrong answers cost a life</li>
              <li>Multiple correct answers may be accepted</li>
            </ul>
            <p className="mt-4 text-sm font-bold text-gray-500">
              {kindWorldScenarios.length} kindness situations to practice.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setGameState("level_select")}
            className="mt-10 rounded-full bg-[#2ECC71] px-10 py-4 text-xl font-bold text-white shadow-lg transition hover:brightness-110"
          >
            Choose Your Level
          </button>
        </div>
      </div>
    );
  }

  if (gameState === "level_select") {
    return (
      <div className="relative min-h-screen font-sans">
        {coverBg}
        <div className="relative z-10 min-h-screen px-4 py-8">
          <button
            type="button"
            onClick={() => setGameState("intro")}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-base font-bold text-gray-800 shadow-md transition hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            Back
          </button>
          <h2 className="mb-8 text-center text-4xl font-bold text-white drop-shadow-lg">
            Choose Your Level
          </h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-4">
            {LEVEL_ORDER.map((id) => {
              const cfg = levelConfig[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => startLevel(id)}
                  className="cursor-pointer rounded-2xl bg-white p-5 text-center shadow-lg transition hover:scale-105"
                >
                  <Image
                    src={LEVEL_IMAGE_SRC[id]}
                    alt=""
                    width={120}
                    height={120}
                    className="mx-auto mb-3 h-24 w-24 object-contain"
                  />
                  <div className="text-lg font-bold text-gray-900">{cfg.label}</div>
                  <p className="mt-1 text-sm font-semibold text-gray-600">{cfg.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "game_over") {
    return (
      <div
        className="relative flex min-h-screen items-center justify-center bg-black/40 p-6 font-sans"
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      >
        <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-2xl">
          <div className="relative mx-auto mb-6 h-36 w-36">
            <Image
              src={petHappySrc}
              alt="Your pet celebrates"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Great job!</h2>
          <div className="mt-6 space-y-2 text-lg font-semibold text-gray-700">
            <p>
              Final Score: <span className="text-[#2ECC71]">{score}</span>
            </p>
            <p>Scenarios Completed: {usedScenarioIds.length}</p>
            <p>
              Eco Points Earned:{" "}
              <span className="text-[#2ECC71]">+{ecoPointsEarned}</span>
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                setGameState("level_select");
                setCurrentScenario(null);
                setUsedScenarioIds([]);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2ECC71] px-6 py-3 text-lg font-bold text-white shadow-md transition hover:brightness-95"
            >
              <RefreshCw className="h-5 w-5" aria-hidden />
              Play Again
            </button>
            <Link
              href="/games"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-6 py-3 text-lg font-bold text-gray-800 transition hover:bg-gray-50"
            >
              <Star className="h-5 w-5 text-amber-500" aria-hidden />
              Back to Games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* playing */
  const cfg = levelConfig[activeLevel];
  const hearts = Array.from({ length: cfg.lives }, (_, i) => i < lives);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-24 font-sans">
      <style>{`
        @keyframes kw-float-up {
          0% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -40px); }
        }
        @keyframes kw-pulse-streak {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.04); opacity: 0.92; }
        }
        .kw-float-pts {
          animation: kw-float-up 0.28s ease-out forwards;
        }
        .kw-streak-pulse {
          animation: kw-pulse-streak 1.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .kw-float-pts, .kw-streak-pulse { animation: none !important; }
        }
      `}</style>

      {flash === "green" && (
        <div
          className="pointer-events-none fixed inset-0 z-[60] bg-[#2ECC71]/20 transition-opacity duration-100"
          aria-hidden
        />
      )}
      {flash === "orange" && (
        <div
          className="pointer-events-none fixed inset-0 z-[60] bg-orange-500/20 transition-opacity duration-100"
          aria-hidden
        />
      )}

      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-1.5" aria-label="Lives remaining">
            {hearts.map((filled, i) => (
              <Heart
                key={i}
                className={`h-8 w-8 ${
                  filled
                    ? "fill-[#2ECC71] text-[#2ECC71]"
                    : "fill-gray-200 text-gray-300"
                }`}
                strokeWidth={1.75}
                aria-hidden
              />
            ))}
          </div>
          <div className="flex-1 text-center">
            {combo >= 3 && (
              <span className="kw-streak-pulse inline-flex items-center gap-1.5 text-lg font-extrabold text-orange-600">
                <Flame className="h-6 w-6 text-orange-500" strokeWidth={2} aria-hidden />
                {combo}x STREAK!
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-[#2ECC71]">Score: {score}</div>
        </div>
        <div className="h-2 w-full bg-gray-200">
          <div
            className={`h-full transition-all duration-100 ${barColorClass}`}
            style={{ width: `${Math.max(0, Math.min(100, timeFraction * 100))}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-10">
        {currentScenario && (
          <div className="relative rounded-3xl bg-white p-12 shadow-2xl">
            {feedback === "correct" && (
              <div className="mb-2 flex justify-center text-[#2ECC71]" aria-hidden>
                <Check className="h-10 w-10" strokeWidth={2.5} />
              </div>
            )}

            <p className="mb-4 text-center text-7xl leading-none">{currentScenario.emoji}</p>
            <p className="text-center text-2xl font-bold leading-relaxed text-gray-900">
              {currentScenario.situation}
            </p>

            <div className="relative mt-10">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitAnswer();
                  }
                }}
                disabled={feedback !== null}
                placeholder="Type your kind response..."
                autoComplete="off"
                className="w-full rounded-xl border-2 border-gray-200 py-4 pl-6 pr-6 text-2xl outline-none transition focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/20 disabled:bg-gray-50"
              />
              {floatPoints && (
                <span
                  key={floatPoints.key}
                  className="kw-float-pts pointer-events-none absolute bottom-full left-1/2 mb-2 text-2xl font-extrabold text-[#2ECC71]"
                >
                  {floatPoints.text}
                </span>
              )}
            </div>

            {showHint && currentScenario.hint && (
              <p className="mt-4 text-center text-base font-bold text-orange-700">
                {wrongBanner && <span className="block">{wrongBanner}</span>}
                {encourageLine && <span className="mt-1 block">{encourageLine}</span>}
                <span className="mt-2 block">Hint: {currentScenario.hint}</span>
              </p>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-base font-bold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Exit to Games
          </Link>
        </div>
      </main>
      <MilestoneCelebration streakUpdate={streakUpdate} onClose={() => setStreakUpdate(null)} />
      <RankUpCelebration xpAwarded={xpAwarded} onClose={() => setXpAwarded(null)} />
    </div>
  );
}
