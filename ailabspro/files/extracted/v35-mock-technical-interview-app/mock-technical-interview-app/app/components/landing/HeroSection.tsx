import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center px-6 py-20 lg:py-32 text-center max-w-6xl mx-auto">
      {/* Terminal Window */}
      <div className="w-full max-w-2xl mb-12 terminal-window shadow-2xl">
        <div className="terminal-header">
          <div className="flex gap-2">
            <div className="terminal-dot terminal-dot-red" />
            <div className="terminal-dot terminal-dot-yellow" />
            <div className="terminal-dot terminal-dot-green" />
          </div>
          <div className="flex-1 text-center text-xs font-mono text-white/40">
            interviewos@terminal — 80x24
          </div>
          <div className="w-12" />
        </div>

        <div className="p-6 text-left font-mono text-sm leading-relaxed">
          <div className="flex gap-2">
            <span className="text-[#00ff9d]">$</span>
            <span className="text-white">interviewos --init</span>
          </div>
          <div className="mt-2 text-white/60">Booting InterviewOS v1.0...</div>
          <div className="text-white/60">Loading AI modules (NLP, CodeAnalysis, Behavioral)...</div>
          <div className="mt-4 text-[#00ff9d]">
            [========================================] 100%
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-[#00ff9d]/20 text-[#00ff9d] px-2 py-0.5 rounded text-[10px] font-bold">SUCCESS</span>
            <span className="text-[#00ff9d] text-glow font-bold uppercase tracking-widest">System Ready.</span>
            <span className="w-2 h-5 bg-[#00ff9d] animate-blink" />
          </div>
        </div>
      </div>

      {/* Headline */}
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
        Your operating system for <br className="hidden md:block" />
        mastering <span className="text-[#00ff9d]">tech interviews.</span>
      </h1>

      <p className="text-lg md:text-xl text-white/50 font-mono mb-10 max-w-2xl mx-auto">
        // Real-time feedback. Adaptive difficulty. Zero judgment.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/signup" className="w-full sm:w-auto min-w-[200px] h-14 bg-[#00ff9d] text-[#0A0A0B] rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all glow-primary group">
          <span className="transition-transform group-hover:translate-x-1">&gt;</span>
          <span>BOOT SESSION</span>
        </Link>
        <Link href="/session" className="w-full sm:w-auto min-w-[200px] h-14 border border-[#00ff9d]/30 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#00ff9d]/5 hover:border-[#00ff9d] transition-all">
          <span>View Demo</span>
          <span className="font-mono text-[#00ff9d] animate-blink">_</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-20 w-full border-t border-white/5 pt-10">
        <div className="flex flex-col md:flex-row items-center justify-around gap-8 font-mono text-sm">
          <div className="flex flex-col items-center gap-1">
            <span className="text-white/80 text-2xl font-bold">12,847</span>
            <span className="uppercase text-[10px] tracking-widest text-[#00ff9d]/60">sessions completed</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-white/80 text-2xl font-bold">94%</span>
            <span className="uppercase text-[10px] tracking-widest text-[#00ff9d]/60">felt more prepared</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-white/80 text-2xl font-bold">2.3x</span>
            <span className="uppercase text-[10px] tracking-widest text-[#00ff9d]/60">confidence boost</span>
          </div>
        </div>
      </div>
    </section>
  );
}
