"use client";

import { useEffect } from "react";
import { Shield, Sparkles, X } from "lucide-react";
import { RANKS, type RangerRank, type XpAwardResult } from "@/lib/rangerHelpers";
import { rankBadgeClassName } from "@/components/RankBadge";
import { cn } from "@/lib/utils";

export interface RankUpCelebrationProps {
  xpAwarded: XpAwardResult | null;
  onClose: () => void;
}

const RAINBOW = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];

function shieldIconClass(rankId: RangerRank): string {
  switch (rankId) {
    case "hero":
      return "text-white";
    case "cadet":
      return "text-gray-600";
    case "scout":
      return "text-green-600";
    case "ranger":
      return "text-emerald-600";
    case "captain":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
}

export function RankUpCelebration({ xpAwarded, onClose }: RankUpCelebrationProps) {
  useEffect(() => {
    if (!xpAwarded?.rankUp) {
      return;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let synth: { dispose: () => void; triggerAttackRelease: (n: string[], d: number, t: number) => void } | null =
      null;

    const rankAfter = RANKS.find((r) => r.id === xpAwarded.rankAfter);
    const isHero = rankAfter?.id === "hero";

    const run = async () => {
      if (!reduced) {
        const confetti = (await import("canvas-confetti")).default;
        const colors = isHero ? RAINBOW : ["#22c55e", "#a855f7", "#ec4899", "#eab308", "#3b82f6"];
        const fire = () => {
          if (!cancelled) {
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { x: 0.5, y: 0.45 },
              colors,
            });
          }
        };
        fire();
        timeouts.push(setTimeout(fire, 1000));
        timeouts.push(setTimeout(fire, 2000));
      }

      if (!reduced) {
        try {
          const Tone = await import("tone");
          await Tone.start();
          synth = new Tone.PolySynth(Tone.Synth).toDestination();
          const chords: string[][] = [["C4"], ["E4"], ["G4"], ["C5"]];
          const now = Tone.now();
          chords.forEach((notes, i) => {
            synth!.triggerAttackRelease(notes, 0.25, now + i * 0.25);
          });
          timeouts.push(
            setTimeout(() => {
              synth?.dispose();
              synth = null;
            }, 1200),
          );
        } catch {
          /* ignore audio init failures */
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
      synth?.dispose();
    };
  }, [xpAwarded]);

  if (!xpAwarded?.rankUp) {
    return null;
  }

  const rankAfter = RANKS.find((r) => r.id === xpAwarded.rankAfter);
  const nextRank = RANKS.find((r) => r.xpRequired > xpAwarded.totalXp) ?? null;
  const heroTierSurface = rankBadgeClassName("hero");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rank-up-title"
    >
      <div
        className={cn(
          "relative mx-auto max-w-md scale-100 rounded-3xl bg-white p-12 shadow-2xl",
          "animate-in zoom-in-95 fade-in duration-300",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          {xpAwarded.rankAfter === "hero" ? (
            <div
              className={cn(
                "mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2",
                heroTierSurface,
              )}
            >
              <Shield className="h-16 w-16 animate-pulse text-white" aria-hidden />
            </div>
          ) : (
            <div className="mx-auto flex justify-center">
              <Shield className={cn("h-16 w-16 animate-pulse", shieldIconClass(xpAwarded.rankAfter))} aria-hidden />
            </div>
          )}

          <p className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider text-purple-600">
            <Sparkles className="h-4 w-4" aria-hidden />
            RANK UP!
          </p>

          <h2 id="rank-up-title" className="mt-2 text-5xl font-bold text-gray-900">
            {rankAfter?.label ?? "New rank"}
          </h2>

          <p className="mt-3 text-lg text-gray-600">{rankAfter?.description ?? ""}</p>

          <p className="mt-6 text-base font-semibold text-gray-800">
            {xpAwarded.totalXp.toLocaleString()} XP earned
          </p>

          {nextRank ? (
            <p className="mt-2 text-sm text-gray-500">
              Next rank: {nextRank.label} at {nextRank.xpRequired.toLocaleString()} XP
            </p>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="mt-10 w-full rounded-full bg-purple-500 px-8 py-3 text-lg font-bold text-white shadow-md transition hover:bg-purple-600"
          >
            Continue your journey
          </button>
        </div>
      </div>
    </div>
  );
}
