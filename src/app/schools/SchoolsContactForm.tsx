"use client";

import { useState, type FormEvent } from "react";
import { PrimaryButton } from "@/components/marketing/Buttons";

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "48px",
  padding: "12px 16px",
  fontSize: "15px",
  borderRadius: "12px",
  border: "2px solid #D1E8DC",
  color: "#1B4332",
  backgroundColor: "#FFFFFF",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const SUCCESS_MESSAGE = "Thanks, we've received your message and will contact you soon.";
const NETWORK_ERROR = "Could not send your message. Please check your connection and try again.";

// Off-screen rather than display:none so naive bots still fill it in.
const honeypotStyle: React.CSSProperties = {
  position: "absolute",
  left: "-10000px",
  width: "1px",
  height: "1px",
  overflow: "hidden",
};

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export function SchoolsContactForm() {
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.kind === "submitting") return;
    setState({ kind: "submitting" });

    try {
      const res = await fetch("/api/schools/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, school_name: schoolName, phone, message, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setState({ kind: "error", message: data.error ?? NETWORK_ERROR });
        return;
      }
      setName("");
      setSchoolName("");
      setPhone("");
      setMessage("");
      setState({ kind: "success" });
    } catch {
      setState({ kind: "error", message: NETWORK_ERROR });
    }
  };

  const submitting = state.kind === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "24px" }}
    >
      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#1B4332" }}>
          Name <span style={{ color: "#2D6A4F" }}>*</span>
        </span>
        <input
          type="text"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#1B4332" }}>
          School name <span style={{ color: "#2D6A4F" }}>*</span>
        </span>
        <input
          type="text"
          name="schoolName"
          required
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#1B4332" }}>
          Phone <span style={{ color: "#2D6A4F" }}>*</span>
        </span>
        <input
          type="tel"
          name="phone"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#1B4332" }}>Message</span>
        <textarea
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
        />
      </label>
      <div style={honeypotStyle} aria-hidden="true">
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>
      <PrimaryButton type="submit" block disabled={submitting} style={{ marginTop: "8px" }}>
        {submitting ? "Sending…" : "Send message"}
      </PrimaryButton>
      {(state.kind === "success" || state.kind === "error") && (
        <p
          role={state.kind === "error" ? "alert" : "status"}
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 600,
            color: state.kind === "error" ? "#1B4332" : "#2D6A4F",
          }}
        >
          {state.kind === "success" ? SUCCESS_MESSAGE : state.message}
        </p>
      )}
    </form>
  );
}
