"use client";

/**
 * Guest mode helpers for the typing lesson page. Everything here runs only when
 * there is no signed-in user, and reads/writes the local guest store only.
 */

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRankFromXp, type XpAwardResult } from "@/lib/rangerHelpers";
import {
  getGuestPractice,
  getGuestStreak,
  getGuestXp,
  recordGuestLessonCompletion,
} from "@/lib/guest/guest-store";

export type GuestStatus = "loading" | "guest" | "user";

/**
 * "guest" when the browser has no Supabase session. Reads the local session
 * only — for a visitor with no session this makes no network request.
 */
export function useGuestStatus(): GuestStatus {
  const [status, setStatus] = useState<GuestStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const {
          data: { session },
        } = await createClient().auth.getSession();
        if (!cancelled) setStatus(session ? "user" : "guest");
      } catch {
        if (!cancelled) setStatus("guest");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}

export type GuestCompletionResult = {
  /** False when storage is blocked or full; callers keep their optimistic UI. */
  saved: boolean;
  count: number;
  goal: number;
  streak: number;
  xpAwarded: XpAwardResult;
};

/** Records a finished built-in lesson for a guest and returns what the page should show. */
export function applyGuestLessonCompletion(
  lessonId: number,
  wpm: number,
  accuracy: number,
  stars: number,
): GuestCompletionResult {
  const xpBefore = getGuestXp();
  const { saved } = recordGuestLessonCompletion(lessonId, wpm, accuracy, stars);
  const xpAfter = getGuestXp();
  const { count, goal } = getGuestPractice(lessonId);
  const rankBefore = getRankFromXp(xpBefore).id;
  const rankAfter = getRankFromXp(xpAfter).id;

  return {
    saved,
    count,
    goal,
    streak: getGuestStreak(),
    xpAwarded: {
      awarded: Math.max(0, xpAfter - xpBefore),
      totalXp: xpAfter,
      rankBefore,
      rankAfter,
      rankUp: rankBefore !== rankAfter,
    },
  };
}
