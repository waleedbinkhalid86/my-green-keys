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
  };
  lastSignups: AdminRow[] | null;
  lastLogins: AdminRow[] | null;
  goGreenRedemptions: AdminRow[] | null;
  goGreenRedemptionsEmpty: boolean;
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
    lastSignups,
    lastLogins,
    goGreenRedemptions,
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
    (async (): Promise<AdminRow[] | null> => {
      try {
        const { data, error } = await applyTestFilter(
          admin
            .from("profiles")
            .select("full_name, email, created_at, account_type"),
          includeTest
        )
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) throw error;
        return (data ?? []).map((row) => ({
          name: displayName(row.full_name, undefined, "—"),
          email: row.email?.trim() || "—",
          time: row.created_at,
          type: formatAccountType(row.account_type),
        }));
      } catch {
        return null;
      }
    })(),
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
    },
    lastSignups,
    lastLogins,
    goGreenRedemptions,
    goGreenRedemptionsEmpty: goGreenRedemptions !== null && goGreenRedemptions.length === 0,
  };
}
