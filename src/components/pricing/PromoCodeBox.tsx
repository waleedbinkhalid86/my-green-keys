"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { redeemPromoCode } from "@/lib/promo/redeem";
import { useToast } from "@/components/ui/Toast";

export function PromoCodeBox() {
  const router = useRouter();
  const { showToast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [promoRedeemError, setPromoRedeemError] = useState<string | null>(null);
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
      setAuthReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setAuthReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleRedeemPromo = async () => {
    setPromoRedeemError(null);
    setRedeemBusy(true);
    try {
      const result = await redeemPromoCode(promoCode);
      if (!result.success) {
        setPromoRedeemError(result.message);
        return;
      }
      const expiresLabel = result.expires_at
        ? new Date(result.expires_at).toLocaleString(undefined, {
            dateStyle: "long",
            timeStyle: "short",
          })
        : "the date shown in your account";
      showToast(
        "success",
        `🎉 Code redeemed! You have 3 months of free access until ${expiresLabel}.`,
      );
      router.push("/dashboard/parent");
    } catch {
      setPromoRedeemError("Something went wrong. Please try again.");
    } finally {
      setRedeemBusy(false);
    }
  };

  return (
    <div
      className="mb-10 rounded-2xl border p-6 shadow-md sm:p-8"
      style={{
        background: "linear-gradient(145deg, #F0F9F4 0%, #FFFFFF 55%)",
        borderColor: "#2D6A4F",
        boxShadow: "0 8px 28px rgba(27, 67, 50, 0.08)",
      }}
    >
      <h2 className="mb-1 text-xl font-bold" style={{ color: "#1B4332" }}>
        Have a promo code?
      </h2>
      <p className="mb-4 text-sm" style={{ color: "#2D6A4F" }}>
        Enter your code for complimentary full access for a limited time. One
        redemption per account.
      </p>
      {!authReady ? (
        <p className="text-sm font-medium" style={{ color: "#4A6355" }}>
          Loading…
        </p>
      ) : isLoggedIn ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="E.G. GOGREEN"
            autoComplete="off"
            spellCheck={false}
            disabled={redeemBusy}
            className="min-w-0 flex-1 rounded-xl border-2 outline-none transition-colors focus-visible:border-[#52B788] focus-visible:ring-2 focus-visible:ring-[#52B788]/25 disabled:opacity-60"
            style={{
              padding: "14px 16px",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              borderColor: "#D1E8DC",
              color: "#1B4332",
              backgroundColor: "#FFFFFF",
            }}
          />
          <button
            type="button"
            disabled={redeemBusy || !promoCode.trim()}
            onClick={() => void handleRedeemPromo()}
            style={{
              padding: "14px 32px",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 700,
              background:
                redeemBusy || !promoCode.trim()
                  ? "#94D2B8"
                  : "linear-gradient(135deg, #52B788 0%, #2D6A4F 100%)",
              color: "#FFFFFF",
              border: "none",
              cursor:
                redeemBusy || !promoCode.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 14px rgba(45, 106, 79, 0.25)",
              whiteSpace: "nowrap",
            }}
          >
            {redeemBusy ? "Redeeming…" : "Redeem"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 32px",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #52B788 0%, #2D6A4F 100%)",
              color: "#FFFFFF",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 14px rgba(45, 106, 79, 0.25)",
              textDecoration: "none",
              width: "100%",
            }}
          >
            Sign up to redeem a promo code
          </Link>
          <p className="text-sm" style={{ color: "#4A6355" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold underline"
              style={{ color: "#2D6A4F" }}
            >
              Log in to redeem
            </Link>
            .
          </p>
        </div>
      )}
      {promoRedeemError ? (
        <p
          className="mt-3 rounded-xl border px-3 py-2 text-sm font-medium"
          style={{
            borderColor: "#FECACA",
            backgroundColor: "#FEF2F2",
            color: "#B91C1C",
          }}
          role="alert"
        >
          {promoRedeemError}
        </p>
      ) : null}
    </div>
  );
}
