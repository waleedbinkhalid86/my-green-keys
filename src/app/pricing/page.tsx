"use client";
import React, { useState } from "react";
import { LeafIcon, CheckIcon, XIcon } from "lucide-react";

const LeafIconCustom = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const CheckIconCustom = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIconCustom = () => (
  <span style={{ color: "#e0e0e0", fontSize: "18px", fontWeight: "bold" }}>✕</span>
);

const PROMO_CODES: Record<string, { discount: string; type: string; applicable: string[] }> = {
  GREENSTART: { discount: "30% off", type: "percent", applicable: ["Family Plan"] },
  FAMILY2024: { discount: "2 months free", type: "free_months", applicable: ["Family Plan"] },
  SCHOOL100: { discount: "20% off", type: "percent", applicable: ["School Plan"] },
  BACK2SCHOOL: { discount: "50% off first month", type: "percent", applicable: ["School Plan"] },
  WELCOME10: { discount: "10% off", type: "percent", applicable: ["All Plans"] },
};

const TYPING_RULES = [
  {
    q: "Can I try before buying?",
    a: "Yes! Start with our free plan — 10 full lessons, no credit card needed."
  },
  {
    q: "How does the promo code work?",
    a: "Enter your code at checkout or on this page to apply your discount instantly."
  },
  {
    q: "Can I switch plans anytime?",
    a: "Yes, upgrade or downgrade anytime. Changes take effect immediately."
  },
  {
    q: "How many children can use one Family account?",
    a: "Up to 3 children per Family plan, each with their own profile and theme."
  },
  {
    q: "How does the school plan work?",
    a: "Schools get a custom subdomain, teacher dashboard, and branded experience."
  },
  {
    q: "Is there a free trial for schools?",
    a: "Yes! Contact us for a 30-day free school trial with up to 30 students."
  }
];

interface NavBarProps {
  isFixed?: boolean;
}

function Nav({ isFixed = true }: NavBarProps) {
  return (
    <nav style={{
      background: "#2c3e50",
      position: isFixed ? "fixed" : "static",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      boxShadow: "0 1px 0 rgba(255,255,255,0.06)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#4CAF50", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LeafIconCustom />
            </div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>My Green Keys</span>
          </a>

          {/* Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
            {["Features", "Modules", "Schools"].map((l) => (
              <a key={l} href={`/#${l.toLowerCase()}`} style={{ color: "#fff", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#4CAF50"; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#fff"; }}>{l}</a>
            ))}
            <a href="/pricing" style={{ color: "#4CAF50", textDecoration: "none", fontSize: "0.95rem", fontWeight: 600 }}>Pricing</a>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href="/login" style={{ color: "#fff", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#4CAF50"; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#fff"; }} className="hidden md:block">Log In</a>
            <a href="/signup" style={{ background: "#4CAF50", color: "white", padding: "0.6rem 1.4rem", borderRadius: "6px", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600, transition: "background 0.2s" }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#45a049"; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "#4CAF50"; }}>Start Free Trial</a>
          </div>
        </div>
      </div>
    </nav>
  );
}

function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handlePromoCode = () => {
    const code = promoCode.toUpperCase();
    if (PROMO_CODES[code]) {
      const codeInfo = PROMO_CODES[code];
      setPromoResult({
        type: "success",
        message: `✅ ${code} applied! You get ${codeInfo.discount}`
      });
    } else {
      setPromoResult({
        type: "error",
        message: "❌ Invalid code. Please try again."
      });
    }
    setTimeout(() => setPromoResult(null), 3000);
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>
      <Nav isFixed={true} />
      
      {/* Spacing for fixed nav */}
      <div style={{ height: 70 }} />

      {/* HERO SECTION */}
      <section style={{ paddingTop: 80, paddingBottom: 80, textAlign: "center", background: "linear-gradient(135deg, #fff 0%, #f5f7fa 100%)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <p style={{ color: "#4CAF50", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 16, textTransform: "uppercase" }}>
            SIMPLE, TRANSPARENT PRICING
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 900, color: "#2c3e50", marginBottom: 24, lineHeight: 1.2 }}>
            Choose the perfect plan for your child
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>

          {/* Toggle Switch */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 40 }}>
            <span style={{ color: isYearly ? "#999" : "#2c3e50", fontWeight: 600 }}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              style={{
                width: 60,
                height: 32,
                borderRadius: 16,
                background: isYearly ? "#4CAF50" : "#ddd",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.3s ease",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "white",
                  position: "absolute",
                  top: 2,
                  left: isYearly ? 30 : 2,
                  transition: "left 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              />
            </button>
            <span style={{ color: isYearly ? "#4CAF50" : "#999", fontWeight: 600 }}>Yearly <span style={{ background: "#E8F5E9", color: "#4CAF50", padding: "2px 8px", borderRadius: 12, fontSize: "0.8rem", marginLeft: 8 }}>Save 20%</span></span>
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, position: "relative" }}>
            {/* CARD 1: FREE STARTER */}
            <div style={{
              border: "1px solid #e0e0e0",
              borderRadius: 12,
              padding: 32,
              background: "#f5f7fa",
              position: "relative",
            }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#666", background: "#e0e0e0", padding: "4px 12px", borderRadius: 20, display: "inline-block", marginBottom: 16 }}>FREE</div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2c3e50", marginBottom: 8 }}>$0</h3>
              <p style={{ color: "#999", marginBottom: 24 }}>Perfect to get started</p>
              
              <button style={{
                width: "100%",
                padding: "12px 24px",
                border: "2px solid #4CAF50",
                background: "transparent",
                color: "#4CAF50",
                borderRadius: 8,
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 32,
                transition: "all 0.2s ease",
              }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#E8F5E9"; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}>
                Start for Free
              </button>

              <div style={{ fontSize: "0.9rem", color: "#666" }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> 10 typing lessons
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Basic keyboard guide
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> WPM & accuracy tracking
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> 1 eco module preview
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center", color: "#999" }}>
                  <XIconCustom /> Custom lessons
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center", color: "#999" }}>
                  <XIconCustom /> Parent dashboard
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center", color: "#999" }}>
                  <XIconCustom /> Badges & rewards
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", color: "#999" }}>
                  <XIconCustom /> Eco photo rewards
                </div>
              </div>
            </div>

            {/* CARD 2: FAMILY PLAN (POPULAR) */}
            <div style={{
              border: "2px solid #4CAF50",
              borderRadius: 12,
              padding: 32,
              background: "#fff",
              position: "relative",
              boxShadow: "0 8px 32px rgba(76,175,80,0.25)",
              transform: "scale(1.05)",
            }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff", background: "#4CAF50", padding: "4px 12px", borderRadius: 20, display: "inline-block", marginBottom: 16 }}>MOST POPULAR</div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2c3e50", marginBottom: 8 }}>
                ${isYearly ? "7.99" : "9.99"}<span style={{ fontSize: "0.9rem", color: "#999", fontWeight: 400 }}>/month</span>
              </h3>
              <p style={{ color: "#999", marginBottom: 24 }}>Perfect for families</p>
              
              <button style={{
                width: "100%",
                padding: "12px 24px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 12,
                transition: "background 0.2s ease",
              }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#45a049"; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "#4CAF50"; }}>
                Start Free Trial
              </button>
              <p style={{ fontSize: "0.85rem", color: "#999", marginBottom: 24, textAlign: "center" }}>7-day free trial, no credit card required</p>

              <div style={{ fontSize: "0.9rem", color: "#666" }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Unlimited typing lessons
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> All 4 learning modules
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Parent dashboard
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Custom lesson text by parent
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Badges, streaks & rewards
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Eco photo upload rewards
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Weekly progress reports
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Up to 3 children
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Pink/Blue personalization
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center", color: "#999" }}>
                  <XIconCustom /> Teacher dashboard
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", color: "#999" }}>
                  <XIconCustom /> School branding
                </div>
              </div>
            </div>

            {/* CARD 3: SCHOOL PLAN */}
            <div style={{
              border: "1px solid #e0e0e0",
              borderRadius: 12,
              padding: 32,
              background: "#f5f7fa",
              position: "relative",
            }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#666", background: "#e0e0e0", padding: "4px 12px", borderRadius: 20, display: "inline-block", marginBottom: 16 }}>FOR SCHOOLS</div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2c3e50", marginBottom: 8 }}>Starting at <span style={{ fontSize: "1.8rem" }}>$299</span><span style={{ fontSize: "0.9rem", color: "#999", fontWeight: 400 }}>/month</span></h3>
              <p style={{ color: "#999", marginBottom: 24 }}>Perfect for classrooms</p>
              
              <button style={{
                width: "100%",
                padding: "12px 24px",
                background: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 12,
                transition: "background 0.2s ease",
              }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#0b7dda"; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "#2196F3"; }}>
                Contact Us
              </button>
              <p style={{ fontSize: "0.85rem", color: "#999", marginBottom: 24, textAlign: "center" }}>Available in 100 or 200 student packages</p>

              <div style={{ fontSize: "0.9rem", color: "#666" }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Everything in Family plan
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Up to 200 students
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Teacher dashboard
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Custom lessons by teacher
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Class leaderboard
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> School logo & branding
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Lesson library
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Admin dashboard access
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Priority support
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <CheckIconCustom /> Promo code system
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMO CODE SECTION */}
      <section style={{ padding: "80px 24px", background: "#f5f7fa" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{
            border: "2px solid #4CAF50",
            borderRadius: 12,
            padding: 40,
            background: "white",
            textAlign: "center",
          }}>
            <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#2c3e50", marginBottom: 12 }}>🎟️ Have a promo code?</h3>
            <p style={{ fontSize: "1rem", color: "#666", marginBottom: 24 }}>Enter your code below to get a special discount</p>
            
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code..."
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: "1rem",
                  fontFamily: "Poppins, sans-serif",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#4CAF50"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e0e0e0"; }}
              />
              <button
                onClick={handlePromoCode}
                style={{
                  padding: "12px 24px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#45a049"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "#4CAF50"; }}
              >
                Apply Code
              </button>
            </div>

            {promoResult && (
              <div style={{
                padding: "12px 16px",
                background: promoResult.type === "success" ? "#E8F5E9" : "#FFEBEE",
                color: promoResult.type === "success" ? "#4CAF50" : "#c62828",
                borderRadius: 8,
                fontSize: "0.95rem",
                marginBottom: 16,
              }}>
                {promoResult.message}
              </div>
            )}

            <div style={{ textAlign: "left", background: "#f5f7fa", padding: 16, borderRadius: 8 }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#2c3e50", marginBottom: 8 }}>Available codes:</p>
              {Object.entries(PROMO_CODES).map(([code, info]) => (
                <p key={code} style={{ fontSize: "0.8rem", color: "#666", marginBottom: 4 }}>
                  <strong>{code}</strong> — {info.discount} ({info.applicable.join(", ")})
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SCHOOL PACKAGES TABLE */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#2c3e50", marginBottom: 48, textAlign: "center" }}>
            School packages — detailed comparison
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #e0e0e0",
              borderRadius: 8,
            }}>
              <thead>
                <tr style={{ background: "#f5f7fa" }}>
                  <th style={{ padding: 16, textAlign: "left", fontWeight: 700, color: "#2c3e50", borderBottom: "2px solid #e0e0e0" }}>Feature</th>
                  <th style={{ padding: 16, textAlign: "left", fontWeight: 700, color: "#2c3e50", borderBottom: "2px solid #e0e0e0" }}>Starter (100 students)</th>
                  <th style={{ padding: 16, textAlign: "left", fontWeight: 700, color: "#fff", background: "#4CAF50", borderBottom: "2px solid #4CAF50" }}>Growth (200 students)</th>
                  <th style={{ padding: 16, textAlign: "left", fontWeight: 700, color: "#2c3e50", borderBottom: "2px solid #e0e0e0" }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Price", starter: "$299/mo", growth: "$499/mo", enterprise: "Custom" },
                  { label: "Students", starter: "100", growth: "200", enterprise: "Unlimited" },
                  { label: "Teacher accounts", starter: "5", growth: "15", enterprise: "Unlimited" },
                  { label: "Custom lessons", starter: "✓", growth: "✓", enterprise: "✓" },
                  { label: "School branding", starter: "✓", growth: "✓", enterprise: "✓" },
                  { label: "Analytics", starter: "Basic", growth: "Advanced", enterprise: "Full" },
                  { label: "Support", starter: "Email", growth: "Priority", enterprise: "Dedicated" },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <td style={{ padding: 16, fontWeight: 600, color: "#2c3e50" }}>{row.label}</td>
                    <td style={{ padding: 16, color: "#666" }}>{row.starter}</td>
                    <td style={{ padding: 16, background: "#F1F8F6", color: "#2c3e50", fontWeight: 600 }}>{row.growth}</td>
                    <td style={{ padding: 16, color: "#666" }}>{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section style={{ padding: "80px 24px", background: "#f5f7fa" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#2c3e50", marginBottom: 48, textAlign: "center" }}>
            Frequently asked questions
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TYPING_RULES.map((faq, idx) => (
              <div key={idx} style={{
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                overflow: "hidden",
                background: "white",
              }}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  style={{
                    width: "100%",
                    padding: 20,
                    background: "white",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#f5f7fa"; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "white"; }}
                >
                  <span style={{ fontSize: "1rem", fontWeight: 700, color: "#2c3e50", textAlign: "left" }}>{faq.q}</span>
                  <span style={{
                    fontSize: "1.5rem",
                    color: "#4CAF50",
                    transition: "transform 0.3s ease",
                    transform: expandedFaq === idx ? "rotate(180deg)" : "rotate(0deg)",
                  }}>
                    ▼
                  </span>
                </button>
                {expandedFaq === idx && (
                  <div style={{
                    padding: 20,
                    paddingTop: 0,
                    borderTop: "1px solid #e0e0e0",
                    color: "#666",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{
        padding: "80px 24px",
        background: "#1B5E20",
        color: "white",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
            Ready to start your child's typing journey?
          </h2>
          <p style={{ fontSize: "1.1rem", marginBottom: 40, opacity: 0.9 }}>
            Join 10,000+ kids already learning to type and help the planet
          </p>
          
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{
              padding: "14px 32px",
              background: "#FFEB3B",
              color: "#1B5E20",
              border: "none",
              borderRadius: 8,
              fontSize: "1.05rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }} onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = "translateY(-2px)";
              (e.target as HTMLElement).style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
            }} onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = "translateY(0)";
              (e.target as HTMLElement).style.boxShadow = "none";
            }}>
              Start Free Today
            </button>
            <button style={{
              padding: "14px 32px",
              background: "transparent",
              color: "white",
              border: "2px solid white",
              borderRadius: 8,
              fontSize: "1.05rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }} onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = "rgba(255,255,255,0.1)";
            }} onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = "transparent";
            }}>
              Talk to Sales
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default PricingPage;
