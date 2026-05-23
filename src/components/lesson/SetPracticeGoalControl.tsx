"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_PRACTICE_GOAL,
  MAX_PRACTICE_GOAL,
  MIN_PRACTICE_GOAL,
  PRACTICE_GOAL_PRESETS,
  effectivePracticeGoal,
} from "@/lib/lesson-practice/constants";

type SetPracticeGoalControlProps = {
  lessonId: number;
  currentGoal: number;
  onGoalSaved: (goal: number) => void;
  /** Smaller layout for tight spaces */
  compact?: boolean;
};

export function SetPracticeGoalControl({
  lessonId,
  currentGoal,
  onGoalSaved,
  compact = false,
}: SetPracticeGoalControlProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(String(effectivePracticeGoal(currentGoal)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(String(effectivePracticeGoal(currentGoal)));
  }, [currentGoal, lessonId]);

  const saveGoal = async (value: number) => {
    const goal = Math.min(MAX_PRACTICE_GOAL, Math.max(MIN_PRACTICE_GOAL, Math.round(value)));
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/lesson/practice-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, practiceGoal: goal }),
      });
      const data = (await res.json()) as { practiceGoal?: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not save goal");
      const saved = effectivePracticeGoal(data.practiceGoal ?? goal);
      onGoalSaved(saved);
      setDraft(String(saved));
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save goal");
    } finally {
      setSaving(false);
    }
  };

  const handleCustomSave = () => {
    const n = Number(draft);
    if (!Number.isFinite(n)) {
      setError(`Enter a number from ${MIN_PRACTICE_GOAL} to ${MAX_PRACTICE_GOAL}`);
      return;
    }
    void saveGoal(n);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: compact ? "4px 8px" : "5px 10px",
          borderRadius: 999,
          border: "1px solid rgba(82, 183, 136, 0.45)",
          background: "#FFFFFF",
          color: "#2D6A4F",
          fontSize: compact ? 10 : 11,
          fontWeight: 800,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Set goal ({effectivePracticeGoal(currentGoal)})
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 50,
            minWidth: 200,
            padding: 12,
            borderRadius: 12,
            background: "#FFFFFF",
            border: "1px solid rgba(45, 106, 79, 0.15)",
            boxShadow: "0 12px 32px rgba(27, 67, 50, 0.15)",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, color: "#1B4332", marginBottom: 8 }}>
            Practice goal
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {PRACTICE_GOAL_PRESETS.map((preset) => {
              const active = effectivePracticeGoal(currentGoal) === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  disabled={saving}
                  onClick={() => void saveGoal(preset)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: active ? "2px solid #52B788" : "1px solid #C7ECD9",
                    background: active ? "#E8F5EE" : "#FAFAF5",
                    color: "#1B4332",
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: saving ? "wait" : "pointer",
                  }}
                >
                  {preset}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="number"
              min={MIN_PRACTICE_GOAL}
              max={MAX_PRACTICE_GOAL}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setError("");
              }}
              style={{
                width: 56,
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid #C7ECD9",
                fontSize: 13,
                fontWeight: 700,
                color: "#1B4332",
              }}
            />
            <button
              type="button"
              disabled={saving}
              onClick={handleCustomSave}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: 8,
                border: "none",
                background: "#52B788",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: 12,
                cursor: saving ? "wait" : "pointer",
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
          {error ? (
            <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: "#c62828" }}>{error}</div>
          ) : (
            <div style={{ marginTop: 8, fontSize: 10, color: "#6b7280", fontWeight: 600 }}>
              Default is {DEFAULT_PRACTICE_GOAL}. Pick {MIN_PRACTICE_GOAL}–{MAX_PRACTICE_GOAL}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
