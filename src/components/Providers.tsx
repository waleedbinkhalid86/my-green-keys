"use client";

import { AuthProfileRouteProvider } from "@/contexts/AuthProfileRouteContext";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProfileRouteProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProfileRouteProvider>
  );
}
