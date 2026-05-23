import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { effectivePracticeGoal } from "@/lib/lesson-practice/constants";

type CompleteBody = {
  lessonId?: number;
  wpm?: number;
  accuracy?: number;
};

export async function POST(req: Request) {
  let body: CompleteBody;
  try {
    body = (await req.json()) as CompleteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const lessonId = body.lessonId;
  const wpm = body.wpm;
  const accuracy = body.accuracy;

  if (!Number.isInteger(lessonId) || lessonId! < 1 || lessonId! > 100) {
    return NextResponse.json({ error: "Invalid lessonId" }, { status: 400 });
  }
  if (!Number.isFinite(wpm) || wpm! < 0 || wpm! > 300) {
    return NextResponse.json({ error: "Invalid wpm" }, { status: 400 });
  }
  if (!Number.isFinite(accuracy) || accuracy! < 0 || accuracy! > 100) {
    return NextResponse.json({ error: "Invalid accuracy" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("record_lesson_completion", {
    p_lesson_id: lessonId,
    p_wpm: Math.round(wpm!),
    p_accuracy: accuracy,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  const completionCount = Number((row as { completion_count?: number })?.completion_count ?? 0);
  const practiceGoal = effectivePracticeGoal(
    (row as { practice_goal?: number })?.practice_goal
  );

  return NextResponse.json({ completionCount, practiceGoal });
}
