import { lessons, type Lesson } from "@/data/lessons";

function normalizeToken(raw: string): string | null {
  const t = raw
    .toLowerCase()
    .replace(/^[^a-z0-9]+/g, "")
    .replace(/[^a-z0-9]+$/g, "");
  if (!t || !/^[a-z0-9]+$/.test(t)) return null;
  return t;
}

function tokensFromLesson(lesson: Lesson): string[] {
  const chunk = `${lesson.drill} ${lesson.sentence}`;
  const out: string[] = [];
  for (const part of chunk.split(/\s+/)) {
    const n = normalizeToken(part);
    if (n) out.push(n);
  }
  return out;
}

export function vocabularyFromLessonRange(
  lessonIdMin: number,
  lessonIdMax: number,
  minLen: number,
  maxLen: number
): string[] {
  const set = new Set<string>();
  for (const lesson of lessons) {
    if (lesson.id < lessonIdMin || lesson.id > lessonIdMax) continue;
    for (const w of tokensFromLesson(lesson)) {
      if (w.length >= minLen && w.length <= maxLen) set.add(w);
    }
  }
  return [...set];
}

export function pickRandomWord(pool: string[], avoid?: Set<string>): string {
  if (pool.length === 0) return "as";
  const maxAttempts = 40;
  for (let i = 0; i < maxAttempts; i++) {
    const w = pool[Math.floor(Math.random() * pool.length)]!;
    if (!avoid?.has(w)) return w;
  }
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export type AgeBand = "6-8" | "9-11" | "12-14";

export function ageToBand(age: number | null | undefined): AgeBand {
  const a = typeof age === "number" && !Number.isNaN(age) ? age : 9;
  if (a <= 8) return "6-8";
  if (a <= 11) return "9-11";
  return "12-14";
}

/** px/s downward; 50% global slow-down, then age divisors (÷3, ÷2, ÷1.5). */
export function bandGameParams(band: AgeBand): {
  fallSpeed: number;
  spawnEveryMs: number;
  maxLeaves: number;
  leafScale: number;
} {
  const base6 = 52;
  const base9 = 88;
  const base12 = 132;
  const half = 0.5;
  if (band === "6-8") {
    return {
      fallSpeed: (base6 * half) / 3,
      spawnEveryMs: 5600,
      maxLeaves: 2,
      leafScale: 1.18,
    };
  }
  if (band === "9-11") {
    return {
      fallSpeed: (base9 * half) / 2,
      spawnEveryMs: 4500,
      maxLeaves: 3,
      leafScale: 1,
    };
  }
  return {
    fallSpeed: (base12 * half) / 1.5,
    spawnEveryMs: 3600,
    maxLeaves: 4,
    leafScale: 0.88,
  };
}

export type ProgressiveTier = 0 | 1 | 2 | 3;

/** Word lengths by catches this round (before the next word spawns). */
export function progressiveLengthRange(caught: number): { min: number; max: number } {
  if (caught < 5) return { min: 2, max: 3 };
  if (caught < 10) return { min: 3, max: 4 };
  if (caught < 15) return { min: 4, max: 5 };
  return { min: 5, max: 6 };
}

/**
 * Earliest completed lessons (by lesson id) included in the pool this step.
 * Progresses through lesson order as the player catches more words.
 */
export function progressiveLessonIdWindow(sortedCompletedLessonIds: number[], caught: number): number[] {
  const ids =
    sortedCompletedLessonIds.length > 0 ? [...sortedCompletedLessonIds].sort((a, b) => a - b) : [1];
  let take: number;
  if (caught < 5) take = Math.min(3, ids.length);
  else if (caught < 10) take = Math.min(5, ids.length);
  else if (caught < 15) take = Math.min(8, ids.length);
  else take = ids.length;
  return ids.slice(0, Math.max(1, take));
}

export function buildPoolFromLessons(lessonIds: number[], minLen: number, maxLen: number): string[] {
  const set = new Set<string>();
  const idSet = new Set(lessonIds);
  for (const lesson of lessons) {
    if (!idSet.has(lesson.id)) continue;
    for (const w of tokensFromLesson(lesson)) {
      if (w.length >= minLen && w.length <= maxLen) set.add(w);
    }
  }
  return [...set];
}

/**
 * Words only from lessons the student has completed; length + lesson window from round progress.
 */
export function progressiveWordPool(sortedCompletedLessonIds: number[], caught: number): string[] {
  const window = progressiveLessonIdWindow(sortedCompletedLessonIds, caught);
  const { min, max } = progressiveLengthRange(caught);
  let pool = buildPoolFromLessons(window, min, max);
  if (pool.length === 0) {
    pool = buildPoolFromLessons(window, Math.max(2, min - 1), Math.min(12, max + 2));
  }
  if (pool.length === 0) {
    pool = buildPoolFromLessons(window, 2, 6);
  }
  return pool;
}

export function progressiveDifficultyLabel(
  sortedCompletedLessonIds: number[],
  caught: number
): { tier: ProgressiveTier; title: string; lettersLabel: string; lessonsLabel: string } {
  const tier: ProgressiveTier = caught < 5 ? 0 : caught < 10 ? 1 : caught < 15 ? 2 : 3;
  const { min, max } = progressiveLengthRange(caught);
  const win = progressiveLessonIdWindow(sortedCompletedLessonIds, caught);
  const lo = Math.min(...win);
  const hi = Math.max(...win);
  const titles = ["Seedling", "Sprout", "Young grove", "Forest keeper"];
  return {
    tier,
    title: titles[tier],
    lettersLabel: `${min}–${max} letters`,
    lessonsLabel: lo === hi ? `Lesson ${lo}` : `Lessons ${lo}–${hi}`,
  };
}
