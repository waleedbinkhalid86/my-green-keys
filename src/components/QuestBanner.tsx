"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Trophy,
} from "lucide-react";
import type { Quest, QuestProgress } from "@/lib/quests/types";
import {
  fetchMyActiveQuests,
  fetchTodayProgress,
  toggleQuestAction,
} from "@/lib/quests/api";
import {
  completeQuest,
  resetQuest,
  runStreakMaintenanceForQuests,
  type QuestState,
} from "@/lib/quests/streak-engine";
import { QUEST_BANNER_ALLOWED_PREFIXES } from "@/lib/quests/banner-routes";
import { useToast } from "@/components/ui/Toast";
import confetti from "canvas-confetti";

/** Sticky offset so the bar sits below the global navbar (sticky z-50). */
const BANNER_STICKY_TOP_PX = 64;

const ALLOWED_PREFIXES = QUEST_BANNER_ALLOWED_PREFIXES;

function isQuestDayComplete(
  quest: Quest,
  progress: QuestProgress | null | undefined
): boolean {
  const n = progress?.completed_actions?.length ?? 0;
  return n === quest.action_plan.length;
}

function areAllQuestsCompleteForToday(
  questList: Quest[],
  byQuest: Record<string, QuestProgress | null>
): boolean {
  if (questList.length === 0) return true;
  return questList.every((q) => isQuestDayComplete(q, byQuest[q.id]));
}

function questStreak(quest: Quest, streakByQuest: Record<string, QuestState>) {
  const s = streakByQuest[quest.id];
  return {
    current_day: s?.current_day ?? quest.current_day,
    skip_days_remaining: s?.skip_days_remaining ?? quest.skip_days_remaining,
    consecutive_miss_count: s?.consecutive_miss_count ?? 0,
  };
}

function missWarningLine(quest: Quest, state: QuestState): string | null {
  const th = quest.reset_after_misses ?? 3;
  if (state.consecutive_miss_count >= th - 1) {
    const more = th - state.consecutive_miss_count;
    return `⚠️ ${state.consecutive_miss_count} day(s) missed — ${more} more = reset`;
  }
  return null;
}

const CELEBRATION_STYLE: CSSProperties = {
  position: "fixed",
  bottom: "24px",
  right: "24px",
  background: "linear-gradient(135deg, #52B788 0%, #40916C 100%)",
  color: "#FFFFFF",
  padding: "16px 24px",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(82,183,136,0.3)",
  zIndex: 1000,
  fontSize: "15px",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const OVERLAY_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(27, 67, 50, 0.55)",
  backdropFilter: "blur(8px)",
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
};

export default function QuestBanner() {
  const pathname = usePathname() ?? "";
  /** Kid hub (/home) uses the welcome banner + hub cards; no sticky quest strip. */
  const hideOnKidHubHome =
    pathname === "/home" || pathname.startsWith("/home/");
  const shouldShowOnRoute =
    !hideOnKidHubHome &&
    ALLOWED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

  const { showToast } = useToast();
  const [loaded, setLoaded] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [streakByQuest, setStreakByQuest] = useState<Record<string, QuestState>>(
    {}
  );
  const [progressByQuest, setProgressByQuest] = useState<
    Record<string, QuestProgress | null>
  >({});
  const [modalOpen, setModalOpen] = useState(false);
  const [celebrateQuest, setCelebrateQuest] = useState<Quest | null>(null);
  const [resetQuestTarget, setResetQuestTarget] = useState<Quest | null>(null);
  /** Toast on screen (including during opacity fade-out). */
  const [celebrationMounted, setCelebrationMounted] = useState(false);
  /** Opacity / visibility for fade in/out. */
  const [celebrationShown, setCelebrationShown] = useState(false);
  const celebrationHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const celebrationUnmountTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const triggerCelebration = useCallback(() => {
    if (celebrationHideTimerRef.current) {
      clearTimeout(celebrationHideTimerRef.current);
    }
    if (celebrationUnmountTimerRef.current) {
      clearTimeout(celebrationUnmountTimerRef.current);
    }
    setCelebrationMounted(true);
    setCelebrationShown(true);
    celebrationHideTimerRef.current = setTimeout(() => {
      setCelebrationShown(false);
      celebrationHideTimerRef.current = null;
      celebrationUnmountTimerRef.current = setTimeout(() => {
        setCelebrationMounted(false);
        celebrationUnmountTimerRef.current = null;
      }, 400);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (celebrationHideTimerRef.current) {
        clearTimeout(celebrationHideTimerRef.current);
      }
      if (celebrationUnmountTimerRef.current) {
        clearTimeout(celebrationUnmountTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!celebrateQuest) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const colors = ["#52B788", "#FFD700", "#40916C", "#E8F5EE", "#FFFFFF"];
    const burst = () => {
      confetti({ particleCount: 110, spread: 72, origin: { y: 0.58 }, colors });
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 50,
        origin: { x: 0, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 50,
        origin: { x: 1, y: 0.65 },
        colors,
      });
    };
    const t = window.setTimeout(burst, 80);
    return () => clearTimeout(t);
  }, [celebrateQuest]);

  const load = useCallback(async () => {
    try {
      let list = await fetchMyActiveQuests();
      if (list.length === 0) {
        setQuests([]);
        setStreakByQuest({});
        setCelebrateQuest(null);
        setResetQuestTarget(null);
        setProgressByQuest({});
        return;
      }

      let states = await runStreakMaintenanceForQuests(list);
      let celebrate: Quest | null = null;
      let resetTarget: Quest | null = null;

      for (const q of list) {
        const s = states[q.id];
        if (!s) continue;
        if (s.is_completed) {
          const did = await completeQuest(q.id);
          if (did) celebrate = q;
        } else if (s.needs_reset) {
          resetTarget = q;
        }
      }

      list = await fetchMyActiveQuests();
      setQuests(list);

      if (list.length > 0) {
        states = await runStreakMaintenanceForQuests(list);
        setStreakByQuest(states);
      } else {
        setStreakByQuest({});
      }

      if (celebrate) {
        setCelebrateQuest(celebrate);
        setResetQuestTarget(null);
      } else if (resetTarget && list.some((q) => q.id === resetTarget.id)) {
        setResetQuestTarget(resetTarget);
        setCelebrateQuest(null);
      } else {
        setResetQuestTarget(null);
        setCelebrateQuest(null);
      }

      const entries = await Promise.all(
        list.map(async (q) => {
          const p = await fetchTodayProgress(q.id);
          return [q.id, p] as const;
        })
      );
      const next: Record<string, QuestProgress | null> = {};
      for (const [id, p] of entries) next[id] = p;
      setProgressByQuest(next);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!shouldShowOnRoute) return;
    void load();
  }, [load, shouldShowOnRoute]);

  useEffect(() => {
    function handleAutoTrack() {
      const onAllowed =
        !hideOnKidHubHome &&
        ALLOWED_PREFIXES.some(
          (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
        );
      if (!onAllowed) return;
      void load();
    }
    window.addEventListener("quest-auto-track", handleAutoTrack);
    return () => window.removeEventListener("quest-auto-track", handleAutoTrack);
  }, [hideOnKidHubHome, load, pathname]);

  useEffect(() => {
    if (!loaded || quests.length === 0 || !shouldShowOnRoute) return;
    if (areAllQuestsCompleteForToday(quests, progressByQuest)) {
      setModalOpen(false);
    }
  }, [loaded, quests, progressByQuest, shouldShowOnRoute]);

  const handleToggleAction = async (
    questId: string,
    actionIndex: number,
    totalActions: number
  ) => {
    const prevProgress = progressByQuest[questId] ?? null;
    const prevActions = prevProgress?.completed_actions ?? [];
    let nextActions: number[];
    if (prevActions.includes(actionIndex)) {
      nextActions = prevActions.filter((i) => i !== actionIndex);
    } else {
      nextActions = [...prevActions, actionIndex].sort((a, b) => a - b);
    }
    const nextFull = nextActions.length === totalActions;

    const optimistic: QuestProgress | null = prevProgress
      ? {
          ...prevProgress,
          completed_actions: nextActions,
          is_full_day_complete: nextFull,
        }
      : {
          id: `optimistic-${questId}`,
          quest_id: questId,
          date: new Date().toISOString().split("T")[0],
          completed_actions: nextActions,
          is_full_day_complete: nextFull,
        };

    setProgressByQuest((m) => ({ ...m, [questId]: optimistic }));

    const saved = await toggleQuestAction(questId, actionIndex, totalActions);
    if (!saved) {
      setProgressByQuest((m) => ({ ...m, [questId]: prevProgress }));
      showToast("error", "Could not save progress. Try again.");
      return;
    }

    const fresh = await fetchTodayProgress(questId);
    setProgressByQuest((m) => {
      const merged = { ...m, [questId]: fresh ?? saved };
      const allDone = quests.every((q) =>
        isQuestDayComplete(q, merged[q.id] ?? null)
      );
      if (allDone) {
        queueMicrotask(() => {
          triggerCelebration();
        });
      }
      return merged;
    });
  };

  const closeQuestCelebration = () => {
    setCelebrateQuest(null);
    void load();
  };

  const handleConfirmReset = async () => {
    if (!resetQuestTarget) return;
    try {
      await resetQuest(resetQuestTarget.id);
      setResetQuestTarget(null);
      await load();
    } catch (e) {
      console.error(e);
      showToast("error", "Could not reset quest. Try again.");
    }
  };

  if (!shouldShowOnRoute) return null;

  if (celebrateQuest) {
    const q = celebrateQuest;
    return (
      <div style={OVERLAY_STYLE}>
        <div
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #F0F9F4 100%)",
            borderRadius: 24,
            padding: 40,
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ fontSize: 80, marginBottom: 20 }}>🏆</div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: "#1B4332", margin: 0 }}>
            Quest Complete!
          </h2>
          <p style={{ fontSize: 20, color: "#4A6355", marginBottom: 24 }}>
            You finished &quot;{q.title}&quot; in {q.days_target} days!
          </p>

          <div
            style={{
              background: "linear-gradient(135deg, #FFD700, #F2B705)",
              borderRadius: 20,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "#92400E",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              🎁 Your Reward
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1B2D23" }}>
              {q.reward}
            </div>
          </div>

          <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>
            Show this to your parent to claim your reward! 🌟
          </p>

          <button
            type="button"
            onClick={closeQuestCelebration}
            style={{
              background: "linear-gradient(135deg, #52B788 0%, #40916C 100%)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 999,
              padding: "16px 32px",
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(82,183,136,0.35)",
            }}
          >
            Awesome! 🎉
          </button>
        </div>
      </div>
    );
  }

  if (resetQuestTarget) {
    const q = resetQuestTarget;
    return (
      <div style={OVERLAY_STYLE}>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 24,
            padding: 36,
            maxWidth: 440,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ fontSize: 60, marginBottom: 12 }}>💚</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#1B4332" }}>
            Don&apos;t worry — let&apos;s start fresh!
          </h2>
          <p style={{ color: "#4A6355", marginBottom: 24, lineHeight: 1.5 }}>
            We all miss days sometimes. Your &quot;{q.title}&quot; quest will restart from
            Day 1. Your reward is still waiting! 🎁
          </p>
          <button
            type="button"
            onClick={() => void handleConfirmReset()}
            style={{
              background: "linear-gradient(135deg, #52B788 0%, #40916C 100%)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 999,
              padding: "14px 28px",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(82,183,136,0.35)",
            }}
          >
            Start Over 🌱
          </button>
        </div>
      </div>
    );
  }

  if (!loaded || quests.length === 0) return null;

  const allComplete = areAllQuestsCompleteForToday(quests, progressByQuest);
  if (allComplete && !celebrationMounted) return null;

  const primary =
    quests.find((q) => !isQuestDayComplete(q, progressByQuest[q.id])) ??
    quests[0]!;
  const primaryProgress = progressByQuest[primary.id];
  const completedSet = new Set(primaryProgress?.completed_actions ?? []);
  const moreCount = quests.filter((q) => q.id !== primary.id).length;
  const primaryStreak = questStreak(primary, streakByQuest);
  const primaryState = streakByQuest[primary.id];
  const warn =
    primaryState != null ? missWarningLine(primary, primaryState) : null;

  return (
    <>
      {!allComplete && (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setModalOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setModalOpen(true);
              }
            }}
            style={{
              background: "linear-gradient(135deg, #52B788 0%, #40916C 100%)",
              color: "#FFFFFF",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              cursor: "pointer",
              position: "sticky",
              top: BANNER_STICKY_TOP_PX,
              zIndex: 30,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                minWidth: 0,
              }}
            >
              <Trophy
                size={24}
                aria-hidden
                strokeWidth={2}
                style={{ flexShrink: 0 }}
              />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "min(200px, 40vw)",
                }}
              >
                {primary.title}
              </span>
              {moreCount > 0 && (
                <span style={{ fontSize: 13, opacity: 0.95 }}>
                  +{moreCount} more
                </span>
              )}
              <span
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Day {primaryStreak.current_day}/{primary.days_target}
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                ❄️ {primaryStreak.skip_days_remaining}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
                aria-hidden
              >
                {primary.action_plan.map((_, i) =>
                  completedSet.has(i) ? (
                    <CheckCircle2 key={i} size={18} strokeWidth={2.5} />
                  ) : (
                    <Circle key={i} size={18} strokeWidth={2} />
                  )
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                🔥 {primaryStreak.current_day}
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  opacity: 0.95,
                }}
              >
                Tap to expand
                <ChevronDown
                  size={18}
                  style={{
                    transform: modalOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                  aria-hidden
                />
              </span>
            </div>
          </div>

          {warn ? (
            <div
              style={{
                position: "sticky",
                top: BANNER_STICKY_TOP_PX + 52,
                zIndex: 29,
                background: "#FFF8E1",
                color: "#92400E",
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
                borderBottom: "1px solid #FDE68A",
              }}
            >
              {warn}
            </div>
          ) : null}

          {modalOpen && (
            <div
              role="presentation"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(27, 67, 50, 0.6)",
                backdropFilter: "blur(8px)",
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
              }}
              onClick={() => setModalOpen(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Quest details"
                style={{
                  position: "relative",
                  background: "#FFFFFF",
                  borderRadius: "24px",
                  padding: "32px",
                  maxWidth: "520px",
                  width: "100%",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setModalOpen(false)}
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 28,
                    color: "#6B7280",
                    lineHeight: 1,
                    padding: 4,
                  }}
                >
                  ×
                </button>

                {quests.map((quest, qIdx) => {
                  const prog = progressByQuest[quest.id];
                  const done = new Set(prog?.completed_actions ?? []);
                  const total = quest.action_plan.length;
                  const todoCount = quest.action_plan.filter(
                    (_, i) => !done.has(i)
                  ).length;
                  const fullDay = prog?.is_full_day_complete ?? false;
                  const st = streakByQuest[quest.id];
                  const disp = questStreak(quest, streakByQuest);
                  const qWarn =
                    st != null ? missWarningLine(quest, st) : null;

                  return (
                    <div key={quest.id}>
                      {qIdx > 0 && (
                        <hr
                          style={{
                            border: 0,
                            borderTop: "1px solid #E5E7EB",
                            margin: "24px 0",
                          }}
                        />
                      )}

                      <h2
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          color: "#1B4332",
                          margin: "0 0 12px 0",
                          paddingRight: 36,
                        }}
                      >
                        {quest.title}
                      </h2>
                      <div
                        style={{
                          display: "inline-block",
                          background: "#E8F5EE",
                          color: "#1B4332",
                          padding: "6px 12px",
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 600,
                          marginBottom: 8,
                        }}
                      >
                        Day {disp.current_day} of {quest.days_target}
                      </div>
                      <p
                        style={{
                          fontSize: 14,
                          color: "#4A6355",
                          margin: "4px 0 8px 0",
                        }}
                      >
                        ❄️ {disp.skip_days_remaining} skip days remaining
                      </p>
                      {qWarn ? (
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#92400E",
                            background: "#FFF8E1",
                            padding: "10px 12px",
                            borderRadius: 10,
                            marginBottom: 12,
                          }}
                        >
                          {qWarn}
                        </p>
                      ) : null}
                      <p
                        style={{
                          fontSize: 14,
                          fontStyle: "italic",
                          color: "#4A6355",
                          margin: "8px 0 20px 0",
                        }}
                      >
                        🎁 Reward: {quest.reward}
                      </p>

                      {quest.action_plan.map((text, actionIndex) => {
                        const isChecked = done.has(actionIndex);
                        return (
                          <div
                            key={actionIndex}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              void handleToggleAction(
                                quest.id,
                                actionIndex,
                                total
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                void handleToggleAction(
                                  quest.id,
                                  actionIndex,
                                  total
                                );
                              }
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "16px",
                              background: isChecked ? "#E8F5EE" : "#F9FAFB",
                              borderRadius: "12px",
                              marginBottom: "8px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              border: "2px solid",
                              borderColor: isChecked ? "#52B788" : "transparent",
                            }}
                          >
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                flexShrink: 0,
                                borderRadius: 999,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: isChecked
                                  ? "none"
                                  : "2px solid #D1D5DB",
                                background: isChecked ? "#52B788" : "#FFFFFF",
                              }}
                            >
                              {isChecked && (
                                <CheckCircle2
                                  size={18}
                                  strokeWidth={2.5}
                                  color="#FFFFFF"
                                  aria-hidden
                                />
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: 15,
                                fontWeight: 500,
                                color: isChecked ? "#4A6355" : "#1B2D23",
                                textDecorationLine: isChecked
                                  ? "line-through"
                                  : "none",
                              }}
                            >
                              {text}
                            </span>
                          </div>
                        );
                      })}

                      {fullDay ? (
                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, #52B788, #40916C)",
                            color: "#FFFFFF",
                            padding: "16px",
                            borderRadius: "12px",
                            textAlign: "center",
                            marginTop: "16px",
                            fontWeight: 700,
                          }}
                        >
                          🎉 Today complete! See you tomorrow!
                        </div>
                      ) : (
                        <div
                          style={{
                            background: "#FFF8E1",
                            color: "#92400E",
                            padding: "16px",
                            borderRadius: "12px",
                            textAlign: "center",
                            marginTop: "16px",
                            fontSize: 14,
                          }}
                        >
                          Keep going! {todoCount} action
                          {todoCount !== 1 ? "s" : ""} left today.
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "16px",
                          background: "#F9FAFB",
                          borderRadius: "12px",
                          marginTop: "16px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#6B7280",
                              textTransform: "uppercase",
                            }}
                          >
                            Quest days done
                          </div>
                          <div
                            style={{
                              fontSize: 28,
                              fontWeight: 700,
                              color: "#1B4332",
                            }}
                          >
                            🔥 {disp.current_day}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#6B7280",
                              textTransform: "uppercase",
                            }}
                          >
                            Skip days left
                          </div>
                          <div
                            style={{
                              fontSize: 28,
                              fontWeight: 700,
                              color: "#1B4332",
                            }}
                          >
                            ❄️ {disp.skip_days_remaining}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {celebrationMounted && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{
            ...CELEBRATION_STYLE,
            pointerEvents: "none",
            opacity: celebrationShown ? 1 : 0,
            transition: "opacity 0.35s ease, transform 0.35s ease",
            transform: celebrationShown ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <span>🎉 All quests done for today! See you tomorrow!</span>
        </div>
      )}
    </>
  );
}
