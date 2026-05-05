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
      ? `pointer-events-none relative z-10 w-full max-w-[208px] rounded-md border border-emerald-200/50 bg-white p-3 shadow-[0_8px_30px_rgba(26,47,35,0.12)] ${className}`
      : `pointer-events-none absolute top-2 right-2 z-40 hidden w-52 rounded-md border border-emerald-200/50 bg-white/95 p-4 shadow-[0_8px_30px_rgba(26,47,35,0.12)] backdrop-blur-sm md:block ${className}`;

  return (
    <div className={shell} aria-label={`${petName} wellness`}>
      <div className={`text-center font-bold text-gray-800 ${placement === "sidebar" ? "mb-2 text-sm" : "mb-3 text-base"}`}>
        {petName}
      </div>
      <div className={imageWrapperClass}>
        <Image
          src={src}
          alt={`${petName}, your ${petType} companion`}
          width={160}
          height={160}
          quality={90}
          className={placement === "sidebar" ? "mx-auto block h-32 w-32 object-contain" : "mx-auto block h-40 w-40 object-contain"}
        />
      </div>
      <div
        className={`h-2.5 w-full overflow-hidden rounded-md bg-gray-200 ${placement === "sidebar" ? "mt-3" : "mt-4"}`}
        aria-label="Pet health"
      >
        <div
          className={`h-full rounded-md transition-[width] duration-500 ease-out ${fillClass}`}
          style={{ width: `${h}%` }}
        />
      </div>
    </div>
  );
}
