"use client";
import React from "react";

/* ── SVG icon primitives ─────────────────────────────────────────────────── */

type IconProps = { size?: number; color?: string; strokeWidth?: number };

const ic = (paths: string, vb = "0 0 24 24") =>
  function Icon({ size = 24, color = "currentColor", strokeWidth = 2 }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={vb}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: paths }}
      />
    );
  };

const KeyboardIcon = ic(
  '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>'
);
const GlobeIcon = ic(
  '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'
);
const HeartIcon = ic(
  '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'
);
const SparkleIcon = ic(
  '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
);
const TrophyIcon = ic(
  '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>'
);
const BarChartIcon = ic(
  '<rect x="3" y="12" width="4" height="8"/><rect x="10" y="6" width="4" height="14"/><rect x="17" y="2" width="4" height="18"/>'
);
const UsersIcon = ic(
  '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
);
const BuildingIcon = ic(
  '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6M3 15h6M15 6h2M15 12h2M15 18h2"/>'
);
const BookIcon = ic(
  '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'
);
const CheckIcon = ic('<polyline points="20 6 9 17 4 12"/>');
const ArrowRightIcon = ic(
  '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'
);
const ZapIcon = ic(
  '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'
);
const LeafIcon = ic(
  '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>'
);

/* ── Layout helpers ─────────────────────────────────────────────────────── */

function Inner({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
      {children}
    </div>
  );
}

function SectionLabel({ children, color = "#4CAF50" }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="label-tag" style={{ color }}>
      {children}
    </p>
  );
}

function SectionHead({
  label,
  labelColor,
  title,
  sub,
}: {
  label: string;
  labelColor?: string;
  title: React.ReactNode;
  sub: string;
}) {
  return (
    <div style={{ textAlign: "center", marginBottom: 56 }}>
      <SectionLabel color={labelColor}>{label}</SectionLabel>
      <h2
        style={{
          fontSize: "clamp(1.65rem, 3vw, 2.25rem)",
          fontWeight: 800,
          color: "#2c3e50",
          lineHeight: 1.2,
          marginBottom: 12,
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: "1.05rem", color: "#6b7280", fontWeight: 400, maxWidth: 520, margin: "0 auto" }}>
        {sub}
      </p>
    </div>
  );
}

/* ── Hero sub-components ─────────────────────────────────────────────────── */

function CloudShape({ style }: { style: React.CSSProperties }) {
  return (
    <div className="cloud" style={{ ...style, position: "absolute" }}>
      <svg
        viewBox="0 0 200 80"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <ellipse cx="100" cy="50" rx="90" ry="30" fill="rgba(255,255,255,0.88)" />
        <ellipse cx="70"  cy="38" rx="45" ry="32" fill="rgba(255,255,255,0.88)" />
        <ellipse cx="115" cy="32" rx="38" ry="28" fill="rgba(255,255,255,0.88)" />
      </svg>
    </div>
  );
}

function Tree({ style, scale = 1, delay = "0s" }: { style: React.CSSProperties; scale?: number; delay?: string }) {
  const W = Math.round(68 * scale);
  const H = Math.round(160 * scale);
  return (
    <div
      style={{
        position: "absolute",
        ...style,
        width: W,
        height: H,
        transformOrigin: "bottom center",
        animation: `sway ${2.8 + scale * 0.4}s ease-in-out ${delay} infinite`,
      }}
    >
      <svg width={W} height={H} viewBox="0 0 68 160" fill="none">
        {/* Trunk — tall brown rectangle */}
        <rect x="28" y="112" width="12" height="48" rx="3" fill="#6b3f1e" />
        {/* Bottom tier — widest, lightest */}
        <polygon points="34,54 66,114 2,114" fill="#40916c" />
        {/* Middle tier */}
        <polygon points="34,30 60,82 8,82"  fill="#2d6a4f" />
        {/* Top tier — narrowest, darkest */}
        <polygon points="34,5  52,48 16,48" fill="#1b4d30" />
      </svg>
    </div>
  );
}

function Flower({ style, color = "#FF6B6B", delay = "0s" }: { style: React.CSSProperties; color?: string; delay?: string }) {
  return (
    <div style={{ position: "absolute", ...style, display: "flex", flexDirection: "column", alignItems: "center", animation: `flower-bob 2.5s ease-in-out ${delay} infinite` }}>
      <div style={{ position: "relative", width: 22, height: 22 }}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <div key={deg} style={{ position: "absolute", top: "50%", left: "50%", width: 8, height: 12, background: color, borderRadius: "50%", transform: `translate(-50%,-50%) rotate(${deg}deg) translateY(-9px)`, opacity: 0.9 }} />
        ))}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 9, height: 9, background: "#FFEB3B", borderRadius: "50%", zIndex: 2 }} />
      </div>
      <div style={{ width: 2, height: 16, background: "#52b788", marginTop: 2 }} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav style={{ background: "#2c3e50", position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, boxShadow: "0 1px 0 rgba(255,255,255,0.06)" }}>
        <Inner>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#4CAF50", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LeafIcon size={20} color="#fff" strokeWidth={2.5} />
              </div>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>My Green Keys</span>
            </div>

            {/* Links */}
            <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
              {["Features", "Modules", "Schools"].map((l) => (
                <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
              ))}
              <a href="/pricing" className="nav-link">Pricing</a>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <a href="/login" className="nav-link hidden md:block">Log In</a>
              <a href="/signup" className="btn-primary" style={{ fontSize: "0.85rem", padding: "0.6rem 1.4rem" }}>Start Free Trial</a>
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-lg px-3 py-2 text-white/90 hover:text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                ☰
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
                <div className="flex flex-col gap-3">
                  {["Features", "Modules", "Schools"].map((l) => (
                    <a
                      key={l}
                      href={`#${l.toLowerCase()}`}
                      className="nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {l}
                    </a>
                  ))}
                  <a href="/pricing" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Pricing
                  </a>
                  <a href="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Log In
                  </a>
                </div>
              </div>
            </div>
          )}
        </Inner>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          background: "linear-gradient(180deg,#162d1e 0%,#1f4d35 25%,#2d6a4f 55%,#52b788 80%,#81c99e 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 80,
          overflow: "hidden",
        }}
      >
        {/* Sun */}
        <div className="animate-sun-pulse" style={{ position: "absolute", top: 72, right: "9%", width: 96, height: 96, background: "radial-gradient(circle,#FFEB3B 38%,#FDD835 65%,transparent 100%)", borderRadius: "50%" }} />

        {/* Clouds (hidden on very small screens) */}
        <div className="hidden sm:block">
          <CloudShape style={{ top: 88,  left: 0,    width: 200, height: 70,  animationDuration: "30s", animationDelay: "0s"  }} />
          <CloudShape style={{ top: 128, left: 0,    width: 145, height: 50,  animationDuration: "38s", animationDelay: "11s" }} />
          <CloudShape style={{ top: 70,  left: 0,    width: 240, height: 80,  animationDuration: "46s", animationDelay: "20s" }} />
        </div>

        {/* Fireflies */}
        {([
          ["28%","7%","3.2s","0s"],["44%","14%","4.1s","1s"],["24%","79%","3.7s","0.5s"],
          ["54%","87%","4.8s","2s"],["37%","69%","3.0s","1.5s"],["61%","4%","5.2s","3s"],
          ["19%","59%","2.9s","0.8s"],["68%","74%","4.4s","2.2s"],
        ] as [string,string,string,string][]).map(([top,left,dur,delay],i) => (
          <div key={i} className="firefly" style={{ top, left, animationDuration: dur, animationDelay: delay }} />
        ))}

        {/* Falling leaves */}
        {([
          ["5%","#1b4d30","7s","0s"],["14%","#40916c","9s","2s"],["27%","#52b788","6s","4s"],
          ["41%","#4CAF50","11s","1s"],["57%","#2d6a4f","8s","3s"],["71%","#52b788","10s","5s"],
          ["84%","#1b4d30","7.5s","1.5s"],["92%","#74c69d","9.5s","6s"],
        ] as [string,string,string,string][]).map(([left,bg,dur,delay],i) => (
          <div key={i} className="leaf" style={{ left, top: "-20px", background: bg, animationDuration: dur, animationDelay: delay }} />
        ))}

        {/* Bird */}
        <div style={{ position: "absolute", top: "17%", left: 0, animation: "bird-fly 18s linear 4s infinite", pointerEvents: "none" }}>
          <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
            <path d="M2 10 Q8 2 16 10 Q24 2 30 10" stroke="rgba(255,255,255,0.8)" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Butterfly */}
        <div style={{ position: "absolute", top: "43%", left: "5%", animation: "butterfly 14s ease-in-out 2s infinite", pointerEvents: "none" }}>
          <svg width="30" height="24" viewBox="0 0 30 24" fill="none">
            <ellipse cx="7"  cy="10" rx="7"  ry="9"  fill="rgba(255,235,59,0.75)" />
            <ellipse cx="23" cy="10" rx="7"  ry="9"  fill="rgba(255,152,0,0.75)"  />
            <ellipse cx="7"  cy="18" rx="5"  ry="6"  fill="rgba(255,235,59,0.55)" />
            <ellipse cx="23" cy="18" rx="5"  ry="6"  fill="rgba(255,152,0,0.55)"  />
            <line x1="15" y1="2" x2="15" y2="22" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Hero copy */}
        <div
          className="pb-28 sm:pb-56"
          style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 24px", maxWidth: 820, margin: "0 auto" }}
        >
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 50, padding: "6px 18px", marginBottom: 24,
              animation: "fade-in 0.8s ease 0.2s both",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFEB3B", display: "block" }} />
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.8rem", fontWeight: 600 }}>
              Trusted by 10,000+ young learners worldwide
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem,6.5vw,4.75rem)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              marginBottom: 24,
              textShadow: "0 4px 24px rgba(0,0,0,0.25)",
              animation: "float-up 0.9s ease 0.35s both",
            }}
          >
            Learn to Type.
            <br />
            <span style={{ color: "#FFEB3B" }}>Help the Planet.</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem,2vw,1.2rem)",
              color: "rgba(255,255,255,0.85)",
              fontWeight: 400,
              lineHeight: 1.72,
              maxWidth: 520,
              margin: "0 auto 40px",
              animation: "float-up 0.9s ease 0.5s both",
            }}
          >
            A joyful typing adventure for kids aged 6–14. Build real keyboard skills
            while learning about sustainability, health, and good manners.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", animation: "float-up 0.9s ease 0.65s both" }}>
            <a href="#" className="btn-primary" style={{ fontSize: "1rem", padding: "0.9rem 2.2rem", boxShadow: "0 8px 32px rgba(76,175,80,0.4)" }}>
              Start for Free
            </a>
            <a href="#" className="btn-ghost" style={{ fontSize: "1rem", padding: "0.9rem 2.2rem" }}>
              Watch a Demo
            </a>
          </div>
        </div>

        {/* Ground scene */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 210, pointerEvents: "none" }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 130, background: "linear-gradient(180deg,transparent 0%,#235c2a 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 62, background: "#2d6e1e", borderTopLeftRadius: "50% 18px", borderTopRightRadius: "50% 18px" }} />

          <Tree style={{ left: "2%",  bottom: 42 }} scale={1.2} />
          <Tree style={{ left: "9%",  bottom: 32 }} scale={0.9}  delay="0.5s" />
          <Tree style={{ left: "17%", bottom: 50 }} scale={1.5}  delay="1s" />
          <Tree style={{ left: "26%", bottom: 36 }} scale={1.0}  delay="0.3s" />
          <Tree style={{ left: "37%", bottom: 46 }} scale={1.3}  delay="0.8s" />
          <Tree style={{ left: "49%", bottom: 32 }} scale={0.85} delay="0.2s" />
          <Tree style={{ left: "59%", bottom: 50 }} scale={1.4}  delay="1.2s" />
          <Tree style={{ left: "69%", bottom: 36 }} scale={1.0}  delay="0.6s" />
          <Tree style={{ left: "78%", bottom: 46 }} scale={1.2}  delay="0.9s" />
          <Tree style={{ left: "87%", bottom: 32 }} scale={0.9}  delay="0.4s" />
          <Tree style={{ left: "93%", bottom: 42 }} scale={1.1}  delay="1.1s" />

          <Flower style={{ left: "6%",  bottom: 58 }} color="#FF6B6B" />
          <Flower style={{ left: "22%", bottom: 60 }} color="#FFEB3B" delay="0.7s" />
          <Flower style={{ left: "44%", bottom: 58 }} color="#FF8E53" delay="1.3s" />
          <Flower style={{ left: "65%", bottom: 62 }} color="#e91e63" delay="0.4s" />
          <Flower style={{ left: "83%", bottom: 58 }} color="#FFEB3B" delay="1s" />
        </div>
      </section>

      {/* ── STATS BAND ──────────────────────────────────────────────── */}
      <section style={{ background: "#1565C0" }}>
        <Inner>
          <div style={{ display: "flex", alignItems: "stretch" }}>
            {([
              { Icon: UsersIcon,    num: "10,000+", label: "Active Learners"     },
              { Icon: BuildingIcon, num: "500+",    label: "Schools Enrolled"    },
              { Icon: BookIcon,     num: "4",       label: "Learning Modules"    },
              { Icon: SparkleIcon,  num: "98%",     label: "Parent Satisfaction" },
            ] as { Icon: typeof UsersIcon; num: string; label: string }[]).map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && (
                  <div style={{ width: 1, background: "rgba(255,255,255,0.2)", flexShrink: 0, margin: "32px 0" }} />
                )}
                <div
                  style={{
                    flex: 1,
                    padding: "52px 24px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <s.Icon size={22} color="rgba(255,255,255,0.65)" strokeWidth={1.75} />
                  <div style={{ color: "#fff", fontWeight: 900, fontSize: "48px", lineHeight: 1 }}>{s.num}</div>
                  <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem", fontWeight: 500, letterSpacing: "0.01em" }}>{s.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </Inner>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────── */}
      <section id="features" style={{ background: "#ffffff", padding: "96px 0" }}>
        <Inner>
          <SectionHead
            label="Why My Green Keys"
            title="Everything a Young Typist Needs"
            sub="Designed by educators. Loved by kids. Trusted by parents and schools."
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
            {([
              { Icon: ZapIcon,      color: "#4CAF50", bg: "#e8f5e9", title: "Adaptive Typing Lessons",  desc: "Lessons that match each child's pace — from home row basics to full sentences, building confidence every step." },
              { Icon: GlobeIcon,    color: "#2196F3", bg: "#e3f2fd", title: "Planet Sustainability",     desc: "Typed passages teach kids about climate, recycling, and how small actions can help protect our planet." },
              { Icon: HeartIcon,    color: "#FF9800", bg: "#fff3e0", title: "Kids Health Tips",          desc: "Fun facts on nutrition, sleep, exercise, and screen balance woven naturally into every lesson." },
              { Icon: SparkleIcon,  color: "#9C27B0", bg: "#f3e5f5", title: "Manners & Kindness",       desc: "Lessons on digital etiquette, empathy, and real-world manners that go far beyond the keyboard." },
              { Icon: TrophyIcon,   color: "#F59E0B", bg: "#fffbeb", title: "Badges & Rewards",         desc: "Kids earn planet-themed badges and printable certificates that keep motivation high week after week." },
              { Icon: BarChartIcon, color: "#009688", bg: "#e0f2f1", title: "Progress Dashboard",       desc: "Parents and teachers get a real-time view of speed, accuracy, and lesson streaks — all in one place." },
            ] as { Icon: typeof ZapIcon; color: string; bg: string; title: string; desc: string }[]).map((f) => (
              <div key={f.title} className="feature-card">
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: f.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 22,
                  }}
                >
                  <f.Icon size={24} color={f.color} strokeWidth={2} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#2c3e50", marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.65, fontWeight: 400 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </Inner>
      </section>

      {/* ── MODULES ─────────────────────────────────────────────────── */}
      <section id="modules" style={{ background: "#fff", padding: "96px 0" }}>
        <Inner>
          <SectionHead
            label="4 Core Modules"
            title="One Platform. Four Superpowers."
            sub="Each module is a complete learning journey on its own."
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(500px,1fr))", gap: 24 }}>
            {([
              {
                Icon: KeyboardIcon, borderColor: "#4CAF50", iconBg: "#e8f5e9", iconColor: "#4CAF50",
                num: "01", title: "Keyboard Typing",
                desc: "From proper posture to blazing speed — a full typing curriculum built for young hands.",
                items: ["Finger placement & posture", "Speed & accuracy drills", "Timed typing tests", "Printable certificate"],
              },
              {
                Icon: GlobeIcon, borderColor: "#2196F3", iconBg: "#e3f2fd", iconColor: "#2196F3",
                num: "02", title: "Planet Sustainability",
                desc: "Every passage is a lesson on protecting the planet — recycling, energy, and nature.",
                items: ["Climate change basics", "Recycling & composting", "Renewable energy", "Eco-friendly daily habits"],
              },
              {
                Icon: HeartIcon, borderColor: "#FF9800", iconBg: "#fff3e0", iconColor: "#FF9800",
                num: "03", title: "Kids Health Tips",
                desc: "Kids type their way to healthier habits with facts about food, rest, and movement.",
                items: ["Nutrition & hydration", "Sleep & rest habits", "Exercise & movement", "Screen-time balance"],
              },
              {
                Icon: SparkleIcon, borderColor: "#E91E63", iconBg: "#fce4ec", iconColor: "#E91E63",
                num: "04", title: "Manners & Kindness",
                desc: "Build character alongside keyboarding with lessons on empathy, etiquette, and respect.",
                items: ["Online & offline etiquette", "Real-world manners", "Empathy & kindness", "Resolving conflict calmly"],
              },
            ] as {
              Icon: typeof KeyboardIcon; borderColor: string; iconBg: string; iconColor: string;
              num: string; title: string; desc: string; items: string[];
            }[]).map((m) => (
              <div key={m.num} className="module-card" style={{ borderLeft: `4px solid ${m.borderColor}` }}>
                <div style={{ padding: "32px 32px 28px 28px" }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: m.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <m.Icon size={20} color={m.iconColor} strokeWidth={2} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: m.borderColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>Module {m.num}</div>
                      <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "#2c3e50" }}>{m.title}</div>
                    </div>
                  </div>

                  <p style={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.65, marginBottom: 20 }}>{m.desc}</p>

                  {/* Items */}
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                    {m.items.map((item) => (
                      <li key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: m.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <CheckIcon size={11} color={m.borderColor} strokeWidth={3} />
                        </span>
                        <span style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Link */}
                  <a
                    href="#"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      color: m.borderColor, fontWeight: 700, fontSize: "0.875rem",
                      textDecoration: "none",
                    }}
                  >
                    Explore Module <ArrowRightIcon size={14} color={m.borderColor} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Inner>
      </section>

      {/* ── SCHOOLS ─────────────────────────────────────────────────── */}
      <section id="schools" style={{ background: "#f5f7fa", padding: "96px 0" }}>
        <Inner>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="lg:grid-cols-2 grid-cols-1">
            {/* Left */}
            <div>
              <SectionLabel color="#2196F3">For Schools &amp; Districts</SectionLabel>
              <h2 style={{ fontSize: "clamp(1.7rem,3.5vw,2.6rem)", fontWeight: 800, color: "#2c3e50", lineHeight: 1.18, marginBottom: 16 }}>
                Give Every Student a{" "}
                <span style={{ color: "#4CAF50" }}>Green Advantage</span>
              </h2>
              <p style={{ fontSize: "0.97rem", color: "#6b7280", lineHeight: 1.75, marginBottom: 36 }}>
                My Green Keys integrates seamlessly into your school's digital curriculum.
                Bulk licences, teacher dashboards, and progress reports make it effortless
                to track every student's journey.
              </p>

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
                {([
                  { Icon: BuildingIcon, text: "Bulk classroom & district licencing" },
                  { Icon: BarChartIcon, text: "Teacher admin dashboard & reports" },
                  { Icon: KeyboardIcon, text: "LMS integration (Google Classroom, Canvas)" },
                  { Icon: BookIcon,     text: "Curriculum-aligned lesson packs" },
                  { Icon: UsersIcon,    text: "Dedicated school success manager" },
                ] as { Icon: typeof UsersIcon; text: string }[]).map((row) => (
                  <li key={row.text} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 10, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <row.Icon size={18} color="#4CAF50" strokeWidth={2} />
                    </span>
                    <span style={{ fontSize: "0.93rem", color: "#374151", fontWeight: 500 }}>{row.text}</span>
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
                <a href="#" className="btn-primary" style={{ fontSize: "0.95rem", padding: "0.85rem 2rem" }}>Request a Demo</a>
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#2196F3", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
                  View Pricing <ArrowRightIcon size={14} color="#2196F3" />
                </a>
              </div>
            </div>

            {/* Right card */}
            <div style={{ background: "linear-gradient(145deg,#1565C0,#2196F3)", borderRadius: 24, padding: 48, color: "#fff", textAlign: "center" }}>
              <div style={{ width: 68, height: 68, borderRadius: 18, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <BuildingIcon size={34} color="#fff" strokeWidth={1.5} />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.5rem", marginBottom: 8 }}>School Plan</h3>
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.9rem", marginBottom: 32, lineHeight: 1.6 }}>
                Everything your school needs for a world-class typing programme
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
                {([
                  { Icon: UsersIcon,    label: "Unlimited Students" },
                  { Icon: BookIcon,     label: "All 4 Modules" },
                  { Icon: BarChartIcon, label: "Admin Dashboard" },
                  { Icon: ZapIcon,      label: "Priority Support" },
                ] as { Icon: typeof UsersIcon; label: string }[]).map((item) => (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <item.Icon size={22} color="rgba(255,255,255,0.85)" strokeWidth={1.75} />
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff" }}>{item.label}</span>
                  </div>
                ))}
              </div>
              <a href="#" className="btn-ghost" style={{ width: "100%", textAlign: "center", display: "block", padding: "0.85rem" }}>Get School Pricing</a>
            </div>
          </div>
        </Inner>
      </section>

      {/* ── CTA / SUBSCRIBE ─────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg,#2d6a4f 0%,#4CAF50 100%)", padding: "96px 0", textAlign: "center" }}>
        <Inner>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <LeafIcon size={30} color="#fff" strokeWidth={2} />
            </div>
            <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.75rem)", fontWeight: 900, color: "#fff", lineHeight: 1.18, marginBottom: 14 }}>
              Ready to Start Your Child's Typing Journey?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1rem", lineHeight: 1.72, marginBottom: 40 }}>
              Join 10,000+ kids already learning to type and love the planet.
              7-day free trial. No credit card required.
            </p>

            <form
              style={{ display: "flex", gap: 12, maxWidth: 460, margin: "0 auto 16px" }}
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email address"
                style={{
                  flex: 1,
                  padding: "14px 20px",
                  borderRadius: 50,
                  border: "2px solid transparent",
                  background: "rgba(255,255,255,0.95)",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  fontWeight: 500,
                  color: "#2c3e50",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#FFEB3B",
                  color: "#2c3e50",
                  fontFamily: "inherit",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  padding: "14px 28px",
                  borderRadius: 50,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "transform 0.15s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                Start Free
              </button>
            </form>

            <p style={{ color: "rgba(255,255,255,0.52)", fontSize: "0.8rem" }}>No spam. Unsubscribe anytime.</p>
          </div>
        </Inner>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer style={{ background: "#1a252f", padding: "96px 0 40px" }}>
        <Inner>
          {/* Top grid */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#4CAF50", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LeafIcon size={20} color="#fff" strokeWidth={2.5} />
                </div>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: "1rem" }}>My Green Keys</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: 24 }}>
                A premium typing platform for kids that blends keyboard skills with planet-friendly values.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {(["𝕏", "f", "in", "▶"] as string[]).map((s, i) => (
                  <a
                    key={i}
                    href="#"
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: "rgba(255,255,255,0.07)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 700,
                      textDecoration: "none", transition: "background 0.2s, color 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Columns */}
            {([
              { heading: "Product",  links: ["Features", "Modules", "Pricing", "Free Trial", "For Schools"] },
              { heading: "Company",  links: ["About Us", "Blog", "Careers", "Press Kit", "Contact"] },
              { heading: "Support",  links: ["Help Centre", "Parent Guide", "Teacher Resources", "Privacy Policy", "Terms of Use"] },
            ] as { heading: string; links: string[] }[]).map((col) => (
              <div key={col.heading}>
                <h4 style={{ color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: "0.9rem", marginBottom: 20 }}>{col.heading}</h4>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.82rem" }}>© 2026 My Green Keys. All rights reserved.</p>
            <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 6 }}>
              Made with
              <span style={{ display: "inline-flex" }}><LeafIcon size={13} color="#4CAF50" strokeWidth={2.5} /></span>
              for the planet's future
            </p>
          </div>
        </Inner>
      </footer>
    </>
  );
}
