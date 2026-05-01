import type { GameLevelDefinition } from "@/lib/games/gameLevels";

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
