"use client";

import Image from "next/image";
import type React from "react";
import type { KioskRosterStudent } from "@/lib/kid-login/kiosk-server";

const TILE_COLORS = ["#52B788", "#40916C", "#74C69D", "#2D6A4F", "#F2B705"];

function firstInitial(name: string): string {
  const ch = name.trim().charAt(0);
  return ch ? ch.toUpperCase() : "?";
}

function tileAccentColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % TILE_COLORS.length;
  }
  return TILE_COLORS[hash]!;
}

const LINK_BUTTON: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "rgba(255, 255, 255, 0.9)",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

function StudentAvatar({
  student,
  size,
}: {
  student: KioskRosterStudent;
  size: number;
}) {
  if (student.pet_type) {
    return (
      <Image
        src={`/images/pets/pet-${student.pet_type}-happy.png`}
        alt=""
        width={size}
        height={size}
        style={{ objectFit: "contain" }}
      />
    );
  }
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: tileAccentColor(student.display_name),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size >= 90 ? "2.6rem" : "2rem",
        fontWeight: 800,
        color: "#fff",
        boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.12)",
      }}
    >
      {firstInitial(student.display_name)}
    </div>
  );
}

type KioskRosterProps = {
  className: string;
  students: KioskRosterStudent[];
  loading: boolean;
  error: string;
  selectedStudent: KioskRosterStudent | null;
  code: string;
  codeLength: number;
  signingIn: boolean;
  onSelectStudent: (student: KioskRosterStudent) => void;
  onCodeChange: (value: string) => void;
  onSubmitCode: (e: React.FormEvent) => void;
  onCancelCode: () => void;
  onResetTablet: () => void;
  onUseCodeInstead: () => void;
};

export function KioskRoster({
  className: classLabel,
  students,
  loading,
  error,
  selectedStudent,
  code,
  codeLength,
  signingIn,
  onSelectStudent,
  onCodeChange,
  onSubmitCode,
  onCancelCode,
  onResetTablet,
  onUseCodeInstead,
}: KioskRosterProps) {
  if (selectedStudent) {
    const ready = code.length === codeLength && !signingIn;
    return (
      <form
        onSubmit={onSubmitCode}
        style={{
          width: "100%",
          maxWidth: 420,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <StudentAvatar student={selectedStudent} size={96} />
        <h1
          style={{
            margin: "14px 0 0",
            fontSize: "1.65rem",
            fontWeight: 800,
            color: "#fff",
            textAlign: "center",
            letterSpacing: "-0.02em",
            wordBreak: "break-word",
          }}
        >
          Hi, {selectedStudent.display_name}
        </h1>
        <label
          htmlFor="kiosk-kid-code"
          style={{
            margin: "10px 0 18px",
            fontSize: "1rem",
            color: "rgba(255, 255, 255, 0.9)",
            textAlign: "center",
          }}
        >
          Type your 6-letter code
        </label>
        <input
          id="kiosk-kid-code"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          maxLength={codeLength}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          disabled={signingIn}
          placeholder="••••••"
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontSize: "2.4rem",
            fontWeight: 800,
            letterSpacing: "0.3em",
            textAlign: "center",
            padding: "18px 14px",
            borderRadius: 18,
            border: "2px solid rgba(255, 255, 255, 0.45)",
            background: "rgba(255, 255, 255, 0.95)",
            color: "#1B4332",
            outline: "none",
          }}
        />
        {error ? (
          <p
            role="alert"
            style={{
              margin: "14px 0 0",
              fontSize: "0.92rem",
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
          disabled={!ready}
          style={{
            marginTop: 22,
            width: "100%",
            padding: "16px 18px",
            fontSize: "1.15rem",
            fontWeight: 800,
            color: "#fff",
            border: "none",
            borderRadius: 9999,
            cursor: ready ? "pointer" : "not-allowed",
            opacity: ready ? 1 : 0.55,
            background: "linear-gradient(135deg, #52B788 0%, #40916C 100%)",
            boxShadow: "0 4px 18px rgba(82, 183, 136, 0.45)",
          }}
        >
          {signingIn ? "Signing in…" : "Go"}
        </button>
        <button
          type="button"
          onClick={onCancelCode}
          disabled={signingIn}
          style={{
            ...LINK_BUTTON,
            marginTop: 16,
            fontSize: "0.95rem",
            cursor: signingIn ? "not-allowed" : "pointer",
          }}
        >
          That&apos;s not me
        </button>
      </form>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <h1
        style={{
          margin: 0,
          fontSize: "1.65rem",
          fontWeight: 800,
          color: "#fff",
          textAlign: "center",
          letterSpacing: "-0.02em",
        }}
      >
        Who&apos;s learning today?
      </h1>
      <p
        style={{
          margin: "10px 0 0",
          fontSize: "1rem",
          color: "rgba(255, 255, 255, 0.9)",
          textAlign: "center",
          lineHeight: 1.45,
        }}
      >
        {classLabel}
      </p>

      {loading ? (
        <p
          style={{
            marginTop: 32,
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: "1rem",
          }}
        >
          Loading your class…
        </p>
      ) : students.length === 0 ? (
        <p
          style={{
            marginTop: 32,
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: "0.95rem",
            lineHeight: 1.5,
          }}
        >
          No students in this class yet. Ask your teacher to add the roster, or
          log in with your code below.
        </p>
      ) : (
        <div
          style={{
            marginTop: 28,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 14,
          }}
        >
          {students.map((student) => (
            <button
              key={student.rid}
              type="button"
              onClick={() => onSelectStudent(student)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "18px 12px 16px",
                borderRadius: 18,
                border: "2px solid rgba(255, 255, 255, 0.35)",
                background: "rgba(255, 255, 255, 0.14)",
                cursor: "pointer",
                transition: "transform 0.15s ease, background 0.15s ease",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
              }}
            >
              <StudentAvatar student={student} size={72} />
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#fff",
                  textAlign: "center",
                  lineHeight: 1.25,
                  wordBreak: "break-word",
                }}
              >
                {student.display_name}
              </span>
            </button>
          ))}
        </div>
      )}

      {error ? (
        <p
          role="alert"
          style={{
            margin: "18px 0 0",
            fontSize: "0.88rem",
            color: "#ffd6d6",
            lineHeight: 1.4,
            textAlign: "center",
          }}
        >
          {error}
        </p>
      ) : null}

      <div
        style={{
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
        }}
      >
        <button type="button" onClick={onUseCodeInstead} style={LINK_BUTTON}>
          Log in with code instead
        </button>
        <button
          type="button"
          onClick={onResetTablet}
          style={{
            ...LINK_BUTTON,
            fontSize: "0.78rem",
            color: "rgba(255, 255, 255, 0.65)",
          }}
        >
          Teacher: reset this tablet
        </button>
      </div>
    </div>
  );
}
