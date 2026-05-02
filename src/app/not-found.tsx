import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        boxSizing: "border-box",
        background: "linear-gradient(180deg, #e8f5e9 0%, #c8e6c9 45%, #a5d6a7 100%)",
        color: "#1b4d30",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(100%, 360px)",
          aspectRatio: "1",
          maxWidth: 360,
          marginBottom: 28,
        }}
      >
        <Image
          src="/images/ui/ui-404.jpg"
          alt="Friendly panda lost in the forest"
          fill
          sizes="(max-width: 400px) 100vw, 360px"
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
      <h1
        style={{
          fontSize: "clamp(1.75rem, 5vw, 2.35rem)",
          fontWeight: 900,
          margin: "0 0 12px",
          lineHeight: 1.2,
          color: "#2c3e50",
        }}
      >
        Oops! Page not found 🐼
      </h1>
      <p
        style={{
          fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
          fontWeight: 600,
          margin: "0 0 32px",
          maxWidth: 420,
          lineHeight: 1.6,
          color: "#37474f",
        }}
      >
        Looks like our panda got lost in the forest!
      </p>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 52,
          padding: "0 32px",
          borderRadius: 999,
          background: "#2e7d32",
          color: "#ffffff",
          fontWeight: 800,
          fontSize: "1rem",
          textDecoration: "none",
          boxShadow: "0 10px 28px rgba(46, 125, 50, 0.35)",
          border: "2px solid rgba(255,255,255,0.35)",
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
