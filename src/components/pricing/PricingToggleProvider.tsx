"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

const PricingToggleContext = createContext<{
  isYearly: boolean;
  setIsYearly: (next: boolean) => void;
} | null>(null);

export function PricingToggleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isYearly, setIsYearly] = useState(false);
  return (
    <PricingToggleContext.Provider value={{ isYearly, setIsYearly }}>
      {children}
    </PricingToggleContext.Provider>
  );
}

function usePricingToggle() {
  const ctx = useContext(PricingToggleContext);
  if (!ctx)
    throw new Error(
      "usePricingToggle must be used within PricingToggleProvider",
    );
  return ctx;
}

export function PricingToggle() {
  const { isYearly, setIsYearly } = usePricingToggle();
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex w-full max-w-[280px] items-center rounded-full border border-[#D1E8DC] bg-white p-1 shadow-sm">
        <span
          className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#1B4332] transition-transform duration-300 ease-out"
          style={{ transform: isYearly ? "translateX(100%)" : "translateX(0)" }}
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => setIsYearly(false)}
          className={cn(
            "relative z-10 flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
            !isYearly ? "text-white" : "text-[#4A6355] hover:text-[#1B4332]",
          )}
          aria-pressed={!isYearly}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setIsYearly(true)}
          className={cn(
            "relative z-10 flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
            isYearly ? "text-white" : "text-[#4A6355] hover:text-[#1B4332]",
          )}
          aria-pressed={isYearly}
        >
          Yearly
        </button>
      </div>
      <span className="rounded-full bg-[#E8F5EE] px-3 py-1 text-xs font-semibold text-[#1B4332]">
        Save 20% with yearly billing
      </span>
    </div>
  );
}

function splitPrice(price: string) {
  const [dollarsRaw, centsRaw] = price.split(".");
  const dollars = dollarsRaw || "0";
  const cents = (centsRaw || "00").padEnd(2, "0").slice(0, 2);
  return { dollars, cents };
}

export function FamilyPrice() {
  const { isYearly } = usePricingToggle();
  const { dollars, cents } = splitPrice(isYearly ? "7.99" : "9.99");
  return (
    <div className="flex items-baseline justify-center">
      <span className="text-6xl font-bold text-white">${dollars}</span>
      <span className="text-3xl font-bold text-white">.{cents}</span>
      <span className="ml-2 text-lg text-white/80">/month</span>
    </div>
  );
}
