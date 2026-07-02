import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { requireFounderPage } from "@/lib/admin/require-founder";
import { runSeoAudit } from "@/lib/seo/audit";
import AdminTabs from "../AdminTabs";

export const metadata: Metadata = {
  title: "SEO health",
  robots: { index: false, follow: false },
};

const pageBg: CSSProperties = {
  backgroundColor: "#FAFAF7",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  minHeight: "100vh",
};

const shell: CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "32px 20px 64px",
};

const tableCard: CSSProperties = {
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(240,249,244,0.82) 55%)",
  border: "1px solid rgba(116, 198, 157, 0.45)",
  borderRadius: "20px",
  padding: 0,
  overflow: "hidden",
  boxShadow: "0 8px 32px rgba(27, 67, 50, 0.1)",
};

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: 999,
        color: ok ? "#1B4332" : "#92400E",
        background: ok ? "rgba(82,183,136,0.25)" : "rgba(245,158,11,0.18)",
      }}
    >
      {label}
    </span>
  );
}

export default async function SeoHealthPage() {
  await requireFounderPage();
  const rows = await runSeoAudit();

  return (
    <div style={pageBg}>
      <main style={shell}>
        <AdminTabs active="seo" />

        <h1
          style={{
            margin: "8px 0 8px",
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            fontWeight: 800,
            color: "#1B4332",
          }}
        >
          SEO health
        </h1>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "#2D6A4F", maxWidth: 640 }}>
          Static audit of public marketing pages, run at request time. Title/description are read
          from each page&apos;s metadata export (template-resolved); h1 count is a regex scan of
          the page&apos;s source file, so it can miss headings rendered via a shared component.
        </p>

        <section style={tableCard}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: "rgba(240, 249, 244, 0.65)" }}>
                {["Route", "Title", "Description", "H1", "Notes"].map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontSize: 11,
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
              {rows.map((row) => (
                <tr key={row.route} style={{ borderTop: "1px solid rgba(116, 198, 157, 0.2)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#1B4332" }}>
                    {row.route}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#2D6A4F", maxWidth: 260 }}>
                    <StatusPill ok={row.titleOk} label={`${row.titleLength} chars`} />
                    <div style={{ marginTop: 4, fontSize: 12.5 }}>{row.title}</div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#2D6A4F", maxWidth: 320 }}>
                    <StatusPill ok={row.descriptionOk} label={`${row.descriptionLength} chars`} />
                    <div style={{ marginTop: 4, fontSize: 12.5 }}>{row.description}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusPill ok={row.h1Ok} label={row.h1Count < 0 ? "n/a" : String(row.h1Count)} />
                  </td>
                  <td style={{ padding: "12px 16px", color: "#92400E", fontSize: 12.5, maxWidth: 200 }}>
                    {row.usesDefaultMetadata ? "Using site default metadata, not page-specific" : ""}
                    {row.h1Count < 0 ? " Couldn't read source file." : ""}
                    {row.h1Count === 0 ? " No h1 found." : ""}
                    {row.h1Count > 1 ? " Multiple h1s found." : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
