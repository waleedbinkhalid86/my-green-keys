export type CertificateType =
  | "seedling"
  | "green_typer"
  | "eco_warrior"
  | "planet_champion";

export type CertificateDefinition = {
  type: CertificateType;
  title: string;
  milestone: number;
  emoji: string;
  badgeText: string;
};

export const CERTIFICATES: CertificateDefinition[] = [
  {
    type: "seedling",
    title: "🌱 Seedling Certificate",
    milestone: 10,
    emoji: "🌱",
    badgeText: "Seedling",
  },
  {
    type: "green_typer",
    title: "🌿 Green Typer Certificate",
    milestone: 25,
    emoji: "🌿",
    badgeText: "Green Typer",
  },
  {
    type: "eco_warrior",
    title: "🌳 Eco Warrior Certificate",
    milestone: 50,
    emoji: "🌳",
    badgeText: "Eco Warrior",
  },
  {
    type: "planet_champion",
    title: "🏆 Planet Champion Certificate",
    milestone: 100,
    emoji: "🏆",
    badgeText: "Planet Champion",
  },
];

export function getCertificateForMilestone(lessonsCompleted: number) {
  return CERTIFICATES.find((c) => c.milestone === lessonsCompleted) || null;
}

export function formatDate(dateLike: string | Date) {
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

