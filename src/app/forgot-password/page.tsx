"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const inputClassName = cn(
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400",
    "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500",
    "disabled:cursor-not-allowed disabled:opacity-50"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Wire up Supabase password reset
    console.log(email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 font-sans">
      <div className="mgk-card w-full max-w-sm p-8">
        <div className="mb-8 flex justify-center">
          <Leaf className="h-10 w-10 text-green-500" strokeWidth={2} aria-hidden />
        </div>

        <h1 className="mb-3 text-center text-2xl font-semibold text-gray-900">Reset your password</h1>
        <p className="mb-8 text-center text-sm text-gray-600">
          Enter your email and we&apos;ll send you a reset link
        </p>

        <form className="text-left" onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-gray-700">
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
            className="w-full rounded-lg bg-[#2ECC71] py-3 text-sm font-medium text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-green-600 hover:text-green-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
