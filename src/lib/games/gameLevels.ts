export type GameLevelId = "seedling" | "explorer" | "guardian" | "champion";

export type GameLevelDefinition = {
  id: GameLevelId;
  label: string;
  emoji: string;
  /** Multiplies baseline game speed (1 = Guardian). */
  speedMultiplier: number;
  /** Misses allowed before game over. */
  lives: number;
  roundSeconds: number;
  pointsMultiplier: number;
};

export const GAME_LEVELS: Record<GameLevelId, GameLevelDefinition> = {
  seedling: {
    id: "seedling",
    label: "Seedling",
    emoji: "🌱",
    speedMultiplier: 0.3,
    lives: 5,
    roundSeconds: 90,
    pointsMultiplier: 1,
  },
  explorer: {
    id: "explorer",
    label: "Explorer",
    emoji: "🌿",
    speedMultiplier: 0.6,
    lives: 4,
    roundSeconds: 75,
    pointsMultiplier: 1.5,
  },
  guardian: {
    id: "guardian",
    label: "Guardian",
    emoji: "🌳",
    speedMultiplier: 1,
    lives: 3,
    roundSeconds: 60,
    pointsMultiplier: 2,
  },
  champion: {
    id: "champion",
    label: "Champion",
    emoji: "⚡",
    speedMultiplier: 1.5,
    lives: 2,
    roundSeconds: 45,
    pointsMultiplier: 3,
  },
};

export const GAME_LEVEL_STORAGE_KEY = "mgk_game_level";

const FALLBACK_LEVEL: GameLevelId = "guardian";

export function isGameLevelId(v: string): v is GameLevelId {
  return v === "seedling" || v === "explorer" || v === "guardian" || v === "champion";
}

/** Safe on server (no window): returns Guardian. */
export function getStoredGameLevel(): GameLevelDefinition {
  if (typeof window === "undefined") return GAME_LEVELS[FALLBACK_LEVEL];
  const raw = window.localStorage.getItem(GAME_LEVEL_STORAGE_KEY);
  if (raw && isGameLevelId(raw)) return GAME_LEVELS[raw];
  return GAME_LEVELS[FALLBACK_LEVEL];
}

export function setStoredGameLevel(id: GameLevelId): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GAME_LEVEL_STORAGE_KEY, id);
}

/** Hub recommendation from profiles.age */
export function suggestedLevelIdForAge(age: number | null | undefined): GameLevelId {
  const a = typeof age === "number" && !Number.isNaN(age) ? age : 10;
  if (a <= 8) return "seedling";
  if (a <= 11) return "explorer";
  if (a <= 14) return "guardian";
  return "champion";
}

export type SortBin = "plastic" | "paper" | "organic" | "glass";

/** Typing target for Eco Hero City / sort-recycling. */
export function sortRecyclingExpectedAnswer(bin: SortBin, level: GameLevelDefinition): string {
  if (level.id === "seedling") {
    const m: Record<SortBin, string> = {
      plastic: "p",
      paper: "a",
      organic: "o",
      glass: "g",
    };
    return m[bin];
  }
  if (level.id === "explorer") {
    const m: Record<SortBin, string> = {
      plastic: "pla",
      paper: "pap",
      organic: "org",
      glass: "gla",
    };
    return m[bin];
  }
  return bin;
}
