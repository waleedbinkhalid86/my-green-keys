"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import type { BrainSprintLesson, BrainSprintTrack } from "@/lib/brain-sprint/types";
import type { BrainSprintProgress } from "@/lib/brain-sprint/progress-types";
import { isLessonUnlocked } from "@/lib/brain-sprint/progress-api";

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
  progressRows,
  progressLoading,
}: {
  track: BrainSprintTrack;
  totalLessons: number;
  lessonsForTrack: BrainSprintLesson[];
  progressRows: BrainSprintProgress[];
  progressLoading: boolean;
}) {
  useEffect(() => {
    console.log(`[BrainSprint] client track=${track} lessons=${lessonsForTrack.length}`);
  }, [track, lessonsForTrack.length]);

  const progressByLessonId = useMemo(() => {
    const m = new Map<string, BrainSprintProgress>();
    for (const p of progressRows) m.set(p.lesson_id, p);
    return m;
  }, [progressRows]);

  const lessonByNumber = useMemo(() => {
    const m = new Map<number, BrainSprintLesson>();
    for (const l of lessonsForTrack) m.set(l.number, l);
    return m;
  }, [lessonsForTrack]);

  const effectiveProgress = progressLoading ? [] : progressRows;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
      {Array.from({ length: totalLessons }).map((_, idx) => {
        const number = idx + 1;
        const lesson = lessonByNumber.get(number) ?? null;
        if (!lesson) {
          return (
            <div key={number} className="min-w-0">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-h-[160px] flex flex-col opacity-50 cursor-not-allowed">
                <div className="text-base font-bold text-[#1B4332] mt-3">Lesson {number}</div>
                <p className="text-xs text-[#4A6355] mt-2 flex-1">Coming soon.</p>
              </div>
            </div>
          );
        }

        const unlocked = isLessonUnlocked(lesson.id, number, track, effectiveProgress);
        const locked = !unlocked;
        const row = progressByLessonId.get(lesson.id);
        const completed = row?.is_completed === true;
        const stars = row?.best_stars ?? 0;

        const showFirstLessonDot = number === 1 && unlocked && !completed;

        const card = (
          <div
            className={[
              "relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition border border-gray-100 min-h-[160px] flex flex-col",
              lesson && !locked ? "cursor-pointer" : "",
              locked ? "opacity-50 cursor-not-allowed" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {completed ? (
              <div
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#DCFCE7] text-[#166534]"
                aria-label="Completed"
              >
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              </div>
            ) : null}

            <div className="flex justify-between items-start gap-2 pr-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0 ${numberBadgeClasses(track)}`}
              >
                {number}
              </div>
              <span className={difficultyBadgeClasses(lesson.difficulty)}>
                {lesson.difficulty === "easy"
                  ? "Easy"
                  : lesson.difficulty === "medium"
                    ? "Medium"
                    : "Hard"}
              </span>
            </div>

            <div className="text-base font-bold text-[#1B4332] mt-3 mb-1">{lesson.title}</div>

            {completed ? (
              <div className="mb-2 text-sm font-semibold text-amber-600" aria-label={`${stars} stars`}>
                {"★".repeat(stars)}
                {"☆".repeat(Math.max(0, 3 - stars))}
              </div>
            ) : unlocked ? (
              <div className="mb-2 text-xs font-semibold text-[#4A6355]">0 stars</div>
            ) : null}

            <p className="text-xs text-[#4A6355] mb-3 line-clamp-2 flex-1">{lesson.description}</p>

            <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-[#52B788]">
              {locked ? (
                <>
                  <Lock className="h-4 w-4 shrink-0 text-[#4A6355]" aria-hidden />
                  <span className="text-[#4A6355]">
                    🔒 Complete Lesson {number - 1} first
                  </span>
                </>
              ) : (
                <>
                  {showFirstLessonDot ? (
                    <span className="w-2 h-2 rounded-full bg-[#52B788] shrink-0" aria-hidden />
                  ) : null}
                  <span>{completed ? "▶ Try again" : "▶ Start now"}</span>
                </>
              )}
            </div>
          </div>
        );

        if (locked) {
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
