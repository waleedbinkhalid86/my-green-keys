"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import QuestBanner from "@/components/QuestBanner";
import QuestAutoTrackToast from "@/components/QuestAutoTrackToast";
import { isQuestBannerAllowedPath } from "@/lib/quests/banner-routes";
import { MuteToggle } from "@/components/ui/MuteToggle";

const HIDE_HEADER_PREFIXES = ["/login", "/signup"];

function isHidden(pathname: string): boolean {
  if (!pathname) return true;
  if (pathname === "/") return true; // homepage has its own fixed nav
  if (HIDE_HEADER_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  return false;
}

export default function ConditionalSiteHeader() {
  const pathname = usePathname() || "";
  if (isHidden(pathname)) return null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#1B4332] text-white py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/lesson" className="flex items-center gap-3 text-white">
            <Image
              src="/logo-bgr.png"
              alt="My Green Keys logo"
              width={52}
              height={52}
              className="h-11 w-11 shrink-0 md:h-[52px] md:w-[52px]"
              priority
            />
            <span className="leading-tight">My Green Keys</span>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="flex gap-6">
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
            <MuteToggle />
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
