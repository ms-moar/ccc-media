"use client";

import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
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
              auth@interviewos
            </span>
          </div>

          {/* Terminal Body */}
          <div className="p-8">
            {/* Title */}
            <h1 className="font-mono text-lg mb-2">
              <span className="text-[#6B7280]">$</span>{" "}
              <span className="text-[#00ff9d]">ssh</span>{" "}
              <span className="text-white">user@interviewos</span>
              <span className="animate-blink text-[#00ff9d]">_</span>
            </h1>
            <p className="text-[#6B7280] text-sm font-mono mb-8">
              Establishing secure connection...
            </p>

            {/* Form */}
            <form className="space-y-6">
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

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-[#6B7280] text-sm font-mono hover:text-[#00ff9d] transition-colors"
                >
                  forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Link
                href="/dashboard"
                className="block w-full bg-[#00ff9d] text-[#0A0A0B] font-mono font-bold py-3 px-6 rounded-lg hover:bg-[#00e68a] transition-all hover:shadow-[0_0_30px_rgba(0,255,157,0.3)] active:scale-[0.98] text-center"
              >
                AUTHENTICATE
              </Link>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[#2A2A30]" />
              <span className="text-[#6B7280] text-sm font-mono">or</span>
              <div className="flex-1 h-px bg-[#2A2A30]" />
            </div>

            {/* Social Sign In */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-[#0A0A0B] border border-[#2A2A30] rounded-lg py-3 px-6 hover:border-[#3A3A40] transition-all font-mono text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-white">Continue with GitHub</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-[#0A0A0B] border border-[#2A2A30] rounded-lg py-3 px-6 hover:border-[#3A3A40] transition-all font-mono text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-white">Continue with Google</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center mt-8 text-[#6B7280] text-sm font-mono">
              New to InterviewOS?{" "}
              <Link
                href="/signup"
                className="text-[#00ff9d] hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-8 text-[#6B7280] text-xs font-mono z-10">
        InterviewOS v1.0.0 | Secure Authentication
      </p>
    </div>
  );
}
