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
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center gap-1 rounded-full border border-[#D1E8DC] bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setIsYearly(false)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            !isYearly
              ? "bg-[#1B4332] text-white"
              : "bg-transparent text-[#4A6355] hover:bg-[#F0F9F4]",
          )}
          aria-pressed={!isYearly}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setIsYearly(true)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            isYearly
              ? "bg-[#1B4332] text-white"
              : "bg-transparent text-[#4A6355] hover:bg-[#F0F9F4]",
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
