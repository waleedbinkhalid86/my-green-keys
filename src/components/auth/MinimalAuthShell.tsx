"use client";

import React from "react";
import Image from "next/image";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "min-h-screen bg-[#FAFAFA] font-sans text-gray-900",
        "flex items-center justify-center",
        // Subtle dot grid pattern (Linear-like)
        "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:18px_18px]",
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
              <Leaf className="h-8 w-8 text-green-600" strokeWidth={2} aria-hidden />
            </div>

            <h1 className="text-center text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
            {subtitle ? <p className="mt-2 text-center text-sm text-gray-500">{subtitle}</p> : null}

            <div className="mt-8">{children}</div>
          </div>

          {sideImageSrc ? (
            <div className="relative hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
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
                    <p className="text-base font-extrabold text-[#1A2F23]">{sideTitle}</p>
                  ) : null}
                  {sideSubtitle ? (
                    <p className="mt-1 text-sm font-semibold text-[#64748b]">{sideSubtitle}</p>
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

