"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { GraduationCap, Leaf, School, Users } from "lucide-react";
import { AuthOrDivider, GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { MinimalAuthShell } from "@/components/auth/MinimalAuthShell";
import { createClient } from "@/lib/supabase/client";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type AccountType = "student" | "parent" | "teacher" | null;

interface FormData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  age: string;
  gender: string;
  childName: string;
  childAge: string;
  childGender: string;
  schoolName: string;
  numStudents: string;
  promoCode: string;
}

const VALID_PROMO_CODES: Record<string, { discount: string; message: string; discountPercent: number }> = {
  GREENSTART: { discount: "30%", message: "30% off applied!", discountPercent: 30 },
  FAMILY2024: { discount: "2 months", message: "2 months free applied!", discountPercent: 0 },
  SCHOOL100: { discount: "20%", message: "20% off school package applied!", discountPercent: 20 },
  BACK2SCHOOL: { discount: "50%", message: "50% off applied!", discountPercent: 50 },
};

const selectClassName =
  "flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-green-600 focus:ring-1 focus:ring-green-600 disabled:cursor-not-allowed disabled:opacity-50";

export default function SignupPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    childName: "",
    childAge: "",
    childGender: "",
    schoolName: "",
    numStudents: "",
    promoCode: "",
  });
  const [promoStatus, setPromoStatus] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [oauthUser, setOauthUser] = useState<User | null>(null);
  const [googleGateLoading, setGoogleGateLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const googleParam = new URLSearchParams(window.location.search).get("google") === "true";
    if (!googleParam) return;

    let cancelled = false;
    setGoogleGateLoading(true);

    (async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error || !user) {
        router.replace("/login");
        setGoogleGateLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profile?.account_type) {
        const accountTypeRedirectMap: Record<string, string> = {
          student: "/lesson",
          parent: "/dashboard/parent",
          teacher: "/dashboard/teacher",
        };
        router.replace(accountTypeRedirectMap[profile.account_type] || "/lesson");
        return;
      }

      setOauthUser(user);
      setFormData((prev) => ({
        ...prev,
        email: user.email ?? "",
        fullName:
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          prev.fullName,
      }));
      setGoogleGateLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setErrors((prev) => ({ ...prev, form: "" }));
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setErrors({ form: error.message });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Google sign-in failed";
      setErrors({ form: message });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setErrors({});
    setPromoStatus(null);
    setSuccessMessage("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setFormData((prev) => ({
      ...prev,
      promoCode: code,
    }));

    if (code.length === 0) {
      setPromoStatus(null);
    } else if (VALID_PROMO_CODES[code]) {
      setPromoStatus({
        valid: true,
        message: VALID_PROMO_CODES[code].message,
      });
    } else if (code.length > 0) {
      setPromoStatus({
        valid: false,
        message: "Invalid promo code",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!oauthUser) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (accountType === "student") {
      if (!formData.username.trim()) {
        newErrors.username = "Username is required";
      }
      if (!formData.age || parseInt(formData.age) < 6) {
        newErrors.age = "Age must be at least 6";
      }
      if (!formData.gender) {
        newErrors.gender = "Please select your gender";
      }
    } else if (accountType === "parent") {
      if (!formData.childName.trim()) {
        newErrors.childName = "Child's name is required";
      }
      if (!formData.childAge || parseInt(formData.childAge) < 6) {
        newErrors.childAge = "Child's age must be at least 6";
      }
      if (!formData.childGender) {
        newErrors.childGender = "Please select child's gender";
      }
      if (!formData.gender) {
        newErrors.gender = "Please select your gender";
      }
    } else if (accountType === "teacher") {
      if (!formData.schoolName.trim()) {
        newErrors.schoolName = "School name is required";
      }
      if (!formData.numStudents || parseInt(formData.numStudents) < 1) {
        newErrors.numStudents = "Number of students must be at least 1";
      }
      if (!formData.gender) {
        newErrors.gender = "Please select your gender";
      }
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
    setSuccessMessage("");
    setErrors((prev) => ({ ...prev, form: "" }));

    try {
      const { supabaseUrl } = getSupabasePublicEnv();
      const supabase = createClient();

      console.log("[signup] supabaseUrl =", supabaseUrl);

      let userId: string;

      if (oauthUser) {
        userId = oauthUser.id;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (authError) {
          if (authError.message.includes("already registered")) {
            setErrors({ email: "This email is already registered. Please log in instead." });
          } else {
            setErrors({ form: authError.message });
          }
          setIsLoading(false);
          return;
        }

        if (!authData.user) {
          setErrors({ form: "Failed to create account" });
          setIsLoading(false);
          return;
        }

        userId = authData.user.id;
      }

      const profileData: Record<string, unknown> = {
        id: userId,
        full_name: formData.fullName,
        email: formData.email,
        account_type: accountType,
        gender: formData.gender,
      };

      if (accountType === "student") {
        Object.assign(profileData, { age: parseInt(formData.age) });
      } else if (accountType === "parent") {
        Object.assign(profileData, { age: parseInt(formData.age) });
      } else if (accountType === "teacher") {
        Object.assign(profileData, { school_name: formData.schoolName });
      }

      const { error: profileError } = await supabase.from("profiles").insert([profileData]);

      if (profileError) {
        setErrors({ form: "Failed to create profile: " + profileError.message });
        setIsLoading(false);
        return;
      }

      const discountPercent =
        formData.promoCode && VALID_PROMO_CODES[formData.promoCode]
          ? VALID_PROMO_CODES[formData.promoCode].discountPercent
          : 0;

      const { error: subscriptionError } = await supabase.from("subscriptions").insert([
        {
          user_id: userId,
          plan_type: "free",
          status: "active",
          promo_code: formData.promoCode || null,
          discount_percent: discountPercent,
        },
      ]);

      if (subscriptionError) {
        console.error("Subscription creation warning:", subscriptionError);
      }

      if (accountType === "parent") {
        const { error: childError } = await supabase.from("children").insert([
          {
            parent_id: userId,
            full_name: formData.childName,
            age: parseInt(formData.childAge),
            gender: formData.childGender,
          },
        ]);

        if (childError) {
          console.error("Child creation warning:", childError);
        }
      }

      setSuccessMessage("Account created successfully! Redirecting you to your dashboard...");
      showToast("success", "Account created! Redirecting…");

      setTimeout(() => {
        const redirectPath =
          {
            student: "/lesson",
            parent: "/dashboard/parent",
            teacher: "/dashboard/teacher",
          }[accountType!] || "/lesson";

        router.push(redirectPath);
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";

      const isNetworkishFetchFailure =
        error instanceof TypeError && /fetch/i.test(error.message);

      const errMsg = isNetworkishFetchFailure
        ? "Couldn't reach Supabase (network error). Double-check NEXT_PUBLIC_SUPABASE_URL, your internet connection, and that your Supabase project is reachable."
        : message;
      setErrors({ form: errMsg });
      showToast("error", errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName = cn(
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400",
    "focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600",
    "disabled:cursor-not-allowed disabled:opacity-50"
  );

  return (
    <MinimalAuthShell
      title="Create your account"
      subtitle="Choose how you’ll use My Green Keys"
      sideImageSrc="/images/ui/ui-onboarding.jpg.jpg"
      sideImageAlt="Welcome illustration"
      sideTitle="Welcome to My Green Keys"
      sideSubtitle="Learn typing, earn eco points, and grow your progress."
    >
      {googleGateLoading ? (
        <div className="text-center text-sm text-gray-500">Finishing Google sign-in…</div>
      ) : (
        <>
          {!oauthUser ? (
            <>
              <GoogleSignInButton onClick={handleGoogleSignUp} disabled={isLoading || googleLoading} />
              <AuthOrDivider />
            </>
          ) : (
            <div className="mb-6 rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
              You&apos;re signed in with Google. Choose your account type and complete your profile — no password needed.
            </div>
          )}

          {errors.form ? (
            <p className="mb-4 whitespace-pre-wrap break-words text-xs text-red-600" role="alert">
              {errors.form}
            </p>
          ) : null}

          {successMessage ? (
            <p className="mb-4 text-xs text-green-700" role="status">
              {successMessage}
            </p>
          ) : null}

          <div className="mb-8 space-y-2">
            <p className="text-xs font-medium text-gray-700">Account type</p>
            <div className="space-y-2">
              {[
                { type: "student" as const, Icon: GraduationCap, label: "Student", desc: "I want to learn typing" },
                { type: "parent" as const, Icon: Users, label: "Parent", desc: "I want to track my child" },
                { type: "teacher" as const, Icon: School, label: "Teacher", desc: "I manage a classroom" },
              ].map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => handleAccountTypeSelect(option.type)}
                  disabled={googleGateLoading}
                  className={cn(
                    "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-left transition-colors hover:bg-gray-50",
                    "disabled:pointer-events-none disabled:opacity-60",
                    accountType === option.type && "border-green-600 ring-1 ring-green-600"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <option.Icon className="mt-0.5 h-4 w-4 text-green-600" aria-hidden />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {accountType ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="mb-1.5 block text-xs font-medium text-gray-700">
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  aria-invalid={!!errors.fullName}
                  className={cn(
                    inputClassName,
                    errors.fullName && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.fullName ? <p className="mt-1 text-xs text-red-600">{errors.fullName}</p> : null}
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading || !!oauthUser}
                  readOnly={!!oauthUser}
                  aria-invalid={!!errors.email}
                  placeholder="you@example.com"
                  className={cn(
                    inputClassName,
                    errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
              </div>

              <div>
                <label htmlFor="gender" className="mb-1.5 block text-xs font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={cn(selectClassName, errors.gender && "border-red-500 focus:border-red-500 focus:ring-red-500")}
                >
                  <option value="">Select gender</option>
                  <option value="boy">Boy</option>
                  <option value="girl">Girl</option>
                </select>
                {errors.gender ? <p className="mt-1 text-xs text-red-600">{errors.gender}</p> : null}
              </div>

              {accountType === "student" ? (
                <>
                  <div>
                    <label htmlFor="age" className="mb-1.5 block text-xs font-medium text-gray-700">
                      Age
                    </label>
                    <select
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={cn(selectClassName, errors.age && "border-red-500 focus:border-red-500 focus:ring-red-500")}
                    >
                      <option value="">Select age</option>
                      {Array.from({ length: 15 }, (_, i) => i + 6).map((age) => (
                        <option key={age} value={age}>
                          {age} years old
                        </option>
                      ))}
                    </select>
                    {errors.age ? <p className="mt-1 text-xs text-red-600">{errors.age}</p> : null}
                  </div>

                  <div>
                    <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      aria-invalid={!!errors.username}
                      className={cn(
                        inputClassName,
                        errors.username && "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                    />
                    {errors.username ? <p className="mt-1 text-xs text-red-600">{errors.username}</p> : null}
                  </div>
                </>
              ) : null}

              {accountType === "parent" ? (
                <>
                  <div>
                    <label htmlFor="childName" className="mb-1.5 block text-xs font-medium text-gray-700">
                      Child’s name
                    </label>
                    <input
                      id="childName"
                      name="childName"
                      value={formData.childName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      aria-invalid={!!errors.childName}
                      className={cn(
                        inputClassName,
                        errors.childName && "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                    />
                    {errors.childName ? <p className="mt-1 text-xs text-red-600">{errors.childName}</p> : null}
                  </div>

                  <div>
                    <label htmlFor="childAge" className="mb-1.5 block text-xs font-medium text-gray-700">
                      Child’s age
                    </label>
                    <select
                      id="childAge"
                      name="childAge"
                      value={formData.childAge}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={cn(
                        selectClassName,
                        errors.childAge && "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                    >
                      <option value="">Select age</option>
                      {Array.from({ length: 15 }, (_, i) => i + 6).map((age) => (
                        <option key={age} value={age}>
                          {age} years old
                        </option>
                      ))}
                    </select>
                    {errors.childAge ? <p className="mt-1 text-xs text-red-600">{errors.childAge}</p> : null}
                  </div>

                  <div>
                    <label htmlFor="childGender" className="mb-1.5 block text-xs font-medium text-gray-700">
                      Child’s gender
                    </label>
                    <select
                      id="childGender"
                      name="childGender"
                      value={formData.childGender}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={cn(
                        selectClassName,
                        errors.childGender && "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                    >
                      <option value="">Select gender</option>
                      <option value="boy">Boy</option>
                      <option value="girl">Girl</option>
                    </select>
                    {errors.childGender ? <p className="mt-1 text-xs text-red-600">{errors.childGender}</p> : null}
                  </div>
                </>
              ) : null}

              {accountType === "teacher" ? (
                <>
                  <div>
                    <label htmlFor="schoolName" className="mb-1.5 block text-xs font-medium text-gray-700">
                      School name
                    </label>
                    <input
                      id="schoolName"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      aria-invalid={!!errors.schoolName}
                      className={cn(
                        inputClassName,
                        errors.schoolName && "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                    />
                    {errors.schoolName ? <p className="mt-1 text-xs text-red-600">{errors.schoolName}</p> : null}
                  </div>

                  <div>
                    <label htmlFor="numStudents" className="mb-1.5 block text-xs font-medium text-gray-700">
                      Number of students
                    </label>
                    <input
                      id="numStudents"
                      type="number"
                      name="numStudents"
                      value={formData.numStudents}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      aria-invalid={!!errors.numStudents}
                      className={cn(
                        inputClassName,
                        errors.numStudents && "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                    />
                    {errors.numStudents ? <p className="mt-1 text-xs text-red-600">{errors.numStudents}</p> : null}
                  </div>
                </>
              ) : null}

              {!oauthUser ? (
                <>
                  <div>
                    <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={passwordVisible ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        aria-invalid={!!errors.password}
                        className={cn(
                          inputClassName,
                          "pr-14",
                          errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-700"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? "Hide" : "Show"}
                      </button>
                    </div>
                    {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password}</p> : null}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium text-gray-700">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={confirmPasswordVisible ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        aria-invalid={!!errors.confirmPassword}
                        className={cn(
                          inputClassName,
                          "pr-14",
                          errors.confirmPassword && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-700"
                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      >
                        {confirmPasswordVisible ? "Hide" : "Show"}
                      </button>
                    </div>
                    {errors.confirmPassword ? (
                      <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                    ) : null}
                  </div>
                </>
              ) : null}

              <div>
                <label htmlFor="promoCode" className="mb-1.5 block text-xs font-medium text-gray-700">
                  Promo code (optional)
                </label>
                <input
                  id="promoCode"
                  name="promoCode"
                  value={formData.promoCode}
                  onChange={handlePromoCodeChange}
                  disabled={isLoading}
                  placeholder="Enter promo code"
                  className={inputClassName}
                />
                {promoStatus ? (
                  <p className={cn("mt-1 text-xs", promoStatus.valid ? "text-green-700" : "text-red-600")}>
                    {promoStatus.message}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading || googleLoading}
              >
                {isLoading
                  ? oauthUser
                    ? "Saving profile…"
                    : "Creating account…"
                  : oauthUser
                    ? "Complete profile"
                    : "Create account"}
              </button>

              <p className="text-center text-xs leading-relaxed text-gray-500">
                By creating an account you agree to our{" "}
                <Link href="/terms" className="font-medium text-gray-900 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-gray-900 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              <p className="pt-2 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-gray-900 hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          ) : (
            <p className="text-sm text-gray-500">Select an account type above to continue.</p>
          )}
        </>
      )}
    </MinimalAuthShell>
  );
}
