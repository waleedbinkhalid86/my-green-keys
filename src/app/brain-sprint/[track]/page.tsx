import Link from "next/link";
import { Lock } from "lucide-react";
import { SAMPLE_LESSONS } from "@/lib/brain-sprint/lessons";
import type { BrainSprintLesson, BrainSprintTrack } from "@/lib/brain-sprint/types";

const dottedBg: React.CSSProperties = {
  backgroundColor: "#FAFAF7",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  minHeight: "100vh",
};

function trackMeta(track: BrainSprintTrack) {
  if (track === "math") {
    return {
      eyebrow: "MATH MASTERY",
      title: "Math Mastery",
      accent: "#3B82F6",
      totalLessons: 10,
    } as const;
  }
  return {
    eyebrow: "ECO GENIUS",
    title: "Eco Genius",
    accent: "#52B788",
    totalLessons: 5,
  } as const;
}

function difficultyBadge(difficulty: BrainSprintLesson["difficulty"]) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold";
  if (difficulty === "easy") return `${base} bg-[#E8F5EE] text-[#1B4332]`;
  if (difficulty === "medium") return `${base} bg-[#FFF8E1] text-amber-800`;
  return `${base} bg-[#FFEBEE] text-red-800`;
}

export default function BrainSprintTrackPage({ params }: { params: { track: string } }) {
  const track = (params.track ?? "").toLowerCase().trim() as BrainSprintTrack;

  if (track !== "math" && track !== "eco") {
    return (
      <div style={dottedBg} className="flex items-center justify-center">
        <div className="rounded-2xl bg-white p-8 shadow-md ring-1 ring-black/5">
          <div className="text-xl font-extrabold text-[#1B4332]">Track not found</div>
          <Link href="/brain-sprint" className="mt-3 inline-flex font-bold text-[#52B788]">
            ← Back to Brain Sprint
          </Link>
        </div>
      </div>
    );
  }

  const meta = trackMeta(track);

  const lessonsForTrack = SAMPLE_LESSONS.filter((l) => l.track === track).sort((a, b) => a.number - b.number);

  return (
    <div style={dottedBg}>
      <section className="mgk-section-tight">
        <div className="mgk-container">
          <Link href="/brain-sprint" className="inline-flex font-extrabold text-[#1B4332] hover:underline">
            ← Back to Brain Sprint
          </Link>

          <div className="mx-auto mt-4 max-w-5xl rounded-2xl bg-white p-8 shadow-md ring-1 ring-black/5">
            <div className="text-xs font-bold tracking-wider uppercase" style={{ color: meta.accent }}>
              {meta.eyebrow}
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-[#1B4332]">{meta.title}</h1>
            <p className="mt-2 text-sm font-semibold text-[#4A6355]">
              Type the answer. Move fast. Get smarter.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-5xl">
            {track === "math" ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {Array.from({ length: meta.totalLessons }).map((_, idx) => {
                  const number = idx + 1;
                  const lesson = lessonsForTrack.find((l) => l.number === number) ?? null;
                  const unlocked = number === 1 && lesson != null;
                  const cardInner = (
                    <div
                      className={[
                        "rounded-2xl bg-white p-6 shadow-md ring-1 ring-black/5 transition",
                        unlocked ? "hover:shadow-xl hover:-translate-y-1" : "opacity-50",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-3xl font-black text-[#1B4332]">{String(number).padStart(2, "0")}</div>
                        {lesson ? (
                          <span className={difficultyBadge(lesson.difficulty)}>
                            {lesson.difficulty === "easy"
                              ? "Easy"
                              : lesson.difficulty === "medium"
                                ? "Medium"
                                : "Hard"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-600">
                            Coming soon
                          </span>
                        )}
                      </div>

                      <div className="mt-3 text-lg font-extrabold text-[#1B4332]">
                        {lesson?.title ?? `Lesson ${number}`}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-[#4A6355]">
                        {lesson?.description ?? "Locked"}
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm font-extrabold text-[#1B4332]">
                        <span>0 stars earned</span>
                        {!unlocked && <Lock className="h-5 w-5 text-gray-500" aria-hidden />}
                      </div>
                    </div>
                  );

                  if (!unlocked || !lesson) return <div key={number}>{cardInner}</div>;

                  return (
                    <Link
                      key={number}
                      href={`/brain-sprint/${track}/${lesson.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      {cardInner}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {Array.from({ length: meta.totalLessons }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-black/5 opacity-50"
                  >
                    <div className="text-3xl font-black text-[#1B4332]">{String(idx + 1).padStart(2, "0")}</div>
                    <div className="mt-3 text-lg font-extrabold text-[#1B4332]">Coming soon</div>
                    <div className="mt-1 text-sm font-semibold text-[#4A6355]">
                      Eco Genius lessons are coming in a later phase.
                    </div>
                    <div className="mt-4 flex items-center justify-end text-sm font-extrabold text-gray-600">
                      <Lock className="h-5 w-5" aria-hidden />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

