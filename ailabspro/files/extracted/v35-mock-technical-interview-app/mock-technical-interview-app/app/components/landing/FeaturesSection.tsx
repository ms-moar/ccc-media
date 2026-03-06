import { BoxIcon } from "../ui/Icons";

export function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 px-6 lg:px-20 py-24">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Your Interview Stack</h2>
          <span className="font-mono text-sm text-[#00ff9d] bg-[#00ff9d]/10 px-3 py-1 rounded">// features</span>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Large Card - AI Analysis */}
          <div className="relative lg:col-span-2 lg:row-span-2 bg-[#141416] border border-[#2A2A30] rounded-2xl p-8 card-hover overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff9d]/5 rounded-full blur-[80px]" />
            <span className="inline-block font-mono text-xs text-[#00ff9d] bg-[#00ff9d]/10 border border-[#00ff9d]/20 px-2 py-1 rounded mb-4">TECHNICAL</span>
            <h3 className="text-2xl font-bold mb-3">AI-Powered Analysis</h3>
            <p className="text-white/60 mb-6">Real-time code analysis and feedback as you solve problems. Our AI understands context, patterns, and best practices.</p>

            {/* Code Preview */}
            <div className="bg-[#0A0A0B] rounded-lg p-4 font-mono text-sm">
              <div className="text-white/40">// Your solution</div>
              <div><span className="text-[#C792EA]">function</span> <span className="text-[#00D4FF]">twoSum</span>(nums, target) {"{"}</div>
              <div className="pl-4"><span className="text-[#C792EA]">const</span> map = <span className="text-[#C792EA]">new</span> <span className="text-[#00D4FF]">Map</span>();</div>
              <div className="pl-4 text-[#00ff9d]">// AI: Consider edge cases</div>
              <div>{"}"}</div>
            </div>
          </div>

          {/* Small Card - Behavioral */}
          <div className="relative bg-[#141416] border border-[#2A2A30] rounded-2xl p-6 card-hover">
            <span className="inline-block font-mono text-xs text-[#00D4FF] bg-[#00D4FF]/10 border border-[#00D4FF]/20 px-2 py-1 rounded mb-4">BEHAVIORAL</span>
            <h3 className="text-xl font-bold mb-2">Behavioral Prep</h3>
            <p className="text-white/60 text-sm">Master the STAR method with guided prompts and AI feedback.</p>
            <div className="mt-4 flex gap-2">
              <span className="text-xs bg-white/5 px-2 py-1 rounded">Situation</span>
              <span className="text-xs bg-white/5 px-2 py-1 rounded">Task</span>
              <span className="text-xs bg-white/5 px-2 py-1 rounded">Action</span>
              <span className="text-xs bg-white/5 px-2 py-1 rounded">Result</span>
            </div>
          </div>

          {/* Small Card - System Design */}
          <div className="relative bg-[#141416] border border-[#2A2A30] rounded-2xl p-6 card-hover">
            <span className="inline-block font-mono text-xs text-[#C792EA] bg-[#C792EA]/10 border border-[#C792EA]/20 px-2 py-1 rounded mb-4">SYSTEM DESIGN</span>
            <h3 className="text-xl font-bold mb-2">System Design</h3>
            <p className="text-white/60 text-sm">Practice designing scalable distributed systems with real-world scenarios.</p>
            <div className="mt-4 flex items-center gap-2 text-white/40">
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                <BoxIcon />
              </div>
              <div className="w-6 h-px bg-white/20" />
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                <BoxIcon />
              </div>
              <div className="w-6 h-px bg-white/20" />
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                <BoxIcon />
              </div>
            </div>
          </div>

          {/* Medium Card - Adaptive */}
          <div className="relative bg-[#141416] border border-[#2A2A30] rounded-2xl p-6 card-hover">
            <h3 className="text-xl font-bold mb-2">Adaptive Difficulty</h3>
            <p className="text-white/60 text-sm mb-4">AI adjusts to your skill level in real-time.</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 w-16">Junior</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-[#00ff9d]/50 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 w-16">Senior</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-[#00ff9d]/70 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#00ff9d] w-16">Staff</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-[#00ff9d] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Medium Card - Instant Feedback */}
          <div className="relative bg-[#141416] border border-[#2A2A30] rounded-2xl p-6 card-hover">
            <h3 className="text-xl font-bold mb-2">Instant Feedback</h3>
            <p className="text-white/60 text-sm mb-4">Get detailed analysis the moment you finish.</p>
            <div className="flex items-end gap-1 h-12">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75].map((h, i) => (
                <div key={i} className="flex-1 bg-[#00ff9d]/30 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Medium Card - Analytics */}
          <div className="relative lg:col-span-2 bg-[#141416] border border-[#2A2A30] rounded-2xl p-6 card-hover">
            <h3 className="text-xl font-bold mb-2">Performance Analytics</h3>
            <p className="text-white/60 text-sm mb-4">Track your progress over time with detailed metrics.</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#00ff9d]">87%</div>
                <div className="text-xs text-white/40">Code Quality</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#00D4FF]">92%</div>
                <div className="text-xs text-white/40">Communication</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#C792EA]">78%</div>
                <div className="text-xs text-white/40">Problem Solving</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
