"use client";

import { useAuthProfileRoute } from "@/contexts/AuthProfileRouteContext";

const BTN: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 9999,
  border: "1px solid #2D6A4F",
  background: "transparent",
  color: "#2D6A4F",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export function GlobalLogoutButton({ className = "" }: { className?: string }) {
  const { signOutAndGoHome, logoutBusy } = useAuthProfileRoute();

  return (
    <button
      type="button"
      className={className}
      style={BTN}
      disabled={logoutBusy}
      onClick={() => void signOutAndGoHome()}
      onMouseEnter={(e) => {
        if (!logoutBusy) e.currentTarget.style.background = "#F0F9F4";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
      aria-busy={logoutBusy}
    >
      {logoutBusy ? "…" : "Log Out"}
    </button>
  );
}
