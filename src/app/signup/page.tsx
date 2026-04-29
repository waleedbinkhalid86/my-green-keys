"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "../globals.css";

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

export default function SignupPage() {
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

  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setErrors({});
    setPromoStatus(null);
    setSuccessMessage("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
        message: `✅ ${VALID_PROMO_CODES[code].message}`,
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

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

    try {
      const supabase = createClient();

      // Sign up with Supabase Auth
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

      // Create profile in database
      const profileData = {
        id: authData.user.id,
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

      const { error: profileError } = await supabase
        .from("profiles")
        .insert([profileData]);

      if (profileError) {
        setErrors({ form: "Failed to create profile: " + profileError.message });
        setIsLoading(false);
        return;
      }

      // Create subscription for new user
      const discountPercent = formData.promoCode && VALID_PROMO_CODES[formData.promoCode]
        ? VALID_PROMO_CODES[formData.promoCode].discountPercent
        : 0;

      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert([
          {
            user_id: authData.user.id,
            plan_type: "free",
            status: "active",
            promo_code: formData.promoCode || null,
            discount_percent: discountPercent,
          },
        ]);

      if (subscriptionError) {
        console.error("Subscription creation warning:", subscriptionError);
        // Don't fail the signup if subscription fails
      }

      // Create child record if parent
      if (accountType === "parent") {
        const { error: childError } = await supabase
          .from("children")
          .insert([
            {
              parent_id: authData.user.id,
              full_name: formData.childName,
              age: parseInt(formData.childAge),
              gender: formData.childGender,
            },
          ]);

        if (childError) {
          console.error("Child creation warning:", childError);
          // Don't fail the signup if child creation fails
        }
      }

      setSuccessMessage(
        "Account created successfully! Redirecting you to your dashboard..."
      );

      // Redirect based on account type
      setTimeout(() => {
        const redirectPath = {
          student: "/lesson",
          parent: "/dashboard/parent",
          teacher: "/dashboard/teacher",
        }[accountType!] || "/lesson";
        
        router.push(redirectPath);
      }, 2000);
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "An unexpected error occurred",
      });
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
          href="/login"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Already have an account? Log In
        </a>
      </nav>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 800,
            color: "#2c3e50",
            textAlign: "center",
            marginBottom: "12px",
          }}
        >
          Create Your Account
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#666",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          Choose your account type to get started
        </p>

        {/* ERROR MESSAGE */}
        {errors.form && (
          <div
            style={{
              background: "#ffebee",
              border: "1px solid #ef5350",
              color: "#c62828",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "14px",
            }}
          >
            {errors.form}
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div
            style={{
              background: "#e8f5e9",
              border: "1px solid #4caf50",
              color: "#2e7d32",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "14px",
            }}
          >
            {successMessage}
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          {[
            { type: "student" as const, icon: "👦", label: "Student", desc: "I want to learn typing" },
            { type: "parent" as const, icon: "👨‍👩‍👧", label: "Parent", desc: "I want to track my child" },
            { type: "teacher" as const, icon: "👩‍🏫", label: "Teacher/School", desc: "I manage a classroom" },
          ].map((option) => (
            <div
              key={option.type}
              onClick={() => handleAccountTypeSelect(option.type)}
              style={{
                padding: "20px",
                borderRadius: "12px",
                border:
                  accountType === option.type
                    ? "2px solid #4CAF50"
                    : "2px solid #e0e0e0",
                background:
                  accountType === option.type
                    ? "#E8F5E9"
                    : "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow:
                  accountType === option.type
                    ? "0 4px 24px rgba(76, 175, 80, 0.1)"
                    : "0 4px 24px rgba(0, 0, 0, 0.08)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                {option.icon}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#2c3e50",
                  marginBottom: "4px",
                }}
              >
                {option.label}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#999",
                }}
              >
                {option.desc}
              </div>
            </div>
          ))}
        </div>

        {/* FORM */}
        {accountType && (
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
              {/* FULL NAME */}
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
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "14px",
                    border: errors.fullName
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
                    e.target.style.borderColor = errors.fullName
                      ? "#f44336"
                      : "#e0e0e0";
                  }}
                />
                {errors.fullName && (
                  <div style={{ fontSize: "12px", color: "#f44336", marginTop: "4px" }}>
                    {errors.fullName}
                  </div>
                )}
              </div>

              {/* EMAIL */}
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
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "14px",
                    border: errors.email
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
                    e.target.style.borderColor = errors.email
                      ? "#f44336"
                      : "#e0e0e0";
                  }}
                />
                {errors.email && (
                  <div style={{ fontSize: "12px", color: "#f44336", marginTop: "4px" }}>
                    {errors.email}
                  </div>
                )}
              </div>

              {/* GENDER */}
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
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "14px",
                    border: errors.gender
                      ? "2px solid #f44336"
                      : "2px solid #e0e0e0",
                    borderRadius: "8px",
                    outline: "none",
                    transition: "border 0.2s ease",
                    boxSizing: "border-box",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  <option value="">Select gender</option>
                  <option value="boy">Boy</option>
                  <option value="girl">Girl</option>
                </select>
                {errors.gender && (
                  <div style={{ fontSize: "12px", color: "#f44336", marginTop: "4px" }}>
                    {errors.gender}
                  </div>
                )}
              </div>

              {/* STUDENT ACCOUNT FIELDS */}
              {accountType === "student" && (
                <>
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
                      Age
                    </label>
                    <select
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "14px",
                        border: errors.age
                          ? "2px solid #f44336"
                          : "2px solid #e0e0e0",
                        borderRadius: "8px",
                        outline: "none",
                        transition: "border 0.2s ease",
                        boxSizing: "border-box",
                        opacity: isLoading ? 0.6 : 1,
                      }}
                    >
                      <option value="">Select age</option>
                      {Array.from({ length: 15 }, (_, i) => i + 6).map((age) => (
                        <option key={age} value={age}>
                          {age} years old
                        </option>
                      ))}
                    </select>
                    {errors.age && (
                      <div style={{ fontSize: "12px", color: "#f44336", marginTop: "4px" }}>
                        {errors.age}
                      </div>
                    )}
                  </div>

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
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "14px",
                        border: errors.username
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
                        e.target.style.borderColor = errors.username
                          ? "#f44336"
                          : "#e0e0e0";
                      }}
                    />
                    {errors.username && (
                      <div style={{ fontSize: "12px", color: "#f44336", marginTop: "4px" }}>
                        {errors.username}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* PARENT ACCOUNT FIELDS */}
              {accountType === "parent" && (
                <>
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
                      Child's Name
                    </label>
                    <input
                      type="text"
                      name="childName"
                      value={formData.childName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "14px",
                        border: errors.childName
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
                        e.target.style.borderColor = errors.childName
                          ? "#f44336"
                          : "#e0e0e0";
                      }}
                    />
                    {errors.childName && (
                      <div style={{ fontSize: "12px", color: "#f44336", marginTop: "4px" }}>
                        {errors.childName}
                      </div>
                    )}
                  </div>

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
                      Child's Age
                    </label>
                    <select
                      name="childAge"
                      value={formData.childAge}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "14px",
                        border: errors.childAge
                          ? "2px solid #f44336"
                          : "2px solid #e0e0e0",
                        borderRadius: "8px",
                        outline: "none",
                        transition: "border 0.2s ease",
                        boxSizing: "border-box",
                        opacity: isLoading ? 0.6 : 1,
                      }}
                    >
                      <option value="">Select age</option>
                      {Array.from({ length: 15 }, (_, i) => i + 6).map((age) => (
                        <option key={age} value={age}>
                          {age} years old
                        </option>
                      ))}
                    </select>
                    {errors.childAge && (
                      <div style={{ fontSize: "12px", color: "#f44336", marginTop: "4px" }}>
                        {errors.childAge}
                      </div>
                    )}
                  </div>

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
                      Child's Gender
                    </label>
                    <select
                      name="childGender"
                      value={formData.childGender}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "14px",
                        border: errors.childGender
                          ? "2px solid #f44336"
                          : "2px solid #e0e0e0",
                        borderRadius: "8px",
                        outline: "none",
                        transition: "border 0.2s ease",
                        boxSizing: "border-box",
                        opacity: isLoading ? 0.6 : 1,
                      }}
                    >
                      <option value="">Select gender</option>
                      <option value="boy">Boy</option>
                      <option value="girl">Girl</option>
                    </select>
                    {errors.childGender && (
                      <div style={{ fontSize: "12px", color: "#f44336", marginTop: "4px" }}>
                        {errors.childGender}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TEACHER ACCOUNT FIELDS */}
              {accountType === "teacher" && (
                <>
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
                      School Name
                    </label>
                    <input
                      type="text"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "14px",
                        border: errors.schoolName
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
                        e.target.style.borderColor = errors.schoolName
                          ? "#f44336"
                          : "#e0e0e0";
                      }}
                    />
                    {errors.schoolName && (
                      <div style={{ fontSize: "12px", color: "#f44336", marginTop: "4px" }}>
                        {errors.schoolName}
                      </div>
                    )}
                  </div>

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
                      Number of Students
                    </label>
                    <input
                      type="number"
                      name="numStudents"
                      value={formData.numStudents}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "14px",
                        border: errors.numStudents
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
                        e.target.style.borderColor = errors.numStudents
                          ? "#f44336"
                          : "#e0e0e0";
                      }}
                    />
                    {errors.numStudents && (
                      <div style={{ fontSize: "12px", color: "#f44336", marginTop: "4px" }}>
                        {errors.numStudents}
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {/* PASSWORD */}
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
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
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

              {/* CONFIRM PASSWORD */}
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
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "14px",
                      border: errors.confirmPassword
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
                      e.currentTarget.style.borderColor = errors.confirmPassword
                        ? "#f44336"
                        : "#e0e0e0";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
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
                    {confirmPasswordVisible ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div style={{ fontSize: "12px", color: "#f44336", marginTop: "4px" }}>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* PROMO CODE */}
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
                  Promo Code (Optional)
                </label>
                <input
                  type="text"
                  name="promoCode"
                  value={formData.promoCode}
                  onChange={handlePromoCodeChange}
                  disabled={isLoading}
                  placeholder="Enter promo code"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "14px",
                    border: "2px solid #e0e0e0",
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
                    e.target.style.borderColor = "#e0e0e0";
                  }}
                />
                {promoStatus && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: promoStatus.valid ? "#4CAF50" : "#f44336",
                      marginTop: "4px",
                    }}
                  >
                    {promoStatus.message}
                  </div>
                )}
              </div>

              {/* SIGN UP BUTTON */}
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
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            {/* LOGIN LINK */}
            <div
              style={{
                textAlign: "center",
                marginTop: "24px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              Already have an account?{" "}
              <a
                href="/login"
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
                Log in here
              </a>
            </div>
          </form>
        )}

        {/* SELECT ACCOUNT TYPE MESSAGE */}
        {!accountType && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 24px",
              color: "#999",
              fontSize: "14px",
            }}
          >
            Select an account type above to continue
          </div>
        )}
      </div>
    </div>
  );
}
