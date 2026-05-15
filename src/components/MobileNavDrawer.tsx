"use client";

import { Menu, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

const FOREST_GREEN = "#1B4332";

export const mobileDrawerLinkClass =
  "flex min-h-12 items-center rounded-md px-4 text-base font-semibold text-white/95 no-underline transition-colors hover:bg-white/10 hover:text-[#52B788]";

type MobileNavDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  /** Hamburger icon color class, e.g. `text-white` or `text-[#1B4332]` */
  hamburgerClassName?: string;
  drawerBackground?: string;
};

export function MobileNavDrawer({
  open,
  onOpenChange,
  children,
  hamburgerClassName = "text-white",
  drawerBackground = FOREST_GREEN,
}: MobileNavDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setSlideIn(false);
      return;
    }
    const frame = requestAnimationFrame(() => setSlideIn(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const drawer =
    mounted && open
      ? createPortal(
          <div className="fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              aria-label="Close menu"
              onClick={() => onOpenChange(false)}
            />
            <div
              className={[
                "absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col shadow-2xl transition-transform duration-300 ease-out",
                slideIn ? "translate-x-0" : "translate-x-full",
              ].join(" ")}
              style={{ background: drawerBackground }}
            >
              <div className="flex shrink-0 items-center justify-end px-4 pt-4">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10"
                  aria-label="Close menu"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-6 w-6" strokeWidth={2} aria-hidden />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-8">{children}</nav>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className={[
          "inline-flex h-7 w-7 shrink-0 items-center justify-center md:hidden",
          hamburgerClassName,
        ].join(" ")}
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => onOpenChange(true)}
      >
        <Menu className="h-7 w-7" strokeWidth={2} aria-hidden />
      </button>
      {drawer}
    </>
  );
}
