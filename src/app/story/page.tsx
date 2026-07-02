import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: "Our Story — Why I Built My Green Keys",
  },
  description:
    "Why Waleed Bin Khalid built My Green Keys: 15 years at DHL Express, a daily habit instead of another app, and learning that builds character.",
};

const pageBg: CSSProperties = {
  backgroundColor: "#FAFAF7",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  minHeight: "100%",
};

const section: CSSProperties = {
  marginBottom: "56px",
};

const h2: CSSProperties = {
  fontSize: "clamp(1.4rem, 3.5vw, 1.9rem)",
  fontWeight: 800,
  color: "#1B4332",
  marginBottom: "16px",
};

const glassCard: CSSProperties = {
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(240,249,244,0.82) 55%)",
  border: "1px solid rgba(116, 198, 157, 0.45)",
  borderRadius: "24px",
  padding: "28px 24px",
  boxShadow: "0 8px 32px rgba(27, 67, 50, 0.1)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

const body: CSSProperties = {
  fontSize: "16px",
  lineHeight: 1.75,
  color: "#2D6A4F",
  margin: 0,
};

const primaryBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px 32px",
  borderRadius: "12px",
  fontSize: "17px",
  fontWeight: 700,
  background: "#52B788",
  color: "#FFFFFF",
  textDecoration: "none",
  boxShadow: "0 4px 14px rgba(45, 106, 79, 0.25)",
};

const secondaryBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px 32px",
  borderRadius: "12px",
  fontSize: "17px",
  fontWeight: 700,
  background: "transparent",
  color: "#1B4332",
  textDecoration: "none",
  border: "2px solid #2D6A4F",
};

export default function StoryPage() {
  return (
    <>
      <div style={pageBg}>
        <div className="story-page-inner">
          {/* Hero */}
          <section style={{ ...section, paddingTop: "17px", textAlign: "center" }}>
            <h1
              style={{
                fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
                fontWeight: 800,
                color: "#1B4332",
                lineHeight: 1.2,
                marginBottom: "11px",
              }}
            >
              Why I Built My Green Keys
            </h1>
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                lineHeight: 1.6,
                color: "#2D6A4F",
                maxWidth: "640px",
                margin: "0 auto",
              }}
            >
              A note from the founder.
            </p>
          </section>

          {/* Section 1: DHL */}
          <section style={section}>
            <div style={glassCard}>
              <h2 style={h2}>15 years watching the world go digital</h2>
              <p style={body}>
                I spent 15 years at DHL Express, watching entire industries move online —
                logistics, paperwork, communication, all of it. Every year the world got
                faster and more digital. And every year, I noticed the same gap back home:
                Pakistani kids weren&apos;t being prepared for it. Schools focused on exams,
                not the basic digital skills kids would need for everything else in their
                lives. Typing, one of the most fundamental skills for using a computer at
                all, was barely taught anywhere.
              </p>
            </div>
          </section>

          {/* Section 2: The insight */}
          <section style={section}>
            <div style={glassCard}>
              <h2 style={h2}>Kids don&apos;t need another app. They need a daily habit.</h2>
              <p style={body}>
                I didn&apos;t want to build another app that gets downloaded once and
                forgotten. I wanted to build a habit. That&apos;s where typing came in — it
                is, by nature, a skill that only improves with daily practice. You
                can&apos;t cram it the night before an exam. So typing became the vehicle:
                a few minutes a day, every day, building a skill kids will use for the rest
                of their lives — while also opening the door to daily math practice and
                good habits along the way.
              </p>
            </div>
          </section>

          {/* Section 3: Why green */}
          <section style={section}>
            <div style={glassCard}>
              <h2 style={h2}>Why &quot;green&quot;</h2>
              <p style={body}>
                Learning should build character, not just skills. That&apos;s why My Green
                Keys pairs typing practice with eco lessons — and why real progress in the
                app leads to real trees being planted. Screen time isn&apos;t something to
                feel guilty about when it&apos;s building a habit, teaching a skill, and
                doing something good for the planet at the same time.
              </p>
            </div>
          </section>

          {/* Closing */}
          <section style={{ ...section, textAlign: "center", marginBottom: 0 }}>
            <div style={{ ...glassCard, maxWidth: "640px", margin: "0 auto" }}>
              <p
                style={{
                  ...body,
                  fontSize: "17px",
                  marginBottom: "24px",
                }}
              >
                That&apos;s why I built My Green Keys — for every kid learning to type, and
                for the planet they&apos;ll inherit.
              </p>
              <p
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "#1B4332",
                  marginBottom: "28px",
                }}
              >
                Waleed Bin Khalid, Founder
              </p>
              <div className="story-cta-row">
                <Link href="/schools" style={primaryBtn}>
                  For schools
                </Link>
                <Link href="/signup" style={secondaryBtn}>
                  Get started
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .story-page-inner {
          max-width: 900px;
          margin: 0 auto;
          padding: 22px 20px 64px;
          box-sizing: border-box;
        }
        @media (min-width: 768px) {
          .story-page-inner {
            padding-left: 32px;
            padding-right: 32px;
          }
        }
        .story-cta-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        @media (min-width: 480px) {
          .story-cta-row {
            flex-direction: row;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
