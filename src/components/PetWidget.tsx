"use client";

import Image from "next/image";

export type PetWidgetPetType = "panda" | "turtle";

export type PetWidgetProps = {
  petType: PetWidgetPetType | null;
  petName: string;
  health: number;
  pulse?: boolean;
  dance?: boolean;
  /** "overlay" = absolute corner on typing card (legacy). "sidebar" = static column beside keyboard. */
  placement?: "overlay" | "sidebar";
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function PetWidget({
  petType,
  petName,
  health,
  pulse = false,
  dance = false,
  placement = "overlay",
  className = "",
}: PetWidgetProps) {
  const h = clamp(health, 0, 100);
  const state = h >= 70 ? "happy" : h >= 40 ? "neutral" : "sad";

  if (petType !== "panda" && petType !== "turtle") return null;
  if (!petName.trim()) return null;

  const src = `/images/pets/pet-${petType}-${state}.png`;

  const fillClass =
    state === "happy" ? "bg-emerald-500" : state === "neutral" ? "bg-amber-500" : "bg-orange-600";

  const statusMessage =
    state === "happy" ? "I'm so happy" : state === "neutral" ? "Doing okay" : "I miss you";

  const imageWrapperClass = [
    "relative mx-auto block",
    state === "sad" ? "opacity-90" : "",
    pulse ? "pet-pulse" : "",
    dance ? "pet-dance" : state === "happy" ? "animate-bounce-slow" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const shell =
    placement === "sidebar"
      ? `pointer-events-none relative z-10 flex w-full max-w-60 flex-col items-center p-6 text-center ${className}`
      : `pointer-events-none absolute top-2 right-2 z-40 hidden w-full max-w-60 flex-col items-center p-6 text-center md:flex md:flex-col ${className}`;

  return (
    <div className={shell} aria-label={`${petName} wellness`}>
      <div className="mb-3 text-center text-lg font-bold text-slate-800">{petName}</div>
      <div className="relative mx-auto flex shrink-0 items-center justify-center">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(46,204,113,0.12)_0%,transparent_68%)]"
          aria-hidden
        />
        <div className={imageWrapperClass}>
          <Image
            src={src}
            alt={`${petName}, your ${petType} companion`}
            width={200}
            height={200}
            quality={90}
            className="mx-auto block h-[200px] w-[200px] object-contain"
          />
        </div>
      </div>
      <div
        className="mx-auto mt-4 h-3 w-40 overflow-hidden rounded-full bg-slate-200/90"
        aria-label="Pet health"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${fillClass}`}
          style={{ width: `${h}%` }}
        />
      </div>
      <div className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        Health
      </div>
      <p className="mt-2 text-center text-sm font-medium text-slate-600">{statusMessage}</p>
    </div>
  );
}
