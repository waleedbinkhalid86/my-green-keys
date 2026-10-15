"use client";

import Image from "next/image";
import { Container } from "@/components/marketing/Container";
import { Section } from "@/components/marketing/Section";
import { PrimaryButton } from "@/components/marketing/Buttons";
import { Eyebrow } from "@/components/marketing/Eyebrow";

/** Hero art for homepage promo (see also eco-hero.png in same folder). */
const BRAIN_SPRINT_PROMO_IMAGE_SRC = "/images/brain-sprint/math-hero.png";

const LIST_ITEM: React.CSSProperties = { display: "flex", alignItems: "center", gap: "8px" };

export function BrainSprintPromo() {
  return (
    <Section tone="pale" aria-labelledby="brain-sprint-promo-heading">
      <Container>
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
                borderRadius: "var(--mgk-radius-card)",
                overflow: "hidden",
                boxShadow: "var(--mgk-shadow-card)",
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
            <Eyebrow style={{ marginBottom: 16 }}>NEW FEATURE</Eyebrow>
            <h2 id="brain-sprint-promo-heading" className="mgk-h2" style={{ marginBottom: 16 }}>
              Beyond typing — Brain Sprint lessons
            </h2>
            <p className="mgk-lead" style={{ marginBottom: 24, maxWidth: 520 }}>
              Math sprints and eco lessons that make learning feel like a game. Earn stars, level up, save the planet.
            </p>
            <ul
              className="mgk-label"
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 32px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "1rem",
                color: "#1B4332",
              }}
            >
              <li style={LIST_ITEM}>
                <span aria-hidden>🧮</span>
                <span>Math sprints</span>
              </li>
              <li style={LIST_ITEM}>
                <span aria-hidden>🌱</span>
                <span>Eco lessons</span>
              </li>
              <li style={LIST_ITEM}>
                <span aria-hidden>⭐</span>
                <span>Stars & rewards</span>
              </li>
            </ul>
            <PrimaryButton href="/brain-sprint">Try Brain Sprint →</PrimaryButton>
          </div>
        </div>
      </Container>
    </Section>
  );
}
