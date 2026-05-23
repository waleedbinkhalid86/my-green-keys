import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  MAX_PRACTICE_GOAL,
  MIN_PRACTICE_GOAL,
  effectivePracticeGoal,
} from "@/lib/lesson-practice/constants";

type PracticeGoalBody = {
  lessonId?: number;
  practiceGoal?: number;
};

export async function POST(req: Request) {
  let body: PracticeGoalBody;
  try {
    body = (await req.json()) as PracticeGoalBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const lessonId = body.lessonId;
  const practiceGoal = body.practiceGoal;

  if (!Number.isInteger(lessonId) || lessonId! < 1 || lessonId! > 100) {
    return NextResponse.json({ error: "Invalid lessonId" }, { status: 400 });
  }
  if (
    !Number.isInteger(practiceGoal) ||
    practiceGoal! < MIN_PRACTICE_GOAL ||
    practiceGoal! > MAX_PRACTICE_GOAL
  ) {
    return NextResponse.json(
      { error: `practiceGoal must be ${MIN_PRACTICE_GOAL}–${MAX_PRACTICE_GOAL}` },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("set_lesson_practice_goal", {
    p_lesson_id: lessonId,
    p_practice_goal: practiceGoal,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    practiceGoal: effectivePracticeGoal(data as number),
  });
}
