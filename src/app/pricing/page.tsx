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
import Link from "next/link";
import { FinalCtaOutlineLink } from "@/components/pricing/HoverLinks";

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

const container: CSSProperties = {
  maxWidth: "1120px",
  margin: "0 auto",
  padding: "60px 16px",
};

const primaryCta: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "180px",
  padding: "18px 40px",
  borderRadius: "9999px",
  background: "#52B788",
  color: "#FFFFFF",
  fontSize: "18px",
  fontWeight: 700,
  textDecoration: "none",
  boxShadow: "0 8px 24px rgba(27,67,50,0.18)",
};

const sectionGap: CSSProperties = { marginBottom: "88px" };

const h2: CSSProperties = {
  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
  fontWeight: 800,
  color: "#1B4332",
  textAlign: "center",
  margin: "0 0 12px",
};

const lead: CSSProperties = {
  fontSize: "1.05rem",
  color: "#2D6A4F",
  textAlign: "center",
  maxWidth: "640px",
  margin: "0 auto",
  lineHeight: 1.6,
};

const card: CSSProperties = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(8px)",
  border: "1px solid #D8EDE2",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 8px 24px rgba(27,67,50,0.06)",
};

export default function PricingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FAFAF5",
        backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div style={container}>
        {/* Hero */}
        <section style={{ ...sectionGap, textAlign: "center", paddingTop: "40px" }}>
          <span
            style={{
              display: "inline-block",
              background: "#F2B705",
              color: "#1B4332",
              fontWeight: 800,
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              borderRadius: "9999px",
              padding: "6px 16px",
              marginBottom: "20px",
            }}
          >
            $0 for everyone
          </span>
          <h1
            style={{
              fontSize: "clamp(2.25rem, 6vw, 3.5rem)",
              fontWeight: 800,
              color: "#1B4332",
              lineHeight: 1.15,
              margin: "0 0 20px",
            }}
          >
            Free for every child
          </h1>
          <p style={{ ...lead, fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)" }}>
            Kids, parents and schools get full access to everything My Green Keys offers.
            No plans, no trials, no credit card.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              justifyContent: "center",
              marginTop: "32px",
            }}
          >
            <Link href="/signup" style={primaryCta}>Start free</Link>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
              marginTop: "32px",
            }}
          >
            {TRUST_SIGNALS.map(({ Icon, label }) => (
              <span
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(255,255,255,0.75)",
                  border: "1px solid #D8EDE2",
                  borderRadius: "9999px",
                  padding: "6px 14px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#2D6A4F",
                }}
              >
                <Icon size={16} strokeWidth={2.25} color="#52B788" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* What's included */}
        <section style={sectionGap}>
          <h2 style={h2}>What&apos;s included</h2>
          <p style={{ ...lead, marginBottom: "40px" }}>
            Every feature, for every account. Nothing is locked behind a paywall.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            {INCLUDED.map(({ Icon, title, body }) => (
              <div key={title} style={card}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "#F0F9F4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "14px",
                  }}
                >
                  <Icon size={22} strokeWidth={2.25} color="#2D6A4F" aria-hidden />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1B4332", margin: "0 0 6px" }}>
                  {title}
                </h3>
                <p style={{ fontSize: "0.95rem", color: "#2D6A4F", lineHeight: 1.55, margin: 0 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* School partner */}
        <section style={sectionGap}>
          <div
            style={{
              borderRadius: "28px",
              padding: "clamp(32px, 6vw, 56px)",
              background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)",
              color: "#FFFFFF",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "32px",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#F2B705",
                  margin: "0 0 12px",
                }}
              >
                For schools
              </p>
              <h2 style={{ ...h2, color: "#FFFFFF", textAlign: "left" }}>Become a school partner</h2>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.6, color: "rgba(255,255,255,0.9)", margin: 0 }}>
                Schools join as sustainability partners, free. We onboard your teachers, your
                students build typing skills and eco habits every day, and together we grow
                awareness about caring for the planet.
              </p>
            </div>
            <div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "grid", gap: "12px" }}>
                {[
                  "Free for every teacher and student",
                  "Teacher onboarding and class setup",
                  "Daily typing and eco habit practice",
                  "Progress reports for teachers and parents",
                ].map((t) => (
                  <li key={t} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "1rem" }}>
                    <CheckCircle size={20} color="#74C69D" style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <FinalCtaOutlineLink href="/schools">Become a school partner</FinalCtaOutlineLink>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={sectionGap}>
          <h2 style={h2}>Frequently asked questions</h2>
          <div style={{ maxWidth: "760px", margin: "32px auto 0" }}>
            {FAQ_ITEMS.map(({ q, a }) => (
              <details
                key={q}
                className="group"
                style={{ ...card, padding: "20px 24px", marginBottom: "12px" }}
              >
                <summary
                  className="[&::-webkit-details-marker]:hidden"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    cursor: "pointer",
                    listStyle: "none",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "#1B4332",
                  }}
                >
                  {q}
                  <ChevronDown
                    size={22}
                    strokeWidth={2.25}
                    color="#52B788"
                    className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p
                  style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid #E5F2EA",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                    color: "#2D6A4F",
                  }}
                >
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ textAlign: "center", paddingBottom: "40px" }}>
          <h2 style={h2}>Ready to start?</h2>
          <p style={{ ...lead, marginBottom: "28px" }}>
            Learn to type. Help the planet. Free for every child.
          </p>
          <Link href="/signup" style={primaryCta}>Create a free account</Link>
        </section>
      </div>
    </div>
  );
}
