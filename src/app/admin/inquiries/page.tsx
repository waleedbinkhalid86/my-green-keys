import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { requireFounderPage } from "@/lib/admin/require-founder";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import AdminTabs from "../AdminTabs";
import MarkContactedButton from "./MarkContactedButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "School inquiries",
  robots: { index: false, follow: false },
};

type Inquiry = {
  id: string;
  name: string;
  school_name: string | null;
  phone: string;
  message: string | null;
  created_at: string;
  status: "new" | "contacted";
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
  overflow: "auto",
  boxShadow: "0 8px 32px rgba(27, 67, 50, 0.1)",
};

const cell: CSSProperties = { padding: "12px 16px", verticalAlign: "top" };

function StatusPill({ status }: { status: Inquiry["status"] }) {
  const isNew = status === "new";
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: 999,
        color: "#1B4332",
        background: isNew ? "rgba(242,183,5,0.25)" : "rgba(82,183,136,0.25)",
      }}
    >
      {isNew ? "New" : "Contacted"}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Karachi",
  });
}

async function fetchInquiries(): Promise<Inquiry[] | null> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("school_inquiries")
    .select("id, name, school_name, phone, message, created_at, status")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("[admin/inquiries] fetch failed:", error.message);
    return null;
  }
  return data as Inquiry[];
}

export default async function SchoolInquiriesPage() {
  await requireFounderPage();
  const inquiries = await fetchInquiries();
  const newCount = inquiries?.filter((i) => i.status === "new").length ?? 0;

  return (
    <div style={pageBg}>
      <main style={shell}>
        <AdminTabs active="inquiries" />

        <h1
          style={{
            margin: "8px 0 8px",
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            fontWeight: 800,
            color: "#1B4332",
          }}
        >
          School inquiries
        </h1>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "#2D6A4F", maxWidth: 640 }}>
          Messages from the /schools contact form, newest first (latest 200).
          {inquiries ? ` ${newCount} not yet contacted.` : ""}
        </p>

        {inquiries === null ? (
          <p style={{ fontSize: 14, color: "#92400E" }}>
            Could not load inquiries. Check that the school_inquiries migration has been run.
          </p>
        ) : inquiries.length === 0 ? (
          <p style={{ fontSize: 14, color: "#2D6A4F" }}>No inquiries yet.</p>
        ) : (
          <section style={tableCard}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "rgba(240, 249, 244, 0.65)" }}>
                  {["Received", "Name", "School", "Phone", "Message", "Status"].map((col) => (
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
                {inquiries.map((inq) => (
                  <tr key={inq.id} style={{ borderTop: "1px solid rgba(116, 198, 157, 0.2)" }}>
                    <td style={{ ...cell, color: "#2D6A4F", whiteSpace: "nowrap", fontSize: 12.5 }}>
                      {formatDate(inq.created_at)}
                    </td>
                    <td style={{ ...cell, fontWeight: 700, color: "#1B4332" }}>{inq.name}</td>
                    <td style={{ ...cell, color: "#2D6A4F" }}>{inq.school_name ?? "-"}</td>
                    <td style={{ ...cell, whiteSpace: "nowrap" }}>
                      <a
                        href={`tel:${inq.phone.replace(/[^0-9+]/g, "")}`}
                        style={{ color: "#1B4332", fontWeight: 600 }}
                      >
                        {inq.phone}
                      </a>
                    </td>
                    <td
                      style={{
                        ...cell,
                        color: "#2D6A4F",
                        fontSize: 12.5,
                        maxWidth: 340,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {inq.message ?? "-"}
                    </td>
                    <td style={cell}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <StatusPill status={inq.status} />
                        {inq.status === "new" && <MarkContactedButton id={inq.id} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}
