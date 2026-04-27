"use client";
import React, { useState } from "react";
import "../globals.css";

type AccountType = "student" | "parent" | "teacher";

interface LoginForm {
  emailOrUsername: string;
  password: string;
}

export default function LoginPage() {
  const [accountType, setAccountType] = useState<AccountType>("student");
  const [formData, setFormData] = useState<LoginForm>({
    emailOrUsername: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rememberMe, setRememberMe] = useState(false);

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
      newErrors.emailOrUsername =
        accountType === "student" ? "Username is required" : "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Login submitted:", { accountType, formData, rememberMe });
      alert(`Logged in as ${accountType}!`);
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

        {/* ACCOUNT TYPE TABS */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "32px",
            borderBottom: "2px solid #e0e0e0",
          }}
        >
          {[
            { type: "student" as const, label: "Student" },
            { type: "parent" as const, label: "Parent" },
            { type: "teacher" as const, label: "Teacher" },
          ].map((option) => (
            <button
              key={option.type}
              onClick={() => {
                setAccountType(option.type);
                setErrors({});
                setFormData({ emailOrUsername: "", password: "" });
              }}
              style={{
                padding: "12px 24px",
                background: "none",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                color:
                  accountType === option.type
                    ? "#4CAF50"
                    : "#999",
                cursor: "pointer",
                borderBottom:
                  accountType === option.type
                    ? "3px solid #4CAF50"
                    : "none",
                transition: "all 0.2s ease",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

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
            {/* EMAIL/USERNAME FIELD */}
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
                {accountType === "student" ? "Username" : "Email"}
              </label>
              <input
                type={accountType === "student" ? "text" : "email"}
                name="emailOrUsername"
                value={formData.emailOrUsername}
                onChange={handleInputChange}
                placeholder={
                  accountType === "student"
                    ? "Enter your username"
                    : "Enter your email"
                }
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

            {/* LOG IN BUTTON */}
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#45a049";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#4CAF50";
              }}
            >
              Log In
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
