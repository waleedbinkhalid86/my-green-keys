"use client";

import React, { useState } from "react";
import Link from "next/link";

const primaryCardCtaBaseStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: "16px 24px",
  borderRadius: "9999px",
  fontSize: "16px",
  fontWeight: "700",
  background: "#FFFFFF",
  color: "#1B4332",
  border: "none",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  marginTop: "24px",
  marginBottom: "16px",
};

export function PrimaryLinkCta({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      style={{
        ...primaryCardCtaBaseStyle,
        textDecoration: "none",
        transform: hover ? "scale(1.03)" : "scale(1)",
        boxShadow: hover
          ? "0 8px 22px rgba(0,0,0,0.16)"
          : "0 4px 12px rgba(0,0,0,0.1)",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Link>
  );
}

export function EnterpriseSalesLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "16px 24px",
        borderRadius: "9999px",
        fontSize: "16px",
        fontWeight: "700",
        background: hover ? "#1B4332" : "transparent",
        color: hover ? "#FFFFFF" : "#1B4332",
        border: "2px solid #1B4332",
        cursor: "pointer",
        transition: "all 0.2s ease",
        marginTop: "32px",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </a>
  );
}

export function FinalCtaOutlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      style={{
        padding: "18px 40px",
        borderRadius: "9999px",
        fontSize: "18px",
        fontWeight: "700",
        background: hover ? "#FFFFFF" : "transparent",
        color: hover ? "#1B4332" : "#FFFFFF",
        border: "2px solid #FFFFFF",
        cursor: "pointer",
        transition: "all 0.2s ease",
        minWidth: "180px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </a>
  );
}

export function FinalCtaPrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "18px 40px",
        borderRadius: "9999px",
        fontSize: "18px",
        fontWeight: "700",
        background: "#FFFFFF",
        color: "#1B4332",
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        minWidth: "180px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}
