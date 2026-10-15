"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SiteBrandLogoLink } from "@/components/SiteBrandLogoLink";
import { GlobalLogoutButton } from "@/components/GlobalLogoutButton";
import { MobileNavDrawer, mobileDrawerLinkClass } from "@/components/MobileNavDrawer";
import { useAuthProfileRoute } from "@/contexts/AuthProfileRouteContext";
import { Container } from "./Container";
import { PrimaryButton } from "./Buttons";

const NAV_LINKS = [
  { href: "/pricing", label: "Free access" },
  { href: "/schools", label: "For schools" },
  { href: "/story", label: "Story" },
  { href: "/blog", label: "Blog" },
] as const;

/** Paths that show this nav instead of the kid-app header. */
export const MARKETING_NAV_PATHS = ["/", "/pricing", "/schools", "/story", "/blog"] as const;

export function isMarketingNavPath(pathname: string): boolean {
  return MARKETING_NAV_PATHS.some((p) =>
    p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingNav() {
  const pathname = usePathname() || "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const { authReady, isLoggedIn } = useAuthProfileRoute();
  const close = () => setMobileOpen(false);

  return (
    <header className="mgk-mnav">
      <Container>
        <div className="mgk-mnav__bar">
          <SiteBrandLogoLink
            linkClassName="flex min-w-0 items-center gap-3 text-white no-underline"
            imageClassName="h-12 w-12 shrink-0 lg:h-[60px] lg:w-[60px]"
            spanClassName="whitespace-nowrap text-[1.05rem] font-bold leading-tight md:hidden lg:inline"
            imagePriority
          />

          <nav className="mgk-mnav__links" aria-label="Main">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="mgk-mnav__link"
                aria-current={isActive(pathname, l.href) ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="mgk-mnav__actions">
            {!authReady ? null : isLoggedIn ? (
              <GlobalLogoutButton />
            ) : (
              <>
                <Link href="/kid-login" className="mgk-mnav__link">
                  Kid login
                </Link>
                <Link href="/login" className="mgk-mnav__link">
                  Log in
                </Link>
                <PrimaryButton href="/signup" onDark>
                  Start free
                </PrimaryButton>
              </>
            )}
          </div>

          <MobileNavDrawer open={mobileOpen} onOpenChange={setMobileOpen} hamburgerClassName="text-white">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={mobileDrawerLinkClass}
                aria-current={isActive(pathname, l.href) ? "page" : undefined}
                onClick={close}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-white/10 px-1 pt-4">
              {!authReady ? null : isLoggedIn ? (
                <div className="flex justify-center" onClick={close}>
                  <GlobalLogoutButton />
                </div>
              ) : (
                <>
                  <Link href="/kid-login" className={mobileDrawerLinkClass} onClick={close}>
                    Kid login
                  </Link>
                  <Link href="/login" className={mobileDrawerLinkClass} onClick={close}>
                    Log in
                  </Link>
                  <PrimaryButton href="/signup" onDark block onClick={close}>
                    Start free
                  </PrimaryButton>
                </>
              )}
            </div>
          </MobileNavDrawer>
        </div>
      </Container>
    </header>
  );
}
