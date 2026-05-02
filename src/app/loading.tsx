import Image from "next/image";

export default function Loading() {
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
        background: "linear-gradient(180deg, #e3f2fd 0%, #e8f5e9 50%, #fffde7 100%)",
        color: "#1b4d30",
        textAlign: "center",
      }}
    >
      <style>{`
        @keyframes mgkLoadingDots {
          0%, 20% { opacity: 0.25; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
          100% { opacity: 0.25; transform: translateY(0); }
        }
        .mgk-loading-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin: 0 4px;
          border-radius: 999px;
          background: #2e7d32;
          animation: mgkLoadingDots 1.2s ease-in-out infinite;
        }
        .mgk-loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .mgk-loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @media (prefers-reduced-motion: reduce) {
          .mgk-loading-dot { animation: none; opacity: 0.85; }
        }
      `}</style>
      <div
        style={{
          position: "relative",
          width: "min(100%, 320px)",
          aspectRatio: "1",
          maxWidth: 320,
          marginBottom: 24,
        }}
      >
        <Image
          src="/images/ui/ui-loading.jpg"
          alt=""
          fill
          sizes="(max-width: 360px) 100vw, 320px"
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
      <p
        style={{
          fontSize: "clamp(1.05rem, 2.8vw, 1.25rem)",
          fontWeight: 800,
          margin: 0,
          color: "#2c3e50",
        }}
      >
        Loading your eco adventure... 🌿
      </p>
      <div style={{ marginTop: 18 }} aria-hidden>
        <span className="mgk-loading-dot" />
        <span className="mgk-loading-dot" />
        <span className="mgk-loading-dot" />
      </div>
    </div>
  );
}
