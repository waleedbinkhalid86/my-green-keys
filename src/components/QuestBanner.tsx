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
import { QUEST_BANNER_ALLOWED_PREFIXES } from "@/lib/quests/banner-routes";
import { useToast } from "@/components/ui/Toast";

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

export default function QuestBanner() {
  const pathname = usePathname() ?? "";
  const shouldShowOnRoute = ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const { showToast } = useToast();
  const [loaded, setLoaded] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [progressByQuest, setProgressByQuest] = useState<
    Record<string, QuestProgress | null>
  >({});
  const [modalOpen, setModalOpen] = useState(false);
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

  const load = useCallback(async () => {
    const list = await fetchMyActiveQuests();
    setQuests(list);
    const entries = await Promise.all(
      list.map(async (q) => {
        const p = await fetchTodayProgress(q.id);
        return [q.id, p] as const;
      })
    );
    const next: Record<string, QuestProgress | null> = {};
    for (const [id, p] of entries) next[id] = p;
    setProgressByQuest(next);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!shouldShowOnRoute) return;
    void load();
  }, [load, shouldShowOnRoute]);

  useEffect(() => {
    function handleAutoTrack() {
      const onAllowed = ALLOWED_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
      );
      if (!onAllowed) return;
      void load();
    }
    window.addEventListener("quest-auto-track", handleAutoTrack);
    return () => window.removeEventListener("quest-auto-track", handleAutoTrack);
  }, [load, pathname]);

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

  if (!shouldShowOnRoute) return null;

  if (!loaded || quests.length === 0) return null;

  const allComplete = areAllQuestsCompleteForToday(quests, progressByQuest);
  if (allComplete && !celebrationMounted) return null;

  const primary =
    quests.find((q) => !isQuestDayComplete(q, progressByQuest[q.id])) ??
    quests[0]!;
  const primaryProgress = progressByQuest[primary.id];
  const completedSet = new Set(primaryProgress?.completed_actions ?? []);
  const moreCount = quests.filter((q) => q.id !== primary.id).length;

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
                Day {primary.current_day}/{primary.days_target}
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
                🔥 {primary.current_day}
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
                        Day {quest.current_day} of {quest.days_target}
                      </div>
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
                            Current streak
                          </div>
                          <div
                            style={{
                              fontSize: 28,
                              fontWeight: 700,
                              color: "#1B4332",
                            }}
                          >
                            🔥 {quest.current_day}
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
                            ❄️ {quest.skip_days_remaining}
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
