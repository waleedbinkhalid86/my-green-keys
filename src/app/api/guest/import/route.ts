import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getRankFromXp } from "@/lib/rangerHelpers";
import {
  isRateLimited,
  rateLimitKey,
  recordRateLimitHit,
} from "@/lib/rate-limit/server";

/**
 * One-time import of guest (localStorage) typing progress into a student account.
 * The client may only say which lessons it did plus best WPM/accuracy; counts, XP,
 * streaks, stars and eco points are never accepted. Streaks, eco points,
 * certificates, pet and quests are not touched.
 */

const MAX_BODY_BYTES = 4096;
const MAX_LESSONS = 20;
const MAX_WPM = 120;
const XP_PER_LESSON = 10;
const MAX_IMPORT_XP = 200;
const GUEST_IMPORT_SOURCE = "guest_import";

// Every attempt counts; a real import needs one or two.
const MAX_ATTEMPTS = 10;
const WINDOW_SECONDS = 60 * 60;

const errors = {
  badRequest: "That request could not be processed.",
  unauthorized: "Please log in first.",
  forbidden: "Only student accounts can add guest progress.",
  alreadyImported: "Guest progress was already added to this account.",
  tooMany: "Too many tries. Please wait and try again later.",
  unavailable: "This is not available right now. Please try again soon.",
  failed: "Something went wrong. Please try again.",
};

type ImportLesson = { id: number; wpm: number; accuracy: number };

const json = (body: Record<string, unknown>, status: number) => NextResponse.json(body, { status });

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Returns validated lessons, or null for anything malformed. Extra fields are ignored. */
function parseLessons(raw: unknown): ImportLesson[] | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const list = (raw as { lessons?: unknown }).lessons;
  if (!Array.isArray(list) || list.length === 0 || list.length > MAX_LESSONS) return null;

  const seen = new Set<number>();
  const out: ImportLesson[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const { id, bestWpm, bestAccuracy } = item as { id?: unknown; bestWpm?: unknown; bestAccuracy?: unknown };
    if (typeof id !== "number" || !Number.isInteger(id) || id < 1 || id > 100 || seen.has(id)) return null;
    if (typeof bestWpm !== "number" || !Number.isFinite(bestWpm)) return null;
    if (typeof bestAccuracy !== "number" || !Number.isFinite(bestAccuracy)) return null;
    seen.add(id);
    out.push({
      id,
      wpm: Math.round(clamp(bestWpm, 0, MAX_WPM)),
      accuracy: Math.round(clamp(bestAccuracy, 0, 100) * 100) / 100,
    });
  }
  return out;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: errors.unauthorized }, 401);

  let admin: ReturnType<typeof createServiceRoleClient>;
  try {
    admin = createServiceRoleClient();
  } catch (err) {
    console.error("[guest/import] service role client unavailable:", err);
    return json({ error: errors.unavailable }, 503);
  }

  const key = rateLimitKey("guest-import", user.id);
  try {
    if (await isRateLimited(admin, key, MAX_ATTEMPTS, WINDOW_SECONDS)) {
      return json({ error: errors.tooMany }, 429);
    }
    await recordRateLimitHit(admin, key, WINDOW_SECONDS);
  } catch (err) {
    // Fail closed: no import without a working limiter.
    console.error("[guest/import] rate limiter unavailable, refusing:", err);
    return json({ error: errors.unavailable }, 503);
  }

  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return json({ error: errors.badRequest }, 400);
  let lessons: ImportLesson[] | null;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) return json({ error: errors.badRequest }, 400);
    lessons = parseLessons(JSON.parse(text));
  } catch {
    lessons = null;
  }
  if (!lessons) return json({ error: errors.badRequest }, 400);

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("account_type, ranger_xp")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    console.error("[guest/import] profile lookup failed:", profileError.message);
    return json({ error: errors.failed }, 500);
  }
  if (profile?.account_type !== "student") return json({ error: errors.forbidden }, 403);

  const { count: priorImports, error: priorError } = await admin
    .from("ranger_xp_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("source", GUEST_IMPORT_SOURCE);
  if (priorError) {
    console.error("[guest/import] import marker lookup failed:", priorError.message);
    return json({ error: errors.failed }, 500);
  }
  if ((priorImports ?? 0) > 0) return json({ error: errors.alreadyImported }, 409);

  // One completion per lesson, as the student, through the same RPC as /api/lesson/complete.
  for (const lesson of lessons) {
    const { error: rpcError } = await supabase.rpc("record_lesson_completion", {
      p_lesson_id: lesson.id,
      p_wpm: lesson.wpm,
      p_accuracy: lesson.accuracy,
    });
    if (rpcError) {
      console.error("[guest/import] record_lesson_completion failed:", rpcError.message);
      return json({ error: errors.failed }, 500);
    }
  }

  // XP: same read-add-update as awardXp, flat and capped. The log row doubles as the import marker.
  const xp = Math.min(MAX_IMPORT_XP, lessons.length * XP_PER_LESSON);
  const { data: markerRow, error: logError } = await admin
    .from("ranger_xp_log")
    .insert({
      user_id: user.id,
      source: GUEST_IMPORT_SOURCE,
      xp_amount: xp,
      description: `Guest progress: ${lessons.length} practice ${lessons.length === 1 ? "lesson" : "lessons"}`,
    })
    .select("id")
    .single();
  if (logError || !markerRow) {
    console.error("[guest/import] xp log insert failed:", logError?.message);
    return json({ error: errors.failed }, 500);
  }

  const currentXp = Number(profile.ranger_xp ?? 0) || 0;
  const newTotal = currentXp + xp;
  const { error: xpError } = await admin
    .from("profiles")
    .update({ ranger_xp: newTotal, ranger_rank: getRankFromXp(newTotal).id })
    .eq("id", user.id);
  if (xpError) {
    console.error("[guest/import] ranger_xp update failed:", xpError.message);
    // Undo the marker so a retry can award the XP.
    await admin.from("ranger_xp_log").delete().eq("id", markerRow.id);
    return json({ error: errors.failed }, 500);
  }

  return json({ imported: lessons.length, xpAwarded: xp }, 200);
}
