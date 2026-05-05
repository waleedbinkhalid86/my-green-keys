"use client";

import React from "react";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function MinimalAuthShell({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
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
      <div className="w-full max-w-sm px-6 py-12">
        <div className="mb-8 flex justify-center">
          <Leaf className="h-8 w-8 text-green-600" strokeWidth={2} aria-hidden />
        </div>

        <h1 className="text-center text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-center text-sm text-gray-500">{subtitle}</p>
        ) : null}

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

