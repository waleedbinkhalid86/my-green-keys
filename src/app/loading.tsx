import Image from "next/image";

export default function Loading() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
      style={{
        background: "linear-gradient(180deg, #E8F5E9 0%, #FAFAFA 100%)",
        color: "#1A2F23",
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
          background: #2ECC71;
          animation: mgkLoadingDots 1.2s ease-in-out infinite;
        }
        .mgk-loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .mgk-loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @media (prefers-reduced-motion: reduce) {
          .mgk-loading-dot { animation: none; opacity: 0.85; }
        }
      `}</style>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-lg bg-[#2ECC71] text-2xl text-white">🌿</div>
        <span className="font-heading text-xl font-extrabold text-[#1A2F23]">My Green Keys</span>
      </div>
      <div className="relative mx-auto mb-6 w-[200px]">
        <Image
          src="/images/ui/ui-loading.jpg"
          alt=""
          width={200}
          height={200}
          className="h-auto w-full rounded-[16px] object-contain"
          priority
        />
      </div>
      <p className="font-heading text-lg font-extrabold text-[#1A2F23] sm:text-xl">Loading your eco adventure...</p>
      <div className="mt-5" aria-hidden>
        <span className="mgk-loading-dot" />
        <span className="mgk-loading-dot" />
        <span className="mgk-loading-dot" />
      </div>
    </div>
  );
}
