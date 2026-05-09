"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, ScrollText } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { createQuest, deleteQuest, fetchActiveQuests, fetchCompletedQuests } from "@/lib/quests/api";
import type { Quest, QuestDays } from "@/lib/quests/types";

const SECTION_SHELL: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  border: "1px solid #E5E7EB",
  marginBottom: "24px",
  scrollMarginTop: "112px",
};

const SECTION_H2: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#1B4332",
  marginBottom: "20px",
};

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

const PRIMARY_CTA: React.CSSProperties = {
  background: "linear-gradient(135deg, #52B788 0%, #40916C 100%)",
  color: "#FFFFFF",
  padding: "14px 24px",
  borderRadius: "12px",
  fontSize: "15px",
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
  width: "100%",
  marginTop: "16px",
  boxShadow: "0 4px 12px rgba(82, 183, 136, 0.25)",
};

const ACTIVE_QUEST_CARD: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "16px",
  padding: "24px",
  border: "1px solid #E5E7EB",
  borderLeft: "4px solid #52B788",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
};

function sortCompletedForDisplay(quests: Quest[]): Quest[] {
  return [...quests]
    .sort((a, b) => {
      const ta = new Date(a.completed_at || a.failed_at || a.created_at).getTime();
      const tb = new Date(b.completed_at || b.failed_at || b.created_at).getTime();
      return tb - ta;
    })
    .slice(0, 10);
}

function formatHistoryDate(q: Quest): string {
  const raw = q.completed_at || q.failed_at || q.created_at;
  try {
    return new Date(raw).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return raw;
  }
}

export function HabitQuestsSection() {
  const { showToast } = useToast();
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [action1, setAction1] = useState("");
  const [action2, setAction2] = useState("");
  const [action3, setAction3] = useState("");
  const [daysTarget, setDaysTarget] = useState<QuestDays>(7);
  const [reward, setReward] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refreshQuests = useCallback(async () => {
    setLoadError("");
    try {
      const [active, completed] = await Promise.all([fetchActiveQuests(), fetchCompletedQuests()]);
      setActiveQuests(active as Quest[]);
      setCompletedQuests(sortCompletedForDisplay(completed as Quest[]));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load quests.";
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshQuests();
  }, [refreshQuests]);

  const validateForm = (): boolean => {
    const next: Record<string, string> = {};
    const t = title.trim();
    if (!t) next.title = "Title is required.";
    else if (t.length > 60) next.title = "Title must be 60 characters or less.";
    const a1 = action1.trim();
    const a2 = action2.trim();
    if (!a1) next.action1 = "Add at least two actions.";
    if (!a2) next.action2 = "Add at least two actions.";
    const r = reward.trim();
    if (!r) next.reward = "Reward is required.";
    else if (r.length > 100) next.reward = "Reward must be 100 characters or less.";
    if (![7, 14, 20, 30].includes(daysTarget)) next.days = "Choose a quest length.";
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeQuests.length >= 3) return;
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const plan = [action1.trim(), action2.trim()];
      const a3 = action3.trim();
      if (a3) plan.push(a3);
      await createQuest({
        title: title.trim(),
        action_plan: plan,
        days_target: daysTarget,
        reward: reward.trim(),
      });
      showToast("success", "Quest created! 🌟");
      setTitle("");
      setAction1("");
      setAction2("");
      setAction3("");
      setDaysTarget(7);
      setReward("");
      setFormErrors({});
      await refreshQuests();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create quest.";
      showToast("error", message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteQuest(deleteId);
      showToast("success", "Quest removed.");
      setDeleteId(null);
      await refreshQuests();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not delete quest.";
      showToast("error", message);
    } finally {
      setDeleting(false);
    }
  };

  const atMaxActive = activeQuests.length >= 3;

  return (
    <section id="parent-quests" style={SECTION_SHELL}>
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete this quest?</DialogTitle>
            <DialogDescription>
              This removes the quest and its progress. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-[#D1E8DC]"
              disabled={deleting}
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-full"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting ? "Deleting…" : "Delete quest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-6 flex flex-wrap items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#2D6A4F]/10 text-[#1B4332]">
          <ScrollText className="size-7" strokeWidth={2.25} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 style={SECTION_H2}>Habit Quests</h2>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-[#4A6355]">
            Design custom daily challenges for your child. They build the habit, you set the reward. Win-win.
          </p>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {loadError}
          <p className="mt-2 text-xs font-normal text-destructive/90">
            If you have not run the Habit Quests SQL migration in Supabase yet, open the SQL editor and
            run the script from{" "}
            <code className="rounded bg-white/80 px-1">supabase/migrations/habit_quests.sql</code>.
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        <h3 className="font-heading text-lg font-bold text-[#1B4332]">Active Quests</h3>
        {loading ? (
          <div className="mgk-skeleton h-40 rounded-2xl" />
        ) : activeQuests.length === 0 ? (
          <div
            style={{
              ...ACTIVE_QUEST_CARD,
              borderLeft: "1px solid #E5E7EB",
              textAlign: "center",
              fontWeight: 600,
              color: "#4A6355",
            }}
          >
            No active quests yet. Create one below!
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {activeQuests.map((q) => {
              const pct = q.days_target > 0 ? Math.min(100, (q.current_day / q.days_target) * 100) : 0;
              return (
                <div key={q.id} style={ACTIVE_QUEST_CARD}>
                  <h4 className="text-lg font-bold text-[#1B4332]">{q.title}</h4>
                  <p className="mt-1 text-sm font-semibold text-[#52B788]">{q.days_target}-day quest</p>
                  <ul className="mt-4 list-inside list-disc space-y-1 text-sm font-medium text-[#374151]">
                    {(Array.isArray(q.action_plan) ? q.action_plan : []).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm font-semibold text-[#1B4332]">
                    Reward: <span className="font-bold text-[#2D6A4F]">{q.reward}</span>
                  </p>
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-sm font-semibold text-[#374151]">
                      <span>
                        Day {q.current_day} of {q.days_target}
                      </span>
                      <span className="tabular-nums">{Math.round(pct)}%</span>
                    </div>
                    <Progress value={pct} className="h-2.5 [&_[data-slot=progress-track]]:bg-[#E8F5E9]" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#4A6355]">
                    Skip days remaining: <span aria-hidden>❄️</span> × {q.skip_days_remaining}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-6 w-full rounded-full border-[#D1E8DC] text-[#B71C1C] hover:bg-red-50"
                    onClick={() => setDeleteId(q.id)}
                  >
                    Delete Quest
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {atMaxActive ? (
        <div
          className="text-center text-sm font-semibold text-amber-950"
          style={{
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #FDE68A",
            background: "#FFFBEB",
            marginTop: "8px",
          }}
        >
          You&apos;ve reached the max of 3 active quests. Complete or delete one to add another.
        </div>
      ) : (
        <div style={{ marginTop: "24px", borderTop: "1px solid #E5E7EB", paddingTop: "24px" }}>
          <h3 className="mb-6 font-heading text-lg font-bold text-[#1B4332]">Create New Quest</h3>
          <form onSubmit={(e) => void handleCreate(e)} className="space-y-6">
            <div>
              <label htmlFor="quest-title" style={FORM_LABEL}>
                Title
              </label>
              <Input
                id="quest-title"
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
              <label htmlFor="quest-length" style={FORM_LABEL}>
                Quest length
              </label>
              <select
                id="quest-length"
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
              <label htmlFor="quest-reward" style={FORM_LABEL}>
                Reward
              </label>
              <Input
                id="quest-reward"
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

            <button
              type="submit"
              disabled={submitting}
              style={{ ...PRIMARY_CTA, opacity: submitting ? 0.65 : 1 }}
            >
              {submitting ? "Creating…" : "Create Quest"}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setHistoryOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-2xl border border-[#D1E8DC] bg-white px-6 py-4 text-left shadow-md transition hover:bg-[#FAFFFE]"
        >
          <span className="font-heading text-lg font-bold text-[#1B4332]">Completed Quests</span>
          {historyOpen ? (
            <ChevronDown className="size-5 shrink-0 text-[#1B4332]" aria-hidden />
          ) : (
            <ChevronRight className="size-5 shrink-0 text-[#1B4332]" aria-hidden />
          )}
        </button>
        {historyOpen ? (
          <div
            className="space-y-3"
            style={{
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #E5E7EB",
              background: "#FFFFFF",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            {completedQuests.length === 0 ? (
              <p className="text-center text-sm font-semibold text-[#4A6355]">
                No completed or failed quests yet.
              </p>
            ) : (
              <ul className="divide-y divide-[#D1E8DC]">
                {completedQuests.map((q) => (
                  <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-[#1B4332]">{q.title}</p>
                      <p className="text-xs font-medium text-[#64748b]">
                        {q.status === "completed" ? "Completed" : "Failed"} · {formatHistoryDate(q)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-extrabold",
                        q.status === "completed"
                          ? "bg-[#E8F5E9] text-[#1B5E20]"
                          : "bg-red-50 text-red-800"
                      )}
                    >
                      {q.days_target} days
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
