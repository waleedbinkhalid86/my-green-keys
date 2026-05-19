import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  fetchAdminDashboardData,
  formatRelativeTime,
  type AdminRow,
} from "./queries";

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
];

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
          <AdminTable
            title="Last 10 signups"
            columns={["Name", "Email", "Type", "Signed up"]}
            rows={data.lastSignups}
            error={data.lastSignups === null}
          />
          <AdminTable
            title="Last 10 logins"
            columns={["Name", "Email", "Type", "Last login"]}
            rows={data.lastLogins}
            error={data.lastLogins === null}
          />
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
