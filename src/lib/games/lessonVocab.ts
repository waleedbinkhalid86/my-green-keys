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
  if (pool.length === 0) return "tree";
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

export function getFallingLeavesWordPool(band: AgeBand): string[] {
  if (band === "6-8") {
    return vocabularyFromLessonRange(1, 10, 3, 4);
  }
  if (band === "9-11") {
    return vocabularyFromLessonRange(11, 30, 5, 6);
  }
  return vocabularyFromLessonRange(31, 50, 3, 14);
}

export function bandGameParams(band: AgeBand): {
  fallSpeed: number;
  spawnEveryMs: number;
  maxLeaves: number;
  leafScale: number;
} {
  if (band === "6-8") {
    return { fallSpeed: 52, spawnEveryMs: 3200, maxLeaves: 2, leafScale: 1.18 };
  }
  if (band === "9-11") {
    return { fallSpeed: 88, spawnEveryMs: 2600, maxLeaves: 3, leafScale: 1 };
  }
  return { fallSpeed: 132, spawnEveryMs: 2100, maxLeaves: 4, leafScale: 0.88 };
}
