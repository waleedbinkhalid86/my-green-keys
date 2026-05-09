"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type QuestAutoTrackDetail = {
  actionsTicked: number;
  questsUpdated: number;
  allDailyComplete?: boolean;
};

const CELEBRATION_INNER_STYLE: CSSProperties = {
  background: "linear-gradient(135deg, #52B788 0%, #40916C 100%)",
  color: "#FFFFFF",
  padding: "16px 24px",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(82,183,136,0.3)",
  fontSize: "15px",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

export default function QuestAutoTrackToast() {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState<QuestAutoTrackDetail | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onAutoTrack(e: Event) {
      const ce = e as CustomEvent<QuestAutoTrackDetail>;
      const d = ce.detail;
      if (!d || d.actionsTicked <= 0) return;

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setDetail(d);
      setVisible(true);
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
        hideTimerRef.current = null;
      }, 3000);
    }

    window.addEventListener("quest-auto-track", onAutoTrack);
    return () => {
      window.removeEventListener("quest-auto-track", onAutoTrack);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!detail) return null;

  const n = detail.actionsTicked;
  const actionLabel = n === 1 ? "1 action ticked" : `${n} actions ticked`;
  const isCelebration = Boolean(detail.allDailyComplete);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: isCelebration ? 1000 : 60,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        maxWidth: "min(360px, calc(100vw - 32px))",
      }}
    >
      {isCelebration ? (
        <div style={CELEBRATION_INNER_STYLE}>
          <span>🎉 All quests done for today! See you tomorrow!</span>
        </div>
      ) : (
        <div
          style={{
            background: "linear-gradient(135deg, #52B788 0%, #40916C 100%)",
            color: "#FFFFFF",
            padding: "14px 20px",
            borderRadius: 9999,
            boxShadow: "0 10px 30px rgba(27, 67, 50, 0.35)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 15 }}>🎯 Quest progress!</div>
          <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4, opacity: 0.95 }}>
            {actionLabel}
          </div>
        </div>
      )}
    </div>
  );
}
