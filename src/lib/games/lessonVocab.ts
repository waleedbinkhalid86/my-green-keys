import { lessons, type Lesson } from "@/data/lessons";

/** Whole-word blocklist for kid-safe typing games (lowercase tokens only). */
export const WORD_BLACKLIST = [
  "ass",
  "aas",
  "slag",
  "fag",
  "damn",
  "hell",
  "crap",
  "piss",
  "shit",
  "sex",
  "arse",
  "sag",
  "gas",
] as const;

const WORD_BLACKLIST_SET = new Set<string>(WORD_BLACKLIST);

export function isAllowedGameWord(word: string): boolean {
  const t = word.toLowerCase().trim();
  if (!t) return false;
  return !WORD_BLACKLIST_SET.has(t);
}

/** Tokens in a phrase must all be allowed (for item names, facts). */
export function isAllowedGamePhrase(text: string): boolean {
  const parts = text.toLowerCase().split(/\s+/);
  for (const part of parts) {
    const t = part.replace(/^[^a-z0-9]+/g, "").replace(/[^a-z0-9]+$/g, "");
    if (t && !isAllowedGameWord(t)) return false;
  }
  return true;
}

function normalizeToken(raw: string): string | null {
  const t = raw
    .toLowerCase()
    .replace(/^[^a-z0-9]+/g, "")
    .replace(/[^a-z0-9]+$/g, "");
  if (!t || !/^[a-z0-9]+$/.test(t)) return null;
  if (!isAllowedGameWord(t)) return null;
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
  return [...set].filter(isAllowedGameWord);
}

const SAFE_FALLBACK_WORDS = [
  "tree",
  "leaf",
  "sun",
  "air",
  "soil",
  "bird",
  "frog",
  "lake",
  "seed",
  "grow",
  "rain",
  "wind",
  "root",
  "nest",
];

export function pickRandomWord(pool: string[], avoid?: Set<string>): string {
  const filtered = pool.filter((w) => isAllowedGameWord(w));
  if (filtered.length === 0) {
    const fb = SAFE_FALLBACK_WORDS.find((w) => isAllowedGameWord(w));
    return fb ?? "ok";
  }
  const maxAttempts = 40;
  for (let i = 0; i < maxAttempts; i++) {
    const w = filtered[Math.floor(Math.random() * filtered.length)]!;
    if (!avoid?.has(w)) return w;
  }
  return filtered[Math.floor(Math.random() * filtered.length)]!;
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

export type FallingLeavesStageInfo = {
  stage: 1 | 2 | 3 | 4;
  emoji: string;
  title: string;
  minLen: number;
  maxLen: number;
  lettersLabel: string;
  /** Null when already at stage 4. */
  catchesToNext: number | null;
};

/**
 * Simple stages from leaves caught this round (matches hub difficulty names).
 * Stage 1: 0–4 caught → 2–3 letters · 🌱 Seedling
 */
export function fallingLeavesStage(caught: number): FallingLeavesStageInfo {
  if (caught < 5) {
    return {
      stage: 1,
      emoji: "🌱",
      title: "Seedling",
      minLen: 2,
      maxLen: 3,
      lettersLabel: "2–3 letters",
      catchesToNext: 5 - caught,
    };
  }
  if (caught < 10) {
    return {
      stage: 2,
      emoji: "🌿",
      title: "Explorer",
      minLen: 3,
      maxLen: 4,
      lettersLabel: "3–4 letters",
      catchesToNext: 10 - caught,
    };
  }
  if (caught < 15) {
    return {
      stage: 3,
      emoji: "🌳",
      title: "Guardian",
      minLen: 4,
      maxLen: 5,
      lettersLabel: "4–5 letters",
      catchesToNext: 15 - caught,
    };
  }
  return {
    stage: 4,
    emoji: "⚡",
    title: "Champion",
    minLen: 5,
    maxLen: 6,
    lettersLabel: "5–6 letters",
    catchesToNext: null,
  };
}

export function buildPoolFromLessons(lessonIds: number[], minLen: number, maxLen: number): string[] {
  const set = new Set<string>();
  const idSet = new Set(lessonIds);
  for (const lesson of lessons) {
    if (!idSet.has(lesson.id)) continue;
    for (const w of tokensFromLesson(lesson)) {
      if (w.length >= minLen && w.length <= maxLen && isAllowedGameWord(w)) set.add(w);
    }
  }
  return [...set];
}

/**
 * Words only from lessons the student has completed; lengths from simple catch-based stages.
 */
export function progressiveWordPool(sortedCompletedLessonIds: number[], caught: number): string[] {
  const ids =
    sortedCompletedLessonIds.length > 0 ? [...sortedCompletedLessonIds].sort((a, b) => a - b) : [1];
  const { minLen, maxLen } = fallingLeavesStage(caught);
  let pool = buildPoolFromLessons(ids, minLen, maxLen);
  if (pool.length === 0) {
    pool = buildPoolFromLessons(ids, Math.max(2, minLen - 1), Math.min(12, maxLen + 2));
  }
  if (pool.length === 0) {
    pool = buildPoolFromLessons(ids, 2, 6);
  }
  return pool.filter(isAllowedGameWord);
}
