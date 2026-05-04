"use client";

import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRankFromXp, RANKS, type RangerRank } from "@/lib/rangerHelpers";

export interface RankBadgeProps {
  xp: number;
  rank?: RangerRank;
  variant?: "compact" | "full" | "large";
  className?: string;
}

/** Surface + text + border for a rank tier (StreakCounter-style helper). */
export function rankBadgeClassName(rank: RangerRank): string {
  switch (rank) {
    case "cadet":
      return "text-gray-700 bg-gray-100 border-gray-200";
    case "scout":
      return "text-green-700 bg-green-50 border-green-300";
    case "ranger":
      return "text-emerald-700 bg-emerald-50 border-emerald-300";
    case "captain":
      return "text-blue-700 bg-blue-50 border-blue-300";
    case "hero":
      return "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent";
    default:
      return "text-gray-700 bg-gray-100 border-gray-200";
  }
}

/** Solid / gradient fill for progress bars by rank. */
export function rankProgressFillClassName(rank: RangerRank): string {
  switch (rank) {
    case "cadet":
      return "bg-gray-500";
    case "scout":
      return "bg-green-500";
    case "ranger":
      return "bg-emerald-500";
    case "captain":
      return "bg-blue-500";
    case "hero":
      return "bg-gradient-to-r from-purple-500 to-pink-500";
    default:
      return "bg-gray-500";
  }
}

function rankLabelFor(rankId: RangerRank): string {
  return RANKS.find((r) => r.id === rankId)?.label ?? "Cadet";
}

export function RankBadge({ xp, rank: rankOverride, variant = "full", className }: RankBadgeProps) {
  const tier: RangerRank = rankOverride ?? getRankFromXp(xp).id;
  const rankLabel = rankLabelFor(tier);
  const tierClasses = rankBadgeClassName(tier);
  const isHero = tier === "hero";

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold shadow-sm",
          tierClasses,
          className,
        )}
      >
        <Shield className={cn("h-3.5 w-3.5 shrink-0", isHero && "animate-pulse")} aria-hidden />
        {rankLabel}
      </span>
    );
  }

  if (variant === "large") {
    return (
      <div className={cn("flex flex-col items-center text-center", className)}>
        <Shield className={cn("mb-2 h-10 w-10 shrink-0", isHero && "animate-pulse")} aria-hidden />
        <span className="text-3xl font-bold text-gray-900">{rankLabel}</span>
        <span className="mt-1 text-base text-gray-600">{xp.toLocaleString()} XP</span>
      </div>
    );
  }

  const line = `${rankLabel} • ${xp.toLocaleString()} XP`;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold shadow-sm",
        tierClasses,
        className,
      )}
    >
      <Shield className={cn("h-4 w-4 shrink-0", isHero && "animate-pulse")} aria-hidden />
      {line}
    </span>
  );
}
