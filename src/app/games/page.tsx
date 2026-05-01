"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Lock } from "lucide-react";
import {
  GAME_LEVELS,
  type GameLevelDefinition,
  type GameLevelId,
  getStoredGameLevel,
  setStoredGameLevel,
  suggestedLevelIdForAge,
} from "@/lib/games/gameLevels";
import "@/app/globals.css";

const LEVEL_ORDER: GameLevelId[] = ["seedling", "explorer", "guardian", "champion"];

type GameCardDef = {
  slug: string;
  emoji: string;
  name: string;
  description: string;
  unlockLessons: number;
  requiresPaid: boolean;
};

const GAMES: GameCardDef[] = [
  {
    slug: "/games/falling-leaves",
    emoji: "🍂",
    name: "Falling Leaves",
    description: "Catch enchanted leaves by typing lesson words—save the forest!",
    unlockLessons: 0,
    requiresPaid: false,
  },
  {
    slug: "/games/sort-recycling",
    emoji: "🗑️",
    name: "Sort Recycling",
    description: "Eco Hero City: sort falling waste into plastic, paper, organic, and glass before the streets fill up!",
    unlockLessons: 5,
    requiresPaid: false,
  },
  {
    slug: "/games/plant-a-tree",
    emoji: "🌱",
    name: "Plant a Tree",
    description: "Grow a mighty tree with perfect typing streaks.",
    unlockLessons: 20,
    requiresPaid: true,
  },
  {
    slug: "/games/save-the-ocean",
    emoji: "🌊",
    name: "Save the Ocean",
    description: "Rescue sea friends by clearing waves of eco words.",
    unlockLessons: 40,
    requiresPaid: true,
  },
  {
    slug: "/games/kind-world-academy",
    emoji: "💝",
    name: "Kind World Academy",
    description: "Spread kindness around the world—typing adventure awaits!",
    unlockLessons: 60,
    requiresPaid: true,
  },
];

function hasPaidPlan(planType: string | null | undefined): boolean {
  if (!planType) return false;
  return planType !== "free";
}

export default function GamesHubPage() {
  const [completedLessons, setCompletedLessons] = useState<number | null>(null);
  const [paidPlan, setPaidPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileAge, setProfileAge] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<GameLevelDefinition>(() => getStoredGameLevel());

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
            .filter((n): n is number => typeof n === "number" && n >= 1)
        ).size;
        setCompletedLessons(uniqueDone);

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("plan_type, status")
          .eq("user_id", userData.user.id)
          .maybeSingle();

        const active = (sub as { status?: string } | null)?.status === "active";
        const plan = (sub as { plan_type?: string } | null)?.plan_type ?? null;
        setPaidPlan(active && hasPaidPlan(plan));
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

  const lessonMilestones = GAMES.map((g) => g.unlockLessons).filter((n) => n > 0);
  const nextLessonUnlock = [...new Set(lessonMilestones)].sort((a, b) => a - b).find((m) => done < m) ?? null;
  const progressToNextPct =
    nextLessonUnlock != null && nextLessonUnlock > 0 ? Math.min(100, (done / nextLessonUnlock) * 100) : 100;
  const SORT_RECYCLING_AT = 5;

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-poppins), Poppins, sans-serif",
        background:
          "linear-gradient(165deg, #0f1f16 0%, #1b3d2f 22%, #2d6a4f 48%, #1a2e24 100%)",
        color: "#e8f5e9",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(156, 39, 176, 0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(76, 175, 80, 0.2), transparent)",
          pointerEvents: "none",
        }}
      />

      <header
        style={{
          position: "relative",
          zIndex: 2,
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(10px)",
          background: "rgba(15, 31, 22, 0.55)",
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", opacity: 0.85 }}>
            MY GREEN KEYS
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 950, marginTop: 4, letterSpacing: "-0.02em" }}>
            🎮 Games
          </h1>
          <p style={{ marginTop: 6, maxWidth: 520, opacity: 0.9, fontWeight: 600, lineHeight: 1.45 }}>
            Play, practice typing, and earn eco points—every game helps you grow like the forest.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/lesson"
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.35)",
              color: "#fff",
              fontWeight: 800,
              textDecoration: "none",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            ← Back to lessons
          </Link>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 2, padding: "24px 20px 48px", maxWidth: 1100, margin: "0 auto" }}>
        {loading && (
          <div style={{ fontWeight: 800, opacity: 0.85 }}>Loading your forest arcade…</div>
        )}
        {error && (
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              background: "rgba(244, 67, 54, 0.15)",
              border: "1px solid rgba(244, 67, 54, 0.35)",
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <div
            style={{
              marginBottom: 20,
              padding: 18,
              borderRadius: 18,
              background: "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.2))",
              border: "1px solid rgba(129, 199, 132, 0.35)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 950 }}>
              You&apos;ve completed <span style={{ color: "#FFEB3B" }}>{done}</span> lesson{done === 1 ? "" : "s"}—nice
              progress!
            </div>
            <p style={{ marginTop: 8, opacity: 0.92, fontWeight: 600, lineHeight: 1.5 }}>
              <strong>Sort Recycling:</strong>{" "}
              {done < SORT_RECYCLING_AT ? (
                <>
                  <span style={{ color: "#FFEB3B" }}>
                    {done}/{SORT_RECYCLING_AT} lessons
                  </span>{" "}
                  —finish{" "}
                  <strong>{SORT_RECYCLING_AT - done}</strong> more to unlock your city sorting game! 🌟
                </>
              ) : (
                <>
                  <span style={{ color: "#A5D6A7" }}>✅ Unlocked!</span> You completed {SORT_RECYCLING_AT}+ lessons—enjoy Eco
                  Hero City!
                </>
              )}
            </p>
            {nextLessonUnlock != null && done < nextLessonUnlock && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800 }}>
                  <span>Progress to next unlock ({nextLessonUnlock} lessons)</span>
                  <span>
                    {done}/{nextLessonUnlock}
                  </span>
                </div>
                <div style={{ height: 12, borderRadius: 999, background: "rgba(0,0,0,0.25)", marginTop: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${progressToNextPct}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: "linear-gradient(90deg,#FFEB3B,#4CAF50)",
                      transition: "width 0.35s ease",
                    }}
                  />
                </div>
              </div>
            )}
            {nextLessonUnlock == null && (
              <p style={{ marginTop: 10, fontWeight: 800, color: "#C8E6C9" }}>
                You&apos;ve hit every lesson milestone for these games—legend status! 🏆
              </p>
            )}
            {paidPlan && (
              <p style={{ marginTop: 10, fontSize: 14, color: "#A5D6A7", fontWeight: 700 }}>
                Family / school plan active—premium games can unlock earlier with your subscription ✓
              </p>
            )}
          </div>
        )}

        {!loading && !error && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 950, marginBottom: 6 }}>Choose your challenge level</h2>
            <p style={{ opacity: 0.88, fontWeight: 600, marginBottom: 14, maxWidth: 720, lineHeight: 1.45 }}>
              This applies to every mini-game. Faster levels mean more eco points—but less time and fewer misses!
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              {LEVEL_ORDER.map((id) => {
                const def = GAME_LEVELS[id];
                const isSel = selectedLevel.id === id;
                const isRec = recommendedId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setStoredGameLevel(id);
                      setSelectedLevel(GAME_LEVELS[id]);
                    }}
                    style={{
                      textAlign: "left",
                      padding: 16,
                      borderRadius: 18,
                      border: isSel ? "2px solid #FFEB3B" : "1px solid rgba(255,255,255,0.2)",
                      background: isSel
                        ? "linear-gradient(145deg, rgba(255,235,59,0.2), rgba(76,175,80,0.15))"
                        : "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.2))",
                      color: "#e8f5e9",
                      cursor: "pointer",
                      position: "relative",
                      fontFamily: "inherit",
                    }}
                  >
                    {isRec && (
                      <span
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          fontSize: 11,
                          fontWeight: 950,
                          background: "linear-gradient(90deg,#7B1FA2,#4CAF50)",
                          padding: "4px 8px",
                          borderRadius: 999,
                          color: "#fff",
                        }}
                      >
                        Recommended
                      </span>
                    )}
                    <div style={{ fontSize: 28 }}>{def.emoji}</div>
                    <div style={{ fontSize: 17, fontWeight: 950, marginTop: 6 }}>{def.label}</div>
                    <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, opacity: 0.9, lineHeight: 1.45 }}>
                      Speed {def.speedMultiplier}× · {def.lives} lives · {def.roundSeconds}s ·{" "}
                      <span style={{ color: "#FFEB3B" }}>{def.pointsMultiplier}× eco</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {GAMES.map((g) => {
            const lessonOk = done >= g.unlockLessons;
            const paidOk = !g.requiresPaid || paidPlan;
            const unlocked = lessonOk && paidOk;
            const isImplemented =
              g.slug === "/games/falling-leaves" || g.slug === "/games/sort-recycling";

            let lockMessage: string | null = null;
            if (!lessonOk) {
              const need = Math.max(0, g.unlockLessons - done);
              lockMessage =
                need === 0
                  ? null
                  : `Almost there—complete ${need} more lesson${need === 1 ? "" : "s"} to unlock (you’re at ${done}/${g.unlockLessons})! 🌱`;
            } else if (g.requiresPaid && !paidPlan) {
              lockMessage = "Family Plan required";
            }
            const unlockCelebrate =
              unlocked && g.unlockLessons > 0 && lessonOk
                ? `✅ Unlocked! You completed ${g.unlockLessons} lessons!`
                : null;

            const inner = (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontSize: 40, lineHeight: 1 }}>{g.emoji}</div>
                  {!unlocked && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 900,
                        color: "rgba(255,255,255,0.75)",
                        background: "rgba(0,0,0,0.25)",
                        padding: "6px 10px",
                        borderRadius: 999,
                      }}
                    >
                      <Lock size={14} strokeWidth={2.5} aria-hidden />
                      Locked
                    </div>
                  )}
                  {unlocked && (
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        color: "#1b5e20",
                        background: "linear-gradient(90deg,#FFEB3B,#C8E6C9)",
                        padding: "6px 10px",
                        borderRadius: 999,
                      }}
                    >
                      UNLOCKED
                    </div>
                  )}
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 950, marginTop: 10 }}>{g.name}</h2>
                <p style={{ marginTop: 8, opacity: 0.88, fontWeight: 600, lineHeight: 1.45, fontSize: 14 }}>
                  {g.description}
                </p>
                {unlockCelebrate && (
                  <p style={{ marginTop: 12, fontSize: 14, fontWeight: 900, color: "#E8F5E9", background: "rgba(76,175,80,0.35)", padding: "10px 12px", borderRadius: 12 }}>
                    {unlockCelebrate}
                  </p>
                )}
                {lockMessage && (
                  <p style={{ marginTop: 12, fontSize: 13, fontWeight: 800, color: "#FFCC80" }}>{lockMessage}</p>
                )}
                <div style={{ marginTop: 16 }}>
                  {unlocked && isImplemented ? (
                    <Link
                      href={g.slug}
                      style={{
                        display: "inline-block",
                        padding: "10px 16px",
                        borderRadius: 12,
                        background: "linear-gradient(90deg,#4CAF50,#2e7d32)",
                        color: "#fff",
                        fontWeight: 900,
                        textDecoration: "none",
                        boxShadow: "0 10px 28px rgba(76,175,80,0.35)",
                      }}
                    >
                      Play now
                    </Link>
                  ) : (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "10px 16px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.55)",
                        fontWeight: 900,
                      }}
                    >
                      {unlocked && !isImplemented ? "Coming soon" : "Locked"}
                    </span>
                  )}
                </div>
              </>
            );

            return (
              <article
                key={g.slug}
                style={{
                  background: unlocked
                    ? "linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))"
                    : "linear-gradient(145deg, rgba(0,0,0,0.35), rgba(255,255,255,0.04))",
                  border: `1px solid ${unlocked ? "rgba(129, 199, 132, 0.45)" : "rgba(255,255,255,0.12)"}`,
                  borderRadius: 20,
                  padding: 20,
                  boxShadow: unlocked ? "0 18px 50px rgba(0,0,0,0.35)" : "none",
                  opacity: unlocked ? 1 : 0.82,
                }}
              >
                {inner}
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
