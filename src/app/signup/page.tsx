"use client";
import React, { useState } from "react";
import "../globals.css";

type AccountType = "child" | "parent" | "teacher" | null;

interface FormData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  age: string;
  childName: string;
  childAge: string;
  schoolName: string;
  numStudents: string;
  promoCode: string;
}

const VALID_PROMO_CODES: Record<string, { discount: string; message: string }> = {
  GREENSTART: { discount: "30%", message: "30% off applied!" },
  FAMILY2024: { discount: "2 months", message: "2 months free applied!" },
  SCHOOL100: { discount: "20%", message: "20% off school package applied!" },
  BACK2SCHOOL: { discount: "50%", message: "50% off applied!" },
};

export default function SignupPage() {
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    age: "",
    childName: "",
    childAge: "",
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

  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setErrors({});
    setPromoStatus(null);
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

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (accountType === "child") {
      if (!formData.username.trim()) {
        newErrors.username = "Username is required";
      }
      if (!formData.age || parseInt(formData.age) < 6) {
        newErrors.age = "Age must be at least 6";
      }
    } else if (accountType === "parent") {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email address";
      }
      if (!formData.childName.trim()) {
        newErrors.childName = "Child's name is required";
      }
      if (!formData.childAge || parseInt(formData.childAge) < 6) {
        newErrors.childAge = "Child's age must be at least 6";
      }
    } else if (accountType === "teacher") {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email address";
      }
      if (!formData.schoolName.trim()) {
        newErrors.schoolName = "School name is required";
      }
      if (!formData.numStudents || parseInt(formData.numStudents) < 1) {
        newErrors.numStudents = "Number of students must be at least 1";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", { accountType, formData });
      alert(`Account created for ${accountType}!`);
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

        {/* ACCOUNT TYPE SELECTOR */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          {[
            { type: "child" as const, icon: "👦", label: "Child/Student", desc: "I want to learn typing" },
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

              {/* CHILD ACCOUNT FIELDS */}
              {accountType === "child" && (
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
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
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
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
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
                      min="1"
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

              {/* PROMO CODE - Parent and Teacher only */}
              {(accountType === "parent" || accountType === "teacher") && (
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
                    Promo code (optional)
                  </label>
                  <input
                    type="text"
                    name="promoCode"
                    value={formData.promoCode}
                    onChange={handlePromoCodeChange}
                    placeholder="Enter promo code"
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "14px",
                      border:
                        promoStatus === null
                          ? "2px solid #e0e0e0"
                          : promoStatus.valid
                          ? "2px solid #4CAF50"
                          : "2px solid #f44336",
                      borderRadius: "8px",
                      outline: "none",
                      transition: "border 0.2s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      if (promoStatus === null) {
                        e.target.style.borderColor = "#4CAF50";
                      }
                    }}
                    onBlur={(e) => {
                      if (promoStatus === null) {
                        e.target.style.borderColor = "#e0e0e0";
                      }
                    }}
                  />
                  {promoStatus && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: promoStatus.valid ? "#4CAF50" : "#f44336",
                        marginTop: "4px",
                        fontWeight: 600,
                      }}
                    >
                      {promoStatus.message}
                    </div>
                  )}
                </div>
              )}

              {/* CREATE ACCOUNT BUTTON */}
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#4CAF50",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                  marginBottom: "16px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#45a049";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#4CAF50";
                }}
              >
                Create Account
              </button>

              {/* GOOGLE SIGNUP */}
              <button
                type="button"
                disabled
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#f5f5f5",
                  color: "#999",
                  fontSize: "16px",
                  fontWeight: 600,
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  cursor: "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span style={{ opacity: 0.5 }}>🔐</span> Sign up with Google (coming soon)
              </button>
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
