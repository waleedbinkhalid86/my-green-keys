export type BrainSprintTrack = "math" | "eco";

export interface BrainSprintQuestion {
  id: string;
  question: string; // e.g. "23 + 18 = ?"
  answer: string; // e.g. "41"
  hint?: string;
}

export interface BrainSprintLesson {
  id: string; // e.g. "math-1"
  track: BrainSprintTrack;
  number: number; // 1, 2, 3...
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  questions: BrainSprintQuestion[];
}
