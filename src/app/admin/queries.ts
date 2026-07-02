import type { User } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const PAID_PLANS = new Set(["family", "school_starter", "school_growth"]);
const GOGREEN_CODE = "GOGREEN";
const TEST_EXCLUDE_OR = "is_test.eq.false,is_test.is.null";

export type AdminFetchOptions = {
  includeTest?: boolean;
};

export type AdminRow = {
  name: string;
  email: string;
  time: string | null;
  type?: string;
};

export type AdminDashboardData = {
  metrics: {
    parents: string;
    teachers: string;
    parentsLast7Days: string;
    teachersLast7Days: string;
    payingCustomers: string;
    loginsToday: string;
    totalKids: string;
    totalClasses: string;
    goGreenRedeemed: string;
    goGreenToPaid: string;
    kidCodeLoginsThisWeek: string;
  };
  lastLogins: AdminRow[] | null;
  goGreenRedemptions: AdminRow[] | null;
  goGreenRedemptionsEmpty: boolean;
  activationFunnel: ActivationFunnel | null;
  engagement: EngagementData | null;
  signupsDetailed: SignupDetailRow[] | null;
  teacherClasses: TeacherClassRow[] | null;
};

export type SignupDetailRow = {
  id: string;
  name: string;
  type: string;
  signedUpAt: string | null;
  lastActiveAt: string | null;
  lessonsDone: number;
};

export type TeacherClassRow = {
  id: string;
  className: string;
  teacherName: string;
  studentCount: number;
  classCode: string;
  createdAt: string | null;
};

export type ActivationFunnel = {
  cohortDays: number;
  signups: number;
  started: number;
  completed: number;
  day1: { eligible: number; returned: number };
  day7: { eligible: number; returned: number };
};

export type EngagementData = {
  lessonsPerDay: { date: string; count: number }[];
  brainSprint: { total: number; last7Days: number };
  habitQuest: { activeCount: number; completedCount: number };
  games: { total: number; last7Days: number | null; byGame: { name: string; count: number }[] };
};

function isPaidPlan(planType: string | null | undefined): boolean {
  const p = (planType ?? "").toLowerCase().trim();
  return PAID_PLANS.has(p);
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function sevenDaysAgoIso(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString();
}

const ACTIVATION_COHORT_DAYS = 30;

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

/** Midnight UTC (ms since epoch) of the calendar day an ISO timestamp falls on. */
function utcMidnightMs(iso: string): number {
  const d = new Date(iso);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Whole calendar days between two ISO timestamps (UTC), b - a. */
function calendarDayOffset(fromIso: string, toIso: string): number {
  return Math.round((utcMidnightMs(toIso) - utcMidnightMs(fromIso)) / 86_400_000);
}

async function fetchActivationFunnel(
  admin: ReturnType<typeof createServiceRoleClient>,
  includeTest: boolean
): Promise<ActivationFunnel | null> {
  try {
    const cohortStart = daysAgoIso(ACTIVATION_COHORT_DAYS);
    const nowIso = new Date().toISOString();

    const { data: cohort, error: cohortErr } = await applyTestFilter(
      admin.from("profiles").select("id, created_at"),
      includeTest
    )
      .in("account_type", ["parent", "student"])
      .gte("created_at", cohortStart);
    if (cohortErr) throw cohortErr;

    const signupById = new Map(
      (cohort ?? []).map((row) => [row.id as string, row.created_at as string])
    );
    if (signupById.size === 0) {
      return {
        cohortDays: ACTIVATION_COHORT_DAYS,
        signups: 0,
        started: 0,
        completed: 0,
        day1: { eligible: 0, returned: 0 },
        day7: { eligible: 0, returned: 0 },
      };
    }

    const studentIds = Array.from(signupById.keys());
    const { data: progress, error: progressErr } = await admin
      .from("student_progress")
      .select("student_id, completed, completed_at, created_at")
      .in("student_id", studentIds);
    if (progressErr) throw progressErr;

    // Per student: whether they've started/completed a lesson, and the set of
    // calendar-day offsets (from their signup day) on which they had activity.
    const startedIds = new Set<string>();
    const completedIds = new Set<string>();
    const activityDayOffsets = new Map<string, Set<number>>();

    for (const row of progress ?? []) {
      const studentId = row.student_id as string;
      const signupIso = signupById.get(studentId);
      if (!signupIso) continue;

      startedIds.add(studentId);
      if (row.completed) completedIds.add(studentId);

      const activityIso = (row.completed_at as string | null) ?? (row.created_at as string | null);
      if (!activityIso) continue;
      const offset = calendarDayOffset(signupIso, activityIso);
      if (!activityDayOffsets.has(studentId)) activityDayOffsets.set(studentId, new Set());
      activityDayOffsets.get(studentId)!.add(offset);
    }

    let day1Eligible = 0;
    let day1Returned = 0;
    let day7Eligible = 0;
    let day7Returned = 0;

    for (const [studentId, signupIso] of signupById) {
      const daysSinceSignup = calendarDayOffset(signupIso, nowIso);
      const offsets = activityDayOffsets.get(studentId);

      if (daysSinceSignup >= 1) {
        day1Eligible += 1;
        if (offsets?.has(1)) day1Returned += 1;
      }
      if (daysSinceSignup >= 7) {
        day7Eligible += 1;
        if (offsets?.has(7)) day7Returned += 1;
      }
    }

    return {
      cohortDays: ACTIVATION_COHORT_DAYS,
      signups: signupById.size,
      started: startedIds.size,
      completed: completedIds.size,
      day1: { eligible: day1Eligible, returned: day1Returned },
      day7: { eligible: day7Eligible, returned: day7Returned },
    };
  } catch {
    return null;
  }
}

const ENGAGEMENT_WINDOW_DAYS = 30;

function utcDateKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

async function fetchEngagementData(
  admin: ReturnType<typeof createServiceRoleClient>,
  includeTest: boolean
): Promise<EngagementData | null> {
  try {
    const nonTestIds = await fetchNonTestProfileIds(admin, includeTest);
    const passes = (id: string) => userPassesTestFilter(id, nonTestIds);

    const windowStart = daysAgoIso(ENGAGEMENT_WINDOW_DAYS);
    const sevenDaysAgo = sevenDaysAgoIso();

    const [progressRes, brainSprintRes, questRes, gameRes] = await Promise.all([
      admin
        .from("student_progress")
        .select("student_id, completed_at")
        .eq("completed", true)
        .gte("completed_at", windowStart),
      admin.from("brain_sprint_progress").select("user_id, is_completed, first_completed_at"),
      admin.from("quests").select("parent_id, status"),
      admin.from("game_scores").select("student_id, game_name, created_at"),
    ]);

    if (progressRes.error) throw progressRes.error;
    if (brainSprintRes.error) throw brainSprintRes.error;
    if (questRes.error) throw questRes.error;

    // lessons per day, last N days (zero-filled)
    const dayBuckets = new Map<string, number>();
    for (let i = ENGAGEMENT_WINDOW_DAYS - 1; i >= 0; i--) {
      dayBuckets.set(utcDateKey(daysAgoIso(i)), 0);
    }
    for (const row of progressRes.data ?? []) {
      const studentId = row.student_id as string;
      if (!passes(studentId)) continue;
      const completedAt = row.completed_at as string | null;
      if (!completedAt) continue;
      const key = utcDateKey(completedAt);
      if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
    }
    const lessonsPerDay = Array.from(dayBuckets, ([date, count]) => ({ date, count }));

    // brain sprint completions
    let bsTotal = 0;
    let bsLast7 = 0;
    for (const row of brainSprintRes.data ?? []) {
      if (!row.is_completed) continue;
      if (!passes(row.user_id as string)) continue;
      bsTotal += 1;
      const firstCompleted = row.first_completed_at as string | null;
      if (firstCompleted && firstCompleted >= sevenDaysAgo) bsLast7 += 1;
    }

    // habit quest streaks
    let hqActive = 0;
    let hqCompleted = 0;
    for (const row of questRes.data ?? []) {
      if (!passes(row.parent_id as string)) continue;
      if (row.status === "active") hqActive += 1;
      if (row.status === "completed") hqCompleted += 1;
    }

    // games played (created_at may not exist on this table; degrade gracefully)
    let gamesTotal = 0;
    let gamesLast7: number | null = 0;
    const byGameCounts = new Map<string, number>();
    if (gameRes.error) {
      gamesLast7 = null;
      const fallback = await admin.from("game_scores").select("student_id, game_name");
      if (!fallback.error) {
        for (const row of fallback.data ?? []) {
          if (!passes(row.student_id as string)) continue;
          gamesTotal += 1;
          const name = (row.game_name as string) || "Unknown";
          byGameCounts.set(name, (byGameCounts.get(name) ?? 0) + 1);
        }
      }
    } else {
      for (const row of gameRes.data ?? []) {
        if (!passes(row.student_id as string)) continue;
        gamesTotal += 1;
        const name = (row.game_name as string) || "Unknown";
        byGameCounts.set(name, (byGameCounts.get(name) ?? 0) + 1);
        const createdAt = row.created_at as string | null | undefined;
        if (createdAt && createdAt >= sevenDaysAgo) gamesLast7 = (gamesLast7 ?? 0) + 1;
      }
    }

    return {
      lessonsPerDay,
      brainSprint: { total: bsTotal, last7Days: bsLast7 },
      habitQuest: { activeCount: hqActive, completedCount: hqCompleted },
      games: {
        total: gamesTotal,
        last7Days: gamesLast7,
        byGame: Array.from(byGameCounts, ([name, count]) => ({ name, count })).sort(
          (a, b) => b.count - a.count
        ),
      },
    };
  } catch {
    return null;
  }
}

async function fetchSignupsDetailed(
  admin: ReturnType<typeof createServiceRoleClient>,
  includeTest: boolean
): Promise<SignupDetailRow[] | null> {
  try {
    const { data: profiles, error } = await applyTestFilter(
      admin.from("profiles").select("id, full_name, email, created_at, account_type"),
      includeTest
    )
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw error;

    const rows = profiles ?? [];
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id as string);
    const [users, progressRes] = await Promise.all([
      listAllAuthUsers(admin),
      admin.from("student_progress").select("student_id, lesson_id").eq("completed", true).in("student_id", ids),
    ]);
    if (progressRes.error) throw progressRes.error;

    const lastActiveById = new Map(users.map((u) => [u.id, u.last_sign_in_at ?? null] as const));

    const lessonsById = new Map<string, Set<number | string>>();
    for (const row of progressRes.data ?? []) {
      const id = row.student_id as string;
      if (!lessonsById.has(id)) lessonsById.set(id, new Set());
      lessonsById.get(id)!.add(row.lesson_id as number | string);
    }

    return rows.map((row) => ({
      id: row.id as string,
      name: displayName(row.full_name, undefined, "—"),
      type: formatAccountType(row.account_type),
      signedUpAt: row.created_at as string | null,
      lastActiveAt: lastActiveById.get(row.id as string) ?? null,
      lessonsDone: lessonsById.get(row.id as string)?.size ?? 0,
    }));
  } catch {
    return null;
  }
}

async function fetchTeacherClasses(
  admin: ReturnType<typeof createServiceRoleClient>,
  includeTest: boolean
): Promise<TeacherClassRow[] | null> {
  try {
    const { data: classes, error } = await admin
      .from("classes")
      .select("id, name, class_code, teacher_id, created_at")
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;

    const rows = classes ?? [];
    if (rows.length === 0) return [];

    const teacherIds = Array.from(new Set(rows.map((r) => r.teacher_id as string)));
    const classIds = rows.map((r) => r.id as string);

    const [teachersRes, enrollmentsRes] = await Promise.all([
      applyTestFilter(
        admin.from("profiles").select("id, full_name, email").in("id", teacherIds),
        includeTest
      ),
      admin.from("class_enrollments").select("class_id").in("class_id", classIds),
    ]);
    if (teachersRes.error) throw teachersRes.error;
    if (enrollmentsRes.error) throw enrollmentsRes.error;

    const teacherById = new Map(
      (teachersRes.data ?? []).map((t) => [t.id as string, t] as const)
    );

    const countByClass = new Map<string, number>();
    for (const row of enrollmentsRes.data ?? []) {
      const id = row.class_id as string;
      countByClass.set(id, (countByClass.get(id) ?? 0) + 1);
    }

    return rows
      .filter((row) => teacherById.has(row.teacher_id as string))
      .map((row) => {
        const teacher = teacherById.get(row.teacher_id as string);
        return {
          id: row.id as string,
          className: (row.name as string) || "—",
          teacherName: displayName(teacher?.full_name as string | null, undefined, "—"),
          studentCount: countByClass.get(row.id as string) ?? 0,
          classCode: (row.class_code as string) || "—",
          createdAt: row.created_at as string | null,
        };
      });
  } catch {
    return null;
  }
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffMs = Date.now() - then;
  if (diffMs < 0) return "just now";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatAccountType(accountType: string | null | undefined): string {
  const t = (accountType ?? "").toLowerCase().trim();
  if (t === "parent") return "Parent";
  if (t === "teacher") return "Teacher";
  if (t === "student") return "Student";
  if (!t) return "—";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function displayName(
  profileName: string | null | undefined,
  authUser: User | undefined,
  fallback = "—"
): string {
  const fromProfile = profileName?.trim();
  if (fromProfile) return fromProfile;
  const meta = authUser?.user_metadata as Record<string, unknown> | undefined;
  const fromMeta =
    (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta?.name === "string" && meta.name.trim()) ||
    "";
  if (fromMeta) return fromMeta;
  return fallback;
}

type OrCapableQuery = { or: (filters: string) => OrCapableQuery };

function applyTestFilter<T extends OrCapableQuery>(query: T, includeTest: boolean): T {
  if (includeTest) return query;
  return query.or(TEST_EXCLUDE_OR) as T;
}

async function listAllAuthUsers(admin: ReturnType<typeof createServiceRoleClient>): Promise<User[]> {
  const users: User[] = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    users.push(...(data.users ?? []));
    if ((data.users ?? []).length < perPage) break;
    page += 1;
  }
  return users;
}

async function fetchNonTestProfileIds(
  admin: ReturnType<typeof createServiceRoleClient>,
  includeTest: boolean
): Promise<Set<string> | null> {
  if (includeTest) return null;

  const ids = new Set<string>();
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await applyTestFilter(
      admin.from("profiles").select("id"),
      false
    ).range(from, from + pageSize - 1);
    if (error) throw error;
    const rows = data ?? [];
    for (const row of rows) ids.add(row.id);
    if (rows.length < pageSize) break;
    from += pageSize;
  }
  return ids;
}

function userPassesTestFilter(
  userId: string,
  nonTestIds: Set<string> | null
): boolean {
  if (nonTestIds === null) return true;
  return nonTestIds.has(userId);
}

async function safeCount(run: () => Promise<number>): Promise<string> {
  try {
    const n = await run();
    return String(n);
  } catch {
    return "—";
  }
}

async function safeMetricPair(run: () => Promise<string>): Promise<string> {
  try {
    return await run();
  } catch {
    return "—";
  }
}

export async function fetchAdminDashboardData(
  options: AdminFetchOptions = {}
): Promise<AdminDashboardData> {
  const includeTest = options.includeTest === true;
  const admin = createServiceRoleClient();
  const todayStart = startOfTodayUtc().getTime();
  const sevenDaysAgo = sevenDaysAgoIso();

  const [
    parents,
    teachers,
    parentsLast7Days,
    teachersLast7Days,
    payingCustomers,
    loginsToday,
    totalKids,
    totalClasses,
    goGreenRedeemed,
    goGreenToPaid,
    kidCodeLoginsThisWeek,
    lastLogins,
    goGreenRedemptions,
    activationFunnel,
    engagement,
    signupsDetailed,
    teacherClasses,
  ] = await Promise.all([
    safeCount(async () => {
      const { count, error } = await applyTestFilter(
        admin.from("profiles").select("id", { count: "exact", head: true }),
        includeTest
      ).eq("account_type", "parent");
      if (error) throw error;
      return count ?? 0;
    }),
    safeCount(async () => {
      const { count, error } = await applyTestFilter(
        admin.from("profiles").select("id", { count: "exact", head: true }),
        includeTest
      ).eq("account_type", "teacher");
      if (error) throw error;
      return count ?? 0;
    }),
    safeCount(async () => {
      const { count, error } = await applyTestFilter(
        admin.from("profiles").select("id", { count: "exact", head: true }),
        includeTest
      )
        .eq("account_type", "parent")
        .gte("created_at", sevenDaysAgo);
      if (error) throw error;
      return count ?? 0;
    }),
    safeCount(async () => {
      const { count, error } = await applyTestFilter(
        admin.from("profiles").select("id", { count: "exact", head: true }),
        includeTest
      )
        .eq("account_type", "teacher")
        .gte("created_at", sevenDaysAgo);
      if (error) throw error;
      return count ?? 0;
    }),
    safeCount(async () => {
      const { data, error } = await admin
        .from("subscriptions")
        .select("user_id, plan_type, status")
        .eq("status", "active");
      if (error) throw error;
      const ids = new Set<string>();
      for (const row of data ?? []) {
        if (isPaidPlan(row.plan_type)) ids.add(row.user_id);
      }
      return ids.size;
    }),
    safeCount(async () => {
      const [users, nonTestIds] = await Promise.all([
        listAllAuthUsers(admin),
        fetchNonTestProfileIds(admin, includeTest),
      ]);
      return users.filter((u) => {
        if (!u.last_sign_in_at) return false;
        if (!userPassesTestFilter(u.id, nonTestIds)) return false;
        return new Date(u.last_sign_in_at).getTime() >= todayStart;
      }).length;
    }),
    safeCount(async () => {
      const { count, error } = await admin
        .from("children")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    }),
    safeCount(async () => {
      const { count, error } = await admin
        .from("classes")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    }),
    safeMetricPair(async () => {
      const { data, error } = await admin
        .from("promo_codes")
        .select("uses_count, max_uses")
        .eq("code", GOGREEN_CODE)
        .maybeSingle();
      if (error) throw error;
      if (!data) return "—";
      return `${data.uses_count ?? 0} / ${data.max_uses ?? 0}`;
    }),
    safeMetricPair(async () => {
      const { data: promo, error: promoErr } = await admin
        .from("promo_codes")
        .select("id")
        .eq("code", GOGREEN_CODE)
        .maybeSingle();
      if (promoErr) throw promoErr;
      if (!promo?.id) return "0 of 0";

      const { data: redemptions, error: redErr } = await admin
        .from("promo_code_redemptions")
        .select("user_id")
        .eq("promo_code_id", promo.id);
      if (redErr) throw redErr;

      const redeemerIds = (redemptions ?? []).map((r) => r.user_id).filter(Boolean);
      const totalRedemptions = redeemerIds.length;
      if (totalRedemptions === 0) return "0 of 0";

      const { data: subs, error: subErr } = await admin
        .from("subscriptions")
        .select("user_id, plan_type, status")
        .eq("status", "active")
        .in("user_id", redeemerIds);
      if (subErr) throw subErr;

      const paidRedeemers = new Set<string>();
      for (const row of subs ?? []) {
        if (isPaidPlan(row.plan_type)) paidRedeemers.add(row.user_id);
      }
      return `${paidRedeemers.size} of ${totalRedemptions}`;
    }),
    safeCount(async () => {
      const { data: childRows, error: childErr } = await admin
        .from("children")
        .select("auth_user_id")
        .not("auth_user_id", "is", null);
      if (childErr) throw childErr;
      const kidAuthIds = new Set((childRows ?? []).map((r) => r.auth_user_id as string));
      if (kidAuthIds.size === 0) return 0;

      const users = await listAllAuthUsers(admin);
      const sevenDaysAgoMs = new Date(sevenDaysAgo).getTime();
      return users.filter(
        (u) =>
          kidAuthIds.has(u.id) &&
          u.last_sign_in_at &&
          new Date(u.last_sign_in_at).getTime() >= sevenDaysAgoMs
      ).length;
    }),
    (async (): Promise<AdminRow[] | null> => {
      try {
        const [users, profilesResult] = await Promise.all([
          listAllAuthUsers(admin),
          applyTestFilter(
            admin.from("profiles").select("id, full_name, email, account_type"),
            includeTest
          ),
        ]);

        const { data: profiles, error: profErr } = profilesResult;
        if (profErr) throw profErr;

        const profileById = new Map((profiles ?? []).map((p) => [p.id, p] as const));

        const sorted = users
          .filter((u) => u.last_sign_in_at && profileById.has(u.id))
          .sort(
            (a, b) =>
              new Date(b.last_sign_in_at!).getTime() -
              new Date(a.last_sign_in_at!).getTime()
          )
          .slice(0, 10);

        return sorted.map((u) => {
          const profile = profileById.get(u.id)!;
          return {
            name: displayName(profile.full_name, u, "—"),
            email: profile.email?.trim() || u.email?.trim() || "—",
            time: u.last_sign_in_at ?? null,
            type: formatAccountType(profile.account_type),
          };
        });
      } catch {
        return null;
      }
    })(),
    (async (): Promise<AdminRow[] | null> => {
      try {
        const { data: promo, error: promoErr } = await admin
          .from("promo_codes")
          .select("id")
          .eq("code", GOGREEN_CODE)
          .maybeSingle();
        if (promoErr) throw promoErr;
        if (!promo?.id) return [];

        const { data: rows, error } = await admin
          .from("promo_code_redemptions")
          .select("redeemed_at, user_id")
          .eq("promo_code_id", promo.id)
          .order("redeemed_at", { ascending: false })
          .limit(5);
        if (error) throw error;
        if (!rows?.length) return [];

        const userIds = rows.map((r) => r.user_id);
        const { data: profiles, error: profErr } = await applyTestFilter(
          admin.from("profiles").select("id, full_name, email").in("id", userIds),
          includeTest
        );
        if (profErr) throw profErr;

        const profileById = new Map(
          (profiles ?? []).map((p) => [p.id, p] as const)
        );

        return rows
          .filter((row) => profileById.has(row.user_id))
          .map((row) => {
            const profile = profileById.get(row.user_id)!;
            return {
              name: displayName(profile.full_name, undefined, "—"),
              email: profile.email?.trim() || "—",
              time: row.redeemed_at,
            };
          });
      } catch {
        return null;
      }
    })(),
    fetchActivationFunnel(admin, includeTest),
    fetchEngagementData(admin, includeTest),
    fetchSignupsDetailed(admin, includeTest),
    fetchTeacherClasses(admin, includeTest),
  ]);

  return {
    metrics: {
      parents,
      teachers,
      parentsLast7Days,
      teachersLast7Days,
      payingCustomers,
      loginsToday,
      totalKids,
      totalClasses,
      goGreenRedeemed,
      goGreenToPaid,
      kidCodeLoginsThisWeek,
    },
    lastLogins,
    goGreenRedemptions,
    goGreenRedemptionsEmpty: goGreenRedemptions !== null && goGreenRedemptions.length === 0,
    activationFunnel,
    engagement,
    signupsDetailed,
    teacherClasses,
  };
}
