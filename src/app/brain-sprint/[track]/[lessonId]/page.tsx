import { notFound } from "next/navigation";
import LessonClient from "./LessonClient";
import { SAMPLE_LESSONS } from "@/lib/brain-sprint/lessons";
import type { BrainSprintTrack } from "@/lib/brain-sprint/types";

export default async function BrainSprintLessonPage({
  params,
}: {
  params: Promise<{ track: string; lessonId: string }>;
}) {
  const { track: rawTrack, lessonId: rawLessonId } = await params;
  const track = (rawTrack ?? "").toLowerCase().trim() as BrainSprintTrack;
  const lessonId = (rawLessonId ?? "").toLowerCase().trim();

  if (track !== "math" && track !== "eco") notFound();

  const lesson = SAMPLE_LESSONS.find((l) => l.track === track && l.id.toLowerCase() === lessonId) ?? null;
  if (!lesson) notFound();

  return <LessonClient lesson={lesson} />;
}

