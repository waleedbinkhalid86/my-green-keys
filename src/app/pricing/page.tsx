"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Ban, Check, ChevronDown, Lock, Quote, Shield, Sprout } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getPaddle, onPaddleEvent } from "@/lib/paddle";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { testimonials } from "@/data/testimonials";

const LeafIconCustom = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary-foreground"
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

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
  "Get started from $299/month",
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

function PricingNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/85 backdrop-blur">
      <div className="mgk-container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex size-9 items-center justify-center rounded-md bg-gray-900 text-white">
            <LeafIconCustom />{" "}
          </div>
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            My Green Keys
          </span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {["Features", "Modules", "Schools"].map((l) => (
            <Link
              key={l}
              href={`/#${l.toLowerCase()}`}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {l}
            </Link>
          ))}
          <Link href="/pricing" className="text-sm font-semibold text-gray-900">
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 md:inline"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-md border border-gray-300 bg-white font-medium text-gray-900 hover:bg-gray-50"
            )}
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}

function CompareCell({ value }: { value: Cell }) {
  if (value === "yes") {
    return (
      <span className="inline-flex text-[#2ECC71]" aria-label="Included">
        <Check className="size-5 stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round" />
      </span>
    );
  }
  if (value === "no") {
    return <span className="text-lg font-light text-[#9CA3AF]">—</span>;
  }
  return <span className="text-sm text-[#374151]">{value}</span>;
}

const cardShell = "flex h-full flex-col rounded-md bg-white p-8 border border-gray-200 transition-colors hover:border-gray-300";

function PricingToggle({
  isYearly,
  onChange,
}: {
  isYearly: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center gap-1 rounded-md bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            !isYearly ? "bg-gray-900 text-white" : "bg-transparent text-gray-700 hover:bg-gray-200"
          )}
          aria-pressed={!isYearly}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            isYearly ? "bg-gray-900 text-white" : "bg-transparent text-gray-700 hover:bg-gray-200"
          )}
          aria-pressed={isYearly}
        >
          <span className="inline-flex items-center gap-2">
            Yearly
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Save 20%</span>
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
    <div className="rounded-md border border-gray-200 bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-gray-900">{question}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", isOpen && "rotate-180")}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden px-6 pb-4 text-sm leading-relaxed text-gray-600">{answer}</div>
      </div>
    </div>
  );
}

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

  useEffect(() => {
    if (!ecoGardenExpired || !familyPlanRef.current) return;
    const t = window.setTimeout(() => {
      familyPlanRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(t);
  }, [ecoGardenExpired]);

  return (
    <div
      className={cn(
        "min-h-screen w-full bg-[#FAFAFA] antialiased text-gray-900",
        // Same dot-grid background as auth pages (MinimalAuthShell)
        "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:18px_18px]"
      )}
    >
      <PricingNav />

      {/* Hero */}
      <section className="mgk-section text-center">
        <div className="mgk-container">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-green-700">
              Pricing
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
              Pricing that fits every learner
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-gray-600">
              Start free. Upgrade when ready. Cancel anytime.
            </p>
          </div>
          <div className="mt-12">
            <PricingToggle isYearly={isYearly} onChange={setIsYearly} />
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="mgk-section pt-0">
        <div className="mgk-container">
          {ecoGardenExpired ? (
            <div
              className="mb-8 flex flex-wrap items-center justify-center gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-center sm:text-left"
              role="status"
            >
              <Sprout className="mx-auto h-8 w-8 shrink-0 text-green-600 sm:mx-0" strokeWidth={2} aria-hidden />
              <p className="text-base font-semibold text-[#1A2F23]">
                Your garden is waiting. Upgrade to keep your plants growing.
              </p>
            </div>
          ) : null}
          {checkoutError ? (
            <div
              className="mb-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              role="alert"
            >
              {checkoutError}
            </div>
          ) : null}

          <div className="mgk-grid grid-cols-1 md:grid-cols-3">
            {/* Free */}
            <div className={cardShell}>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Free</p>
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <span className="text-5xl font-semibold text-gray-900">$0</span>
                <span className="text-sm text-gray-500">/forever</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Perfect for trying out</p>
              <div className="my-6 border-t border-gray-100" />
              <ul className="space-y-3">
                {FREE_FEATURES.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="h-4 w-4 shrink-0 text-green-600 mt-0.5" aria-hidden />
                    <span className="text-sm text-gray-700">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <button
                  type="button"
                  className="w-full rounded-md bg-gray-100 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-200 disabled:opacity-60"
                  disabled={checkoutBusy}
                  onClick={() => router.push("/signup")}
                >
                  Start free
                </button>
              </div>
            </div>

            {/* Family — Most Popular */}
            <div
              ref={familyPlanRef}
              id="pricing-family-plan"
              className={cn(
                cardShell,
                "relative border-2 border-green-500 hover:border-green-500",
                ecoGardenExpired && "ring-2 ring-yellow-300 ring-offset-2"
              )}
            >
              <div className="absolute right-6 top-6">
                <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                  MOST POPULAR
                </span>
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Family</p>
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <span className="text-5xl font-semibold text-gray-900">${familyDisplayPrice}</span>
                <span className="text-sm text-gray-500">/month</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Perfect for families</p>
              <div className="my-6 border-t border-gray-100" />
              <ul className="space-y-3">
                {FAMILY_FEATURES.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="h-4 w-4 shrink-0 text-green-600 mt-0.5" aria-hidden />
                    <span className="text-sm text-gray-700">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <button
                  type="button"
                  className="w-full rounded-md bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                  disabled={checkoutBusy}
                  onClick={() => void openCheckout("family")}
                >
                  {checkoutBusy ? "Loading…" : "Start 7-day free trial"}
                </button>
              </div>
            </div>

            {/* School Starter */}
            <div className={cardShell}>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">School Starter</p>
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <span className="text-5xl font-semibold text-gray-900">From $299</span>
                <span className="text-sm text-gray-500">/month</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Perfect for classrooms</p>
              <div className="my-6 border-t border-gray-100" />
              <ul className="space-y-3">
                {SCHOOL_STARTER_FEATURES.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="h-4 w-4 shrink-0 text-green-600 mt-0.5" aria-hidden />
                    <span className="text-sm text-gray-700">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  className="w-full rounded-md border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-60"
                  disabled={checkoutBusy}
                  onClick={() => void openCheckout("school_starter")}
                >
                  {checkoutBusy ? "Loading…" : "Get started"}
                </button>
                <a
                  href="mailto:sales@mygreenkeys.com?subject=School%20Starter%20inquiry"
                  className="block w-full rounded-md border border-gray-300 bg-white py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Talk to sales
                </a>
              </div>
            </div>
          </div>

          <div className="mgk-section-tight mt-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">For larger schools</h2>
              <p className="text-sm text-gray-600 mb-8">Scale with confidence</p>
            </div>
            <div className="mgk-grid grid-cols-1 md:grid-cols-2">
              {/* School Growth */}
              <div className={cardShell}>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">School Growth</p>
                <div className="mt-4 flex flex-wrap items-end gap-2">
                  <span className="text-5xl font-semibold text-gray-900">200</span>
                  <span className="text-sm text-gray-500">students</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">For schools scaling their program</p>
                <div className="my-6 border-t border-gray-100" />
                <ul className="space-y-3">
                  {SCHOOL_GROWTH_FEATURES.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 text-green-600 mt-0.5" aria-hidden />
                      <span className="text-sm text-gray-700">{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <button
                    type="button"
                    className="w-full rounded-md border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-60"
                    disabled={checkoutBusy}
                    onClick={() => void openCheckout("school_growth")}
                  >
                    {checkoutBusy ? "Loading…" : "Choose Growth"}
                  </button>
                </div>
              </div>

              {/* Enterprise */}
              <div className={cardShell}>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Enterprise</p>
                <div className="mt-4 flex flex-wrap items-end gap-2">
                  <span className="text-5xl font-semibold text-gray-900">Custom</span>
                  <span className="text-sm text-gray-500">pricing</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">Districts & multi-campus schools</p>
                <div className="my-6 border-t border-gray-100" />
                <ul className="space-y-3">
                  {ENTERPRISE_FEATURES.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 text-green-600 mt-0.5" aria-hidden />
                      <span className="text-sm text-gray-700">{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <a
                    href="mailto:sales@mygreenkeys.com?subject=Enterprise%20plan%20inquiry"
                    className="block w-full rounded-md border border-gray-300 bg-white py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    Contact enterprise sales
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Trust bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-gray-500">
            {TRUST_SIGNALS.map((s) => (
              <div key={s.label} className="inline-flex items-center gap-2">
                <s.Icon className="h-4 w-4 text-gray-400" strokeWidth={2.25} aria-hidden />
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Promo codes */}
          <section className="mt-10">
            <div className="mx-auto max-w-md">
              <h2 className="text-center text-base font-medium text-gray-900">Have a promo code?</h2>
              <div className="mt-4 flex gap-2">
                <Input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code"
                  className="h-10 flex-1 rounded-md border-gray-300 text-sm"
                />
                <Button
                  type="button"
                  onClick={handlePromoCode}
                  className="h-10 rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Apply
                </Button>
              </div>
              {promoResult ? (
                <div
                  className={cn(
                    "mt-3 rounded-md border px-3 py-2 text-sm",
                    promoResult.type === "success"
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-800"
                  )}
                  role="status"
                >
                  {promoResult.message}
                </div>
              ) : null}
              <div className="mt-4 text-xs text-gray-500">
                <p className="font-medium text-gray-700">Available codes</p>
                <div className="mt-2 space-y-1">
                  {Object.entries(PROMO_CODES).map(([code, info]) => (
                    <p key={code}>
                      <span className="font-mono text-gray-700">{code}</span> — {info.discount} ({info.applicable.join(", ")})
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {testimonials.length > 0 ? (
            <section className="mgk-section-tight">
              <div className="mgk-container mx-auto max-w-4xl">
                <h3 className="mb-8 text-center text-2xl font-bold text-gray-900">What educators are saying</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {testimonials.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      className="mgk-card-sm border border-gray-100 p-6"
                    >
                      <Quote className="mb-3 h-6 w-6 text-green-600" />
                      <p className="mb-4 text-gray-700">&ldquo;{t.quote}&rdquo;</p>
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">{t.author}</div>
                        <div className="text-gray-600">
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
        </div>
      </section>

      {/* Feature comparison */}
      <section className="mgk-section-tight">
        <div className="mgk-container">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-gray-900">Compare plans</h2>
          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[720px] overflow-hidden rounded-md border border-gray-200 bg-white">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Feature</th>
                    <th className="px-6 py-3 text-center">Free</th>
                    <th className="px-6 py-3 text-center">Family</th>
                    <th className="px-6 py-3 text-center">School</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_GROUPS.map((group) => (
                    <React.Fragment key={group.category}>
                      <tr className="bg-gray-50">
                        <td
                          colSpan={4}
                          className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-700"
                        >
                          {group.category}
                        </td>
                      </tr>
                      {group.rows.map((row) => (
                        <tr key={row.feature} className="border-t border-gray-100">
                          <td className="px-6 py-3 font-medium text-gray-700">{row.feature}</td>
                          <td className="px-6 py-3 text-center">
                            <CompareCell value={row.free} />
                          </td>
                          <td className="px-6 py-3 text-center">
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
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mgk-section-tight">
        <div className="mgk-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Frequently asked questions</h2>
            <p className="mt-2 text-sm text-gray-600">Everything you need to know before you subscribe</p>
          </div>
          <div className="mx-auto mt-8 max-w-2xl space-y-3">
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
      <section className="mgk-section">
        <div className="mgk-container">
          <div className="rounded-md bg-gray-900 p-12 text-center text-white">
            <h2 className="text-3xl font-semibold">Ready to start?</h2>
            <p className="mt-2 text-sm text-gray-400">Free forever for the first 10 lessons. No credit card.</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-md bg-white px-6 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                Start free
              </Link>
              <a
                href="mailto:sales@mygreenkeys.com?subject=Sales%20inquiry"
                className="inline-flex items-center justify-center rounded-md border border-gray-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Talk to sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen w-full bg-[#FAFAFA] antialiased"
          style={{ fontFamily: "var(--font-nunito), ui-sans-serif, system-ui, sans-serif" }}
        />
      }
    >
      <PricingPageContent />
    </Suspense>
  );
}
