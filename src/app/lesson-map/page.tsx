"use client";

import React, { useEffect, useMemo, useState } from "react";
import { lessons, type Lesson } from "@/data/lessons";
import { createClient } from "@/lib/supabase/client";

type ProgressRow = {
  lesson_id: number;
  completed?: boolean | null;
  stars?: number | null;
  eco_points?: number | null;
};

const PHASES = [
  { id: 1, icon: "🟢", title: "Phase 1: Home Row", range: [1, 20] as const },
  { id: 2, icon: "🔵", title: "Phase 2: Top Row", range: [21, 45] as const },
  { id: 3, icon: "🟠", title: "Phase 3: Bottom Row", range: [46, 65] as const },
  { id: 4, icon: "🟣", title: "Phase 4: Numbers", range: [66, 70] as const },
  { id: 5, icon: "🩷", title: "Phase 5: Capital Letters", range: [71, 85] as const },
  { id: 6, icon: "🔴", title: "Phase 6: Speed Drills", range: [86, 100] as const },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function TreesStrip() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 180,
        pointerEvents: "none",
        opacity: 0.9,
      }}
    >
      <svg
        viewBox="0 0 1200 220"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="groundGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#2d6a4f" stopOpacity="0.9" />
            <stop offset="1" stopColor="#1b4d30" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect x="0" y="140" width="1200" height="90" fill="url(#groundGrad)" />
        {Array.from({ length: 18 }).map((_, i) => {
          const x = 30 + i * 65;
          const h = 70 + (i % 5) * 8;
          return (
            <g key={i} transform={`translate(${x} ${150 - h})`}>
              <rect x="14" y={h - 18} width="8" height="30" rx="2" fill="#6b3f1e" />
              <polygon points={`18,0 36,${h} 0,${h}`} fill={i % 2 === 0 ? "#40916c" : "#2d6a4f"} />
              <polygon points={`18,14 32,${h - 10} 4,${h - 10}`} fill={i % 3 === 0 ? "#52b788" : "#1b4d30"} opacity="0.9" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function LessonMapPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  const [starsTotal, setStarsTotal] = useState(0);
  const [ecoPointsTotal, setEcoPointsTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const supabase = createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) {
          setError("You must be logged in to view your lesson map.");
          setCompletedSet(new Set());
          setStarsTotal(0);
          setEcoPointsTotal(0);
          return;
        }

        // Try to load the richer schema first, fallback if columns don't exist.
        let rows: ProgressRow[] = [];
        const attempt = await supabase
          .from("student_progress")
          .select("lesson_id, completed, stars, eco_points")
          .eq("student_id", userData.user.id);

        if (attempt.error) {
          const fallback = await supabase
            .from("student_progress")
            .select("lesson_id, completed")
            .eq("student_id", userData.user.id);
          if (fallback.error) throw fallback.error;
          rows = (fallback.data as unknown as ProgressRow[] | null) ?? [];
        } else {
          rows = (attempt.data as unknown as ProgressRow[] | null) ?? [];
        }

        const done = new Set<number>();
        let stars = 0;
        let eco = 0;
        for (const r of rows) {
          if (r.completed) done.add(Number(r.lesson_id));
          stars += Number(r.stars ?? 0) || 0;
          eco += Number(r.eco_points ?? 0) || 0;
        }

        setCompletedSet(done);
        setStarsTotal(stars);
        setEcoPointsTotal(eco);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lesson map.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const completedCount = completedSet.size;
  const currentLessonId = useMemo(() => {
    for (let i = 1; i <= 100; i++) {
      if (!completedSet.has(i)) return i;
    }
    return 100;
  }, [completedSet]);

  const progressPct = clamp((completedCount / 100) * 100, 0, 100);

  const lessonsById = useMemo(() => {
    const map = new Map<number, Lesson>();
    lessons.forEach((l) => map.set(l.id, l));
    return map;
  }, []);

  const openLesson = (id: number) => {
    window.location.href = `/lesson?lesson=${id}`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        background:
          "linear-gradient(180deg,#162d1e 0%,#1f4d35 25%,#2d6a4f 55%,#52b788 80%,#81c99e 100%)",
        paddingBottom: 200,
      }}
    >
      <TreesStrip />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 0" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 10px 35px rgba(0,0,0,0.12)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.18em", color: "#2d6a4f" }}>
                LESSON MAP
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#2c3e50", marginTop: 4 }}>
                You completed {completedCount}/100 lessons 🌿
              </div>
              <div style={{ color: "#6b7280", marginTop: 4, fontWeight: 600 }}>
                Current lesson: #{currentLessonId}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "stretch" }}>
              <div
                style={{
                  background: "#E8F5E9",
                  border: "1px solid rgba(76,175,80,0.25)",
                  borderRadius: 14,
                  padding: "10px 12px",
                  minWidth: 160,
                }}
              >
                <div style={{ fontSize: 12, color: "#2e7d32", fontWeight: 900 }}>Eco points</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#1b4d30" }}>{ecoPointsTotal}</div>
              </div>
              <div
                style={{
                  background: "#FFFDE7",
                  border: "1px solid rgba(255,235,59,0.35)",
                  borderRadius: 14,
                  padding: "10px 12px",
                  minWidth: 160,
                }}
              >
                <div style={{ fontSize: 12, color: "#8a6d1b", fontWeight: 900 }}>Stars earned</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#2c3e50" }}>{starsTotal} ⭐</div>
              </div>
              <button
                type="button"
                onClick={() => (window.location.href = "/lesson")}
                style={{
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: 14,
                  padding: "12px 14px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                ▶ Back to Lesson
              </button>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ height: 10, background: "rgba(0,0,0,0.06)", borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  width: `${progressPct}%`,
                  height: "100%",
                  background: "linear-gradient(90deg,#4CAF50 0%,#2196F3 100%)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "#ffebee", border: "1px solid #ef5350", color: "#c62828", fontWeight: 800 }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ marginTop: 18 }}>
          {loading ? (
            <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 800, padding: "18px 6px" }}>
              Loading progress...
            </div>
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              {PHASES.map((p) => {
                const [start, end] = p.range;
                const phaseLessons = lessons.filter((l) => l.id >= start && l.id <= end);

                return (
                  <div key={p.id}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        margin: "10px 0 10px",
                        color: "rgba(255,255,255,0.95)",
                        fontWeight: 900,
                        fontSize: 18,
                        textShadow: "0 8px 24px rgba(0,0,0,0.25)",
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{p.icon}</span>
                      <span>{p.title}</span>
                      <span style={{ opacity: 0.75, fontSize: 13, fontWeight: 800 }}>
                        — Lessons {start}-{end}
                      </span>
                    </div>

                    <div className="lesson-grid">
                      {phaseLessons.map((l) => {
                        const isCompleted = completedSet.has(l.id);
                        const isCurrent = !isCompleted && l.id === currentLessonId;
                        const isLocked = !isCompleted && l.id > currentLessonId;

                        const statusIcon = isCompleted ? "⭐" : isCurrent ? "▶️" : "🔒";
                        const canOpen = isCompleted || isCurrent;

                        return (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => canOpen && openLesson(l.id)}
                            disabled={!canOpen}
                            className={[
                              "lesson-card",
                              isCompleted ? "lesson-completed" : "",
                              isCurrent ? "lesson-current" : "",
                              isLocked ? "lesson-locked" : "",
                            ].join(" ")}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.14em", color: isCompleted ? "#1b4d30" : "#4CAF50" }}>
                                  LESSON {l.id}
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 900, color: "#2c3e50", marginTop: 6, lineHeight: 1.25 }}>
                                  {l.title}
                                </div>
                              </div>
                              <div style={{ fontSize: 18 }}>{statusIcon}</div>
                            </div>

                            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 800 }}>
                                Target: {l.targetWPM ?? "—"} WPM
                              </div>
                              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 800 }}>
                                {isCompleted ? "Completed" : isCurrent ? "Next" : "Locked"}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .lesson-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        @media (min-width: 1024px) {
          .lesson-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }

        .lesson-card {
          text-align: left;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.92);
          padding: 14px 14px 12px;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          backdrop-filter: blur(8px);
        }
        .lesson-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 44px rgba(0,0,0,0.14);
          border-color: rgba(76,175,80,0.35);
        }
        .lesson-card:disabled {
          cursor: not-allowed;
          opacity: 0.75;
          transform: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }
        .lesson-completed {
          background: rgba(232,245,233,0.95);
          border-color: rgba(76,175,80,0.45);
        }
        .lesson-current {
          border-color: rgba(255,235,59,0.65);
          box-shadow: 0 0 0 3px rgba(255,235,59,0.25), 0 18px 44px rgba(0,0,0,0.14);
          animation: currentPulse 1.6s ease-in-out infinite;
        }
        @keyframes currentPulse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

