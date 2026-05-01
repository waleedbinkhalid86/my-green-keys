import type { GameLevelDefinition, GameLevelId } from "@/lib/games/gameLevels";

export type OceanPlasticItemDef = {
  id: string;
  emoji: string;
  label: string;
  /** Lowercase typing target (Guardian / Champion). */
  word: string;
};

export const OCEAN_PLASTIC_ITEMS: OceanPlasticItemDef[] = [
  { id: "straw", emoji: "🥤", label: "Straw", word: "straw" },
  { id: "bag", emoji: "🛍️", label: "Plastic bag", word: "bag" },
  { id: "bottle", emoji: "🍶", label: "Bottle", word: "bottle" },
  { id: "net", emoji: "🎣", label: "Fishing net", word: "net" },
  { id: "container", emoji: "🥡", label: "Container", word: "container" },
  { id: "shampoo", emoji: "🧴", label: "Shampoo", word: "shampoo" },
  { id: "box", emoji: "🍱", label: "Food box", word: "box" },
  { id: "balloon", emoji: "🎈", label: "Balloon", word: "balloon" },
];

/** What the student must type for this item at the chosen hub difficulty. */
export function plasticTypingTarget(item: OceanPlasticItemDef, level: GameLevelDefinition): string {
  const w = item.word.toLowerCase();
  if (level.id === "seedling") return w.slice(0, 1);
  if (level.id === "explorer") return w.slice(0, Math.min(3, w.length));
  return w;
}

export function randomPlasticItem(): OceanPlasticItemDef {
  return OCEAN_PLASTIC_ITEMS[Math.floor(Math.random() * OCEAN_PLASTIC_ITEMS.length)]!;
}

/** Seconds for one item to drift from off-screen left to past the right edge (~116% width). */
export function oceanCrossScreenSeconds(id: GameLevelId): number {
  if (id === "seedling") return 12;
  if (id === "explorer") return 8;
  if (id === "guardian") return 6;
  return 4;
}

/** Horizontal speed in percent-of-play-area per second. */
export function oceanDriftVxPctPerSec(id: GameLevelId): number {
  const travelPct = 116;
  return travelPct / oceanCrossScreenSeconds(id);
}

export function oceanMaxDriftingPieces(id: GameLevelId): number {
  if (id === "seedling" || id === "explorer") return 1;
  return 2;
}

/** Minimum ms between spawns when below max drifting count. */
export function oceanSpawnGapMs(id: GameLevelId): number {
  if (id === "seedling") return 4500;
  if (id === "explorer") return 3500;
  if (id === "guardian") return 2800;
  return 2200;
}

export function oceanLevelTypingHint(level: GameLevelDefinition): string {
  if (level.id === "seedling") {
    return "Seedling: type the first letter only (like s for straw).";
  }
  if (level.id === "explorer") {
    return "Explorer: type the first 3 letters (like str for straw).";
  }
  if (level.id === "guardian") {
    return "Guardian: type the full word (like straw).";
  }
  return "Champion: type the full word — items move a bit quicker!";
}
