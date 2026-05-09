import { notFound } from "next/navigation";
import LessonClient from "./LessonClient";
import { SAMPLE_LESSONS } from "@/lib/brain-sprint/lessons";
import type { BrainSprintTrack } from "@/lib/brain-sprint/types";

export default function BrainSprintLessonPage({
  params,
}: {
  params: { track: string; lessonId: string };
}) {
  const track = (params.track ?? "").toLowerCase().trim() as BrainSprintTrack;
  const lessonId = (params.lessonId ?? "").toLowerCase().trim();

  if (track !== "math" && track !== "eco") notFound();

  const lesson = SAMPLE_LESSONS.find((l) => l.track === track && l.id.toLowerCase() === lessonId) ?? null;
  if (!lesson) notFound();

  return <LessonClient lesson={lesson} />;
}

