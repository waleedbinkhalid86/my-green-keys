/**
 * Guest mode storage — typing lessons only (v1).
 *
 * Guest progress lives in this browser's localStorage and nowhere else.
 * Nothing here talks to Supabase or any API. XP is never stored: it is derived
 * from lesson completions with the same rules as logged-in lessons, so there is
 * one source of truth and no points value to tamper with.
 */

import { DEFAULT_PRACTICE_GOAL } from "@/lib/lesson-practice/constants";

export const GUEST_STORE_KEY = "mgk_guest_v1";

const LESSON_ID_MIN = 1;
const LESSON_ID_MAX = 100;
const MAX_COUNT_PER_LESSON = 1000;
const MAX_WPM = 300;

/** Same values as the logged-in lesson flow (awardXp calls in lesson/page.tsx). */
const XP_PER_COMPLETION = 10;
const XP_THREE_STAR_BONUS = 5;

export type GuestLessonRecord = {
  count: number;
  threeStarCount: number;
  bestWpm: number;
  bestAccuracy: number;
  bestStars: number;
  lastAt: string;
};

export type GuestStore = {
  v: 1;
  createdAt: string;
  lessons: Record<string, GuestLessonRecord>;
  streak: { current: number; lastDate: string | null };
};

export type GuestPractice = { count: number; goal: number };

function emptyStore(): GuestStore {
  return {
    v: 1,
    createdAt: new Date().toISOString(),
    lessons: {},
    streak: { current: 0, lastDate: null },
  };
}

/** UTC calendar date, same format as streakHelpers.getTodayDate. */
function todayUtc(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

function yesterdayUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split("T")[0] ?? "";
}

function clampInt(value: unknown, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function clampNum(value: unknown, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function isValidLessonId(id: number): boolean {
  return Number.isInteger(id) && id >= LESSON_ID_MIN && id <= LESSON_ID_MAX;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Rebuilds a store from unknown JSON, dropping anything malformed. */
function sanitize(raw: unknown): GuestStore {
  if (!raw || typeof raw !== "object" || (raw as { v?: unknown }).v !== 1) {
    return emptyStore();
  }
  const src = raw as Partial<GuestStore>;
  const store = emptyStore();

  if (typeof src.createdAt === "string" && Number.isFinite(Date.parse(src.createdAt))) {
    store.createdAt = src.createdAt;
  }

  if (src.lessons && typeof src.lessons === "object") {
    for (const [key, rec] of Object.entries(src.lessons)) {
      const id = Number(key);
      if (!isValidLessonId(id) || !rec || typeof rec !== "object") continue;
      const count = clampInt(rec.count, 0, MAX_COUNT_PER_LESSON);
      if (count === 0) continue;
      store.lessons[String(id)] = {
        count,
        threeStarCount: clampInt(rec.threeStarCount, 0, count),
        bestWpm: clampInt(rec.bestWpm, 0, MAX_WPM),
        bestAccuracy: clampNum(rec.bestAccuracy, 0, 100),
        bestStars: clampInt(rec.bestStars, 0, 3),
        lastAt:
          typeof rec.lastAt === "string" && Number.isFinite(Date.parse(rec.lastAt))
            ? rec.lastAt
            : store.createdAt,
      };
    }
  }

  if (src.streak && typeof src.streak === "object") {
    const lastDate = isIsoDate(src.streak.lastDate) ? src.streak.lastDate : null;
    store.streak = {
      current: lastDate ? clampInt(src.streak.current, 0, 10000) : 0,
      lastDate,
    };
  }

  return store;
}

function write(store: GuestStore): boolean {
  try {
    window.localStorage.setItem(GUEST_STORE_KEY, JSON.stringify(store));
    return true;
  } catch {
    // Storage full or blocked (private mode) — guest progress just isn't kept.
    return false;
  }
}

export function getGuestStore(): GuestStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(GUEST_STORE_KEY);
    if (!raw) return emptyStore();
    return sanitize(JSON.parse(raw));
  } catch {
    return emptyStore();
  }
}

export function hasGuestProgress(): boolean {
  return Object.keys(getGuestStore().lessons).length > 0;
}

/**
 * Records one finished attempt of a built-in lesson. Stars use the caller's
 * calculation (1 + accuracy >= 90 + wpm >= target), matching the lesson page.
 * `saved` is false when storage is blocked or full.
 */
export function recordGuestLessonCompletion(
  lessonId: number,
  wpm: number,
  accuracy: number,
  stars: number,
): { store: GuestStore; saved: boolean } {
  const store = getGuestStore();
  if (typeof window === "undefined" || !isValidLessonId(lessonId)) {
    return { store, saved: false };
  }

  const key = String(lessonId);
  const prev = store.lessons[key];
  const safeStars = clampInt(stars, 0, 3);
  const safeWpm = clampInt(wpm, 0, MAX_WPM);
  const safeAccuracy = clampNum(accuracy, 0, 100);

  store.lessons[key] = {
    count: Math.min(MAX_COUNT_PER_LESSON, (prev?.count ?? 0) + 1),
    threeStarCount: (prev?.threeStarCount ?? 0) + (safeStars === 3 ? 1 : 0),
    bestWpm: Math.max(prev?.bestWpm ?? 0, safeWpm),
    bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, safeAccuracy),
    bestStars: Math.max(prev?.bestStars ?? 0, safeStars),
    lastAt: new Date().toISOString(),
  };

  const today = todayUtc();
  const { current, lastDate } = store.streak;
  if (lastDate !== today) {
    store.streak = {
      current: lastDate === yesterdayUtc() ? current + 1 : 1,
      lastDate: today,
    };
  }

  return { store, saved: write(store) };
}

/** Guests have no parent-set goal, so the default practice goal applies. */
export function getGuestPractice(lessonId: number): GuestPractice {
  const rec = getGuestStore().lessons[String(lessonId)];
  return { count: rec?.count ?? 0, goal: DEFAULT_PRACTICE_GOAL };
}

/** Same shape the lesson map uses for logged-in student_progress rows. */
export function getGuestAllPractice(): Map<number, GuestPractice> {
  const map = new Map<number, GuestPractice>();
  for (const [key, rec] of Object.entries(getGuestStore().lessons)) {
    map.set(Number(key), { count: rec.count, goal: DEFAULT_PRACTICE_GOAL });
  }
  return map;
}

/** Guest lessons in the shape of student_progress rows, for the lesson map pages. */
export function getGuestProgressRows(): Array<{
  lesson_id: number;
  completed: boolean;
  stars: number;
  wpm: number;
  accuracy: number;
  completion_count: number;
  practice_goal: number;
}> {
  return Object.entries(getGuestStore().lessons).map(([key, rec]) => ({
    lesson_id: Number(key),
    completed: true,
    stars: rec.bestStars,
    wpm: rec.bestWpm,
    accuracy: Math.round(rec.bestAccuracy),
    completion_count: rec.count,
    practice_goal: DEFAULT_PRACTICE_GOAL,
  }));
}

export const GUEST_IMPORT_MAX_LESSONS = 20;

/**
 * The only guest data ever sent to the server: which lessons were practised and
 * the best WPM/accuracy, most recent first, at most 20. Counts, XP and streak stay local.
 */
export function getGuestImportPayload(): {
  lessons: Array<{ id: number; bestWpm: number; bestAccuracy: number }>;
} {
  const lessons = Object.entries(getGuestStore().lessons)
    .sort(([, a], [, b]) => Date.parse(b.lastAt) - Date.parse(a.lastAt))
    .slice(0, GUEST_IMPORT_MAX_LESSONS)
    .map(([key, rec]) => ({ id: Number(key), bestWpm: rec.bestWpm, bestAccuracy: rec.bestAccuracy }));
  return { lessons };
}

/** Display only — never sent to the server. */
export function getGuestXp(): number {
  let xp = 0;
  for (const rec of Object.values(getGuestStore().lessons)) {
    xp += rec.count * XP_PER_COMPLETION + rec.threeStarCount * XP_THREE_STAR_BONUS;
  }
  return xp;
}

/** Current streak, or 0 if the last guest lesson was before yesterday. */
export function getGuestStreak(): number {
  const { current, lastDate } = getGuestStore().streak;
  if (lastDate === todayUtc() || lastDate === yesterdayUtc()) return current;
  return 0;
}

export function clearGuestStore(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(GUEST_STORE_KEY);
  } catch {
    // ignore
  }
}
