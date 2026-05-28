"use client";

import { effectivePracticeGoal } from "@/lib/lesson-practice/constants";

type LessonAttemptIndicatorProps = {
  /** Completions already recorded for this lesson */
  completedCount: number;
  goal: number;
};

/** Quiet corner label during multi-attempt practice (does not block typing). */
export function LessonAttemptIndicator({
  completedCount,
  goal,
}: LessonAttemptIndicatorProps) {
  const effectiveGoal = effectivePracticeGoal(goal);
  if (effectiveGoal <= 1) return null;

  const currentAttempt = Math.min(completedCount + 1, effectiveGoal);

  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "max(10px, env(safe-area-inset-bottom))",
        right: "max(10px, env(safe-area-inset-right))",
        zIndex: 40,
        padding: "5px 10px",
        borderRadius: 8,
        background: "rgba(240, 249, 244, 0.92)",
        border: "1px solid rgba(45, 106, 79, 0.18)",
        fontSize: 11,
        fontWeight: 700,
        color: "#2D6A4F",
        opacity: 0.78,
        fontVariantNumeric: "tabular-nums",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      Attempt {currentAttempt} of {effectiveGoal}
    </div>
  );
}
