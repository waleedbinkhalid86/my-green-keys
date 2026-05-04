"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Ban, Check, Lock, Plus, Quote, Shield, Sprout } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getPaddle, onPaddleEvent } from "@/lib/paddle";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#1A2F23] shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#2ECC71]">
            <LeafIconCustom />
          </div>
          <span className="text-base font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-nunito)" }}>
            My Green Keys
          </span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {["Features", "Modules", "Schools"].map((l) => (
            <Link
              key={l}
              href={`/#${l.toLowerCase()}`}
              className="text-sm font-medium text-white/85 transition-colors hover:text-[#2ECC71]"
            >
              {l}
            </Link>
          ))}
          <Link href="/pricing" className="text-sm font-semibold text-[#2ECC71]">
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-white/90 hover:text-[#2ECC71] md:inline"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-[50px] border-0 bg-[#2ECC71] font-semibold text-white hover:bg-[#27ae60]"
            )}
          >
            Start Free Trial
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

const pill =
  "inline-flex min-h-[52px] w-full items-center justify-center rounded-[50px] px-6 text-base font-semibold transition-all duration-200 disabled:opacity-60";

const cardShell =
  "flex h-full flex-col rounded-3xl bg-white p-8 shadow-sm transition hover:shadow-lg";

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
      className="min-h-screen w-full bg-[#FAFAFA] antialiased"
      style={{ fontFamily: "var(--font-nunito), ui-sans-serif, system-ui, sans-serif" }}
    >
      <PricingNav />
      <div className="h-[72px]" aria-hidden />

      {/* Hero */}
      <section className="bg-white px-4 pt-[80px] pb-[60px] text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            Now in early access for schools and families
          </div>
          <h1 className="text-[40px] font-black leading-[1.1] tracking-tight text-[#1A2F23] sm:text-[48px]">
            Simple, honest pricing for your child&apos;s future
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#666666]">
            Start free. Upgrade when ready. Cancel anytime. No hidden fees.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Label htmlFor="billing-toggle" className="text-base font-medium text-[#666666]">
              Monthly
            </Label>
            <Switch id="billing-toggle" checked={isYearly} onCheckedChange={setIsYearly} />
            <div className="flex items-center gap-2">
              <Label htmlFor="billing-toggle" className="text-base font-semibold text-[#1A2F23]">
                Yearly
              </Label>
              <span className="rounded-[50px] bg-[#E8F5E9] px-3 py-1 text-xs font-bold text-[#1B5E20]">
                Save 20%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {ecoGardenExpired ? (
            <div
              className="mb-8 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-center sm:text-left"
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
              className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              role="alert"
            >
              {checkoutError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-8 pt-4 lg:grid-cols-3 lg:items-stretch lg:gap-8">
            {/* Free */}
            <div className={cn(cardShell, "border border-[#E5E7EB]")}>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#6B7280]">Free Starter</p>
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <span className="text-[64px] font-bold leading-none text-[#1A2F23]">$0</span>
                <span className="pb-2 text-base text-[#6B7280]">/forever</span>
              </div>
              <p className="mt-3 text-lg text-[#374151]">Perfect for trying out</p>
              <ul className="mt-8 flex grow flex-col gap-3.5 border-t border-[#E5E7EB] pt-8 text-base text-[#374151]">
                {FREE_FEATURES.map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 text-[#2ECC71]" aria-hidden>
                      ✓
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <button
                  type="button"
                  className={cn(
                    pill,
                    "border-2 border-[#2ECC71] bg-white font-bold text-[#1B5E20] hover:bg-[#F0FDF4]"
                  )}
                  disabled={checkoutBusy}
                  onClick={() => router.push("/signup")}
                >
                  Start Free
                </button>
              </div>
            </div>

            {/* Family — Most Popular */}
            <div
              ref={familyPlanRef}
              id="pricing-family-plan"
              className={cn(
                cardShell,
                "relative z-10 border-2 border-[#2ECC71] lg:scale-105",
                ecoGardenExpired && "ring-2 ring-yellow-300 ring-offset-2"
              )}
            >
              <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
                <span className="whitespace-nowrap rounded-full bg-[#2ECC71] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                  MOST POPULAR
                </span>
              </div>
              <p className="mt-5 text-sm font-bold uppercase tracking-[0.12em] text-[#6B7280]">Family Plan</p>
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <span className="text-[64px] font-bold leading-none text-[#1A2F23]">${familyDisplayPrice}</span>
                <span className="pb-2 text-base text-[#6B7280]">/month</span>
              </div>
              <p className="mt-3 text-lg text-[#374151]">Perfect for families</p>
              <ul className="mt-8 flex grow flex-col gap-3.5 border-t border-[#E5E7EB] pt-8 text-base text-[#374151]">
                {FAMILY_FEATURES.map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 text-[#2ECC71]" aria-hidden>
                      ✓
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <button
                  type="button"
                  className={cn(pill, "border-0 bg-[#2ECC71] font-bold text-white hover:bg-[#27ae60]")}
                  disabled={checkoutBusy}
                  onClick={() => void openCheckout("family")}
                >
                  {checkoutBusy ? "Loading…" : "Start 7-Day Free Trial"}
                </button>
              </div>
            </div>

            {/* School Starter */}
            <div className={cn(cardShell, "border border-[#E5E7EB]")}>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#1B5E20]">School Starter</p>
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <span className="text-[48px] font-bold leading-none text-[#1A2F23]">From $299</span>
                <span className="pb-2 text-base text-[#6B7280]">/month</span>
              </div>
              <p className="mt-3 text-lg text-[#374151]">Perfect for classrooms</p>
              <ul className="mt-8 flex grow flex-col gap-3.5 border-t border-[#E5E7EB] pt-8 text-base text-[#374151]">
                {SCHOOL_STARTER_FEATURES.map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 text-[#2ECC71]" aria-hidden>
                      ✓
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-3 pt-8">
                <button
                  type="button"
                  className={cn(pill, "border-0 bg-[#2ECC71] font-bold text-white hover:bg-[#27ae60]")}
                  disabled={checkoutBusy}
                  onClick={() => void openCheckout("school_starter")}
                >
                  {checkoutBusy ? "Loading…" : "Get Started"}
                </button>
                <a
                  href="mailto:sales@mygreenkeys.com?subject=School%20Starter%20inquiry"
                  className={cn(
                    pill,
                    "border-2 border-[#1A2F23] bg-transparent font-extrabold text-[#1A2F23] hover:bg-[#1A2F23]/5"
                  )}
                >
                  Talk to Sales
                </a>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="mb-10 text-center text-2xl font-extrabold tracking-tight text-[#1A2F23] sm:text-3xl">
              For Larger Schools
            </h2>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
              {/* School Growth */}
              <div className={cn(cardShell, "border border-[#E5E7EB]")}>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#1B5E20]">School Growth</p>
                <div className="mt-4">
                  <span className="text-[48px] font-bold leading-none text-[#1A2F23] sm:text-[56px]">200</span>
                  <span className="ml-1.5 text-lg font-semibold text-[#374151]">students</span>
                  <p className="mt-2 text-base text-[#6B7280]">Full cohort capacity</p>
                </div>
                <p className="mt-3 text-lg text-[#374151]">For schools scaling their program</p>
                <ul className="mt-8 flex grow flex-col gap-3.5 border-t border-[#E5E7EB] pt-8 text-base text-[#374151]">
                  {SCHOOL_GROWTH_FEATURES.map((t) => (
                    <li key={t} className="flex gap-3">
                      <span className="mt-0.5 shrink-0 text-[#2ECC71]" aria-hidden>
                        ✓
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <button
                    type="button"
                    className={cn(pill, "border-0 bg-[#2ECC71] font-bold text-white hover:bg-[#27ae60]")}
                    disabled={checkoutBusy}
                    onClick={() => void openCheckout("school_growth")}
                  >
                    {checkoutBusy ? "Loading…" : "Choose Growth"}
                  </button>
                </div>
              </div>

              {/* Enterprise */}
              <div className={cn(cardShell, "border border-[#E5E7EB]")}>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#1B5E20]">Enterprise</p>
                <div className="mt-4 flex flex-wrap items-end gap-2">
                  <span className="text-[40px] font-bold leading-none text-[#1A2F23] sm:text-[48px]">Custom</span>
                  <span className="pb-2 text-base text-[#6B7280]">pricing</span>
                </div>
                <p className="mt-3 text-lg text-[#374151]">Districts & multi-campus schools</p>
                <ul className="mt-8 flex grow flex-col gap-3.5 border-t border-[#E5E7EB] pt-8 text-base text-[#374151]">
                  {ENTERPRISE_FEATURES.map((t) => (
                    <li key={t} className="flex gap-3">
                      <span className="mt-0.5 shrink-0 text-[#2ECC71]" aria-hidden>
                        ✓
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <a
                    href="mailto:sales@mygreenkeys.com?subject=Enterprise%20plan%20inquiry"
                    className={cn(
                      pill,
                      "border-2 border-[#1A2F23] bg-transparent font-extrabold text-[#1A2F23] hover:bg-[#1A2F23]/5"
                    )}
                  >
                    Contact Enterprise Sales
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Promo codes */}
          <div className="mx-auto mt-16 max-w-xl rounded-3xl border-2 border-[#E5E7EB] bg-white p-8 shadow-sm">
            <h2 className="text-center text-xl font-extrabold text-[#1A2F23]">Have a promo code?</h2>
            <p className="mt-2 text-center text-sm text-[#666666]">Enter your code below for a special discount.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code…"
                className="h-12 flex-1 rounded-[50px] border-[#E5E7EB] px-5"
              />
              <Button
                type="button"
                onClick={handlePromoCode}
                className="h-12 rounded-[50px] bg-[#2ECC71] px-8 font-bold text-white hover:bg-[#27ae60]"
              >
                Apply
              </Button>
            </div>
            {promoResult ? (
              <div
                className={cn(
                  "mt-4 rounded-2xl px-4 py-3 text-sm font-semibold",
                  promoResult.type === "success"
                    ? "border border-[#C8E6C9] bg-[#E8F5E9] text-[#1B5E20]"
                    : "border border-red-200 bg-red-50 text-red-800"
                )}
              >
                {promoResult.message}
              </div>
            ) : null}
            <div className="mt-6 rounded-2xl bg-[#FAFAFA] p-4 text-left text-xs text-[#6B7280]">
              <p className="mb-2 font-bold text-[#1A2F23]">Available codes</p>
              {Object.entries(PROMO_CODES).map(([code, info]) => (
                <p key={code} className="mb-1">
                  <span className="font-mono font-bold text-[#374151]">{code}</span> — {info.discount} (
                  {info.applicable.join(", ")})
                </p>
              ))}
            </div>
          </div>

          {testimonials.length > 0 ? (
            <section className="py-12">
              <div className="mx-auto max-w-4xl px-6">
                <h3 className="mb-8 text-center text-2xl font-bold text-gray-900">What educators are saying</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {testimonials.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
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

      {/* Trust badges */}
      <section className="border-y border-[#E5E7EB] bg-[#F3F4F6] py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4">
          {TRUST_SIGNALS.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-sm font-semibold text-[#374151]">
              <s.Icon className="h-5 w-5 shrink-0 text-green-600" strokeWidth={2.25} aria-hidden />
              {s.label}
            </div>
          ))}
        </div>
      </section>

      {/* Feature comparison */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-3xl font-extrabold text-[#1A2F23]">Compare plans</h2>
          <div className="overflow-x-auto rounded-[24px] border-2 border-[#E5E7EB] bg-white shadow-sm">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-20 bg-white shadow-[0_1px_0_#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-[#6B7280]">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-extrabold text-[#1A2F23]">Free Starter</th>
                  <th className="bg-[#E8F5E9]/80 px-6 py-4 text-center text-sm font-extrabold text-[#1B5E20]">
                    Family
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-extrabold text-[#1A2F23]">School</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_GROUPS.map((group) => (
                  <React.Fragment key={group.category}>
                    <tr className="bg-[#F9FAFB]">
                      <td
                        colSpan={4}
                        className="px-6 py-3 text-xs font-extrabold uppercase tracking-widest text-[#1B5E20]"
                      >
                        {group.category}
                      </td>
                    </tr>
                    {group.rows.map((row, idx) => (
                      <tr
                        key={row.feature}
                        className={cn("border-t border-[#F3F4F6]", idx % 2 === 1 ? "bg-[#FAFAFA]/80" : "bg-white")}
                      >
                        <td className="px-6 py-3.5 font-medium text-[#374151]">{row.feature}</td>
                        <td className="px-6 py-3.5 text-center">
                          <CompareCell value={row.free} />
                        </td>
                        <td className="bg-[#F1F8F4]/50 px-6 py-3.5 text-center">
                          <CompareCell value={row.family} />
                        </td>
                        <td className="px-6 py-3.5 text-center">
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
      </section>

      {/* FAQ */}
      <section className="bg-[#F8F9FA] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-center text-4xl font-black tracking-tight text-[#1A2F23] sm:text-[2.75rem]">
            Frequently asked questions
          </h2>
          <p className="mb-12 text-center text-lg font-semibold text-[#64748b]">Everything you need to know before you subscribe</p>
          <Accordion
            multiple={false}
            className="pricing-page-faq w-full rounded-[24px] border-[3px] border-[#1A2F23]/15 bg-white px-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
          >
            {FAQ_ITEMS.slice(0, 6).map((faq, idx) => (
              <AccordionItem key={faq.q} value={`item-${idx}`} className="border-[#E5E7EB] px-3">
                <AccordionTrigger
                  className={cn(
                    "py-5 hover:no-underline [&_[data-slot=accordion-trigger-icon]]:hidden"
                  )}
                >
                  <span className="flex w-full items-start gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-[#1B5E20] transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-45">
                      <Plus className="size-5 stroke-[2.5]" strokeLinecap="round" />
                    </span>
                    <span className="pt-1 text-left text-base font-bold text-[#1A2F23]">{faq.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 pl-[3.25rem] text-[15px] leading-relaxed text-[#666666]">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#1B5E20] px-4 py-20 text-center sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to start your child&apos;s typing journey?
          </h2>
          <p className="text-lg text-white/90">Start free. No credit card needed.</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className={cn(
                pill,
                "max-w-xs border-0 bg-white font-extrabold text-[#1B5E20] hover:bg-white/95"
              )}
            >
              Start Free Trial
            </Link>
            <a
              href="mailto:sales@mygreenkeys.com?subject=Sales%20inquiry"
              className={cn(
                pill,
                "max-w-xs border-2 border-white bg-transparent font-bold text-white hover:bg-white/10"
              )}
            >
              Talk to Sales
            </a>
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
