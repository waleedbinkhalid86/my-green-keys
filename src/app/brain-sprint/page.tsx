import Link from "next/link";
import { Calculator, Leaf } from "lucide-react";

const dottedBg: React.CSSProperties = {
  backgroundColor: "#FAFAF7",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  minHeight: "100vh",
};

export default function BrainSprintHubPage() {
  return (
    <div style={dottedBg}>
      <section className="mgk-section-tight">
        <div className="mgk-container">
          <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-md ring-1 ring-black/5">
            <div className="text-xs font-bold tracking-wider text-[#52B788] uppercase">
              BRAIN SPRINT
            </div>
            <h1 className="mt-2 text-4xl font-bold text-[#1B4332]">Think fast. Type faster.</h1>
            <p className="mt-2 text-lg font-semibold text-[#4A6355]">
              Lessons that make typing more than typing.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-[#E8F5EE] p-4 text-center">
                <div className="text-xs font-bold tracking-wider text-[#52B788] uppercase">Total lessons</div>
                <div className="text-3xl font-bold text-[#1B4332]">0</div>
              </div>
              <div className="rounded-xl bg-[#FFF8E1] p-4 text-center">
                <div className="text-xs font-bold tracking-wider text-amber-600 uppercase">Completed</div>
                <div className="text-3xl font-bold text-[#1B4332]">0</div>
              </div>
              <div className="rounded-xl bg-[#E3F2FD] p-4 text-center">
                <div className="text-xs font-bold tracking-wider text-blue-600 uppercase">Eco-points</div>
                <div className="text-3xl font-bold text-[#1B4332]">0</div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            <Link
              href="/brain-sprint/math"
              className="group rounded-2xl border border-black/5 bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] p-6 shadow-md transition hover:shadow-xl"
              style={{ textDecoration: "none" }}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-white/70 p-3 shadow-sm ring-1 ring-black/5">
                  <Calculator className="h-7 w-7 text-[#3B82F6]" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 border-l-4 border-[#3B82F6] pl-4">
                  <div className="text-xl font-extrabold text-[#1B4332]">Math Mastery</div>
                  <div className="mt-1 text-sm font-semibold text-[#4A6355]">
                    10 lessons · Addition to Division
                  </div>
                  <div className="mt-3 text-sm font-extrabold text-[#1B4332]">0 / 10 lessons</div>
                </div>
              </div>
            </Link>

            <Link
              href="/brain-sprint/eco"
              className="group rounded-2xl border border-black/5 bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] p-6 shadow-md transition hover:shadow-xl"
              style={{ textDecoration: "none" }}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-white/70 p-3 shadow-sm ring-1 ring-black/5">
                  <Leaf className="h-7 w-7 text-[#52B788]" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 border-l-4 border-[#52B788] pl-4">
                  <div className="text-xl font-extrabold text-[#1B4332]">Eco Genius</div>
                  <div className="mt-1 text-sm font-semibold text-[#4A6355]">
                    5 lessons · Planet facts &amp; habits
                  </div>
                  <div className="mt-3 text-sm font-extrabold text-[#1B4332]">0 / 5 lessons</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

