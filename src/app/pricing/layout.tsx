import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free for every child",
  description:
    "My Green Keys is free for kids, parents and schools. Typing, Brain Sprint, Habit Quest, games and dashboards, with no plans, no trials and no credit card.",
};

export default function PricingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
