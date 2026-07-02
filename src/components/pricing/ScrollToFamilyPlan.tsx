"use client";

import { useEffect } from "react";

export function ScrollToFamilyPlan({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const t = window.setTimeout(() => {
      document
        .getElementById("pricing-family-plan")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(t);
  }, [enabled]);

  return null;
}
