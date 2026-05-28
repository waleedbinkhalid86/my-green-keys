"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { StudentCodesResponse } from "@/app/api/teacher/classes/[classId]/student-codes/route";

const FOREST = {
  deep: "#1B4332",
  main: "#2D6A4F",
  mid: "#52B788",
  pale: "#F0F9F4",
};

export default function PrintClassCodesPage() {
  const params = useParams();
  const classId = typeof params?.classId === "string" ? params.classId : "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<StudentCodesResponse | null>(null);

  const load = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/student-codes`, {
        credentials: "include",
      });
      const json = (await res.json()) as StudentCodesResponse & { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Could not load student codes.");
      }
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load codes.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!data || loading || error) return;
    const t = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(t);
  }, [data, loading, error]);

  const schoolTitle = data?.schoolName?.trim() || "My Green Keys";
  const classTitle = data?.className?.trim() || "Class";

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print {
            .print-codes-toolbar { display: none !important; }
            body { background: #fff !important; }
          }`,
        }}
      />

      <div
        className="print-codes-toolbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: FOREST.deep,
          color: "#fff",
          padding: "12px 20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: 700 }}>Student login codes</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              background: FOREST.mid,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Print
          </button>
          <button
            type="button"
            onClick={() => window.close()}
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "8px",
              padding: "8px 16px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>

      <main
        style={{
          maxWidth: "210mm",
          margin: "0 auto",
          padding: "24px 20px 40px",
          background: FOREST.pale,
          minHeight: "100vh",
        }}
      >
        {loading ? (
          <p style={{ textAlign: "center", color: FOREST.main, fontWeight: 600 }}>Loading codes…</p>
        ) : error ? (
          <p
            style={{
              textAlign: "center",
              color: "#B91C1C",
              fontWeight: 600,
              padding: "24px",
              background: "#FEE2E2",
              borderRadius: "12px",
            }}
          >
            {error}
          </p>
        ) : !data?.students.length ? (
          <p style={{ textAlign: "center", color: FOREST.main }}>No students in this class.</p>
        ) : (
          <article
            style={{
              background: "#fff",
              borderRadius: "16px",
              border: `2px solid ${FOREST.mid}`,
              padding: "28px 24px",
              boxShadow: "0 2px 12px rgba(27, 67, 50, 0.08)",
            }}
          >
            <header style={{ borderBottom: `2px dashed ${FOREST.mid}`, paddingBottom: "20px", marginBottom: "24px" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: FOREST.main,
                }}
              >
                My Green Keys · student login codes
              </p>
              <h1
                style={{
                  margin: "8px 0 4px",
                  fontSize: "22px",
                  fontWeight: 800,
                  color: FOREST.deep,
                }}
              >
                {schoolTitle}
              </h1>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: FOREST.main }}>
                Class: {classTitle}
              </p>
              <p style={{ margin: "12px 0 0", fontSize: "12px", color: "#6B7280" }}>
                Each student signs in at mygreenkeys.com/kid-login with their 6-character code. Keep codes private.
              </p>
            </header>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "14px",
              }}
            >
              {data.students.map((s) => (
                <div
                  key={s.student_auth_user_id}
                  style={{
                    border: `1.5px solid ${FOREST.main}`,
                    borderRadius: "12px",
                    padding: "14px 16px",
                    background: "#FAFAF5",
                    breakInside: "avoid",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#6B7280",
                    }}
                  >
                    Student
                  </p>
                  <p
                    style={{
                      margin: "4px 0 10px",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: FOREST.deep,
                    }}
                  >
                    {s.full_name}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#6B7280",
                    }}
                  >
                    Login code
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "20px",
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      fontFamily: "ui-monospace, monospace",
                      color: "#111827",
                    }}
                  >
                    {s.login_code ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          </article>
        )}
      </main>
    </>
  );
}
