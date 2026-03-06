const testimonials = [
  {
    user: "Sarah K.",
    role: "Software Engineer @ Google",
    message: "This is the closest thing to a real FAANG interview I've experienced. The AI feedback was incredibly detailed.",
  },
  {
    user: "Marcus T.",
    role: "Senior Developer @ Stripe",
    message: "Landed my dream job after just 2 weeks of practice. The behavioral prep was a game-changer.",
  },
  {
    user: "Priya R.",
    role: "Staff Engineer @ Netflix",
    message: "The system design practice sessions were invaluable. Highly recommend for senior roles.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative z-10 px-6 lg:px-20 py-24">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <code className="font-mono text-[#00ff9d] text-lg block mb-8">console.log(testimonials)</code>

        {/* Terminal Output */}
        <div className="terminal-window mb-12">
          <div className="terminal-header">
            <div className="flex gap-2">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-yellow" />
              <div className="terminal-dot terminal-dot-green" />
            </div>
            <div className="flex-1 text-center text-xs font-mono text-white/40">testimonials.js</div>
            <div className="w-12" />
          </div>

          <div className="p-6 font-mono text-sm space-y-6">
            <div className="text-white/40">$ node testimonials.js</div>
            <div className="text-white/40">[INFO] Loading verified reviews...</div>

            {testimonials.map((t, i) => (
              <div key={i} className="text-white/80">
                <span className="text-white/40">&gt; </span>
                <span className="text-[#C792EA]">{"{"}</span>
                <div className="pl-4">
                  <span className="text-[#00D4FF]">user</span>: <span className="text-[#FFB800]">&quot;{t.user}&quot;</span>,
                </div>
                <div className="pl-4">
                  <span className="text-[#00D4FF]">role</span>: <span className="text-[#FFB800]">&quot;{t.role}&quot;</span>,
                </div>
                <div className="pl-4">
                  <span className="text-[#00D4FF]">message</span>: <span className="text-[#FFB800]">&quot;{t.message}&quot;</span>,
                </div>
                <div className="pl-4">
                  <span className="text-[#00D4FF]">verified</span>: <span className="text-[#00ff9d]">true</span>
                </div>
                <span className="text-[#C792EA]">{"}"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Company Logos */}
        <div className="text-center">
          <p className="text-white/40 text-sm mb-6 font-mono">// Where our users landed</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-white/30 font-bold text-xl">
            <span>Google</span>
            <span>Meta</span>
            <span>Amazon</span>
            <span>Apple</span>
            <span>Stripe</span>
            <span>Netflix</span>
          </div>
        </div>
      </div>
    </section>
  );
}
