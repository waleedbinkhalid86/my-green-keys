"use client";

import Image from "next/image";
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

type KioskRosterProps = {
  className: string;
  students: KioskRosterStudent[];
  loading: boolean;
  signingInId: string | null;
  error: string;
  onSelectStudent: (studentId: string) => void;
  onChangeClass: () => void;
  onUseCodeInstead: () => void;
};

export function KioskRoster({
  className: classLabel,
  students,
  loading,
  signingInId,
  error,
  onSelectStudent,
  onChangeClass,
  onUseCodeInstead,
}: KioskRosterProps) {
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
          join with your class code below.
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
          {students.map((student) => {
            const busy = signingInId === student.student_id;
            const disabled = !!signingInId;
            return (
              <button
                key={student.student_id}
                type="button"
                disabled={disabled}
                onClick={() => onSelectStudent(student.student_id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  padding: "18px 12px 16px",
                  borderRadius: 18,
                  border: "2px solid rgba(255, 255, 255, 0.35)",
                  background: busy
                    ? "rgba(82, 183, 136, 0.35)"
                    : "rgba(255, 255, 255, 0.14)",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled && !busy ? 0.6 : 1,
                  transition: "transform 0.15s ease, background 0.15s ease",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                }}
              >
                {student.pet_type ? (
                  <Image
                    src={`/images/pets/pet-${student.pet_type}-happy.png`}
                    alt=""
                    width={72}
                    height={72}
                    style={{ objectFit: "contain" }}
                  />
                ) : (
                  <div
                    aria-hidden
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: tileAccentColor(student.display_name),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      fontWeight: 800,
                      color: "#fff",
                      boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.12)",
                    }}
                  >
                    {firstInitial(student.display_name)}
                  </div>
                )}
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
                  {busy ? "Signing in…" : student.display_name}
                </span>
              </button>
            );
          })}
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
        <button
          type="button"
          onClick={onChangeClass}
          disabled={!!signingInId}
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.9)",
            background: "transparent",
            border: "none",
            cursor: signingInId ? "not-allowed" : "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          Not your class? Change class
        </button>
        <button
          type="button"
          onClick={onUseCodeInstead}
          disabled={!!signingInId}
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.9)",
            background: "transparent",
            border: "none",
            cursor: signingInId ? "not-allowed" : "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          Log in with code instead
        </button>
      </div>
    </div>
  );
}
