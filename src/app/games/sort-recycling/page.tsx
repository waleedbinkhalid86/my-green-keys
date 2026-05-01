"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  GAME_LEVELS,
  getStoredGameLevel,
  sortRecyclingExpectedAnswer,
  type GameLevelDefinition,
  type SortBin,
} from "@/lib/games/gameLevels";
import { randomRecyclingFact, randomRecyclingItem, type RecyclingItem } from "@/lib/games/sortRecyclingData";
import "@/app/globals.css";

const GAME_NAME = "sort_recycling";
const BASE_ECO_SORT = 14;

type ItemState = "falling" | "sorted" | "dropped";

type FallItem = {
  id: string;
  data: RecyclingItem;
  xPct: number;
  y: number;
  vy: number;
  state: ItemState;
  shake: number;
};

type Phase = "load" | "ready" | "play" | "results";

function rid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const BIN_META: Record<
  SortBin,
  { label: string; emoji: string; color: string; border: string; keyHint: string }
> = {
  plastic: { label: "Plastic", emoji: "♻️", color: "#1565C0", border: "#0D47A1", keyHint: "P / pla / plastic" },
  paper: { label: "Paper", emoji: "📄", color: "#F9A825", border: "#F57F17", keyHint: "A / pap / paper" },
  organic: { label: "Organic", emoji: "🌱", color: "#2E7D32", border: "#1B5E20", keyHint: "O / org / organic" },
  glass: { label: "Glass", emoji: "🔵", color: "#ECEFF1", border: "#B0BEC5", keyHint: "G / gla / glass" },
};

export default function SortRecyclingPage() {
  const [phase, setPhase] = useState<Phase>("load");
  const [error, setError] = useState("");
  const [gameLevel, setGameLevel] = useState<GameLevelDefinition>(GAME_LEVELS.guardian);
  const roundLevelRef = useRef<GameLevelDefinition>(GAME_LEVELS.guardian);

  const [timeLeft, setTimeLeft] = useState(60);
  const [cityHealth, setCityHealth] = useState(55);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [typingBuffer, setTypingBuffer] = useState("");
  const [toast, setToast] = useState<{ text: string; bad: boolean } | null>(null);
  const [factPopup, setFactPopup] = useState<string | null>(null);
  const [items, setItems] = useState<FallItem[]>([]);
  const itemsRef = useRef<FallItem[]>([]);
  const [petType, setPetType] = useState<"panda" | "turtle" | null>(null);
  const [petName, setPetName] = useState("");
  const [petDance, setPetDance] = useState(false);

  const roundEndedRef = useRef(false);
  const roundIdRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const spawnAccRef = useRef(0);
  const playRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const factMilestoneRef = useRef(0);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const sync = useCallback((next: FallItem[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const showToast = useCallback((text: string, bad: boolean) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ text, bad });
    toastTimerRef.current = setTimeout(() => setToast(null), 4200);
  }, []);

  const focusedItem = useCallback((): FallItem | null => {
    const falling = itemsRef.current.filter((i) => i.state === "falling");
    if (falling.length === 0) return null;
    return [...falling].sort((a, b) => b.y - a.y)[0]!;
  }, []);

  const baseFall = 48;
  const spawnEveryBase = 3800;

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createClient();
        const { data: userData, error: uErr } = await supabase.auth.getUser();
        if (uErr) throw uErr;
        if (!userData.user) {
          setError("Sign in to play.");
          setPhase("ready");
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("pet_type, pet_name")
          .eq("id", userData.user.id)
          .maybeSingle();
        const pt = (profile as { pet_type?: string } | null)?.pet_type;
        setPetType(pt === "turtle" ? "turtle" : pt === "panda" ? "panda" : null);
        setPetName(((profile as { pet_name?: string } | null)?.pet_name as string) || "");
        setPhase("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Load failed.");
        setPhase("ready");
      }
    };
    void run();
  }, []);

  useEffect(() => {
    const lvl = getStoredGameLevel();
    setGameLevel(lvl);
    roundLevelRef.current = lvl;
  }, []);

  const resetRound = useCallback(() => {
    const L = roundLevelRef.current;
    roundEndedRef.current = false;
    setTimeLeft(L.roundSeconds);
    setCityHealth(55);
    setCorrect(0);
    setWrong(0);
    setMistakes(0);
    setEcoPoints(0);
    setTypingBuffer("");
    setToast(null);
    setFactPopup(null);
    factMilestoneRef.current = 0;
    sync([]);
    spawnAccRef.current = 0;
    lastTsRef.current = null;
  }, [sync]);

  const endGame = useCallback(() => {
    if (roundEndedRef.current) return;
    roundEndedRef.current = true;
    setPhase("results");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const registerMistake = useCallback(() => {
    setMistakes((m) => {
      const nm = m + 1;
      if (nm >= roundLevelRef.current.lives) queueMicrotask(() => endGame());
      return nm;
    });
  }, [endGame]);

  const spawnOne = useCallback(() => {
    const data = randomRecyclingItem();
    const L = roundLevelRef.current;
    const it: FallItem = {
      id: rid(),
      data,
      xPct: 18 + Math.random() * 64,
      y: -20,
      vy: baseFall * L.speedMultiplier * (0.95 + Math.random() * 0.1),
      state: "falling",
      shake: 0,
    };
    sync([...itemsRef.current, it]);
  }, [sync]);

  useEffect(() => {
    if (phase !== "play" || roundEndedRef.current) return;

    const tick = (ts: number) => {
      if (roundEndedRef.current) return;
      const last = lastTsRef.current;
      lastTsRef.current = ts;
      const dt = last == null ? 0 : Math.min(45, ts - last) / 1000;
      const h = playRef.current?.clientHeight ?? 480;
      const L = roundLevelRef.current;
      const spawnMs = spawnEveryBase / Math.max(0.35, L.speedMultiplier);

      const next: FallItem[] = [];
      let dropped = 0;

      for (const it of itemsRef.current) {
        if (it.state === "sorted") {
          const ny = it.y - 280 * dt;
          if (ny < -100) continue;
          next.push({ ...it, y: ny });
          continue;
        }
        if (it.state === "dropped") {
          next.push(it);
          continue;
        }
        const ny = it.y + it.vy * dt;
        if (ny > h - 36) {
          dropped++;
          next.push({ ...it, y: ny, state: "dropped" });
        } else {
          next.push({ ...it, y: ny });
        }
      }

      if (dropped > 0) {
        setCityHealth((c) => Math.max(0, c - 14 * dropped));
        registerMistake();
        showToast("An item hit the street—sort faster next time! 🏙️", true);
      }

      spawnAccRef.current += dt * 1000;
      let falling = next.filter((i) => i.state === "falling").length;
      const maxF = roundLevelRef.current.id === "champion" ? 2 : 1;
      while (spawnAccRef.current >= spawnMs && falling < maxF && !roundEndedRef.current) {
        spawnAccRef.current -= spawnMs;
        const data = randomRecyclingItem();
        next.push({
          id: rid(),
          data,
          xPct: 18 + Math.random() * 64,
          y: -20,
          vy: baseFall * L.speedMultiplier * (0.95 + Math.random() * 0.1),
          state: "falling",
          shake: 0,
        });
        falling++;
      }

      itemsRef.current = next;
      setItems([...next]);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [phase, registerMistake, showToast]);

  useEffect(() => {
    if (phase !== "play") return;
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
    if (phase === "play") inputRef.current?.focus();
  }, [phase]);

  const handleCorrect = useCallback(
    (fi: FallItem) => {
      const L = roundLevelRef.current;
      const pts = Math.round(BASE_ECO_SORT * L.pointsMultiplier);
      setEcoPoints((e) => e + pts);
      setCityHealth((h) => Math.min(100, h + 9));
      setCorrect((c) => {
        const nc = c + 1;
        if (nc > 0 && nc % 5 === 0 && factMilestoneRef.current !== nc) {
          factMilestoneRef.current = nc;
          setFactPopup(randomRecyclingFact());
          window.setTimeout(() => setFactPopup(null), 3500);
        }
        return nc;
      });
      sync(itemsRef.current.map((x) => (x.id === fi.id ? { ...x, state: "sorted" as const, vy: 0 } : x)));
      setTypingBuffer("");
    },
    [sync]
  );

  const handleWrong = useCallback(
    (fi: FallItem, typedSummary: string) => {
      setWrong((w) => w + 1);
      setCityHealth((h) => Math.max(0, h - 12));
      registerMistake();
      showToast(`${fi.data.wrongHint} (You typed “${typedSummary}”.)`, true);
      sync(
        itemsRef.current.map((x) => (x.id === fi.id ? { ...x, shake: x.shake + 1 } : x))
      );
      setTypingBuffer("");
    },
    [registerMistake, showToast, sync]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (phase !== "play" || roundEndedRef.current) return;
      const fi = focusedItem();
      if (!fi) return;

      const L = roundLevelRef.current;
      const exp = sortRecyclingExpectedAnswer(fi.data.bin, L);

      if (L.id === "seedling") {
        if (e.key.length !== 1 || !/[a-zA-Z]/.test(e.key)) return;
        e.preventDefault();
        const k = e.key.toLowerCase();
        if (k === exp) handleCorrect(fi);
        else handleWrong(fi, k);
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        setTypingBuffer((b) => b.slice(0, -1));
        return;
      }

      if (e.key.length !== 1 || !/[a-zA-Z]/.test(e.key)) return;
      e.preventDefault();
      const ch = e.key.toLowerCase();
      const next = typingBuffer + ch;

      if (L.id === "explorer") {
        const buf = next.slice(0, 3);
        if (buf === exp) {
          handleCorrect(fi);
          return;
        }
        if (!exp.startsWith(buf)) {
          handleWrong(fi, buf);
          return;
        }
        setTypingBuffer(buf);
        return;
      }

      // guardian + champion: full bin name
      if (exp.startsWith(next)) {
        if (next === exp) {
          handleCorrect(fi);
          return;
        }
        setTypingBuffer(next);
        return;
      }
      handleWrong(fi, next);
    },
    [phase, focusedItem, typingBuffer, handleCorrect, handleWrong]
  );

  const startGame = useCallback(() => {
    const lvl = getStoredGameLevel();
    roundLevelRef.current = lvl;
    setGameLevel(lvl);
    roundIdRef.current += 1;
    resetRound();
    setPhase("play");
    queueMicrotask(() => spawnOne());
  }, [resetRound, spawnOne]);

  const treesSaved = useMemo(() => {
    if (correct <= 0) return 0;
    return Math.max(1, Math.floor(correct * 0.12));
  }, [correct]);

  useEffect(() => {
    if (phase !== "results") return;
    const ridKey = roundIdRef.current;

    const run = async () => {
      let dedupeKey: string | null = null;
      try {
        const supabase = createClient();
        const { data: userData, error: uErr } = await supabase.auth.getUser();
        if (uErr) throw uErr;
        if (!userData.user) return;

        dedupeKey = `mgk-${GAME_NAME}-${userData.user.id}-${ridKey}`;
        if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(dedupeKey)) return;
        if (typeof sessionStorage !== "undefined") sessionStorage.setItem(dedupeKey, "1");

        const ecoNow = ecoPoints;
        const score = correct;

        await supabase.from("game_scores").insert({
          student_id: userData.user.id,
          game_name: GAME_NAME,
          score,
          eco_points_earned: ecoNow,
        });

        const { data: row } = await supabase.from("profiles").select("eco_points").eq("id", userData.user.id).single();
        const cur = Number((row as { eco_points?: number } | null)?.eco_points ?? 0) || 0;
        await supabase.from("profiles").update({ eco_points: cur + ecoNow }).eq("id", userData.user.id);

        if (cityHealth > 70) {
          setPetDance(true);
          window.setTimeout(() => setPetDance(false), 1600);
        }
      } catch {
        if (typeof sessionStorage !== "undefined" && dedupeKey) sessionStorage.removeItem(dedupeKey);
      }
    };

    void run();
  }, [phase, correct, ecoPoints, cityHealth]);

  const petEmoji = petType === "turtle" ? "🐢" : "🐼";
  const lives = gameLevel.lives;
  const livesLeft = Math.max(0, lives - mistakes);

  const inputHint = useMemo(() => {
    if (gameLevel.id === "seedling") return "Type P (plastic), A (paper), O (organic), or G (glass).";
    if (gameLevel.id === "explorer") return "Type pla · pap · org · gla";
    return "Type the full bin name: plastic, paper, organic, or glass.";
  }, [gameLevel.id]);

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-poppins), Poppins, sans-serif",
        background: "linear-gradient(180deg,#87CEEB 0%,#B3E5FC 40%,#FFF9C4 100%)",
        color: "#1a237e",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes sr-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
          .sr-shake { animation: sr-shake 0.35s ease; }
          @keyframes sr-pet-dance {
            0%{transform:rotate(0) translateY(0)} 25%{transform:rotate(12deg) translateY(-6px)}
            50%{transform:rotate(-12deg) translateY(-6px)} 100%{transform:rotate(0) translateY(0)}
          }
          .sr-pet-dance { animation: sr-pet-dance 0.65s ease-in-out infinite; }
        `,
        }}
      />

      {/* Skyline */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "42%",
          background: `
            linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.15) 100%),
            repeating-linear-gradient(90deg, transparent 0 40px, rgba(0,0,0,0.04) 40px 41px)
          `,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-around",
          gap: 4,
          padding: "0 8px",
          height: "38%",
          pointerEvents: "none",
        }}
      >
        {[
          { w: 44, h: 90, c: "#5C6BC0" },
          { w: 56, h: 130, c: "#7E57C2" },
          { w: 38, h: 70, c: "#EF5350" },
          { w: 50, h: 110, c: "#42A5F5" },
          { w: 42, h: 85, c: "#AB47BC" },
          { w: 60, h: 140, c: "#26A69A" },
          { w: 48, h: 100, c: "#FF7043" },
        ].map((b, i) => (
          <div
            key={i}
            style={{
              width: b.w,
              height: b.h,
              background: `linear-gradient(180deg, ${b.c} 0%, ${b.c}dd 100%)`,
              borderRadius: "4px 4px 0 0",
              boxShadow: "0 -4px 0 rgba(0,0,0,0.12) inset",
            }}
          />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 920, margin: "0 auto", padding: "12px 14px 100px" }}>
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", opacity: 0.75 }}>ECO HERO CITY</div>
            <h1 style={{ fontSize: 24, fontWeight: 950 }}>🗑️ Sort the Recycling</h1>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/games" style={{ padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.15)", fontWeight: 800, textDecoration: "none", color: "#1a237e", background: "rgba(255,255,255,0.7)" }}>
              All games
            </Link>
            <Link href="/lesson" style={{ padding: "8px 14px", borderRadius: 999, background: "#4CAF50", color: "#fff", fontWeight: 900, textDecoration: "none" }}>
              Lessons
            </Link>
          </div>
        </header>

        {error && <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: "#FFCDD2", fontWeight: 700 }}>{error}</div>}

        {phase === "load" && <p style={{ marginTop: 16, fontWeight: 700 }}>Loading…</p>}

        {phase === "ready" && (
          <div style={{ marginTop: 20, padding: 22, borderRadius: 20, background: "rgba(255,255,255,0.88)", boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}>
            <p style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.5 }}>
              Your city needs you! Items fall from the sky—type the right bin so nothing pollutes the streets.
            </p>
            <p style={{ marginTop: 10, fontWeight: 700 }}>
              Level: {gameLevel.emoji} {gameLevel.label} · {gameLevel.pointsMultiplier}× eco · {gameLevel.lives} lives ·{" "}
              {gameLevel.roundSeconds}s
            </p>
            <button
              type="button"
              onClick={startGame}
              style={{
                marginTop: 18,
                padding: "12px 24px",
                borderRadius: 999,
                border: "none",
                fontWeight: 950,
                fontSize: 17,
                cursor: "pointer",
                background: "linear-gradient(90deg,#42A5F5,#4CAF50)",
                color: "#fff",
              }}
            >
              Start sorting
            </button>
          </div>
        )}

        {phase === "play" && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14, alignItems: "center" }}>
              <div style={{ flex: "1 1 180px", padding: 12, borderRadius: 16, background: "rgba(255,255,255,0.92)", fontWeight: 800 }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Lives</div>
                <div style={{ fontSize: 22, letterSpacing: 4 }}>
                  {Array.from({ length: lives }).map((_, i) => (
                    <span key={i} style={{ opacity: i < livesLeft ? 1 : 0.25 }}>
                      ❤️
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ flex: "2 1 240px", padding: 12, borderRadius: 16, background: "rgba(255,255,255,0.92)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 12 }}>
                  <span>🏙️ City health</span>
                  <span>{Math.round(cityHealth)}%</span>
                </div>
                <div style={{ height: 14, borderRadius: 999, background: "#E0E0E0", marginTop: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${cityHealth}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: cityHealth > 60 ? "linear-gradient(90deg,#66BB6A,#2E7D32)" : "linear-gradient(90deg,#FFB74D,#E65100)",
                      transition: "width 0.2s ease",
                    }}
                  />
                </div>
              </div>
              <div style={{ flex: "1 1 160px", padding: 12, borderRadius: 16, background: "rgba(255,255,255,0.92)", textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 900 }}>Eco points</div>
                <div style={{ fontSize: 24, fontWeight: 950, color: "#2E7D32" }}>{ecoPoints}</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{gameLevel.pointsMultiplier}× level</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>⏱ {timeLeft}s</div>
              </div>
            </div>

            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontWeight: 800 }}>
              <span style={{ padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,0.9)" }}>
                {gameLevel.emoji} {gameLevel.label}
              </span>
              {gameLevel.id === "champion" && (
                <span style={{ color: "#E65100", fontWeight: 950 }}>⚡ Two streams—focus the lowest item!</span>
              )}
            </div>

            <div
              ref={playRef}
              onClick={() => inputRef.current?.focus()}
              style={{
                position: "relative",
                marginTop: 12,
                height: "min(48vh, 440px)",
                borderRadius: 18,
                background: "rgba(255,255,255,0.35)",
                border: "2px dashed rgba(0,0,0,0.12)",
                overflow: "hidden",
                cursor: "text",
              }}
            >
              <input
                ref={inputRef}
                value=""
                onChange={() => {}}
                onKeyDown={onKeyDown}
                style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                autoComplete="off"
                spellCheck={false}
                aria-label="Sort recycling input"
              />
              {typingBuffer && gameLevel.id !== "seedling" && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    fontWeight: 900,
                  }}
                >
                  {typingBuffer}▌
                </div>
              )}
              {items.map((it) => (
                <div
                  key={`${it.id}-${it.shake}`}
                  className={it.shake ? "sr-shake" : undefined}
                  style={{
                    position: "absolute",
                    left: `${it.xPct}%`,
                    top: it.y,
                    transform: "translateX(-50%)",
                    padding: "10px 14px",
                    borderRadius: 16,
                    background: it.state === "sorted" ? "rgba(129,199,132,0.95)" : "rgba(255,255,255,0.95)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    fontWeight: 950,
                    border: "2px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{it.data.emoji}</span>
                  <span>{it.data.name}</span>
                </div>
              ))}
            </div>

            <p style={{ marginTop: 8, fontSize: 13, fontWeight: 700, opacity: 0.85 }}>{inputHint}</p>

            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
              }}
            >
              {(Object.keys(BIN_META) as SortBin[]).map((b) => {
                const m = BIN_META[b];
                return (
                  <div
                    key={b}
                    style={{
                      borderRadius: 14,
                      padding: "10px 8px",
                      textAlign: "center",
                      background: m.color,
                      color: b === "glass" ? "#37474F" : "#fff",
                      border: `3px solid ${m.border}`,
                      fontWeight: 900,
                      fontSize: 12,
                      textShadow: b === "glass" ? "none" : "0 1px 2px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div style={{ fontSize: 22 }}>{m.emoji}</div>
                    <div>{m.label}</div>
                    <div style={{ fontSize: 10, opacity: 0.9, marginTop: 4 }}>{m.keyHint}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {toast && (
          <div
            role="alert"
            style={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 60,
              maxWidth: 480,
              padding: 14,
              borderRadius: 16,
              background: toast.bad ? "rgba(183,28,28,0.95)" : "rgba(27,94,32,0.95)",
              color: "#fff",
              fontWeight: 800,
              boxShadow: "0 16px 50px rgba(0,0,0,0.3)",
            }}
          >
            {toast.text}
          </div>
        )}

        {factPopup && (
          <div
            style={{
              position: "fixed",
              top: "18%",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 55,
              width: "min(400px, 92vw)",
              padding: 16,
              borderRadius: 16,
              background: "linear-gradient(135deg,#1B5E20,#43A047)",
              color: "#fff",
              fontWeight: 800,
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontWeight: 950, marginBottom: 8 }}>Did you know?</div>
            {factPopup}
          </div>
        )}

        {phase === "results" && (
          <div style={{ marginTop: 22, padding: 22, borderRadius: 20, background: "rgba(255,255,255,0.92)" }}>
            <h2 style={{ fontSize: 22, fontWeight: 950 }}>Round complete</h2>
            <ul style={{ marginTop: 12, fontWeight: 700, lineHeight: 1.8 }}>
              <li>Sorted correctly: {correct}</li>
              <li>Wrong sorts: {wrong}</li>
              <li>Final city health: {Math.round(cityHealth)}%</li>
              <li>Eco points earned: {ecoPoints}</li>
            </ul>
            <p style={{ marginTop: 14, fontWeight: 800, color: "#2E7D32" }}>
              Real impact: You sorted {correct} items—that&apos;s like saving ~{treesSaved} trees’ worth of paper and
              plastic waste! 🌳
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 18, alignItems: "center" }}>
              <div style={{ textAlign: "center", padding: 14, borderRadius: 16, background: "#E8F5E9", minWidth: 120 }}>
                <div style={{ fontSize: 12, fontWeight: 900 }}>{petName || "Buddy"}</div>
                <div className={petDance ? "sr-pet-dance" : undefined} style={{ fontSize: 48, marginTop: 6 }}>
                  {petEmoji}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 8 }}>
                  {cityHealth > 70 ? "The city is sparkling!" : cityHealth < 30 ? "We’ll get it next time…" : "Nice work, hero!"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
              <button
                type="button"
                onClick={startGame}
                style={{
                  padding: "12px 20px",
                  borderRadius: 14,
                  border: "none",
                  fontWeight: 950,
                  cursor: "pointer",
                  background: "#42A5F5",
                  color: "#fff",
                }}
              >
                Play again
              </button>
              <Link href="/games" style={{ padding: "12px 20px", borderRadius: 14, fontWeight: 950, border: "1px solid #ccc", textDecoration: "none", color: "#1a237e" }}>
                Back to games
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
