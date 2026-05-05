"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CERTIFICATES, formatDate, type CertificateType } from "@/lib/certificates";

type CertificateRow = {
  id: string;
  student_id: string;
  certificate_type: CertificateType | string | null;
  lessons_completed: number | null;
  wpm: number | null;
  accuracy: number | null;
  eco_points: number | null;
  earned_at: string | null;
  shared_with_parent?: boolean | null;
};

function useQueryParam(name: string) {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setValue(p.get(name));
  }, [name]);
  return value;
}

export default function CertificatePage() {
  const certId = useQueryParam("id");
  const printMode = useQueryParam("print");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("");
  const [row, setRow] = useState<CertificateRow | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const supabase = createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) {
          setError("You must be logged in to view your certificate.");
          setRow(null);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userData.user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        setStudentName(((profile as any)?.full_name as string | null)?.trim() || "Student");

        let q = supabase.from("certificates").select("*").eq("student_id", userData.user.id);
        if (certId) q = q.eq("id", certId);
        const { data, error: certError } = certId ? await q.single() : await q.order("earned_at", { ascending: false }).limit(1).maybeSingle();
        if (certError) throw certError;
        setRow((data as any) ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load certificate.");
        setRow(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [certId]);

  const def = useMemo(() => {
    if (!row?.certificate_type) return null;
    return CERTIFICATES.find((c) => c.type === row.certificate_type) || null;
  }, [row?.certificate_type]);

  useEffect(() => {
    if (!row) return;
    if (printMode === "1") {
      // Wait a tick for layout/paint
      const t = setTimeout(() => window.print(), 350);
      return () => clearTimeout(t);
    }
    return;
  }, [row, printMode]);

  const earnedAt = row?.earned_at ? formatDate(row.earned_at) : formatDate(new Date());

  const shareWithParent = async () => {
    if (!row) return;
    setShareError("");
    setShareSuccess("");
    setShareBusy(true);
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error("Not logged in.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      const email = ((profile as any)?.email as string | null) ?? userData.user.email ?? null;
      const childName = (((profile as any)?.full_name as string | null) ?? studentName ?? "Your child").trim();
      if (!email) throw new Error("Missing email on profile; cannot find linked parent.");

      const { data: childLink, error: childLinkError } = await supabase
        .from("children")
        .select("parent_id")
        .eq("username", email)
        .maybeSingle();
      if (childLinkError) throw childLinkError;
      const parentId = (childLink as any)?.parent_id as string | undefined;
      if (!parentId) throw new Error("No linked parent found for this account.");

      const message = `🏆 ${childName} earned a certificate!`;
      const { error: notifErr } = await supabase.from("parent_notifications").insert([
        { parent_id: parentId, child_id: userData.user.id, kind: "certificate", message },
      ]);
      if (notifErr) throw notifErr;

      const now = new Date().toISOString();
      const { error: certUpdErr } = await supabase
        .from("certificates")
        .update({ shared_with_parent: true, shared_with_parent_at: now })
        .eq("id", row.id);
      if (certUpdErr) throw certUpdErr;

      setRow((prev) => (prev ? { ...prev, shared_with_parent: true } : prev));
      setShareSuccess("Shared with your parent/guardian!");
    } catch (e) {
      setShareError(e instanceof Error ? e.message : "Failed to share.");
    } finally {
      setShareBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg,#162d1e 0%, #2d6a4f 55%, #81c99e 100%)" }}
    >
      <div className="mgk-container mgk-section-tight">
        <div className="no-print" style={{ maxWidth: 980, margin: "0 auto 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ color: "rgba(255,255,255,0.92)", fontWeight: 900, letterSpacing: "0.12em" }}>
            MY GREEN KEYS • CERTIFICATE
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(0,0,0,0.15)", color: "white", fontWeight: 900, cursor: "pointer" }}
            >
              Download / Print PDF
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/lesson-map")}
              style={{ padding: "10px 12px", borderRadius: 12, border: "none", background: "#4CAF50", color: "white", fontWeight: 950, cursor: "pointer" }}
            >
              Back to Lesson Map
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mgk-container max-w-[980px]" style={{ color: "rgba(255,255,255,0.92)", fontWeight: 900 }}>
            Loading certificate...
          </div>
        ) : error ? (
          <div
            className="mgk-container max-w-[980px]"
            style={{
              background: "rgba(255,255,255,0.95)",
              borderRadius: 16,
              padding: 16,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontWeight: 950, color: "#c62828" }}>{error}</div>
          </div>
        ) : !row ? (
          <div
            className="mgk-container max-w-[980px]"
            style={{
              background: "rgba(255,255,255,0.95)",
              borderRadius: 16,
              padding: 16,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontWeight: 950, color: "#2c3e50" }}>No certificate found yet.</div>
            <div style={{ marginTop: 8, color: "#6b7280", fontWeight: 700 }}>
              Complete lessons to earn certificates at 10, 25, 50, and 100.
            </div>
          </div>
        ) : (
          <div
            id="certificate"
            className="mgk-container max-w-[980px]"
            style={{
              background: "white",
              borderRadius: 24,
              padding: 26,
              border: "10px solid rgba(76,175,80,0.22)",
              boxShadow: "0 24px 90px rgba(0,0,0,0.25)",
              position: "relative",
              overflow: "hidden",
            }}
          >
          {/* Decorative background image */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.12,
              pointerEvents: "none",
              backgroundImage: "url(/images/ui/ui-certificate-bg.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "saturate(1.05) contrast(1.05)",
            }}
          />

          {/* Decorative leaves */}
          <div aria-hidden style={{ position: "absolute", inset: -40, opacity: 0.18, pointerEvents: "none", backgroundImage: "radial-gradient(circle at 20% 20%, #4CAF50 0, transparent 45%), radial-gradient(circle at 85% 30%, #2d6a4f 0, transparent 48%), radial-gradient(circle at 70% 85%, #FFEB3B 0, transparent 52%)" }} />

          {/* Seal */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 22,
              right: 22,
              width: 120,
              height: 120,
              borderRadius: 999,
              background: "linear-gradient(135deg,#FFFDE7 0%, #E8F5E9 60%, #C8E6C9 100%)",
              border: "2px solid rgba(76,175,80,0.55)",
              boxShadow: "0 10px 26px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 10,
              fontWeight: 950,
              color: "#1b4d30",
              lineHeight: 1.05,
              letterSpacing: "0.06em",
            }}
          >
            <div>
              <div style={{ fontSize: 28 }}>{def?.emoji ?? "🏆"}</div>
              <div style={{ fontSize: 11, marginTop: 6 }}>{def?.badgeText ?? "ACHIEVER"}</div>
            </div>
          </div>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: "linear-gradient(135deg,#4CAF50 0%, #2d6a4f 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 950 }}>
                MGK
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 950, color: "#2e7d32", letterSpacing: "0.16em" }}>MY GREEN KEYS</div>
                <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 800 }}>Learn to type while helping the planet</div>
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#6b7280" }}>
              Date earned: <span style={{ color: "#2c3e50" }}>{earnedAt}</span>
            </div>
          </div>

          <div style={{ marginTop: 26, textAlign: "center" }}>
            <div style={{ fontSize: 34, fontWeight: 1000, color: "#1b4d30", letterSpacing: "0.04em" }}>
              Certificate of Achievement
            </div>
            <div style={{ marginTop: 8, fontSize: 14, color: "#6b7280", fontWeight: 800 }}>
              This certificate proudly recognizes outstanding typing progress and eco-friendly learning.
            </div>
          </div>

          {/* Name */}
          <div style={{ marginTop: 26, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 950, color: "#6b7280", letterSpacing: "0.18em" }}>PRESENTED TO</div>
            <div style={{ marginTop: 10, fontSize: 40, fontWeight: 1000, color: "#2c3e50" }}>
              {studentName}
            </div>
            <div style={{ marginTop: 10, fontSize: 16, color: "#2c3e50", fontWeight: 800 }}>
              has successfully completed <span style={{ color: "#2e7d32", fontWeight: 1000 }}>{row.lessons_completed ?? 0}</span> typing lessons
            </div>
          </div>

          {/* Stats */}
          <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <div style={{ background: "#E8F5E9", border: "1px solid rgba(76,175,80,0.28)", borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 950, color: "#2e7d32" }}>Speed (WPM)</div>
              <div style={{ fontSize: 30, fontWeight: 1000, color: "#1b4d30", marginTop: 6 }}>{row.wpm ?? 0}</div>
            </div>
            <div style={{ background: "#F1F8E9", border: "1px solid rgba(76,175,80,0.22)", borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 950, color: "#2e7d32" }}>Accuracy</div>
              <div style={{ fontSize: 30, fontWeight: 1000, color: "#1b4d30", marginTop: 6 }}>{row.accuracy ?? 0}%</div>
            </div>
            <div style={{ background: "#FFFDE7", border: "1px solid rgba(255,235,59,0.35)", borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 950, color: "#8a6d1b" }}>Eco points total</div>
              <div style={{ fontSize: 30, fontWeight: 1000, color: "#2c3e50", marginTop: 6 }}>{row.eco_points ?? 0}</div>
            </div>
          </div>

          {/* Signature */}
          <div style={{ marginTop: 34, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 18, flexWrap: "wrap" }}>
            <div style={{ minWidth: 260 }}>
              <div style={{ height: 1, background: "rgba(0,0,0,0.25)" }} />
              <div style={{ marginTop: 8, fontWeight: 900, color: "#2c3e50" }}>My Green Keys Team 🌿</div>
              <div style={{ marginTop: 2, fontWeight: 800, fontSize: 12, color: "#6b7280" }}>Signature</div>
            </div>
            <div style={{ fontWeight: 950, color: "#2e7d32", letterSpacing: "0.12em" }}>
              {def?.title ?? "Certificate"}
            </div>
          </div>

          {/* Share */}
          <div className="no-print" style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
            <div style={{ width: "min(720px, 100%)" }}>
              {(shareError || shareSuccess) && (
                <div
                  style={{
                    borderRadius: 14,
                    padding: "10px 12px",
                    fontWeight: 900,
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: shareError ? "#ffebee" : "#E8F5E9",
                    color: shareError ? "#c62828" : "#1b4d30",
                    marginBottom: 10,
                  }}
                >
                  {shareError || shareSuccess}
                </div>
              )}
              <button
                type="button"
                onClick={shareWithParent}
                disabled={shareBusy || Boolean((row as any)?.shared_with_parent)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(76,175,80,0.45)",
                  background: (row as any)?.shared_with_parent ? "rgba(0,0,0,0.06)" : "white",
                  color: "#2e7d32",
                  fontWeight: 950,
                  cursor: shareBusy || (row as any)?.shared_with_parent ? "not-allowed" : "pointer",
                }}
              >
                {(row as any)?.shared_with_parent ? "Shared with Parent ✓" : shareBusy ? "Sharing..." : "Share with Parent"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body { background: white !important; }
          footer, header, nav, .no-print { display: none !important; }
          #certificate {
            box-shadow: none !important;
            border-radius: 0 !important;
            border: 12px solid rgba(76,175,80,0.25) !important;
          }
          @page { margin: 12mm; }
        }
      `}</style>
      </div>
    </div>
  );
}

