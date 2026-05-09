"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";
import QuestBanner from "@/components/QuestBanner";

const HIDE_HEADER_PREFIXES = ["/login", "/signup"];

function isHidden(pathname: string): boolean {
  if (!pathname) return true;
  if (pathname === "/") return true; // homepage has its own fixed nav
  if (HIDE_HEADER_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  return false;
}

const QUEST_BANNER_HIDE_PREFIXES = [
  "/login",
  "/signup",
  "/admin",
  "/pricing",
  "/terms",
  "/privacy",
] as const;

const QUEST_BANNER_SHOW_PREFIXES = [
  "/lesson",
  "/lesson-map",
  "/games",
  "/brain-sprint",
  "/dashboard/parent",
  "/dashboard/teacher",
  "/certificate",
] as const;

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function shouldShowQuestBanner(pathname: string): boolean {
  if (!pathname) return false;
  if (pathname === "/") return false;
  if (
    QUEST_BANNER_HIDE_PREFIXES.some((p) => pathMatchesPrefix(pathname, p))
  ) {
    return false;
  }
  return QUEST_BANNER_SHOW_PREFIXES.some((p) =>
    pathMatchesPrefix(pathname, p)
  );
}

export default function ConditionalSiteHeader() {
  const pathname = usePathname() || "";
  if (isHidden(pathname)) return null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#1B4332] text-white py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/lesson" className="flex items-center gap-2 text-white">
            <Leaf className="h-6 w-6" aria-hidden />
            <span>My Green Keys</span>
          </Link>

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
        </div>
      </header>
      {shouldShowQuestBanner(pathname) ? <QuestBanner /> : null}
    </>
  );
}
