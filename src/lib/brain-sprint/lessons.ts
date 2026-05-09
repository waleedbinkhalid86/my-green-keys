import type { BrainSprintLesson } from "@/lib/brain-sprint/types";

export const SAMPLE_LESSONS: BrainSprintLesson[] = [
  {
    id: "math-1",
    track: "math",
    number: 1,
    title: "Addition - Single Digit",
    description: "Type the answer to each addition problem.",
    difficulty: "easy",
    questions: [
      { id: "q1", question: "3 + 4 = ?", answer: "7" },
      { id: "q2", question: "5 + 2 = ?", answer: "7" },
      { id: "q3", question: "8 + 1 = ?", answer: "9" },
      { id: "q4", question: "6 + 3 = ?", answer: "9" },
      { id: "q5", question: "4 + 5 = ?", answer: "9" },
      { id: "q6", question: "7 + 2 = ?", answer: "9" },
      { id: "q7", question: "2 + 6 = ?", answer: "8" },
      { id: "q8", question: "9 + 0 = ?", answer: "9" },
      { id: "q9", question: "3 + 5 = ?", answer: "8" },
      { id: "q10", question: "4 + 4 = ?", answer: "8" },
      { id: "q11", question: "6 + 2 = ?", answer: "8" },
      { id: "q12", question: "5 + 5 = ?", answer: "10" },
      { id: "q13", question: "7 + 3 = ?", answer: "10" },
      { id: "q14", question: "8 + 2 = ?", answer: "10" },
      { id: "q15", question: "9 + 1 = ?", answer: "10" },
    ],
  },
];
