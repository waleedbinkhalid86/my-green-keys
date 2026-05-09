import Link from "next/link";
import { SAMPLE_LESSONS } from "@/lib/brain-sprint/lessons";
import type { BrainSprintTrack } from "@/lib/brain-sprint/types";
import TrackLessonGrid from "./TrackLessonGrid";

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

export default async function BrainSprintTrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track: rawTrack } = await params;
  const track = (rawTrack ?? "").toLowerCase().trim() as BrainSprintTrack;

  const lessonsForTrack = SAMPLE_LESSONS.filter((l) => l.track === track).sort((a, b) => a.number - b.number);
  console.log(`[BrainSprint] track=${track} lessons=${lessonsForTrack.length}`);

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
            <TrackLessonGrid track={track} totalLessons={meta.totalLessons} lessonsForTrack={lessonsForTrack} />
          </div>
        </div>
      </section>
    </div>
  );
}

