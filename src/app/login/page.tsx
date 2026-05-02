"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { BookOpen, Leaf, Sparkles, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthOrDivider, GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "../globals.css";

const LOGIN_TIMEOUT_MS = 10_000;
const LOGIN_TIMEOUT_MESSAGE = "Connection timeout. Please try again or contact support.";
const DARK = "#1A2F23";

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

function FormErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="polite"
      className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm whitespace-pre-wrap break-words text-destructive"
    >
      {message}
    </div>
  );
}

export default function LoginPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<LoginForm>({
    emailOrUsername: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const err = new URLSearchParams(window.location.search).get("error");
    if (err) {
      const decoded = decodeURIComponent(err);
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

  return (
    <div className="flex min-h-screen font-sans">
      <div
        className="relative hidden w-1/2 flex-col justify-between p-12 text-white lg:flex"
        style={{ background: DARK }}
      >
        <div>
          <Link href="/" className="flex items-center gap-3 text-white no-underline">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#2ECC71] text-2xl">🌿</div>
            <span className="font-heading text-2xl font-extrabold tracking-tight">My Green Keys</span>
          </Link>
          <p className="mt-10 max-w-md text-2xl font-extrabold leading-tight" style={{ fontFamily: "var(--font-nunito)" }}>
            Learn to Type. Help the Planet.
          </p>
          <div className="relative mt-10 overflow-hidden rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <Image
              src="/images/homepage/homepage-kids.jpg"
              alt="Children learning with My Green Keys"
              width={520}
              height={340}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
          <ul className="mt-10 space-y-4 text-base font-semibold">
            <li className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-white/10">
                <BookOpen className="size-5" />
              </span>
              100 typing lessons
            </li>
            <li className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-white/10">
                <Sparkles className="size-5" />
              </span>
              Virtual pet companion
            </li>
            <li className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-white/10">
                <Leaf className="size-5" />
              </span>
              Real eco rewards
            </li>
          </ul>
        </div>
        <p className="max-w-md text-sm italic leading-relaxed text-white/75">
          &ldquo;My kids ask to practice typing every day. The eco stories are a brilliant touch.&rdquo;
        </p>
      </div>

      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-[400px]">
          <h1 className="font-heading text-[28px] font-extrabold text-[#1A2F23]">Welcome back!</h1>
          <p className="mt-2 text-base font-semibold text-[#64748b]">Sign in to continue your eco journey</p>

          <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
            <FormErrorBanner message={errors.form ?? ""} />

            <GoogleSignInButton onClick={handleGoogleSignIn} disabled={isLoading || googleLoading} />
            <AuthOrDivider />

            <div className="space-y-2">
              <Label htmlFor="emailOrUsername">Email</Label>
              <Input
                id="emailOrUsername"
                type="email"
                name="emailOrUsername"
                value={formData.emailOrUsername}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="you@example.com"
                aria-invalid={!!errors.emailOrUsername}
                className={cn("h-[52px] rounded-xl px-4 text-base", errors.emailOrUsername && "border-destructive")}
              />
              {errors.emailOrUsername ? <p className="text-xs text-destructive">{errors.emailOrUsername}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  className={cn("h-[52px] rounded-xl pr-12 text-base", errors.password && "border-destructive")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  {passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
              {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
            </div>

            <div className="flex items-center justify-between gap-3 text-sm font-semibold">
              <label className="flex cursor-pointer items-center gap-2 text-[#64748b]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-input accent-[#2ECC71]"
                />
                Remember me
              </label>
              <a href="#" className="text-[#2ECC71] hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="h-[52px] w-full rounded-[50px] bg-[#2ECC71] text-base font-extrabold text-white hover:bg-[#27ae60]"
              disabled={isLoading || googleLoading}
            >
              {isLoading ? "Logging In…" : "Log In"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm font-semibold text-[#64748b]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#2ECC71] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
