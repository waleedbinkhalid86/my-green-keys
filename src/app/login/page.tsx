"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import "../globals.css";

const LOGIN_TIMEOUT_MS = 10_000;
const LOGIN_TIMEOUT_MESSAGE =
  "Connection timeout. Please try again or contact support.";

type AccountType = "student" | "parent" | "teacher";

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
  const code = "code" in error && typeof (error as { code?: string }).code === "string"
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
      style={{
        background: "#ffebee",
        border: "1px solid #ef5350",
        color: "#c62828",
        padding: "12px 16px",
        borderRadius: "8px",
        marginBottom: "16px",
        fontSize: "14px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {message}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("student");
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
          router.push(redirectPath);
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
    <div style={{ background: "white", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>
      {/* NAV BAR */}
      <nav
        style={{
          background: "#2c3e50",
          color: "white",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "#4CAF50",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            🌿
          </div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem" }}>
            My Green Keys
          </span>
        </div>

        <a
          href="/signup"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Don't have an account? Sign Up
        </a>
      </nav>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 800,
            color: "#2c3e50",
            textAlign: "center",
            marginBottom: "12px",
          }}
        >
          Log In
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#666",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          Welcome back to My Green Keys
        </p>

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: "white",
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
              padding: "32px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
          >
            <FormErrorBanner message={errors.form ?? ""} />
            {/* EMAIL FIELD */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#2c3e50",
                  marginBottom: "8px",
                }}
              >
                Email
              </label>
              <input
                type="email"
                name="emailOrUsername"
                value={formData.emailOrUsername}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Enter your email"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "14px",
                  border: errors.emailOrUsername
                    ? "2px solid #f44336"
                    : "2px solid #e0e0e0",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border 0.2s ease",
                  boxSizing: "border-box",
                  opacity: isLoading ? 0.6 : 1,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4CAF50";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.emailOrUsername
                    ? "#f44336"
                    : "#e0e0e0";
                }}
              />
              {errors.emailOrUsername && (
                <div style={{ fontSize: "12px", color: "#f44336", marginTop: "4px" }}>
                  {errors.emailOrUsername}
                </div>
              )}
            </div>

            {/* PASSWORD FIELD */}
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#2c3e50",
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "14px",
                    border: errors.password
                      ? "2px solid #f44336"
                      : "2px solid #e0e0e0",
                    borderRadius: "8px",
                    outline: "none",
                    transition: "border 0.2s ease",
                    boxSizing: "border-box",
                    paddingRight: "40px",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#4CAF50";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.password
                      ? "#f44336"
                      : "#e0e0e0";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#999",
                  }}
                >
                  {passwordVisible ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.password && (
                <div style={{ fontSize: "12px", color: "#f44336", marginTop: "4px" }}>
                  {errors.password}
                </div>
              )}
            </div>

            {/* FORGOT PASSWORD & REMEMBER ME */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
                fontSize: "14px",
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <span style={{ color: "#666" }}>Remember me</span>
              </label>
              <a
                href="#"
                style={{
                  color: "#4CAF50",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                Forgot password?
              </a>
            </div>

            <FormErrorBanner message={errors.form ?? ""} />

            {/* LOG IN BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px",
                background: isLoading ? "#bbb" : "#4CAF50",
                color: "white",
                fontSize: "16px",
                fontWeight: 700,
                border: "none",
                borderRadius: "8px",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "background 0.2s ease",
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = "#45a049";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = "#4CAF50";
                }
              }}
            >
              {isLoading ? "Logging In..." : "Log In"}
            </button>
          </div>

          {/* SIGN UP LINK */}
          <div
            style={{
              textAlign: "center",
              marginTop: "24px",
              fontSize: "14px",
              color: "#666",
            }}
          >
            Don't have an account?{" "}
            <a
              href="/signup"
              style={{
                color: "#4CAF50",
                fontWeight: 700,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Sign up here
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
