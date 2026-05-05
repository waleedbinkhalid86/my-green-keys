"use client";

import Image from "next/image";

export type PetWidgetPetType = "panda" | "turtle";

export type PetWidgetProps = {
  petType: PetWidgetPetType | null;
  petName: string;
  health: number;
  pulse?: boolean;
  dance?: boolean;
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

  return (
    <div
      className={`pointer-events-none absolute top-2 right-2 z-40 hidden w-52 rounded-lg border border-emerald-200/50 bg-white/95 p-4 shadow-[0_8px_30px_rgba(26,47,35,0.12)] backdrop-blur-sm md:block ${className}`}
      aria-label={`${petName} wellness`}
    >
      <div className="mb-3 text-center text-base font-bold text-gray-800">{petName}</div>
      <div className={imageWrapperClass}>
        <Image
          src={src}
          alt={`${petName}, your ${petType} companion`}
          width={160}
          height={160}
          quality={90}
          className="mx-auto block h-40 w-40 object-contain"
        />
      </div>
      <div
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-gray-200"
        aria-label="Pet health"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${fillClass}`}
          style={{ width: `${h}%` }}
        />
      </div>
    </div>
  );
}
