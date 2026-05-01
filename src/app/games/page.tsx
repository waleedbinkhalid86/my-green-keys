"use client";

import Link from "next/link";
import { Nunito } from "next/font/google";
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

const HUB_STARS_KEY = "mgk_hub_game_stars";

type GameCardDef = {
  slug: string;
  key: string;
  emoji: string;
  name: string;
  description: string;
  unlockLessons: number;
  requiresPaid: boolean;
  gradient: string;
  decor: string[];
};

const GAMES: GameCardDef[] = [
  {
    slug: "/games/falling-leaves",
    key: "falling-leaves",
    emoji: "🍂",
    name: "Falling Leaves",
    description: "Catch enchanted leaves by typing lesson words—save the forest!",
    unlockLessons: 0,
    requiresPaid: false,
    gradient: "linear-gradient(160deg, #F39C12 0%, #E67E22 100%)",
    decor: ["🍃", "✨", "🌤️"],
  },
  {
    slug: "/games/sort-recycling",
    key: "sort-recycling",
    emoji: "🗑️",
    name: "Sort Recycling",
    description: "Eco Hero City: sort waste into plastic, paper, organic, and glass!",
    unlockLessons: 5,
    requiresPaid: false,
    gradient: "linear-gradient(160deg, #1ABC9C 0%, #16A085 100%)",
    decor: ["♻️", "📦", "🌍"],
  },
  {
    slug: "/games/save-the-ocean",
    key: "save-the-ocean",
    emoji: "🌊",
    name: "Save the Ocean",
    description: "Clear plastic by typing fast and free Zara the sea turtle 🐢!",
    unlockLessons: 40,
    requiresPaid: false,
    gradient: "linear-gradient(160deg, #3498DB 0%, #2980B9 100%)",
    decor: ["🐠", "💧", "🐚"],
  },
  {
    slug: "/games/eco-garden",
    key: "eco-garden",
    emoji: "🌱",
    name: "Eco Garden",
    description: "Grow a magical garden—type raindrops, unlock visitors, watch it bloom!",
    unlockLessons: 20,
    requiresPaid: true,
    gradient: "linear-gradient(160deg, #2ECC71 0%, #27AE60 100%)",
    decor: ["🌻", "🐝", "🌧️"],
  },
  {
    slug: "/games/kind-world-academy",
    key: "kind-world-academy",
    emoji: "💝",
    name: "Kind World Academy",
    description: "Spread kindness around the world—typing adventure awaits!",
    unlockLessons: 60,
    requiresPaid: true,
    gradient: "linear-gradient(160deg, #9B59B6 0%, #8E44AD 100%)",
    decor: ["🌈", "🤝", "⭐"],
  },
];

const LEVEL_THEMES: Record<
  GameLevelId,
  { gradient: string; accent: string; shadow: string }
> = {
  seedling: {
    gradient: "linear-gradient(145deg, #FF8A65 0%, #FFAB91 50%, #FFCC80 100%)",
    accent: "#E65100",
    shadow: "rgba(230, 81, 0, 0.35)",
  },
  explorer: {
    gradient: "linear-gradient(145deg, #26A69A 0%, #4DB6AC 50%, #80CBC4 100%)",
    accent: "#00695C",
    shadow: "rgba(0, 105, 92, 0.35)",
  },
  guardian: {
    gradient: "linear-gradient(145deg, #5C6BC0 0%, #7E57C2 50%, #42A5F5 100%)",
    accent: "#283593",
    shadow: "rgba(40, 53, 147, 0.35)",
  },
  champion: {
    gradient: "linear-gradient(145deg, #EF5350 0%, #FFCA28 55%, #FFD54F 100%)",
    accent: "#C62828",
    shadow: "rgba(198, 40, 40, 0.4)",
  },
};

const COMING_SOON = [
  { emoji: "🦋", name: "Butterfly Catch" },
  { emoji: "🐾", name: "Animal Race" },
  { emoji: "🌍", name: "Eco Quiz" },
];

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
        }
      `}</style>

      {/* Hero */}
      <header
        style={{
          position: "relative",
          background: "#1A8F4E",
          color: "#fff",
          padding: "clamp(18px, 4vw, 32px) clamp(16px, 4vw, 28px) clamp(36px, 6vw, 52px)",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.25,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="games-hub-leaf-fall"
              style={{
                position: "absolute",
                left: `${8 + i * 16}%`,
                top: "-10%",
                fontSize: i % 2 === 0 ? 22 : 16,
                animation: `gamesHubLeaf ${14 + i * 2}s linear infinite`,
                animationDelay: `${i * 1.2}s`,
              }}
            >
              {i % 3 === 0 ? "🍃" : i % 3 === 1 ? "🌿" : "⭐"}
            </span>
          ))}
        </div>

        <div
          className="games-hub-float"
          style={{
            position: "absolute",
            right: "8%",
            top: "18%",
            fontSize: 28,
            animation: "gamesHubFloat 4s ease-in-out infinite",
            pointerEvents: "none",
            opacity: 0.9,
          }}
        >
          ⭐
        </div>
        <div
          style={{
            position: "absolute",
            left: "6%",
            top: "22%",
            fontSize: 24,
            animation: "gamesHubFloatSlow 5.5s ease-in-out infinite",
            pointerEvents: "none",
            opacity: 0.85,
          }}
        >
          🍃
        </div>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <Link
              href="/lesson"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 44,
                padding: "0 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                textDecoration: "none",
                border: "2px solid rgba(255,255,255,0.45)",
              }}
            >
              ← Back to lessons
            </Link>
          </div>
          <h1
            style={{
              fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.15,
              textShadow: "0 2px 0 rgba(0,0,0,0.12)",
            }}
          >
            🎮 Game Zone!
          </h1>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              fontWeight: 700,
              opacity: 0.95,
              maxWidth: 520,
              lineHeight: 1.45,
            }}
          >
            Learn to type while saving the planet!
          </p>
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
          }}
        >
          <span>🌳</span>
          <span>🌲</span>
          <span>🦋</span>
          <span>🌻</span>
          <span>🐛</span>
          <span>🌳</span>
        </div>
      </header>

      <main
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "clamp(16px, 3vw, 28px) clamp(14px, 3vw, 22px) 40px",
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
            <section className="games-hub-card-animate" style={{ marginBottom: 28, animationDelay: "0ms" }}>
              <h2 style={{ fontSize: "clamp(1.35rem, 3.5vw, 1.65rem)", fontWeight: 800, margin: "0 0 6px" }}>
                Choose Your Level 🌟
              </h2>
              <p style={{ margin: "0 0 16px", fontWeight: 700, opacity: 0.88, lineHeight: 1.5, maxWidth: 720 }}>
                This applies to every mini-game. Faster levels mean more eco points—less time and fewer misses!
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 12,
                }}
                className="games-hub-level-grid"
              >
                <style>{`
                  @media (min-width: 768px) {
                    .games-hub-level-grid {
                      grid-template-columns: repeat(4, 1fr) !important;
                    }
                  }
                `}</style>
                {LEVEL_ORDER.map((id) => {
                  const def = GAME_LEVELS[id];
                  const isSel = selectedLevel.id === id;
                  const isRec = recommendedId === id;
                  const theme = LEVEL_THEMES[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleLevelSelect(id)}
                      className={[
                        levelBounceId === id ? "games-hub-level-bounce" : "",
                        "games-hub-card-animate",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{
                        textAlign: "left",
                        padding: 14,
                        borderRadius: 20,
                        border: isSel ? `4px solid ${theme.accent}` : "3px solid rgba(26,47,35,0.12)",
                        background: theme.gradient,
                        color: "#1A2F23",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        position: "relative",
                        transform: isSel ? "scale(1.04)" : "scale(1)",
                        boxShadow: isSel
                          ? `0 12px 28px ${theme.shadow}`
                          : "0 6px 16px rgba(0,0,0,0.08)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                        animationDelay: `${LEVEL_ORDER.indexOf(id) * 80}ms`,
                        minHeight: 120,
                      }}
                    >
                      {isRec && (
                        <span
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            fontSize: 11,
                            fontWeight: 800,
                            background: "#fff",
                            padding: "4px 10px",
                            borderRadius: 999,
                            color: theme.accent,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                            border: `2px solid ${theme.accent}`,
                          }}
                        >
                          Recommended
                        </span>
                      )}
                      {isSel && (
                        <span
                          style={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            fontSize: 18,
                            lineHeight: 1,
                          }}
                          aria-hidden
                        >
                          ✓
                        </span>
                      )}
                      <div style={{ fontSize: 32, marginTop: isSel ? 8 : 0 }}>{def.emoji}</div>
                      <div style={{ fontSize: 17, fontWeight: 800, marginTop: 6 }}>{def.label}</div>
                      <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, opacity: 0.9, lineHeight: 1.4 }}>
                        Speed {def.speedMultiplier}× · {def.lives} lives · {def.roundSeconds}s ·{" "}
                        <span style={{ fontWeight: 800 }}>{def.pointsMultiplier}× eco</span>
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
                marginBottom: 28,
                padding: "20px 22px",
                borderRadius: 24,
                background: "#fff",
                border: "2px solid rgba(26,143,78,0.25)",
                boxShadow: "0 10px 28px rgba(26,143,78,0.12)",
                animationDelay: "100ms",
              }}
            >
              <h2 style={{ fontSize: "clamp(1.2rem, 3vw, 1.45rem)", fontWeight: 800, margin: "0 0 14px" }}>
                Your Progress 📚
              </h2>
              <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: "clamp(1rem, 2.2vw, 1.15rem)" }}>
                <span style={{ color: "#1A8F4E" }}>{done}</span> lesson{done === 1 ? "" : "s"} completed!
                {nextLessonUnlock != null && done < nextLessonUnlock ? (
                  <>
                    {" "}
                    Next unlock at <strong>{nextLessonUnlock}</strong> lessons 🔓
                  </>
                ) : (
                  <> You&apos;ve reached every milestone here—legend status! 🏆</>
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
                  {progressToNextPct > 18 && <span aria-hidden>🌿</span>}
                </div>
              </div>
              {nextLessonUnlock != null && done < nextLessonUnlock && (
                <p style={{ margin: "10px 0 0", fontSize: 14, fontWeight: 700, opacity: 0.85 }}>
                  {done}/{nextLessonUnlock} toward your next game unlock
                </p>
              )}
              {paidPlan && (
                <p style={{ margin: "12px 0 0", fontSize: 14, color: "#1A8F4E", fontWeight: 700 }}>
                  Family / school plan active—premium games unlock with your subscription ✓
                </p>
              )}
            </section>

            {/* Games grid */}
            <h2
              className="games-hub-card-animate"
              style={{
                fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
                fontWeight: 800,
                margin: "0 0 16px",
                animationDelay: "150ms",
              }}
            >
              Pick a game 🎯
            </h2>
            <div
              className="games-hub-games-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 20,
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
                      minHeight: 350,
                      borderRadius: 24,
                      padding: 22,
                      boxSizing: "border-box",
                      background: g.gradient,
                      boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                      border: dimmed && mode !== "paid_lock" ? "3px solid rgba(255,255,255,0.35)" : "3px solid rgba(255,255,255,0.5)",
                      color: "#fff",
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
                          fontSize: 26,
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
                        }}
                      >
                        👑
                      </div>
                    )}

                    {/* Decorative */}
                    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                      {g.decor.map((d, di) => (
                        <span
                          key={di}
                          style={{
                            position: "absolute",
                            fontSize: 16 + (di % 2) * 4,
                            opacity: 0.35,
                            left: `${12 + di * 28}%`,
                            top: `${18 + (di * 17) % 40}%`,
                            animation: `gamesHubFloatSlow ${5 + di}s ease-in-out infinite`,
                            animationDelay: `${di * 0.4}s`,
                          }}
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center" }}>
                      <span style={{ fontSize: 80, lineHeight: 1, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}>
                        {g.emoji}
                      </span>
                    </div>

                    <div style={{ position: "relative", zIndex: 1, flex: 1, textAlign: "center", marginTop: 8 }}>
                      <h3 style={{ fontSize: "clamp(1.15rem, 2.8vw, 1.35rem)", fontWeight: 800, margin: "0 0 8px", lineHeight: 1.2 }}>
                        {g.name}
                      </h3>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, lineHeight: 1.45, opacity: 0.95 }}>
                        {g.description}
                      </p>
                      {g.slug === "/games/eco-garden" &&
                        ecoGardenPlantCount != null &&
                        ecoGardenPlantCount > 0 &&
                        unlocked && (
                          <p
                            style={{
                              marginTop: 10,
                              fontSize: 13,
                              fontWeight: 800,
                              background: "rgba(255,255,255,0.25)",
                              padding: "8px 10px",
                              borderRadius: 12,
                            }}
                          >
                            Your garden has {ecoGardenPlantCount} plant{ecoGardenPlantCount === 1 ? "" : "s"}! 🌿
                          </p>
                        )}
                    </div>

                    {stars != null && unlocked && mode === "play" && (
                      <div style={{ position: "relative", zIndex: 1, marginTop: 10, fontSize: 20, letterSpacing: 4 }}>
                        {[0, 1, 2].map((si) => (
                          <span key={si} style={{ opacity: si < stars ? 1 : 0.35 }}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ position: "relative", zIndex: 1, marginTop: "auto", paddingTop: 16 }}>
                      {mode === "play" && (
                        <Link
                          href={g.slug}
                          className="games-hub-play-pulse"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: 60,
                            width: "100%",
                            padding: "0 20px",
                            borderRadius: 999,
                            background: "#1A8F4E",
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: 17,
                            textDecoration: "none",
                            border: "3px solid rgba(255,255,255,0.5)",
                            boxSizing: "border-box",
                          }}
                        >
                          ▶ Play Now!
                        </Link>
                      )}
                      {mode === "lesson_lock" && (
                        <>
                          <div style={{ textAlign: "center", fontSize: 48, marginBottom: 8 }} aria-hidden>
                            🔒
                          </div>
                          <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 15, textAlign: "center" }}>
                            Complete {needLessons} more lesson{needLessons === 1 ? "" : "s"} to unlock!
                          </p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, textAlign: "center", opacity: 0.9 }}>
                            You&apos;re at {done}/{g.unlockLessons} lessons
                          </p>
                        </>
                      )}
                      {mode === "paid_lock" && (
                        <>
                          <p style={{ margin: "0 0 10px", fontWeight: 800, fontSize: 16, textAlign: "center" }}>
                            Family Plan Required
                          </p>
                          <Link
                            href="/pricing"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minHeight: 60,
                              width: "100%",
                              borderRadius: 999,
                              background: "linear-gradient(180deg, #FFD54F, #FFB300)",
                              color: "#5D4037",
                              fontWeight: 800,
                              fontSize: 17,
                              textDecoration: "none",
                              border: "3px solid rgba(255,255,255,0.65)",
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
                            minHeight: 60,
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.25)",
                            fontWeight: 800,
                            fontSize: 16,
                          }}
                        >
                          Coming soon!
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Coming soon teasers */}
            <section style={{ marginTop: 36 }}>
              <h2 style={{ fontSize: "clamp(1.2rem, 3vw, 1.45rem)", fontWeight: 800, margin: "0 0 14px" }}>
                Coming Soon ✨
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: 14,
                }}
              >
                {COMING_SOON.map((c) => (
                  <div
                    key={c.name}
                    style={{
                      borderRadius: 20,
                      padding: 18,
                      background: "rgba(255,255,255,0.65)",
                      border: "2px dashed rgba(26,47,35,0.2)",
                      textAlign: "center",
                      opacity: 0.85,
                    }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 8 }}>{c.emoji}</div>
                    <div style={{ fontWeight: 800, color: "#1A2F23", marginBottom: 8 }}>{c.name}</div>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        fontWeight: 800,
                        background: "#B0BEC5",
                        color: "#37474F",
                        padding: "4px 12px",
                        borderRadius: 999,
                      }}
                    >
                      Coming Soon!
                    </span>
                  </div>
                ))}
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
              style={{
                position: "absolute",
                left: `${15 + i * 22}%`,
                bottom: 6,
                fontSize: 20,
                animation: `gamesHubFloat ${3.5 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              🍃
            </span>
          ))}
        </div>
        <span style={{ position: "relative", zIndex: 1 }}>🌿 Every game you play helps the planet!</span>
      </footer>
    </div>
  );
}
