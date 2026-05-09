"use client";

import { useEffect, useState } from "react";
import type { BrainSprintLesson, BrainSprintTrack } from "@/lib/brain-sprint/types";
import type { BrainSprintProgress } from "@/lib/brain-sprint/progress-types";
import { fetchProgressForTrack } from "@/lib/brain-sprint/progress-api";
import TrackLessonGrid from "./TrackLessonGrid";

export default function TrackPageBody({
  track,
  totalLessons,
  maxStars,
  lessonsForTrack,
}: {
  track: BrainSprintTrack;
  totalLessons: number;
  maxStars: number;
  lessonsForTrack: BrainSprintLesson[];
}) {
  const [progress, setProgress] = useState<BrainSprintProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const rows = await fetchProgressForTrack(track);
      if (!cancelled) {
        setProgress(rows);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [track]);

  const completedCount = progress.filter((p) => p.is_completed).length;
  const totalScore = progress.reduce((sum, p) => sum + p.best_score, 0);
  const starsSum = progress.reduce((sum, p) => sum + p.best_stars, 0);

  return (
    <>
      <div className="max-w-5xl mx-auto mt-[-50px] relative z-10 px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-[#D1E8DC] p-6">
          <div className="grid grid-cols-3 text-center">
            <div className="border-r border-gray-200 px-2">
              <div className="text-3xl md:text-4xl font-bold text-[#1B4332]">
                {loading ? "…" : `${completedCount} / ${totalLessons}`}
              </div>
              <div className="text-sm text-[#4A6355] uppercase tracking-wider mt-1">Completed</div>
            </div>
            <div className="border-r border-gray-200 px-2">
              <div className="text-3xl md:text-4xl font-bold text-[#1B4332]">
                {loading ? "…" : totalScore}
              </div>
              <div className="text-sm text-[#4A6355] uppercase tracking-wider mt-1">Score</div>
            </div>
            <div className="px-2">
              <div className="text-3xl md:text-4xl font-bold text-[#1B4332]">
                {loading ? "…" : `${starsSum} / ${maxStars}`}
              </div>
              <div className="text-sm text-[#4A6355] uppercase tracking-wider mt-1">Stars</div>
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 mt-12 pb-16">
        <h2 className="text-2xl font-bold text-[#1B4332] mb-6">All Lessons</h2>
        <TrackLessonGrid
          track={track}
          totalLessons={totalLessons}
          lessonsForTrack={lessonsForTrack}
          progressRows={progress}
          progressLoading={loading}
        />
      </section>
    </>
  );
}
