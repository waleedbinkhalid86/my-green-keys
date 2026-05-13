"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { homeHrefForAccountType } from "@/lib/site-brand-routing";

export type AuthProfileRouteContextValue = {
  /** While auth is not resolved yet, callers should use "/" to avoid flicker. */
  logoHref: string;
  /** True after the first auth sync (including profile fetch when signed in). */
  authReady: boolean;
  isLoggedIn: boolean;
  accountType: string | null;
  signOutAndGoHome: () => Promise<void>;
  logoutBusy: boolean;
};

const AuthProfileRouteContext = createContext<AuthProfileRouteContextValue | null>(null);

async function fetchAccountType(userId: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("account_type").eq("id", userId).maybeSingle();
  return (data?.account_type as string | undefined) ?? null;
}

export function AuthProfileRouteProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const syncGeneration = useRef(0);

  const syncFromSession = useCallback(async (session: Session | null) => {
    const gen = ++syncGeneration.current;
    const uid = session?.user?.id ?? null;
    if (!uid) {
      if (gen !== syncGeneration.current) return;
      setUserId(null);
      setAccountType(null);
      setAuthReady(true);
      return;
    }
    setUserId(uid);
    const at = await fetchAccountType(uid);
    if (gen !== syncGeneration.current) return;
    setAccountType(at);
    setAuthReady(true);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncFromSession(session);
    });
    return () => subscription.unsubscribe();
  }, [syncFromSession]);

  const logoHref = useMemo(() => {
    if (!authReady) return "/";
    if (!userId) return "/";
    return homeHrefForAccountType(accountType);
  }, [authReady, userId, accountType]);

  const isLoggedIn = authReady && Boolean(userId);

  const signOutAndGoHome = useCallback(async () => {
    setLogoutBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      try {
        localStorage.removeItem("userProfile");
        localStorage.removeItem("activeCustomLessonId");
      } catch {
        /* ignore */
      }
      setUserId(null);
      setAccountType(null);
      window.location.href = "/";
    } finally {
      setLogoutBusy(false);
    }
  }, []);

  const value = useMemo<AuthProfileRouteContextValue>(
    () => ({
      logoHref,
      authReady,
      isLoggedIn,
      accountType,
      signOutAndGoHome,
      logoutBusy,
    }),
    [logoHref, authReady, isLoggedIn, accountType, signOutAndGoHome, logoutBusy]
  );

  return <AuthProfileRouteContext.Provider value={value}>{children}</AuthProfileRouteContext.Provider>;
}

export function useAuthProfileRoute(): AuthProfileRouteContextValue {
  const ctx = useContext(AuthProfileRouteContext);
  if (!ctx) {
    throw new Error("useAuthProfileRoute must be used within AuthProfileRouteProvider");
  }
  return ctx;
}
