"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CERTIFICATES, formatDate } from "@/lib/certificates";
import {
  loadReportBranding,
  saveReportBranding,
  type ReportSchoolBranding,
} from "@/lib/report/branding";
import {
  avgAccuracy,
  avgStars,
  completedLessonIds,
  lessonsCompletedInPeriod,
  periodBounds,
  REPORT_TOTAL_LESSONS,
  starRatingOutOf5,
  streakFromProgress,
  sumLessonEcoInPeriod,
  wpmThisWeekVsLast,
  type ProgressRow,
  type ReportPeriod,
} from "@/lib/report/compute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ProfileRow = {
  full_name: string | null;
  age: number | null;
  school_name: string | null;
  eco_points: number | null;
  pet_name: string | null;
  pet_type: string | null;
  email: string | null;
};

type CertRow = {
  certificate_type: string | null;
  lessons_completed: number | null;
  earned_at: string | null;
  eco_points: number | null;
};

type EcoPhotoRow = {
  action_type: string | null;
  status: string | null;
  submitted_at: string | null;
  points_awarded: number | null;
};

type GameRow = {
  game_name: string | null;
  score: number | null;
  eco_points_earned: number | null;
  created_at?: string | null;
};

async function canAccessStudentReport(
  supabase: ReturnType<typeof createClient>,
  viewerId: string,
  studentId: string
): Promise<boolean> {
  if (viewerId === studentId) return true;

  const { data: classes } = await supabase.from("classes").select("id").eq("teacher_id", viewerId);
  const classIds = (classes as { id: string }[] | null)?.map((c) => c.id) ?? [];
  if (classIds.length > 0) {
    const { data: en } = await supabase
      .from("class_enrollments")
      .select("student_id")
      .eq("student_id", studentId)
      .in("class_id", classIds)
      .limit(1)
      .maybeSingle();
    if (en) return true;
  }

  const { data: prof } = await supabase.from("profiles").select("email").eq("id", studentId).maybeSingle();
  const email = ((prof as { email?: string } | null)?.email ?? "").trim().toLowerCase();
  if (email) {
    const { data: child } = await supabase
      .from("children")
      .select("id")
      .eq("parent_id", viewerId)
      .ilike("username", email)
      .maybeSingle();
    if (child) return true;
  }

  return false;
}

function actionLabel(actionType: string): string {
  const map: Record<string, string> = {
    planting_tree: "🌱 Planting a tree",
    watering_plants: "💧 Watering plants",
    water_for_birds: "🐦 Water for birds",
  };
  return map[actionType] || actionType;
}

function encouragementText(params: {
  lessonsDone: number;
  wpmThis: number;
  wpmLast: number;
  streak: number;
  accuracy: number;
}): string {
  const { lessonsDone, wpmThis, wpmLast, streak, accuracy } = params;
  const pct = (lessonsDone / REPORT_TOTAL_LESSONS) * 100;
  if (pct >= 100) {
    return "Champion learner! Completing all 100 lessons shows remarkable dedication. Celebrate this milestone and keep sharing your eco-actions with the world.";
  }
  if (pct >= 75 && streak >= 5) {
    return "Fantastic progress — you're in the home stretch with a strong daily habit. Keep your streak alive and aim for a new personal best in typing speed.";
  }
  if (wpmThis > wpmLast && wpmLast > 0) {
    return "Your typing speed is improving week over week. Consistent practice is paying off — stay curious and keep every lesson green!";
  }
  if (accuracy >= 92) {
    return "Outstanding accuracy! Precision matters as much as speed. You're building habits that will help you in school and beyond.";
  }
  if (streak >= 3) {
    return "Love the consistency — your streak shows you're showing up for yourself and the planet. A few more lessons each week will compound fast.";
  }
  if (pct < 25) {
    return "Every expert was once a beginner. Small sessions add up — try one short lesson daily and watch your confidence grow.";
  }
  return "You're making steady progress on My Green Keys. Keep balancing speed with accuracy, and keep logging those eco-actions — they matter!";
}

function StarsRow({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cn("text-lg", i <= value ? "text-amber-500" : "text-muted/30")}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function StudentReportPage() {
  const params = useParams();
  const studentId = typeof params?.studentId === "string" ? params.studentId : "";

  const [period, setPeriod] = useState<ReportPeriod>("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [ecoPhotos, setEcoPhotos] = useState<EcoPhotoRow[]>([]);
  const [gameRows, setGameRows] = useState<GameRow[]>([]);

  const [branding, setBranding] = useState<ReportSchoolBranding>({ name: "", logoDataUrl: null });
  const [editName, setEditName] = useState("");
  const [logoFileHint, setLogoFileHint] = useState("");

  const now = useMemo(() => new Date(), []);
  const { start, end, label: periodLabel } = useMemo(() => periodBounds(period, now), [period, now]);

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setError("You must be logged in to view this report.");
        return;
      }

      const ok = await canAccessStudentReport(supabase, userData.user.id, studentId);
      if (!ok) {
        setError("You do not have permission to view this student’s report.");
        return;
      }

      const { data: prof, error: pErr } = await supabase
        .from("profiles")
        .select("full_name, age, school_name, eco_points, pet_name, pet_type, email")
        .eq("id", studentId)
        .maybeSingle();
      if (pErr) throw pErr;
      setProfile((prof as ProfileRow) ?? null);

      let rows: ProgressRow[] = [];
      const attempt = await supabase
        .from("student_progress")
        .select("lesson_id, completed, wpm, accuracy, completed_at, stars, eco_points")
        .eq("student_id", studentId);
      if (attempt.error) {
        const fallback = await supabase
          .from("student_progress")
          .select("lesson_id, completed, wpm, accuracy, completed_at")
          .eq("student_id", studentId);
        if (fallback.error) throw fallback.error;
        rows = (fallback.data as ProgressRow[] | null) ?? [];
      } else {
        rows = (attempt.data as ProgressRow[] | null) ?? [];
      }
      setProgressRows(rows);

      const { data: certData, error: cErr } = await supabase
        .from("certificates")
        .select("certificate_type, lessons_completed, earned_at, eco_points")
        .eq("student_id", studentId)
        .order("earned_at", { ascending: false });
      if (cErr) throw cErr;
      setCerts((certData as CertRow[] | null) ?? []);

      const { data: ecoData, error: eErr } = await supabase
        .from("eco_photos")
        .select("action_type, status, submitted_at, points_awarded")
        .eq("student_id", studentId)
        .order("submitted_at", { ascending: false });
      if (eErr) throw eErr;
      setEcoPhotos((ecoData as EcoPhotoRow[] | null) ?? []);

      const { data: gameData, error: gErr } = await supabase.from("game_scores").select("*").eq("student_id", studentId);
      if (gErr) throw gErr;
      setGameRows((gameData as GameRow[] | null) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report.");
      setProfile(null);
      setProgressRows([]);
      setCerts([]);
      setEcoPhotos([]);
      setGameRows([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const b = loadReportBranding();
    setBranding(b);
    setEditName(b.name);
  }, []);

  useEffect(() => {
    document.body.classList.add("mgk-print-report");
    return () => document.body.classList.remove("mgk-print-report");
  }, []);

  const completedSet = useMemo(() => completedLessonIds(progressRows), [progressRows]);
  const lessonsDoneTotal = completedSet.size;
  const lessonPct = Math.min(100, Math.round((lessonsDoneTotal / REPORT_TOTAL_LESSONS) * 100));

  const { thisWeek: wpmThis, lastWeek: wpmLast } = useMemo(() => wpmThisWeekVsLast(progressRows, now), [progressRows, now]);

  const accuracyPeriod = useMemo(() => avgAccuracy(progressRows, start, end), [progressRows, start, end]);
  const lessonsInPeriod = useMemo(
    () => lessonsCompletedInPeriod(progressRows, start, end),
    [progressRows, start, end]
  );
  const streak = useMemo(() => streakFromProgress(progressRows), [progressRows]);
  const lessonEcoPeriod = useMemo(() => sumLessonEcoInPeriod(progressRows, start, end), [progressRows, start, end]);
  const starsAvg = useMemo(() => avgStars(progressRows, start, end), [progressRows, start, end]);
  const starValue = useMemo(
    () => starRatingOutOf5(starsAvg, accuracyPeriod || avgAccuracy(progressRows, null, end)),
    [starsAvg, accuracyPeriod, progressRows, end]
  );

  const certsInPeriod = useMemo(() => {
    return certs.filter((c) => {
      if (!start) return true;
      const t = c.earned_at ? new Date(c.earned_at) : null;
      if (!t || !Number.isFinite(t.getTime())) return false;
      return t >= start && t <= end;
    });
  }, [certs, start, end]);

  const ecoApprovedInPeriod = useMemo(() => {
    return ecoPhotos.filter((p) => {
      if (p.status !== "approved") return false;
      const t = p.submitted_at ? new Date(p.submitted_at) : null;
      if (!t || !Number.isFinite(t.getTime())) return false;
      if (start && t < start) return false;
      if (t > end) return false;
      return true;
    });
  }, [ecoPhotos, start, end]);

  const ecoActionsCountPeriod = useMemo(() => {
    return ecoPhotos.filter((p) => {
      const t = p.submitted_at ? new Date(p.submitted_at) : null;
      if (!t || !Number.isFinite(t.getTime())) return false;
      if (start && t < start) return false;
      if (t > end) return false;
      return p.status === "approved" || p.status === "pending";
    }).length;
  }, [ecoPhotos, start, end]);

  const gameEcoPeriod = useMemo(() => {
    let sum = 0;
    for (const g of gameRows) {
      const t = g.created_at ? new Date(g.created_at) : null;
      if (t && Number.isFinite(t.getTime())) {
        if (start && t < start) continue;
        if (t > end) continue;
      } else if (start !== null) continue;
      sum += Number(g.eco_points_earned) || 0;
    }
    return sum;
  }, [gameRows, start, end]);

  const gamesPlayedPeriod = useMemo(() => {
    return gameRows.filter((g) => {
      const t = g.created_at ? new Date(g.created_at) : null;
      if (t && Number.isFinite(t.getTime())) {
        if (start && t < start) return false;
        if (t > end) return false;
        return true;
      }
      return start === null;
    }).length;
  }, [gameRows, start, end]);

  const photoPointsPeriod = useMemo(() => {
    return ecoApprovedInPeriod.reduce((a, p) => a + (Number(p.points_awarded) || 0), 0);
  }, [ecoApprovedInPeriod]);

  const ecoPointsEarnedPeriod = lessonEcoPeriod + gameEcoPeriod + photoPointsPeriod;

  const badgeLabels = useMemo(() => {
    const labels: string[] = [];
    const inPeriod = start ? certsInPeriod : certs;
    for (const c of inPeriod) {
      const def = CERTIFICATES.find((x) => x.type === c.certificate_type);
      if (def) labels.push(`${def.emoji} ${def.badgeText}`);
      else if (c.certificate_type) labels.push(String(c.certificate_type));
    }
    return labels;
  }, [certs, certsInPeriod, start]);

  const topAchievements = useMemo(() => {
    const items: { score: number; text: string }[] = [];
    for (const c of certsInPeriod) {
      const def = CERTIFICATES.find((x) => x.type === c.certificate_type);
      const milestone = c.lessons_completed ?? def?.milestone ?? 0;
      items.push({
        score: 1000 + milestone,
        text: def
          ? `Earned the ${def.badgeText} certificate (${milestone} lessons)`
          : `Earned a certificate milestone (${milestone} lessons)`,
      });
    }
    if (wpmThis > 0) {
      items.push({ score: 300 + wpmThis, text: `Reached ${wpmThis} WPM average (recent week window)` });
    }
    if (gamesPlayedPeriod > 0) {
      items.push({ score: 200 + gamesPlayedPeriod, text: `Played eco games ${gamesPlayedPeriod} time(s) in this period` });
    }
    if (ecoActionsCountPeriod > 0) {
      items.push({
        score: 150 + ecoActionsCountPeriod,
        text: `Logged ${ecoActionsCountPeriod} eco action(s) in this period`,
      });
    }
    if (lessonsInPeriod > 0) {
      items.push({ score: 250 + lessonsInPeriod, text: `Completed ${lessonsInPeriod} lesson(s) in this period` });
    }
    items.sort((a, b) => b.score - a.score);
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const it of items) {
      if (seen.has(it.text)) continue;
      seen.add(it.text);
      unique.push(it.text);
      if (unique.length >= 3) break;
    }
    const fallbacks = [
      "Keep showing up — small daily lessons create big results.",
      "Try a typing session and an eco-action photo this week.",
      "Your next certificate milestone could be just a few lessons away!",
    ];
    for (const f of fallbacks) {
      if (unique.length >= 3) break;
      if (!seen.has(f)) {
        seen.add(f);
        unique.push(f);
      }
    }
    return unique.slice(0, 3);
  }, [
    certsInPeriod,
    wpmThis,
    gamesPlayedPeriod,
    ecoActionsCountPeriod,
    lessonsInPeriod,
  ]);

  const summary = useMemo(() => {
    const name = profile?.full_name?.trim() || "This student";
    const pet = profile?.pet_name ? ` ${name.split(" ")[0] || name}’s companion ${profile.pet_name} is cheering them on.` : "";
    return `${name} has completed ${lessonsDoneTotal} of ${REPORT_TOTAL_LESSONS} core lessons (${lessonPct}% of the programme). During ${periodLabel.toLowerCase()}, they finished ${lessonsInPeriod} lesson(s) with ${accuracyPeriod}% average accuracy when logging timed results.${pet}`;
  }, [
    profile,
    lessonsDoneTotal,
    lessonPct,
    periodLabel,
    lessonsInPeriod,
    accuracyPeriod,
  ]);

  const encouragement = useMemo(
    () =>
      encouragementText({
        lessonsDone: lessonsDoneTotal,
        wpmThis,
        wpmLast,
        streak,
        accuracy: accuracyPeriod,
      }),
    [lessonsDoneTotal, wpmThis, wpmLast, streak, accuracyPeriod]
  );

  const reportDateStr = formatDate(now);
  const schoolDisplayName = branding.name.trim() || "Your school";
  const classLine = profile?.school_name?.trim() || "—";

  const persistBranding = (next: ReportSchoolBranding) => {
    setBranding(next);
    saveReportBranding(next);
  };

  const onLogoPick = (file: File | null) => {
    if (!file) return;
    setLogoFileHint(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : null;
      persistBranding({
        name: editName.trim() || branding.name || schoolDisplayName,
        logoDataUrl: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="report-print-root min-h-screen bg-[#f4fbf6] text-foreground">
      <div className="report-no-print sticky top-0 z-50 border-b border-primary/20 bg-[#1a2f23] px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-white">Progress report</div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-white/20 bg-white/10 p-0.5">
              {(
                [
                  ["week", "Weekly"],
                  ["month", "Monthly"],
                  ["all", "Full"],
                ] as const
              ).map(([k, lab]) => (
                <button
                  key={k}
                  type="button"
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                    period === k ? "bg-primary text-primary-foreground" : "text-white/80 hover:bg-white/10"
                  )}
                  onClick={() => setPeriod(k)}
                >
                  {lab}
                </button>
              ))}
            </div>
            <Button type="button" size="sm" variant="secondary" onClick={() => window.print()}>
              🖨️ Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="report-no-print mx-auto max-w-3xl px-4 py-4">
        <div className="rounded-xl border border-primary/25 bg-white p-4 shadow-sm">
          <h2 className="font-heading text-sm font-bold text-primary">School branding (saved on this device)</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Appears on printed reports. Stored in localStorage for B2B school use.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rep-school-name">School name</Label>
              <Input
                id="rep-school-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Green Valley Primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rep-school-logo">School logo (optional)</Label>
              <Input
                id="rep-school-logo"
                type="file"
                accept="image/*"
                className="cursor-pointer text-sm"
                onChange={(e) => onLogoPick(e.target.files?.[0] ?? null)}
              />
              {logoFileHint ? <p className="text-xs text-muted-foreground">Selected: {logoFileHint}</p> : null}
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={() => persistBranding({ name: editName.trim() || schoolDisplayName, logoDataUrl: branding.logoDataUrl })}
          >
            Save branding
          </Button>
        </div>
      </div>

      <div className="mx-auto min-h-[calc(100vh-80px)] max-w-[210mm] px-4 py-6 print:max-w-none print:px-0 print:py-0">
        {loading ? (
          <p className="text-center font-medium text-muted-foreground">Loading report…</p>
        ) : error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center font-semibold text-destructive">
            {error}
          </div>
        ) : (
          <article
            className="break-inside-avoid rounded-xl border-2 border-[#2ecc71]/35 bg-white shadow-sm transition-shadow hover:shadow-lg print:border print:shadow-none"
            style={{ minHeight: "297mm" }}
          >
            <div className="border-b border-[#2ecc71]/25 bg-gradient-to-br from-[#ecfdf3] to-white px-8 pb-6 pt-8 print:px-[15mm] print:pt-[12mm]">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-white">
                    {branding.logoDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={branding.logoDataUrl} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">LOGO</span>
                    )}
                  </div>
                  <div>
                    <p className="font-heading text-lg font-extrabold tracking-tight text-[#14532d]">{schoolDisplayName}</p>
                    <p className="text-xs font-medium text-muted-foreground">Student progress report</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2ecc71] text-lg text-white">
                      🌿
                    </div>
                    <div className="text-left">
                      <p className="font-heading text-sm font-extrabold text-[#14532d]">My Green Keys</p>
                      <p className="text-[10px] font-medium text-muted-foreground">Learn to type · Help the planet</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 border-t border-dashed border-primary/25 pt-6 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Student</p>
                  <p className="font-heading text-xl font-bold text-[#1a2f23]">{profile?.full_name?.trim() || "Student"}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Report date &amp; period</p>
                  <p className="text-sm font-semibold text-[#1a2f23]">
                    {reportDateStr}
                    <span className="text-muted-foreground"> · </span>
                    {periodLabel}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Age</p>
                  <p className="text-sm font-semibold">{profile?.age != null ? `${profile.age}` : "—"}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Class / cohort</p>
                  <p className="text-sm font-semibold">{classLine}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 px-8 py-8 print:px-[15mm] print:py-6">
              <section className="break-inside-avoid">
                <h3 className="font-heading border-b border-primary/15 pb-2 text-sm font-bold uppercase tracking-wide text-[#14532d]">
                  Overall summary
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#334155]">{summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold uppercase text-muted-foreground">Lesson quality</span>
                  <StarsRow value={starValue} />
                </div>
              </section>

              <section className="grid gap-4 break-inside-avoid sm:grid-cols-2">
                <div className="rounded-xl border border-primary/20 bg-[#f8fdf9] p-4">
                  <h4 className="text-xs font-bold uppercase text-[#14532d]">WPM (7-day windows)</h4>
                  <p className="mt-2 font-heading text-2xl font-bold text-primary">{wpmThis}</p>
                  <p className="text-xs text-muted-foreground">Last 7 days · avg WPM</p>
                  <p className="mt-2 text-sm font-semibold text-[#1a2f23]">
                    Previous 7 days: <span className="text-primary">{wpmLast}</span> WPM
                    {wpmThis > wpmLast ? " · ▲ improving" : wpmThis < wpmLast ? " · focus on consistency" : ""}
                  </p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-[#f8fdf9] p-4">
                  <h4 className="text-xs font-bold uppercase text-[#14532d]">Accuracy ({periodLabel})</h4>
                  <p className="mt-2 font-heading text-2xl font-bold text-primary">{accuracyPeriod}%</p>
                  <p className="text-xs text-muted-foreground">Average on completed lessons in range</p>
                </div>
              </section>

              <section className="break-inside-avoid">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-[#14532d]">Lessons &amp; streak</h3>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">
                      Completed <span className="text-primary">{lessonsDoneTotal}</span> / {REPORT_TOTAL_LESSONS} lessons
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lessonsInPeriod} lesson(s) completed in {periodLabel.toLowerCase()}
                    </p>
                  </div>
                  <p className="font-heading text-lg font-bold text-amber-600">🔥 {streak} day streak</p>
                </div>
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2ecc71] to-[#52b788] transition-all print:bg-[#2ecc71]"
                    style={{ width: `${lessonPct}%` }}
                  />
                </div>
              </section>

              <section className="grid gap-4 break-inside-avoid sm:grid-cols-2">
                <div className="rounded-xl border border-primary/15 p-4">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">Eco points ({periodLabel})</h4>
                  <p className="mt-1 font-heading text-xl font-bold text-primary">{ecoPointsEarnedPeriod}</p>
                  <p className="text-xs text-muted-foreground">
                    From lessons, games, and approved eco photos · Profile total: {Number(profile?.eco_points) || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-primary/15 p-4">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">Games played ({periodLabel})</h4>
                  <p className="mt-1 font-heading text-xl font-bold text-primary">{gamesPlayedPeriod}</p>
                </div>
              </section>

              <section className="break-inside-avoid">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-[#14532d]">Badges &amp; certificates</h3>
                {badgeLabels.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No certificates in this period — milestones unlock at 10, 25, 50, and 100 lessons.</p>
                ) : (
                  <ul className="mt-2 list-inside list-disc text-sm font-medium text-[#334155]">
                    {badgeLabels.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
                {start === null && certs.length > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    All-time certificates earned: {certs.length}
                  </p>
                ) : null}
              </section>

              <section className="break-inside-avoid">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-[#14532d]">Eco actions</h3>
                <p className="mt-1 text-sm font-semibold">
                  {ecoActionsCountPeriod} action(s) in {periodLabel.toLowerCase()} (submitted)
                </p>
                <p className="text-xs text-muted-foreground">{ecoApprovedInPeriod.length} approved in this period</p>
                {ecoPhotos.length > 0 ? (
                  <ul className="mt-2 max-h-28 overflow-y-auto text-xs text-muted-foreground print:max-h-none">
                    {ecoPhotos.slice(0, 8).map((p, i) => (
                      <li key={i}>
                        {actionLabel(String(p.action_type || ""))} · {p.status} ·{" "}
                        {p.submitted_at ? formatDate(p.submitted_at) : "—"}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>

              <section className="break-inside-avoid">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-[#14532d]">Top achievements</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm font-medium text-[#334155]">
                  {topAchievements.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ol>
              </section>

              <section className="break-inside-avoid rounded-xl border-2 border-dashed border-primary/30 bg-[#fafdfb] p-4">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-[#14532d]">
                  Teacher / parent comments
                </h3>
                <div className="report-comment-lines mt-4 min-h-[100px] space-y-6 border-t border-muted pt-2">
                  <div className="h-px w-full bg-border" />
                  <div className="h-px w-full bg-border" />
                  <div className="h-px w-full bg-border" />
                </div>
              </section>

              <section className="break-inside-avoid rounded-xl bg-gradient-to-r from-[#ecfdf3] to-[#fffef5] p-4 print:border print:border-primary/20">
                <h3 className="font-heading text-sm font-bold text-[#14532d]">Encouragement</h3>
                <p className="mt-2 text-sm italic leading-relaxed text-[#334155]">&ldquo;{encouragement}&rdquo;</p>
              </section>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
