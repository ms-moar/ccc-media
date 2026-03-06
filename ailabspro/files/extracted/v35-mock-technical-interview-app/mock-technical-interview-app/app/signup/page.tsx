"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  const [experienceLevel, setExperienceLevel] = useState("");

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-12">
      {/* Grid Background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Decorative Glows */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-[#00ff9d]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-[#00ff9d]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Back to Home Link */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-[#6B7280] hover:text-[#00ff9d] transition-colors font-mono text-sm z-10"
      >
        <span>&lt;-</span>
        <span>cd ~</span>
      </Link>

      {/* Terminal Window */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
        <div className="terminal-window glow-primary">
          {/* Terminal Header */}
          <div className="terminal-header">
            <div className="terminal-dot terminal-dot-red" />
            <div className="terminal-dot terminal-dot-yellow" />
            <div className="terminal-dot terminal-dot-green" />
            <span className="ml-4 text-[#6B7280] text-sm font-mono">
              setup@interviewos
            </span>
          </div>

          {/* Terminal Body */}
          <div className="p-8">
            {/* Title */}
            <h1 className="font-mono text-lg mb-2">
              <span className="text-[#6B7280]">$</span>{" "}
              <span className="text-[#00ff9d]">useradd</span>{" "}
              <span className="text-[#9CA3AF]">--create-home</span>{" "}
              <span className="text-white">developer</span>
              <span className="animate-blink text-[#00ff9d]">_</span>
            </h1>
            <p className="text-[#6B7280] text-sm font-mono mb-8">
              Initializing new user profile...
            </p>

            {/* Form */}
            <form className="space-y-5">
              {/* Name Input */}
              <div>
                <label className="block text-[#9CA3AF] text-sm font-mono mb-2">
                  name
                </label>
                <div className="flex items-center gap-3 bg-[#0A0A0B] border border-[#2A2A30] rounded-lg px-4 py-3 focus-within:border-[#00ff9d] transition-colors">
                  <span className="text-[#00ff9d] font-mono">&gt;</span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="flex-1 bg-transparent outline-none text-white font-mono text-sm placeholder:text-[#6B7280]"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-[#9CA3AF] text-sm font-mono mb-2">
                  email
                </label>
                <div className="flex items-center gap-3 bg-[#0A0A0B] border border-[#2A2A30] rounded-lg px-4 py-3 focus-within:border-[#00ff9d] transition-colors">
                  <span className="text-[#00ff9d] font-mono">&gt;</span>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    className="flex-1 bg-transparent outline-none text-white font-mono text-sm placeholder:text-[#6B7280]"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[#9CA3AF] text-sm font-mono mb-2">
                  password
                </label>
                <div className="flex items-center gap-3 bg-[#0A0A0B] border border-[#2A2A30] rounded-lg px-4 py-3 focus-within:border-[#00ff9d] transition-colors">
                  <span className="text-[#00ff9d] font-mono">&gt;</span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="flex-1 bg-transparent outline-none text-white font-mono text-sm placeholder:text-[#6B7280]"
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-[#9CA3AF] text-sm font-mono mb-2">
                  confirm_password
                </label>
                <div className="flex items-center gap-3 bg-[#0A0A0B] border border-[#2A2A30] rounded-lg px-4 py-3 focus-within:border-[#00ff9d] transition-colors">
                  <span className="text-[#00ff9d] font-mono">&gt;</span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="flex-1 bg-transparent outline-none text-white font-mono text-sm placeholder:text-[#6B7280]"
                  />
                </div>
              </div>

              {/* Experience Level Select */}
              <div>
                <label className="block text-[#9CA3AF] text-sm font-mono mb-2">
                  experience_level
                </label>
                <div className="flex items-center gap-3 bg-[#0A0A0B] border border-[#2A2A30] rounded-lg px-4 py-3 focus-within:border-[#00ff9d] transition-colors">
                  <span className="text-[#00ff9d] font-mono">&gt;</span>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-white font-mono text-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#141416] text-[#6B7280]">
                      Select your level
                    </option>
                    <option value="junior" className="bg-[#141416]">
                      Junior (0-2 years)
                    </option>
                    <option value="mid" className="bg-[#141416]">
                      Mid-Level (2-5 years)
                    </option>
                    <option value="senior" className="bg-[#141416]">
                      Senior (5-8 years)
                    </option>
                    <option value="staff" className="bg-[#141416]">
                      Staff/Principal (8+ years)
                    </option>
                  </select>
                  <svg
                    className="w-4 h-4 text-[#6B7280] pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 accent-[#00ff9d] cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-[#6B7280] text-sm font-mono cursor-pointer"
                >
                  I accept the{" "}
                  <Link href="/terms" className="text-[#00ff9d] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[#00ff9d] hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Link
                href="/dashboard"
                className="block w-full bg-[#00ff9d] text-[#0A0A0B] font-mono font-bold py-3 px-6 rounded-lg hover:bg-[#00e68a] transition-all hover:shadow-[0_0_30px_rgba(0,255,157,0.3)] active:scale-[0.98] mt-6 text-center"
              >
                CREATE ACCOUNT
              </Link>
            </form>

            {/* Sign In Link */}
            <p className="text-center mt-8 text-[#6B7280] text-sm font-mono">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-[#00ff9d] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-8 text-[#6B7280] text-xs font-mono z-10">
        InterviewOS v1.0.0 | Secure Registration
      </p>
    </div>
  );
}
