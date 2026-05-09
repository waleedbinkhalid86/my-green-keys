import Image from "next/image";
import Link from "next/link";
import { SAMPLE_LESSONS } from "@/lib/brain-sprint/lessons";
import type { BrainSprintTrack } from "@/lib/brain-sprint/types";
import TrackPageBody from "./TrackPageBody";

const dottedBg: React.CSSProperties = {
  backgroundColor: "#FAFAF7",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  minHeight: "100vh",
};

function trackHeroMeta(track: BrainSprintTrack) {
  if (track === "math") {
    return {
      heroImage: "/images/brain-sprint/math-hero.png",
      eyebrow: "TRACK 1",
      eyebrowClass: "text-blue-300",
      title: "Math Mastery",
      description: "Type the answer. Move fast. Get smarter.",
      countLabel: "Lessons 1-10",
    } as const;
  }
  return {
    heroImage: "/images/brain-sprint/eco-hero.png",
    eyebrow: "TRACK 2",
    eyebrowClass: "text-green-300",
    title: "Eco Genius",
    description: "Quiz your way through planet facts and habits.",
    countLabel: "Lessons 1-5",
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

  if (track !== "math" && track !== "eco") {
    return (
      <div style={dottedBg} className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-2xl bg-white p-8 shadow-md ring-1 ring-black/5">
          <div className="text-xl font-extrabold text-[#1B4332]">Track not found</div>
          <Link href="/brain-sprint" className="mt-3 inline-flex font-bold text-[#52B788]">
            ← Back to Brain Sprint
          </Link>
        </div>
      </div>
    );
  }

  const meta = trackHeroMeta(track);

  return (
    <div style={dottedBg} className="min-h-screen font-sans">
      <section className="relative h-[400px] w-full overflow-hidden">
        <Image
          src={meta.heroImage}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/90 to-transparent" aria-hidden />

        <Link
          href="/brain-sprint"
          className="absolute left-0 top-0 z-10 p-6 text-white/90 font-semibold transition hover:text-white"
        >
          ← Back to Brain Sprint
        </Link>

        <div className="absolute inset-0 flex items-end">
          <div className="p-10">
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${meta.eyebrowClass}`}>
              {meta.eyebrow}
            </p>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-3">{meta.title}</h1>
            <p className="text-lg text-white/90 mb-1">{meta.description}</p>
            <p className="text-sm text-white/70">{meta.countLabel}</p>
          </div>
        </div>
      </section>

      <TrackPageBody
        track={track}
        totalLessons={track === "math" ? 10 : 5}
        maxStars={track === "math" ? 30 : 15}
        lessonsForTrack={lessonsForTrack}
      />
    </div>
  );
}
