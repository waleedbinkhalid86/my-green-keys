import { lessons } from "@/data/lessons";
import type { EcoFact } from "@/data/ecoFacts";
import { ecoFacts } from "@/data/ecoFacts";
import { buildPoolFromLessons, isAllowedGamePhrase, pickRandomWord } from "@/lib/games/lessonVocab";
import type { GameLevelDefinition } from "@/lib/games/gameLevels";

export type GardenPlantTier = "flower" | "bush" | "tree" | "fruit" | "magical";

export type GardenCell = {
  plantKey: string | null;
  tier: GardenPlantTier | null;
  /** 0 = empty; 1 seed → 4 full bloom / tree */
  stage: number;
};

export type GardenData = {
  cells: GardenCell[];
  /** Animal ids already celebrated (butterfly, bird, bee, rabbit) */
  animalsUnlocked: string[];
  createdAtIso: string;
};

export const GARDEN_GRID_SLOTS = 12;
export const GARDEN_MAX_STAGE = 4;

export const GARDEN_PLANTS: Record<
  string,
  { emoji: string; label: string; tier: GardenPlantTier; fact: string }
> = {
  rose: { emoji: "🌹", label: "Rose", tier: "flower", fact: "Flowers help plants make seeds." },
  sunflower: {
    emoji: "🌻",
    label: "Sunflower",
    tier: "flower",
    fact: "Sunflowers can turn their faces toward the sun.",
  },
  daisy: { emoji: "🌼", label: "Daisy", tier: "flower", fact: "Native plants usually need less extra water." },
  lavender: { emoji: "💜", label: "Lavender", tier: "bush", fact: "Herbs like lavender can attract pollinators." },
  mint: { emoji: "🌿", label: "Mint", tier: "bush", fact: "Herbs like mint are easy garden plants." },
  basil: { emoji: "🌿", label: "Basil", tier: "bush", fact: "Leafy greens grow best with water and sun." },
  oak: { emoji: "🌳", label: "Oak", tier: "tree", fact: "Some trees can live for hundreds of years." },
  mango: { emoji: "🥭", label: "Mango tree", tier: "tree", fact: "Many fruits grow from flowers after pollination." },
  apple: { emoji: "🍎", label: "Apple tree", tier: "tree", fact: "Bees help many fruits form." },
  cherry: { emoji: "🍒", label: "Cherry", tier: "fruit", fact: "Pollination helps plants make seeds." },
  lemon: { emoji: "🍋", label: "Lemon", tier: "fruit", fact: "Compost adds nutrients back into garden soil." },
  orange: { emoji: "🍊", label: "Orange", tier: "fruit", fact: "Fruits can store water and vitamins." },
  glow: { emoji: "✨", label: "Glow fern", tier: "magical", fact: "Plants need light, water, and nutrients to grow." },
  sparkle: { emoji: "🌟", label: "Star vine", tier: "magical", fact: "Gardens can be mini-habitats for insects and birds." },
};

const TIER_MAX_LESSON: Record<GardenPlantTier, number> = {
  flower: 20,
  bush: 45,
  tree: 65,
  fruit: 85,
  magical: 100,
};

export function maxUnlockedTier(maxCompletedLessonId: number): GardenPlantTier {
  if (maxCompletedLessonId >= 86) return "magical";
  if (maxCompletedLessonId >= 66) return "fruit";
  if (maxCompletedLessonId >= 46) return "tree";
  if (maxCompletedLessonId >= 21) return "bush";
  return "flower";
}

export function plantKeysForTier(tier: GardenPlantTier): string[] {
  return Object.entries(GARDEN_PLANTS)
    .filter(([, v]) => v.tier === tier)
    .map(([k]) => k);
}

export function pickRandomPlantKey(maxCompletedLessonId: number): string {
  const tier = maxUnlockedTier(maxCompletedLessonId);
  const keys = plantKeysForTier(tier);
  return keys[Math.floor(Math.random() * keys.length)]!;
}

export function emptyGardenData(): GardenData {
  return {
    cells: Array.from({ length: GARDEN_GRID_SLOTS }, () => ({
      plantKey: null,
      tier: null,
      stage: 0,
    })),
    animalsUnlocked: [],
    createdAtIso: new Date().toISOString(),
  };
}

export function countGardenPlants(data: GardenData): number {
  return data.cells.filter((c) => c.plantKey != null).length;
}

export function sumGardenGrowth(data: GardenData): number {
  return data.cells.reduce((acc, c) => acc + (c.plantKey ? c.stage : 0), 0);
}

/** Approximate “kg CO₂ / year” style impact for kids (small, rounded). */
export function gardenCo2AbsorptionKg(data: GardenData): number {
  const growth = sumGardenGrowth(data);
  return Math.round(growth * 0.8) / 10;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / 86400000);
}

/**
 * While away, plants creep toward the next stage (not past bloom).
 */
export function applyOfflineGrowth(data: GardenData, lastVisit: Date, now: Date): GardenData {
  const days = Math.floor((now.getTime() - lastVisit.getTime()) / 86400000);
  if (days <= 0) return data;
  const bumps = Math.min(3, Math.max(1, Math.floor(days / 2)));
  const cells = data.cells.map((c) => {
    if (!c.plantKey || c.stage >= GARDEN_MAX_STAGE) return c;
    return { ...c, stage: Math.min(GARDEN_MAX_STAGE, c.stage + bumps) };
  });
  return { ...data, cells };
}

export type GardenAnimalDef = {
  id: string;
  emoji: string;
  label: string;
  thresholdPlants: number;
  fact: string;
};

export const GARDEN_ANIMALS: GardenAnimalDef[] = [
  {
    id: "butterfly",
    emoji: "🦋",
    label: "Butterfly",
    thresholdPlants: 5,
    fact: "Butterflies help pollinate flowers as they sip nectar.",
  },
  {
    id: "bird",
    emoji: "🐦",
    label: "Bird",
    thresholdPlants: 10,
    fact: "Birds spread seeds and help keep bug numbers balanced.",
  },
  {
    id: "bee",
    emoji: "🐝",
    label: "Bee",
    thresholdPlants: 15,
    fact: "Bees are superstar pollinators for fruits and flowers.",
  },
  {
    id: "rabbit",
    emoji: "🐰",
    label: "Rabbit",
    thresholdPlants: 20,
    fact: "Rabbits are part of the food web—plants feed many animals.",
  },
];

export function newlyUnlockedAnimals(totalPlants: number, already: string[]): GardenAnimalDef[] {
  return GARDEN_ANIMALS.filter(
    (a) => totalPlants >= a.thresholdPlants && !already.includes(a.id)
  );
}

export function gardenWordPool(
  completedLessonIds: number[],
  level: GameLevelDefinition
): string[] {
  const ids =
    completedLessonIds.length > 0 ? [...completedLessonIds].sort((a, b) => a - b) : [1];
  if (level.id === "seedling") return buildPoolFromLessons(ids, 3, 3);
  if (level.id === "explorer") return buildPoolFromLessons(ids, 4, 5);
  if (level.id === "guardian") return buildPoolFromLessons(ids, 5, 6);
  return buildPoolFromLessons(ids, 5, 8);
}

export function pickGardenWord(pool: string[]): string {
  return pickRandomWord(pool);
}

export function gardenSentencePool(completedLessonIds: number[]): string[] {
  const idSet = new Set(completedLessonIds.length ? completedLessonIds : [1]);
  const out: string[] = [];
  for (const lesson of lessons) {
    if (!idSet.has(lesson.id)) continue;
    const s = lesson.sentence.trim();
    if (s.length < 12 || s.length > 52) continue;
    if (!isAllowedGamePhrase(s)) continue;
    out.push(s);
  }
  return out;
}

export function pickGardenSentence(completedLessonIds: number[]): string {
  const pool = gardenSentencePool(completedLessonIds);
  if (pool.length === 0) return "I help the earth stay green.";
  return pool[Math.floor(Math.random() * pool.length)]!;
}

/** Lowercase letters, digits, and spaces only (for typing mini-games). */
export function typingTargetFromPhrase(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function plantFactForKey(plantKey: string): string | null {
  return GARDEN_PLANTS[plantKey]?.fact ?? null;
}

export function randomPlantsGardenFact(): EcoFact {
  const pool = ecoFacts.filter((f) => f.category === "PLANTS & GARDENS");
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export function cellDisplayEmoji(cell: GardenCell): string {
  if (!cell.plantKey) return "";
  const meta = GARDEN_PLANTS[cell.plantKey];
  if (!meta) return "🌱";
  if (cell.stage <= 1) return "🫘";
  if (cell.stage === 2) return "🌱";
  if (cell.stage === 3) return meta.tier === "tree" || meta.tier === "fruit" ? "🌲" : "🌿";
  return meta.emoji;
}
