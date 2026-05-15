import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brain Sprint — math + eco lessons",
  description:
    "Quick math sprints and eco lessons designed for kids 6–14. Make learning feel like a game.",
};

export default function BrainSprintLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
