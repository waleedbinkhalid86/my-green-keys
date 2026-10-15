import type { CSSProperties } from "react";
import {
  Ban,
  BookOpen,
  Brain,
  CheckCircle,
  ChevronDown,
  Gamepad2,
  GraduationCap,
  Leaf,
  Lock,
  Shield,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { Container } from "@/components/marketing/Container";
import { Section } from "@/components/marketing/Section";
import { PrimaryButton, SecondaryButton } from "@/components/marketing/Buttons";
import { Card } from "@/components/marketing/Card";
import { Eyebrow } from "@/components/marketing/Eyebrow";

const INCLUDED = [
  {
    Icon: BookOpen,
    title: "Typing lessons",
    body: "The full lesson map, from home row to capitals and punctuation, with WPM and accuracy tracking.",
  },
  {
    Icon: Brain,
    title: "Brain Sprint",
    body: "Short daily math and eco lessons that build real understanding, one sprint at a time.",
  },
  {
    Icon: Target,
    title: "Habit Quest",
    body: "Parents set daily challenges. Kids complete them and build habits that stick.",
  },
  {
    Icon: Trophy,
    title: "Ranger system",
    body: "XP, streaks, ranks and badges that reward showing up every day.",
  },
  {
    Icon: Gamepad2,
    title: "Every game",
    body: "All learning games, including Eco Garden and Kind World, unlocked as kids progress.",
  },
  {
    Icon: Users,
    title: "Parent dashboard",
    body: "Unlimited child profiles, custom lessons, eco photo approvals and progress reports.",
  },
  {
    Icon: GraduationCap,
    title: "Teacher dashboard",
    body: "Classes, class codes, bulk student upload, assigned lessons and printable reports.",
  },
  {
    Icon: Leaf,
    title: "Eco actions",
    body: "Kids log real eco actions with photos and earn rewards for helping the planet.",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "Is My Green Keys really free?",
    a: "Yes. Every feature is free for kids, parents and schools right now. There are no locked lessons and no paid tiers.",
  },
  {
    q: "Do I need a credit card to sign up?",
    a: "No. Create an account with your email or Google and start right away. We never ask for payment details.",
  },
  {
    q: "Is there a limit on children or students?",
    a: "No. Parents can add every child in the family, and teachers can add whole classes.",
  },
  {
    q: "How can my school join?",
    a: "Schools join as sustainability partners at no cost. We help onboard your teachers and set up your classes. Visit the schools page to get started.",
  },
  {
    q: "Will it stay free?",
    a: "Everything is free for now. If we ever introduce paid plans, we will tell you well in advance, and nothing you have already built will be taken away.",
  },
] as const;

const TRUST_SIGNALS = [
  { Icon: Lock, label: "Privacy-first design for kids" },
  { Icon: Shield, label: "GDPR-aware · EU hosting" },
  { Icon: Ban, label: "100% Ad-Free" },
] as const;

const pageBg: CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#FAFAF5",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
};

export default function PricingPage() {
  return (
    <div style={pageBg}>
      {/* Hero */}
      <Section>
        <Container style={{ textAlign: "center" }}>
          <div style={{ maxWidth: 720, marginInline: "auto" }}>
            <Eyebrow style={{ marginBottom: 24 }}>$0 for everyone</Eyebrow>
            <h1 className="mgk-h1">Free for every child</h1>
            <p className="mgk-lead" style={{ marginTop: 16 }}>
              Kids, parents and schools get full access to everything My Green Keys offers.
              No plans, no trials, no credit card.
            </p>
            <div className="mgk-btn-row" style={{ marginTop: 32 }}>
              <PrimaryButton href="/signup">Start free</PrimaryButton>
            </div>
            <div className="mgk-btn-row" style={{ marginTop: 32, gap: 8 }}>
              {TRUST_SIGNALS.map(({ Icon, label }) => (
                <span
                  key={label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#fff",
                    border: "1px solid var(--mgk-border-card)",
                    borderRadius: 9999,
                    padding: "8px 16px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#1B4332",
                  }}
                >
                  <Icon size={16} strokeWidth={2.25} color="#2D6A4F" aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* What's included */}
      <Section tone="pale">
        <Container>
          <div className="mgk-sec-head">
            <h2 className="mgk-h2">What&apos;s included</h2>
            <p className="mgk-lead">Every feature, for every account. Nothing is locked behind a paywall.</p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "var(--mgk-space-3)",
            }}
          >
            {INCLUDED.map(({ Icon, title, body }) => (
              <Card key={title}>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: "#F0F9F4", marginBottom: 16 }}
                >
                  <Icon size={24} strokeWidth={2.25} color="#2D6A4F" aria-hidden />
                </div>
                <h3 className="mgk-h3">{title}</h3>
                <p className="mgk-body" style={{ marginTop: 8 }}>
                  {body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* School partner */}
      <Section>
        <Container>
          <div
            className="mgk-on-dark"
            style={{
              borderRadius: "var(--mgk-radius-card)",
              padding: "clamp(32px, 6vw, 48px)",
              background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)",
              boxShadow: "var(--mgk-shadow-card)",
              color: "#FFFFFF",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--mgk-space-4)",
              alignItems: "center",
            }}
          >
            <div>
              <p
                className="mgk-label"
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#F2B705",
                  margin: "0 0 16px",
                }}
              >
                For schools
              </p>
              <h2 className="mgk-h2">Become a school partner</h2>
              <p className="mgk-lead" style={{ marginTop: 16 }}>
                Schools join as sustainability partners, free. We onboard your teachers, your
                students build typing skills and eco habits every day, and together we grow
                awareness about caring for the planet.
              </p>
            </div>
            <div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "grid", gap: 16 }}>
                {[
                  "Free for every teacher and student",
                  "Teacher onboarding and class setup",
                  "Daily typing and eco habit practice",
                  "Progress reports for teachers and parents",
                ].map((t) => (
                  <li key={t} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: "1rem" }}>
                    <CheckCircle size={20} color="#74C69D" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <SecondaryButton href="/schools" onDark>
                Become a school partner
              </SecondaryButton>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section tone="pale">
        <Container narrow>
          <div className="mgk-sec-head">
            <h2 className="mgk-h2">Frequently asked questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FAQ_ITEMS.map(({ q, a }) => (
              <details key={q} className="group mgk-panel" style={{ display: "block", padding: "16px 24px" }}>
                <summary
                  className="[&::-webkit-details-marker]:hidden"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    minHeight: 32,
                    cursor: "pointer",
                    listStyle: "none",
                    fontSize: "1.0625rem",
                    fontWeight: 600,
                    color: "#1B4332",
                  }}
                >
                  {q}
                  <ChevronDown
                    size={22}
                    strokeWidth={2.25}
                    color="#2D6A4F"
                    className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p
                  className="mgk-body"
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1px solid var(--mgk-border-card)",
                  }}
                >
                  {a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      {/* Final CTA */}
      <Section>
        <Container style={{ textAlign: "center" }}>
          <div className="mgk-sec-head" style={{ marginBottom: 32 }}>
            <h2 className="mgk-h2">Ready to start?</h2>
            <p className="mgk-lead">Learn to type. Help the planet. Free for every child.</p>
          </div>
          <div className="mgk-btn-row">
            <PrimaryButton href="/signup">Create a free account</PrimaryButton>
          </div>
        </Container>
      </Section>
    </div>
  );
}
