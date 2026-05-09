"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BrainSprintLesson, BrainSprintTrack } from "@/lib/brain-sprint/types";

type LessonProgress = Record<string, { completed: boolean; stars: number }>;

function difficultyBadgeClasses(difficulty: BrainSprintLesson["difficulty"]) {
  const base = "text-xs font-semibold px-2 py-1 rounded-full";
  if (difficulty === "easy") return `${base} bg-green-100 text-green-700`;
  if (difficulty === "medium") return `${base} bg-yellow-100 text-yellow-700`;
  return `${base} bg-red-100 text-red-700`;
}

function numberBadgeClasses(track: BrainSprintTrack) {
  if (track === "eco") return "bg-[#D1FAE5] text-[#065F46]";
  return "bg-[#DBEAFE] text-[#1E40AF]";
}

export default function TrackLessonGrid({
  track,
  totalLessons,
  lessonsForTrack,
}: {
  track: BrainSprintTrack;
  totalLessons: number;
  lessonsForTrack: BrainSprintLesson[];
}) {
  const [progress] = useState<LessonProgress>(() => {
    const initial: LessonProgress = {};
    for (const l of lessonsForTrack) initial[l.id] = { completed: false, stars: 0 };
    return initial;
  });

  useEffect(() => {
    console.log(`[BrainSprint] client track=${track} lessons=${lessonsForTrack.length}`);
  }, [track, lessonsForTrack.length]);

  const lessonByNumber = useMemo(() => {
    const m = new Map<number, BrainSprintLesson>();
    for (const l of lessonsForTrack) m.set(l.number, l);
    return m;
  }, [lessonsForTrack]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
      {Array.from({ length: totalLessons }).map((_, idx) => {
        const number = idx + 1;
        const lesson = lessonByNumber.get(number) ?? null;

        const prevLesson = lessonByNumber.get(number - 1) ?? null;
        const prevCompleted = prevLesson ? progress[prevLesson.id]?.completed === true : true;
        const wouldBeUnlocked = number === 1 || prevCompleted;

        const enforceSequentialUnlock = false;
        const locked = enforceSequentialUnlock ? !wouldBeUnlocked : false;

        const showFirstLessonDot = number === 1;

        const card = (
          <div
            className={[
              "bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition border border-gray-100 min-h-[160px] flex flex-col",
              lesson && !locked ? "cursor-pointer" : "",
              locked ? "opacity-50 cursor-not-allowed" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="flex justify-between items-start gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0 ${numberBadgeClasses(track)}`}
              >
                {number}
              </div>
              {lesson ? (
                <span className={difficultyBadgeClasses(lesson.difficulty)}>
                  {lesson.difficulty === "easy"
                    ? "Easy"
                    : lesson.difficulty === "medium"
                      ? "Medium"
                      : "Hard"}
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  Soon
                </span>
              )}
            </div>

            <div className="text-base font-bold text-[#1B4332] mt-3 mb-2">
              {lesson?.title ?? `Lesson ${number}`}
            </div>
            <p className="text-xs text-[#4A6355] mb-3 line-clamp-2 flex-1">
              {lesson?.description ?? "Coming soon."}
            </p>

            <div className="flex items-center gap-2 text-sm font-semibold text-[#52B788] mt-auto">
              {showFirstLessonDot && <span className="w-2 h-2 rounded-full bg-[#52B788] shrink-0" aria-hidden />}
              <span>▶ Start now</span>
            </div>
          </div>
        );

        if (!lesson || locked) {
          return (
            <div key={number} className="min-w-0">
              {card}
            </div>
          );
        }

        return (
          <Link key={number} href={`/brain-sprint/${track}/${lesson.id}`} className="min-w-0 block no-underline">
            {card}
          </Link>
        );
      })}
    </div>
  );
}
