"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Check, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

type ToastItem = { id: string; type: ToastType; message: string };

type ToastContextValue = {
  showToast: (type: ToastType, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setItems((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[200] flex max-w-[min(100vw-2rem,420px)] flex-col gap-2"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "mgk-toast-enter pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
              t.type === "success" && "border-[#C8E6C9] bg-[#E8F5E9] text-[#1B5E20]",
              t.type === "error" && "border-[#FFCDD2] bg-[#FFEBEE] text-[#B71C1C]",
              t.type === "info" && "border-[#BBDEFB] bg-[#E3F2FD] text-[#0D47A1]"
            )}
            style={{ fontFamily: "var(--font-nunito), ui-sans-serif, system-ui, sans-serif" }}
          >
            <span
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                t.type === "success" && "bg-[#2ECC71] text-white",
                t.type === "error" && "bg-[#E53935] text-white",
                t.type === "info" && "bg-[#2196F3] text-white"
              )}
              aria-hidden
            >
              {t.type === "success" ? (
                <Check className="size-4 stroke-[3]" />
              ) : t.type === "error" ? (
                <X className="size-4 stroke-[3]" />
              ) : (
                <Info className="size-4 stroke-[2.5]" />
              )}
            </span>
            <p className="pt-1 text-sm font-semibold leading-snug">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
