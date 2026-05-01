"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Lock } from "lucide-react";
import "@/app/globals.css";

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
    description: "Sort items into the right bins before the conveyor overflows.",
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

        const { data: progressRows, error: pErr } = await supabase
          .from("student_progress")
          .select("lesson_id")
          .eq("student_id", userData.user.id)
          .eq("completed", true);
        if (pErr) throw pErr;
        setCompletedLessons((progressRows ?? []).length);

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
          <div style={{ marginBottom: 18, fontWeight: 800, opacity: 0.9 }}>
            Lessons completed: <span style={{ color: "#FFEB3B" }}>{done}</span>
            {paidPlan && (
              <span style={{ marginLeft: 12, color: "#A5D6A7" }}>· Family / school plan active ✓</span>
            )}
          </div>
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
            const isImplemented = g.slug === "/games/falling-leaves";

            let lockMessage: string | null = null;
            if (!lessonOk) {
              lockMessage = `Complete ${g.unlockLessons} lessons to unlock`;
            } else if (g.requiresPaid && !paidPlan) {
              lockMessage = "Family Plan required";
            }

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
