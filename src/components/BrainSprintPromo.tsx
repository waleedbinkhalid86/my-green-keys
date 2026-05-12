"use client";

import Image from "next/image";
import Link from "next/link";

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
        borderTop: "1px solid rgba(27, 67, 50, 0.16)",
        boxShadow: "inset 0 10px 14px -12px rgba(26, 47, 35, 0.12)",
      }}
      className="pt-14 pb-14 md:pt-20 md:pb-20"
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
          <div
            style={{
              flexShrink: 0,
              width: "100%",
              maxWidth: 480,
              display: "flex",
              justifyContent: "center",
            }}
            className="md:justify-start"
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 480,
                aspectRatio: "4 / 3",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
              }}
            >
              <Image
                src={BRAIN_SPRINT_PROMO_IMAGE_SRC}
                alt="Brain Sprint — math and eco lesson preview"
                fill
                sizes="(max-width: 767px) 100vw, 480px"
                style={{ objectFit: "cover" }}
                priority={false}
              />
            </div>
          </div>

          <div className="min-w-0 w-full flex-1 md:w-auto">
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
