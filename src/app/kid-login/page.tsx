"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { joinClassWithCode } from "@/lib/kid-login/class-api";
import type { KioskRosterStudent } from "@/lib/kid-login/kiosk-server";
import {
  clearKioskClassFromStorage,
  readKioskClassFromStorage,
  writeKioskClassToStorage,
} from "@/lib/kid-login/kiosk-storage";
import { KioskRoster } from "@/components/kid-login/KioskRoster";

const BG_DEEP = "#1B4332";
const BG_MID = "#2D6A4F";
const ACCENT = "#52B788";

const PARENT_KID_CODE_LENGTH = 6;
const TEACHER_CLASS_CODE_LENGTH = 8;

const KID_ERROR =
  "Hmm, that code didn't work. Check it with your parent or teacher.";

const GLASS_CARD: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  borderRadius: 20,
  padding: "32px 28px",
  background: "rgba(255, 255, 255, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.22)",
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.25)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

const PAGE_SHELL: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 16px",
  backgroundColor: BG_DEEP,
  backgroundImage: `
    linear-gradient(165deg, ${BG_DEEP} 0%, ${BG_MID} 48%, #152a22 100%),
    radial-gradient(circle at 18% 18%, rgba(82, 183, 136, 0.14) 0%, transparent 42%),
    radial-gradient(circle at 82% 78%, rgba(45, 106, 79, 0.28) 0%, transparent 38%),
    radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)
  `,
  backgroundSize: "auto, auto, auto, 18px 18px",
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

function normalizeKidInput(raw: string): string {
  return raw.replace(/\s/g, "").toUpperCase();
}

type KidCodeKind = "parent" | "class" | "invalid";

function classifyKidCode(normalized: string): KidCodeKind {
  if (normalized.length === TEACHER_CLASS_CODE_LENGTH) return "class";
  if (normalized.length === PARENT_KID_CODE_LENGTH) return "parent";
  return "invalid";
}

type Step = "code" | "class-name" | "kiosk-setup";

async function syncLessonUserProfileCacheFromServer(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, gender, age")
    .eq("id", user.id)
    .maybeSingle();

  const row = profile as {
    full_name?: string | null;
    gender?: string | null;
    age?: number | null;
  } | null;

  const name = row?.full_name?.trim() || "Friend";
  const gender =
    row?.gender === "girl" || row?.gender === "boy" ? row.gender : "boy";
  const age =
    typeof row?.age === "number" && Number.isFinite(row.age) ? row.age : 8;

  try {
    localStorage.setItem(
      "userProfile",
      JSON.stringify({ name, age, gender })
    );
  } catch {
    /* ignore */
  }
}

async function redirectAfterStudentSession(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = "/";
    return;
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();

  const accountTypeRedirectMap: Record<string, string> = {
    student: "/home",
    parent: "/dashboard/parent",
    teacher: "/dashboard/teacher",
  };
  const path =
    (profile?.account_type && accountTypeRedirectMap[profile.account_type]) ||
    "/lesson";
  window.location.href = path;
}

export default function KidLoginPage() {
  const [codeInput, setCodeInput] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [step, setStep] = useState<Step>("code");
  const [pendingClassCode, setPendingClassCode] = useState("");
  const [kioskSetupCode, setKioskSetupCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [kioskHydrated, setKioskHydrated] = useState(false);
  const [kioskClassId, setKioskClassId] = useState<string | null>(null);
  const [kioskClassName, setKioskClassName] = useState<string | null>(null);
  const [forceCodeEntry, setForceCodeEntry] = useState(false);
  const [rosterStudents, setRosterStudents] = useState<KioskRosterStudent[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [signingInId, setSigningInId] = useState<string | null>(null);

  useEffect(() => {
    const { classId, className } = readKioskClassFromStorage();
    setKioskClassId(classId);
    setKioskClassName(className);
    setKioskHydrated(true);
  }, []);

  const showRoster =
    kioskHydrated &&
    !!kioskClassId &&
    !forceCodeEntry &&
    step === "code";

  const loadRoster = useCallback(async (classId: string) => {
    setRosterLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/kid-login/kiosk/roster?class_id=${encodeURIComponent(classId)}`
      );
      const data = (await res.json()) as {
        students?: KioskRosterStudent[];
        class_name?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? KID_ERROR);
        setRosterStudents([]);
        return;
      }
      setRosterStudents(data.students ?? []);
      if (data.class_name) {
        setKioskClassName(data.class_name);
        try {
          writeKioskClassToStorage(classId, data.class_name);
        } catch {
          /* ignore */
        }
      }
    } catch {
      setError("Couldn't load your class. Try again.");
    } finally {
      setRosterLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showRoster && kioskClassId) {
      void loadRoster(kioskClassId);
    }
  }, [showRoster, kioskClassId, loadRoster]);

  const onCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setCodeInput(normalizeKidInput(e.target.value));
  };

  const onDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setDisplayName(e.target.value);
  };

  const onKioskSetupCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setKioskSetupCode(normalizeKidInput(e.target.value));
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const normalized = normalizeKidInput(codeInput);
    const kind = classifyKidCode(normalized);

    if (kind === "class") {
      setPendingClassCode(normalized);
      setStep("class-name");
      return;
    }

    if (kind === "parent") {
      setLoading(true);
      try {
        const supabase = createClient();
        await supabase.auth.signOut();

        const { data: child, error: qErr } = await supabase
          .from("children")
          .select("internal_email, internal_password")
          .eq("login_code", normalized)
          .maybeSingle();

        if (qErr || !child?.internal_email || !child?.internal_password) {
          setError(KID_ERROR);
          return;
        }

        const { error: signErr } = await supabase.auth.signInWithPassword({
          email: child.internal_email,
          password: child.internal_password,
        });

        if (signErr) {
          setError(KID_ERROR);
          return;
        }

        await syncLessonUserProfileCacheFromServer();
        await redirectAfterStudentSession();
      } catch {
        setError(KID_ERROR);
      } finally {
        setLoading(false);
      }
      return;
    }

    setError(
      "Your code should be 6 letters or numbers from home, or 8 from your teacher."
    );
  };

  const handleClassJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const name = displayName.trim();
    if (!name) {
      setError("Please enter your name so your teacher knows who you are.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();

      await joinClassWithCode({
        class_code: pendingClassCode,
        display_name: name,
      });
      await syncLessonUserProfileCacheFromServer();
      await redirectAfterStudentSession();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Class not found") || msg.includes("teacher")) {
        setError(KID_ERROR);
      } else if (msg) {
        setError(msg);
      } else {
        setError(KID_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKioskSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const normalized = normalizeKidInput(kioskSetupCode);
    if (normalized.length !== TEACHER_CLASS_CODE_LENGTH) {
      setError("Enter the 8-character class code from your teacher.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/kid-login/kiosk/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_code: normalized }),
      });
      const data = (await res.json()) as {
        class_id?: string;
        class_name?: string;
        error?: string;
      };

      if (!res.ok || !data.class_id || !data.class_name) {
        setError(data.error ?? KID_ERROR);
        return;
      }

      writeKioskClassToStorage(data.class_id, data.class_name);
      setKioskClassId(data.class_id);
      setKioskClassName(data.class_name);
      setForceCodeEntry(false);
      setStep("code");
      setKioskSetupCode("");
    } catch {
      setError(KID_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleRosterTap = async (studentId: string) => {
    if (!kioskClassId) return;
    setSigningInId(studentId);
    setError("");
    try {
      const supabase = createClient();
      await supabase.auth.signOut();

      const res = await fetch("/api/kid-login/kiosk/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          class_id: kioskClassId,
          student_auth_user_id: studentId,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? KID_ERROR);
        return;
      }

      await syncLessonUserProfileCacheFromServer();
      await redirectAfterStudentSession();
    } catch {
      setError(KID_ERROR);
    } finally {
      setSigningInId(null);
    }
  };

  const goBackToCode = () => {
    setStep("code");
    setPendingClassCode("");
    setDisplayName("");
    setError("");
  };

  const handleChangeClass = () => {
    clearKioskClassFromStorage();
    setKioskClassId(null);
    setKioskClassName(null);
    setRosterStudents([]);
    setForceCodeEntry(false);
    setError("");
    setStep("code");
  };

  const cardMaxWidth = showRoster ? 720 : 420;

  if (!kioskHydrated) {
    return (
      <div style={PAGE_SHELL}>
        <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem" }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div style={PAGE_SHELL}>
      <div style={{ ...GLASS_CARD, maxWidth: cardMaxWidth }}>
        {showRoster ? (
          <KioskRoster
            className={kioskClassName ?? "Your class"}
            students={rosterStudents}
            loading={rosterLoading}
            signingInId={signingInId}
            error={error}
            onSelectStudent={handleRosterTap}
            onChangeClass={handleChangeClass}
            onUseCodeInstead={() => {
              setForceCodeEntry(true);
              setError("");
            }}
          />
        ) : (
          <>
            <h1
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#fff",
                textAlign: "center",
                letterSpacing: "-0.02em",
              }}
            >
              {step === "kiosk-setup"
                ? "Set up this class computer"
                : "Kid login"}
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "0.95rem",
                color: "rgba(255, 255, 255, 0.85)",
                textAlign: "center",
                lineHeight: 1.45,
              }}
            >
              {step === "code"
                ? "Enter the code from your parent or teacher."
                : step === "kiosk-setup"
                  ? "Teachers: enter your 8-character class code once. This device will show your class roster for tap-to-login."
                  : "Almost there! What should we call you in class?"}
            </p>

            {step === "code" ? (
              <form onSubmit={handleCodeSubmit} style={{ marginTop: 28 }}>
                <label
                  htmlFor="kid-code"
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.9)",
                    marginBottom: 8,
                  }}
                >
                  Enter your code
                </label>
                <input
                  id="kid-code"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  value={codeInput}
                  onChange={onCodeChange}
                  disabled={loading}
                  placeholder="e.g. K7SAEB"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textAlign: "center",
                    padding: "16px 14px",
                    borderRadius: 14,
                    border: "2px solid rgba(255, 255, 255, 0.35)",
                    background: "rgba(255, 255, 255, 0.92)",
                    color: BG_DEEP,
                    outline: "none",
                  }}
                />
                {error ? (
                  <p
                    role="alert"
                    style={{
                      margin: "14px 0 0",
                      fontSize: "0.88rem",
                      color: "#ffd6d6",
                      lineHeight: 1.4,
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={loading || !normalizeKidInput(codeInput)}
                  style={{
                    marginTop: 22,
                    width: "100%",
                    padding: "14px 18px",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#fff",
                    border: "none",
                    borderRadius: 9999,
                    cursor:
                      loading || !normalizeKidInput(codeInput)
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      loading || !normalizeKidInput(codeInput) ? 0.55 : 1,
                    background: `linear-gradient(135deg, ${ACCENT} 0%, #40916C 100%)`,
                    boxShadow: "0 4px 18px rgba(82, 183, 136, 0.45)",
                  }}
                >
                  {loading ? "One moment…" : "Continue"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("kiosk-setup");
                    setError("");
                    setKioskSetupCode("");
                  }}
                  disabled={loading}
                  style={{
                    marginTop: 18,
                    width: "100%",
                    padding: "10px",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.92)",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    borderRadius: 12,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  Set up this class computer
                </button>
                {kioskClassId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setForceCodeEntry(false);
                      setError("");
                    }}
                    disabled={loading}
                    style={{
                      marginTop: 12,
                      width: "100%",
                      padding: "8px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.9)",
                      background: "transparent",
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    Back to class roster
                  </button>
                ) : null}
              </form>
            ) : step === "kiosk-setup" ? (
              <form onSubmit={handleKioskSetupSubmit} style={{ marginTop: 28 }}>
                <label
                  htmlFor="kiosk-class-code"
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.9)",
                    marginBottom: 8,
                  }}
                >
                  Class code
                </label>
                <input
                  id="kiosk-class-code"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  value={kioskSetupCode}
                  onChange={onKioskSetupCodeChange}
                  disabled={loading}
                  placeholder="8-character code"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textAlign: "center",
                    padding: "16px 14px",
                    borderRadius: 14,
                    border: "2px solid rgba(255, 255, 255, 0.35)",
                    background: "rgba(255, 255, 255, 0.92)",
                    color: BG_DEEP,
                    outline: "none",
                  }}
                />
                {error ? (
                  <p
                    role="alert"
                    style={{
                      margin: "14px 0 0",
                      fontSize: "0.88rem",
                      color: "#ffd6d6",
                      lineHeight: 1.4,
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={
                    loading ||
                    normalizeKidInput(kioskSetupCode).length !==
                      TEACHER_CLASS_CODE_LENGTH
                  }
                  style={{
                    marginTop: 22,
                    width: "100%",
                    padding: "14px 18px",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#fff",
                    border: "none",
                    borderRadius: 9999,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.55 : 1,
                    background: `linear-gradient(135deg, ${ACCENT} 0%, #40916C 100%)`,
                    boxShadow: "0 4px 18px rgba(82, 183, 136, 0.45)",
                  }}
                >
                  {loading ? "Saving…" : "Save for this device"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("code");
                    setError("");
                  }}
                  disabled={loading}
                  style={{
                    marginTop: 14,
                    width: "100%",
                    padding: "10px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.9)",
                    background: "transparent",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  Back
                </button>
              </form>
            ) : (
              <form onSubmit={handleClassJoinSubmit} style={{ marginTop: 28 }}>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: "0.85rem",
                    color: "rgba(255, 255, 255, 0.8)",
                    textAlign: "center",
                  }}
                >
                  Class code:{" "}
                  <strong style={{ color: "#fff", letterSpacing: "0.08em" }}>
                    {pendingClassCode}
                  </strong>
                </p>
                <label
                  htmlFor="kid-display-name"
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.9)",
                    marginBottom: 8,
                  }}
                >
                  Your display name
                </label>
                <input
                  id="kid-display-name"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={onDisplayNameChange}
                  disabled={loading}
                  placeholder="e.g. Alex"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    fontSize: "1.1rem",
                    padding: "14px 14px",
                    borderRadius: 14,
                    border: "2px solid rgba(255, 255, 255, 0.35)",
                    background: "rgba(255, 255, 255, 0.92)",
                    color: BG_DEEP,
                    outline: "none",
                  }}
                />
                {error ? (
                  <p
                    role="alert"
                    style={{
                      margin: "14px 0 0",
                      fontSize: "0.88rem",
                      color: "#ffd6d6",
                      lineHeight: 1.4,
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={loading || !displayName.trim()}
                  style={{
                    marginTop: 22,
                    width: "100%",
                    padding: "14px 18px",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#fff",
                    border: "none",
                    borderRadius: 9999,
                    cursor:
                      loading || !displayName.trim() ? "not-allowed" : "pointer",
                    opacity: loading || !displayName.trim() ? 0.55 : 1,
                    background: `linear-gradient(135deg, ${ACCENT} 0%, #40916C 100%)`,
                    boxShadow: "0 4px 18px rgba(82, 183, 136, 0.45)",
                  }}
                >
                  {loading ? "Joining…" : "Join class"}
                </button>
                <button
                  type="button"
                  onClick={goBackToCode}
                  disabled={loading}
                  style={{
                    marginTop: 14,
                    width: "100%",
                    padding: "10px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.9)",
                    background: "transparent",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  Different code
                </button>
              </form>
            )}
          </>
        )}

        {!showRoster ? (
          <p
            style={{
              marginTop: 26,
              textAlign: "center",
              fontSize: "0.85rem",
            }}
          >
            <Link
              href="/login"
              style={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: 600 }}
            >
              Parent or teacher? Log in here
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
