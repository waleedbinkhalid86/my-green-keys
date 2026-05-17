"use client";

import { useState, type FormEvent } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  fontSize: "15px",
  borderRadius: "12px",
  border: "2px solid #D1E8DC",
  color: "#1B4332",
  backgroundColor: "#FFFFFF",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export function SchoolsContactForm() {
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ name, schoolName, phone, message });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "24px" }}
    >
      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#1B4332" }}>
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
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#1B4332" }}>
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
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#1B4332" }}>
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
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#1B4332" }}>Message</span>
        <textarea
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
        />
      </label>
      <button
        type="submit"
        style={{
          padding: "16px 32px",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: 700,
          background: "#1B4332",
          color: "#FFFFFF",
          border: "none",
          cursor: "pointer",
          width: "100%",
          marginTop: "8px",
        }}
      >
        Send message
      </button>
    </form>
  );
}
