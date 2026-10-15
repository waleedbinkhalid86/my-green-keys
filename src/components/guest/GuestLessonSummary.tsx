"use client";

type GuestLessonSummaryProps = {
  awarded: number;
  totalXp: number;
  streak: number;
};

/** Guest-only XP and streak line in the lesson completion overlay (local store values). */
export function GuestLessonSummary({ awarded, totalXp, streak }: GuestLessonSummaryProps) {
  return (
    <div
      data-testid="guest-lesson-summary"
      style={{
        position: "relative",
        marginBottom: 12,
        padding: "8px 12px",
        borderRadius: 14,
        background: "#F0F9F4",
        border: "1px solid rgba(82, 183, 136, 0.35)",
        color: "#1B4332",
        fontSize: 13,
        fontWeight: 800,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "4px 14px",
      }}
    >
      <span>
        <span style={{ color: "#2D6A4F" }}>+{awarded} XP</span> · {totalXp} XP total
      </span>
      <span>
        {streak} {streak === 1 ? "day" : "days"} streak
      </span>
    </div>
  );
}
