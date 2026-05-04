"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateStreak, type StreakUpdateResult } from "@/lib/streakHelpers";
import { awardXp, XP_SOURCES, type XpAwardResult } from "@/lib/rangerHelpers";
import { MilestoneCelebration } from "@/components/MilestoneCelebration";
import { RankUpCelebration } from "@/components/RankUpCelebration";
import type { EcoFact } from "@/data/ecoFacts";
import {
  applyOfflineGrowth,
  cellDisplayEmoji,
  countGardenPlants,
  daysBetween,
  emptyGardenData,
  GARDEN_ANIMALS,
  GARDEN_MAX_STAGE,
  GARDEN_PLANTS,
  gardenCo2AbsorptionKg,
  gardenWordPool,
  newlyUnlockedAnimals,
  pickGardenSentence,
  pickGardenWord,
  plantFactForKey,
  pickRandomPlantKey,
  randomPlantsGardenFact,
  sumGardenGrowth,
  typingTargetFromPhrase,
  type GardenAnimalDef,
  type GardenData,
  type GardenPlantTier,
} from "@/lib/games/ecoGardenData";
import { getStoredGameLevel, type GameLevelDefinition } from "@/lib/games/gameLevels";
import { ArrowRight, Clock, Lock, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  canFullyAccessGarden,
  canViewGarden,
  getTrialState,
  startTrial,
  type TrialState,
} from "@/lib/ecoGardenTrial";
import "@/app/globals.css";

const GAME_NAME = "eco_garden";

type Phase = "load" | "garden" | "play" | "results";

type DropState = "fall" | "hit" | "miss";

type RainDrop = {
  id: string;
  target: string;
  xPct: number;
  y: number;
  vy: number;
  state: DropState;
  shakeKey: number;
};

function randomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseTier(v: unknown): GardenPlantTier | null {
  if (v === "flower" || v === "bush" || v === "tree" || v === "fruit" || v === "magical") return v;
  return null;
}

function normalizeGardenData(raw: unknown): GardenData {
  if (!raw || typeof raw !== "object") return emptyGardenData();
  const o = raw as { cells?: unknown; animalsUnlocked?: unknown; createdAtIso?: unknown };
  const cellsIn = Array.isArray(o.cells) ? o.cells : null;
  if (!cellsIn || cellsIn.length !== 12) return emptyGardenData();
  const cells = cellsIn.map((c) => {
    if (!c || typeof c !== "object") {
      return { plantKey: null, tier: null, stage: 0 };
    }
    const x = c as { plantKey?: unknown; tier?: unknown; stage?: unknown };
    const pk = typeof x.plantKey === "string" ? x.plantKey : null;
    const tier = parseTier(x.tier);
    const st = typeof x.stage === "number" ? Math.max(0, Math.min(GARDEN_MAX_STAGE, x.stage)) : 0;
    return { plantKey: pk, tier, stage: pk ? st : 0 };
  });
  const au = Array.isArray(o.animalsUnlocked)
    ? o.animalsUnlocked.filter((a): a is string => typeof a === "string")
    : [];
  const created =
    typeof o.createdAtIso === "string" && o.createdAtIso.length > 4
      ? o.createdAtIso
      : new Date().toISOString();
  return { cells, animalsUnlocked: au, createdAtIso: created };
}

function waterGardenCell(g: GardenData, maxLesson: number): {
  next: GardenData;
  plantKey?: string;
  newStage: number;
} {
  const cells = g.cells.map((c) => ({ ...c }));
  const growIdx = cells.findIndex((c) => c.plantKey != null && c.stage < GARDEN_MAX_STAGE);
  if (growIdx >= 0) {
    const c = cells[growIdx]!;
    const ns = c.stage + 1;
    cells[growIdx] = { ...c, stage: ns };
    return { next: { ...g, cells }, plantKey: c.plantKey ?? undefined, newStage: ns };
  }
  const emptyIdx = cells.findIndex((c) => c.plantKey == null);
  if (emptyIdx >= 0) {
    const key = pickRandomPlantKey(maxLesson);
    const meta = GARDEN_PLANTS[key];
    cells[emptyIdx] = { plantKey: key, tier: meta?.tier ?? "flower", stage: 1 };
    return { next: { ...g, cells }, plantKey: key, newStage: 1 };
  }
  return { next: g, newStage: 0 };
}

function TrialBanner({ state }: { state: TrialState }) {
  const finalDay = state.status === "active" && state.daysRemaining < 1;
  return (
    <div
      className={cn(
        "relative z-[6] flex w-full flex-wrap items-center justify-center gap-3 border-y-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 py-3 px-4 sm:px-6",
        finalDay && "animate-pulse",
      )}
    >
      <div className="flex w-full max-w-3xl flex-wrap items-center justify-center gap-3 sm:justify-between">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Clock className="h-5 w-5 shrink-0 text-amber-700" strokeWidth={2} aria-hidden />
          {finalDay ? (
            <span className="font-semibold text-orange-700">
              Final day: {state.hoursRemaining}h left
            </span>
          ) : (
            <span className="font-semibold text-[#1b2e1b]">
              Free trial: {state.daysRemaining} day{state.daysRemaining !== 1 ? "s" : ""} left
            </span>
          )}
        </div>
        <Link
          href="/pricing"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-600 bg-white px-4 py-1.5 text-sm font-bold text-amber-900 shadow-sm transition hover:bg-amber-50"
        >
          Upgrade now
          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function ExpiredOverlay({ plantCount, ecoPoints }: { plantCount: number; ecoPoints: number }) {
  return (
    <div
      className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-transparent via-white/60 to-white/95 p-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-label="Eco Garden trial ended"
    >
      <div className="pointer-events-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
        <Sprout className="mx-auto mb-4 h-16 w-16 text-green-500" strokeWidth={2} aria-hidden />
        <h2 className="text-2xl font-bold text-gray-900">Your plants miss you</h2>
        <p className="mt-2 text-gray-600">
          Your trial ended, but your garden lives on with Family Plan
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-600">
          <span>{plantCount} plants grown</span>
          <span aria-hidden className="text-gray-400">
            ·
          </span>
          <span>{ecoPoints} eco points</span>
        </div>
        <Link
          href="/pricing?source=eco_garden_expired"
          className="mt-6 inline-block w-full rounded-full bg-green-500 py-3 px-6 text-center font-bold text-white transition hover:bg-green-600"
        >
          Continue with Family Plan
        </Link>
        <p className="mt-4 text-center text-xs text-gray-500">
          Or keep typing — earn lessons toward unlocking forever
        </p>
      </div>
    </div>
  );
}

export default function EcoGardenPage() {
  const [phase, setPhase] = useState<Phase>("load");
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("Friend");
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([1]);
  const [highScore, setHighScore] = useState(0);

  const [petType, setPetType] = useState<"panda" | "turtle" | null>(null);
  const [petName, setPetName] = useState("");

  const [gardenData, setGardenData] = useState<GardenData>(() => emptyGardenData());
  const [lastWateredIso, setLastWateredIso] = useState<string | null>(null);
  const [welcomeDays, setWelcomeDays] = useState(0);
  const [welcomeFlash, setWelcomeFlash] = useState(false);

  const [gameLevel, setGameLevel] = useState<GameLevelDefinition>(getStoredGameLevel());
  const roundLevelRef = useRef<GameLevelDefinition>(getStoredGameLevel());

  const [timeLeft, setTimeLeft] = useState(60);
  const [wateredSession, setWateredSession] = useState(0);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [typingBuffer, setTypingBuffer] = useState("");
  const [waterBurst, setWaterBurst] = useState<{ key: number; plot: number } | null>(null);

  const [drops, setDrops] = useState<RainDrop[]>([]);
  const dropsRef = useRef<RainDrop[]>([]);

  const [factPopup, setFactPopup] = useState<string | null>(null);
  const factClearRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [animalToast, setAnimalToast] = useState<GardenAnimalDef | null>(null);
  const [resultsFact, setResultsFact] = useState<EcoFact | null>(null);
  const [streakUpdate, setStreakUpdate] = useState<StreakUpdateResult | null>(null);
  const [xpAwarded, setXpAwarded] = useState<XpAwardResult | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const [petDance, setPetDance] = useState(false);

  const spawnAccRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const roundEndedRef = useRef(false);
  const roundIdRef = useRef(0);
  const gardenDataRef = useRef<GardenData>(emptyGardenData());
  const userIdRef = useRef<string | null>(null);
  const streakGardenPlaySessionDoneRef = useRef(false);
  const seenPlantFactsRef = useRef<Set<string>>(new Set());

  const playAreaRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [trialState, setTrialState] = useState<TrialState | null>(null);
  const [bootDone, setBootDone] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [profileEcoPoints, setProfileEcoPoints] = useState(0);

  const syncDrops = useCallback((next: RainDrop[]) => {
    dropsRef.current = next;
    setDrops(next);
  }, []);

  useEffect(() => {
    gardenDataRef.current = gardenData;
  }, [gardenData]);

  const maxLesson = useMemo(
    () => (completedLessonIds.length ? Math.max(...completedLessonIds) : 1),
    [completedLessonIds]
  );

  const totalPlants = useMemo(() => countGardenPlants(gardenData), [gardenData]);
  const gardenAgeDays = useMemo(() => {
    try {
      const start = new Date(gardenData.createdAtIso);
      return Math.max(0, daysBetween(start, new Date()));
    } catch {
      return 0;
    }
  }, [gardenData.createdAtIso]);

  const activeAnimals = useMemo(() => {
    return GARDEN_ANIMALS.filter((a) => totalPlants >= a.thresholdPlants);
  }, [totalPlants]);

  const persistGarden = useCallback(async (data: GardenData) => {
    const uid = userIdRef.current;
    if (!uid) return;
    if (!trialState || !canFullyAccessGarden(trialState)) return;
    try {
      const supabase = createClient();
      const total = countGardenPlants(data);
      await supabase.from("eco_garden").upsert(
        {
          student_id: uid,
          garden_data: data as unknown as Record<string, unknown>,
          last_watered: new Date().toISOString(),
          total_plants: total,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "student_id" }
      );
      setLastWateredIso(new Date().toISOString());
    } catch {
      /* offline */
    }
  }, [trialState]);

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createClient();
        const { data: userData, error: uErr } = await supabase.auth.getUser();
        if (uErr) throw uErr;
        if (!userData.user) {
          setSignedIn(false);
          setError("Please sign in to visit your garden.");
          setPhase("garden");
          setBootDone(true);
          return;
        }
        setSignedIn(true);
        userIdRef.current = userData.user.id;

        let state = await getTrialState(userData.user.id, supabase);
        if (state.status === "not_started") {
          await startTrial(userData.user.id, supabase);
          state = await getTrialState(userData.user.id, supabase);
        }
        setTrialState(state);

        if (state.status === "locked") {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, pet_type, pet_name")
            .eq("id", userData.user.id)
            .maybeSingle();

          const fn = (profile as { full_name?: string } | null)?.full_name;
          if (fn && fn.trim()) setStudentName(fn.trim());

          const pt = (profile as { pet_type?: string; pet_name?: string } | null)?.pet_type;
          setPetType(pt === "turtle" ? "turtle" : pt === "panda" ? "panda" : null);
          setPetName(((profile as { pet_name?: string } | null)?.pet_name as string) || "");

          setPhase("garden");
          setBootDone(true);
          return;
        }

        if (!canViewGarden(state)) {
          setError("Eco Garden is not available right now.");
          setPhase("garden");
          setBootDone(true);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, pet_type, pet_name, eco_points")
          .eq("id", userData.user.id)
          .maybeSingle();

        const fn = (profile as { full_name?: string } | null)?.full_name;
        if (fn && fn.trim()) setStudentName(fn.trim());

        const pt = (profile as { pet_type?: string; pet_name?: string } | null)?.pet_type;
        setPetType(pt === "turtle" ? "turtle" : pt === "panda" ? "panda" : null);
        setPetName(((profile as { pet_name?: string } | null)?.pet_name as string) || "");
        const ep = Number((profile as { eco_points?: number } | null)?.eco_points ?? 0) || 0;
        setProfileEcoPoints(ep);

        const { data: progressRows } = await supabase
          .from("student_progress")
          .select("lesson_id")
          .eq("student_id", userData.user.id)
          .eq("completed", true);

        const ids = Array.from(
          new Set(
            (progressRows ?? [])
              .map((r: { lesson_id: unknown }) => r.lesson_id)
              .filter((n): n is number => typeof n === "number" && n >= 1),
          ),
        ).sort((x, y) => x - y);
        setCompletedLessonIds(ids.length > 0 ? ids : [1]);

        const { data: gRow } = await supabase
          .from("eco_garden")
          .select("garden_data, last_watered")
          .eq("student_id", userData.user.id)
          .maybeSingle();

        let data = normalizeGardenData((gRow as { garden_data?: unknown } | null)?.garden_data);
        const lw = (gRow as { last_watered?: string } | null)?.last_watered;
        if (lw) {
          setLastWateredIso(lw);
          const last = new Date(lw);
          const now = new Date();
          const d = daysBetween(last, now);
          if (d > 0) {
            setWelcomeDays(d);
            setWelcomeFlash(true);
            window.setTimeout(() => setWelcomeFlash(false), 5000);
          }
          const grown = applyOfflineGrowth(data, last, now);
          if (JSON.stringify(grown.cells) !== JSON.stringify(data.cells)) {
            data = grown;
            if (canFullyAccessGarden(state)) {
              await supabase.from("eco_garden").upsert(
                {
                  student_id: userData.user.id,
                  garden_data: data as unknown as Record<string, unknown>,
                  last_watered: lw,
                  total_plants: countGardenPlants(data),
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "student_id" },
              );
            }
          }
        }
        setGardenData(data);
        gardenDataRef.current = data;

        const { data: scores } = await supabase
          .from("game_scores")
          .select("score")
          .eq("student_id", userData.user.id)
          .eq("game_name", GAME_NAME)
          .order("score", { ascending: false })
          .limit(1)
          .maybeSingle();

        setHighScore(Number((scores as { score?: number } | null)?.score ?? 0) || 0);
        setPhase("garden");
        setBootDone(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load garden.");
        setPhase("garden");
        setBootDone(true);
      }
    };
    void run();
  }, []);

  useEffect(() => {
    const lvl = getStoredGameLevel();
    setGameLevel(lvl);
    roundLevelRef.current = lvl;
  }, []);

  const resetPlay = useCallback(() => {
    const L = roundLevelRef.current;
    roundEndedRef.current = false;
    setTimeLeft(L.roundSeconds);
    setWateredSession(0);
    setEcoPoints(0);
    setTypingBuffer("");
    syncDrops([]);
    spawnAccRef.current = 0;
    lastTsRef.current = null;
    seenPlantFactsRef.current = new Set();
    setFactPopup(null);
    setAnimalToast(null);
    setResultsFact(null);
    setNewRecord(false);
    setPetDance(false);
    setWaterBurst(null);
    streakGardenPlaySessionDoneRef.current = false;
    if (factClearRef.current) clearTimeout(factClearRef.current);
  }, [syncDrops]);

  const endPlay = useCallback(() => {
    if (roundEndedRef.current) return;
    roundEndedRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setPhase("results");
    setResultsFact(randomPlantsGardenFact());
  }, []);

  const showPlantFact = useCallback((plantKey: string) => {
    const f = plantFactForKey(plantKey);
    if (!f) return;
    if (seenPlantFactsRef.current.has(plantKey)) return;
    seenPlantFactsRef.current.add(plantKey);
    if (factClearRef.current) clearTimeout(factClearRef.current);
    setFactPopup(`Did you know? ${f}`);
    factClearRef.current = setTimeout(() => setFactPopup(null), 3800);
  }, []);

  const registerAnimals = useCallback(
    (data: GardenData) => {
      const n = countGardenPlants(data);
      const fresh = newlyUnlockedAnimals(n, data.animalsUnlocked);
      if (fresh.length === 0) return data;
      const nextIds = [...data.animalsUnlocked, ...fresh.map((a) => a.id)];
      const toast = fresh[0]!;
      setAnimalToast(toast);
      window.setTimeout(() => setAnimalToast(null), 4200);
      return { ...data, animalsUnlocked: nextIds };
    },
    []
  );

  const spawnDrop = useCallback(() => {
    const L = roundLevelRef.current;
    const ids = completedLessonIds.length ? completedLessonIds : [1];
    const target =
      L.id === "champion"
        ? typingTargetFromPhrase(pickGardenSentence(ids))
        : pickGardenWord(gardenWordPool(ids, L)).toLowerCase();
    const h = playAreaRef.current?.clientHeight ?? 400;
    const vy = (62 + Math.random() * 28) * L.speedMultiplier * (h / 400);
    const drop: RainDrop = {
      id: randomId(),
      target,
      xPct: 10 + Math.random() * 80,
      y: -20,
      vy,
      state: "fall",
      shakeKey: 0,
    };
    syncDrops([...dropsRef.current, drop]);
  }, [completedLessonIds, syncDrops]);

  useEffect(() => {
    if (phase !== "play" || roundEndedRef.current) return;

    const tick = (ts: number) => {
      if (roundEndedRef.current) return;
      const last = lastTsRef.current;
      lastTsRef.current = ts;
      const dt = last == null ? 0 : Math.min(48, ts - last) / 1000;
      const L = roundLevelRef.current;
      const h = playAreaRef.current?.clientHeight ?? 400;

      const next: RainDrop[] = [];
      for (const d of dropsRef.current) {
        if (d.state === "hit") continue;
        if (d.state === "miss") {
          next.push(d);
          continue;
        }
        const ny = d.y + d.vy * dt;
        if (ny > h - 4) {
          next.push({ ...d, y: ny, state: "miss" });
        } else {
          next.push({ ...d, y: ny });
        }
      }

      spawnAccRef.current += dt * 1000;
      const spawnEvery = Math.max(1100, 3200 / Math.max(0.35, L.speedMultiplier));
      while (spawnAccRef.current >= spawnEvery && next.filter((d) => d.state === "fall").length < 5) {
        spawnAccRef.current -= spawnEvery;
        const ids = completedLessonIds.length ? completedLessonIds : [1];
        const target =
          L.id === "champion"
            ? typingTargetFromPhrase(pickGardenSentence(ids))
            : pickGardenWord(gardenWordPool(ids, L)).toLowerCase();
        const vy = (62 + Math.random() * 28) * L.speedMultiplier * (h / 400);
        next.push({
          id: randomId(),
          target,
          xPct: 10 + Math.random() * 80,
          y: -20,
          vy,
          state: "fall",
          shakeKey: 0,
        });
      }

      dropsRef.current = next;
      setDrops([...next]);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [phase, completedLessonIds]);

  useEffect(() => {
    if (phase !== "play" || roundEndedRef.current) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          endPlay();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, endPlay]);

  useEffect(() => {
    if (phase === "play") inputRef.current?.focus();
  }, [phase]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (phase !== "play" || roundEndedRef.current) return;
      if (!trialState || !canFullyAccessGarden(trialState)) return;
      const L = roundLevelRef.current;
      const allowSpace = L.id === "champion";

      if (e.key === "Backspace") {
        e.preventDefault();
        setTypingBuffer((b) => b.slice(0, -1));
        return;
      }

      const appendChar = (char: string) => {
        const nextBuf = typingBuffer + char;
        const falling = dropsRef.current.filter((d) => d.state === "fall");
        const matches = falling.filter((d) => d.target.startsWith(nextBuf));
        if (matches.length === 0) {
          setTypingBuffer("");
          const partial = falling.filter((d) => d.target.startsWith(typingBuffer));
          const toShake =
            partial.length > 0
              ? partial.reduce((a, b) => (a.y > b.y ? a : b)).id
              : falling.sort((a, b) => b.y - a.y)[0]?.id;
          if (toShake) {
            syncDrops(
              dropsRef.current.map((d) =>
                d.id === toShake ? { ...d, shakeKey: d.shakeKey + 1 } : d
              )
            );
          }
          return;
        }

        const exact = matches.find((d) => d.target === nextBuf);
        if (exact) {
          const mult = roundLevelRef.current.pointsMultiplier;
          const gained = Math.round(14 * mult);
          setEcoPoints((p) => p + gained);
          setWateredSession((w) => w + 1);

          const { next, plantKey, newStage } = waterGardenCell(gardenDataRef.current, maxLesson);
          const merged = registerAnimals(next);
          setGardenData(merged);
          gardenDataRef.current = merged;
          void (async () => {
            await persistGarden(merged);
            const uid = userIdRef.current;
            if (!uid || !trialState || !canFullyAccessGarden(trialState) || newStage < 1) return;
            try {
              const supabase = createClient();
              const isPlant = newStage === 1;
              const result = await awardXp(
                uid,
                3,
                XP_SOURCES.GAME_ECO_GARDEN,
                isPlant ? "Planted a new plant" : "Watered the garden",
                supabase
              );
              if (result) setXpAwarded(result);
            } catch (err) {
              console.error("XP award failed:", err);
            }
          })();

          if (!streakGardenPlaySessionDoneRef.current) {
            streakGardenPlaySessionDoneRef.current = true;
            void (async () => {
              try {
                const supabase = createClient();
                const uid = userIdRef.current;
                if (!uid) {
                  console.warn("Cannot update streak — no authenticated user");
                  return;
                }
                const streakResult = await updateStreak(uid, "game", supabase);
                if (streakResult) {
                  setStreakUpdate(streakResult);
                }
              } catch (err) {
                console.error("Streak update failed:", err);
              }
            })();
          }

          if (plantKey) showPlantFact(plantKey);
          const idx = merged.cells.findIndex((c) => c.plantKey === plantKey && c.stage === newStage);
          setWaterBurst({ key: Date.now(), plot: Math.max(0, idx) });

          syncDrops(dropsRef.current.filter((d) => d.id !== exact.id));
          setTypingBuffer("");
          return;
        }

        const maxLen = Math.max(...matches.map((d) => d.target.length));
        if (nextBuf.length >= maxLen) {
          setTypingBuffer("");
          return;
        }
        setTypingBuffer(nextBuf);
      };

      if (e.key === " " && allowSpace) {
        e.preventDefault();
        appendChar(" ");
        return;
      }

      if (e.key.length !== 1) return;
      const ch = e.key.toLowerCase();
      if (!/[a-z0-9]/.test(ch)) return;
      e.preventDefault();
      appendChar(ch);
    },
    [phase, typingBuffer, maxLesson, persistGarden, registerAnimals, showPlantFact, syncDrops, trialState]
  );

  const startPlay = () => {
    if (!trialState || !canFullyAccessGarden(trialState)) return;
    const lvl = getStoredGameLevel();
    roundLevelRef.current = lvl;
    setGameLevel(lvl);
    roundIdRef.current += 1;
    resetPlay();
    roundEndedRef.current = false;
    setPhase("play");
    queueMicrotask(() => spawnDrop());
  };

  useEffect(() => {
    if (phase !== "results") return;
    const rid = roundIdRef.current;
    let dedupeKey: string | null = null;

    const run = async () => {
      try {
        if (!trialState || !canFullyAccessGarden(trialState)) return;

        const supabase = createClient();
        const { data: userData, error: uErr } = await supabase.auth.getUser();
        if (uErr) throw uErr;
        if (!userData.user) return;

        dedupeKey = `mgk-${GAME_NAME}-${userData.user.id}-${rid}`;
        if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(dedupeKey)) return;
        if (typeof sessionStorage !== "undefined") sessionStorage.setItem(dedupeKey, "1");

        const scoreNow = wateredSession;
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

        const finalGarden = gardenDataRef.current;
        await supabase.from("eco_garden").upsert(
          {
            student_id: userData.user.id,
            garden_data: finalGarden as unknown as Record<string, unknown>,
            last_watered: new Date().toISOString(),
            total_plants: countGardenPlants(finalGarden),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "student_id" }
        );

        setHighScore((h) => {
          setNewRecord(scoreNow > h);
          return Math.max(h, scoreNow);
        });

        if (scoreNow > 0) {
          setPetDance(true);
          window.setTimeout(() => setPetDance(false), 2000);
        }
      } catch {
        if (typeof sessionStorage !== "undefined" && dedupeKey) sessionStorage.removeItem(dedupeKey);
      }
    };

    void run();
  }, [phase, wateredSession, ecoPoints, trialState]);

  const shareGarden = async () => {
    const text = `${studentName}'s Eco Garden on My Green Keys — ${totalPlants} plants and growing! 🌱`;
    try {
      if (navigator.share) await navigator.share({ title: "My Eco Garden", text });
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        window.alert("Copied to clipboard — share with a friend!");
      }
    } catch {
      /* user cancelled */
    }
  };

  const petEmoji = petType === "turtle" ? "🐢" : "🐼";
  const co2 = gardenCo2AbsorptionKg(gardenData);

  const grid = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 8,
        maxWidth: 440,
        margin: "0 auto",
      }}
    >
      {gardenData.cells.map((cell, i) => (
        <div
          key={i}
          style={{
            aspectRatio: "1",
            borderRadius: 14,
            background: "linear-gradient(180deg, rgba(139,195,74,0.35), rgba(62,39,35,0.65))",
            border:
              waterBurst?.plot === i
                ? "2px solid #29b6f6"
                : "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            boxShadow: waterBurst?.plot === i ? "0 0 18px rgba(41,182,246,0.7)" : undefined,
            transition: "box-shadow 0.3s ease",
          }}
        >
          {cell.plantKey ? (
            <>
              <span>{cellDisplayEmoji(cell)}</span>
              <span style={{ fontSize: 9, fontWeight: 800, opacity: 0.85, marginTop: 2 }}>
                {GARDEN_PLANTS[cell.plantKey]?.label ?? cell.plantKey}
              </span>
            </>
          ) : (
            <span style={{ opacity: 0.35, fontSize: 18 }}>·</span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-poppins), Poppins, sans-serif",
        background: "linear-gradient(180deg, #87CEEB 0%, #b3e5fc 28%, #a5d6a7 55%, #6d4c41 100%)",
        color: "#1b2e1b",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes eg-cloud { 0%{ transform: translateX(0); } 100%{ transform: translateX(40px); } }
          @keyframes eg-shake {
            0%,100%{ transform: translateX(0); }
            30%{ transform: translateX(-4px); }
            60%{ transform: translateX(4px); }
          }
          @keyframes eg-pet {
            0%{ transform: rotate(0) translateY(0); }
            40%{ transform: rotate(8deg) translateY(-4px); }
            80%{ transform: rotate(-8deg) translateY(-4px); }
            100%{ transform: rotate(0) translateY(0); }
          }
          .eg-shake { animation: eg-shake 0.32s ease; }
          .eg-pet-dance { animation: eg-pet 0.65s ease-in-out infinite; }
        `,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "8%",
          top: 40,
          fontSize: 48,
          opacity: 0.9,
          animation: "eg-cloud 8s ease-in-out infinite alternate",
        }}
      >
        ☁️
      </div>
      <div
        style={{
          position: "absolute",
          right: "12%",
          top: 70,
          fontSize: 56,
          animation: "eg-cloud 11s ease-in-out infinite alternate-reverse",
        }}
      >
        ☀️
      </div>
      {totalPlants >= 5 && (
        <div style={{ position: "absolute", right: "20%", top: "22%", fontSize: 22 }}>
          🦋
        </div>
      )}
      {totalPlants >= 10 && (
        <div style={{ position: "absolute", left: "18%", top: "28%", fontSize: 22 }}>
          🐦
        </div>
      )}

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
          background: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", opacity: 0.75 }}>
            MY ECO GARDEN
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 950, marginTop: 4 }}>
            {studentName}&apos;s Garden 🌱
          </h1>
        </div>
        <Link
          href="/games"
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.15)",
            color: "#1b2e1b",
            fontWeight: 800,
            textDecoration: "none",
            background: "rgba(255,255,255,0.5)",
          }}
        >
          ← Games
        </Link>
      </header>

      {trialState?.status === "active" && bootDone ? <TrialBanner state={trialState} /> : null}

      {!bootDone ? <p style={{ padding: 20, fontWeight: 700 }}>Loading garden…</p> : null}

      {bootDone && signedIn && trialState?.status === "locked" ? (
        <main
          style={{
            position: "relative",
            zIndex: 3,
            padding: "32px 20px 48px",
            maxWidth: 560,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <Lock className="mx-auto mb-4 h-14 w-14 text-amber-800" strokeWidth={2} aria-hidden />
          <h2 style={{ fontSize: 24, fontWeight: 950, color: "#1b2e1b" }}>Almost there!</h2>
          <p style={{ marginTop: 14, fontWeight: 800, fontSize: 17, lineHeight: 1.5, color: "#1b2e1b" }}>
            Complete lesson 20 to unlock 3 free days of Eco Garden
          </p>
          <p style={{ marginTop: 12, fontWeight: 600, fontSize: 15, lineHeight: 1.55, opacity: 0.92 }}>
            You&apos;ll get three full days to grow your garden, unlock visitors, and play — on us. Finish lesson
            20, then come back here anytime.
          </p>
          <Link
            href="/lesson"
            style={{
              marginTop: 24,
              display: "inline-block",
              padding: "14px 24px",
              borderRadius: 999,
              background: "linear-gradient(90deg,#43a047,#2e7d32)",
              color: "#fff",
              fontWeight: 950,
              textDecoration: "none",
              boxShadow: "0 10px 28px rgba(46,125,50,0.35)",
            }}
          >
            Go to lessons
          </Link>
        </main>
      ) : null}

      {bootDone && !(signedIn && trialState?.status === "locked") ? (
        <>
          {welcomeFlash && welcomeDays > 0 && trialState?.status !== "locked" ? (
            <div
              style={{
                margin: "12px 16px 0",
                padding: 14,
                borderRadius: 16,
                background: "rgba(255,249,196,0.95)",
                border: "2px solid #ffc107",
                fontWeight: 800,
              }}
            >
              Welcome back! Your garden missed you! 🌱 It&apos;s been {welcomeDays} day
              {welcomeDays === 1 ? "" : "s"} — your plants kept growing.
            </div>
          ) : null}

          {error ? <p style={{ padding: 16, fontWeight: 700, color: "#b71c1c" }}>{error}</p> : null}

          {phase === "garden" || phase === "play" ? (
            <main
              style={{
                position: "relative",
                zIndex: 3,
                padding: "16px 16px 48px",
                maxWidth: 720,
                margin: "0 auto",
              }}
            >
              <div style={{ position: "relative" }}>
                {phase === "garden" ? (
                  <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 14,
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                <span style={{ background: "rgba(255,255,255,0.55)", padding: "8px 12px", borderRadius: 12 }}>
                  🪴 {totalPlants} plants
                </span>
                <span style={{ background: "rgba(255,255,255,0.55)", padding: "8px 12px", borderRadius: 12 }}>
                  📅 {gardenAgeDays} days old
                </span>
                <span style={{ background: "rgba(255,255,255,0.55)", padding: "8px 12px", borderRadius: 12 }}>
                  🐾 {activeAnimals.length} visitors
                </span>
              </div>
              {grid}
              {activeAnimals.length > 0 && (
                <div style={{ marginTop: 16, fontWeight: 700, fontSize: 14 }}>
                  Visiting: {activeAnimals.map((a) => `${a.emoji} ${a.label}`).join(" · ")}
                </div>
              )}
              <button
                type="button"
                onClick={startPlay}
                disabled={trialState?.status === "expired"}
                style={{
                  marginTop: 20,
                  padding: "14px 22px",
                  borderRadius: 16,
                  border: "none",
                  fontWeight: 950,
                  cursor: trialState?.status === "expired" ? "not-allowed" : "pointer",
                  fontSize: 16,
                  background: "linear-gradient(90deg,#43a047,#2e7d32)",
                  color: "#fff",
                  boxShadow: "0 10px 28px rgba(46,125,50,0.35)",
                  opacity: trialState?.status === "expired" ? 0.5 : 1,
                }}
              >
                Water the garden 💧
              </button>
              <p style={{ marginTop: 12, opacity: 0.85, fontWeight: 600, fontSize: 14, lineHeight: 1.45 }}>
                Type falling words to water your plots. Your garden saves automatically and grows between visits!
              </p>
              <p style={{ marginTop: 8, fontSize: 13, fontWeight: 700 }}>
                Best session: <strong>{highScore}</strong> waters
              </p>
                  </>
                ) : phase === "play" ? (
                  <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10, fontWeight: 800 }}>
                <span style={{ background: "rgba(255,255,255,0.55)", padding: "8px 12px", borderRadius: 12 }}>
                  ⏱ {timeLeft}s
                </span>
                <span style={{ background: "rgba(255,255,255,0.55)", padding: "8px 12px", borderRadius: 12 }}>
                  💧 {wateredSession} watered
                </span>
                <span style={{ color: "#1b5e20" }}>✨ {ecoPoints} eco pts</span>
                <span style={{ fontSize: 13 }}>{gameLevel.emoji} {gameLevel.label}</span>
              </div>
              <div
                ref={playAreaRef}
                style={{
                  position: "relative",
                  height: "min(48vh, 380px)",
                  borderRadius: 20,
                  border: "2px solid rgba(255,255,255,0.6)",
                  background: "linear-gradient(180deg, rgba(179,229,252,0.6), rgba(129,199,132,0.35))",
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                {drops.map((d) => {
                  if (d.state !== "fall") return null;
                  return (
                    <div
                      key={d.id}
                      className={d.shakeKey ? "eg-shake" : undefined}
                      style={{
                        position: "absolute",
                        left: `${d.xPct}%`,
                        top: d.y,
                        transform: "translateX(-50%)",
                        padding: "6px 10px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.92)",
                        fontWeight: 900,
                        fontSize: 13,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        maxWidth: "90%",
                        textAlign: "center",
                      }}
                    >
                      💧 {d.target}
                    </div>
                  );
                })}
                <div
                  style={{
                    position: "absolute",
                    right: 12,
                    bottom: 12,
                    fontSize: 40,
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                  }}
                >
                  🪣
                </div>
                {factPopup && (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: 10,
                      transform: "translateX(-50%)",
                      maxWidth: "94%",
                      padding: "10px 12px",
                      borderRadius: 14,
                      background: "#fffde7",
                      border: "2px solid #cddc39",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {factPopup}
                  </div>
                )}
                {animalToast && (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: 56,
                      transform: "translateX(-50%)",
                      maxWidth: "94%",
                      padding: "10px 12px",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.95)",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {animalToast.emoji} A {animalToast.label.toLowerCase()} visited! {animalToast.fact}
                  </div>
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Type falling words"
                value={typingBuffer}
                readOnly
                onKeyDown={onKeyDown}
                placeholder={gameLevel.id === "champion" ? "Type the full sentence…" : "Type the word…"}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(0,0,0,0.12)",
                  fontWeight: 800,
                  fontSize: 15,
                }}
              />
              <button
                type="button"
                onClick={() => {
                  endPlay();
                }}
                style={{
                  marginTop: 10,
                  padding: "8px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: "rgba(255,255,255,0.6)",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                End session early
              </button>
                  </>
                ) : null}
                {trialState?.status === "expired" ? (
                  <ExpiredOverlay plantCount={totalPlants} ecoPoints={profileEcoPoints} />
                ) : null}
              </div>
            </main>
          ) : null}

          {phase === "results" ? (
        <div style={{ padding: "20px 18px 48px", maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, fontWeight: 950 }}>Garden session complete</h2>
          <div
            style={{
              marginTop: 14,
              padding: 16,
              borderRadius: 16,
              background: "rgba(255,255,255,0.65)",
              lineHeight: 1.55,
              fontWeight: 600,
            }}
          >
            <p>
              Plants watered this session: <strong>{wateredSession}</strong>
            </p>
            <p>
              Total garden size: <strong>{totalPlants}</strong> plants · growth points {sumGardenGrowth(gardenData)}
            </p>
            <p>
              Visitors unlocked: <strong>{gardenData.animalsUnlocked.length}</strong>
            </p>
            <p>
              Your garden helps air feel fresher — about <strong>{co2}</strong> kg CO₂ absorbed per year (kid-sized
              estimate)!
            </p>
            <p style={{ color: "#33691e" }}>
              Eco points earned: <strong>{ecoPoints}</strong>
            </p>
            {newRecord && <p style={{ fontWeight: 950, color: "#f57f17" }}>🏆 New best watering session!</p>}
          </div>

          {resultsFact && (
            <p style={{ marginTop: 14, fontWeight: 600 }}>
              {resultsFact.emoji} {resultsFact.fact}
            </p>
          )}

          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 16,
              background: "rgba(255,255,255,0.5)",
              textAlign: "center",
            }}
          >
            <div className={petDance ? "eg-pet-dance" : undefined} style={{ fontSize: 44 }}>
              {petEmoji}
            </div>
            <div style={{ fontWeight: 800, marginTop: 6 }}>
              {petName || "Your pet"} visited the garden!
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
            <button
              type="button"
              onClick={shareGarden}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                border: "none",
                fontWeight: 950,
                cursor: "pointer",
                background: "linear-gradient(90deg,#7e57c2,#42a5f5)",
                color: "#fff",
              }}
            >
              Share your garden 📸
            </button>
            <button
              type="button"
              onClick={startPlay}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                border: "none",
                fontWeight: 950,
                cursor: "pointer",
                background: "linear-gradient(90deg,#43a047,#2e7d32)",
                color: "#fff",
              }}
            >
              Water again
            </button>
            <button
              type="button"
              onClick={() => {
                resetPlay();
                setPhase("garden");
              }}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                fontWeight: 800,
                border: "1px solid rgba(0,0,0,0.2)",
                background: "rgba(255,255,255,0.7)",
                cursor: "pointer",
              }}
            >
              Just view garden
            </button>
          </div>
        </div>
          ) : null}
        </>
      ) : null}
      <MilestoneCelebration streakUpdate={streakUpdate} onClose={() => setStreakUpdate(null)} />
      <RankUpCelebration xpAwarded={xpAwarded} onClose={() => setXpAwarded(null)} />
    </div>
  );
}
