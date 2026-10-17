"use client";

import { useAuthProfileRoute } from "@/contexts/AuthProfileRouteContext";

/**
 * `onDark`: mint border + white text for #1B4332 / #2D6A4F navs.
 * Default: #2D6A4F border + #1B4332 text for light backgrounds.
 * `block`: full width, for mobile drawers.
 */
export function GlobalLogoutButton({
  className = "",
  onDark = false,
  block = false,
}: {
  className?: string;
  onDark?: boolean;
  block?: boolean;
}) {
  const { signOutAndGoHome, logoutBusy } = useAuthProfileRoute();
  const cls = ["mgk-logout", onDark && "mgk-logout--on-dark", block && "mgk-logout--block", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={cls}
      disabled={logoutBusy}
      onClick={() => void signOutAndGoHome()}
      aria-busy={logoutBusy}
    >
      {logoutBusy ? "…" : "Log out"}
    </button>
  );
}
