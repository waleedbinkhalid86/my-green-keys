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

/** Forest Canopy hub: keeps hero + track picks aligned and off screen edges */
const pageShellStyle: React.CSSProperties = {
  maxWidth: 1200,
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: 24,
  paddingRight: 24,
};

const trackImageWrapStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: 240,
  maxHeight: 260,
  overflow: "hidden",
};

const trackCardStyle: React.CSSProperties = {
  display: "block",
  textDecoration: "none",
  color: "inherit",
  background: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(82, 183, 136, 0.22)",
  borderRadius: 16,
  overflow: "hidden",
};

const trackCardBodyStyle: React.CSSProperties = {
  padding: "20px 22px 22px",
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

const trackBadgeBase: React.CSSProperties = {
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
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

  return (
    <div style={dottedBg} className="min-h-screen py-12">
      <div style={pageShellStyle}>
        <div style={headerCardStyle} className="mt-8 mb-12">
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

        <div
          className="grid grid-cols-1 md:grid-cols-2 pb-8"
          style={{ gap: 24 }}
        >
          <Link
            href="/brain-sprint/math"
            className="group cursor-pointer shadow-[0_12px_32px_rgba(27,67,50,0.12),0_0_0_1px_rgba(82,183,136,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(27,67,50,0.18),0_0_0_1px_rgba(82,183,136,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF7]"
            style={trackCardStyle}
          >
            <div style={trackImageWrapStyle}>
              <img
                src="/images/brain-sprint/math-hero.png"
                alt="Math track artwork"
                className="transition-transform duration-500 group-hover:scale-[1.03]"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
              <div style={{ position: "absolute", top: 14, left: 14 }}>
                <div
                  className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-white"
                  style={{
                    ...trackBadgeBase,
                    background: "rgba(59, 130, 246, 0.9)",
                    borderRadius: 9999,
                  }}
                >
                  TRACK 1
                </div>
              </div>
            </div>
            <div style={trackCardBodyStyle}>
              <h3 className="text-xl md:text-2xl font-bold text-[#1B4332] mb-2 group-hover:text-[#0F2922] transition-colors">
                Math Sprints
              </h3>
              <p
                className="text-[15px] leading-snug text-[#4A6355]"
                style={{ margin: 0 }}
              >
                Speed-focused drills from addition through division.
              </p>
            </div>
          </Link>

          <Link
            href="/brain-sprint/eco"
            className="group cursor-pointer shadow-[0_12px_32px_rgba(27,67,50,0.12),0_0_0_1px_rgba(82,183,136,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(27,67,50,0.18),0_0_0_1px_rgba(82,183,136,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF7]"
            style={trackCardStyle}
          >
            <div style={trackImageWrapStyle}>
              <img
                src="/images/brain-sprint/eco-hero.png"
                alt="Eco track artwork"
                className="transition-transform duration-500 group-hover:scale-[1.03]"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
              <div style={{ position: "absolute", top: 14, left: 14 }}>
                <div
                  className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-white"
                  style={{
                    ...trackBadgeBase,
                    background: "rgba(82, 183, 136, 0.92)",
                    borderRadius: 9999,
                  }}
                >
                  TRACK 2
                </div>
              </div>
            </div>
            <div style={trackCardBodyStyle}>
              <h3 className="text-xl md:text-2xl font-bold text-[#1B4332] mb-2 group-hover:text-[#0F2922] transition-colors">
                Eco Lessons
              </h3>
              <p
                className="text-[15px] leading-snug text-[#4A6355]"
                style={{ margin: 0 }}
              >
                Planet-smart facts and everyday green habits in five quick
                lessons.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
