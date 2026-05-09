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
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8 border border-[#D1E8DC]">
          <div className="text-xs font-bold text-[#52B788] uppercase tracking-wider mb-2">
            BRAIN SPRINT
          </div>
          <h1 className="text-4xl font-bold text-[#1B4332] mb-3">Think fast. Type faster.</h1>
          <p className="text-lg text-[#4A6355] mb-6">Lessons that make typing more than typing.</p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="rounded-xl p-4 text-center bg-[#E8F5EE]">
              <div className="text-xs font-bold uppercase tracking-wider mb-1">Total lessons</div>
              <div className="text-3xl font-bold text-[#1B4332]">0</div>
            </div>
            <div className="rounded-xl p-4 text-center bg-[#FFF8E1]">
              <div className="text-xs font-bold uppercase tracking-wider mb-1">Completed</div>
              <div className="text-3xl font-bold text-[#1B4332]">0</div>
            </div>
            <div className="rounded-xl p-4 text-center bg-[#E3F2FD]">
              <div className="text-xs font-bold uppercase tracking-wider mb-1">Eco-points</div>
              <div className="text-3xl font-bold text-[#1B4332]">0</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Link
            href="/brain-sprint/math"
            className="group rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer relative min-h-[280px] flex min-w-0 flex-col items-end justify-end"
            style={{
              backgroundImage: "url('/images/brain-sprint/math-hero.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/90 via-[#1B4332]/40 to-transparent"></div>

            <div className="absolute top-0 left-0 w-2 h-full bg-[#3B82F6]"></div>

            <div className="relative w-full max-w-full p-8 text-white">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-2">
                Track 1
              </div>
              <h3 className="max-w-full text-3xl font-bold mb-2 group-hover:translate-x-1 transition">
                Math Mastery
              </h3>
              <p className="max-w-full text-sm text-white/90 mb-3">
                10 lessons · Addition to Division
              </p>
              <div className="max-w-full text-sm font-bold text-white">
                0 / 10 lessons →
              </div>
            </div>
          </Link>

          <Link
            href="/brain-sprint/eco"
            className="group rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer relative min-h-[280px] flex min-w-0 flex-col items-end justify-end"
            style={{
              backgroundImage: "url('/images/brain-sprint/eco-hero.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/90 via-[#1B4332]/40 to-transparent"></div>

            <div className="absolute top-0 left-0 w-2 h-full bg-[#52B788]"></div>

            <div className="relative w-full max-w-full p-8 text-white">
              <div className="text-xs font-bold uppercase tracking-wider text-green-200 mb-2">
                Track 2
              </div>
              <h3 className="max-w-full text-3xl font-bold mb-2 group-hover:translate-x-1 transition">
                Eco Genius
              </h3>
              <p className="max-w-full text-sm text-white/90 mb-3">
                5 lessons · Planet facts & habits
              </p>
              <div className="max-w-full text-sm font-bold text-white">
                0 / 5 lessons →
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

