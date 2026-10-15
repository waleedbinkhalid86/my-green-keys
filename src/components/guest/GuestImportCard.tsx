"use client";

import { useEffect, useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/marketing/Buttons";
import { useAuthProfileRoute } from "@/contexts/AuthProfileRouteContext";
import { clearGuestStore, getGuestImportPayload, hasGuestProgress } from "@/lib/guest/guest-store";
import { safeLocalStorage } from "@/lib/safe-local-storage";

/** Read-only check of the kiosk flags kept by kid-login/kiosk-storage.ts (keys mirrored, nothing written). */
function isKioskDevice(): boolean {
  return (
    safeLocalStorage.getItem("kioskDevice") === "1" || safeLocalStorage.getItem("kioskNeedsSetup") === "1"
  );
}

type CardState = "hidden" | "ask" | "working" | "error" | "done";

/**
 * Logged-in students only: offers to add this device's guest lessons to the account, once.
 * No request is made unless the student chooses "Add them".
 */
export function GuestImportCard() {
  const { authReady, isLoggedIn, accountType } = useAuthProfileRoute();
  const [state, setState] = useState<CardState>("hidden");
  const [lessonCount, setLessonCount] = useState(0);

  useEffect(() => {
    if (!authReady || !isLoggedIn || accountType !== "student") return;
    if (isKioskDevice() || !hasGuestProgress()) return;
    setLessonCount(getGuestImportPayload().lessons.length);
    setState("ask");
  }, [authReady, isLoggedIn, accountType]);

  if (state === "hidden") return null;

  const addThem = async () => {
    setState("working");
    try {
      const res = await fetch("/api/guest/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getGuestImportPayload()),
      });
      if (res.status === 200 || res.status === 409) {
        clearGuestStore();
        setState(res.status === 200 ? "done" : "hidden");
        return;
      }
      setState("error");
    } catch {
      setState("error");
    }
  };

  const startFresh = () => {
    clearGuestStore();
    setState("hidden");
  };

  return (
    <div className="mgk-container" style={{ paddingTop: 10 }}>
      <section
        data-testid="guest-import-card"
        aria-labelledby="guest-import-card-title"
        style={{
          padding: "14px 16px",
          borderRadius: 16,
          background: "#F0F9F4",
          border: "1px solid #74C69D",
        }}
      >
        {state === "done" ? (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1B4332" }}>
              Your guest lessons were added to your account.
            </p>
            <SecondaryButton onClick={() => setState("hidden")}>OK</SecondaryButton>
          </div>
        ) : (
          <>
            <h2 id="guest-import-card-title" style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1B4332" }}>
              Add your guest progress?
            </h2>
            <p style={{ margin: "6px 0 12px", fontSize: 14, fontWeight: 600, lineHeight: 1.45, color: "#2D6A4F" }}>
              This device has {lessonCount} practice {lessonCount === 1 ? "lesson" : "lessons"} from guest mode. Add
              them to your account?
            </p>
            {state === "error" ? (
              <p role="alert" style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#1B4332" }}>
                That didn&apos;t work. Please try again.
              </p>
            ) : null}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <PrimaryButton onClick={addThem} disabled={state === "working"} style={{ flex: "1 1 160px" }}>
                {state === "working" ? "Adding…" : "Add them"}
              </PrimaryButton>
              <SecondaryButton onClick={startFresh} disabled={state === "working"} style={{ flex: "1 1 160px" }}>
                No, start fresh
              </SecondaryButton>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
