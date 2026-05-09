import Link from "next/link";

const dottedBg: React.CSSProperties = {
  backgroundColor: "#FAFAF7",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  minHeight: "100vh",
};

export default function BrainSprintHubPage() {
  return (
    <div style={dottedBg} className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-md border border-[#D1E8DC] p-10 mb-12">
          <div className="text-xs font-bold text-[#52B788] uppercase tracking-widest mb-3">
            BRAIN SPRINT
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#1B4332] mb-4">
            Think fast. Type faster.
          </h1>
          <p className="text-lg text-[#4A6355] mb-8">Lessons that make typing more than typing.</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#E8F5EE] rounded-2xl p-5 text-center">
              <div className="text-xs font-bold uppercase tracking-wider mb-2">Total lessons</div>
              <div className="text-4xl font-bold text-[#1B4332]">0</div>
            </div>
            <div className="bg-[#FFF8E1] rounded-2xl p-5 text-center">
              <div className="text-xs font-bold uppercase tracking-wider mb-2">Completed</div>
              <div className="text-4xl font-bold text-[#1B4332]">0</div>
            </div>
            <div className="bg-[#E3F2FD] rounded-2xl p-5 text-center">
              <div className="text-xs font-bold uppercase tracking-wider mb-2">Eco-points</div>
              <div className="text-4xl font-bold text-[#1B4332]">0</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            href="/brain-sprint/math"
            className="group relative block rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-[320px]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/brain-sprint/math-hero.png')" }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/95 via-[#1B4332]/50 to-transparent" />

            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#3B82F6]" />

            <div className="relative h-full min-w-0 flex flex-col justify-end p-8">
              <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">
                TRACK 1
              </div>
              <h3 className="text-4xl font-bold text-white mb-2 break-words group-hover:translate-x-2 transition-transform">
                Math Mastery
              </h3>
              <p className="text-white/90 text-base mb-4 break-words">
                10 lessons · Addition to Division
              </p>
              <div className="flex items-center gap-2 text-white font-semibold">
                <span className="min-w-0 break-words">0 / 10 lessons</span>
                <span className="shrink-0 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          <Link
            href="/brain-sprint/eco"
            className="group relative block rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-[320px]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/brain-sprint/eco-hero.png')" }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/95 via-[#1B4332]/50 to-transparent" />

            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#52B788]" />

            <div className="relative h-full min-w-0 flex flex-col justify-end p-8">
              <div className="text-xs font-bold uppercase tracking-widest text-green-300 mb-2">
                TRACK 2
              </div>
              <h3 className="text-4xl font-bold text-white mb-2 break-words group-hover:translate-x-2 transition-transform">
                Eco Genius
              </h3>
              <p className="text-white/90 text-base mb-4 break-words">
                5 lessons · Planet facts & habits
              </p>
              <div className="flex items-center gap-2 text-white font-semibold">
                <span className="min-w-0 break-words">0 / 5 lessons</span>
                <span className="shrink-0 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
