"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Ban,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  Lock,
  Minus,
  Quote,
  Shield,
  Sprout,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getPaddle, onPaddleEvent } from "@/lib/paddle";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { testimonials } from "@/data/testimonials";

const PROMO_CODES: Record<string, { discount: string; type: string; applicable: string[] }> = {
  GREENSTART: { discount: "30% off", type: "percent", applicable: ["Family Plan"] },
  FAMILY2024: { discount: "2 months free", type: "free_months", applicable: ["Family Plan"] },
  SCHOOL100: { discount: "20% off", type: "percent", applicable: ["School Plan"] },
  BACK2SCHOOL: { discount: "50% off first month", type: "percent", applicable: ["School Plan"] },
  WELCOME10: { discount: "10% off", type: "percent", applicable: ["All Plans"] },
};

const FAQ_ITEMS = [
  {
    q: "Can I try before buying?",
    a: "Yes! Start with our free plan — 10 full lessons, no credit card needed.",
  },
  {
    q: "How does the promo code work?",
    a: "Enter your code at checkout or on this page to apply your discount instantly.",
  },
  {
    q: "Can I switch plans anytime?",
    a: "Yes, upgrade or downgrade anytime. Changes take effect immediately.",
  },
  {
    q: "How many children can use one Family account?",
    a: "Up to 3 children per Family plan, each with their own profile and theme.",
  },
  {
    q: "How does the school plan work?",
    a: "Schools get a custom subdomain, teacher dashboard, and branded experience.",
  },
  {
    q: "Is there a free trial for schools?",
    a: "Yes! Contact us for a 30-day free school trial with up to 30 students.",
  },
];

type Cell = "yes" | "no" | string;

const COMPARISON_GROUPS: { category: string; rows: { feature: string; free: Cell; family: Cell; school: Cell }[] }[] =
  [
    {
      category: "Learning",
      rows: [
        { feature: "Typing lessons", free: "10 included", family: "Unlimited", school: "Unlimited" },
        { feature: "Learning modules", free: "1 preview", family: "All 4 modules", school: "All 4 modules" },
        { feature: "Custom lesson text", free: "no", family: "yes", school: "yes" },
        { feature: "WPM & accuracy tracking", free: "yes", family: "yes", school: "yes" },
      ],
    },
    {
      category: "Family & engagement",
      rows: [
        { feature: "Parent dashboard", free: "no", family: "yes", school: "yes" },
        { feature: "Child profiles", free: "1", family: "Up to 3", school: "Up to 200 students" },
        { feature: "Badges, streaks & rewards", free: "no", family: "yes", school: "yes" },
        { feature: "Eco photo rewards", free: "no", family: "yes", school: "yes" },
        { feature: "Weekly progress reports", free: "no", family: "yes", school: "yes" },
      ],
    },
    {
      category: "School & classroom",
      rows: [
        { feature: "Teacher dashboard", free: "no", family: "no", school: "yes" },
        { feature: "Class leaderboard", free: "no", family: "no", school: "yes" },
        { feature: "School branding", free: "no", family: "no", school: "yes" },
        { feature: "Lesson library", free: "no", family: "no", school: "yes" },
        { feature: "Admin dashboard", free: "no", family: "no", school: "yes" },
        { feature: "Priority support", free: "no", family: "no", school: "yes" },
      ],
    },
  ];

const FREE_FEATURES = [
  "10 full typing lessons",
  "Basic keyboard guide",
  "WPM & accuracy tracking",
  "1 eco module preview",
  "Progress saved to your account",
  "Kid-safe, ad-free experience",
  "No credit card required",
  "Upgrade anytime in one click",
];

const FAMILY_FEATURES = [
  "Unlimited typing lessons",
  "All 4 learning modules",
  "Parent dashboard & insights",
  "Custom lessons you write",
  "Badges, streaks & rewards",
  "Eco photo upload rewards",
  "Weekly email progress reports",
  "Up to 3 child profiles",
  "Pink & blue themes",
  "7-day free trial",
  "Cancel anytime",
  "Priority email support",
];

const SCHOOL_STARTER_FEATURES = [
  "Everything in Family",
  "Teacher dashboard",
  "Custom lessons by teacher",
  "Class leaderboard",
  "School logo & branding",
  "Shared lesson library",
  "Admin dashboard access",
  "Priority onboarding support",
  "Get started from $149/month",
];

const SCHOOL_GROWTH_FEATURES = [
  "Everything in School Starter",
  "Up to 200 students",
  "Expanded reporting & insights",
  "Priority & onboarding support",
  "Volume pricing options",
  "Ideal for multi-class schools",
];

const ENTERPRISE_FEATURES = [
  "Everything in School Growth",
  "District-wide deployment",
  "SSO & advanced security",
  "Dedicated success manager",
  "Custom integrations & SLAs",
  "Contract & volume pricing",
];

const TRUST_SIGNALS = [
  { Icon: Lock, label: "COPPA" },
  { Icon: Shield, label: "GDPR" },
  { Icon: Lock, label: "SSL" },
  { Icon: Ban, label: "No Ads" },
] as const;

function splitPrice(price: string) {
  const [dollarsRaw, centsRaw] = price.split(".");
  const dollars = dollarsRaw || "0";
  const cents = (centsRaw || "00").padEnd(2, "0").slice(0, 2);
  return { dollars, cents };
}

function GradientPrice({
  price,
  className,
}: {
  price: string;
  className?: string;
}) {
  const { dollars, cents } = splitPrice(price);
  return (
    <div className={cn("flex items-baseline justify-center", className)}>
      <span className="text-6xl font-bold text-white">${dollars}</span>
      <span className="text-3xl font-bold text-white">.{cents}</span>
      <span className="ml-2 text-lg text-white/80">/month</span>
    </div>
  );
}

function LightCardPrice({ price }: { price: string }) {
  const { dollars, cents } = splitPrice(price);
  return (
    <div className="flex items-baseline">
      <span className="text-6xl font-bold text-[#1B4332]">${dollars}</span>
      <span className="text-3xl font-bold text-[#1B4332]">.{cents}</span>
      <span className="ml-2 text-lg text-[#4A6355]">/month</span>
    </div>
  );
}

function CompareCell({ value }: { value: Cell }) {
  if (value === "yes") {
    return (
      <span className="inline-flex justify-center text-[#52B788]" aria-label="Included">
        <CheckCircle2 className="h-5 w-5 stroke-[2.25]" strokeLinecap="round" strokeLinejoin="round" />
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="inline-flex justify-center text-gray-300" aria-hidden>
        <Minus className="h-5 w-5 stroke-[2.25]" strokeLinecap="round" strokeLinejoin="round" />
      </span>
    );
  }
  return <span className="text-sm text-gray-700">{value}</span>;
}

function PricingToggle({
  isYearly,
  onChange,
}: {
  isYearly: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center gap-1 rounded-full border border-[#D1E8DC] bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            !isYearly ? "bg-[#1B4332] text-white" : "bg-transparent text-[#4A6355] hover:bg-[#F0F9F4]"
          )}
          aria-pressed={!isYearly}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            isYearly ? "bg-[#1B4332] text-white" : "bg-transparent text-[#4A6355] hover:bg-[#F0F9F4]"
          )}
          aria-pressed={isYearly}
        >
          <span className="inline-flex items-center gap-2">
            Yearly
            <span className="rounded-full bg-[#E8F5EE] px-2 py-0.5 text-xs font-semibold text-[#1B4332]">
              Save 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-3 rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="text-base font-bold text-[#1B4332] md:text-lg">{question}</span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-[#4A6355] transition-transform", isOpen && "rotate-180")}
          aria-hidden
        />
      </button>
      {isOpen ? (
        <p className="mt-3 border-t border-gray-100 pt-3 text-sm leading-relaxed text-[#4A6355]">{answer}</p>
      ) : null}
    </div>
  );
}

const primaryCardBase =
  "relative flex h-full flex-col rounded-3xl p-8 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl md:p-10";

const secondaryCardBase =
  "relative flex h-full flex-col rounded-3xl border border-[#D1E8DC] bg-white p-8 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl md:p-10";

const tierEyebrow =
  "mb-3 text-center text-xs font-bold uppercase tracking-widest text-white/80";

const tierEyebrowMuted = "mb-3 text-center text-xs font-bold uppercase tracking-widest text-[#4A6355]";

function PricingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const ecoGardenExpired = source === "eco_garden_expired";
  const familyPlanRef = useRef<HTMLDivElement | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const priceIds = useMemo(() => {
    const family = process.env.NEXT_PUBLIC_PADDLE_FAMILY_PRICE_ID || "";
    const schoolStarter = process.env.NEXT_PUBLIC_PADDLE_SCHOOL_STARTER_PRICE_ID || "";
    const schoolGrowth = process.env.NEXT_PUBLIC_PADDLE_SCHOOL_GROWTH_PRICE_ID || "";
    return { family, schoolStarter, schoolGrowth };
  }, []);

  useEffect(() => {
    const unsub = onPaddleEvent(async (event) => {
      if (event?.name !== "checkout.completed") return;
      const payload = event.data as { transaction_id?: string };
      const transactionId = payload?.transaction_id;
      if (!transactionId) return;

      try {
        const res = await fetch("/api/paddle/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId }),
        });
        const json = (await res.json()) as { error?: string; redirectTo?: string };
        if (!res.ok) throw new Error(json?.error || "Failed to finalize purchase");
        router.push(json.redirectTo || "/dashboard/parent");
      } catch (err) {
        setCheckoutError(err instanceof Error ? err.message : "Failed to finalize purchase");
      }
    });
    return unsub;
  }, [router]);

  const openCheckout = async (planType: "family" | "school_starter" | "school_growth") => {
    setCheckoutError("");
    setCheckoutBusy(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        router.push("/signup");
        return;
      }

      const priceId =
        planType === "family"
          ? priceIds.family
          : planType === "school_starter"
            ? priceIds.schoolStarter
            : priceIds.schoolGrowth;

      if (!priceId) {
        throw new Error("Missing Paddle price ID configuration for this plan.");
      }

      const checkoutRes = await fetch("/api/paddle/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planType }),
      });
      const checkoutJson = (await checkoutRes.json()) as { error?: string; transactionId?: string };
      if (!checkoutRes.ok) {
        throw new Error(checkoutJson?.error || "Failed to start checkout");
      }

      const transactionId = checkoutJson.transactionId;
      if (!transactionId) {
        throw new Error("Checkout did not return a transaction ID.");
      }

      const paddle = await getPaddle();
      if (!paddle) {
        throw new Error("Failed to initialize Paddle.");
      }

      paddle.Checkout.open({
        transactionId,
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
        },
      });
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Failed to start checkout");
    } finally {
      setCheckoutBusy(false);
    }
  };

  const handlePromoCode = () => {
    const code = promoCode.toUpperCase();
    if (PROMO_CODES[code]) {
      const codeInfo = PROMO_CODES[code];
      setPromoResult({
        type: "success",
        message: `${code} applied! You get ${codeInfo.discount}`,
      });
    } else {
      setPromoResult({
        type: "error",
        message: "Invalid code. Please try again.",
      });
    }
    setTimeout(() => setPromoResult(null), 3000);
  };

  const familyDisplayPrice = isYearly ? "7.99" : "9.99";
  const schoolDisplayPrice = "149.00";
  const schoolGrowthDisplayPrice = "299.00";

  useEffect(() => {
    if (!ecoGardenExpired || !familyPlanRef.current) return;
    const t = window.setTimeout(() => {
      familyPlanRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(t);
  }, [ecoGardenExpired]);

  const ctaWhite =
    "mt-auto w-full rounded-full bg-white px-6 py-3 text-center text-sm font-bold text-[#1B4332] shadow-sm transition hover:bg-white/95 hover:brightness-105 disabled:opacity-60";

  return (
    <div
      className="min-h-screen antialiased text-gray-900"
      style={{
        backgroundColor: "#FAFAF7",
        backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          paddingLeft: "32px",
          paddingRight: "32px",
          paddingTop: "60px",
          paddingBottom: "60px",
        }}
      >
      {/* Hero */}
      <section style={{ marginBottom: "80px" }} className="pb-12 pt-20 text-center md:pb-16 md:pt-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-bold leading-tight text-[#1B4332] md:text-5xl lg:text-6xl">
            Pricing that grows with you
          </h1>
          <p className="mb-8 text-lg text-[#4A6355] md:text-xl">
            Free forever for trying out. Upgrade when ready. No hidden fees.
          </p>
          <div className="mb-12 flex justify-center md:mb-16">
            <PricingToggle isYearly={isYearly} onChange={setIsYearly} />
          </div>
        </div>
      </section>

      {/* Main pricing cards */}
      <section style={{ marginBottom: "80px" }} className="pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {ecoGardenExpired ? (
            <div
              className="mb-8 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-center sm:text-left"
              role="status"
            >
              <Sprout className="mx-auto h-8 w-8 shrink-0 text-[#52B788] sm:mx-0" strokeWidth={2} aria-hidden />
              <p className="text-base font-semibold text-[#1B4332]">
                Your garden is waiting. Upgrade to keep your plants growing.
              </p>
            </div>
          ) : null}
          {checkoutError ? (
            <div
              className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              role="alert"
            >
              {checkoutError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Free */}
            <div
              className={cn(
                primaryCardBase,
                "bg-gradient-to-br from-[#52B788] to-[#40916C] text-white"
              )}
            >
              <p className={tierEyebrow}>FREE</p>
              <div className="mt-4 flex justify-center">
                <span className="text-6xl font-bold text-white">$0</span>
              </div>
              <p className="mt-4 text-center text-base leading-relaxed text-white/95">
                For families wanting to try Green Keys for an unlimited period of time
              </p>
              <Link href="/signup" className={cn(ctaWhite, "mt-6 inline-flex items-center justify-center no-underline")}>
                Start free
              </Link>
              <div className="my-6 border-t border-white/20" />
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/80">What&apos;s included:</p>
              <ul className="flex flex-1 flex-col gap-2.5">
                {FREE_FEATURES.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-white/95">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-white" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Family — Most Popular */}
            <div
              ref={familyPlanRef}
              id="pricing-family-plan"
              className={cn(
                primaryCardBase,
                "bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white",
                ecoGardenExpired && "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#FAFAF7]"
              )}
            >
              <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1B4332] shadow-lg">
                MOST POPULAR
              </span>
              <p className={tierEyebrow}>FAMILY</p>
              <div className="mt-4">
                <GradientPrice price={familyDisplayPrice} />
              </div>
              <p className="mt-4 text-center text-base leading-relaxed text-white/95">
                For families who want unlimited lessons and full features
              </p>
              <button type="button" className={cn(ctaWhite, "mt-6")} disabled={checkoutBusy} onClick={() => void openCheckout("family")}>
                {checkoutBusy ? "Loading…" : "Choose Family"}
              </button>
              <div className="my-6 border-t border-white/20" />
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/80">What&apos;s included:</p>
              <ul className="flex flex-1 flex-col gap-2.5">
                {FAMILY_FEATURES.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-white/95">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-white" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* School */}
            <div
              className={cn(
                primaryCardBase,
                "bg-gradient-to-br from-[#0E7490] to-[#0891B2] text-white"
              )}
            >
              <p className={tierEyebrow}>SCHOOL</p>
              <div className="mt-4">
                <GradientPrice price={schoolDisplayPrice} />
              </div>
              <p className="mt-4 text-center text-base leading-relaxed text-white/95">
                For classrooms and teachers managing students at scale
              </p>
              <button
                type="button"
                className={cn(ctaWhite, "mt-6")}
                disabled={checkoutBusy}
                onClick={() => void openCheckout("school_starter")}
              >
                {checkoutBusy ? "Loading…" : "Choose School"}
              </button>
              <div className="my-6 border-t border-white/20" />
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/80">What&apos;s included:</p>
              <ul className="flex flex-1 flex-col gap-2.5">
                {SCHOOL_STARTER_FEATURES.filter((t) => t !== "Everything in Family").map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-white/95">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-white" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-[#4A6355] md:mt-20">
            {TRUST_SIGNALS.map((s) => (
              <div key={s.label} className="inline-flex items-center gap-2">
                <s.Icon className="h-4 w-4 text-[#52B788]" strokeWidth={2.25} aria-hidden />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For larger schools */}
      <section style={{ marginBottom: "80px" }} className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-[#1B4332] md:text-4xl">For larger schools</h2>
            <p className="text-[#4A6355]">Scale with confidence</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className={secondaryCardBase}>
                <p className={tierEyebrowMuted}>SCHOOL GROWTH</p>
                <div className="mt-4">
                  <LightCardPrice price={schoolGrowthDisplayPrice} />
                </div>
                <div className="mt-4 flex flex-wrap items-end gap-2">
                  <span className="text-4xl font-bold text-[#1B4332]">200</span>
                  <span className="text-sm font-medium text-[#4A6355]">students</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#4A6355]">For schools scaling their program</p>
                <button
                  type="button"
                  className="mt-8 w-full rounded-full bg-[#1B4332] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2D6A4F] disabled:opacity-60"
                  disabled={checkoutBusy}
                  onClick={() => void openCheckout("school_growth")}
                >
                  {checkoutBusy ? "Loading…" : "Choose Growth"}
                </button>
                <div className="my-6 border-t border-[#D1E8DC]" />
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#4A6355]">What&apos;s included:</p>
                <ul className="space-y-2.5">
                  {SCHOOL_GROWTH_FEATURES.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-sm text-[#1B4332]">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#52B788]" aria-hidden />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={secondaryCardBase}>
                <p className={tierEyebrowMuted}>ENTERPRISE</p>
                <div className="mt-4">
                  <span className="text-6xl font-bold text-[#1B4332]">Custom</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#4A6355]">Districts & multi-campus schools</p>
                <a
                  href="mailto:sales@mygreenkeys.com?subject=Enterprise%20plan%20inquiry"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "mt-8 w-full rounded-full border-2 border-[#1B4332] bg-transparent py-3 text-sm font-bold text-[#1B4332] hover:bg-[#F0F9F4]"
                  )}
                >
                  Contact enterprise sales
                </a>
                <div className="my-6 border-t border-[#D1E8DC]" />
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#4A6355]">What&apos;s included:</p>
                <ul className="space-y-2.5">
                  {ENTERPRISE_FEATURES.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-sm text-[#1B4332]">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#52B788]" aria-hidden />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
          </div>
        </div>
      </section>

      {/* Promo codes */}
      <section style={{ marginBottom: "80px" }} className="py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-3 text-xl font-bold text-[#1B4332]">Have a promo code?</h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <Input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code"
                  className="h-auto flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus-visible:border-[#52B788] focus-visible:ring-2 focus-visible:ring-[#52B788]/20"
                />
                <Button
                  type="button"
                  onClick={handlePromoCode}
                  className="h-auto rounded-xl bg-[#52B788] px-6 py-3 text-base font-bold text-white hover:bg-[#40916C]"
                >
                  Apply
                </Button>
              </div>
              {promoResult ? (
                <div
                  className={cn(
                    "mt-3 rounded-xl border px-3 py-2 text-sm",
                    promoResult.type === "success"
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-800"
                  )}
                  role="status"
                >
                  {promoResult.message}
                </div>
              ) : null}
              <div className="mt-5 text-sm text-slate-500">
                <p className="mb-2 font-medium text-slate-600">Available codes</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PROMO_CODES).map(([code, info]) => (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#E8F5EE] px-2 py-1 font-mono text-sm text-[#1B4332]"
                      title={`${info.discount} — ${info.applicable.join(", ")}`}
                    >
                      {code}
                    </span>
                  ))}
                </div>
                <ul className="mt-3 list-none space-y-1 text-xs text-slate-500">
                  {Object.entries(PROMO_CODES).map(([code, info]) => (
                    <li key={code}>
                      <span className="font-mono text-[#4A6355]">{code}</span> — {info.discount} ({info.applicable.join(", ")})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
        </div>
      </section>

      {testimonials.length > 0 ? (
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h3 className="mb-8 text-center text-2xl font-bold text-[#1B4332]">What educators are saying</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {testimonials.slice(0, 2).map((t) => (
                <div key={t.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <Quote className="mb-3 h-6 w-6 text-[#52B788]" />
                  <p className="mb-4 text-[#4A6355]">&ldquo;{t.quote}&rdquo;</p>
                  <div className="text-sm">
                    <div className="font-semibold text-[#1B4332]">{t.author}</div>
                    <div className="text-[#4A6355]">
                      {t.role}
                      {t.organization ? ` • ${t.organization}` : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Feature comparison */}
      <section style={{ marginBottom: "80px" }} className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-[#1B4332] md:text-4xl">Compare every feature</h2>
            <p className="text-[#4A6355]">Side-by-side feature breakdown</p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white p-6 shadow-xl md:p-10">
            <div className="min-w-[720px] overflow-hidden rounded-2xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="rounded-t-2xl bg-[#1B4332] text-white">
                    <th className="pl-6 pr-4 py-4 text-xs font-bold uppercase tracking-wider">Feature</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Free</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Family</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">School</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                    <td className="pl-6 pr-4 py-3 font-medium text-gray-700">Price (monthly)</td>
                    <td className="px-6 py-3 text-center text-sm text-gray-700">$0</td>
                    <td className="bg-[#F0F9F4] px-6 py-3 text-center text-sm text-gray-700">$9.99/mo</td>
                    <td className="px-6 py-3 text-center text-sm text-gray-700">$149/mo (Starter)</td>
                  </tr>
                  {COMPARISON_GROUPS.map((group) => (
                    <React.Fragment key={group.category}>
                      <tr className="bg-[#F8FAF5]">
                        <td
                          colSpan={4}
                          className="pl-6 py-3 pr-4 text-xs font-bold uppercase tracking-wider text-[#1B4332]"
                        >
                          {group.category.toUpperCase()}
                        </td>
                      </tr>
                      {group.rows.map((row) => (
                        <tr key={row.feature} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                          <td className="pl-6 pr-4 py-3 font-medium text-gray-700">{row.feature}</td>
                          <td className="px-6 py-3 text-center">
                            <CompareCell value={row.free} />
                          </td>
                          <td className="bg-[#F0F9F4] px-6 py-3 text-center">
                            <CompareCell value={row.family} />
                          </td>
                          <td className="px-6 py-3 text-center">
                            <CompareCell value={row.school} />
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-center text-sm text-[#4A6355]">
              School Growth (up to 200 students) is <strong className="font-semibold text-[#1B4332]">$299/mo</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: "80px" }} className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-[#1B4332] md:text-4xl">Frequently asked questions</h2>
            <p className="text-[#4A6355]">Everything you need to know before you subscribe</p>
          </div>
          <div>
            {FAQ_ITEMS.slice(0, 6).map((faq, idx) => (
              <FaqItem
                key={faq.q}
                question={faq.q}
                answer={faq.a}
                isOpen={openFaqIndex === idx}
                onToggle={() => setOpenFaqIndex((prev) => (prev === idx ? null : idx))}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ marginBottom: "0" }} className="pb-20 md:pb-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-12 text-center md:p-16"
            style={{
              background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)",
            }}
          >
            <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">Ready to start?</h2>
            <p className="mb-8 text-lg text-white/90">Free forever for the first 10 lessons. No credit card.</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-10 py-3.5 text-base font-bold text-[#1B4332] transition hover:scale-105"
              >
                Start Free
              </Link>
              <a
                href="mailto:sales@mygreenkeys.com?subject=Sales%20inquiry"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-white bg-transparent px-10 py-3.5 text-base font-bold text-white transition hover:bg-white hover:text-[#1B4332]"
              >
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen antialiased"
          style={{
            fontFamily: "var(--font-nunito), ui-sans-serif, system-ui, sans-serif",
            backgroundColor: "#FAFAF7",
            backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
      }
    >
      <PricingPageContent />
    </Suspense>
  );
}
