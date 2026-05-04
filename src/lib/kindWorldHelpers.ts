import {
  kindWorldScenarios,
  type KindScenario,
} from "@/data/kindWorldScenarios";

const SIMILARITY_THRESHOLD = 0.8;

function normalizeInput(s: string): string {
  return s.trim().toLowerCase();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const row = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j]!;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(
        row[j]! + 1,
        row[j - 1]! + 1,
        prev + cost,
      );
      prev = tmp;
    }
  }
  return row[n]!;
}

/** Normalized similarity in [0, 1]: 1 − distance / max(lengths). */
function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / maxLen;
}

export function checkAnswer(userInput: string, scenario: KindScenario): boolean {
  const normalized = normalizeInput(userInput);
  if (!normalized) return false;

  for (const accepted of scenario.acceptedAnswers) {
    const target = normalizeInput(accepted);
    if (!target) continue;
    if (normalized === target) return true;
    if (stringSimilarity(normalized, target) >= SIMILARITY_THRESHOLD) {
      return true;
    }
  }
  return false;
}

export function getRandomScenario(excludeIds: number[]): KindScenario {
  const excluded = new Set(excludeIds);
  let pool = kindWorldScenarios.filter((s) => !excluded.has(s.id));
  if (pool.length === 0) {
    pool = kindWorldScenarios;
  }
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx]!;
}

export function calculateEcoPoints(score: number): number {
  if (score <= 50) return 5;
  if (score <= 150) return 15;
  if (score <= 300) return 30;
  return 50;
}
