"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getPaddle, onPaddleEvent } from "@/lib/paddle";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const SCHOOL_ROWS = [
  { label: "Price", starter: "$299/mo", growth: "$499/mo", enterprise: "Custom" },
  { label: "Students", starter: "100", growth: "200", enterprise: "Unlimited" },
  { label: "Teacher accounts", starter: "5", growth: "15", enterprise: "Unlimited" },
  { label: "Custom lessons", starter: "✓", growth: "✓", enterprise: "✓" },
  { label: "School branding", starter: "✓", growth: "✓", enterprise: "✓" },
  { label: "Analytics", starter: "Basic", growth: "Advanced", enterprise: "Full" },
  { label: "Support", starter: "Email", growth: "Priority", enterprise: "Dedicated" },
];

function PricingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[var(--mgk-dark)] shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
            <LeafIconCustom />
          </div>
          <span className="font-heading text-base font-bold tracking-tight text-white">
            My Green Keys
          </span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {["Features", "Modules", "Schools"].map((l) => (
            <Link
              key={l}
              href={`/#${l.toLowerCase()}`}
              className="text-sm font-medium text-white/85 transition-colors hover:text-primary"
            >
              {l}
            </Link>
          ))}
          <Link href="/pricing" className="text-sm font-semibold text-primary">
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-white/90 hover:text-primary md:inline"
          >
            Log In
          </Link>
          <Link href="/signup" className={buttonVariants({ size: "sm" })}>
            Start Free Trial
          </Link>
        </div>
      </div>
    </nav>
  );
}

function FeatureRow({
  ok,
  children,
  variant = "light",
}: {
  ok: boolean;
  children: React.ReactNode;
  variant?: "light" | "onGradient" | "onDark";
}) {
  const muted =
    variant === "light"
      ? "text-muted-foreground"
      : variant === "onGradient"
        ? "text-white/65"
        : "text-white/55";
  const text = ok ? (variant === "light" ? "text-foreground" : "text-white") : muted;
  const checkClass =
    variant === "light" ? "text-[#22c55e]" : variant === "onGradient" ? "text-emerald-200" : "text-[#4ade80]";
  return (
    <div className={cn("flex items-start gap-3 text-base leading-snug", text)}>
      {ok ? (
        <Check className={cn("mt-0.5 size-5 shrink-0 stroke-[2.5]", checkClass)} aria-hidden />
      ) : (
        <X
          className={cn(
            "mt-0.5 size-5 shrink-0",
            variant === "light" ? "text-border" : "text-white/35"
          )}
          aria-hidden
        />
      )}
      <span>{children}</span>
    </div>
  );
}

const pillCtaClass =
  "flex h-[52px] w-full items-center justify-center rounded-full text-base font-semibold transition-opacity disabled:opacity-60";

export default function PricingPage() {
  const router = useRouter();
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

  return (
    <div className="min-h-screen w-full bg-white font-sans">
      <PricingNav />
      <div className="h-[72px]" aria-hidden />

      <section className="w-full border-b border-[#E5E7EB] bg-white px-4 py-14 text-center sm:px-6 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-[#22c55e]">
            Simple, transparent pricing
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
            Choose the perfect plan for your child
          </h1>
          <p className="mt-5 text-lg text-[#6B7280] md:text-xl">
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Label htmlFor="billing-toggle" className="text-base font-medium text-[#6B7280]">
              Monthly
            </Label>
            <Switch id="billing-toggle" checked={isYearly} onCheckedChange={setIsYearly} />
            <div className="flex items-center gap-2">
              <Label htmlFor="billing-toggle" className="text-base font-medium text-[#111827]">
                Yearly
              </Label>
              <Badge variant="secondary" className="border-[#22c55e]/25 bg-[#22c55e]/10 text-[#15803d]">
                Save 20%
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto w-full max-w-7xl">
          {checkoutError ? (
            <div
              className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-base font-medium text-destructive"
              role="alert"
            >
              {checkoutError}
            </div>
          ) : null}

          <div className="grid w-full grid-cols-1 items-stretch gap-8 md:grid-cols-3 md:gap-6">
            {/* Free */}
            <div
              className="flex flex-col rounded-[20px] border border-[#D1D5DB] bg-white p-10 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            >
              <h2 className="text-[28px] font-bold leading-tight text-[#111827]">Free</h2>
              <div className="mt-4 flex flex-wrap items-baseline gap-1">
                <span className="text-[56px] font-bold leading-none tracking-tight text-[#111827]">$0</span>
              </div>
              <p className="mt-2 text-lg text-[#6B7280]">Perfect to get started</p>
              <button
                type="button"
                className={cn(
                  pillCtaClass,
                  "mt-8 border-2 border-[#22c55e] bg-white text-[#15803d] hover:bg-[#f0fdf4]"
                )}
                disabled={checkoutBusy}
                onClick={() => router.push("/signup")}
              >
                Start for Free
              </button>
              <div className="mt-8 flex flex-col gap-3">
                <FeatureRow ok>10 typing lessons</FeatureRow>
                <FeatureRow ok>Basic keyboard guide</FeatureRow>
                <FeatureRow ok>WPM &amp; accuracy tracking</FeatureRow>
                <FeatureRow ok>1 eco module preview</FeatureRow>
                <FeatureRow ok={false}>Custom lessons</FeatureRow>
                <FeatureRow ok={false}>Parent dashboard</FeatureRow>
                <FeatureRow ok={false}>Badges &amp; rewards</FeatureRow>
                <FeatureRow ok={false}>Eco photo rewards</FeatureRow>
              </div>
            </div>

            {/* Family — most prominent */}
            <div
              className={cn(
                "relative flex flex-col rounded-[20px] p-10 pt-14 shadow-[0_20px_50px_rgba(34,197,94,0.35)]",
                "bg-gradient-to-br from-[#34d399] via-[#22c55e] to-[#15803d]"
              )}
            >
              <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
                <span className="inline-block whitespace-nowrap rounded-full bg-[#111827] px-5 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-lg">
                  Most Popular
                </span>
              </div>
              <h2 className="text-[28px] font-bold leading-tight text-white">Family</h2>
              <div className="mt-4 flex flex-wrap items-baseline gap-2">
                <span className="text-[56px] font-bold leading-none tracking-tight text-white">
                  ${isYearly ? "7.99" : "9.99"}
                </span>
                <span className="text-xl font-medium text-white/90">/month</span>
              </div>
              <p className="mt-2 text-lg text-white/90">Perfect for families</p>
              <button
                type="button"
                className={cn(pillCtaClass, "mt-8 bg-white text-[#15803d] hover:bg-white/95")}
                disabled={checkoutBusy}
                onClick={() => void openCheckout("family")}
              >
                {checkoutBusy ? "Loading…" : "Get Started"}
              </button>
              <p className="mt-3 text-center text-sm text-white/85">7-day free trial, no credit card required</p>
              <div className="mt-8 flex flex-col gap-3">
                <FeatureRow ok variant="onGradient">
                  Unlimited typing lessons
                </FeatureRow>
                <FeatureRow ok variant="onGradient">
                  All 4 learning modules
                </FeatureRow>
                <FeatureRow ok variant="onGradient">
                  Parent dashboard
                </FeatureRow>
                <FeatureRow ok variant="onGradient">
                  Custom lesson text by parent
                </FeatureRow>
                <FeatureRow ok variant="onGradient">
                  Badges, streaks &amp; rewards
                </FeatureRow>
                <FeatureRow ok variant="onGradient">
                  Eco photo upload rewards
                </FeatureRow>
                <FeatureRow ok variant="onGradient">
                  Weekly progress reports
                </FeatureRow>
                <FeatureRow ok variant="onGradient">
                  Up to 3 children
                </FeatureRow>
                <FeatureRow ok variant="onGradient">
                  Pink/Blue personalization
                </FeatureRow>
                <FeatureRow ok={false} variant="onGradient">
                  Teacher dashboard
                </FeatureRow>
                <FeatureRow ok={false} variant="onGradient">
                  School branding
                </FeatureRow>
              </div>
            </div>

            {/* School */}
            <div
              className="flex flex-col rounded-[20px] bg-[#1a2f23] p-10 shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
            >
              <h2 className="text-[28px] font-bold leading-tight text-white">School</h2>
              <div className="mt-4 flex flex-wrap items-baseline gap-2">
                <span className="text-xl font-semibold text-white/85">From</span>
                <span className="text-[56px] font-bold leading-none tracking-tight text-white">$299</span>
                <span className="text-xl font-medium text-white/80">/month</span>
              </div>
              <p className="mt-2 text-lg text-white/75">Perfect for classrooms</p>
              <button
                type="button"
                className={cn(
                  pillCtaClass,
                  "mt-8 bg-[#22c55e] text-white hover:bg-[#16a34a]"
                )}
                disabled={checkoutBusy}
                onClick={() => void openCheckout("school_starter")}
              >
                {checkoutBusy ? "Loading…" : "Get Started (Starter)"}
              </button>
              <button
                type="button"
                className={cn(
                  pillCtaClass,
                  "mt-3 border-2 border-white/40 bg-transparent text-white hover:bg-white/10"
                )}
                disabled={checkoutBusy}
                onClick={() => void openCheckout("school_growth")}
              >
                {checkoutBusy ? "Loading…" : "Get Started (Growth)"}
              </button>
              <p className="mt-3 text-center text-sm text-white/65">
                Available in 100 or 200 student packages
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <FeatureRow ok variant="onDark">
                  Everything in Family plan
                </FeatureRow>
                <FeatureRow ok variant="onDark">
                  Up to 200 students
                </FeatureRow>
                <FeatureRow ok variant="onDark">
                  Teacher dashboard
                </FeatureRow>
                <FeatureRow ok variant="onDark">
                  Custom lessons by teacher
                </FeatureRow>
                <FeatureRow ok variant="onDark">
                  Class leaderboard
                </FeatureRow>
                <FeatureRow ok variant="onDark">
                  School logo &amp; branding
                </FeatureRow>
                <FeatureRow ok variant="onDark">
                  Lesson library
                </FeatureRow>
                <FeatureRow ok variant="onDark">
                  Admin dashboard access
                </FeatureRow>
                <FeatureRow ok variant="onDark">
                  Priority support
                </FeatureRow>
                <FeatureRow ok variant="onDark">
                  Promo code system
                </FeatureRow>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-white px-6 py-16">
        <div className="mx-auto max-w-xl">
          <Card className="border-primary/30 shadow-sm">
            <CardHeader className="text-center">
              <CardTitle className="font-heading text-xl">Have a promo code?</CardTitle>
              <CardDescription>Enter your code below for a special discount.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code…"
                  className="flex-1"
                />
                <Button type="button" onClick={handlePromoCode} className="sm:w-auto">
                  Apply
                </Button>
              </div>
              {promoResult ? (
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium",
                    promoResult.type === "success"
                      ? "border border-primary/30 bg-primary/10 text-primary"
                      : "border border-destructive/30 bg-destructive/10 text-destructive"
                  )}
                >
                  {promoResult.message}
                </div>
              ) : null}
              <div className="rounded-lg bg-muted/50 p-4 text-left text-xs text-muted-foreground">
                <p className="mb-2 font-semibold text-foreground">Available codes</p>
                {Object.entries(PROMO_CODES).map(([code, info]) => (
                  <p key={code} className="mb-1">
                    <span className="font-mono font-semibold text-foreground">{code}</span> —{" "}
                    {info.discount} ({info.applicable.join(", ")})
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading mb-10 text-center text-2xl font-bold text-foreground">
            School packages — detailed comparison
          </h2>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Feature</TableHead>
                <TableHead className="font-semibold">Starter (100)</TableHead>
                <TableHead className="bg-primary/10 font-semibold text-primary">Growth (200)</TableHead>
                <TableHead className="font-semibold">Enterprise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SCHOOL_ROWS.map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell className="text-muted-foreground">{row.starter}</TableCell>
                  <TableCell className="bg-primary/5 font-medium">{row.growth}</TableCell>
                  <TableCell className="text-muted-foreground">{row.enterprise}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="border-t border-border/60 bg-white px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-heading mb-8 text-center text-2xl font-bold text-foreground">
            Frequently asked questions
          </h2>
          <Accordion multiple={false} className="w-full rounded-xl border border-border bg-card px-2">
            {FAQ_ITEMS.map((faq, idx) => (
              <AccordionItem key={faq.q} value={`item-${idx}`} className="border-border px-2">
                <AccordionTrigger className="py-4 text-left font-heading text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="bg-[var(--mgk-dark)] px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">
            Ready to start your child&apos;s typing journey?
          </h2>
          <p className="text-white/85">
            Join thousands of kids already learning to type and helping the planet.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "bg-primary text-primary-foreground hover:bg-primary/90",
              })}
            >
              Start Free Today
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
