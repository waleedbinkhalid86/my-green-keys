"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import type { QuestDays, StrictnessPreset } from "@/lib/quests/types";

const FORM_LABEL: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#1B4332",
  marginBottom: "8px",
  display: "block",
};

const FORM_CONTROL: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "2px solid #E5E7EB",
  fontSize: "14px",
  background: "#FFFFFF",
  transition: "border 0.2s",
  outline: "none",
  boxSizing: "border-box",
};

export type HabitQuestFormFieldsProps = {
  idPrefix: string;
  title: string;
  setTitle: (v: string) => void;
  action1: string;
  setAction1: (v: string) => void;
  action2: string;
  setAction2: (v: string) => void;
  action3: string;
  setAction3: (v: string) => void;
  daysTarget: QuestDays;
  setDaysTarget: (v: QuestDays) => void;
  reward: string;
  setReward: (v: string) => void;
  strictnessPreset: StrictnessPreset;
  setStrictnessPreset: (v: StrictnessPreset) => void;
  customSkipDays: number;
  setCustomSkipDays: (v: number) => void;
  customResetAfter: number;
  setCustomResetAfter: (v: number) => void;
  formErrors: Record<string, string>;
};

export function HabitQuestFormFields({
  idPrefix,
  title,
  setTitle,
  action1,
  setAction1,
  action2,
  setAction2,
  action3,
  setAction3,
  daysTarget,
  setDaysTarget,
  reward,
  setReward,
  strictnessPreset,
  setStrictnessPreset,
  customSkipDays,
  setCustomSkipDays,
  customResetAfter,
  setCustomResetAfter,
  formErrors,
}: HabitQuestFormFieldsProps) {
  const radioName = `strictness-${idPrefix || "create"}`;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor={`${idPrefix}quest-title`} style={FORM_LABEL}>
          Title
        </label>
        <Input
          id={`${idPrefix}quest-title`}
          className="focus-visible:border-[#52B788] focus-visible:ring-[#52B788]/20"
          style={FORM_CONTROL}
          maxLength={60}
          placeholder="e.g. Become a Reading Star"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <p className="mt-1 text-xs text-[#6B7280]">{title.length}/60</p>
        {formErrors.title ? (
          <p className="text-sm font-semibold text-destructive">{formErrors.title}</p>
        ) : null}
      </div>

      <div className="space-y-4">
        <span style={FORM_LABEL}>Action plan</span>
        <div>
          <Input
            className="focus-visible:border-[#52B788] focus-visible:ring-[#52B788]/20"
            style={FORM_CONTROL}
            placeholder="e.g. Read for 20 minutes"
            value={action1}
            onChange={(e) => setAction1(e.target.value)}
          />
          {formErrors.action1 ? (
            <p className="mt-1 text-sm font-semibold text-destructive">{formErrors.action1}</p>
          ) : null}
        </div>
        <div>
          <Input
            className="focus-visible:border-[#52B788] focus-visible:ring-[#52B788]/20"
            style={FORM_CONTROL}
            placeholder="e.g. Write 1 sentence about it"
            value={action2}
            onChange={(e) => setAction2(e.target.value)}
          />
          {formErrors.action2 ? (
            <p className="mt-1 text-sm font-semibold text-destructive">{formErrors.action2}</p>
          ) : null}
        </div>
        <div>
          <Input
            className="focus-visible:border-[#52B788] focus-visible:ring-[#52B788]/20"
            style={FORM_CONTROL}
            placeholder="e.g. Tell mom about it (optional)"
            value={action3}
            onChange={(e) => setAction3(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}quest-length`} style={FORM_LABEL}>
          Quest length
        </label>
        <select
          id={`${idPrefix}quest-length`}
          className="focus:border-[#52B788]"
          style={{ ...FORM_CONTROL, height: "48px", cursor: "pointer" }}
          value={daysTarget}
          onChange={(e) => setDaysTarget(Number(e.target.value) as QuestDays)}
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={20}>20 days</option>
          <option value={30}>30 days</option>
        </select>
        {formErrors.days ? (
          <p className="mt-1 text-sm font-semibold text-destructive">{formErrors.days}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${idPrefix}quest-reward`} style={FORM_LABEL}>
          Reward
        </label>
        <Input
          id={`${idPrefix}quest-reward`}
          className="focus-visible:border-[#52B788] focus-visible:ring-[#52B788]/20"
          style={FORM_CONTROL}
          maxLength={100}
          placeholder="e.g. New book of your choice"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
        />
        <p className="mt-1 text-xs text-[#6B7280]">{reward.length}/100</p>
        {formErrors.reward ? (
          <p className="mt-1 text-sm font-semibold text-destructive">{formErrors.reward}</p>
        ) : null}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={FORM_LABEL}>
          <span aria-hidden>⚙️</span> Strictness
        </label>
        <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>
          How forgiving should this quest be?
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "12px",
              border: strictnessPreset === "easy" ? "2px solid #52B788" : "2px solid #E5E7EB",
              background: strictnessPreset === "easy" ? "#F0F9F4" : "#FFFFFF",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <input
              type="radio"
              name={radioName}
              value="easy"
              checked={strictnessPreset === "easy"}
              onChange={() => setStrictnessPreset("easy")}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#1B4332" }}>🟢 Easy</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>
                3 skip days · reset after 5 misses
              </div>
            </div>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "12px",
              border: strictnessPreset === "normal" ? "2px solid #52B788" : "2px solid #E5E7EB",
              background: strictnessPreset === "normal" ? "#F0F9F4" : "#FFFFFF",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <input
              type="radio"
              name={radioName}
              value="normal"
              checked={strictnessPreset === "normal"}
              onChange={() => setStrictnessPreset("normal")}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#1B4332" }}>
                🟡 Normal{" "}
                <span style={{ fontSize: 11, color: "#52B788", marginLeft: 6 }}>RECOMMENDED</span>
              </div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>
                2 skip days · reset after 3 misses
              </div>
            </div>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "12px",
              border: strictnessPreset === "strict" ? "2px solid #52B788" : "2px solid #E5E7EB",
              background: strictnessPreset === "strict" ? "#F0F9F4" : "#FFFFFF",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <input
              type="radio"
              name={radioName}
              value="strict"
              checked={strictnessPreset === "strict"}
              onChange={() => setStrictnessPreset("strict")}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#1B4332" }}>🔴 Strict</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>
                0 skip days · reset after 1 miss
              </div>
            </div>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "12px",
              border: strictnessPreset === "custom" ? "2px solid #52B788" : "2px solid #E5E7EB",
              background: strictnessPreset === "custom" ? "#F0F9F4" : "#FFFFFF",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <input
              type="radio"
              name={radioName}
              value="custom"
              checked={strictnessPreset === "custom"}
              onChange={() => setStrictnessPreset("custom")}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#1B4332" }}>⚙️ Custom</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>Set your own rules</div>
            </div>
          </label>

          {strictnessPreset === "custom" ? (
            <div
              style={{
                background: "#F9FAFB",
                padding: "16px",
                borderRadius: "12px",
                marginTop: "8px",
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 180 }}>
                <label
                  style={{
                    fontSize: 12,
                    color: "#4A6355",
                    fontWeight: 700,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Skip days
                </label>
                <select
                  value={customSkipDays}
                  onChange={(e) => setCustomSkipDays(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "2px solid #E5E7EB",
                    fontSize: 14,
                    background: "#FFFFFF",
                  }}
                >
                  <option value={0}>0 (no skips)</option>
                  <option value={1}>1 skip day</option>
                  <option value={2}>2 skip days</option>
                  <option value={3}>3 skip days</option>
                  <option value={4}>4 skip days</option>
                  <option value={5}>5 skip days</option>
                  <option value={7}>7 skip days</option>
                  <option value={10}>10 skip days</option>
                </select>
              </div>

              <div style={{ flex: 1, minWidth: 180 }}>
                <label
                  style={{
                    fontSize: 12,
                    color: "#4A6355",
                    fontWeight: 700,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Reset after misses
                </label>
                <select
                  value={customResetAfter}
                  onChange={(e) => setCustomResetAfter(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "2px solid #E5E7EB",
                    fontSize: 14,
                    background: "#FFFFFF",
                  }}
                >
                  <option value={1}>1 missed day</option>
                  <option value={2}>2 missed days</option>
                  <option value={3}>3 missed days</option>
                  <option value={4}>4 missed days</option>
                  <option value={5}>5 missed days</option>
                  <option value={6}>6 missed days</option>
                  <option value={7}>7 missed days</option>
                  <option value={10}>10 missed days</option>
                </select>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
