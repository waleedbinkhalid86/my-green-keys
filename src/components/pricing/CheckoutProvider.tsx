"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPaddle, onPaddleEvent } from "@/lib/paddle";

type PlanType = "family" | "school_starter" | "school_growth";

const CheckoutContext = createContext<{
  checkoutBusy: boolean;
  checkoutError: string;
  openCheckout: (planType: PlanType) => void;
} | null>(null);

function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used within CheckoutProvider");
  return ctx;
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  const priceIds = useMemo(() => {
    const family = process.env.NEXT_PUBLIC_PADDLE_FAMILY_PRICE_ID || "";
    const schoolStarter =
      process.env.NEXT_PUBLIC_PADDLE_SCHOOL_STARTER_PRICE_ID || "";
    const schoolGrowth =
      process.env.NEXT_PUBLIC_PADDLE_SCHOOL_GROWTH_PRICE_ID || "";
    return { family, schoolStarter, schoolGrowth };
  }, []);

  useEffect(() => {
    const unsub = onPaddleEvent(async (event) => {
      if (event?.name !== "checkout.completed") return;
      const payload = event.data as { transaction_id?: string };
      const transactionId = payload?.transaction_id;
      if (!transactionId) return;

      try {
        const res = await fetch("/api/paddle/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId }),
        });
        const json = (await res.json()) as {
          error?: string;
          redirectTo?: string;
        };
        if (!res.ok)
          throw new Error(json?.error || "Failed to finalize purchase");
        router.push(json.redirectTo || "/dashboard/parent");
      } catch (err) {
        setCheckoutError(
          err instanceof Error ? err.message : "Failed to finalize purchase",
        );
      }
    });
    return unsub;
  }, [router]);

  const openCheckout = async (planType: PlanType) => {
    setCheckoutError("");
    setCheckoutBusy(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        router.push("/signup");
        return;
      }

      const priceId =
        planType === "family"
          ? priceIds.family
          : planType === "school_starter"
            ? priceIds.schoolStarter
            : priceIds.schoolGrowth;

      if (!priceId) {
        throw new Error("Missing Paddle price ID configuration for this plan.");
      }

      const checkoutRes = await fetch("/api/paddle/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planType }),
      });
      const checkoutJson = (await checkoutRes.json()) as {
        error?: string;
        transactionId?: string;
      };
      if (!checkoutRes.ok) {
        throw new Error(checkoutJson?.error || "Failed to start checkout");
      }

      const transactionId = checkoutJson.transactionId;
      if (!transactionId) {
        throw new Error("Checkout did not return a transaction ID.");
      }

      const paddle = await getPaddle();
      if (!paddle) {
        throw new Error("Failed to initialize Paddle.");
      }

      paddle.Checkout.open({
        transactionId,
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
        },
      });
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Failed to start checkout",
      );
    } finally {
      setCheckoutBusy(false);
    }
  };

  return (
    <CheckoutContext.Provider
      value={{
        checkoutBusy,
        checkoutError,
        openCheckout: (p) => void openCheckout(p),
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function CheckoutErrorBanner() {
  const { checkoutError } = useCheckout();
  if (!checkoutError) return null;
  return (
    <div
      className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
      role="alert"
    >
      {checkoutError}
    </div>
  );
}

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

const growthCtaBaseStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: "16px 24px",
  borderRadius: "9999px",
  fontSize: "16px",
  fontWeight: "700",
  background: "linear-gradient(135deg, #52B788 0%, #40916C 100%)",
  color: "#FFFFFF",
  border: "none",
  boxShadow: "0 4px 12px rgba(82, 183, 136, 0.3)",
  marginTop: "32px",
};

export function CheckoutButton({
  planType,
  children,
  variant = "primary",
}: {
  planType: PlanType;
  children: React.ReactNode;
  variant?: "primary" | "growth";
}) {
  const { checkoutBusy, openCheckout } = useCheckout();
  const [hover, setHover] = useState(false);
  const base =
    variant === "growth" ? growthCtaBaseStyle : primaryCardCtaBaseStyle;
  const style: React.CSSProperties = {
    ...base,
    opacity: checkoutBusy ? 0.6 : 1,
    cursor: checkoutBusy ? "not-allowed" : "pointer",
    transform:
      variant === "primary" && !checkoutBusy && hover
        ? "scale(1.03)"
        : "scale(1)",
    boxShadow:
      variant === "primary"
        ? !checkoutBusy && hover
          ? "0 8px 22px rgba(0,0,0,0.16)"
          : "0 4px 12px rgba(0,0,0,0.1)"
        : base.boxShadow,
  };
  return (
    <button
      type="button"
      style={style}
      disabled={checkoutBusy}
      onClick={() => openCheckout(planType)}
      onMouseEnter={() => !checkoutBusy && setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {checkoutBusy ? "Loading…" : children}
    </button>
  );
}
