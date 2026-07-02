import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  fetchAdminDashboardData,
  formatRelativeTime,
  type ActivationFunnel,
  type AdminRow,
  type EngagementData,
  type SignupDetailRow,
  type TeacherClassRow,
} from "./queries";
import AdminTabs from "./AdminTabs";

const ADMIN_EMAIL = "mygreenkeys26@gmail.com";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

const pageBg: CSSProperties = {
  backgroundColor: "#FAFAF7",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  minHeight: "100vh",
};

const shell: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "32px 20px 64px",
  width: "100%",
  boxSizing: "border-box",
};

const glassCard: CSSProperties = {
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(240,249,244,0.82) 55%)",
  border: "1px solid rgba(116, 198, 157, 0.45)",
  borderRadius: "20px",
  padding: "22px 20px",
  boxShadow: "0 8px 32px rgba(27, 67, 50, 0.1)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

const metricCard: CSSProperties = {
  ...glassCard,
  textAlign: "center",
  padding: "28px 18px",
};

const tableCard: CSSProperties = {
  ...glassCard,
  padding: "0",
  overflow: "hidden",
};

const METRIC_LABELS = [
  { key: "parents" as const, label: "Parents" },
  { key: "teachers" as const, label: "Teachers" },
  { key: "parentsLast7Days" as const, label: "Parents (7d)" },
  { key: "teachersLast7Days" as const, label: "Teachers (7d)" },
  { key: "payingCustomers" as const, label: "Paying customers" },
  { key: "loginsToday" as const, label: "Logins today" },
  { key: "totalKids" as const, label: "Total kids" },
  { key: "totalClasses" as const, label: "Total classes" },
  { key: "goGreenRedeemed" as const, label: "GoGreen redeemed" },
  { key: "goGreenToPaid" as const, label: "GoGreen → Paid" },
  { key: "kidCodeLoginsThisWeek" as const, label: "Kid-code logins (7d)" },
];

function FunnelStage({
  label,
  count,
  pct,
  caption,
  dropoffPct,
}: {
  label: string;
  count: number;
  pct: number;
  caption?: string;
  dropoffPct?: number | null;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span style={{ fontWeight: 700, color: "#1B4332", fontSize: 14 }}>
          {label}
        </span>
        <span style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          {dropoffPct != null ? (
            <span style={{ fontSize: 12, fontWeight: 700, color: "#B45309" }}>
              -{dropoffPct.toFixed(0)}%
            </span>
          ) : null}
          <span style={{ fontWeight: 800, color: "#2D6A4F", fontSize: 15 }}>
            {count}
            {caption ? (
              <span style={{ fontWeight: 600, color: "#74C69D", fontSize: 12 }}>
                {" "}
                {caption}
              </span>
            ) : null}
          </span>
        </span>
      </div>
      <div
        style={{
          height: 14,
          borderRadius: 8,
          background: "rgba(116, 198, 157, 0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.max(0, Math.min(100, pct))}%`,
            borderRadius: 8,
            background: "linear-gradient(90deg, #52B788, #2D6A4F)",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function ActivationFunnelSection({ funnel }: { funnel: ActivationFunnel | null }) {
  if (!funnel) {
    return (
      <section style={{ ...tableCard, padding: "20px 20px", marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#1B4332" }}>
          Activation funnel
        </h2>
        <p style={{ margin: "10px 0 0", color: "#2D6A4F", fontWeight: 600 }}>Error loading</p>
      </section>
    );
  }

  const { signups, started, completed, day1, day7 } = funnel;
  const pct = (n: number, of: number) => (of > 0 ? (n / of) * 100 : 0);
  const dropoff = (from: number, to: number) => (from > 0 ? ((from - to) / from) * 100 : null);

  return (
    <section style={{ ...glassCard, marginBottom: 28 }}>
      <h2
        style={{
          margin: 0,
          fontSize: "1.05rem",
          fontWeight: 800,
          color: "#1B4332",
        }}
      >
        Activation funnel — last {funnel.cohortDays} days
      </h2>
      <p style={{ margin: "6px 0 20px", fontSize: 12.5, color: "#2D6A4F", fontWeight: 500 }}>
        Day 1 / day 7 = activity on that exact calendar day after signup, counted only
        for signups old enough to have reached that day yet.
      </p>

      <FunnelStage label="Signups" count={signups} pct={100} />
      <FunnelStage
        label="Started a lesson"
        count={started}
        pct={pct(started, signups)}
        dropoffPct={dropoff(signups, started)}
      />
      <FunnelStage
        label="Completed a lesson"
        count={completed}
        pct={pct(completed, signups)}
        dropoffPct={dropoff(started, completed)}
      />
      <FunnelStage
        label="Returned day 1"
        count={day1.returned}
        pct={pct(day1.returned, day1.eligible)}
        caption={`of ${day1.eligible} eligible`}
      />
      <FunnelStage
        label="Returned day 7"
        count={day7.returned}
        pct={pct(day7.returned, day7.eligible)}
        caption={`of ${day7.eligible} eligible`}
      />
    </section>
  );
}

function LessonsLineChart({ data }: { data: { date: string; count: number }[] }) {
  const w = 600;
  const h = 140;
  const pad = 10;
  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (d.count / max) * (h - pad * 2);
    return { x, y, ...d };
  });
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `M${pad},${h - pad} L${polyline.split(" ").join(" L")} L${points[points.length - 1].x},${h - pad} Z`
      : "";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{ width: "100%", height: 140, display: "block" }}
      preserveAspectRatio="none"
    >
      <path d={areaPath} fill="rgba(82, 183, 136, 0.16)" stroke="none" />
      <polyline points={polyline} fill="none" stroke="#2D6A4F" strokeWidth={2.5} />
      {points.map((p) => (
        <circle key={p.date} cx={p.x} cy={p.y} r={2.5} fill="#52B788" />
      ))}
    </svg>
  );
}

function EngagementSection({ engagement }: { engagement: EngagementData | null }) {
  if (!engagement) {
    return (
      <section style={{ ...tableCard, padding: "20px 20px", marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#1B4332" }}>
          Engagement
        </h2>
        <p style={{ margin: "10px 0 0", color: "#2D6A4F", fontWeight: 600 }}>Error loading</p>
      </section>
    );
  }

  const { lessonsPerDay, brainSprint, habitQuest, games } = engagement;
  const totalLessons30d = lessonsPerDay.reduce((sum, d) => sum + d.count, 0);

  const statCard: CSSProperties = { ...glassCard, padding: "18px 20px" };
  const statLabel: CSSProperties = {
    margin: 0,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#52B788",
  };
  const statValue: CSSProperties = {
    margin: "6px 0 0",
    fontSize: "1.6rem",
    fontWeight: 800,
    color: "#1B4332",
  };
  const statSub: CSSProperties = { margin: "4px 0 0", fontSize: "12.5px", color: "#2D6A4F" };

  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ margin: "0 0 14px", fontSize: "1.05rem", fontWeight: 800, color: "#1B4332" }}>
        Engagement
      </h2>
      <div
        style={{
          display: "grid",
          gap: 20,
          gridTemplateColumns: "1fr",
        }}
        className="admin-engagement-grid"
      >
        <div style={{ ...glassCard, padding: "20px" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#2D6A4F" }}>
            Lessons completed per day — last 30 days
          </p>
          <p style={{ margin: "2px 0 12px", fontSize: 12, color: "#74C69D" }}>
            {totalLessons30d} total
          </p>
          <LessonsLineChart data={lessonsPerDay} />
        </div>

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr", alignContent: "start" }}>
          <div style={statCard}>
            <p style={statLabel}>Brain Sprint completions</p>
            <p style={statValue}>{brainSprint.total}</p>
            <p style={statSub}>{brainSprint.last7Days} in the last 7 days</p>
          </div>
          <div style={statCard}>
            <p style={statLabel}>Habit Quest streaks</p>
            <p style={statValue}>{habitQuest.activeCount}</p>
            <p style={statSub}>active · {habitQuest.completedCount} completed all-time</p>
          </div>
          <div style={statCard}>
            <p style={statLabel}>Games played</p>
            <p style={statValue}>{games.total}</p>
            <p style={statSub}>
              {games.last7Days != null ? `${games.last7Days} in the last 7 days` : "all-time"}
            </p>
            {games.byGame.length > 0 ? (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                {games.byGame.slice(0, 5).map((g) => (
                  <div
                    key={g.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12.5,
                      color: "#2D6A4F",
                    }}
                  >
                    <span>{g.name}</span>
                    <span style={{ fontWeight: 700 }}>{g.count}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function tableHeaderCell(col: string) {
  return (
    <th
      key={col}
      style={{
        textAlign: "left",
        padding: "12px 16px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#2D6A4F",
      }}
    >
      {col}
    </th>
  );
}

const cellStyle: CSSProperties = { padding: "12px 16px", color: "#2D6A4F" };
const cellStrongStyle: CSSProperties = { ...cellStyle, fontWeight: 600, color: "#1B4332" };

function SignupsDetailTable({ rows, error }: { rows: SignupDetailRow[] | null; error: boolean }) {
  const columns = ["Name", "Type", "Signed up", "Last active", "Lessons done"];
  return (
    <section style={tableCard}>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(116, 198, 157, 0.35)" }}>
        <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#1B4332" }}>
          Recent signups
        </h2>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ background: "rgba(240, 249, 244, 0.65)" }}>{columns.map(tableHeaderCell)}</tr>
        </thead>
        <tbody>
          {error ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: "20px 16px", color: "#2D6A4F", fontWeight: 600 }}>
                Error loading
              </td>
            </tr>
          ) : rows && rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.id} style={{ borderTop: "1px solid rgba(116, 198, 157, 0.2)" }}>
                <td style={cellStrongStyle}>{row.name}</td>
                <td style={cellStyle}>{row.type}</td>
                <td style={cellStyle}>{formatRelativeTime(row.signedUpAt)}</td>
                <td style={cellStyle}>{formatRelativeTime(row.lastActiveAt)}</td>
                <td style={cellStyle}>{row.lessonsDone}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ padding: "20px 16px", color: "#2D6A4F" }}>
                No data yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

function TeacherClassesTable({ rows, error }: { rows: TeacherClassRow[] | null; error: boolean }) {
  const columns = ["Class", "Teacher", "Students", "Class code", "Created"];
  return (
    <section style={tableCard}>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(116, 198, 157, 0.35)" }}>
        <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#1B4332" }}>
          Teachers &amp; classes
        </h2>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ background: "rgba(240, 249, 244, 0.65)" }}>{columns.map(tableHeaderCell)}</tr>
        </thead>
        <tbody>
          {error ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: "20px 16px", color: "#2D6A4F", fontWeight: 600 }}>
                Error loading
              </td>
            </tr>
          ) : rows && rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.id} style={{ borderTop: "1px solid rgba(116, 198, 157, 0.2)" }}>
                <td style={cellStrongStyle}>{row.className}</td>
                <td style={cellStyle}>{row.teacherName}</td>
                <td style={cellStyle}>{row.studentCount}</td>
                <td style={cellStyle}>{row.classCode}</td>
                <td style={cellStyle}>{formatRelativeTime(row.createdAt)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ padding: "20px 16px", color: "#2D6A4F" }}>
                No classes yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

function AdminTable({
  title,
  columns,
  rows,
  emptyMessage,
  error,
}: {
  title: string;
  columns: string[];
  rows: AdminRow[] | null;
  emptyMessage?: string;
  error?: boolean;
}) {
  const colCount = columns.length;

  return (
    <section style={tableCard}>
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid rgba(116, 198, 157, 0.35)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1.05rem",
            fontWeight: 800,
            color: "#1B4332",
          }}
        >
          {title}
        </h2>
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "14px",
        }}
      >
        <thead>
          <tr style={{ background: "rgba(240, 249, 244, 0.65)" }}>
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#2D6A4F",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {error ? (
            <tr>
              <td
                colSpan={colCount}
                style={{ padding: "20px 16px", color: "#2D6A4F", fontWeight: 600 }}
              >
                Error loading
              </td>
            </tr>
          ) : rows && rows.length > 0 ? (
            rows.map((row, i) => (
              <tr
                key={`${row.email}-${i}`}
                style={{ borderTop: "1px solid rgba(116, 198, 157, 0.2)" }}
              >
                <td
                  style={{
                    padding: "12px 16px",
                    fontWeight: 600,
                    color: "#1B4332",
                  }}
                >
                  {row.name}
                </td>
                <td style={{ padding: "12px 16px", color: "#2D6A4F" }}>{row.email}</td>
                {columns.includes("Type") ? (
                  <td style={{ padding: "12px 16px", color: "#2D6A4F" }}>
                    {row.type ?? "—"}
                  </td>
                ) : null}
                <td style={{ padding: "12px 16px", color: "#2D6A4F" }}>
                  {formatRelativeTime(row.time)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={colCount}
                style={{ padding: "20px 16px", color: "#2D6A4F" }}
              >
                {emptyMessage ?? "No data yet."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ includeTest?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = (user.email ?? "").trim().toLowerCase();
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    redirect("/");
  }

  const params = await searchParams;
  const includeTest = params.includeTest === "1";
  const refreshedAt = new Date();
  const data = await fetchAdminDashboardData({ includeTest });

  const toggleHref = includeTest ? "/admin" : "/admin?includeTest=1";

  return (
    <div style={pageBg}>
      <style>{`
        .admin-metrics-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .admin-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 768px) {
          .admin-metrics-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .admin-metrics-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }
        .admin-tables-row {
          display: grid;
          gap: 20px;
          grid-template-columns: 1fr;
          margin-top: 28px;
        }
        @media (min-width: 900px) {
          .admin-tables-row {
            grid-template-columns: 1fr 1fr;
          }
        }
        .admin-engagement-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 900px) {
          .admin-engagement-grid {
            grid-template-columns: 1.6fr 1fr;
          }
        }
      `}</style>

      <main style={shell}>
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                fontWeight: 800,
                color: "#1B4332",
              }}
            >
              Admin Dashboard
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                fontWeight: 600,
                color: "#2D6A4F",
              }}
            >
              Internal — Waleed only
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "10px",
            }}
          >
            <Link
              href={toggleHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#2D6A4F",
                textDecoration: "none",
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "inline-flex",
                  width: "16px",
                  height: "16px",
                  border: "2px solid #52B788",
                  borderRadius: "3px",
                  background: includeTest ? "#52B788" : "transparent",
                  boxSizing: "border-box",
                  flexShrink: 0,
                }}
              />
              Include test accounts
            </Link>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: 600,
                color: "#74C69D",
                whiteSpace: "nowrap",
              }}
            >
              Last refreshed:{" "}
              {refreshedAt.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </header>

        <AdminTabs active="dashboard" />

        <ActivationFunnelSection funnel={data.activationFunnel} />

        <EngagementSection engagement={data.engagement} />

        <section className="admin-metrics-grid" aria-label="Key metrics">
          {METRIC_LABELS.map(({ key, label }) => (
            <div key={key} style={metricCard}>
              <p
                style={{
                  margin: 0,
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: "#1B4332",
                }}
              >
                {data.metrics[key]}
              </p>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#52B788",
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </section>

        <div className="admin-tables-row">
          <SignupsDetailTable rows={data.signupsDetailed} error={data.signupsDetailed === null} />
          <AdminTable
            title="Last 10 logins"
            columns={["Name", "Email", "Type", "Last login"]}
            rows={data.lastLogins}
            error={data.lastLogins === null}
          />
        </div>

        <div style={{ marginTop: "28px" }}>
          <TeacherClassesTable rows={data.teacherClasses} error={data.teacherClasses === null} />
        </div>

        <section style={{ ...tableCard, marginTop: "28px" }}>
          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid rgba(116, 198, 157, 0.35)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "#1B4332",
              }}
            >
              Recent GoGreen redemptions
            </h2>
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ background: "rgba(240, 249, 244, 0.65)" }}>
                {["Name", "Email", "Redeemed at"].map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#2D6A4F",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.goGreenRedemptions === null ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      padding: "20px 16px",
                      color: "#2D6A4F",
                      fontWeight: 600,
                    }}
                  >
                    Error loading
                  </td>
                </tr>
              ) : data.goGreenRedemptionsEmpty ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{ padding: "20px 16px", color: "#2D6A4F" }}
                  >
                    No redemptions yet. Share the GoGreen code to start.
                  </td>
                </tr>
              ) : (
                data.goGreenRedemptions.map((row, i) => (
                  <tr
                    key={`${row.email}-${i}`}
                    style={{ borderTop: "1px solid rgba(116, 198, 157, 0.2)" }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 600,
                        color: "#1B4332",
                      }}
                    >
                      {row.name}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#2D6A4F" }}>
                      {row.email}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#2D6A4F" }}>
                      {formatRelativeTime(row.time)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
