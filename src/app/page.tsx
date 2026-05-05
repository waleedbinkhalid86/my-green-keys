"use client";

import Image from "next/image";
import Link from "next/link";
import { Ban, Leaf, Lock, Menu, MessageSquare, School, Shield, Users } from "lucide-react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BTN_PRIMARY =
  "inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-md text-base font-bold whitespace-nowrap transition-colors shadow-sm hover:shadow-md";

const BTN_SECONDARY =
  "inline-flex items-center justify-center bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-900 px-8 py-4 rounded-md text-base font-bold whitespace-nowrap transition-colors";

const BTN_NAV =
  "inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md text-sm font-semibold whitespace-nowrap";

const CARD_DEFAULT =
  "bg-white rounded-md border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full";

const CARD_IMAGE =
  "bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full";

const CARD_HIGHLIGHT = "border-green-500 border-2 ring-2 ring-green-500/20";

const DOT_GRID =
  "bg-[#FAFAFA] text-gray-900 antialiased bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:18px_18px]";

const SECTION_PAD = "py-24 md:py-28 lg:py-32";

const TRUST_SECTION_PAD = "py-12 md:py-12 lg:py-12";

const SECTION_TITLE =
  "text-center text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4";

const SECTION_SUB =
  "text-center text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-16";

const PREVIEW_GAMES = [
  {
    name: "Falling Leaves",
    desc: "Catch leaves by typing words",
    img: "/images/games/game-falling-leaves.jpg",
    href: "/games/falling-leaves",
  },
  {
    name: "Sort Recycling",
    desc: "Sort waste into the right bins",
    img: "/images/games/game-sort-recycling.jpg",
    href: "/games/sort-recycling",
  },
  {
    name: "Save the Ocean",
    desc: "Free the turtle with fast typing",
    img: "/images/games/game-save-ocean.jpg",
    href: "/games/save-the-ocean",
  },
  {
    name: "Eco Garden",
    desc: "Grow a garden with every key",
    img: "/images/games/game-eco-garden.jpg",
    href: "/games/eco-garden",
  },
  {
    name: "Kind World Academy",
    desc: "Spread kindness around the world",
    img: "/images/games/game-kind-world.jpg",
    href: "/games/kind-world",
  },
] as const;

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [demoModalOpen, setDemoModalOpen] = React.useState(false);

  return (
    <>
      <Dialog open={demoModalOpen} onOpenChange={setDemoModalOpen}>
        <DialogContent className="rounded-md sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Demo video coming soon</DialogTitle>
            <DialogDescription>
              Demo video coming soon. Sign up free to try the product right now.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Link href="/signup" className={BTN_PRIMARY} onClick={() => setDemoModalOpen(false)}>
              Sign Up Free
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#1A2F23] text-white">
        <div className="mgk-container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-green-500">
              <Leaf className="h-5 w-5 text-white" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="text-lg font-bold text-white">My Green Keys</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
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

          <div className="flex items-center gap-4">
            <Link href="/login" className="nav-link hidden md:inline">
              Log In
            </Link>
            <Link href="/signup" className={BTN_NAV}>
              Start Free Today
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-white/90 hover:bg-white/10 hover:text-white md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-6 w-6" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-white/10 md:hidden">
            <div className="mgk-container py-4">
              <div className="flex flex-col gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <a
                  href="#how-it-works"
                  className="nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How it works
                </a>
                <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </a>
                <a
                  href="#games-preview"
                  className="nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
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
        ) : null}
      </nav>

      <section className="relative flex min-h-[700px] w-full items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/images/homepage/homepage-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" aria-hidden />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-24 text-center md:px-6">
          <div className="mb-6">
            <span className="inline-flex rounded-md bg-green-500 px-3 py-1 text-xs font-semibold text-white">
              Now in early access for schools and families
            </span>
          </div>

          <h1 className="mb-6 text-5xl font-black leading-tight text-white drop-shadow-lg md:text-7xl">
            Learn to Type.
            <br />
            Help the Planet.
          </h1>

          <div className="mb-8 max-w-2xl rounded-md bg-white/95 px-8 py-5 backdrop-blur-sm">
            <p className="text-base font-medium leading-relaxed text-gray-900 md:text-lg">
              Built for{" "}
              <span className="bg-[#FFD700] px-1 py-0.5 text-gray-900">ages 6-14</span>.{" "}
              <span className="bg-[#FFD700] px-1 py-0.5 text-gray-900">100 lessons</span>,{" "}
              <span className="bg-[#FFD700] px-1 py-0.5 text-gray-900">5 games</span>, and a{" "}
              <span className="bg-[#FFD700] px-1 py-0.5 text-gray-900">virtual pet</span> that needs
              your child to type daily.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup" className={BTN_PRIMARY}>
              Start Free Today
            </Link>
            <button type="button" className={BTN_SECONDARY} onClick={() => setDemoModalOpen(true)}>
              Watch Demo
            </button>
          </div>

          <p className="mt-6 text-sm text-white/80">No credit card required. Free forever.</p>
        </div>
      </section>

      <div className={DOT_GRID}>
        <section className={TRUST_SECTION_PAD}>
          <div className="mgk-container text-center">
            <p className="mb-8 text-sm font-medium uppercase tracking-wider text-gray-500">
              Privacy and safety built in
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700">
                <Shield className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
                COPPA Compliant
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700">
                <Lock className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
                GDPR Safe
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700">
                <Ban className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
                Ad-Free
              </span>
            </div>
          </div>
        </section>

        <section id="how-it-works" className={SECTION_PAD}>
          <div className="mgk-container">
            <h2 className={SECTION_TITLE}>Learning that actually works</h2>
            <p className={SECTION_SUB}>Three steps to a kid who loves typing</p>
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
                <article key={card.step} className={CARD_IMAGE}>
                  <div className="relative aspect-[4/3] w-full">
                    <span className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-lg font-bold text-white">
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
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-3 text-xl font-bold text-gray-900">{card.title}</h3>
                    <p className="flex-1 text-base leading-relaxed text-gray-600">{card.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className={SECTION_PAD}>
          <div className="mgk-container">
            <h2 className={SECTION_TITLE}>Everything your child needs to become a typing champion</h2>
            <p className={SECTION_SUB}>100 lessons. 5 games. One growing pet.</p>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
                <article key={card.tag} className={CARD_IMAGE}>
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={card.src}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="mb-4 inline-flex w-fit rounded-md bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-700">
                      {card.tag}
                    </span>
                    <h3 className="mb-3 text-xl font-bold text-gray-900">{card.title}</h3>
                    <p className="flex-1 text-base leading-relaxed text-gray-600">{card.sentence}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="games-preview" className={SECTION_PAD}>
          <div className="mgk-container">
            <h2 className={SECTION_TITLE}>Learning through play</h2>
            <p className={SECTION_SUB}>
              5 eco-themed games. Real typing skills. Hidden challenges.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {PREVIEW_GAMES.map((g) => (
                <Link
                  key={g.name}
                  href={g.href}
                  className={`${CARD_IMAGE} no-underline text-inherit`}
                >
                  <div className="relative aspect-[4/3] w-full">
                    <Image src={g.img} alt="" fill sizes="280px" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-lg font-bold text-gray-900">{g.name}</h3>
                    <p className="mt-1 flex-1 text-sm text-gray-600">{g.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <Link href="/games" className={BTN_SECONDARY}>
                Explore All Games
              </Link>
            </div>
          </div>
        </section>

        <section className={SECTION_PAD}>
          <div className="mgk-container">
            <h2 className={SECTION_TITLE}>Join us as an early adopter</h2>
            <p className={SECTION_SUB}>Founding members get lifetime benefits.</p>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
                <article key={title} className={CARD_DEFAULT}>
                  <div className="mb-6 h-1 w-12 bg-green-500" aria-hidden />
                  <Icon className="mb-4 h-12 w-12 text-green-600" aria-hidden />
                  <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
                  <p className="flex-1 text-base leading-relaxed text-gray-600">{desc}</p>
                </article>
              ))}
            </div>
            <div className="mt-16 text-center">
              <h3 className="mb-6 text-2xl font-bold text-gray-900">Be among the first</h3>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup" className={BTN_PRIMARY}>
                  Get Started Free
                </Link>
                <a
                  href="mailto:waleedbinkhalid86@gmail.com?subject=My%20Green%20Keys%20School%20Demo"
                  className={BTN_SECONDARY}
                >
                  Schools: Book a Demo
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={SECTION_PAD}>
          <div className="mgk-container">
            <h2 className={SECTION_TITLE}>Simple pricing for every family</h2>
            <p className={SECTION_SUB}>Start free. Upgrade when ready.</p>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <article className={CARD_DEFAULT}>
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-green-600">
                  Free
                </p>
                <p className="text-5xl font-bold text-gray-900">
                  $0{" "}
                  <span className="text-base font-normal text-gray-500">/forever</span>
                </p>
                <p className="my-6 flex-1 text-sm text-gray-600">
                  10 lessons, progress tracking, kid-safe.
                </p>
                <Link href="/signup" className={`${BTN_SECONDARY} w-full`}>
                  Start free
                </Link>
              </article>

              <article className={`${CARD_DEFAULT} ${CARD_HIGHLIGHT} relative`}>
                <div className="mb-4 flex justify-center">
                  <span className="rounded-md bg-green-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Most Popular
                  </span>
                </div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-green-600">
                  Family Plan
                </p>
                <p className="text-5xl font-bold text-gray-900">
                  $9.99 <span className="text-base font-normal text-gray-500">/mo</span>
                </p>
                <p className="my-6 flex-1 text-sm text-gray-600">
                  Unlimited lessons, parent dashboard, eco rewards.
                </p>
                <Link href="/pricing" className={`${BTN_PRIMARY} w-full`}>
                  View Family Plan
                </Link>
              </article>

              <article className={CARD_DEFAULT}>
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-green-600">
                  School Starter
                </p>
                <p className="text-5xl font-bold text-gray-900">
                  $49 <span className="text-base font-normal text-gray-500">/mo</span>
                </p>
                <p className="my-6 flex-1 text-sm text-gray-600">
                  Classroom access, teacher dashboard, student progress tracking.
                </p>
                <Link href="/pricing" className={`${BTN_SECONDARY} w-full`}>
                  View School Plan
                </Link>
              </article>
            </div>
            <p className="mt-12 text-center">
              <Link
                href="/pricing"
                className="text-base font-bold text-green-600 hover:text-green-700 hover:underline"
              >
                See all plans →
              </Link>
            </p>
          </div>
        </section>

        <section className={SECTION_PAD}>
          <div className="mgk-container">
            <div className="mx-auto max-w-3xl rounded-md bg-gray-900 p-12 text-center text-white">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ready to start your child&apos;s typing journey?
              </h2>
              <p className="mb-8 text-base text-gray-300">
                Free forever for first 10 lessons. No credit card.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-bold text-gray-900 whitespace-nowrap transition-colors hover:bg-gray-100"
                >
                  Start Free Today
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-md border border-gray-700 px-8 py-4 text-base font-bold text-white whitespace-nowrap transition-colors hover:border-gray-600"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
