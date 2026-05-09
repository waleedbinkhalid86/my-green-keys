"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Gamepad2, GraduationCap } from "lucide-react";

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
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#1A2F23] text-white">
      <div className="mgk-container flex items-center justify-between gap-3 py-3">
        <Link href="/lesson" className="flex items-center gap-2 font-extrabold tracking-tight text-white">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#52B788]">
            <GraduationCap className="h-5 w-5" aria-hidden />
          </span>
          <span className="hidden sm:inline">My Green Keys</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/lesson-map"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-white/10"
          >
            <GraduationCap className="h-4 w-4" aria-hidden />
            Lessons
          </Link>

          <Link
            href="/brain-sprint"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-white/10"
          >
            <Brain className="h-4 w-4" aria-hidden />
            Brain Sprint
          </Link>

          <Link
            href="/games"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-white/10"
          >
            <Gamepad2 className="h-4 w-4" aria-hidden />
            Games
          </Link>
        </nav>
      </div>
    </header>
  );
}
