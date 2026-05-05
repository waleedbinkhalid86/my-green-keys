"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MinimalAuthShell } from "@/components/auth/MinimalAuthShell";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const inputClassName = cn(
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400",
    "focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600",
    "disabled:cursor-not-allowed disabled:opacity-50"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Wire up Supabase password reset
    console.log(email);
  };

  return (
    <MinimalAuthShell
      title="Reset your password"
      subtitle="Enter your email and we’ll send you a reset link."
    >
      <form className="text-left" onSubmit={handleSubmit} noValidate>
        <div className="mb-6">
          <label htmlFor="reset-email" className="mb-1.5 block text-xs font-medium text-gray-700">
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClassName}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send reset link
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          Log in
        </Link>
      </p>
    </MinimalAuthShell>
  );
}
