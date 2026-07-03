import React from "react";
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
import { cn } from "@/lib/utils";
import { testimonials } from "@/data/testimonials";
import {
  PricingToggleProvider,
  PricingToggle,
  FamilyPrice,
} from "@/components/pricing/PricingToggleProvider";
import {
  CheckoutProvider,
  CheckoutErrorBanner,
  CheckoutButton,
} from "@/components/pricing/CheckoutProvider";
import { PromoCodeBox } from "@/components/pricing/PromoCodeBox";
import { ScrollToFamilyPlan } from "@/components/pricing/ScrollToFamilyPlan";
import {
  EnterpriseSalesLink,
  FinalCtaOutlineLink,
  FinalCtaPrimaryLink,
  PrimaryLinkCta,
} from "@/components/pricing/HoverLinks";

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
    a: "Yes! Free pilot for one full term, up to 30 students. Check progress after 2 weeks — cancel anytime.",
  },
];

type Cell = "yes" | "no" | string;

const COMPARISON_GROUPS: {
  category: string;
  rows: { feature: string; free: Cell; family: Cell; school: Cell }[];
}[] = [
  {
    category: "Learning",
    rows: [
      {
        feature: "Typing lessons",
        free: "10 included",
        family: "Unlimited",
        school: "Unlimited",
      },
      {
        feature: "Learning modules",
        free: "1 preview",
        family: "All 4 modules",
        school: "All 4 modules",
      },
      {
        feature: "Custom lesson text",
        free: "no",
        family: "yes",
        school: "yes",
      },
      {
        feature: "WPM & accuracy tracking",
        free: "yes",
        family: "yes",
        school: "yes",
      },
    ],
  },
  {
    category: "Family & engagement",
    rows: [
      { feature: "Parent dashboard", free: "no", family: "yes", school: "yes" },
      {
        feature: "Child profiles",
        free: "1",
        family: "Up to 3",
        school: "Up to 200 students",
      },
      {
        feature: "Badges, streaks & rewards",
        free: "no",
        family: "yes",
        school: "yes",
      },
      {
        feature: "Eco photo rewards",
        free: "no",
        family: "yes",
        school: "yes",
      },
      {
        feature: "Weekly progress reports",
        free: "no",
        family: "yes",
        school: "yes",
      },
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
  { Icon: Lock, label: "Privacy-First" },
  { Icon: Shield, label: "EU Hosted" },
  { Icon: Lock, label: "SSL" },
  { Icon: Ban, label: "No Ads" },
] as const;

function LightCardPrice({ price }: { price: string }) {
  const [dollarsRaw, centsRaw] = price.split(".");
  const dollars = dollarsRaw || "0";
  const cents = (centsRaw || "00").padEnd(2, "0").slice(0, 2);
  return (
    <div className="flex items-baseline">
      <span className="text-6xl font-bold text-[#1B4332]">${dollars}</span>
      <span className="text-3xl font-bold text-[#1B4332]">.{cents}</span>
      <span className="ml-2 text-lg text-[#4A6355]">/month</span>
    </div>
  );
}

function DarkCardPrice({ price }: { price: string }) {
  const [dollarsRaw, centsRaw] = price.split(".");
  const dollars = dollarsRaw || "0";
  const cents = (centsRaw || "00").padEnd(2, "0").slice(0, 2);
  return (
    <div className="flex items-baseline justify-center">
      <span className="text-6xl font-bold text-white">${dollars}</span>
      <span className="text-3xl font-bold text-white">.{cents}</span>
      <span className="ml-2 text-lg text-white/80">/month</span>
    </div>
  );
}

function CompareCell({ value }: { value: Cell }) {
  if (value === "yes") {
    return (
      <span
        className="inline-flex justify-center text-[#52B788]"
        aria-label="Included"
      >
        <CheckCircle2
          className="h-5 w-5 stroke-[2.25]"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="inline-flex justify-center text-gray-300" aria-hidden>
        <Minus
          className="h-5 w-5 stroke-[2.25]"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </span>
    );
  }
  return <span className="text-sm text-gray-700">{value}</span>;
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group mb-3 rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm transition-shadow hover:shadow-md">
      <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 text-left [&::-webkit-details-marker]:hidden">
        <span className="text-base font-bold text-[#1B4332] md:text-lg">
          {question}
        </span>
        <ChevronDown
          className="shrink-0 transition-transform duration-200 group-open:rotate-180"
          width={24}
          height={24}
          strokeWidth={2.25}
          style={{ color: "#52B788" }}
          aria-hidden
        />
      </summary>
      <p className="mt-3 border-t border-gray-100 pt-3 text-sm leading-relaxed text-[#4A6355]">
        {answer}
      </p>
    </details>
  );
}

const primaryCardBase =
  "relative flex h-full flex-col rounded-3xl p-8 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl md:p-10";

const secondaryCardBase =
  "relative flex h-full flex-col rounded-3xl border border-[#D1E8DC] bg-white p-8 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl md:p-10";

const tierEyebrow =
  "mb-3 text-center text-xs font-bold uppercase tracking-widest text-white/80";

const tierEyebrowMuted =
  "mb-3 text-center text-xs font-bold uppercase tracking-widest text-[#4A6355]";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source } = await searchParams;
  const ecoGardenExpired = source === "eco_garden_expired";

  return (
    <div
      className="min-h-screen antialiased text-gray-900"
      style={{
        backgroundColor: "#FAFAF7",
        backgroundImage:
          "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <ScrollToFamilyPlan enabled={ecoGardenExpired} />
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
        <CheckoutProvider>
          <PricingToggleProvider>
            {/* Hero */}
            <section
              style={{ marginBottom: "80px" }}
              className="pb-12 pt-20 text-center md:pb-16 md:pt-28"
            >
              <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-4xl font-bold leading-tight text-[#1B4332] md:text-5xl lg:text-6xl">
                  Pricing that grows with you
                </h1>
                <p className="mb-8 text-lg text-[#4A6355] md:text-xl">
                  Free forever for trying out. Upgrade when ready. No hidden
                  fees.
                </p>
                <div className="mb-12 flex justify-center md:mb-16">
                  <PricingToggle />
                </div>
              </div>
            </section>

            {/* Main pricing cards */}
            <section
              style={{ marginBottom: "80px" }}
              className="pb-16 md:pb-24"
            >
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {ecoGardenExpired ? (
                  <div
                    className="mb-8 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-center sm:text-left"
                    role="status"
                  >
                    <Sprout
                      className="mx-auto h-8 w-8 shrink-0 text-[#52B788] sm:mx-0"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <p className="text-base font-semibold text-[#1B4332]">
                      Your garden is waiting. Upgrade to keep your plants
                      growing.
                    </p>
                  </div>
                ) : null}

                <CheckoutErrorBanner />

                {/* Free-access promo codes (e.g. GoGreen) — redeem above paid tiers */}
                <PromoCodeBox />

                <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
                  {/* Free */}
                  <div
                    className={cn(
                      primaryCardBase,
                      "bg-gradient-to-br from-[#52B788] to-[#40916C] text-white",
                    )}
                  >
                    <p className={tierEyebrow}>FREE</p>
                    <div className="mt-4 flex justify-center">
                      <span className="text-6xl font-bold text-white">$0</span>
                    </div>
                    <p className="mt-4 text-center text-base leading-relaxed text-white/95">
                      For families wanting to try Green Keys for an unlimited
                      period of time
                    </p>
                    <PrimaryLinkCta href="/signup">Start free</PrimaryLinkCta>
                    <div className="my-6 border-t border-white/20" />
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/80">
                      What&apos;s included:
                    </p>
                    <ul className="flex flex-1 flex-col gap-2.5">
                      {FREE_FEATURES.map((t) => (
                        <li
                          key={t}
                          className="flex items-start gap-2.5 text-sm text-white/95"
                        >
                          <CheckCircle
                            className="mt-0.5 h-4 w-4 shrink-0 text-white"
                            aria-hidden
                          />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Family — Most Popular */}
                  <div
                    id="pricing-family-plan"
                    className={cn(
                      primaryCardBase,
                      "bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white",
                      ecoGardenExpired &&
                        "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#FAFAF7]",
                    )}
                  >
                    <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1B4332] shadow-lg">
                      MOST POPULAR
                    </span>
                    <p className={tierEyebrow}>FAMILY</p>
                    <div className="mt-4">
                      <FamilyPrice />
                    </div>
                    <p className="mt-4 text-center text-base leading-relaxed text-white/95">
                      For families who want unlimited lessons and full features
                    </p>
                    <CheckoutButton planType="family">
                      Choose Family
                    </CheckoutButton>
                    <div className="my-6 border-t border-white/20" />
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/80">
                      What&apos;s included:
                    </p>
                    <ul className="flex flex-1 flex-col gap-2.5">
                      {FAMILY_FEATURES.map((t) => (
                        <li
                          key={t}
                          className="flex items-start gap-2.5 text-sm text-white/95"
                        >
                          <CheckCircle
                            className="mt-0.5 h-4 w-4 shrink-0 text-white"
                            aria-hidden
                          />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* School */}
                  <div
                    className={cn(
                      primaryCardBase,
                      "bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white",
                    )}
                  >
                    <span className="mb-3 self-center rounded-full bg-[#F2B705] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1B4332] shadow-lg">
                      For schools
                    </span>
                    <p className={tierEyebrow}>SCHOOL</p>
                    <div className="mt-4">
                      <DarkCardPrice price="149.00" />
                    </div>
                    <p className="mt-4 text-center text-base leading-relaxed text-white/95">
                      For classrooms and teachers managing students at scale
                    </p>
                    <CheckoutButton planType="school_starter">
                      Choose School
                    </CheckoutButton>
                    <div className="my-6 border-t border-white/20" />
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/80">
                      What&apos;s included:
                    </p>
                    <ul className="flex flex-1 flex-col gap-2.5">
                      {SCHOOL_STARTER_FEATURES.filter(
                        (t) => t !== "Everything in Family",
                      ).map((t) => (
                        <li
                          key={t}
                          className="flex items-start gap-2.5 text-sm text-white/95"
                        >
                          <CheckCircle
                            className="mt-0.5 h-4 w-4 shrink-0 text-white"
                            aria-hidden
                          />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-[#D1E8DC] bg-white/70 px-6 py-5 text-center md:mt-20">
                  <p className="text-base font-semibold text-[#1B4332]">
                    Trusted by families and schools across Pakistan
                  </p>
                  <p className="mt-1 text-sm text-[#4A6355]">
                    Join families building daily learning habits.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-[#4A6355]">
                  {TRUST_SIGNALS.map((s) => (
                    <div
                      key={s.label}
                      className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 shadow-sm"
                    >
                      <s.Icon
                        className="h-4 w-4 text-[#52B788]"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </PricingToggleProvider>

          {/* For larger schools */}
          <section style={{ marginBottom: "80px" }} className="py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-3 text-3xl font-bold text-[#1B4332] md:text-4xl">
                  For larger schools
                </h2>
                <p className="text-[#4A6355]">Scale with confidence</p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className={secondaryCardBase}>
                  <p className={tierEyebrowMuted}>SCHOOL GROWTH</p>
                  <div className="mt-4">
                    <LightCardPrice price="299.00" />
                  </div>
                  <div className="mt-4 flex flex-wrap items-end gap-2">
                    <span className="text-4xl font-bold text-[#1B4332]">
                      200
                    </span>
                    <span className="text-sm font-medium text-[#4A6355]">
                      students
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#4A6355]">
                    For schools scaling their program
                  </p>
                  <CheckoutButton planType="school_growth" variant="growth">
                    Choose Growth
                  </CheckoutButton>
                  <div className="my-6 border-t border-[#D1E8DC]" />
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#4A6355]">
                    What&apos;s included:
                  </p>
                  <ul className="space-y-2.5">
                    {SCHOOL_GROWTH_FEATURES.map((t) => (
                      <li
                        key={t}
                        className="flex items-start gap-2.5 text-sm text-[#1B4332]"
                      >
                        <CheckCircle
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#52B788]"
                          aria-hidden
                        />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={secondaryCardBase}>
                  <p className={tierEyebrowMuted}>ENTERPRISE</p>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-6xl font-bold text-[#1B4332]">
                      Custom
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[#4A6355]">
                    Districts & multi-campus schools
                  </p>
                  <EnterpriseSalesLink href="mailto:sales@mygreenkeys.com?subject=Enterprise%20plan%20inquiry">
                    Contact enterprise sales
                  </EnterpriseSalesLink>
                  <div className="my-6 border-t border-[#D1E8DC]" />
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#4A6355]">
                    What&apos;s included:
                  </p>
                  <ul className="space-y-2.5">
                    {ENTERPRISE_FEATURES.map((t) => (
                      <li
                        key={t}
                        className="flex items-start gap-2.5 text-sm text-[#1B4332]"
                      >
                        <CheckCircle
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#52B788]"
                          aria-hidden
                        />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </CheckoutProvider>

        {testimonials.length > 0 ? (
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <h3 className="mb-8 text-center text-2xl font-bold text-[#1B4332]">
                What educators are saying
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {testimonials.slice(0, 2).map((t) => (
                  <div
                    key={t.id}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                  >
                    <Quote className="mb-3 h-6 w-6 text-[#52B788]" />
                    <p className="mb-4 text-[#4A6355]">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="text-sm">
                      <div className="font-semibold text-[#1B4332]">
                        {t.author}
                      </div>
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
              <h2 className="mb-3 text-3xl font-bold text-[#1B4332] md:text-4xl">
                Compare every feature
              </h2>
              <p className="text-[#4A6355]">Side-by-side feature breakdown</p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white p-6 shadow-xl md:p-10">
              <div className="min-w-[720px] overflow-hidden rounded-2xl">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="rounded-t-2xl bg-[#1B4332] text-white">
                      <th className="pl-6 pr-4 py-4 text-xs font-bold uppercase tracking-wider">
                        Feature
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
                        Free
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
                        Family
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
                        School
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                      <td className="pl-6 pr-4 py-3 font-medium text-gray-700">
                        Price (monthly)
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-gray-700">
                        $0
                      </td>
                      <td className="bg-[#F0F9F4] px-6 py-3 text-center text-sm text-gray-700">
                        $9.99/mo
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-gray-700">
                        $149/mo (Starter)
                      </td>
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
                          <tr
                            key={row.feature}
                            className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                          >
                            <td className="pl-6 pr-4 py-3 font-medium text-gray-700">
                              {row.feature}
                            </td>
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
                School Growth (up to 200 students) is{" "}
                <strong className="font-semibold text-[#1B4332]">
                  $299/mo
                </strong>
                .
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: "80px" }} className="py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-3xl font-bold text-[#1B4332] md:text-4xl">
                Frequently asked questions
              </h2>
              <p className="text-[#4A6355]">
                Everything you need to know before you subscribe
              </p>
            </div>
            <div>
              {FAQ_ITEMS.slice(0, 6).map((faq) => (
                <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
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
              <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
                Ready to start?
              </h2>
              <p className="mb-8 text-lg text-white/90">
                Free forever for the first 10 lessons. No credit card.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "16px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginTop: "24px",
                }}
              >
                <FinalCtaPrimaryLink href="/signup">
                  Start Free
                </FinalCtaPrimaryLink>
                <FinalCtaOutlineLink href="mailto:sales@mygreenkeys.com?subject=Sales%20inquiry">
                  Talk to Sales
                </FinalCtaOutlineLink>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
