import type { User } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const PAID_PLANS = new Set(["family", "school_starter", "school_growth"]);
const GOGREEN_CODE = "GOGREEN";

export type AdminRow = {
  name: string;
  email: string;
  time: string | null;
};

export type AdminDashboardData = {
  metrics: {
    totalSignups: string;
    signupsLast7Days: string;
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

async function safeCount(
  run: () => Promise<number>
): Promise<string> {
  try {
    const n = await run();
    return String(n);
  } catch {
    return "—";
  }
}

async function safeMetricPair(
  run: () => Promise<string>
): Promise<string> {
  try {
    return await run();
  } catch {
    return "—";
  }
}

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  const admin = createServiceRoleClient();
  const todayStart = startOfTodayUtc().getTime();
  const sevenDaysAgo = sevenDaysAgoIso();

  const [
    totalSignups,
    signupsLast7Days,
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
      const { count, error } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    }),
    safeCount(async () => {
      const { count, error } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
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
      const users = await listAllAuthUsers(admin);
      return users.filter((u) => {
        if (!u.last_sign_in_at) return false;
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
        const { data, error } = await admin
          .from("profiles")
          .select("full_name, email, created_at")
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) throw error;
        return (data ?? []).map((row) => ({
          name: displayName(row.full_name, undefined, "—"),
          email: row.email?.trim() || "—",
          time: row.created_at,
        }));
      } catch {
        return null;
      }
    })(),
    (async (): Promise<AdminRow[] | null> => {
      try {
        const [users, { data: profiles }] = await Promise.all([
          listAllAuthUsers(admin),
          admin.from("profiles").select("id, full_name, email"),
        ]);

        const profileById = new Map(
          (profiles ?? []).map((p) => [p.id, p] as const)
        );

        const sorted = users
          .filter((u) => u.last_sign_in_at)
          .sort(
            (a, b) =>
              new Date(b.last_sign_in_at!).getTime() -
              new Date(a.last_sign_in_at!).getTime()
          )
          .slice(0, 10);

        return sorted.map((u) => {
          const profile = profileById.get(u.id);
          return {
            name: displayName(profile?.full_name, u, "—"),
            email: profile?.email?.trim() || u.email?.trim() || "—",
            time: u.last_sign_in_at ?? null,
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
        const { data: profiles, error: profErr } = await admin
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);
        if (profErr) throw profErr;

        const profileById = new Map(
          (profiles ?? []).map((p) => [p.id, p] as const)
        );

        return rows.map((row) => {
          const profile = profileById.get(row.user_id);
          return {
            name: displayName(profile?.full_name, undefined, "—"),
            email: profile?.email?.trim() || "—",
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
      totalSignups,
      signupsLast7Days,
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
