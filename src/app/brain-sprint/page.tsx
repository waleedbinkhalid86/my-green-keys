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
            className="rounded-2xl p-8 shadow-md hover:shadow-xl transition cursor-pointer min-h-[200px] flex flex-col justify-center bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] border-l-4 border-[#3B82F6]"
          >
            <Calculator className="w-12 h-12 mb-4" aria-hidden />
            <div className="text-2xl font-bold text-[#1B4332] mb-2">Math Mastery</div>
            <div className="text-sm text-[#4A6355] mb-4">10 lessons · Addition to Division</div>
            <div className="text-sm font-bold text-[#1B4332]">0 / 10 lessons</div>
          </Link>

          <Link
            href="/brain-sprint/eco"
            className="rounded-2xl p-8 shadow-md hover:shadow-xl transition cursor-pointer min-h-[200px] flex flex-col justify-center bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] border-l-4 border-[#52B788]"
          >
            <Leaf className="w-12 h-12 mb-4" aria-hidden />
            <div className="text-2xl font-bold text-[#1B4332] mb-2">Eco Genius</div>
            <div className="text-sm text-[#4A6355] mb-4">5 lessons · Planet facts &amp; habits</div>
            <div className="text-sm font-bold text-[#1B4332]">0 / 5 lessons</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

