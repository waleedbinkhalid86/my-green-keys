"use client";

import Link from "next/link";
import { CheckCircle2, Lock, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BrainSprintLesson, BrainSprintTrack } from "@/lib/brain-sprint/types";

type LessonProgress = Record<string, { completed: boolean; stars: number }>;

function difficultyBadge(difficulty: BrainSprintLesson["difficulty"]) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold";
  if (difficulty === "easy") return `${base} bg-[#E8F5EE] text-[#1B4332]`;
  if (difficulty === "medium") return `${base} bg-[#FFF8E1] text-amber-800`;
  return `${base} bg-[#FFEBEE] text-red-800`;
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
  // Phase 1B: no localStorage/sessionStorage; progress resets on refresh.
  const [progress] = useState<LessonProgress>(() => {
    const initial: LessonProgress = {};
    for (const l of lessonsForTrack) initial[l.id] = { completed: false, stars: 0 };
    return initial;
  });

  useEffect(() => {
    console.log(`[BrainSprint] client track=${track} lessons=${lessonsForTrack.length}`);
  }, [track, lessonsForTrack.length]);

  const accentBorderClass = track === "eco" ? "border-[#52B788]" : "border-[#3B82F6]";

  const lessonByNumber = useMemo(() => {
    const m = new Map<number, BrainSprintLesson>();
    for (const l of lessonsForTrack) m.set(l.number, l);
    return m;
  }, [lessonsForTrack]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {Array.from({ length: totalLessons }).map((_, idx) => {
        const number = idx + 1;
        const lesson = lessonByNumber.get(number) ?? null;

        const prevLesson = lessonByNumber.get(number - 1) ?? null;
        const prevCompleted = prevLesson ? progress[prevLesson.id]?.completed === true : true;

        const wouldBeUnlocked = number === 1 || prevCompleted;

        // Phase 1B requirement: everything visible + clickable for testing.
        // Sequential unlocking is scaffolded but NOT enforced yet (no persistence).
        const enforceSequentialUnlock = false;
        const locked = enforceSequentialUnlock ? !wouldBeUnlocked : false;

        const p = lesson ? progress[lesson.id] : null;
        const stars = Math.max(0, Math.min(3, p?.stars ?? 0));
        const completed = p?.completed === true;

        const cardInner = (
          <div
            className={[
              "relative rounded-2xl bg-white p-6 shadow-md ring-1 ring-black/5 transition",
              `border-l-4 ${accentBorderClass}`,
              lesson ? "hover:shadow-xl hover:-translate-y-1" : "",
              locked ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
          >
            {completed && (
              <div className="absolute right-3 top-3">
                <CheckCircle2 className="h-6 w-6 text-[#52B788]" aria-label="Completed" />
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="text-3xl font-black text-[#1B4332]">{String(number).padStart(2, "0")}</div>
              {lesson ? (
                <span className={difficultyBadge(lesson.difficulty)}>
                  {lesson.difficulty === "easy" ? "Easy" : lesson.difficulty === "medium" ? "Medium" : "Hard"}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-600">
                  Coming soon
                </span>
              )}
            </div>

            <div className="mt-3 text-lg font-extrabold text-[#1B4332]">{lesson?.title ?? `Lesson ${number}`}</div>
            <div className="mt-1 text-sm font-semibold text-[#4A6355]">{lesson?.description ?? "Locked"}</div>

            <div className="mt-4 flex items-center justify-between text-sm font-extrabold text-[#1B4332]">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500" aria-hidden />
                {stars} / 3
              </span>
              {locked && <Lock className="h-5 w-5 text-gray-500" aria-hidden />}
            </div>
          </div>
        );

        if (!lesson) return <div key={number}>{cardInner}</div>;
        if (locked) return <div key={number}>{cardInner}</div>;

        return (
          <Link key={number} href={`/brain-sprint/${track}/${lesson.id}`} style={{ textDecoration: "none" }}>
            {cardInner}
          </Link>
        );
      })}
    </div>
  );
}

