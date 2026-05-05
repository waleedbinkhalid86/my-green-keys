import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StreakCounterProps {
  streak: number;
  variant?: "floating" | "inline" | "large";
  className?: string;
}

/** Surface + border + default text color (same tiers as the streak badge). */
export function streakTierSurfaceClassName(streak: number): string {
  if (streak >= 100) {
    return "border-transparent bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md";
  }
  if (streak >= 30) {
    return "border-purple-300 bg-purple-50 text-purple-700";
  }
  if (streak >= 7) {
    return "border-yellow-300 bg-yellow-50 text-yellow-700";
  }
  if (streak >= 3) {
    return "border-green-300 bg-green-50 text-green-700";
  }
  if (streak >= 1) {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }
  return "border-gray-200 bg-gray-100 text-gray-500";
}

export function StreakCounter({ streak, variant = "floating", className }: StreakCounterProps) {
  if (streak === 0) {
    return null;
  }

  const tier = streakTierSurfaceClassName(streak);
  const isLegendary = streak >= 100;

  if (variant === "large") {
    return (
      <div
        className={cn(
          "inline-flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-6 py-4 text-center text-3xl",
          tier,
          className,
        )}
      >
        <span className={cn("font-bold tabular-nums", isLegendary && "text-white")}>{streak}</span>
        <span className={cn("text-base font-semibold", isLegendary ? "text-white/95" : "text-gray-600")}>
          day streak
        </span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-semibold",
          tier,
          className,
        )}
      >
        <Flame className="h-4 w-4 shrink-0 animate-pulse" aria-hidden />
        <span className="font-bold tabular-nums">{streak}</span>
        <span className={cn("text-xs font-medium", isLegendary ? "text-white/90" : "opacity-90")}>day streak</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 bg-white px-4 py-2.5 shadow-lg backdrop-blur-sm",
        tier,
        className,
      )}
    >
      <Flame className="h-5 w-5 shrink-0 animate-pulse" aria-hidden />
      <span className="text-lg font-bold tabular-nums">{streak}</span>
      <span className={cn("text-xs font-semibold", isLegendary ? "text-white/90" : "opacity-90")}>day streak</span>
    </div>
  );
}
