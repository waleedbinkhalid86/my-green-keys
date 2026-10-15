"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SiteBrandLogoLink } from "@/components/SiteBrandLogoLink";

export function MinimalAuthShell({
  title,
  subtitle,
  children,
  className,
  sideImageSrc,
  sideImageAlt,
  sideTitle,
  sideSubtitle,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  sideImageSrc?: string;
  sideImageAlt?: string;
  sideTitle?: string;
  sideSubtitle?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#FAFAF5] font-sans text-[#1B4332]",
        "flex items-center justify-center",
        // Same dotted background as marketing pages
        "bg-[radial-gradient(circle,#D1D5DB_1px,transparent_1px)] bg-[size:20px_20px]",
        className
      )}
    >
      <div className={cn("w-full px-6 py-12", sideImageSrc ? "max-w-4xl" : "max-w-sm")}>
        <div
          className={cn(
            "mx-auto grid gap-10",
            sideImageSrc ? "items-stretch lg:grid-cols-[380px_1fr]" : "max-w-sm"
          )}
        >
          <div className="w-full">
            <div className="mb-8 flex justify-center">
              <SiteBrandLogoLink
                linkClassName="flex justify-center no-underline"
                imageClassName="h-11 w-11 md:h-[52px] md:w-[52px]"
                imageOnly
                imagePriority
              />
            </div>

            <h1 className="text-center text-[1.75rem] font-bold leading-tight text-[#1B4332]">{title}</h1>
            {subtitle ? <p className="mt-2 text-center text-base text-[#2D6A4F]">{subtitle}</p> : null}

            <div className="mt-8">{children}</div>
          </div>

          {sideImageSrc ? (
            <div
              className="relative hidden overflow-hidden bg-white lg:block"
              style={{
                borderRadius: "var(--mgk-radius-card)",
                border: "1px solid var(--mgk-border-card)",
                boxShadow: "var(--mgk-shadow-card)",
              }}
            >
              <Image
                src={sideImageSrc}
                alt={sideImageAlt ?? ""}
                fill
                sizes="(min-width: 1024px) 560px, 0px"
                className="object-cover"
                priority
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-white/92 via-white/35 to-transparent"
              />
              {(sideTitle || sideSubtitle) ? (
                <div className="absolute inset-x-0 bottom-0 p-6">
                  {sideTitle ? (
                    <p className="text-lg font-bold text-[#1B4332]">{sideTitle}</p>
                  ) : null}
                  {sideSubtitle ? (
                    <p className="mt-1 text-sm font-semibold text-[#2D6A4F]">{sideSubtitle}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

