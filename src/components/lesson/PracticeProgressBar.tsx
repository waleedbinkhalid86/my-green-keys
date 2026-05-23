"use client";

import {
  effectivePracticeGoal,
  practiceProgressPct,
} from "@/lib/lesson-practice/constants";

type PracticeProgressBarProps = {
  count: number;
  goal: number;
  /** Compact single-line layout for cards */
  compact?: boolean;
  /** Hide the "Practiced X / Y times" label */
  hideLabel?: boolean;
};

export function PracticeProgressBar({
  count,
  goal,
  compact = false,
  hideLabel = false,
}: PracticeProgressBarProps) {
  const effectiveGoal = effectivePracticeGoal(goal);
  const pct = practiceProgressPct(count, effectiveGoal);
  const atGoal = count >= effectiveGoal;

  if (compact) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 800,
          color: atGoal ? "#1B4332" : "#2D6A4F",
        }}
        title={`Practiced ${count} of ${effectiveGoal} times`}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 36,
            padding: "2px 6px",
            borderRadius: 999,
            background: atGoal ? "#F2B705" : "#E8F5EE",
            color: atGoal ? "#1B4332" : "#2D6A4F",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count}/{effectiveGoal}
        </span>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {!hideLabel && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 5,
            fontSize: 12,
            fontWeight: 800,
            color: "#2D6A4F",
          }}
        >
          <span>
            Practiced {count} / {effectiveGoal} times
          </span>
          {atGoal ? (
            <span style={{ color: "#F2B705", fontSize: 11 }}>Goal reached!</span>
          ) : (
            <span style={{ color: "#52B788", fontSize: 11 }}>
              {effectiveGoal - count} to go
            </span>
          )}
        </div>
      )}
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: "#E8F5EE",
          overflow: "hidden",
          border: "1px solid rgba(45, 106, 79, 0.12)",
        }}
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={effectiveGoal}
        aria-label={`Practiced ${count} of ${effectiveGoal} times`}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: atGoal
              ? "linear-gradient(90deg, #F2B705, #52B788)"
              : "linear-gradient(90deg, #52B788, #2D6A4F)",
            transition: "width 0.35s ease",
          }}
        />
      </div>
    </div>
  );
}
