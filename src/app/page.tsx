"use client";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, School, Users, X } from "lucide-react";
import React from "react";
import { BrainSprintPromo } from "@/components/BrainSprintPromo";
import { Container } from "@/components/marketing/Container";
import { Section } from "@/components/marketing/Section";
import { PrimaryButton, SecondaryButton } from "@/components/marketing/Buttons";
import { Card } from "@/components/marketing/Card";
import { Eyebrow } from "@/components/marketing/Eyebrow";

const PAGE_BG: React.CSSProperties = {
  backgroundColor: "#FAFAF5",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
};

const TAG_STYLE: React.CSSProperties = {
  display: "inline-block",
  marginBottom: 16,
  padding: "4px 12px",
  borderRadius: 9999,
  background: "#F0F9F4",
  color: "#2D6A4F",
  fontSize: "0.8125rem",
  fontWeight: 600,
};

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

const HOW_STEPS = [
  {
    step: 1,
    src: "/images/homepage/how-1-signup.jpg",
    alt: "Sign up for My Green Keys",
    title: "Sign up free",
    desc: "Create an account in 60 seconds and choose your virtual pet",
  },
  {
    step: 2,
    src: "/images/homepage/how-2-typing.jpg",
    alt: "Learn typing with eco-friendly lessons",
    title: "Start typing",
    desc: "100 lessons from home row to advanced. Every lesson teaches the planet",
  },
  {
    step: 3,
    src: "/images/homepage/how-3-planet.jpg",
    alt: "Help the planet with eco rewards",
    title: "Help the planet",
    desc: "Upload eco actions, earn points, and contribute to real tree planting",
  },
] as const;

const FEATURES = [
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
] as const;

const EARLY_ACCESS = [
  {
    title: "School sustainability partners",
    desc: "Schools join free. We onboard your teachers and build eco awareness together.",
    Icon: School,
  },
  {
    title: "Free for every child",
    desc: "Every lesson, game and dashboard is free for kids, parents and teachers.",
    Icon: Users,
  },
  {
    title: "Help shape the product",
    desc: "Direct feedback line to the founder. Your input shapes new features.",
    Icon: MessageSquare,
  },
] as const;

export default function HomePage() {
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
        >
          <div
            className="relative w-full max-w-3xl bg-white shadow-2xl"
            style={{ borderRadius: 16, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close demo modal"
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-[#2D6A4F] transition-colors hover:bg-[#F0F9F4]"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <h2 id="demo-modal-title" className="mgk-h2" style={{ textAlign: "center", marginBottom: 24, paddingInline: 40 }}>
              See My Green Keys in action
            </h2>

            <div
              className="select-none"
              onMouseEnter={() => {
                isPausedRef.current = true;
              }}
              onMouseLeave={() => {
                isPausedRef.current = false;
              }}
            >
              <div key={currentSlide}>
                <Image
                  src={slides[currentSlide].src}
                  alt=""
                  width={1200}
                  height={600}
                  className="h-[300px] w-full object-cover"
                  style={{ borderRadius: 12 }}
                  priority={false}
                />
                <p className="mgk-lead" style={{ marginTop: 16, textAlign: "center" }}>
                  {slides[currentSlide].caption}
                </p>
              </div>

              <div className="mgk-btn-row" style={{ marginTop: 16 }}>
                <SecondaryButton onClick={prevSlide}>Previous</SecondaryButton>
                <SecondaryButton onClick={nextSlide}>Next</SecondaryButton>
              </div>

              <div className="flex items-center justify-center gap-2" style={{ marginTop: 16 }}>
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    aria-current={idx === currentSlide ? "true" : undefined}
                    className="h-2.5 w-2.5 rounded-full transition-colors"
                    style={{ background: idx === currentSlide ? "#2D6A4F" : "#74C69D", opacity: idx === currentSlide ? 1 : 0.5 }}
                  />
                ))}
              </div>
            </div>

            <div className="mgk-btn-row" style={{ marginTop: 24 }}>
              <PrimaryButton href="/signup" onClick={closeModal}>
                Start free today →
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section
        className="relative flex min-h-[calc(100svh-72px)] flex-col items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #1B4332 0%, #2D6A4F 100%)",
          paddingTop: 64,
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
              background: "linear-gradient(180deg, rgba(27,67,50,0.92) 0%, rgba(27,67,50,0.78) 100%)",
            }}
          />
        </div>

        {/* Decorative motion (disabled under prefers-reduced-motion) */}
        <div className="mgk-hero-motion" aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
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

          <div style={{ position: "absolute", top: "17%", left: 0, animation: "bird-fly 18s linear 4s infinite" }}>
            <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
              <path d="M2 10 Q8 2 16 10 Q24 2 30 10" stroke="rgba(255,255,255,0.8)" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          <div style={{ position: "absolute", top: "43%", left: "5%", animation: "butterfly 14s ease-in-out 2s infinite" }}>
            <svg width="30" height="24" viewBox="0 0 30 24" fill="none">
              <ellipse cx="7" cy="10" rx="7" ry="9" fill="rgba(255,235,59,0.75)" />
              <ellipse cx="23" cy="10" rx="7" ry="9" fill="rgba(255,152,0,0.75)" />
              <ellipse cx="7" cy="18" rx="5" ry="6" fill="rgba(255,235,59,0.55)" />
              <ellipse cx="23" cy="18" rx="5" ry="6" fill="rgba(255,152,0,0.55)" />
              <line x1="15" y1="2" x2="15" y2="22" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 w-full pb-32 text-center sm:pb-40">
          <Container className="mgk-on-dark" style={{ textAlign: "center" }}>
            <Eyebrow style={{ marginBottom: 24 }}>
              <span
                className="mgk-hero-motion inline-block h-2 w-2 animate-pulse rounded-full"
                style={{ background: "#1B4332" }}
                aria-hidden
              />
              Now in early access for schools and families
            </Eyebrow>

            <h1
              className="mgk-h1 mgk-h1--hero"
              style={{ marginBottom: 24, textShadow: "0 4px 24px rgba(0,0,0,0.25)" }}
            >
              Learn to type.
              <br />
              Help the planet.
            </h1>

            <p className="mgk-lead" style={{ maxWidth: 600, marginInline: "auto" }}>
              Built for ages 6-14. 100 lessons, 5 games, and a virtual pet
              <br className="hidden sm:inline" /> that needs your child to type daily.
            </p>

            <div className="mgk-btn-row" style={{ marginTop: 32 }}>
              <PrimaryButton href="/signup" onDark>
                Start free today
              </PrimaryButton>
              <SecondaryButton onDark onClick={() => setIsOpen(true)}>
                Watch demo
              </SecondaryButton>
            </div>

            <p
              className="inline-block rounded-md px-4 py-2 text-sm text-white"
              style={{ marginTop: 24, background: "rgba(0,0,0,0.2)" }}
            >
              No credit card required. Free for every child.
            </p>
            <p style={{ marginTop: 16, fontSize: "0.95rem", color: "rgba(255,255,255,0.88)" }}>
              Kid with a code from home or school?{" "}
              <Link
                href="/kid-login"
                className="font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
              >
                Kid login
              </Link>
              {" · "}
              <Link
                href="/lesson"
                className="font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
              >
                Try a lesson
              </Link>
            </p>
          </Container>
        </div>

        <div
          className="mgk-hero-motion"
          aria-hidden
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 210, pointerEvents: "none" }}
        >
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

      <div style={PAGE_BG}>
        <BrainSprintPromo />

        {/* TRUST BADGES */}
        <div style={{ paddingBlock: "var(--mgk-space-5)" }}>
          <Container style={{ textAlign: "center" }}>
            <p className="mgk-h3" style={{ marginBottom: 24 }}>
              Privacy and safety built in
            </p>
            <div className="mgk-btn-row">
              {["Privacy-first design for kids", "GDPR-aware · EU hosting", "100% Ad-Free"].map((b) => (
                <span
                  key={b}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 9999,
                    background: "#fff",
                    border: "1px solid var(--mgk-border-card)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#1B4332",
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </Container>
        </div>

        {/* HOW IT WORKS */}
        <Section id="how-it-works" style={{ paddingTop: "var(--mgk-space-5)" }}>
          <Container>
            <div className="mgk-sec-head">
              <h2 className="mgk-h2">Learning that actually works</h2>
            </div>
            <div className="mgk-grid-3">
              {HOW_STEPS.map((card) => (
                <Card
                  key={card.step}
                  media={
                    <div className="relative aspect-square w-full">
                      <span
                        className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
                        style={{ background: "#2D6A4F" }}
                      >
                        {card.step}
                      </span>
                      <Image
                        src={card.src}
                        alt={card.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  }
                >
                  <h3 className="mgk-h3">{card.title}</h3>
                  <p className="mgk-body" style={{ marginTop: 8 }}>
                    {card.desc}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* FEATURES */}
        <Section id="features" tone="pale">
          <Container>
            <div className="mgk-sec-head">
              <h2 className="mgk-h2">Everything your child needs to become a typing champion</h2>
              <p className="mgk-lead">
                Lessons, rewards, and motivation — all designed to keep kids practicing every day.
              </p>
            </div>
            <div className="mgk-grid-3">
              {FEATURES.map((card) => (
                <Card
                  key={card.tag}
                  media={
                    <div className="relative aspect-square w-full">
                      <Image
                        src={card.src}
                        alt={card.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  }
                >
                  <span style={TAG_STYLE}>{card.tag}</span>
                  <h3 className="mgk-h3">{card.title}</h3>
                  <p className="mgk-body" style={{ marginTop: 8 }}>
                    {card.sentence}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* GAMES */}
        <Section id="games-preview" tone="dark">
          <Container>
            <div className="mgk-sec-head">
              <h2 className="mgk-h2">Learning through play</h2>
              <p className="mgk-lead">5 eco-themed games that make typing practice addictive</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {PREVIEW_GAMES.map((g) => (
                <Card
                  key={g.name}
                  href="/games"
                  media={
                    <div style={{ position: "relative", height: 160 }}>
                      <Image src={g.img} alt="" fill sizes="(max-width: 1024px) 100vw, 20vw" style={{ objectFit: "cover" }} />
                    </div>
                  }
                >
                  <p className="mgk-label" style={{ color: "#1B4332", fontSize: "1.0625rem", fontWeight: 700 }}>
                    {g.name}
                  </p>
                  <p className="mgk-body" style={{ marginTop: 8, fontSize: "0.9375rem" }}>
                    {g.desc}
                  </p>
                </Card>
              ))}
            </div>
            <div className="mgk-btn-row" style={{ marginTop: "var(--mgk-space-5)" }}>
              <SecondaryButton href="/games" onDark>
                Explore all games
              </SecondaryButton>
            </div>
          </Container>
        </Section>

        {/* EARLY ACCESS */}
        <Section>
          <Container>
            <div className="mgk-sec-head">
              <h2 className="mgk-h2">Join us as an early adopter</h2>
              <p className="mgk-lead">Families and schools joining now help shape what we build next</p>
            </div>
            <div className="mgk-grid-3">
              {EARLY_ACCESS.map(({ title, desc, Icon }) => (
                <Card key={title}>
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: "#F0F9F4" }}
                  >
                    <Icon className="h-7 w-7" style={{ color: "#2D6A4F" }} aria-hidden />
                  </div>
                  <h3 className="mgk-h3" style={{ marginTop: 24 }}>
                    {title}
                  </h3>
                  <p className="mgk-body" style={{ marginTop: 8 }}>
                    {desc}
                  </p>
                </Card>
              ))}
            </div>
            <div style={{ marginTop: "var(--mgk-space-5)", textAlign: "center" }}>
              <h3 className="mgk-h3">Be among the first</h3>
              <div className="mgk-btn-row" style={{ marginTop: 24 }}>
                <PrimaryButton href="/signup">Get started free</PrimaryButton>
                <SecondaryButton href="mailto:mygreenkeys26@gmail.com?subject=My%20Green%20Keys%20School%20Demo">
                  Schools: book a demo
                </SecondaryButton>
              </div>
            </div>
          </Container>
        </Section>

        {/* PRICING PREVIEW */}
        <Section tone="pale">
          <Container style={{ textAlign: "center" }}>
            <div className="mgk-sec-head" style={{ marginBottom: 32 }}>
              <h2 className="mgk-h2">Free for every child</h2>
            </div>
            <Card style={{ maxWidth: 640, marginInline: "auto" }} bodyStyle={{ padding: 32 }}>
              <p className="mgk-body">
                Every typing lesson, Brain Sprint, Habit Quest, game, parent dashboard and teacher
                dashboard is free for kids, parents and schools. No plans, no trials, no credit card.
              </p>
              <div className="mgk-btn-row" style={{ marginTop: 24 }}>
                <PrimaryButton href="/signup">Start free</PrimaryButton>
                <SecondaryButton href="/schools">Become a school partner</SecondaryButton>
              </div>
            </Card>
            <p style={{ marginTop: 24 }}>
              <Link href="/pricing" className="hover:underline" style={{ fontWeight: 600, color: "#2D6A4F", textDecoration: "none" }}>
                See everything that&apos;s included →
              </Link>
            </p>
          </Container>
        </Section>

        {/* FINAL CTA */}
        <Section>
          <Container style={{ textAlign: "center" }}>
            <div style={{ maxWidth: 560, marginInline: "auto" }}>
              <h2 className="mgk-h2">Ready to start your child&apos;s typing journey?</h2>
              <div className="mgk-btn-row" style={{ marginTop: 32 }}>
                <PrimaryButton href="/signup">Start free today</PrimaryButton>
                <SecondaryButton href="/pricing">What&apos;s included</SecondaryButton>
              </div>
              <p className="mgk-body" style={{ marginTop: 16, fontSize: "0.875rem" }}>
                Free for every child. No credit card.
              </p>
            </div>
          </Container>
        </Section>
      </div>
    </>
  );
}
