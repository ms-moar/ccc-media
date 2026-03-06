import Link from "next/link";

export function CTASection() {
  return (
    <section className="relative z-10 px-6 lg:px-20 py-24">
      <div className="max-w-2xl mx-auto text-center">
        {/* Terminal */}
        <div className="terminal-window mb-8">
          <div className="terminal-header">
            <div className="flex gap-2">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-yellow" />
              <div className="terminal-dot terminal-dot-green" />
            </div>
          </div>
          <div className="p-6 font-mono text-sm text-left">
            <div>
              <span className="text-[#00ff9d]">$</span> sudo interviewos --mode=confidence
            </div>
            <div className="text-white/40 mt-2">[sudo] password for you: ********</div>
            <div className="text-white/60 mt-2">&gt; Initializing career upgrade...</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="w-2 h-5 bg-[#00ff9d] animate-blink" />
            </div>
          </div>
        </div>

        {/* Email Input */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ff9d] font-mono">&gt;</span>
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full bg-[#141416] border border-[#2A2A30] rounded-xl py-4 pl-10 pr-4 font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d]/20 transition-all"
            />
          </div>
          <Link href="/signup" className="bg-[#00ff9d] text-[#0A0A0B] px-8 py-4 rounded-xl font-bold hover:bg-[#00ff9d]/90 transition-all glow-primary whitespace-nowrap">
            &gt; BEGIN YOUR JOURNEY
          </Link>
        </div>

        <p className="text-white/40 font-mono text-sm">
          // No credit card required. No judgment. Just practice.
        </p>
      </div>
    </section>
  );
}
