"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

/** Hero art for homepage promo (see also eco-hero.png in same folder). */
const BRAIN_SPRINT_PROMO_IMAGE_SRC = "/images/brain-sprint/math-hero.png";

const CTA_STYLE: React.CSSProperties = {
  background: "linear-gradient(135deg, #52B788 0%, #40916C 100%)",
  color: "white",
  borderRadius: "12px",
  padding: "14px 28px",
  fontWeight: 700,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  border: "none",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

export function BrainSprintPromo() {
  return (
    <section
      aria-labelledby="brain-sprint-promo-heading"
      style={{
        backgroundColor: "#F0F9F4",
        backgroundImage: "radial-gradient(rgba(45, 106, 79, 0.14) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
      className="py-12 md:py-20"
    >
      <div className="mgk-container max-w-[1200px]">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex w-full justify-center md:w-[400px] md:max-w-[400px] md:flex-shrink-0 md:justify-start">
            <div
              className="relative w-full overflow-hidden rounded-xl shadow-sm"
              style={{ maxWidth: 400, aspectRatio: "4 / 3" }}
            >
              <Image
                src={BRAIN_SPRINT_PROMO_IMAGE_SRC}
                alt="Brain Sprint — math and eco lesson preview"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
                priority={false}
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <span
              style={{
                display: "inline-block",
                background: "#52B788",
                color: "white",
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                padding: "6px 12px",
                borderRadius: "9999px",
                marginBottom: "14px",
              }}
            >
              NEW FEATURE
            </span>
            <h2
              id="brain-sprint-promo-heading"
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 900,
                color: "#1B4332",
                lineHeight: 1.2,
                margin: "0 0 12px",
              }}
            >
              Beyond typing — Brain Sprint lessons
            </h2>
            <p
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "#2D6A4F",
                lineHeight: 1.55,
                margin: "0 0 20px",
                maxWidth: "520px",
              }}
            >
              Math sprints and eco lessons that make learning feel like a game. Earn stars, level up, save the planet.
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 24px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#1B4332",
              }}
            >
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span aria-hidden>🧮</span>
                <span>Math sprints</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span aria-hidden>🌱</span>
                <span>Eco lessons</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span aria-hidden>⭐</span>
                <span>Stars & rewards</span>
              </li>
            </ul>
            <Link
              href="/brain-sprint"
              className="hover:scale-[1.02] hover:shadow-lg"
              style={CTA_STYLE}
            >
              Try Brain Sprint →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
