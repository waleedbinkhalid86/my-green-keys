"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BrainSprintProgress } from "@/lib/brain-sprint/progress-types";
import { fetchAllProgress } from "@/lib/brain-sprint/progress-api";

const dottedBg: React.CSSProperties = {
  backgroundColor: "#FAFAF7",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  minHeight: "100vh",
};

const headerCardStyle: React.CSSProperties = {
  background: "rgba(232, 245, 238, 0.5)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(82, 183, 136, 0.25)",
  borderRadius: "24px",
  padding: "40px",
  boxShadow: "0 10px 40px rgba(27, 67, 50, 0.08)",
};

const statBoxStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.5)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(82, 183, 136, 0.2)",
  borderRadius: "16px",
  padding: "20px",
  textAlign: "center",
};

const trackCardShadow: React.CSSProperties = {
  boxShadow:
    "0 20px 50px rgba(27, 67, 50, 0.25), 0 0 0 1px rgba(82, 183, 136, 0.15)",
};

const trackBadgeBase: React.CSSProperties = {
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

const ctaPillStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.25)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.4)",
};

const TOTAL_LESSONS_AVAILABLE = 15;

export default function BrainSprintHubPage() {
  const [progress, setProgress] = useState<BrainSprintProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const rows = await fetchAllProgress();
      if (!cancelled) {
        setProgress(rows);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const completedCount = progress.filter((p) => p.is_completed).length;
  const ecoPointsSum = progress.reduce((sum, p) => sum + p.eco_points_earned, 0);
  const mathCompleted = progress.filter((p) => p.track === "math" && p.is_completed).length;
  const ecoCompleted = progress.filter((p) => p.track === "eco" && p.is_completed).length;

  return (
    <div style={dottedBg} className="min-h-screen py-12 px-4">
      <div style={headerCardStyle} className="max-w-6xl mx-auto mt-8 mb-12">
        <div className="text-xs font-bold text-[#52B788] uppercase tracking-widest mb-3">
          BRAIN SPRINT
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[#1B4332] mb-4">
          Think fast. Type faster.
        </h1>
        <p className="text-lg text-[#4A6355] mb-8">
          Lessons that make typing more than typing.
        </p>

        <div className="grid grid-cols-3 gap-4">
          <div style={statBoxStyle}>
            <div className="text-xs font-bold text-[#4A6355] uppercase tracking-wider mb-2">
              Total lessons
            </div>
            <div className="text-4xl font-bold text-[#1B4332]">
              {loading ? "…" : TOTAL_LESSONS_AVAILABLE}
            </div>
          </div>
          <div style={statBoxStyle}>
            <div className="text-xs font-bold text-[#4A6355] uppercase tracking-wider mb-2">
              Completed
            </div>
            <div className="text-4xl font-bold text-[#1B4332]">
              {loading ? "…" : completedCount}
            </div>
          </div>
          <div style={statBoxStyle}>
            <div className="text-xs font-bold text-[#4A6355] uppercase tracking-wider mb-2">
              Eco-points
            </div>
            <div className="text-4xl font-bold text-[#1B4332]">
              {loading ? "…" : ecoPointsSum}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        <Link
          href="/brain-sprint/math"
          className="group relative block aspect-square rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(27,67,50,0.35)]"
          style={trackCardShadow}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: "url('/images/brain-sprint/math-hero.png')",
            }}
          />

          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          <div className="absolute top-6 left-6">
            <div
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-white"
              style={{
                ...trackBadgeBase,
                background: "rgba(59, 130, 246, 0.85)",
              }}
            >
              TRACK 1
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h3
              className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:translate-x-2 transition-transform duration-300"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
            >
              Math Mastery
            </h3>
            <p
              className="text-white/95 text-base mb-4"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
            >
              10 lessons · Addition to Division
            </p>
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm transition-all"
              style={ctaPillStyle}
            >
              <span>
                {loading ? "…" : `${mathCompleted} / 10`} lessons
              </span>
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </div>
        </Link>

        <Link
          href="/brain-sprint/eco"
          className="group relative block aspect-square rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(27,67,50,0.35)]"
          style={trackCardShadow}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: "url('/images/brain-sprint/eco-hero.png')",
            }}
          />

          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          <div className="absolute top-6 left-6">
            <div
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-white"
              style={{
                ...trackBadgeBase,
                background: "rgba(82, 183, 136, 0.85)",
              }}
            >
              TRACK 2
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h3
              className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:translate-x-2 transition-transform duration-300"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
            >
              Eco Genius
            </h3>
            <p
              className="text-white/95 text-base mb-4"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
            >
              5 lessons · Planet facts & habits
            </p>
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm transition-all"
              style={ctaPillStyle}
            >
              <span>
                {loading ? "…" : `${ecoCompleted} / 5`} lessons
              </span>
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
