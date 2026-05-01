"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ecoFacts, type EcoFact } from "@/data/ecoFacts";
import {
  ageToBand,
  bandGameParams,
  pickRandomWord,
  progressiveDifficultyLabel,
  progressiveWordPool,
} from "@/lib/games/lessonVocab";
import "@/app/globals.css";

const GAME_NAME = "falling_leaves";
const ROUND_SECONDS = 60;
const MAX_MISSES = 3;
const BASE_ECO_PER_LEAF = 12;
const COMBO_THRESHOLD = 5;

type LeafState = "falling" | "caught" | "missed";

type Leaf = {
  id: string;
  word: string;
  xPct: number;
  y: number;
  vy: number;
  state: LeafState;
  shakeKey: number;
  caughtBoost: boolean;
};

type GamePhase = "load" | "ready" | "play" | "results";

function randomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function randomEcoFact(): EcoFact {
  return ecoFacts[Math.floor(Math.random() * ecoFacts.length)]!;
}

export default function FallingLeavesPage() {
  const [phase, setPhase] = useState<GamePhase>("load");
  const [error, setError] = useState("");

  const [age, setAge] = useState<number | null>(null);
  /** Completed lesson ids only (words never appear from lessons not yet completed). */
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([1]);
  const [highScore, setHighScore] = useState<number>(0);

  const [petType, setPetType] = useState<"panda" | "turtle" | null>(null);
  const [petName, setPetName] = useState("");

  const band = useMemo(() => ageToBand(age), [age]);
  const params = useMemo(() => bandGameParams(band), [band]);

  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [forestHealth, setForestHealth] = useState(100);
  const [misses, setMisses] = useState(0);
  const [caught, setCaught] = useState(0);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [typingBuffer, setTypingBuffer] = useState("");

  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const leavesRef = useRef<Leaf[]>([]);

  const spawnAccRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const roundEndedRef = useRef(false);
  const roundIdRef = useRef(0);
  const completedLessonIdsRef = useRef<number[]>([1]);
  const caughtRef = useRef(0);

  const playAreaRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const factMilestoneRef = useRef(0);
  const [activeFactPopup, setActiveFactPopup] = useState<EcoFact | null>(null);
  const factClearRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [resultsFact, setResultsFact] = useState<EcoFact | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const [petDance, setPetDance] = useState(false);

  const syncLeaves = useCallback((next: Leaf[]) => {
    leavesRef.current = next;
    setLeaves(next);
  }, []);

  useEffect(() => {
    completedLessonIdsRef.current = completedLessonIds;
  }, [completedLessonIds]);

  useEffect(() => {
    caughtRef.current = caught;
  }, [caught]);

  const difficulty = useMemo(
    () => progressiveDifficultyLabel(completedLessonIds, caught),
    [completedLessonIds, caught]
  );

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createClient();
        const { data: userData, error: uErr } = await supabase.auth.getUser();
        if (uErr) throw uErr;
        if (!userData.user) {
          setError("Please sign in to play.");
          setPhase("ready");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("age, pet_type, pet_name")
          .eq("id", userData.user.id)
          .maybeSingle();

        const a = (profile as { age?: number } | null)?.age ?? null;
        setAge(a);

        const { data: progressRows } = await supabase
          .from("student_progress")
          .select("lesson_id")
          .eq("student_id", userData.user.id)
          .eq("completed", true);

        const ids = Array.from(
          new Set(
            (progressRows ?? [])
              .map((r: { lesson_id: unknown }) => r.lesson_id)
              .filter((n): n is number => typeof n === "number" && n >= 1)
          )
        ).sort((x, y) => x - y);
        setCompletedLessonIds(ids.length > 0 ? ids : [1]);

        const pt = (profile as { pet_type?: string; pet_name?: string } | null)?.pet_type;
        setPetType(pt === "turtle" ? "turtle" : pt === "panda" ? "panda" : null);
        setPetName(((profile as { pet_name?: string } | null)?.pet_name as string) || "");

        const { data: scores } = await supabase
          .from("game_scores")
          .select("score")
          .eq("student_id", userData.user.id)
          .eq("game_name", GAME_NAME)
          .order("score", { ascending: false })
          .limit(1)
          .maybeSingle();

        setHighScore(Number((scores as { score?: number } | null)?.score ?? 0) || 0);
        setPhase("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load profile.");
        setPhase("ready");
      }
    };
    void run();
  }, []);

  const resetRound = useCallback(() => {
    roundEndedRef.current = false;
    caughtRef.current = 0;
    setTimeLeft(ROUND_SECONDS);
    setForestHealth(100);
    setMisses(0);
    setCaught(0);
    setEcoPoints(0);
    setComboStreak(0);
    setBestCombo(0);
    setTypingBuffer("");
    syncLeaves([]);
    spawnAccRef.current = 0;
    lastTsRef.current = null;
    factMilestoneRef.current = 0;
    setActiveFactPopup(null);
    setResultsFact(null);
    setNewRecord(false);
    setPetDance(false);
    if (factClearRef.current) clearTimeout(factClearRef.current);
  }, [syncLeaves]);

  const endGame = useCallback(() => {
    if (roundEndedRef.current) return;
    roundEndedRef.current = true;
    setPhase("results");
    setResultsFact(randomEcoFact());
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const showFactBriefly = useCallback((fact: EcoFact) => {
    if (factClearRef.current) clearTimeout(factClearRef.current);
    setActiveFactPopup(fact);
    factClearRef.current = setTimeout(() => setActiveFactPopup(null), 3000);
  }, []);

  const spawnLeaf = useCallback(() => {
    const pool = progressiveWordPool(completedLessonIdsRef.current, caughtRef.current);
    const word = pickRandomWord(pool);
    const leaf: Leaf = {
      id: randomId(),
      word,
      xPct: 12 + Math.random() * 76,
      y: -24,
      vy: params.fallSpeed * (0.92 + Math.random() * 0.16),
      state: "falling",
      shakeKey: 0,
      caughtBoost: false,
    };
    syncLeaves([...leavesRef.current, leaf]);
  }, [params.fallSpeed, syncLeaves]);

  useEffect(() => {
    if (phase !== "play" || roundEndedRef.current) return;

    const tick = (ts: number) => {
      if (roundEndedRef.current) return;

      const last = lastTsRef.current;
      lastTsRef.current = ts;
      const dt = last == null ? 0 : Math.min(48, ts - last) / 1000;

      const h = playAreaRef.current?.clientHeight ?? 520;

      const next: Leaf[] = [];
      let missedNow = 0;

      for (const leaf of leavesRef.current) {
        if (leaf.state === "caught") {
          const ny = leaf.y - 220 * dt;
          if (ny < -80) continue;
          next.push({ ...leaf, y: ny, state: "caught" });
          continue;
        }

        if (leaf.state === "missed") {
          next.push(leaf);
          continue;
        }

        const ny = leaf.y + leaf.vy * dt;
        if (ny > h - 8) {
          missedNow++;
          next.push({ ...leaf, y: ny, state: "missed" });
        } else {
          next.push({ ...leaf, y: ny });
        }
      }

      if (missedNow > 0) {
        setMisses((m) => {
          const nm = Math.min(MAX_MISSES, m + missedNow);
          setForestHealth(Math.max(0, 100 * (1 - nm / MAX_MISSES)));
          setComboStreak(0);
          setTypingBuffer("");
          if (nm >= MAX_MISSES) {
            queueMicrotask(() => endGame());
          }
          return nm;
        });
      }

      spawnAccRef.current += dt * 1000;
      let fallingCount = next.filter((l) => l.state === "falling").length;
      while (
        spawnAccRef.current >= params.spawnEveryMs &&
        fallingCount < params.maxLeaves &&
        !roundEndedRef.current
      ) {
        spawnAccRef.current -= params.spawnEveryMs;
        const pool = progressiveWordPool(completedLessonIdsRef.current, caughtRef.current);
        const word = pickRandomWord(pool);
        next.push({
          id: randomId(),
          word,
          xPct: 12 + Math.random() * 76,
          y: -24,
          vy: params.fallSpeed * (0.92 + Math.random() * 0.16),
          state: "falling",
          shakeKey: 0,
          caughtBoost: false,
        });
        fallingCount++;
      }

      leavesRef.current = next;
      setLeaves([...next]);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [phase, params.maxLeaves, params.spawnEveryMs, params.fallSpeed, endGame]);

  useEffect(() => {
    if (phase !== "play" || roundEndedRef.current) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, endGame]);

  useEffect(() => {
    if (phase === "play") {
      inputRef.current?.focus();
    }
  }, [phase]);

  const catchLeaf = useCallback(
    (leafId: string) => {
      const mult = comboStreak + 1 >= COMBO_THRESHOLD ? 2 : 1;
      const gained = BASE_ECO_PER_LEAF * mult;

      setCaught((c) => {
        const nc = c + 1;
        caughtRef.current = nc;
        if (nc > 0 && nc % 10 === 0 && factMilestoneRef.current !== nc) {
          factMilestoneRef.current = nc;
          showFactBriefly(randomEcoFact());
        }
        return nc;
      });

      setEcoPoints((p) => p + gained);
      setComboStreak((s) => {
        const ns = s + 1;
        setBestCombo((b) => Math.max(b, ns));
        return ns;
      });

      const updated = leavesRef.current.map((l) =>
        l.id === leafId
          ? { ...l, state: "caught" as const, y: l.y, caughtBoost: true, vy: 0 }
          : l
      );
      syncLeaves(updated);
      setTypingBuffer("");
    },
    [comboStreak, showFactBriefly, syncLeaves]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (phase !== "play" || roundEndedRef.current) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        setTypingBuffer((b) => b.slice(0, -1));
        return;
      }

      if (e.key.length !== 1) return;
      const ch = e.key.toLowerCase();
      if (!/[a-z0-9]/.test(ch)) return;
      e.preventDefault();

      const nextBuf = typingBuffer + ch;
      const falling = leavesRef.current.filter((l) => l.state === "falling");
      const matches = falling.filter((l) => l.word.toLowerCase().startsWith(nextBuf));

      if (matches.length === 0) {
        setComboStreak(0);
        setTypingBuffer("");
        const partial = falling.filter((l) => l.word.toLowerCase().startsWith(typingBuffer));
        const toShake =
          partial.length > 0
            ? partial.reduce((a, b) => (a.word.length >= b.word.length ? a : b)).id
            : falling.sort((a, b) => b.y - a.y)[0]?.id;
        if (toShake) {
          syncLeaves(
            leavesRef.current.map((l) =>
              l.id === toShake ? { ...l, shakeKey: l.shakeKey + 1 } : l
            )
          );
        }
        return;
      }

      const exacts = matches.filter((l) => l.word.toLowerCase() === nextBuf);
      const exact = exacts.length
        ? [...exacts].sort((a, b) => b.y - a.y)[0]!
        : null;

      if (exact) {
        catchLeaf(exact.id);
        return;
      }

      setTypingBuffer(nextBuf);
    },
    [phase, typingBuffer, catchLeaf, syncLeaves]
  );

  const startGame = () => {
    roundIdRef.current += 1;
    resetRound();
    setPhase("play");
    queueMicrotask(() => spawnLeaf());
  };

  useEffect(() => {
    if (phase !== "results") return;
    const rid = roundIdRef.current;

    const run = async () => {
      let dedupeKey: string | null = null;
      try {
        const supabase = createClient();
        const { data: userData, error: uErr } = await supabase.auth.getUser();
        if (uErr) throw uErr;
        if (!userData.user) return;

        dedupeKey = `mgk-${GAME_NAME}-${userData.user.id}-${rid}`;
        if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(dedupeKey)) return;
        if (typeof sessionStorage !== "undefined") sessionStorage.setItem(dedupeKey, "1");

        const caughtNow = caught;
        const ecoNow = ecoPoints;

        await supabase.from("game_scores").insert({
          student_id: userData.user.id,
          game_name: GAME_NAME,
          score: caughtNow,
          eco_points_earned: ecoNow,
        });

        const { data: row } = await supabase.from("profiles").select("eco_points").eq("id", userData.user.id).single();
        const cur = Number((row as { eco_points?: number } | null)?.eco_points ?? 0) || 0;
        await supabase.from("profiles").update({ eco_points: cur + ecoNow }).eq("id", userData.user.id);

        setHighScore((h) => {
          setNewRecord(caughtNow > h);
          return Math.max(h, caughtNow);
        });

        if (caughtNow > 0) {
          setPetDance(true);
          window.setTimeout(() => setPetDance(false), 1600);
        }
      } catch {
        if (typeof sessionStorage !== "undefined" && dedupeKey) sessionStorage.removeItem(dedupeKey);
      }
    };

    void run();
  }, [phase, caught, ecoPoints]);

  const petEmoji = petType === "turtle" ? "🐢" : "🐼";
  const comboActive = comboStreak >= COMBO_THRESHOLD;
  const stormTooStrong = phase === "results" && misses >= MAX_MISSES;

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-poppins), Poppins, sans-serif",
        background: "linear-gradient(180deg, #1a0a2e 0%, #16213e 35%, #0f2f24 100%)",
        color: "#e8f5e9",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fl-shake {
            0%,100% { transform: translateX(0); }
            20% { transform: translateX(-6px) rotate(-2deg); }
            40% { transform: translateX(6px) rotate(2deg); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
          }
          @keyframes fl-celebrate {
            0%,100% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.08) rotate(-4deg); }
            50% { transform: scale(1.12) rotate(4deg); }
            75% { transform: scale(1.06) rotate(-2deg); }
          }
          @keyframes fl-pet-dance {
            0% { transform: rotate(0deg) translateY(0); }
            25% { transform: rotate(12deg) translateY(-6px); }
            50% { transform: rotate(-12deg) translateY(-6px); }
            75% { transform: rotate(10deg) translateY(-3px); }
            100% { transform: rotate(0deg) translateY(0); }
          }
          .fl-leaf-shake { animation: fl-shake 0.38s ease; }
          .fl-pet-dance { animation: fl-pet-dance 0.65s ease-in-out infinite; }
          .fl-new-record { animation: fl-celebrate 0.8s ease infinite; }
        `,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: stormTooStrong ? 0.72 : 1,
          filter: stormTooStrong ? "brightness(0.4)" : "none",
          transition: "filter 0.6s ease, opacity 0.5s ease",
          pointerEvents: "none",
        }}
      />

      {/* Side trees */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: 140,
          height: "72%",
          zIndex: 1,
          opacity: 0.9,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.45), transparent), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 400'%3E%3Crect x='52' y='260' width='16' height='140' fill='%235D4037'/%3E%3Cpolygon points='60,20 110,200 10,200' fill='%231B5E20'/%3E%3Cpolygon points='60,70 95,210 25,210' fill='%232E7D32'/%3E%3Cpolygon points='60,120 85,230 35,230' fill='%234CAF50'/%3E%3C/svg%3E\")",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left bottom",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 140,
          height: "72%",
          zIndex: 1,
          opacity: 0.9,
          transform: "scaleX(-1)",
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.45), transparent), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 400'%3E%3Crect x='52' y='260' width='16' height='140' fill='%235D4037'/%3E%3Cpolygon points='60,20 110,200 10,200' fill='%231B5E20'/%3E%3Cpolygon points='60,70 95,210 25,210' fill='%232E7D32'/%3E%3Cpolygon points='60,120 85,230 35,230' fill='%234CAF50'/%3E%3C/svg%3E\")",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left bottom",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 960, margin: "0 auto", padding: "16px 16px 32px" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.12em", opacity: 0.8 }}>ENCHANTED FOREST</div>
            <h1 style={{ fontSize: 26, fontWeight: 950, marginTop: 4 }}>🍂 Falling Leaves</h1>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link
              href="/games"
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.35)",
                color: "#fff",
                fontWeight: 800,
                textDecoration: "none",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              All games
            </Link>
            <Link
              href="/lesson"
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                background: "linear-gradient(90deg,#7B1FA2,#4CAF50)",
                color: "#fff",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              Lessons
            </Link>
          </div>
        </header>

        {error && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "rgba(244,67,54,0.2)", fontWeight: 700 }}>
            {error}
          </div>
        )}

        {phase === "load" && <p style={{ marginTop: 24, fontWeight: 700 }}>Summoning the forest…</p>}

        {phase === "ready" && (
          <div
            style={{
              marginTop: 28,
              padding: 28,
              borderRadius: 22,
              background: "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(0,0,0,0.25))",
              border: "1px solid rgba(255,255,255,0.18)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.5 }}>
              You are the Forest Guardian! Type each word on a falling leaf to catch it and send it home to the trees.
            </p>
            <p style={{ marginTop: 12, opacity: 0.9, fontWeight: 600 }}>
              Age band: <strong>{band}</strong> · {ROUND_SECONDS}s round · {MAX_MISSES} misses ends the storm
            </p>
            <p style={{ marginTop: 10, opacity: 0.88, fontWeight: 600, lineHeight: 1.45, maxWidth: 560, margin: "10px auto 0" }}>
              Words begin short (2–3 letters) from your earliest completed lessons, then grow after every 5 catches. Only
              vocabulary from lessons you&apos;ve finished appears—no spoilers!
            </p>
            {highScore > 0 && (
              <p style={{ marginTop: 8, color: "#FFEB3B", fontWeight: 900 }}>Your best: {highScore} leaves caught</p>
            )}
            <button
              type="button"
              onClick={startGame}
              style={{
                marginTop: 22,
                padding: "14px 28px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontWeight: 950,
                fontSize: 18,
                color: "#1b5e20",
                background: "linear-gradient(90deg,#FFEB3B,#A5D6A7)",
                boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
              }}
            >
              Start game
            </button>
          </div>
        )}

        {phase === "play" && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 16 }}>
              <div
                style={{
                  flex: "1 1 200px",
                  padding: "10px 14px",
                  borderRadius: 14,
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>🌍 Eco points</div>
                <div style={{ fontSize: 22, fontWeight: 950, color: comboActive ? "#FFEB3B" : "#A5D6A7" }}>
                  {ecoPoints}
                  {comboActive && <span style={{ marginLeft: 8, fontSize: 14 }}>2× combo!</span>}
                </div>
              </div>
              <div
                style={{
                  flex: "2 1 260px",
                  padding: "10px 14px",
                  borderRadius: 14,
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 900 }}>
                  <span>🌲 Forest health</span>
                  <span>{Math.round(forestHealth)}%</span>
                </div>
                <div style={{ height: 12, borderRadius: 999, background: "rgba(255,255,255,0.12)", marginTop: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${forestHealth}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: "linear-gradient(90deg,#66BB6A,#2E7D32)",
                      transition: "width 0.25s ease",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  flex: "1 1 160px",
                  padding: "10px 14px",
                  borderRadius: 14,
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  textAlign: "right",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>🍃 Caught</div>
                <div style={{ fontSize: 22, fontWeight: 950 }}>{caught}</div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>⏱ {timeLeft}s</div>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                padding: "12px 16px",
                borderRadius: 16,
                background: "linear-gradient(90deg, rgba(123,31,162,0.35), rgba(76,175,80,0.25))",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "8px 16px",
                fontWeight: 800,
              }}
            >
              <span style={{ fontSize: 13, color: "#FFEB3B" }}>📖 Reading level</span>
              <span style={{ fontSize: 15, fontWeight: 950 }}>{difficulty.title}</span>
              <span style={{ opacity: 0.85, fontSize: 13 }}>
                Stage {difficulty.tier + 1}/4 · {difficulty.lettersLabel} · {difficulty.lessonsLabel}
              </span>
            </div>

            <div
              ref={playAreaRef}
              onClick={() => inputRef.current?.focus()}
              style={{
                position: "relative",
                marginTop: 18,
                height: "min(52vh, 520px)",
                borderRadius: 20,
                background: "linear-gradient(180deg, rgba(76,175,80,0.12), rgba(26,10,46,0.5))",
                border: "1px solid rgba(255,255,255,0.14)",
                overflow: "hidden",
                cursor: "text",
                boxShadow: "inset 0 0 60px rgba(0,0,0,0.35)",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value=""
                onChange={() => {}}
                onKeyDown={onKeyDown}
                style={{
                  position: "absolute",
                  opacity: 0,
                  width: 1,
                  height: 1,
                  left: 16,
                  top: 16,
                }}
                aria-label="Type the word on the highlighted leaf"
              />

              {typingBuffer && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "8px 16px",
                    borderRadius: 999,
                    background: "rgba(0,0,0,0.55)",
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    border: "1px solid rgba(255,235,59,0.35)",
                  }}
                >
                  {typingBuffer}
                  <span style={{ opacity: 0.5 }}>▌</span>
                </div>
              )}

              {leaves.map((leaf) => {
                const scale = params.leafScale;
                const matchPrefix =
                  leaf.state === "falling" && leaf.word.toLowerCase().startsWith(typingBuffer.toLowerCase()) && typingBuffer.length > 0;
                return (
                  <div
                    key={`${leaf.id}-${leaf.shakeKey}`}
                    className={leaf.shakeKey && leaf.state === "falling" ? "fl-leaf-shake" : undefined}
                    style={{
                      position: "absolute",
                      left: `${leaf.xPct}%`,
                      top: leaf.y,
                      transform: `translateX(-50%) scale(${scale})`,
                      padding: "10px 16px",
                      borderRadius: 16,
                      background: matchPrefix
                        ? "linear-gradient(145deg, rgba(255,235,59,0.95), rgba(129,199,132,0.9))"
                        : "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(200,230,201,0.88))",
                      color: "#1b5e20",
                      fontWeight: 950,
                      fontSize: band === "6-8" ? 20 : band === "9-11" ? 17 : 15,
                      boxShadow: leaf.state === "caught" ? "0 0 28px rgba(255,235,59,0.75)" : "0 10px 24px rgba(0,0,0,0.25)",
                      border: matchPrefix ? "2px solid #F57F17" : "1px solid rgba(27,94,32,0.25)",
                      whiteSpace: "nowrap",
                      transition: leaf.state === "caught" ? "none" : undefined,
                    }}
                  >
                    {leaf.word}
                    {leaf.state === "caught" && <span style={{ marginLeft: 6 }}>✨</span>}
                  </div>
                );
              })}
            </div>

            <p style={{ marginTop: 10, fontSize: 13, opacity: 0.85, fontWeight: 600 }}>
              Tip: focus this area and type letters. Backspace fixes typos. Combo starts after {COMBO_THRESHOLD} perfect catches in a row!
            </p>
          </>
        )}

        {activeFactPopup && phase === "play" && (
          <div
            role="dialog"
            style={{
              position: "fixed",
              zIndex: 50,
              left: "50%",
              top: "22%",
              transform: "translateX(-50%)",
              width: "min(420px, 92vw)",
              padding: 18,
              borderRadius: 18,
              background: "linear-gradient(135deg, rgba(45,106,79,0.98), rgba(76,175,80,0.92))",
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ fontSize: 32 }}>{activeFactPopup.emoji}</div>
            <div style={{ fontWeight: 950, marginTop: 6 }}>Eco fact!</div>
            <div style={{ fontWeight: 800, marginTop: 8, lineHeight: 1.4 }}>{activeFactPopup.fact}</div>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 10 }}>Source: {activeFactPopup.source}</div>
          </div>
        )}

        {phase === "results" && (
          <div
            style={{
              marginTop: 24,
              padding: 26,
              borderRadius: 22,
              background: "linear-gradient(145deg, rgba(255,255,255,0.14), rgba(0,0,0,0.35))",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {newRecord && (
              <div
                className="fl-new-record"
                style={{
                  fontSize: 22,
                  fontWeight: 950,
                  color: "#FFEB3B",
                  marginBottom: 14,
                  textAlign: "center",
                }}
              >
                🏆 New high score!
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
              <div style={{ flex: "1 1 220px" }}>
                <h2 style={{ fontSize: 22, fontWeight: 950 }}>Round complete</h2>
                {stormTooStrong && (
                  <p style={{ marginTop: 10, fontWeight: 800, color: "#FFCC80", lineHeight: 1.45 }}>
                    The storm was strong—three leaves slipped away. The forest went quiet for a moment. Try again to
                    bring the green back!
                  </p>
                )}
                <ul style={{ marginTop: 12, lineHeight: 1.8, fontWeight: 700 }}>
                  <li>Leaves caught: {caught}</li>
                  <li>Eco points earned: {ecoPoints}</li>
                  <li>Best typing combo: {bestCombo}</li>
                  <li>Misses: {misses}</li>
                </ul>
              </div>

              <div
                style={{
                  flex: "0 0 auto",
                  textAlign: "center",
                  padding: 16,
                  borderRadius: 18,
                  background: "rgba(0,0,0,0.25)",
                  minWidth: 140,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.9 }}>
                  {petName || (petType ? "Your pet" : "Forest buddy")}
                </div>
                <div
                  className={petDance ? "fl-pet-dance" : undefined}
                  style={{ fontSize: 52, lineHeight: 1, marginTop: 6 }}
                >
                  {petEmoji}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 8, opacity: 0.85 }}>
                  {petDance
                    ? "Happy dance!"
                    : caught > 0
                      ? "So proud of you!"
                      : "Keep trying—you’ve got this!"}
                </div>
              </div>
            </div>

            {resultsFact && (
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 16,
                  background: "linear-gradient(90deg, rgba(129,199,132,0.35), rgba(255,235,59,0.2))",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <div style={{ fontWeight: 950 }}>Did you know?</div>
                <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 28 }}>{resultsFact.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 800, lineHeight: 1.45 }}>{resultsFact.fact}</div>
                    <div style={{ fontSize: 12, opacity: 0.85, marginTop: 8 }}>{resultsFact.source}</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
              <button
                type="button"
                onClick={startGame}
                style={{
                  padding: "12px 20px",
                  borderRadius: 14,
                  border: "none",
                  fontWeight: 950,
                  cursor: "pointer",
                  background: "linear-gradient(90deg,#4CAF50,#2E7D32)",
                  color: "#fff",
                }}
              >
                Play again
              </button>
              <Link
                href="/games"
                style={{
                  padding: "12px 20px",
                  borderRadius: 14,
                  fontWeight: 950,
                  border: "1px solid rgba(255,255,255,0.35)",
                  color: "#fff",
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                Back to games
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
