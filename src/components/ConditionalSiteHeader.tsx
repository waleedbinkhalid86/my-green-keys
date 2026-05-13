"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import QuestBanner from "@/components/QuestBanner";
import QuestAutoTrackToast from "@/components/QuestAutoTrackToast";
import { isQuestBannerAllowedPath } from "@/lib/quests/banner-routes";
import { MuteToggle } from "@/components/ui/MuteToggle";
import { SiteBrandLogoLink } from "@/components/SiteBrandLogoLink";
import { GlobalLogoutButton } from "@/components/GlobalLogoutButton";
import { useAuthProfileRoute } from "@/contexts/AuthProfileRouteContext";

const HIDE_HEADER_PREFIXES = ["/login", "/signup"];

function isHidden(pathname: string): boolean {
  if (!pathname) return true;
  if (pathname === "/") return true;
  if (HIDE_HEADER_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  return false;
}

const primaryCtaClass =
  "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#52B788] to-[#40916C] px-4 py-2 text-sm font-bold text-white shadow-md hover:brightness-110 no-underline";

export default function ConditionalSiteHeader() {
  const pathname = usePathname() || "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const { authReady, isLoggedIn } = useAuthProfileRoute();

  if (isHidden(pathname)) return null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#1B4332] py-4 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between gap-3">
            <SiteBrandLogoLink
              linkClassName="flex min-w-0 items-center gap-3 text-white no-underline"
              imageClassName="h-12 w-12 shrink-0 md:h-[60px] md:w-[60px]"
              spanClassName="leading-tight"
              imagePriority
            />

            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/lesson-map" className="text-white hover:text-[#52B788]">
                Lessons
              </Link>
              <Link href="/brain-sprint" className="text-white hover:text-[#52B788]">
                Brain Sprint
              </Link>
              <Link href="/games" className="text-white hover:text-[#52B788]">
                Games
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-3 md:flex">
                <MuteToggle />
                {authReady ? (
                  isLoggedIn ? (
                    <GlobalLogoutButton />
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-sm font-semibold text-white/95 no-underline hover:text-[#52B788]"
                      >
                        Log In
                      </Link>
                      <Link href="/signup" className={primaryCtaClass}>
                        Start Free Today
                      </Link>
                    </>
                  )
                ) : null}
              </div>

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/90 hover:bg-white/10 hover:text-white md:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((o) => !o)}
              >
                {mobileOpen ? <X className="h-6 w-6" strokeWidth={2} aria-hidden /> : <Menu className="h-6 w-6" strokeWidth={2} aria-hidden />}
              </button>
            </div>
          </div>

          {mobileOpen ? (
            <div className="mt-3 border-t border-white/15 pt-3 md:hidden">
              <nav className="flex flex-col gap-1">
                <Link
                  href="/lesson-map"
                  className="rounded-md py-2 text-white/95 no-underline hover:bg-white/10 hover:text-[#52B788]"
                  onClick={() => setMobileOpen(false)}
                >
                  Lessons
                </Link>
                <Link
                  href="/brain-sprint"
                  className="rounded-md py-2 text-white/95 no-underline hover:bg-white/10 hover:text-[#52B788]"
                  onClick={() => setMobileOpen(false)}
                >
                  Brain Sprint
                </Link>
                <Link
                  href="/games"
                  className="rounded-md py-2 text-white/95 no-underline hover:bg-white/10 hover:text-[#52B788]"
                  onClick={() => setMobileOpen(false)}
                >
                  Games
                </Link>
              </nav>
              <div className="mt-4 flex flex-col items-stretch gap-3 border-t border-white/10 pt-4">
                <div className="flex justify-center">
                  <MuteToggle />
                </div>
                {authReady ? (
                  isLoggedIn ? (
                    <div className="flex justify-center">
                      <GlobalLogoutButton />
                    </div>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="rounded-full border border-white/25 py-2 text-center text-sm font-semibold text-white no-underline hover:bg-white/10"
                        onClick={() => setMobileOpen(false)}
                      >
                        Log In
                      </Link>
                      <Link
                        href="/signup"
                        className={`${primaryCtaClass} justify-center`}
                        onClick={() => setMobileOpen(false)}
                      >
                        Start Free Today
                      </Link>
                    </>
                  )
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </header>
      {isQuestBannerAllowedPath(pathname) ? (
        <>
          <QuestBanner />
          <QuestAutoTrackToast />
        </>
      ) : null}
    </>
  );
}
