"use client";

import Image from "next/image";
import Link from "next/link";
import { Nunito } from "next/font/google";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bug,
  Check,
  Crown,
  Gamepad2,
  Globe,
  Heart,
  Leaf,
  Lock,
  Play,
  Recycle,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Target,
  TreeDeciduous,
  Waves,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  GAME_LEVELS,
  type GameLevelDefinition,
  type GameLevelId,
  getStoredGameLevel,
  setStoredGameLevel,
  suggestedLevelIdForAge,
} from "@/lib/games/gameLevels";
import "@/app/globals.css";

const nunito = Nunito({
  weight: ["700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const LEVEL_ORDER: GameLevelId[] = ["seedling", "explorer", "guardian", "champion"];

const LEVEL_IMAGE_SRC: Record<GameLevelId, string> = {
  seedling: "/images/games/levels/level-seedling.png",
  explorer: "/images/games/levels/level-explorer.png",
  guardian: "/images/games/levels/level-guardian.png",
  champion: "/images/games/levels/level-champion.png",
};

const LEVEL_DIFFICULTY_DESC: Record<GameLevelId, string> = {
  seedling: "Easy — perfect for beginners",
  explorer: "Medium — for confident typers",
  guardian: "Hard — for skilled typers",
  champion: "Expert — true masters only",
};

const HUB_STARS_KEY = "mgk_hub_game_stars";

type GameCardDef = {
  slug: string;
  key: string;
  Icon: LucideIcon;
  name: string;
  description: string;
  imageSrc: string;
  unlockLessons: number;
  requiresPaid: boolean;
  gradient: string;
};

const GAMES: GameCardDef[] = [
  {
    slug: "/games/falling-leaves",
    key: "falling-leaves",
    Icon: Leaf,
    name: "Falling Leaves",
    description: "Catch enchanted leaves by typing lesson words—save the forest!",
    imageSrc: "/images/games/game-falling-leaves.jpg",
    unlockLessons: 0,
    requiresPaid: false,
    gradient: "linear-gradient(160deg, #F39C12 0%, #E67E22 100%)",
  },
  {
    slug: "/games/sort-recycling",
    key: "sort-recycling",
    Icon: Recycle,
    name: "Sort Recycling",
    description: "Eco Hero City: sort waste into plastic, paper, organic, and glass!",
    imageSrc: "/images/games/game-sort-recycling.jpg",
    unlockLessons: 5,
    requiresPaid: false,
    gradient: "linear-gradient(160deg, #1ABC9C 0%, #16A085 100%)",
  },
  {
    slug: "/games/save-the-ocean",
    key: "save-the-ocean",
    Icon: Waves,
    name: "Save the Ocean",
    description: "Clear plastic by typing fast and free Zara the sea turtle!",
    imageSrc: "/images/games/game-save-ocean.jpg",
    unlockLessons: 40,
    requiresPaid: false,
    gradient: "linear-gradient(160deg, #3498DB 0%, #2980B9 100%)",
  },
  {
    slug: "/games/eco-garden",
    key: "eco-garden",
    Icon: Sprout,
    name: "Eco Garden",
    description: "Grow a magical garden—type raindrops, unlock visitors, watch it bloom!",
    imageSrc: "/images/games/game-eco-garden.jpg",
    unlockLessons: 20,
    requiresPaid: true,
    gradient: "linear-gradient(160deg, #2ECC71 0%, #27AE60 100%)",
  },
  {
    slug: "/games/kind-world-academy",
    key: "kind-world-academy",
    Icon: Heart,
    name: "Kind World Academy",
    description: "Spread kindness around the world—typing adventure awaits!",
    imageSrc: "/images/games/game-kind-world.jpg",
    unlockLessons: 60,
    requiresPaid: true,
    gradient: "linear-gradient(160deg, #9B59B6 0%, #8E44AD 100%)",
  },
];

const COMING_SOON = [
  { Icon: Sparkles, name: "Butterfly Catch" },
  { Icon: Target, name: "Animal Race" },
  { Icon: Globe, name: "Eco Quiz" },
] as const;

function hasPaidPlan(planType: string | null | undefined): boolean {
  const p = (planType ?? "").toLowerCase().trim();
  if (!p) return false;
  return p === "family" || p === "school_starter" || p === "school_growth";
}

function readHubStars(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(HUB_STARS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      const n = Number(v);
      if (Number.isFinite(n) && n >= 1 && n <= 3) out[k] = Math.round(n);
    }
    return out;
  } catch {
    return {};
  }
}

function isGameImplemented(slug: string): boolean {
  return (
    slug === "/games/falling-leaves" ||
    slug === "/games/sort-recycling" ||
    slug === "/games/save-the-ocean" ||
    slug === "/games/eco-garden"
  );
}

export default function GamesHubPage() {
  const [completedLessons, setCompletedLessons] = useState<number | null>(null);
  const [paidPlan, setPaidPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileAge, setProfileAge] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<GameLevelDefinition>(() => getStoredGameLevel());
  const [ecoGardenPlantCount, setEcoGardenPlantCount] = useState<number | null>(null);
  const [hubStars, setHubStars] = useState<Record<string, number>>({});
  const [levelBounceId, setLevelBounceId] = useState<GameLevelId | null>(null);

  const refreshHubStars = useCallback(() => {
    setHubStars(readHubStars());
  }, []);

  useEffect(() => {
    refreshHubStars();
    const onFocus = () => refreshHubStars();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshHubStars]);

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createClient();
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!userData.user) {
          setLoading(false);
          return;
        }

        const { data: profileRow } = await supabase
          .from("profiles")
          .select("age")
          .eq("id", userData.user.id)
          .maybeSingle();
        const age = (profileRow as { age?: number } | null)?.age ?? null;
        setProfileAge(age);

        const { data: progressRows, error: pErr } = await supabase
          .from("student_progress")
          .select("lesson_id")
          .eq("student_id", userData.user.id)
          .eq("completed", true);
        if (pErr) throw pErr;
        const uniqueDone = new Set(
          (progressRows ?? [])
            .map((r) => r.lesson_id)
            .filter((n): n is number => typeof n === "number" && n >= 1),
        ).size;
        setCompletedLessons(uniqueDone);

        const { data: sub, error: subErr } = await supabase
          .from("subscriptions")
          .select("plan_type, status")
          .eq("user_id", userData.user.id)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const subStatusRaw = (sub as { status?: string } | null)?.status ?? null;
        const subPlanRaw = (sub as { plan_type?: string } | null)?.plan_type ?? null;
        const active = (subStatusRaw ?? "").toLowerCase().trim() === "active";
        const planOk = hasPaidPlan(subPlanRaw);
        console.log("[GamesHub] subscription row", {
          userId: userData.user.id,
          plan_type: subPlanRaw,
          status: subStatusRaw,
          error: subErr?.message ?? null,
          paidPlanComputed: active && planOk,
        });
        setPaidPlan(active && planOk);

        const { data: gardenRow, error: gardenErr } = await supabase
          .from("eco_garden")
          .select("total_plants")
          .eq("student_id", userData.user.id)
          .maybeSingle();
        if (!gardenErr) {
          const tp = (gardenRow as { total_plants?: number } | null)?.total_plants;
          setEcoGardenPlantCount(typeof tp === "number" ? tp : null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load games.");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const done = completedLessons ?? 0;
  const recommendedId = suggestedLevelIdForAge(profileAge);

  const lessonMilestones = useMemo(() => GAMES.map((g) => g.unlockLessons).filter((n) => n > 0), []);
  const nextLessonUnlock =
    [...new Set(lessonMilestones)].sort((a, b) => a - b).find((m) => done < m) ?? null;
  const progressToNextPct =
    nextLessonUnlock != null && nextLessonUnlock > 0
      ? Math.min(100, (done / nextLessonUnlock) * 100)
      : 100;

  const starsForGame = (g: GameCardDef): number | null => {
    const fromStorage = hubStars[g.key];
    if (fromStorage) return fromStorage;
    if (g.key === "eco-garden" && ecoGardenPlantCount != null && ecoGardenPlantCount > 0) {
      return Math.min(3, Math.max(1, Math.ceil(ecoGardenPlantCount / 3)));
    }
    return null;
  };

  const handleLevelSelect = (id: GameLevelId) => {
    setStoredGameLevel(id);
    setSelectedLevel(GAME_LEVELS[id]);
    setLevelBounceId(id);
    window.setTimeout(() => setLevelBounceId(null), 520);
  };

  const fontClass = nunito.className;

  return (
    <div
      className={fontClass}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #87CEEB 0%, #B8E0FE 45%, #E8F4FD 100%)",
        color: "#1A2F23",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes gamesHubFadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gamesHubFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes gamesHubFloatSlow {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-6px) translateX(4px); }
          66% { transform: translateY(4px) translateX(-3px); }
        }
        @keyframes gamesHubLeaf {
          0% { transform: translateY(-20%) rotate(0deg); opacity: 0.85; }
          100% { transform: translateY(120vh) rotate(360deg); opacity: 0.2; }
        }
        @keyframes gamesHubShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes gamesHubPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.45); }
          50% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); }
        }
        @keyframes gamesHubBounce {
          0% { transform: scale(1); }
          35% { transform: scale(1.06); }
          55% { transform: scale(0.98); }
          75% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        .games-hub-card-animate {
          animation: gamesHubFadeIn 0.55s ease backwards;
        }
        .games-hub-game-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .games-hub-game-card:hover {
          transform: scale(1.04) translateY(-4px);
          box-shadow: 0 20px 44px rgba(0,0,0,0.22) !important;
        }
        .games-hub-level-bounce {
          animation: gamesHubBounce 0.52s cubic-bezier(0.34, 1.4, 0.64, 1);
        }
        .games-hub-play-pulse {
          animation: gamesHubPulse 1.8s ease-in-out infinite;
        }
        .games-hub-shimmer {
          background: linear-gradient(
            110deg,
            rgba(255,215,0,0) 0%,
            rgba(255,235,150,0.55) 45%,
            rgba(255,215,0,0) 90%
          );
          background-size: 200% 100%;
          animation: gamesHubShimmer 2.5s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .games-hub-card-animate,
          .games-hub-level-bounce,
          .games-hub-play-pulse,
          .games-hub-shimmer,
          .games-hub-float,
          .games-hub-leaf-fall {
            animation: none !important;
          }
          .games-hub-game-card:hover {
            transform: none;
          }
          .games-hub-level-card:hover {
            transform: none !important;
          }
        }
      `}</style>

      {/* Hero — full-width band at top; title first for visibility */}
      <header
        style={{
          position: "relative",
          zIndex: 5,
          width: "100%",
          minHeight: 180,
          background: "#1A8F4E",
          color: "#ffffff",
          paddingTop: 20,
          paddingLeft: 32,
          paddingRight: 32,
          paddingBottom: "clamp(36px, 6vw, 52px)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.22,
            zIndex: 0,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const DecoIcon = i % 3 === 0 ? Leaf : i % 3 === 1 ? Sprout : Star;
            return (
            <span
              key={i}
              className="games-hub-leaf-fall inline-flex text-white/90"
              style={{
                position: "absolute",
                left: `${8 + i * 16}%`,
                top: "-10%",
                animation: `gamesHubLeaf ${14 + i * 2}s linear infinite`,
                animationDelay: `${i * 1.2}s`,
              }}
            >
              <DecoIcon className={i % 2 === 0 ? "h-5 w-5" : "h-4 w-4"} strokeWidth={2} aria-hidden />
            </span>
            );
          })}
        </div>

        <div
          className="games-hub-float text-white/90"
          style={{
            position: "absolute",
            right: "8%",
            top: "22%",
            animation: "gamesHubFloat 4s ease-in-out infinite",
            pointerEvents: "none",
            opacity: 0.55,
            zIndex: 0,
          }}
        >
          <Star className="h-7 w-7 fill-white/20" strokeWidth={2} aria-hidden />
        </div>
        <div
          className="text-white/90"
          style={{
            position: "absolute",
            left: "6%",
            top: "28%",
            animation: "gamesHubFloatSlow 5.5s ease-in-out infinite",
            pointerEvents: "none",
            opacity: 0.5,
            zIndex: 0,
          }}
        >
          <Leaf className="h-6 w-6" strokeWidth={2} aria-hidden />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <h1
            className="flex flex-wrap items-center gap-3"
            style={{
              color: "#ffffff",
              fontSize: "clamp(2.25rem, 6vw, 3.25rem)",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.12,
              textShadow:
                "0 2px 8px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.5)",
            }}
          >
            <Gamepad2 className="h-9 w-9 shrink-0 text-white/95 sm:h-11 sm:w-11" strokeWidth={2} aria-hidden />
            <span>Game Zone!</span>
          </h1>
          <p
            style={{
              color: "#ffffff",
              margin: "14px 0 0",
              fontSize: "clamp(1.05rem, 2.8vw, 1.35rem)",
              fontWeight: 700,
              opacity: 0.98,
              maxWidth: 560,
              lineHeight: 1.5,
            }}
          >
            Learn to type while saving the planet!
          </p>
          <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 20 }}>
            <Link
              href="/lesson"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 48,
                padding: "0 20px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.22)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 15,
                textDecoration: "none",
                border: "2px solid rgba(255,255,255,0.55)",
              }}
            >
              ← Back to lessons
            </Link>
          </div>
        </div>

        {/* Nature strip */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 28,
            background: "linear-gradient(180deg, transparent, rgba(26,143,78,0.95))",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 10,
            paddingBottom: 4,
            fontSize: 18,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <TreeDeciduous className="h-[18px] w-[18px] text-white/85" strokeWidth={2} aria-hidden />
          <Sprout className="h-[18px] w-[18px] text-white/85" strokeWidth={2} aria-hidden />
          <Leaf className="h-[18px] w-[18px] text-white/85" strokeWidth={2} aria-hidden />
          <Sun className="h-[18px] w-[18px] text-white/85" strokeWidth={2} aria-hidden />
          <Bug className="h-[18px] w-[18px] text-white/85" strokeWidth={2} aria-hidden />
          <TreeDeciduous className="h-[18px] w-[18px] text-white/85" strokeWidth={2} aria-hidden />
        </div>
      </header>

      <main
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          padding: "clamp(28px, 4vw, 40px) 32px 48px",
        }}
      >
        {loading && (
          <div style={{ fontWeight: 800, fontSize: 18, color: "#1A2F23" }}>Loading your games…</div>
        )}
        {error && (
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: "#FFEBEE",
              border: "2px solid #E57373",
              fontWeight: 700,
              color: "#B71C1C",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Level selector */}
            <section className="games-hub-card-animate" style={{ marginBottom: 44, animationDelay: "0ms" }}>
              <h2 className="flex flex-wrap items-center gap-2" style={{ fontSize: 24, fontWeight: 800, margin: "0 0 10px", color: "#1A2F23" }}>
                <Sparkles className="h-7 w-7 text-amber-500" strokeWidth={2} aria-hidden />
                <span>Choose Your Level</span>
              </h2>
              <p style={{ margin: "0 0 22px", fontWeight: 700, opacity: 0.88, lineHeight: 1.5, maxWidth: 720 }}>
                This applies to every mini-game. Faster levels mean more eco points—less time and fewer misses!
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {LEVEL_ORDER.map((id) => {
                  const def = GAME_LEVELS[id];
                  const isSel = selectedLevel.id === id;
                  const isRec = recommendedId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleLevelSelect(id)}
                      className={[
                        "games-hub-level-card relative cursor-pointer rounded-2xl border-2 bg-white p-5 text-center transition-transform hover:scale-105 hover:shadow-md",
                        isSel ? "border-green-500 bg-green-50" : "border-transparent shadow-sm",
                        levelBounceId === id ? "games-hub-level-bounce" : "",
                        "games-hub-card-animate",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{
                        fontFamily: "inherit",
                        animationDelay: `${LEVEL_ORDER.indexOf(id) * 80}ms`,
                      }}
                    >
                      {isRec && (
                        <span
                          className="absolute left-2 top-2 z-10 rounded-full border-2 border-[#1A8F4E] bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#1A8F4E] shadow-md"
                        >
                          Recommended
                        </span>
                      )}
                      {isSel && (
                        <span
                          className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white"
                          aria-hidden
                        >
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        </span>
                      )}
                      <Image
                        src={LEVEL_IMAGE_SRC[id]}
                        alt={`${def.label} level`}
                        width={80}
                        height={80}
                        className="mx-auto mb-3 block object-contain"
                      />
                      <div className="text-base font-bold text-gray-900">{def.label}</div>
                      <p className="mt-1 text-xs text-gray-500">{LEVEL_DIFFICULTY_DESC[id]}</p>
                      <div className="mt-3 text-xs font-bold leading-snug text-gray-700">
                        Speed {def.speedMultiplier}× · {def.lives} lives · {def.roundSeconds}s ·{" "}
                        <span className="font-extrabold">{def.pointsMultiplier}× eco</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Progress */}
            <section
              className="games-hub-card-animate"
              style={{
                marginBottom: 44,
                padding: "24px 26px",
                borderRadius: 24,
                background: "#fff",
                border: "2px solid rgba(26,143,78,0.25)",
                boxShadow: "0 10px 28px rgba(26,143,78,0.12)",
                animationDelay: "100ms",
              }}
            >
              <h2 className="flex flex-wrap items-center gap-2" style={{ fontSize: 24, fontWeight: 800, margin: "0 0 16px", color: "#1A2F23" }}>
                <BookOpen className="h-7 w-7 text-green-600" strokeWidth={2.25} aria-hidden />
                <span>Your Progress</span>
              </h2>
              <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: "clamp(1rem, 2.2vw, 1.15rem)" }}>
                <span style={{ color: "#1A8F4E" }}>{done}</span> lesson{done === 1 ? "" : "s"} completed!
                {nextLessonUnlock != null && done < nextLessonUnlock ? (
                  <>
                    {" "}
                    Next unlock at <strong>{nextLessonUnlock}</strong> lessons
                  </>
                ) : (
                  <> You&apos;ve reached every milestone here—legend status!</>
                )}
              </p>
              <div
                style={{
                  height: 18,
                  borderRadius: 999,
                  background: "#E8F5E9",
                  overflow: "hidden",
                  border: "2px solid #A5D6A7",
                }}
              >
                <div
                  style={{
                    width: `${progressToNextPct}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #2ECC71, #1A8F4E)",
                    transition: "width 1s cubic-bezier(0.22, 1, 0.36, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 8,
                    fontSize: 12,
                  }}
                >
                  {progressToNextPct > 18 && (
                    <Leaf className="h-3.5 w-3.5 text-white" strokeWidth={2.5} aria-hidden />
                  )}
                </div>
              </div>
              {nextLessonUnlock != null && done < nextLessonUnlock && (
                <p style={{ margin: "10px 0 0", fontSize: 14, fontWeight: 700, opacity: 0.85 }}>
                  {done}/{nextLessonUnlock} toward your next game unlock
                </p>
              )}
              {paidPlan && (
                <p style={{ margin: "12px 0 0", fontSize: 14, color: "#1A8F4E", fontWeight: 700 }}>
                  Family / school plan active—premium games unlock with your subscription.
                </p>
              )}
            </section>

            {/* Games grid */}
            <h2
              className="games-hub-card-animate flex flex-wrap items-center gap-2"
              style={{
                fontSize: 24,
                fontWeight: 800,
                margin: "8px 0 22px",
                color: "#1A2F23",
                animationDelay: "150ms",
              }}
            >
              <Target className="h-7 w-7 text-green-600" strokeWidth={2.25} aria-hidden />
              <span>Pick a game</span>
            </h2>
            <div
              className="games-hub-games-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 28,
              }}
            >
              <style>{`
                @media (min-width: 640px) {
                  .games-hub-games-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                  }
                }
                @media (min-width: 1024px) {
                  .games-hub-games-grid {
                    grid-template-columns: repeat(3, 1fr) !important;
                  }
                }
              `}</style>
              {GAMES.map((g, i) => {
                const GameCardIcon = g.Icon;
                const lessonOk = done >= g.unlockLessons;
                const paidOk = !g.requiresPaid || paidPlan;
                const unlocked = lessonOk && paidOk;
                const implemented = isGameImplemented(g.slug);
                const needLessons = Math.max(0, g.unlockLessons - done);
                const paidGate = g.requiresPaid && !paidPlan && lessonOk;
                const stars = starsForGame(g);

                let mode: "play" | "lesson_lock" | "paid_lock" | "coming" = "lesson_lock";
                if (paidGate) mode = "paid_lock";
                else if (unlocked && !implemented) mode = "coming";
                else if (unlocked && implemented) mode = "play";
                else if (!lessonOk) mode = "lesson_lock";

                const dimmed = mode === "lesson_lock" || mode === "paid_lock" || mode === "coming";

                return (
                  <article
                    key={g.slug}
                    className={`games-hub-game-card games-hub-card-animate`}
                    style={{
                      position: "relative",
                      minHeight: 420,
                      borderRadius: 24,
                      padding: 0,
                      boxSizing: "border-box",
                      background: "#fff",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                      border:
                        dimmed && mode !== "paid_lock"
                          ? "2px solid rgba(26,47,35,0.12)"
                          : "2px solid rgba(46,204,113,0.35)",
                      display: "flex",
                      flexDirection: "column",
                      opacity: mode === "paid_lock" ? 1 : dimmed ? 0.72 : 1,
                      overflow: "hidden",
                      animationDelay: `${200 + i * 100}ms`,
                    }}
                  >
                    {mode === "paid_lock" && (
                      <div
                        className="games-hub-shimmer"
                        aria-hidden
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          opacity: 0.35,
                        }}
                      />
                    )}
                    {mode === "paid_lock" && (
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
                          zIndex: 4,
                        }}
                      >
                        <Crown className="h-7 w-7 text-amber-600" strokeWidth={2} aria-hidden />
                      </div>
                    )}

                    <div
                      style={{
                        position: "relative",
                        flex: "0 0 65%",
                        minHeight: 200,
                        width: "100%",
                      }}
                    >
                      <Image
                        src={g.imageSrc}
                        alt={`${g.name} game artwork`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: "cover", borderRadius: "24px 24px 0 0" }}
                        priority={i < 3}
                      />
                      <div
                        aria-hidden
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: 0,
                          height: "55%",
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)",
                          pointerEvents: "none",
                          zIndex: 1,
                          borderRadius: "24px 24px 0 0",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        position: "relative",
                        zIndex: 1,
                        flex: "1 1 35%",
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "16px 18px 18px",
                        boxSizing: "border-box",
                        background: "#fff",
                      }}
                    >
                    <h3
                      style={{
                        color: "#1A2F23",
                        fontSize: 18,
                        fontWeight: 800,
                        margin: "0 0 8px",
                        lineHeight: 1.25,
                      }}
                    >
                      <GameCardIcon className="mr-2 inline h-5 w-5 shrink-0 align-[-2px] text-green-600" strokeWidth={2.25} aria-hidden />
                      {g.name}
                    </h3>
                    <p
                      style={{
                        margin: "0 0 12px",
                        fontWeight: 600,
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: "#64748b",
                      }}
                    >
                      {g.description}
                    </p>
                    {stars != null && unlocked && mode === "play" && (
                      <div className="mb-1.5 flex justify-center gap-1">
                        {[0, 1, 2].map((si) => (
                          <Star
                            key={si}
                            className="h-4 w-4 text-amber-500"
                            strokeWidth={2}
                            fill={si < stars ? "currentColor" : "none"}
                            style={{ opacity: si < stars ? 1 : 0.35 }}
                            aria-hidden
                          />
                        ))}
                      </div>
                    )}
                      {g.slug === "/games/eco-garden" &&
                        ecoGardenPlantCount != null &&
                        ecoGardenPlantCount > 0 &&
                        unlocked && (
                          <p
                            style={{
                              margin: "0 0 8px",
                              fontSize: 11,
                              fontWeight: 800,
                              background: "rgba(255,255,255,0.25)",
                              padding: "6px 8px",
                              borderRadius: 10,
                              textAlign: "center",
                            }}
                          >
                            Your garden has {ecoGardenPlantCount} plant{ecoGardenPlantCount === 1 ? "" : "s"}.
                          </p>
                        )}

                    <div style={{ marginTop: "auto", flexShrink: 0 }}>
                      {mode === "play" && (
                        <Link
                          href={g.slug}
                          className="games-hub-play-pulse inline-flex items-center justify-center gap-0"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: 52,
                            minHeight: 52,
                            width: "100%",
                            padding: "0 18px",
                            borderRadius: 999,
                            background: "#1A8F4E",
                            color: "#ffffff",
                            fontWeight: 800,
                            fontSize: 16,
                            textDecoration: "none",
                            border: "3px solid rgba(255,255,255,0.5)",
                            boxSizing: "border-box",
                          }}
                        >
                          <Play className="mr-2 h-5 w-5 fill-current" strokeWidth={2} aria-hidden />
                          Play Now!
                        </Link>
                      )}
                      {mode === "lesson_lock" && (
                        <>
                          <div className="mb-1 flex justify-center" aria-hidden>
                            <Lock className="h-8 w-8 text-[#64748b]" strokeWidth={2} />
                          </div>
                          <p
                            style={{
                              margin: "0 0 4px",
                              fontWeight: 800,
                              fontSize: 12,
                              textAlign: "center",
                              color: "#1A2F23",
                              lineHeight: 1.3,
                            }}
                          >
                            Complete {needLessons} more lesson{needLessons === 1 ? "" : "s"} to unlock!
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 700,
                              fontSize: 11,
                              textAlign: "center",
                              color: "#64748b",
                              lineHeight: 1.3,
                            }}
                          >
                            You&apos;re at {done}/{g.unlockLessons} lessons
                          </p>
                        </>
                      )}
                      {mode === "paid_lock" && (
                        <>
                          <p
                            style={{
                              margin: "0 0 6px",
                              fontWeight: 800,
                              fontSize: 13,
                              textAlign: "center",
                              color: "#1A2F23",
                              lineHeight: 1.25,
                            }}
                          >
                            Family Plan Required
                          </p>
                          <Link
                            href="/pricing"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: 52,
                              minHeight: 52,
                              width: "100%",
                              borderRadius: 999,
                              background: "linear-gradient(180deg, #FFD54F, #FFB300)",
                              color: "#5D4037",
                              fontWeight: 800,
                              fontSize: 16,
                              textDecoration: "none",
                              border: "3px solid rgba(255,255,255,0.65)",
                              boxSizing: "border-box",
                            }}
                          >
                            Upgrade
                          </Link>
                        </>
                      )}
                      {mode === "coming" && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: 52,
                            minHeight: 52,
                            borderRadius: 999,
                            background: "#F1F5F9",
                            fontWeight: 800,
                            fontSize: 15,
                            color: "#64748b",
                          }}
                        >
                          Coming soon!
                        </div>
                      )}
                    </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Coming soon teasers — same vibe as game cards, grayed out */}
            <section style={{ marginTop: 52 }}>
              <h2 className="flex flex-wrap items-center gap-2" style={{ fontSize: 24, fontWeight: 800, margin: "0 0 22px", color: "#1A2F23" }}>
                <Sparkles className="h-7 w-7 text-amber-500" strokeWidth={2} aria-hidden />
                <span>Coming Soon</span>
              </h2>
              <div
                className="games-hub-coming-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 24,
                }}
              >
                <style>{`
                  @media (min-width: 640px) {
                    .games-hub-coming-grid {
                      grid-template-columns: repeat(2, 1fr) !important;
                    }
                  }
                  @media (min-width: 1024px) {
                    .games-hub-coming-grid {
                      grid-template-columns: repeat(3, 1fr) !important;
                    }
                  }
                `}</style>
                {COMING_SOON.map((c, ci) => {
                  const ComingIcon = c.Icon;
                  return (
                  <article
                    key={c.name}
                    className="games-hub-card-animate games-hub-game-card"
                    style={{
                      position: "relative",
                      minHeight: 280,
                      borderRadius: 24,
                      padding: 26,
                      boxSizing: "border-box",
                      background: "linear-gradient(160deg, #78909C 0%, #455A64 55%, #37474F 100%)",
                      boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                      border: "3px solid rgba(255,255,255,0.25)",
                      color: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      opacity: 0.88,
                      overflow: "hidden",
                      animationDelay: `${320 + ci * 90}ms`,
                    }}
                  >
                    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.2 }}>
                      <Sparkles className="absolute left-[12%] top-[20%] h-6 w-6 text-white" strokeWidth={2} />
                      <Leaf className="absolute right-[14%] top-[35%] h-5 w-5 text-white" strokeWidth={2} />
                    </div>
                    <span
                      className="relative z-[1] flex items-center justify-center text-white"
                      style={{
                        lineHeight: 1,
                        filter: "grayscale(0.15)",
                      }}
                    >
                      <ComingIcon className="h-14 w-14" strokeWidth={2} aria-hidden />
                    </span>
                    <h3
                      style={{
                        position: "relative",
                        zIndex: 1,
                        margin: "14px 0 0",
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#ffffff",
                        lineHeight: 1.25,
                      }}
                    >
                      {c.name}
                    </h3>
                    <p
                      style={{
                        position: "relative",
                        zIndex: 1,
                        margin: "10px 0 0",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#ffffff",
                        opacity: 0.88,
                        lineHeight: 1.45,
                        maxWidth: 280,
                      }}
                    >
                      A brand-new typing adventure is sprouting here!
                    </p>
                    <div style={{ marginTop: "auto", paddingTop: 20, position: "relative", zIndex: 1, width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: 48,
                          minHeight: 48,
                          borderRadius: 999,
                          background: "rgba(0,0,0,0.22)",
                          color: "#ECEFF1",
                          fontWeight: 800,
                          fontSize: 15,
                          border: "2px dashed rgba(255,255,255,0.4)",
                          boxSizing: "border-box",
                        }}
                      >
                        Coming Soon!
                      </div>
                    </div>
                  </article>
                );
                })}
              </div>
            </section>
          </>
        )}
      </main>

      <footer
        style={{
          marginTop: 24,
          background: "#1A8F4E",
          color: "#fff",
          padding: "20px 16px 28px",
          textAlign: "center",
          fontWeight: 800,
          fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.2 }}>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="inline-flex text-white/90"
              style={{
                position: "absolute",
                left: `${15 + i * 22}%`,
                bottom: 6,
                animation: `gamesHubFloat ${3.5 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              <Leaf className="h-5 w-5" strokeWidth={2} />
            </span>
          ))}
        </div>
        <span className="relative z-[1] inline-flex items-center justify-center gap-2">
          <Leaf className="h-5 w-5 shrink-0 text-white" strokeWidth={2} aria-hidden />
          Every game you play helps the planet!
        </span>
      </footer>
    </div>
  );
}
