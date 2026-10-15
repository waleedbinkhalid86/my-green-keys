import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { BarChart3, Sprout, Target } from "lucide-react";
import { Container } from "@/components/marketing/Container";
import { Section } from "@/components/marketing/Section";
import { PrimaryButton } from "@/components/marketing/Buttons";
import { Card } from "@/components/marketing/Card";
import { SchoolsContactForm } from "./SchoolsContactForm";

export const metadata: Metadata = {
  title: {
    absolute:
      "School sustainability partnership — My Green Keys for Pakistani classrooms",
  },
  description:
    "Join My Green Keys as a sustainability partner school. Free for every teacher and student: typing, math and eco habits for ages 6–14.",
};

const WHATSAPP_URL =
  "https://wa.me/923459055045?text=Hi%2C%20I%27d%20like%20to%20learn%20more%20about%20My%20Green%20Keys%20for%20my%20school";
const EMAIL = "mygreenkeys26@gmail.com";

const pageBg: CSSProperties = {
  backgroundColor: "#FAFAF5",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  minHeight: "100%",
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
    Icon: BarChart3,
    title: "Teacher dashboard",
    body: "Track every student's progress, time spent, and lessons completed in real time.",
  },
  {
    Icon: Target,
    title: "Daily practice",
    body: "Typing, math, and habit-building in one app. Built so kids want to use it daily.",
  },
  {
    Icon: Sprout,
    title: "Made in Pakistan",
    body: "Built by a Pakistani educator. GDPR-aware, with EU hosting for international school chains.",
  },
] as const;

const HOW_IT_WORKS = [
  "Your school joins as a sustainability partner, free for every teacher and student",
  "We onboard your teachers in 30 minutes (WhatsApp or Zoom) and set up your classes",
  "Students practise typing and build eco habits every day",
  "Together we build awareness about sustainability in your school community",
] as const;

const WHO_ITS_FOR = [
  "Private English-medium schools",
  "Grades 1–8 (ages 6–14)",
  "Schools that want a single daily-use app, not five different ones",
] as const;

function WhatsAppButton({ block }: { block?: boolean }) {
  return (
    <PrimaryButton href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" block={block}>
      Chat on WhatsApp
    </PrimaryButton>
  );
}

export default function SchoolsPage() {
  return (
    <div style={pageBg}>
      {/* Hero */}
      <Section>
        <Container style={{ textAlign: "center" }}>
          <div style={{ maxWidth: 720, marginInline: "auto" }}>
            <h1 className="mgk-h1">School sustainability partnership</h1>
            <p className="mgk-lead" style={{ marginTop: 16 }}>
              Partner with My Green Keys to help your students learn to type and care for the
              planet. Free for your school, built in Pakistan for Pakistani classrooms.
            </p>
            <div className="mgk-btn-row" style={{ marginTop: 32 }}>
              <WhatsAppButton />
            </div>
            <div className="mgk-btn-row" style={{ marginTop: 16, gap: 8 }}>
              <a href={`mailto:${EMAIL}`} style={textLink}>
                Email us
              </a>
              <span style={{ color: "#74C69D" }} aria-hidden>
                ·
              </span>
              <a href="#contact" style={textLink}>
                Become a partner school
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* What schools get */}
      <Section tone="pale">
        <Container>
          <div className="mgk-sec-head">
            <h2 className="mgk-h2">What schools get</h2>
          </div>
          <div className="mgk-grid-3">
            {WHAT_SCHOOLS_GET.map(({ Icon, title, body }) => (
              <Card key={title}>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: "#F0F9F4" }}
                >
                  <Icon size={24} strokeWidth={2.25} color="#2D6A4F" aria-hidden />
                </div>
                <h3 className="mgk-h3" style={{ marginTop: 16 }}>
                  {title}
                </h3>
                <p className="mgk-body" style={{ marginTop: 8 }}>
                  {body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* How it works */}
      <Section>
        <Container>
          <div className="mgk-sec-head">
            <h2 className="mgk-h2">How it works</h2>
          </div>
          <ol
            style={{
              listStyle: "none",
              margin: "0 auto",
              padding: 0,
              maxWidth: 720,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {HOW_IT_WORKS.map((step, i) => (
              <li key={step}>
                <Card bodyStyle={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 48,
                      fontSize: "2.5rem",
                      fontWeight: 700,
                      lineHeight: 1,
                      color: "#52B788",
                      textAlign: "center",
                    }}
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <p className="mgk-label" style={{ margin: 0, fontSize: "1.0625rem", lineHeight: 1.5, color: "#1B4332" }}>
                    {step}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Who it's for */}
      <Section tone="pale">
        <Container>
          <div className="mgk-sec-head">
            <h2 className="mgk-h2">Who it&apos;s for</h2>
          </div>
          <Card style={{ maxWidth: 560, marginInline: "auto" }}>
            <ul
              className="mgk-body"
              style={{
                margin: 0,
                paddingLeft: 24,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                listStyle: "disc",
              }}
            >
              {WHO_ITS_FOR.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </Container>
      </Section>

      {/* Partnership callout + contact */}
      <Section id="contact">
        <Container>
          <div
            style={{
              background: "#F2B705",
              color: "#1B4332",
              borderRadius: "var(--mgk-radius-card)",
              padding: "32px 24px",
              fontSize: "clamp(1.15rem, 3vw, 1.35rem)",
              fontWeight: 700,
              lineHeight: 1.4,
              maxWidth: 720,
              margin: "0 auto var(--mgk-space-6)",
              textAlign: "center",
            }}
          >
            Partner schools join free, with no time limit.
            <br />
            <span style={{ fontSize: "0.7em", fontWeight: 600 }}>
              Learn to type. Help the planet. Together.
            </span>
          </div>

          <div className="mgk-sec-head" style={{ marginBottom: 32 }}>
            <h2 className="mgk-h2">Become a partner school</h2>
          </div>
          <Card style={{ maxWidth: 520, marginInline: "auto" }} bodyStyle={{ padding: 32 }}>
            <WhatsAppButton block />
            <p className="mgk-body" style={{ textAlign: "center", marginTop: 16 }}>
              Or email us at{" "}
              <a
                href={`mailto:${EMAIL}`}
                style={{
                  color: "#1B4332",
                  fontWeight: 600,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  overflowWrap: "anywhere",
                }}
              >
                {EMAIL}
              </a>
            </p>
            <SchoolsContactForm />
          </Card>
        </Container>
      </Section>
    </div>
  );
}
