"use client";

import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/marketing/Buttons";
import { safeSessionStorage } from "@/lib/safe-local-storage";

const DISMISSED_KEY = "mgk_guest_save_card_dismissed";

/**
 * Guest-only, non-blocking card in the lesson completion overlay.
 * "Not now" hides it for the rest of this browser session.
 */
export function GuestSaveProgressCard() {
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && safeSessionStorage.getItem(DISMISSED_KEY) === "1"
  );

  if (dismissed) return null;

  const dismiss = () => {
    safeSessionStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  return (
    <section
      data-testid="guest-save-card"
      aria-labelledby="guest-save-card-title"
      style={{
        position: "relative",
        marginTop: 12,
        padding: "14px 16px",
        borderRadius: 16,
        background: "#F0F9F4",
        border: "1px solid #74C69D",
        textAlign: "left",
      }}
    >
      <h2
        id="guest-save-card-title"
        style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1B4332" }}
      >
        Keep your progress
      </h2>
      <p style={{ margin: "6px 0 12px", fontSize: 14, fontWeight: 600, lineHeight: 1.45, color: "#2D6A4F" }}>
        Ask a grown-up to create a free account. Your practice lessons can be added to it. Guest progress
        stays on this device, and clearing your browser removes it.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <PrimaryButton href="/signup" style={{ flex: "1 1 180px" }}>
          Create a free account
        </PrimaryButton>
        <SecondaryButton onClick={dismiss} style={{ flex: "1 1 120px" }}>
          Not now
        </SecondaryButton>
      </div>
    </section>
  );
}
