import type { SortBin } from "@/lib/games/gameLevels";

export type RecyclingItem = {
  id: string;
  name: string;
  emoji: string;
  bin: SortBin;
  /** Shown when player sorts into the wrong bin. */
  wrongHint: string;
};

export const RECYCLING_ITEMS: RecyclingItem[] = [
  {
    id: "water-bottle",
    name: "Water bottle",
    emoji: "🧴",
    bin: "plastic",
    wrongHint: "Plastic bottles go in the Plastic bin ♻️ so they can be made into new bottles!",
  },
  {
    id: "plastic-bag",
    name: "Plastic bag",
    emoji: "🛍️",
    bin: "plastic",
    wrongHint: "Plastic bags clog recycling machines! They belong in the Plastic bin ♻️ (or a store drop-off).",
  },
  {
    id: "straw",
    name: "Straw",
    emoji: "🥤",
    bin: "plastic",
    wrongHint: "Most straws are plastic—put them in the Plastic bin ♻️ so they don’t litter nature.",
  },
  {
    id: "yogurt-cup",
    name: "Yogurt cup",
    emoji: "🥛",
    bin: "plastic",
    wrongHint: "Yogurt cups are usually plastic—sort them into the Plastic bin ♻️.",
  },
  {
    id: "shampoo-bottle",
    name: "Shampoo bottle",
    emoji: "🧴",
    bin: "plastic",
    wrongHint: "Empty shampoo bottles are plastic—Plastic bin ♻️ keeps them in the loop!",
  },
  {
    id: "newspaper",
    name: "Newspaper",
    emoji: "📰",
    bin: "paper",
    wrongHint: "Newsprint is paper—Paper bin 📄 saves trees on the next print run!",
  },
  {
    id: "cardboard-box",
    name: "Cardboard box",
    emoji: "📦",
    bin: "paper",
    wrongHint: "Cardboard is paper—flatten it into the Paper bin 📄.",
  },
  {
    id: "magazine",
    name: "Magazine",
    emoji: "📓",
    bin: "paper",
    wrongHint: "Glossy magazines are still paper—Paper bin 📄!",
  },
  {
    id: "paper-bag",
    name: "Paper bag",
    emoji: "🥡",
    bin: "paper",
    wrongHint: "Clean paper bags belong in the Paper bin 📄.",
  },
  {
    id: "notebook",
    name: "Notebook",
    emoji: "📔",
    bin: "paper",
    wrongHint: "Paper notebooks go in the Paper bin 📄 (remove lots of metal first if you can).",
  },
  {
    id: "banana-peel",
    name: "Banana peel",
    emoji: "🍌",
    bin: "organic",
    wrongHint: "Peels are food waste—Organic bin 🌱 becomes compost, not landfill smell!",
  },
  {
    id: "apple-core",
    name: "Apple core",
    emoji: "🍎",
    bin: "organic",
    wrongHint: "Apple cores are organic—Green bin 🌱 feeds compost bugs.",
  },
  {
    id: "egg-shell",
    name: "Egg shell",
    emoji: "🥚",
    bin: "organic",
    wrongHint: "Eggshells add minerals to compost—Organic bin 🌱!",
  },
  {
    id: "coffee-grounds",
    name: "Coffee grounds",
    emoji: "☕",
    bin: "organic",
    wrongHint: "Coffee grounds are great for compost—Organic bin 🌱.",
  },
  {
    id: "vegetable-scraps",
    name: "Vegetable scraps",
    emoji: "🥕",
    bin: "organic",
    wrongHint: "Veggie scraps belong in the Organic bin 🌱, not plastic!",
  },
  {
    id: "glass-jar",
    name: "Glass jar",
    emoji: "🏺",
    bin: "glass",
    wrongHint: "Glass jars melt and recycle forever—Glass bin 🔵!",
  },
  {
    id: "wine-bottle",
    name: "Wine bottle",
    emoji: "🍷",
    bin: "glass",
    wrongHint: "Bottles are glass—Glass bin 🔵 saves energy vs making new glass.",
  },
  {
    id: "glass-bottle",
    name: "Glass bottle",
    emoji: "🍼",
    bin: "glass",
    wrongHint: "Clear or colored glass bottles go in the Glass bin 🔵.",
  },
  {
    id: "mirror",
    name: "Mirror",
    emoji: "🪞",
    bin: "glass",
    wrongHint: "Mirrors are glass—Glass bin 🔵 (check local rules for coated glass).",
  },
  {
    id: "light-bulb",
    name: "Light bulb",
    emoji: "💡",
    bin: "glass",
    wrongHint: "Many bulbs are glass—Glass bin 🔵; some types need special drop-off—check locally!",
  },
];

export const RECYCLING_FACTS: string[] = [
  "Recycling one glass bottle saves enough energy to power a TV for about three hours!",
  "Plastic can take hundreds of years to break down—recycling keeps it useful longer.",
  "Paper recycling saves trees and water—one ton of paper can save 17 mature trees.",
  "Composting food scraps cuts landfill methane—a powerful greenhouse gas.",
  "Rinsing containers helps recycling centers work better (no need for perfect shine!).",
  "Sorting right keeps paper clean—greasy pizza boxes often belong with organic or trash locally.",
  "Aluminum recycles forever—your can might become a bike part someday!",
  "Many cities want glass separate—broken glass can spoil paper bales.",
];

export function randomRecyclingFact(): string {
  return RECYCLING_FACTS[Math.floor(Math.random() * RECYCLING_FACTS.length)]!;
}

export function randomRecyclingItem(): RecyclingItem {
  return RECYCLING_ITEMS[Math.floor(Math.random() * RECYCLING_ITEMS.length)]!;
}
