import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { SchoolsContactForm } from "./SchoolsContactForm";

export const metadata: Metadata = {
  title: {
    absolute:
      "My Green Keys for Schools — Daily Learning App for Pakistani Classrooms",
  },
  description:
    "Bring My Green Keys to your school. Typing, math, and habit-building app for ages 6–14. Free pilot for Pakistani schools.",
};

const WHATSAPP_URL =
  "https://wa.me/923459055045?text=Hi%2C%20I%27d%20like%20to%20learn%20more%20about%20My%20Green%20Keys%20for%20my%20school";
const EMAIL = "mygreenkeys26@gmail.com";

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
  fontSize: "clamp(1.5rem, 4vw, 2rem)",
  fontWeight: 800,
  color: "#1B4332",
  marginBottom: "24px",
  textAlign: "center",
};

const glassCard: CSSProperties = {
  background: "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(240,249,244,0.82) 55%)",
  border: "1px solid rgba(116, 198, 157, 0.45)",
  borderRadius: "24px",
  padding: "28px 24px",
  boxShadow: "0 8px 32px rgba(27, 67, 50, 0.1)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

const whatsappBtn: CSSProperties = {
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
  border: "none",
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(45, 106, 79, 0.25)",
  width: "100%",
  maxWidth: "420px",
  boxSizing: "border-box",
};

const textLink: CSSProperties = {
  color: "#2D6A4F",
  fontWeight: 600,
  fontSize: "16px",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};

const WHAT_SCHOOLS_GET = [
  {
    icon: "📊",
    title: "Teacher dashboard",
    body: "Track every student's progress, time spent, and lessons completed in real time.",
  },
  {
    icon: "🎯",
    title: "Daily practice",
    body: "Typing, math, and habit-building in one app. Built so kids want to use it daily.",
  },
  {
    icon: "🌱",
    title: "Made in Pakistan",
    body: "Built by a Pakistani educator. EU hosting (GDPR-compliant) for international school chains.",
  },
] as const;

const HOW_IT_WORKS = [
  "Start with a free pilot — one class, up to 30 students",
  "We onboard your teacher in 30 minutes (WhatsApp or Zoom)",
  "After 2 weeks, decide if you'd like to expand",
] as const;

const WHO_ITS_FOR = [
  "Private English-medium schools",
  "Grades 1–8 (ages 6–14)",
  "Schools that want a single daily-use app, not five different ones",
] as const;

function WhatsAppButton({ fullWidth }: { fullWidth?: boolean }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...whatsappBtn,
        ...(fullWidth ? { maxWidth: "none", width: "100%" } : {}),
      }}
    >
      Chat on WhatsApp
    </a>
  );
}

export default function SchoolsPage() {
  return (
    <>
      <div style={pageBg}>
        <div className="schools-page-inner">
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
              Bring My Green Keys to Your School
            </h1>
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                lineHeight: 1.6,
                color: "#2D6A4F",
                maxWidth: "640px",
                margin: "0 auto 20px",
              }}
            >
              A daily learning app built for ages 6–14. Typing, math, and good habits — built in
              Pakistan, for Pakistani classrooms.
            </p>
            <div className="schools-hero-cta">
              <WhatsAppButton />
              <div className="schools-hero-links">
                <a href={`mailto:${EMAIL}`} style={textLink}>
                  Email us
                </a>
                <span style={{ color: "#74C69D", margin: "0 4px" }} aria-hidden>
                  ·
                </span>
                <a href="#contact" style={textLink}>
                  Request a pilot
                </a>
              </div>
            </div>
          </section>

          {/* What schools get */}
          <section style={section}>
            <h2 style={h2}>What schools get</h2>
            <div className="schools-cards-grid">
              {WHAT_SCHOOLS_GET.map((card) => (
                <div key={card.title} style={glassCard}>
                  <span style={{ fontSize: "2rem", display: "block", marginBottom: "12px" }}>
                    {card.icon}
                  </span>
                  <h3
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 800,
                      color: "#1B4332",
                      marginBottom: "10px",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p style={{ fontSize: "15px", lineHeight: 1.65, color: "#2D6A4F", margin: 0 }}>
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section style={section}>
            <h2 style={h2}>How it works</h2>
            <ol
              className="schools-steps-list"
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
            >
              {HOW_IT_WORKS.map((step, i) => (
                <li key={step}>
                  <div style={glassCard} className="schools-step-card">
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: "clamp(2.5rem, 8vw, 3.5rem)",
                        fontWeight: 900,
                        lineHeight: 1,
                        color: "#74C69D",
                        minWidth: "48px",
                      }}
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <p
                      style={{
                        margin: 0,
                        paddingTop: "8px",
                        fontSize: "17px",
                        lineHeight: 1.55,
                        fontWeight: 700,
                        color: "#1B4332",
                      }}
                    >
                      {step}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Who it's for */}
          <section style={section}>
            <h2 style={h2}>Who it&apos;s for</h2>
            <div style={{ ...glassCard, maxWidth: "560px", margin: "0 auto" }}>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {WHO_ITS_FOR.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: "16px",
                      lineHeight: 1.6,
                      color: "#2D6A4F",
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Pilot callout */}
          <section style={{ ...section, textAlign: "center" }}>
            <div
              style={{
                background: "#F2B705",
                color: "#1B4332",
                borderRadius: "16px",
                padding: "28px 24px",
                fontSize: "clamp(1.15rem, 3vw, 1.35rem)",
                fontWeight: 800,
                lineHeight: 1.4,
                maxWidth: "720px",
                margin: "0 auto",
              }}
            >
              5 pilot spots open. Free for one full term.
            </div>
          </section>

          {/* Contact */}
          <section id="contact" style={{ ...section, marginBottom: 0 }}>
            <h2 style={{ ...h2, marginBottom: "20px" }}>Get in touch</h2>
            <div style={{ ...glassCard, maxWidth: "520px", margin: "0 auto" }}>
              <div style={{ marginBottom: "20px" }}>
                <WhatsAppButton fullWidth />
              </div>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "15px",
                  color: "#2D6A4F",
                  margin: "0 0 8px",
                }}
              >
                Or email us at{" "}
                <a
                  href={`mailto:${EMAIL}`}
                  style={{
                    color: "#1B4332",
                    fontWeight: 700,
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  {EMAIL}
                </a>
              </p>
              <SchoolsContactForm />
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .schools-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 768px) {
          .schools-cards-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .schools-hero-links {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-top: 11px;
        }
        .schools-steps-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .schools-step-card {
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }
        .schools-hero-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .schools-page-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 22px 20px 64px;
          box-sizing: border-box;
        }
        @media (min-width: 768px) {
          .schools-page-inner {
            padding-left: 32px;
            padding-right: 32px;
          }
        }
      `}</style>
    </>
  );
}
