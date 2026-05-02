"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "../globals.css";

const LOGIN_TIMEOUT_MS = 10_000;
const LOGIN_TIMEOUT_MESSAGE =
  "Connection timeout. Please try again or contact support.";

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
      className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm whitespace-pre-wrap break-words text-destructive"
    >
      {message}
    </div>
  );
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>({
    emailOrUsername: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
          console.log("Starting login...");
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
            console.log("Supabase response:", signInThrown, null);
            setErrors({ form: formatUnknownError(signInThrown) });
            return;
          }

          console.log("Supabase response:", authError, authData);

          if (authError) {
            setErrors({ form: formatAuthError(authError) });
            return;
          }

          if (!authData?.user) {
            setErrors({ form: "Sign-in succeeded but no user was returned." });
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
            console.log("Profile fetch response:", profileThrown, null);
            setErrors({ form: formatUnknownError(profileThrown) });
            return;
          }

          console.log("Profile fetch response:", profileError, profile);

          if (profileError) {
            setErrors({ form: formatPostgrestError(profileError) });
            return;
          }

          if (!profile) {
            setErrors({ form: "No profile row found for this user." });
            return;
          }

          const accountTypeRedirectMap: Record<string, string> = {
            student: "/lesson",
            parent: "/dashboard/parent",
            teacher: "/dashboard/teacher",
          };

          const redirectPath = accountTypeRedirectMap[profile.account_type] || "/lesson";
          console.log("Redirecting to:", redirectPath);
          window.location.href = redirectPath;
        })(),
        LOGIN_TIMEOUT_MS,
        LOGIN_TIMEOUT_MESSAGE
      );
    } catch (error) {
      setErrors({ form: formatUnknownError(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="flex items-center justify-between border-b border-white/10 bg-[var(--mgk-dark)] px-6 py-4 shadow-sm">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-lg">
            🌿
          </div>
          <span className="font-heading text-base font-bold text-white">My Green Keys</span>
        </Link>
        <Link href="/signup" className="text-sm font-semibold text-white/90 hover:text-primary">
          Don&apos;t have an account? Sign Up
        </Link>
      </nav>

      <div className="mx-auto max-w-md px-6 py-14">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground">Log In</h1>
          <p className="mt-2 text-muted-foreground">Welcome back to My Green Keys</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Sign in</CardTitle>
              <CardDescription>Use the email and password for your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormErrorBanner message={errors.form ?? ""} />

              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">Email</Label>
                <Input
                  id="emailOrUsername"
                  type="email"
                  name="emailOrUsername"
                  value={formData.emailOrUsername}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="Enter your email"
                  aria-invalid={!!errors.emailOrUsername}
                  className={cn(errors.emailOrUsername && "border-destructive")}
                />
                {errors.emailOrUsername ? (
                  <p className="text-xs text-destructive">{errors.emailOrUsername}</p>
                ) : null}
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
                    placeholder="Enter your password"
                    aria-invalid={!!errors.password}
                    className={cn("pr-10", errors.password && "border-destructive")}
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
                {errors.password ? (
                  <p className="text-xs text-destructive">{errors.password}</p>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-4 rounded border-input accent-primary"
                  />
                  Remember me
                </label>
                <a href="#" className="font-semibold text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Logging In…" : "Log In"}
              </Button>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
