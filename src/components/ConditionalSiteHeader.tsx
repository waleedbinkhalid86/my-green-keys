"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import QuestBanner from "@/components/QuestBanner";
import QuestAutoTrackToast from "@/components/QuestAutoTrackToast";
import { isQuestBannerAllowedPath } from "@/lib/quests/banner-routes";
import { MuteToggle } from "@/components/ui/MuteToggle";
import { SiteBrandLogoLink } from "@/components/SiteBrandLogoLink";
import { GlobalLogoutButton } from "@/components/GlobalLogoutButton";
import { useAuthProfileRoute } from "@/contexts/AuthProfileRouteContext";
import { MobileNavDrawer, mobileDrawerLinkClass } from "@/components/MobileNavDrawer";

const HIDE_HEADER_PREFIXES = ["/login", "/signup", "/admin"];

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
              spanClassName="whitespace-nowrap leading-tight"
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

            <MobileNavDrawer open={mobileOpen} onOpenChange={setMobileOpen} hamburgerClassName="text-white">
              <Link
                href="/lesson-map"
                className={mobileDrawerLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Lessons
              </Link>
              <Link
                href="/brain-sprint"
                className={mobileDrawerLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Brain Sprint
              </Link>
              <Link href="/games" className={mobileDrawerLinkClass} onClick={() => setMobileOpen(false)}>
                Games
              </Link>
              <div className="mt-4 flex flex-col items-stretch gap-3 border-t border-white/10 px-1 pt-4">
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
                        className="flex min-h-12 items-center justify-center rounded-full border border-white/25 text-sm font-semibold text-white no-underline hover:bg-white/10"
                        onClick={() => setMobileOpen(false)}
                      >
                        Log In
                      </Link>
                      <Link
                        href="/signup"
                        className={`${primaryCtaClass} min-h-12 justify-center`}
                        onClick={() => setMobileOpen(false)}
                      >
                        Start Free Today
                      </Link>
                    </>
                  )
                ) : null}
              </div>
            </MobileNavDrawer>
          </div>
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
