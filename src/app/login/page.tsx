"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const LOGIN_TIMEOUT_MS = 10_000;
const LOGIN_TIMEOUT_MESSAGE = "Connection timeout. Please try again or contact support.";

interface LoginForm {
  emailOrUsername: string;
  password: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(timeoutMessage)), ms);
    promise.then(
      (value) => {
        clearTimeout(id);
        resolve(value);
      },
      (err: unknown) => {
        clearTimeout(id);
        reject(err);
      }
    );
  });
}

function formatAuthError(error: AuthError): string {
  const parts = [error.message];
  if (error.status !== undefined) parts.push(`status: ${error.status}`);
  const code =
    "code" in error && typeof (error as { code?: string }).code === "string"
      ? (error as { code: string }).code
      : undefined;
  if (code) parts.push(`code: ${code}`);
  return parts.join(" · ");
}

function formatPostgrestError(error: {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}): string {
  const parts = [error.message];
  if (error.code) parts.push(`code: ${error.code}`);
  if (error.details) parts.push(`details: ${error.details}`);
  if (error.hint) parts.push(`hint: ${error.hint}`);
  return parts.join(" · ");
}

function formatUnknownError(error: unknown): string {
  if (error instanceof Error) {
    const bits = [error.message];
    if (error.name && error.name !== "Error") bits.push(`name: ${error.name}`);
    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause !== undefined && cause !== null) {
      bits.push(`cause: ${formatUnknownError(cause)}`);
    }
    return bits.join(" · ");
  }
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export default function LoginPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<LoginForm>({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const err = new URLSearchParams(window.location.search).get("error");
    if (err) {
      const decoded = decodeURIComponent(err);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot OAuth/callback error from query string
      setErrors({ form: decoded });
      showToast("error", decoded);
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- parse URL error once on mount
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      newErrors.form = "Please fix the highlighted fields.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await withTimeout(
        (async () => {
          const supabase = createClient();

          let authData: { user: User | null; session: Session | null } | null = null;
          let authError: AuthError | null = null;

          try {
            const result = await supabase.auth.signInWithPassword({
              email: formData.emailOrUsername,
              password: formData.password,
            });
            authData = result.data;
            authError = result.error;
          } catch (signInThrown) {
            const msg = formatUnknownError(signInThrown);
            setErrors({ form: msg });
            showToast("error", msg);
            return;
          }

          if (authError) {
            const msg = formatAuthError(authError);
            setErrors({ form: msg });
            showToast("error", msg);
            return;
          }

          if (!authData?.user) {
            const msg = "Sign-in succeeded but no user was returned.";
            setErrors({ form: msg });
            showToast("error", msg);
            return;
          }

          let profile: { account_type: string } | null = null;
          let profileError: {
            message: string;
            code?: string;
            details?: string;
            hint?: string;
          } | null = null;

          try {
            const profileResult = await supabase
              .from("profiles")
              .select("account_type")
              .eq("id", authData.user.id)
              .single();
            profile = profileResult.data;
            profileError = profileResult.error;
          } catch (profileThrown) {
            const msg = formatUnknownError(profileThrown);
            setErrors({ form: msg });
            showToast("error", msg);
            return;
          }

          if (profileError) {
            const msg = formatPostgrestError(profileError);
            setErrors({ form: msg });
            showToast("error", msg);
            return;
          }

          if (!profile) {
            const msg = "No profile row found for this user.";
            setErrors({ form: msg });
            showToast("error", msg);
            return;
          }

          const accountTypeRedirectMap: Record<string, string> = {
            student: "/lesson",
            parent: "/dashboard/parent",
            teacher: "/dashboard/teacher",
          };

          const redirectPath = accountTypeRedirectMap[profile.account_type] || "/lesson";
          showToast("success", "Welcome back!");
          window.location.href = redirectPath;
        })(),
        LOGIN_TIMEOUT_MS,
        LOGIN_TIMEOUT_MESSAGE
      );
    } catch (error) {
      const msg = formatUnknownError(error);
      setErrors({ form: msg });
      showToast("error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrors({});
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        const msg = formatAuthError(error);
        setErrors({ form: msg });
        showToast("error", msg);
      }
    } catch (e) {
      const msg = formatUnknownError(e);
      setErrors({ form: msg });
      showToast("error", msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputClassName = cn(
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400",
    "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500",
    "disabled:cursor-not-allowed disabled:opacity-50"
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 font-sans">
      <div className="w-full max-w-sm p-8">
        <div className="mb-8 flex justify-center">
          <Leaf className="h-10 w-10 text-green-500" strokeWidth={2} aria-hidden />
        </div>

        <h1 className="mb-8 text-center text-2xl font-semibold text-gray-900">Log in</h1>

        <form className="text-left" onSubmit={handleSubmit} noValidate>
          <GoogleSignInButton
            onClick={handleGoogleSignIn}
            disabled={isLoading || googleLoading}
            className="h-auto justify-start gap-3 rounded-lg border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-700 shadow-none hover:bg-gray-50"
          />

          <div className="my-6 flex items-center gap-3" role="separator" aria-label="Or">
            <hr className="min-h-px flex-1 border-0 bg-gray-200" />
            <span className="text-xs font-normal uppercase tracking-wide text-gray-400">or</span>
            <hr className="min-h-px flex-1 border-0 bg-gray-200" />
          </div>

          <div className="mb-4">
            <label htmlFor="emailOrUsername" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="emailOrUsername"
              type="email"
              name="emailOrUsername"
              autoComplete="email"
              value={formData.emailOrUsername}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="you@example.com"
              aria-invalid={!!errors.emailOrUsername}
              className={cn(inputClassName, errors.emailOrUsername && "border-red-500 focus:ring-red-500")}
            />
            {errors.emailOrUsername ? (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.emailOrUsername}
              </p>
            ) : null}
          </div>

          <div className="mb-6">
            <div className="mb-1 flex items-center justify-between gap-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-green-600">
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              aria-invalid={!!errors.password}
              className={cn(inputClassName, errors.password && "border-red-500 focus:ring-red-500")}
            />
            {errors.password ? (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.password}
              </p>
            ) : null}
          </div>

          {errors.form ? (
            <p className="mb-4 text-sm text-red-600 whitespace-pre-wrap break-words" role="alert" aria-live="polite">
              {errors.form}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading || googleLoading}
            className="w-full rounded-lg bg-[#2ECC71] py-3 text-sm font-medium text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-green-600 hover:text-green-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
