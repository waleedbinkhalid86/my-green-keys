"use client";
import Image from "next/image";
import Link from "next/link";
import { Check, Leaf, Menu, MessageSquare, School, Users } from "lucide-react";
import React from "react";

const DARK = "#1A2F23";
const PRIMARY = "#2ECC71";
const BG = "#FAFAFA";

function Inner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
  );
}

function CloudShape({ style }: { style: React.CSSProperties }) {
  return (
    <div className="cloud" style={{ ...style, position: "absolute" }}>
      <svg
        viewBox="0 0 200 80"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <ellipse cx="100" cy="50" rx="90" ry="30" fill="rgba(255,255,255,0.88)" />
        <ellipse cx="70" cy="38" rx="45" ry="32" fill="rgba(255,255,255,0.88)" />
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
        <rect x="28" y="112" width="12" height="48" rx="3" fill="#6b3f1e" />
        <polygon points="34,54 66,114 2,114" fill="#40916c" />
        <polygon points="34,30 60,82 8,82" fill="#2d6a4f" />
        <polygon points="34,5  52,48 16,48" fill="#1b4d30" />
      </svg>
    </div>
  );
}

function Flower({ style, color = "#FF6B6B", delay = "0s" }: { style: React.CSSProperties; color?: string; delay?: string }) {
  return (
    <div
      style={{
        position: "absolute",
        ...style,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        animation: `flower-bob 2.5s ease-in-out ${delay} infinite`,
      }}
    >
      <div style={{ position: "relative", width: 22, height: 22 }}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <div
            key={deg}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 8,
              height: 12,
              background: color,
              borderRadius: "50%",
              transform: `translate(-50%,-50%) rotate(${deg}deg) translateY(-9px)`,
              opacity: 0.9,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 9,
            height: 9,
            background: "#FFEB3B",
            borderRadius: "50%",
            zIndex: 2,
          }}
        />
      </div>
      <div style={{ width: 2, height: 16, background: "#52b788", marginTop: 2 }} />
    </div>
  );
}

const PREVIEW_GAMES = [
  { name: "Falling Leaves", desc: "Catch leaves by typing words", img: "/images/games/game-falling-leaves.jpg", href: "/games/falling-leaves" },
  { name: "Sort Recycling", desc: "Sort waste into the right bins", img: "/images/games/game-sort-recycling.jpg", href: "/games/sort-recycling" },
  { name: "Save the Ocean", desc: "Free the turtle with fast typing", img: "/images/games/game-save-ocean.jpg", href: "/games/save-the-ocean" },
  { name: "Eco Garden", desc: "Grow a garden with every key", img: "/images/games/game-eco-garden.jpg", href: "/games/eco-garden" },
  { name: "Kind World Academy", desc: "Spread kindness around the world", img: "/images/games/game-kind-world.jpg", href: "/games/kind-world" },
] as const;

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      <nav
        style={{
          background: DARK,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          boxShadow: "0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <Inner>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: PRIMARY,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Leaf className="h-5 w-5 text-white" strokeWidth={2.5} aria-hidden />
              </div>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>My Green Keys</span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
              <a href="#how-it-works" className="nav-link">
                How it works
              </a>
              <a href="#features" className="nav-link">
                Features
              </a>
              <a href="#games-preview" className="nav-link">
                Games
              </a>
              <Link href="/pricing" className="nav-link">
                Pricing
              </Link>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link href="/login" className="nav-link hidden md:block">
                Log In
              </Link>
              <Link
                href="/signup"
                className="btn-primary"
                style={{ fontSize: "0.85rem", padding: "0.6rem 1.4rem", height: 44, display: "inline-flex", alignItems: "center" }}
              >
                Start Free Today
              </Link>
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-lg px-3 py-2 text-white/90 hover:text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="h-6 w-6" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
                <div className="flex flex-col gap-3">
                  <a href="#how-it-works" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    How it works
                  </a>
                  <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Features
                  </a>
                  <a href="#games-preview" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Games
                  </a>
                  <Link href="/pricing" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Pricing
                  </Link>
                  <Link href="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Log In
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Inner>
      </nav>

      {/* HERO */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          background: "linear-gradient(180deg, #0A1F0F 0%, #1A3D1F 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 80,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image
            src="/images/homepage/homepage-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", opacity: 0.15 }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(10,31,15,0.85) 0%, rgba(26,61,31,0.75) 100%)",
            }}
          />
        </div>

        <div
          className="animate-sun-pulse"
          style={{
            position: "absolute",
            top: 72,
            right: "9%",
            width: 96,
            height: 96,
            background: "radial-gradient(circle,#FFEB3B 38%,#FDD835 65%,transparent 100%)",
            borderRadius: "50%",
            zIndex: 2,
            opacity: 0.28,
          }}
        />

        <div className="hidden sm:block">
          <CloudShape style={{ top: 88, left: 0, width: 200, height: 70, animationDuration: "30s", animationDelay: "0s" }} />
          <CloudShape style={{ top: 128, left: 0, width: 145, height: 50, animationDuration: "38s", animationDelay: "11s" }} />
          <CloudShape style={{ top: 70, left: 0, width: 240, height: 80, animationDuration: "46s", animationDelay: "20s" }} />
        </div>

        {(
          [
            ["28%", "7%", "3.2s", "0s"],
            ["44%", "14%", "4.1s", "1s"],
            ["24%", "79%", "3.7s", "0.5s"],
            ["54%", "87%", "4.8s", "2s"],
            ["37%", "69%", "3.0s", "1.5s"],
            ["61%", "4%", "5.2s", "3s"],
            ["19%", "59%", "2.9s", "0.8s"],
            ["68%", "74%", "4.4s", "2.2s"],
          ] as [string, string, string, string][]
        ).map(([top, left, dur, delay], i) => (
          <div key={i} className="firefly" style={{ top, left, animationDuration: dur, animationDelay: delay }} />
        ))}

        {(
          [
            ["5%", "#1b4d30", "7s", "0s"],
            ["14%", "#40916c", "9s", "2s"],
            ["27%", "#52b788", "6s", "4s"],
            ["41%", "#4CAF50", "11s", "1s"],
            ["57%", "#2d6a4f", "8s", "3s"],
            ["71%", "#52b788", "10s", "5s"],
            ["84%", "#1b4d30", "7.5s", "1.5s"],
            ["92%", "#74c69d", "9.5s", "6s"],
          ] as [string, string, string, string][]
        ).map(([left, bg, dur, delay], i) => (
          <div key={i} className="leaf" style={{ left, top: "-20px", background: bg, animationDuration: dur, animationDelay: delay }} />
        ))}

        <div style={{ position: "absolute", top: "17%", left: 0, animation: "bird-fly 18s linear 4s infinite", pointerEvents: "none" }}>
          <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
            <path d="M2 10 Q8 2 16 10 Q24 2 30 10" stroke="rgba(255,255,255,0.8)" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        <div style={{ position: "absolute", top: "43%", left: "5%", animation: "butterfly 14s ease-in-out 2s infinite", pointerEvents: "none" }}>
          <svg width="30" height="24" viewBox="0 0 30 24" fill="none">
            <ellipse cx="7" cy="10" rx="7" ry="9" fill="rgba(255,235,59,0.75)" />
            <ellipse cx="23" cy="10" rx="7" ry="9" fill="rgba(255,152,0,0.75)" />
            <ellipse cx="7" cy="18" rx="5" ry="6" fill="rgba(255,235,59,0.55)" />
            <ellipse cx="23" cy="18" rx="5" ry="6" fill="rgba(255,152,0,0.55)" />
            <line x1="15" y1="2" x2="15" y2="22" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <div
          className="pb-32 sm:pb-40"
          style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 24px", maxWidth: 900, margin: "0 auto" }}
        >
          <div className="mb-7" style={{ animation: "fade-in 0.8s ease 0.2s both" }}>
            <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Now in early access for schools and families
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: 24,
              textShadow: "0 4px 24px rgba(0,0,0,0.25)",
              animation: "float-up 0.9s ease 0.35s both",
            }}
          >
            Learn to Type.
            <br />
            Help the Planet.
          </h1>

          <p
            style={{
              fontSize: "1.25rem",
              color: "rgba(255,255,255,0.85)",
              fontWeight: 600,
              lineHeight: 1.65,
              maxWidth: 560,
              margin: "0 auto 36px",
              animation: "float-up 0.9s ease 0.5s both",
            }}
          >
            The only typing platform where every word your child types helps save the planet
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", animation: "float-up 0.9s ease 0.65s both" }}>
            <Link
              href="/signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 52,
                padding: "0 28px",
                borderRadius: 50,
                background: "#fff",
                color: DARK,
                fontWeight: 800,
                fontSize: "1rem",
                textDecoration: "none",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              className="hover:-translate-y-0.5 active:scale-[0.97]"
            >
              Start Free Today
            </Link>
            <a
              href="#games-preview"
              className="btn-ghost"
              style={{ fontSize: "1rem", padding: "0 28px", height: 52, display: "inline-flex", alignItems: "center" }}
            >
              Watch Demo
            </a>
          </div>
          <p style={{ marginTop: 20, fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
            No credit card required. Free forever.
          </p>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 210, pointerEvents: "none" }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 130, background: "linear-gradient(180deg,transparent 0%,#235c2a 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 62, background: "#2d6e1e", borderTopLeftRadius: "50% 18px", borderTopRightRadius: "50% 18px" }} />

          <Tree style={{ left: "2%", bottom: 42 }} scale={1.2} />
          <Tree style={{ left: "9%", bottom: 32 }} scale={0.9} delay="0.5s" />
          <Tree style={{ left: "17%", bottom: 50 }} scale={1.5} delay="1s" />
          <Tree style={{ left: "26%", bottom: 36 }} scale={1.0} delay="0.3s" />
          <Tree style={{ left: "37%", bottom: 46 }} scale={1.3} delay="0.8s" />
          <Tree style={{ left: "49%", bottom: 32 }} scale={0.85} delay="0.2s" />
          <Tree style={{ left: "59%", bottom: 50 }} scale={1.4} delay="1.2s" />
          <Tree style={{ left: "69%", bottom: 36 }} scale={1.0} delay="0.6s" />
          <Tree style={{ left: "78%", bottom: 46 }} scale={1.2} delay="0.9s" />
          <Tree style={{ left: "87%", bottom: 32 }} scale={0.9} delay="0.4s" />
          <Tree style={{ left: "93%", bottom: 42 }} scale={1.1} delay="1.1s" />

          <Flower style={{ left: "6%", bottom: 58 }} color="#FF6B6B" />
          <Flower style={{ left: "22%", bottom: 60 }} color="#FFEB3B" delay="0.7s" />
          <Flower style={{ left: "44%", bottom: 58 }} color="#FF8E53" delay="1.3s" />
          <Flower style={{ left: "65%", bottom: 62 }} color="#e91e63" delay="0.4s" />
          <Flower style={{ left: "83%", bottom: 58 }} color="#FFEB3B" delay="1s" />
        </div>

        <div
          className="hidden sm:flex"
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 12,
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            color: "rgba(255,255,255,0.7)",
            fontSize: 12,
            fontWeight: 700,
            animation: "float-up 1s ease 1s both",
          }}
          aria-hidden
        >
          <span>Scroll</span>
          <span style={{ fontSize: 22, lineHeight: 1, animation: "flower-bob 2s ease-in-out infinite" }}>↓</span>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section style={{ background: "#fff", padding: "48px 0" }}>
        <Inner>
          <p style={{ textAlign: "center", fontSize: "1.125rem", fontWeight: 800, color: DARK, marginBottom: 28 }}>
            Privacy and safety built in
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
            {["COPPA Compliant", "GDPR Safe", "Ad-Free"].map((b) => (
              <span
                key={b}
                style={{
                  padding: "8px 18px",
                  borderRadius: 50,
                  background: BG,
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </Inner>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20" style={{ background: "#F8F9FA" }}>
        <Inner>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, color: DARK, marginBottom: 48 }}>
            Learning that actually works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {(
              [
                {
                  step: 1,
                  src: "/images/homepage/how-1-signup.jpg",
                  alt: "Sign up for My Green Keys",
                  title: "Sign Up Free",
                  desc: "Create an account in 60 seconds and choose your virtual pet",
                },
                {
                  step: 2,
                  src: "/images/homepage/how-2-typing.jpg",
                  alt: "Learn typing with eco-friendly lessons",
                  title: "Start Typing",
                  desc: "100 lessons from home row to advanced. Every lesson teaches the planet",
                },
                {
                  step: 3,
                  src: "/images/homepage/how-3-planet.jpg",
                  alt: "Help the planet with eco rewards",
                  title: "Help the Planet",
                  desc: "Upload eco actions, earn points, and contribute to real tree planting",
                },
              ] as const
            ).map((card) => (
              <article
                key={card.step}
                className="flex flex-col rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-t-3xl">
                  <span
                    className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white shadow-md"
                    style={{ background: PRIMARY }}
                  >
                    {card.step}
                  </span>
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={false}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 p-6 pb-7">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{card.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </Inner>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-white py-20">
        <Inner>
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.65rem, 3.5vw, 2.35rem)",
              fontWeight: 900,
              color: DARK,
              maxWidth: 720,
              margin: "0 auto 48px",
              lineHeight: 1.2,
            }}
          >
            Everything your child needs to become a typing champion
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {(
              [
                {
                  tag: "Engaging Lessons",
                  src: "/images/homepage/feature-lessons.jpg",
                  alt: "Engaging typing lessons for kids",
                  title: "100 lessons designed by experts",
                  desc: "Progressive curriculum from home row to advanced typing. Every lesson teaches kids about the planet.",
                  items: ["Color-coded keyboard guide", "Real-time WPM tracking", "Instant feedback", "4 learning modules"],
                },
                {
                  tag: "Eco Rewards",
                  src: "/images/homepage/feature-eco.jpg",
                  alt: "Real eco rewards for kids",
                  title: "The world's first eco rewards system",
                  desc: "Kids upload photos of real eco actions like planting trees and watering plants. Parents approve. Kids earn points.",
                  items: ["Photo upload rewards", "Parent approval system", "Eco points and badges", "Real-world impact"],
                },
                {
                  tag: "Virtual Pet",
                  src: "/images/homepage/feature-pet.jpg",
                  alt: "Virtual pet companion for typing",
                  title: "Meet your typing companion",
                  desc: "Choose a Panda or Turtle. Type daily to keep them happy. Miss a day and they get sad — kids love coming back.",
                  items: ["Panda or Turtle", "Daily health system", "Emotional engagement", "Kids keep coming back"],
                },
              ] as const
            ).map((card) => (
              <article
                key={card.tag}
                className="flex flex-col rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-t-3xl">
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 p-6 pb-7">
                  <span className="mb-3 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {card.tag}
                  </span>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">{card.title}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-gray-600">{card.desc}</p>
                  <ul className="space-y-2">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </Inner>
      </section>

      {/* GAMES */}
      <section id="games-preview" style={{ background: DARK, padding: "88px 0" }}>
        <Inner>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, color: "#fff", marginBottom: 12 }}>
            Learning through play
          </h2>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: "1.05rem", marginBottom: 40, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
            5 eco-themed games that make typing practice addictive
          </p>
          <div
            className="flex gap-5 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {PREVIEW_GAMES.map((g) => (
              <Link
                key={g.name}
                href="/games"
                className="mgk-card-ds shrink-0"
                style={{
                  width: "min(280px, 85vw)",
                  scrollSnapAlign: "start",
                  overflow: "hidden",
                  padding: 0,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{ position: "relative", height: 160 }}>
                  <Image src={g.img} alt="" fill sizes="280px" style={{ objectFit: "cover" }} />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                    }}
                  />
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <p style={{ fontWeight: 900, color: DARK, margin: 0, fontSize: "1.05rem" }}>{g.name}</p>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600, margin: "8px 0 0" }}>{g.desc}</p>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link
              href="/games"
              className="btn-ghost"
              style={{ display: "inline-flex", alignItems: "center", height: 52, padding: "0 32px" }}
            >
              Explore All Games
            </Link>
          </div>
        </Inner>
      </section>

      {/* EARLY ACCESS */}
      <section className="bg-white py-20">
        <div className="mgk-container">
          <h2 className="text-center text-3xl font-black text-gray-900 md:text-4xl" style={{ color: DARK }}>
            Join us as an early adopter
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base font-semibold text-gray-600">
            Schools and families joining now get founding member benefits
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <article className="rounded-3xl bg-white p-8 shadow-sm transition hover:shadow-lg">
              <School className="mb-4 h-10 w-10 text-green-600" aria-hidden />
              <h3 className="mb-2 text-xl font-bold text-gray-900">Free 30-day pilot for schools</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Test My Green Keys with your classroom. Full access, no commitment.
              </p>
            </article>
            <article className="rounded-3xl bg-white p-8 shadow-sm transition hover:shadow-lg">
              <Users className="mb-4 h-10 w-10 text-green-600" aria-hidden />
              <h3 className="mb-2 text-xl font-bold text-gray-900">Founding family pricing</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Lock in 50% off the Family Plan for life when you sign up early.
              </p>
            </article>
            <article className="rounded-3xl bg-white p-8 shadow-sm transition hover:shadow-lg">
              <MessageSquare className="mb-4 h-10 w-10 text-green-600" aria-hidden />
              <h3 className="mb-2 text-xl font-bold text-gray-900">Help shape the product</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Direct feedback line to the founder. Your input shapes new features.
              </p>
            </article>
          </div>
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold text-gray-900" style={{ color: DARK }}>
              Be among the first
            </h3>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-green-600 px-8 py-3 text-base font-bold text-white shadow-sm transition hover:bg-green-700"
              >
                Get Started Free
              </Link>
              <a
                href="mailto:waleedbinkhalid86@gmail.com?subject=My%20Green%20Keys%20School%20Demo"
                className="inline-flex items-center justify-center rounded-full border-2 border-gray-900 bg-white px-8 py-3 text-base font-bold text-gray-900 transition hover:bg-gray-50"
              >
                Schools: Book a Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section style={{ background: BG, padding: "88px 0" }}>
        <Inner>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.65rem, 3vw, 2.2rem)", fontWeight: 900, color: DARK, marginBottom: 40 }}>
            Simple pricing for every family
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 800, margin: "0 auto" }}>
            <div className="mgk-card-ds" style={{ padding: 32 }}>
              <p style={{ fontWeight: 900, color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Free</p>
              <p style={{ fontSize: "2.5rem", fontWeight: 900, color: DARK, margin: 0 }}>$0</p>
              <p style={{ color: "#64748b", fontWeight: 600, marginTop: 12 }}>10 lessons, progress tracking, kid-safe.</p>
              <Link href="/signup" className="btn-primary" style={{ marginTop: 24, width: "100%", textAlign: "center", height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
                Start free
              </Link>
            </div>
            <div className="mgk-card-ds" style={{ padding: 32, border: `2px solid ${PRIMARY}` }}>
              <p style={{ fontWeight: 900, color: PRIMARY, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Family Plan</p>
              <p style={{ fontSize: "2.5rem", fontWeight: 900, color: DARK, margin: 0 }}>
                $9.99<span style={{ fontSize: "1rem", fontWeight: 700, color: "#64748b" }}>/mo</span>
              </p>
              <p style={{ color: "#64748b", fontWeight: 600, marginTop: 12 }}>Unlimited lessons, parent dashboard, eco rewards.</p>
              <Link href="/pricing" className="btn-primary" style={{ marginTop: 24, width: "100%", textAlign: "center", height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
                View Family Plan
              </Link>
            </div>
          </div>
          <p style={{ textAlign: "center", marginTop: 28 }}>
            <Link href="/pricing" style={{ fontWeight: 800, color: PRIMARY, textDecoration: "none" }} className="hover:underline">
              See all plans →
            </Link>
          </p>
        </Inner>
      </section>

      {/* FINAL CTA */}
      <section
        style={{
          background: "linear-gradient(135deg, #1B5E20 0%, #2ECC71 55%, #58D68D 100%)",
          padding: "88px 0",
          textAlign: "center",
        }}
      >
        <Inner>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(1.65rem, 4vw, 2.5rem)", fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 28 }}>
              Ready to start your child&apos;s typing journey?
            </h2>
            <form
              style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480, margin: "0 auto" }}
              onSubmit={(e) => e.preventDefault()}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                <input
                  type="email"
                  placeholder="Your email"
                  style={{
                    flex: "1 1 200px",
                    minHeight: 52,
                    padding: "0 22px",
                    borderRadius: 50,
                    border: "2px solid transparent",
                    fontWeight: 600,
                    color: DARK,
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    minHeight: 52,
                    padding: "0 28px",
                    borderRadius: 50,
                    border: "none",
                    background: "#fff",
                    color: DARK,
                    fontWeight: 900,
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  className="hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  Start Free
                </button>
              </div>
            </form>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem", fontWeight: 600, marginTop: 16 }}>No spam. Unsubscribe anytime.</p>
          </div>
        </Inner>
      </section>
    </>
  );
}
