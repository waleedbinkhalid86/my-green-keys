"use client";
import Image from "next/image";
import Link from "next/link";
import { Menu, MessageSquare, School, Users, X } from "lucide-react";
import React from "react";
import { BrainSprintPromo } from "@/components/BrainSprintPromo";

const DARK = "#1A2F23";
const PRIMARY = "#2ECC71";
const BG = "#FAFAFA";

const PRIMARY_CTA_STYLE: React.CSSProperties = {
  background: "linear-gradient(135deg, #52B788 0%, #40916C 100%)",
  color: "white",
  padding: "14px 32px",
  borderRadius: "9999px",
  fontWeight: "700",
  fontSize: "16px",
  boxShadow: "0 4px 14px rgba(82, 183, 136, 0.4)",
  transition: "all 0.3s ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  border: "none",
  cursor: "pointer",
};

const SECONDARY_CTA_STYLE: React.CSSProperties = {
  background: "transparent",
  color: "#1B4332",
  padding: "14px 32px",
  borderRadius: "9999px",
  fontWeight: "700",
  fontSize: "16px",
  border: "2px solid #1B4332",
  transition: "all 0.3s ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  cursor: "pointer",
};

const SECONDARY_CTA_STYLE_ON_DARK: React.CSSProperties = {
  ...SECONDARY_CTA_STYLE,
  color: "white",
  border: "2px solid white",
};

function Inner({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={["mgk-container", className].filter(Boolean).join(" ")}>{children}</div>
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
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const isPausedRef = React.useRef(false);

  const slides = React.useMemo(
    () =>
      [
        {
          src: "/images/homepage/homepage-hero.jpg",
          caption: "Beautiful animated lessons",
        },
        {
          src: "/images/homepage/how-2-typing.jpg",
          caption: "Learn proper finger placement",
        },
        {
          src: "/images/homepage/feature-pet.jpg",
          caption: "Care for your virtual pet",
        },
        {
          src: "/images/homepage/how-3-planet.jpg",
          caption: "Earn eco-points, plant real trees",
        },
        {
          // fallback (homepage-kids.jpg wasn't present in /public/images/homepage)
          src: "/images/homepage/feature-lessons.jpg",
          caption: "Loved by kids 6-14",
        },
      ] as const,
    []
  );

  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const prevSlide = React.useCallback(
    () => setCurrentSlide((s) => (s - 1 + slides.length) % slides.length),
    [slides.length]
  );
  const nextSlide = React.useCallback(
    () => setCurrentSlide((s) => (s + 1) % slides.length),
    [slides.length]
  );

  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeModal]);

  React.useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const id = window.setInterval(() => {
      if (isPausedRef.current) return;
      setCurrentSlide((s) => (s + 1) % slides.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [isOpen, slides.length]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 transition-opacity duration-200 ease-out"
          onClick={closeModal}
          style={{ opacity: 1, animation: "fade-in 0.18s ease-out both" }}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close demo modal"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <h2 className="mb-4 text-center text-2xl font-bold text-[#1B4332]">See My Green Keys in Action</h2>

            <div
              className="select-none"
              onMouseEnter={() => {
                isPausedRef.current = true;
              }}
              onMouseLeave={() => {
                isPausedRef.current = false;
              }}
            >
              <div className="relative">
                <div className="transition-opacity duration-500 ease-out" key={currentSlide}>
                  <Image
                    src={slides[currentSlide].src}
                    alt=""
                    width={1200}
                    height={600}
                    className="h-[300px] w-full rounded-xl object-cover"
                    priority={false}
                  />
                  <p className="mt-3 text-center text-lg text-gray-700">{slides[currentSlide].caption}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
                >
                  Next
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={[
                      "h-2.5 w-2.5 rounded-full transition-colors",
                      idx === currentSlide ? "bg-[#40916C]" : "bg-gray-300 hover:bg-gray-400",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                href="/signup"
                className="hover:shadow-2xl hover:scale-105 hover:brightness-110"
                style={{ ...PRIMARY_CTA_STYLE, textDecoration: "none" }}
                onClick={closeModal}
              >
                Start Free Today →
              </Link>
            </div>
          </div>
        </div>
      )}

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
              <Image src="/logo-bgr.png" alt="My Green Keys logo" width={40} height={40} style={{ width: 40, height: 40, flexShrink: 0 }} priority />
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
              <Link href="/kid-login" className="nav-link hidden md:block">
                Kid login
              </Link>
              <Link href="/login" className="nav-link hidden md:block">
                Log In
              </Link>
              <Link
                href="/signup"
                className="hover:shadow-2xl hover:scale-105 hover:brightness-110"
                style={{ ...PRIMARY_CTA_STYLE, padding: "10px 20px", fontSize: "14px" }}
              >
                Start Free Today
              </Link>
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-md px-3 py-2 text-white/90 hover:text-white hover:bg-white/10"
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
              <div className="mt-2 rounded-md border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
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
                  <Link href="/kid-login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Kid login
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
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0A1F0F 0%, #1A3D1F 100%)",
          paddingTop: "48px",
          paddingBottom: "48px",
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

        <div className="relative z-10 w-full pb-32 text-center sm:pb-40">
          <Inner className="text-center">
          <div className="mb-8" style={{ animation: "fade-in 0.8s ease 0.2s both" }}>
            <span className="inline-flex items-center rounded-md bg-green-500 px-6 py-2.5 text-sm font-semibold text-white">
              <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden />
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
            className=""
            style={{
              textAlign: "center",
              color: "white",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              display: "block",
              width: "100%",
            }}
          >
            Built for ages 6-14. 100 lessons, 5 games, and a virtual pet
            <br />
            that needs your child to type daily.
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-4"
            style={{ animation: "float-up 0.9s ease 0.65s both", marginTop: "14px", marginBottom: "10px" }}
          >
            <Link
              href="/signup"
              className="hover:shadow-2xl hover:scale-105 hover:brightness-110"
              style={PRIMARY_CTA_STYLE}
            >
              Start Free Today
            </Link>
            <button
              type="button"
              className="hover:bg-[#1B4332] hover:text-white hover:scale-105"
              style={SECONDARY_CTA_STYLE_ON_DARK}
              onClick={() => setIsOpen(true)}
            >
              Watch Demo
            </button>
          </div>
          <p
            className="inline-block rounded-md bg-black/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
            style={{ marginTop: "14px", marginBottom: "14px" }}
          >
            No credit card required. Free forever.
          </p>
          <p style={{ marginTop: 4, fontSize: "0.95rem", color: "rgba(255,255,255,0.88)" }}>
            Kid with a code from home or school?{" "}
            <Link href="/kid-login" className="font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white">
              Kid login
            </Link>
          </p>
          </Inner>
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
      </section>

      <div
        className="bg-[#FAFAFA] antialiased text-gray-900
          bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:18px_18px]"
      >
        <BrainSprintPromo />

        {/* TRUST BADGES */}
        <section style={{ paddingTop: "48px", paddingBottom: "48px" }}>
          <Inner>
            <p
              className="text-center"
              style={{ fontSize: "1.125rem", fontWeight: 800, color: DARK, marginBottom: "20px" }}
            >
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
        <section id="how-it-works" style={{ paddingTop: "48px", paddingBottom: "48px" }}>
          <Inner>
            <h2
              style={{
                textAlign: "center",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 900,
                color: DARK,
                marginBottom: "18px",
              }}
            >
              Learning that actually works
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3" style={{ marginTop: "12px", marginBottom: "18px" }}>
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
                  className="flex flex-col rounded-md bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-t-md">
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
                  <div className="flex-1 p-6 pt-12">
                    <h3 className="mb-2 text-xl font-bold text-gray-900">{card.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-600">{card.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </Inner>
        </section>

        {/* FEATURES */}
        <section id="features" style={{ paddingTop: "48px", paddingBottom: "48px" }}>
          <Inner>
            <h2
              style={{
                textAlign: "center",
                fontSize: "clamp(1.65rem, 3.5vw, 2.35rem)",
                fontWeight: 900,
                color: DARK,
                maxWidth: 720,
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: 1.2,
                marginBottom: "18px",
              }}
            >
              Everything your child needs to become a typing champion
            </h2>
            <p
              className="text-base font-semibold text-gray-600"
              style={{
                marginBottom: "24px",
                textAlign: "center",
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Lessons, rewards, and motivation — all designed to keep kids practicing every day.
            </p>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3" style={{ marginTop: "12px", marginBottom: "18px" }}>
              {(
                [
                  {
                    tag: "Engaging Lessons",
                    src: "/images/homepage/feature-lessons.jpg",
                    alt: "Engaging typing lessons for kids",
                    title: "100 lessons designed by experts",
                    sentence:
                      "Color-coded keyboard guide, real-time WPM tracking, and instant feedback across 4 progressive learning modules.",
                  },
                  {
                    tag: "Eco Rewards",
                    src: "/images/homepage/feature-eco.jpg",
                    alt: "Real eco rewards for kids",
                    title: "The world's first eco rewards system",
                    sentence:
                      "Kids photograph real-world eco actions, parents approve, and points earned plant trees through verified partners.",
                  },
                  {
                    tag: "Virtual Pet",
                    src: "/images/homepage/feature-pet.jpg",
                    alt: "Virtual pet companion for typing",
                    title: "Meet your typing companion",
                    sentence:
                      "Choose a Panda or Turtle. Daily typing keeps them happy — miss a day and they get sad. Kids never want to disappoint.",
                  },
                ] as const
              ).map((card) => (
                <article
                  key={card.tag}
                  className="flex flex-col rounded-md bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-t-md">
                    <Image
                      src={card.src}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <span className="mb-3 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      {card.tag}
                    </span>
                    <h3 className="mb-2 text-xl font-bold text-gray-900">{card.title}</h3>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">{card.sentence}</p>
                  </div>
                </article>
              ))}
            </div>
          </Inner>
        </section>

        {/* GAMES */}
        <section
          id="games-preview"
          style={{ background: DARK, paddingTop: "48px", paddingBottom: "48px" }}
        >
          <Inner>
            <h2
              style={{
                textAlign: "center",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 900,
                color: "#fff",
                marginBottom: "18px",
              }}
            >
              Learning through play
            </h2>
            <p
              style={{
                marginBottom: "24px",
                textAlign: "center",
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
                color: "rgba(255,255,255,0.75)",
                fontWeight: 600,
                fontSize: "1.05rem",
              }}
            >
              5 eco-themed games that make typing practice addictive
            </p>
            <div
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
              style={{ marginTop: "12px", marginBottom: "18px" }}
            >
              {PREVIEW_GAMES.map((g) => (
                <Link
                  key={g.name}
                  href="/games"
                  className="mgk-card-ds"
                  style={{
                    overflow: "hidden",
                    padding: 0,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div style={{ position: "relative", height: 160 }}>
                    <Image src={g.img} alt="" fill sizes="(max-width: 1024px) 100vw, 20vw" style={{ objectFit: "cover" }} />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                      }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p style={{ fontWeight: 900, color: DARK, margin: 0, fontSize: "1.05rem" }}>{g.name}</p>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600, margin: "8px 0 0" }}>{g.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "14px", marginBottom: "14px" }}>
              <Link
                href="/games"
                className="hover:bg-[#1B4332] hover:text-white hover:scale-105"
                style={SECONDARY_CTA_STYLE_ON_DARK}
              >
                Explore All Games
              </Link>
            </div>
          </Inner>
        </section>

        {/* EARLY ACCESS */}
        <section style={{ paddingTop: "48px", paddingBottom: "48px" }}>
          <div className="mgk-container">
            <h2
              className="text-center text-3xl font-black text-gray-900 md:text-4xl"
              style={{ color: DARK, marginBottom: "18px" }}
            >
              Join us as an early adopter
            </h2>
            <p
              className="text-base font-semibold text-gray-600"
              style={{
                textAlign: "center",
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
                display: "block",
                marginBottom: "24px",
              }}
            >
              Schools and families joining now get founding member benefits
            </p>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3" style={{ marginTop: "12px", marginBottom: "18px" }}>
              {(
                [
                  {
                    title: "Free 30-day pilot for schools",
                    desc: "Test My Green Keys with your classroom. Full access, no commitment.",
                    Icon: School,
                  },
                  {
                    title: "Founding family pricing",
                    desc: "Lock in 50% off the Family Plan for life when you sign up early.",
                    Icon: Users,
                  },
                  {
                    title: "Help shape the product",
                    desc: "Direct feedback line to the founder. Your input shapes new features.",
                    Icon: MessageSquare,
                  },
                ] as const
              ).map(({ title, desc, Icon }) => (
                <article
                  key={title}
                  className="rounded-md bg-white p-8 shadow-sm transition-shadow duration-200 hover:shadow-md border border-gray-200"
                >
                  <div className="h-1 w-12 rounded bg-green-500 mb-6" aria-hidden />
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                    <Icon className="h-12 w-12 text-green-600" aria-hidden />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{desc}</p>
                </article>
              ))}
            </div>
            <div className="text-center" style={{ marginTop: "64px" }}>
              <h3 className="mt-8 text-xl font-bold text-gray-900" style={{ color: DARK }}>
                Be among the first
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-4" style={{ marginTop: "14px", marginBottom: "14px" }}>
                <Link
                  href="/signup"
                  className="hover:shadow-2xl hover:scale-105 hover:brightness-110"
                  style={PRIMARY_CTA_STYLE}
                >
                  Get Started Free
                </Link>
                <a
                  href="mailto:waleedbinkhalid86@gmail.com?subject=My%20Green%20Keys%20School%20Demo"
                  className="hover:bg-[#1B4332] hover:text-white hover:scale-105"
                  style={SECONDARY_CTA_STYLE}
                >
                  Schools: Book a Demo
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING PREVIEW */}
        <section className="text-center w-full" style={{ paddingTop: "48px", paddingBottom: "48px" }}>
          <Inner>
            <h2
              style={{
                textAlign: "center",
                fontSize: "clamp(1.65rem, 3vw, 2.2rem)",
                fontWeight: 900,
                color: DARK,
                marginBottom: "18px",
              }}
            >
              Simple pricing for every family
            </h2>
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto justify-items-center"
              style={{ marginTop: "12px", marginBottom: "18px" }}
            >
              <div className="mgk-card-ds bg-white p-8">
                <p style={{ fontWeight: 900, color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Free</p>
                <p style={{ fontSize: "2.5rem", fontWeight: 900, color: DARK, margin: 0 }}>$0</p>
                <p style={{ color: "#64748b", fontWeight: 600, marginTop: 12 }}>10 lessons, progress tracking, kid-safe.</p>
                <Link
                  href="/signup"
                  className="w-full hover:shadow-2xl hover:scale-105 hover:brightness-110"
                  style={{
                    ...PRIMARY_CTA_STYLE,
                    width: "100%",
                    textDecoration: "none",
                    marginTop: "14px",
                    marginBottom: "14px",
                  }}
                >
                  Start free
                </Link>
              </div>
              <div className="mgk-card-ds bg-white p-8" style={{ border: `2px solid ${PRIMARY}` }}>
                <p style={{ fontWeight: 900, color: PRIMARY, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Family Plan</p>
                <p style={{ fontSize: "2.5rem", fontWeight: 900, color: DARK, margin: 0 }}>
                  $9.99<span style={{ fontSize: "1rem", fontWeight: 700, color: "#64748b" }}>/mo</span>
                </p>
                <p style={{ color: "#64748b", fontWeight: 600, marginTop: 12 }}>Unlimited lessons, parent dashboard, eco rewards.</p>
                <Link
                  href="/pricing"
                  className="w-full hover:shadow-2xl hover:scale-105 hover:brightness-110"
                  style={{ ...PRIMARY_CTA_STYLE, width: "100%", textDecoration: "none", marginTop: "14px", marginBottom: "14px" }}
                >
                  View Family Plan
                </Link>
              </div>
              <div className="mgk-card-ds bg-white p-8">
                <p style={{ fontWeight: 900, color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>School Starter</p>
                <p style={{ fontSize: "2.5rem", fontWeight: 900, color: DARK, margin: 0 }}>
                  $149<span style={{ fontSize: "1rem", fontWeight: 700, color: "#64748b" }}>/mo</span>
                </p>
                <p style={{ color: "#64748b", fontWeight: 600, marginTop: 12 }}>
                  Classroom access, teacher dashboard, student progress tracking.
                </p>
                <Link
                  href="/pricing"
                  className="w-full hover:shadow-2xl hover:scale-105 hover:brightness-110"
                  style={{ ...PRIMARY_CTA_STYLE, width: "100%", textDecoration: "none", marginTop: "14px", marginBottom: "14px" }}
                >
                  View School Plan
                </Link>
              </div>
            </div>
            <p style={{ textAlign: "center", marginTop: "14px", marginBottom: "14px" }}>
              <Link href="/pricing" style={{ fontWeight: 800, color: PRIMARY, textDecoration: "none" }} className="hover:underline">
                See all plans →
              </Link>
            </p>
          </Inner>
        </section>

        {/* FINAL CTA */}
        <section className="text-center" style={{ paddingTop: "48px", paddingBottom: "48px" }}>
          <Inner>
            <div style={{ maxWidth: 560, margin: "0 auto" }}>
              <h2
                className="text-gray-900"
                style={{ fontSize: "clamp(1.65rem, 4vw, 2.5rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: "18px" }}
              >
                Ready to start your child&apos;s typing journey?
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-6" style={{ marginTop: "14px", marginBottom: "14px" }}>
                <Link
                  href="/signup"
                  className="hover:shadow-2xl hover:scale-105 hover:brightness-110"
                  style={PRIMARY_CTA_STYLE}
                >
                  Start Free Today
                </Link>
                <Link
                  href="/pricing"
                  className="hover:bg-[#1B4332] hover:text-white hover:scale-105"
                  style={SECONDARY_CTA_STYLE}
                >
                  View Pricing
                </Link>
              </div>
              <p className="text-sm font-semibold text-gray-500" style={{ marginTop: "14px", marginBottom: "14px" }}>
                Free forever for first 10 lessons. No credit card.
              </p>
            </div>
          </Inner>
        </section>
      </div>
    </>
  );
}
