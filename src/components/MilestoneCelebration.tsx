"use client";

import { useEffect } from "react";
import { Award, Leaf, Snowflake, X } from "lucide-react";
import type { StreakUpdateResult } from "@/lib/streakHelpers";

const MILESTONE_HEADLINES: Record<number, string> = {
  3: "On a roll!",
  7: "Week Warrior!",
  14: "Two-week streak!",
  30: "Monthly Master!",
  60: "60-day legend!",
  100: "Century Club!",
};

export interface MilestoneCelebrationProps {
  streakUpdate: StreakUpdateResult | null;
  onClose: () => void;
}

export function MilestoneCelebration({ streakUpdate, onClose }: MilestoneCelebrationProps) {
  useEffect(() => {
    if (!streakUpdate?.isNewMilestone) {
      return;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let synth: { dispose: () => void; triggerAttackRelease: (n: string[], d: number, t: number) => void } | null =
      null;

    const run = async () => {
      if (!reduced) {
        const confetti = (await import("canvas-confetti")).default;
        const fire = () => {
          if (!cancelled) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { x: 0.5, y: 0.5 },
              colors: ["#22c55e", "#a855f7", "#ec4899", "#eab308", "#3b82f6"],
            });
          }
        };
        fire();
        timeouts.push(setTimeout(fire, 1500));
        timeouts.push(setTimeout(fire, 3000));
      }

      if (!reduced) {
        try {
          const Tone = await import("tone");
          await Tone.start();
          synth = new Tone.PolySynth(Tone.Synth).toDestination();
          const chords: string[][] = [
            ["C4", "E4", "G4"],
            ["F4", "A4", "C5"],
            ["G4", "B4", "D5"],
            ["C4", "E4", "G4"],
          ];
          const now = Tone.now();
          chords.forEach((notes, i) => {
            synth!.triggerAttackRelease(notes, 0.2, now + i * 0.2);
          });
          timeouts.push(
            setTimeout(() => {
              synth?.dispose();
              synth = null;
            }, 900),
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
  }, [streakUpdate]);

  if (!streakUpdate?.isNewMilestone) {
    return null;
  }

  const day = streakUpdate.milestoneDay;
  const headline =
    day !== null && MILESTONE_HEADLINES[day] ? MILESTONE_HEADLINES[day]! : "Milestone reached!";

  const freezeLabel =
    streakUpdate.rewardFreeze === 1 ? "+1 streak freeze" : `+${streakUpdate.rewardFreeze} streak freezes`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="milestone-title"
    >
      <div className="relative mx-auto max-w-md rounded-3xl bg-white p-12 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <p className="text-7xl font-bold text-green-600 tabular-nums">{streakUpdate.newStreak}</p>
          <h2 id="milestone-title" className="mt-4 text-2xl font-extrabold text-gray-900">
            {headline}
          </h2>
          <p className="mt-2 text-xl text-gray-700">Day {streakUpdate.newStreak} streak</p>

          <ul className="mt-8 space-y-3 text-left text-base font-semibold text-gray-800">
            {streakUpdate.rewardEcoPoints > 0 ? (
              <li className="flex items-center gap-2">
                <Leaf className="h-5 w-5 shrink-0 text-green-600" aria-hidden />
                <span>+{streakUpdate.rewardEcoPoints} eco points</span>
              </li>
            ) : null}
            {streakUpdate.rewardFreeze > 0 ? (
              <li className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 shrink-0 text-sky-600" aria-hidden />
                <span>{freezeLabel}</span>
              </li>
            ) : null}
            {streakUpdate.rewardBadge ? (
              <li className="flex items-center gap-2">
                <Award className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
                <span>Earned: {streakUpdate.rewardBadge}</span>
              </li>
            ) : null}
          </ul>

          <button
            type="button"
            onClick={onClose}
            className="mt-10 w-full rounded-full bg-green-500 px-8 py-3 text-lg font-bold text-white shadow-md transition hover:bg-green-600"
          >
            Keep going!
          </button>
        </div>
      </div>
    </div>
  );
}
