"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Check, GraduationCap, Leaf, School, Shield, Users } from "lucide-react";
import { AuthOrDivider, GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { createClient } from "@/lib/supabase/client";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import "../globals.css";

const DARK = "#1A2F23";

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
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

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

  const stepProgress = accountType ? 66 : 33;

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <div
        className="relative hidden w-1/2 flex-col justify-between p-12 text-white lg:flex"
        style={{ background: DARK }}
      >
        <div>
          <p className="font-heading text-3xl font-extrabold leading-tight">Now in early access</p>
          <p className="mt-4 max-w-md text-base font-semibold text-white/80">
            Start your child&apos;s typing journey with planet-friendly lessons.
          </p>
          <div className="relative mt-8 overflow-hidden rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <Image
              src="/images/homepage/homepage-eco.jpg"
              alt="Eco learning with My Green Keys"
              width={520}
              height={340}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
          <ul className="mt-10 space-y-4 text-base font-semibold">
            <li className="flex items-center gap-3">
              <Check className="size-5 shrink-0 text-[#2ECC71]" strokeWidth={3} />
              Start free, no credit card
            </li>
            <li className="flex items-center gap-3">
              <Check className="size-5 shrink-0 text-[#2ECC71]" strokeWidth={3} />
              Cancel anytime
            </li>
            <li className="flex items-center gap-3">
              <Shield className="size-5 shrink-0 text-[#2ECC71]" />
              COPPA &amp; GDPR compliant
            </li>
          </ul>
        </div>
        <Link href="/login" className="text-sm font-bold text-[#2ECC71] hover:underline">
          Already have an account? Log In
        </Link>
      </div>

      <div className="flex w-full flex-col bg-white px-6 py-10 lg:w-1/2 lg:overflow-y-auto">
        <div className="mx-auto w-full max-w-xl">
        <div className="mb-6 flex justify-center lg:justify-start">
          <Leaf className="h-10 w-10 text-green-500" strokeWidth={2} aria-hidden />
        </div>
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-extrabold text-[#1A2F23]">Create your account</h1>
          <p className="mt-2 text-base font-semibold text-[#64748b]">Choose how you&apos;ll use My Green Keys</p>
        </div>

        {googleGateLoading ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              Finishing Google sign-in…
            </CardContent>
          </Card>
        ) : (
          <>
            {!oauthUser ? (
              <>
                <GoogleSignInButton
                  onClick={handleGoogleSignUp}
                  disabled={isLoading || googleLoading}
                />
                <AuthOrDivider pillClassName="bg-background" />
              </>
            ) : (
              <div
                className="mb-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary"
                role="status"
              >
                You&apos;re signed in with Google. Choose your account type and complete your profile — no password
                needed.
              </div>
            )}

            <div className="mb-8 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Step 1 · Account type</span>
                <span>Step 2 · Your details</span>
              </div>
              <Progress value={stepProgress} className="[&_[data-slot=progress-track]]:h-2" />
            </div>

        {errors.form ? (
          <div
            className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {errors.form}
          </div>
        ) : null}

        {successMessage ? (
          <div
            className="mb-6 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
            role="status"
          >
            {successMessage}
          </div>
        ) : null}

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(
            [
              { type: "student" as const, Icon: GraduationCap, label: "Student", desc: "I want to learn typing" },
              { type: "parent" as const, Icon: Users, label: "Parent", desc: "I want to track my child" },
              { type: "teacher" as const, Icon: School, label: "Teacher", desc: "I manage a classroom" },
            ] as const
          ).map((option) => (
            <Card
              key={option.type}
              role="button"
              tabIndex={0}
              onClick={() => handleAccountTypeSelect(option.type)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleAccountTypeSelect(option.type);
                }
              }}
              className={cn(
                "mgk-card-ds cursor-pointer border-2 border-transparent transition-shadow",
                googleGateLoading && "pointer-events-none opacity-50",
                accountType === option.type
                  ? "border-[#2ECC71] shadow-[0_4px_24px_rgba(0,0,0,0.08)] ring-2 ring-[#2ECC71]/25"
                  : "hover:border-[#2ECC71]/40"
              )}
            >
              <CardHeader className="relative pb-2 text-center">
                {accountType === option.type ? (
                  <span className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-[#2ECC71] text-sm text-white" aria-hidden>
                    ✓
                  </span>
                ) : null}
                <div className="flex justify-center text-green-600">
                  <option.Icon className="h-8 w-8" strokeWidth={2} aria-hidden />
                </div>
                <CardTitle className="font-heading text-sm">{option.label}</CardTitle>
                <CardDescription className="text-xs">{option.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {accountType ? (
          <form onSubmit={handleSubmit}>
            <Card className="border-border/80 shadow-md">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="font-heading text-lg">Your details</CardTitle>
                  <CardDescription>We&apos;ll set up your profile securely.</CardDescription>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {accountType}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-invalid={!!errors.fullName}
                    className={cn(errors.fullName && "border-destructive")}
                  />
                  {errors.fullName ? (
                    <p className="text-xs text-destructive">{errors.fullName}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading || !!oauthUser}
                    readOnly={!!oauthUser}
                    aria-invalid={!!errors.email}
                    className={cn(errors.email && "border-destructive")}
                  />
                  {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={cn(selectClassName, errors.gender && "border-destructive")}
                  >
                    <option value="">Select gender</option>
                    <option value="boy">Boy</option>
                    <option value="girl">Girl</option>
                  </select>
                  {errors.gender ? <p className="text-xs text-destructive">{errors.gender}</p> : null}
                </div>

                {accountType === "student" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <select
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={cn(selectClassName, errors.age && "border-destructive")}
                      >
                        <option value="">Select age</option>
                        {Array.from({ length: 15 }, (_, i) => i + 6).map((age) => (
                          <option key={age} value={age}>
                            {age} years old
                          </option>
                        ))}
                      </select>
                      {errors.age ? <p className="text-xs text-destructive">{errors.age}</p> : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        aria-invalid={!!errors.username}
                        className={cn(errors.username && "border-destructive")}
                      />
                      {errors.username ? (
                        <p className="text-xs text-destructive">{errors.username}</p>
                      ) : null}
                    </div>
                  </>
                ) : null}

                {accountType === "parent" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="childName">Child&apos;s Name</Label>
                      <Input
                        id="childName"
                        name="childName"
                        value={formData.childName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        aria-invalid={!!errors.childName}
                        className={cn(errors.childName && "border-destructive")}
                      />
                      {errors.childName ? (
                        <p className="text-xs text-destructive">{errors.childName}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="childAge">Child&apos;s Age</Label>
                      <select
                        id="childAge"
                        name="childAge"
                        value={formData.childAge}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={cn(selectClassName, errors.childAge && "border-destructive")}
                      >
                        <option value="">Select age</option>
                        {Array.from({ length: 15 }, (_, i) => i + 6).map((age) => (
                          <option key={age} value={age}>
                            {age} years old
                          </option>
                        ))}
                      </select>
                      {errors.childAge ? (
                        <p className="text-xs text-destructive">{errors.childAge}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="childGender">Child&apos;s Gender</Label>
                      <select
                        id="childGender"
                        name="childGender"
                        value={formData.childGender}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={cn(selectClassName, errors.childGender && "border-destructive")}
                      >
                        <option value="">Select gender</option>
                        <option value="boy">Boy</option>
                        <option value="girl">Girl</option>
                      </select>
                      {errors.childGender ? (
                        <p className="text-xs text-destructive">{errors.childGender}</p>
                      ) : null}
                    </div>
                  </>
                ) : null}

                {accountType === "teacher" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input
                        id="schoolName"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        aria-invalid={!!errors.schoolName}
                        className={cn(errors.schoolName && "border-destructive")}
                      />
                      {errors.schoolName ? (
                        <p className="text-xs text-destructive">{errors.schoolName}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numStudents">Number of Students</Label>
                      <Input
                        id="numStudents"
                        type="number"
                        name="numStudents"
                        value={formData.numStudents}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        aria-invalid={!!errors.numStudents}
                        className={cn(errors.numStudents && "border-destructive")}
                      />
                      {errors.numStudents ? (
                        <p className="text-xs text-destructive">{errors.numStudents}</p>
                      ) : null}
                    </div>
                  </>
                ) : null}

                {!oauthUser ? (
                  <>
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
                          aria-invalid={!!errors.password}
                          className={cn("pr-10", errors.password && "border-destructive")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                          {passwordVisible ? "Hide" : "Show"}
                        </Button>
                      </div>
                      {errors.password ? (
                        <p className="text-xs text-destructive">{errors.password}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={confirmPasswordVisible ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          disabled={isLoading}
                          aria-invalid={!!errors.confirmPassword}
                          className={cn("pr-14", errors.confirmPassword && "border-destructive")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 px-2 text-muted-foreground"
                          onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                        >
                          {confirmPasswordVisible ? "Hide" : "Show"}
                        </Button>
                      </div>
                      {errors.confirmPassword ? (
                        <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                      ) : null}
                    </div>
                  </>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                  <Input
                    id="promoCode"
                    name="promoCode"
                    value={formData.promoCode}
                    onChange={handlePromoCodeChange}
                    disabled={isLoading}
                    placeholder="Enter promo code"
                  />
                  {promoStatus ? (
                    <p
                      className={cn(
                        "text-xs",
                        promoStatus.valid ? "text-primary" : "text-destructive"
                      )}
                    >
                      {promoStatus.message}
                    </p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  className="h-[52px] w-full rounded-[50px] bg-[#2ECC71] text-base font-extrabold text-white hover:bg-[#27ae60]"
                  disabled={isLoading || googleLoading}
                >
                  {isLoading
                    ? oauthUser
                      ? "Saving profile…"
                      : "Creating Account…"
                    : oauthUser
                      ? "Complete profile"
                      : "Create Account"}
                </Button>
                <p className="text-center text-xs font-semibold leading-relaxed text-[#64748b]">
                  By creating an account you agree to our{" "}
                  <Link href="/terms" className="text-[#2ECC71] hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[#2ECC71] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>

            <p className="mt-6 text-center text-sm font-semibold text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#2ECC71] hover:underline">
                Log in here
              </Link>
            </p>
          </form>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Select an account type above to continue
            </CardContent>
          </Card>
        )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
