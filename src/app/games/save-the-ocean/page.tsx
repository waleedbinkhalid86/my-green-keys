"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ecoFacts, type EcoFact } from "@/data/ecoFacts";
import { GAME_LEVELS, getStoredGameLevel, type GameLevelDefinition } from "@/lib/games/gameLevels";
import {
  plasticTypingTarget,
  randomPlasticItem,
  type OceanPlasticItemDef,
} from "@/lib/games/oceanPlasticItems";
import "@/app/globals.css";

const GAME_NAME = "save_the_ocean";
const START_HEALTH = 30;
const HEALTH_MAX = 100;
const COLLECT_GAIN = 5;
const MISS_LOSS = 7;
const FACT_EVERY = 5;

type PieceState = "drift" | "cleared" | "missed";

type PlasticPiece = {
  id: string;
  def: OceanPlasticItemDef;
  xPct: number;
  yPct: number;
  vx: number;
  state: PieceState;
  shakeKey: number;
};

type Phase = "load" | "ready" | "play" | "celebration" | "results";

function randomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function oceanFactsPool(): EcoFact[] {
  return ecoFacts.filter((f) => f.category === "WATER & OCEANS");
}

function randomOceanFact(): EcoFact {
  const p = oceanFactsPool();
  return p[Math.floor(Math.random() * p.length)]!;
}

function freedomFromHealth(health: number): number {
  return Math.max(0, Math.min(100, Math.round(((health - START_HEALTH) / (HEALTH_MAX - START_HEALTH)) * 100)));
}

function marineCardsUnlocked(collected: number): string[] {
  const cards: string[] = [];
  if (collected >= 3) cards.push("🐬 Friendly dolphin");
  if (collected >= 8) cards.push("🪸 Coral reef helper");
  if (collected >= 15) cards.push("🐢 Sea turtle ally");
  if (collected >= 25) cards.push("🦭 Ocean guardian seal");
  return cards;
}

export default function SaveTheOceanPage() {
  const [phase, setPhase] = useState<Phase>("load");
  const [error, setError] = useState("");
  const [highScore, setHighScore] = useState(0);
  const [petType, setPetType] = useState<"panda" | "turtle" | null>(null);
  const [petName, setPetName] = useState("");

  const [gameLevel, setGameLevel] = useState<GameLevelDefinition>(GAME_LEVELS.guardian);
  const roundLevelRef = useRef<GameLevelDefinition>(GAME_LEVELS.guardian);

  const [timeLeft, setTimeLeft] = useState(60);
  const [oceanHealth, setOceanHealth] = useState(START_HEALTH);
  const [collected, setCollected] = useState(0);
  const [missed, setMissed] = useState(0);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [typingBuffer, setTypingBuffer] = useState("");

  const [pieces, setPieces] = useState<PlasticPiece[]>([]);
  const piecesRef = useRef<PlasticPiece[]>([]);

  const [zaraRescued, setZaraRescued] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [celebrationFact, setCelebrationFact] = useState<EcoFact | null>(null);

  const spawnAccRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const roundEndedRef = useRef(false);
  const roundIdRef = useRef(0);
  const collectedRef = useRef(0);
  const oceanHealthRef = useRef(START_HEALTH);

  const playAreaRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const factMilestoneRef = useRef(0);
  const [activeFactPopup, setActiveFactPopup] = useState<EcoFact | null>(null);
  const factClearRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [resultsFact, setResultsFact] = useState<EcoFact | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const [petDance, setPetDance] = useState(false);

  const syncPieces = useCallback((next: PlasticPiece[]) => {
    piecesRef.current = next;
    setPieces(next);
  }, []);

  useEffect(() => {
    collectedRef.current = collected;
  }, [collected]);

  useEffect(() => {
    oceanHealthRef.current = oceanHealth;
  }, [oceanHealth]);

  const freedomPct = useMemo(() => freedomFromHealth(oceanHealth), [oceanHealth]);

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
          .select("pet_type, pet_name")
          .eq("id", userData.user.id)
          .maybeSingle();

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
        setError(e instanceof Error ? e.message : "Failed to load.");
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
    collectedRef.current = 0;
    oceanHealthRef.current = START_HEALTH;
    setTimeLeft(L.roundSeconds);
    setOceanHealth(START_HEALTH);
    setCollected(0);
    setMissed(0);
    setEcoPoints(0);
    setTypingBuffer("");
    setZaraRescued(false);
    setShowParty(false);
    setCelebrationFact(null);
    syncPieces([]);
    spawnAccRef.current = 0;
    lastTsRef.current = null;
    factMilestoneRef.current = 0;
    setActiveFactPopup(null);
    setResultsFact(null);
    setNewRecord(false);
    setPetDance(false);
    if (factClearRef.current) clearTimeout(factClearRef.current);
  }, [syncPieces]);

  const endPlay = useCallback((rescued: boolean, party: boolean) => {
    if (roundEndedRef.current) return;
    roundEndedRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setZaraRescued(rescued);
    if (party) {
      const cf = randomOceanFact();
      setCelebrationFact(cf);
      setShowParty(true);
      setPhase("celebration");
      window.setTimeout(() => {
        setPhase("results");
        setResultsFact(randomOceanFact());
      }, 4200);
    } else {
      setPhase("results");
      setResultsFact(randomOceanFact());
    }
  }, []);

  const showFactBriefly = useCallback((fact: EcoFact) => {
    if (factClearRef.current) clearTimeout(factClearRef.current);
    setActiveFactPopup(fact);
    factClearRef.current = setTimeout(() => setActiveFactPopup(null), 3200);
  }, []);

  const spawnPiece = useCallback(() => {
    const def = randomPlasticItem();
    const L = roundLevelRef.current;
    const baseVx = 14 + Math.random() * 10;
    const vx = baseVx * L.speedMultiplier * (L.id === "champion" ? 1.15 : 1);
    const piece: PlasticPiece = {
      id: randomId(),
      def,
      xPct: -8,
      yPct: 18 + Math.random() * 55,
      vx,
      state: "drift",
      shakeKey: 0,
    };
    syncPieces([...piecesRef.current, piece]);
  }, [syncPieces]);

  useEffect(() => {
    if (phase !== "play" || roundEndedRef.current) return;

    const tick = (ts: number) => {
      if (roundEndedRef.current) return;

      const last = lastTsRef.current;
      lastTsRef.current = ts;
      const dt = last == null ? 0 : Math.min(48, ts - last) / 1000;
      const L = roundLevelRef.current;

      const next: PlasticPiece[] = [];
      let missedNow = 0;

      for (const p of piecesRef.current) {
        if (p.state === "cleared") continue;
        if (p.state === "missed") {
          next.push(p);
          continue;
        }
        const nx = p.xPct + p.vx * dt;
        if (nx > 108) {
          missedNow++;
          next.push({ ...p, xPct: nx, state: "missed" });
        } else {
          next.push({ ...p, xPct: nx });
        }
      }

      if (missedNow > 0) {
        setMissed((m) => m + missedNow);
        setOceanHealth((h) => {
          const nh = Math.max(0, h - MISS_LOSS * missedNow);
          oceanHealthRef.current = nh;
          if (nh <= 0) queueMicrotask(() => endPlay(false, false));
          return nh;
        });
        setTypingBuffer("");
      }

      spawnAccRef.current += dt * 1000;
      const spawnEvery = Math.max(900, 2400 / Math.max(0.35, L.speedMultiplier));
      while (spawnAccRef.current >= spawnEvery && !roundEndedRef.current) {
        const dc = next.filter((p) => p.state === "drift").length;
        if (dc >= 7) break;
        spawnAccRef.current -= spawnEvery;
        const def = randomPlasticItem();
        const baseVx = 14 + Math.random() * 10;
        const vx = baseVx * L.speedMultiplier * (L.id === "champion" ? 1.15 : 1);
        next.push({
          id: randomId(),
          def,
          xPct: -8,
          yPct: 18 + Math.random() * 55,
          vx,
          state: "drift",
          shakeKey: 0,
        });
      }

      piecesRef.current = next;
      setPieces([...next]);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [phase, endPlay, syncPieces]);

  useEffect(() => {
    if (phase !== "play" || roundEndedRef.current) return;
    if (freedomPct >= 100 || oceanHealth >= HEALTH_MAX) {
      endPlay(true, true);
    }
  }, [freedomPct, oceanHealth, phase, endPlay]);

  useEffect(() => {
    if (phase !== "play" || roundEndedRef.current) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          if (!roundEndedRef.current) {
            const h = oceanHealthRef.current;
            const rescued = freedomFromHealth(h) >= 100 || h >= HEALTH_MAX;
            endPlay(rescued, false);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, endPlay]);

  useEffect(() => {
    if (phase === "play" || phase === "ready") inputRef.current?.focus();
  }, [phase]);

  const clearPiece = useCallback(
    (pieceId: string) => {
      const mult = roundLevelRef.current.pointsMultiplier;
      const gained = Math.round(18 * mult);
      setEcoPoints((p) => p + gained);
      setCollected((c) => {
        const nc = c + 1;
        collectedRef.current = nc;
        if (nc > 0 && nc % FACT_EVERY === 0 && factMilestoneRef.current !== nc) {
          factMilestoneRef.current = nc;
          showFactBriefly(randomOceanFact());
        }
        return nc;
      });
      setOceanHealth((h) => Math.min(HEALTH_MAX, h + COLLECT_GAIN));
      const updated = piecesRef.current.filter((p) => p.id !== pieceId);
      syncPieces(updated);
      setTypingBuffer("");
    },
    [showFactBriefly, syncPieces]
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
      const L = roundLevelRef.current;
      const drifting = piecesRef.current.filter((p) => p.state === "drift");

      const withTarget = drifting.map((p) => ({
        p,
        target: plasticTypingTarget(p.def, L).toLowerCase(),
      }));

      const matches = withTarget.filter((x) => x.target.startsWith(nextBuf));
      if (matches.length === 0) {
        setTypingBuffer("");
        const partial = withTarget.filter((x) => x.target.startsWith(typingBuffer));
        const toShake =
          partial.length > 0
            ? [...partial].sort((a, b) => b.p.xPct - a.p.xPct)[0]!.p.id
            : [...drifting].sort((a, b) => b.xPct - a.xPct)[0]?.id;
        if (toShake) {
          syncPieces(
            piecesRef.current.map((p) =>
              p.id === toShake ? { ...p, shakeKey: p.shakeKey + 1 } : p
            )
          );
        }
        return;
      }

      const exacts = matches.filter((x) => x.target === nextBuf);
      const pick =
        exacts.length > 0 ? [...exacts].sort((a, b) => b.p.xPct - a.p.xPct)[0]!.p : null;

      if (pick) {
        clearPiece(pick.id);
        return;
      }

      const maxLen = Math.max(...matches.map((x) => x.target.length));
      if (nextBuf.length >= maxLen) {
        setTypingBuffer("");
        return;
      }
      setTypingBuffer(nextBuf);
    },
    [phase, typingBuffer, clearPiece, syncPieces]
  );

  const startGame = () => {
    const lvl = getStoredGameLevel();
    roundLevelRef.current = lvl;
    setGameLevel(lvl);
    roundIdRef.current += 1;
    resetRound();
    roundEndedRef.current = false;
    setPhase("play");
    queueMicrotask(() => spawnPiece());
  };

  useEffect(() => {
    if (phase !== "results") return;
    const rid = roundIdRef.current;
    let dedupeKey: string | null = null;

    const run = async () => {
      try {
        const supabase = createClient();
        const { data: userData, error: uErr } = await supabase.auth.getUser();
        if (uErr) throw uErr;
        if (!userData.user) return;

        dedupeKey = `mgk-${GAME_NAME}-${userData.user.id}-${rid}`;
        if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(dedupeKey)) return;
        if (typeof sessionStorage !== "undefined") sessionStorage.setItem(dedupeKey, "1");

        const scoreNow = collected;
        const ecoNow = ecoPoints;

        await supabase.from("game_scores").insert({
          student_id: userData.user.id,
          game_name: GAME_NAME,
          score: scoreNow,
          eco_points_earned: ecoNow,
        });

        const { data: row } = await supabase
          .from("profiles")
          .select("eco_points")
          .eq("id", userData.user.id)
          .single();
        const cur = Number((row as { eco_points?: number } | null)?.eco_points ?? 0) || 0;
        await supabase.from("profiles").update({ eco_points: cur + ecoNow }).eq("id", userData.user.id);

        setHighScore((h) => {
          setNewRecord(scoreNow > h);
          return Math.max(h, scoreNow);
        });

        if (zaraRescued || scoreNow > 0) {
          setPetDance(true);
          window.setTimeout(() => setPetDance(false), 1800);
        }
      } catch {
        if (typeof sessionStorage !== "undefined" && dedupeKey) sessionStorage.removeItem(dedupeKey);
      }
    };

    void run();
  }, [phase, collected, ecoPoints, zaraRescued]);

  const petEmoji = petType === "turtle" ? "🐢" : "🐼";
  const bottlesEquiv = Math.max(1, Math.round(collected * 0.4));
  const cards = marineCardsUnlocked(collected);

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-poppins), Poppins, sans-serif",
        background: "linear-gradient(180deg, #020b1a 0%, #0a2342 40%, #052e4a 100%)",
        color: "#e3f2fd",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes sto-ray { 0%{opacity:.25} 50%{opacity:.45} 100%{opacity:.25} }
          @keyframes sto-float { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-6px); } }
          @keyframes sto-shake {
            0%,100%{ transform: translateX(0); }
            25%{ transform: translateX(-5px) rotate(-2deg); }
            75%{ transform: translateX(5px) rotate(2deg); }
          }
          @keyframes sto-zara-swim {
            0%{ transform: translateX(0) scaleX(1); }
            100%{ transform: translateX(-120%) scaleX(1); }
          }
          @keyframes sto-pet-dance {
            0%{ transform: rotate(0) translateY(0); }
            33%{ transform: rotate(10deg) translateY(-5px); }
            66%{ transform: rotate(-10deg) translateY(-5px); }
            100%{ transform: rotate(0) translateY(0); }
          }
          .sto-ray { animation: sto-ray 5s ease-in-out infinite; }
          .sto-shake-anim { animation: sto-shake 0.35s ease; }
          .sto-zara-free { animation: sto-zara-swim 4s ease-in-out forwards; }
          .sto-pet-dance { animation: sto-pet-dance 0.7s ease-in-out infinite; }
        `,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(100,181,246,0.35), transparent), radial-gradient(ellipse 50% 40% at 80% 100%, rgba(0,77,128,0.5), transparent)",
          pointerEvents: "none",
        }}
      />
      {[12, 28, 55, 72].map((left, i) => (
        <div
          key={i}
          className="sto-ray"
          style={{
            position: "absolute",
            left: `${left}%`,
            top: -40,
            width: 4,
            height: "75%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.5), transparent)",
            opacity: 0.35,
            filter: "blur(3px)",
            pointerEvents: "none",
          }}
        />
      ))}

      <header
        style={{
          position: "relative",
          zIndex: 5,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(2,15,35,0.65)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", opacity: 0.85 }}>
            OPERATION BLUE PLANET
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 950, marginTop: 4 }}>Save the Ocean 🌊</h1>
        </div>
        <Link
          href="/games"
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.35)",
            color: "#fff",
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          ← Games
        </Link>
      </header>

      {phase === "load" && (
        <p style={{ padding: 24, fontWeight: 700 }}>Loading your submarine…</p>
      )}
      {error && (
        <p style={{ padding: 24, color: "#ffab91", fontWeight: 700 }}>{error}</p>
      )}

      {(phase === "ready" || phase === "play" || phase === "celebration") && (
        <div style={{ position: "relative", zIndex: 3, padding: "12px 16px 20px" }}>
          <div
            style={{
              display: "grid",
              gap: 10,
              marginBottom: 12,
              gridTemplateColumns: "1fr 1fr",
              maxWidth: 720,
            }}
          >
            <div
              style={{
                padding: 12,
                borderRadius: 14,
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(100,181,246,0.35)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.9 }}>Ocean health</div>
              <div style={{ height: 10, borderRadius: 999, background: "rgba(0,0,0,0.4)", marginTop: 8 }}>
                <div
                  style={{
                    width: `${oceanHealth}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg,#4fc3f7,#26a69a)",
                    transition: "width 0.25s ease",
                  }}
                />
              </div>
              <div style={{ marginTop: 6, fontWeight: 900, fontSize: 18 }}>{Math.round(oceanHealth)}%</div>
            </div>
            <div
              style={{
                padding: 12,
                borderRadius: 14,
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(129,199,132,0.45)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.9 }}>Zara&apos;s freedom 🐢</div>
              <div style={{ height: 10, borderRadius: 999, background: "rgba(0,0,0,0.4)", marginTop: 8 }}>
                <div
                  style={{
                    width: `${freedomPct}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg,#fff59d,#81c784)",
                    transition: "width 0.25s ease",
                  }}
                />
              </div>
              <div style={{ marginTop: 6, fontWeight: 900, fontSize: 18 }}>{freedomPct}%</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              marginBottom: 12,
              fontWeight: 800,
            }}
          >
            <span style={{ background: "rgba(0,0,0,0.35)", padding: "8px 12px", borderRadius: 12 }}>
              ⏱ {timeLeft}s
            </span>
            <span style={{ background: "rgba(0,0,0,0.35)", padding: "8px 12px", borderRadius: 12 }}>
              🧹 {collected} cleaned
            </span>
            <span style={{ color: "#ffecb3" }}>✨ {ecoPoints} eco pts</span>
            <span style={{ opacity: 0.85, fontSize: 13 }}>
              Level: {gameLevel.emoji} {gameLevel.label}
            </span>
          </div>

          {phase === "ready" && (
            <div style={{ maxWidth: 520 }}>
              <p style={{ lineHeight: 1.5, fontWeight: 600, opacity: 0.95 }}>
                Zara the sea turtle is trapped in plastic drift. Type the labels to clear debris and heal the
                water!
              </p>
              <p style={{ marginTop: 8, fontSize: 14, opacity: 0.85 }}>
                High score: <strong>{highScore}</strong> pieces removed
              </p>
              <button
                type="button"
                onClick={startGame}
                style={{
                  marginTop: 14,
                  padding: "12px 22px",
                  borderRadius: 14,
                  border: "none",
                  fontWeight: 950,
                  cursor: "pointer",
                  background: "linear-gradient(90deg,#29b6f6,#26a69a)",
                  color: "#fff",
                  fontSize: 16,
                }}
              >
                Dive in 🛟
              </button>
            </div>
          )}
        </div>
      )}

      {(phase === "play" || phase === "celebration") && (
        <div
          ref={playAreaRef}
          style={{
            position: "relative",
            margin: "0 12px 100px",
            height: "min(52vh, 420px)",
            borderRadius: 20,
            border: "2px solid rgba(79,195,247,0.35)",
            background: "linear-gradient(180deg, rgba(1,40,80,0.5), rgba(0,30,55,0.85))",
            overflow: "hidden",
          }}
        >
          {phase === "play" &&
            pieces.map((p) => {
              if (p.state !== "drift") return null;
              const target = plasticTypingTarget(p.def, roundLevelRef.current);
              return (
                <div
                  key={p.id}
                  className={p.shakeKey ? "sto-shake-anim" : undefined}
                  title={p.def.label}
                  style={{
                    position: "absolute",
                    left: `${p.xPct}%`,
                    top: `${p.yPct}%`,
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 28, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
                    {p.def.emoji}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      background: "rgba(0,0,0,0.55)",
                      padding: "4px 8px",
                      borderRadius: 8,
                      color: "#e1f5fe",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {target}
                  </span>
                </div>
              );
            })}

          <div
            style={{
              position: "absolute",
              right: 8,
              top: "18%",
              width: 100,
              textAlign: "center",
              animation: phase === "celebration" ? "sto-zara-swim 4s ease-in-out forwards" : "sto-float 3.5s ease-in-out infinite",
            }}
          >
            {!showParty && (
              <>
                <div style={{ fontSize: 52 }}>🐢</div>
                <div style={{ fontSize: 22, opacity: 0.9 }}>🕸️</div>
                <div style={{ fontSize: 11, fontWeight: 800, marginTop: 4 }}>Zara</div>
              </>
            )}
            {showParty && (
              <>
                <div className="sto-zara-free" style={{ fontSize: 56 }}>
                  🐢💚
                </div>
                <div style={{ marginTop: 8, fontSize: 28 }}>🐠🪸🐟</div>
              </>
            )}
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 10,
              transform: "translateX(-50%)",
              fontSize: 36,
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.45))",
            }}
          >
            🛥️
          </div>

          {phase === "play" && (
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Type to clean plastic"
              value={typingBuffer}
              readOnly
              onKeyDown={onKeyDown}
              style={{
                position: "absolute",
                left: 12,
                bottom: 12,
                width: "calc(100% - 24px)",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(100,181,246,0.5)",
                background: "rgba(0,0,0,0.45)",
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
              }}
            />
          )}

          {activeFactPopup && phase === "play" && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "8%",
                transform: "translateX(-50%)",
                maxWidth: "92%",
                padding: "12px 14px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.95)",
                color: "#0d47a1",
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                border: "2px solid #4fc3f7",
              }}
            >
              <span style={{ marginRight: 8 }}>{activeFactPopup.emoji}</span>
              {activeFactPopup.fact}
            </div>
          )}
        </div>
      )}

      {phase === "celebration" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,20,40,0.65)",
            padding: 20,
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: 420,
              padding: 28,
              borderRadius: 22,
              background: "linear-gradient(160deg, #e3f2fd, #b3e5fc)",
              color: "#01579b",
              fontWeight: 800,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>You rescued Zara! 🐢💚</div>
            <p style={{ fontSize: 17, lineHeight: 1.45 }}>
              You removed <strong>{collected}</strong> pieces of plastic! The reef is cheering for you.
            </p>
            {celebrationFact && (
              <p style={{ marginTop: 12, fontSize: 15, fontWeight: 700 }}>
                {celebrationFact.emoji} {celebrationFact.fact}
              </p>
            )}
          </div>
        </div>
      )}

      {phase === "results" && (
        <div style={{ position: "relative", zIndex: 4, padding: "20px 18px 40px", maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, fontWeight: 950 }}>Mission report</h2>
          <div
            style={{
              marginTop: 14,
              padding: 16,
              borderRadius: 16,
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(79,195,247,0.35)",
              lineHeight: 1.55,
              fontWeight: 600,
            }}
          >
            <p>
              Plastic removed: <strong>{collected}</strong>
            </p>
            <p>
              Ocean health: <strong>{Math.round(oceanHealth)}%</strong>
            </p>
            <p>
              Zara:{" "}
              <strong>{zaraRescued ? "Rescued! 🎉" : "Still needs help — try again!"}</strong>
            </p>
            <p>
              Real impact: about <strong>{bottlesEquiv}</strong> plastic bottles worth of cleanup!
            </p>
            <p style={{ color: "#ffecb3" }}>
              Eco points earned: <strong>{ecoPoints}</strong> ({gameLevel.label} ×{gameLevel.pointsMultiplier})
            </p>
            {newRecord && (
              <p style={{ color: "#fff59d", fontWeight: 950 }}>🏆 New personal best!</p>
            )}
          </div>

          {cards.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 950, marginBottom: 8 }}>Marine life cards</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontWeight: 600 }}>
                {cards.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {resultsFact && (
            <p style={{ marginTop: 16, opacity: 0.92, fontWeight: 600 }}>
              {resultsFact.emoji} {resultsFact.fact}
            </p>
          )}

          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 16,
              background: "rgba(255,255,255,0.08)",
              textAlign: "center",
            }}
          >
            <div className={petDance ? "sto-pet-dance" : undefined} style={{ fontSize: 44 }}>
              {petEmoji}
            </div>
            <div style={{ fontWeight: 800, marginTop: 6 }}>
              {petName || "Your pet"} {zaraRescued ? "is doing a happy ocean dance!" : "believes in your next dive."}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
            <button
              type="button"
              onClick={startGame}
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "none",
                fontWeight: 950,
                cursor: "pointer",
                background: "linear-gradient(90deg,#29b6f6,#00838f)",
                color: "#fff",
              }}
            >
              Play again
            </button>
            <Link
              href="/games"
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                fontWeight: 900,
                border: "1px solid rgba(255,255,255,0.35)",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Back to hub
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
