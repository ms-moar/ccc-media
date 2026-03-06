import { SettingsIcon, BrainIcon, ChartIcon, TrophyIcon } from "../ui/Icons";

const steps = [
  {
    hash: "a1b2c3d",
    title: "feat(setup): Choose interview type",
    description: "Select from technical coding, system design, or behavioral interview formats.",
    icon: <SettingsIcon />,
  },
  {
    hash: "e4f5g6h",
    title: "feat(session): Start adaptive AI session",
    description: "AI calibrates to your experience level and adjusts difficulty in real-time.",
    icon: <BrainIcon />,
  },
  {
    hash: "i7j8k9l",
    title: "feat(feedback): Receive instant analysis",
    description: "Code review, communication scoring, and actionable improvement tips.",
    icon: <ChartIcon />,
  },
  {
    hash: "m0n1o2p",
    title: "feat(success): Land your dream job",
    description: "Confidence +100%, Preparation Maximum",
    icon: <TrophyIcon />,
    isHead: true,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative z-10 px-6 lg:px-20 py-24 bg-[#0d0d0f]">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <code className="font-mono text-[#00ff9d] text-lg">$ sudo apt install interview-skills</code>
        </div>

        {/* Git Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-[#00ff9d]/30" />

          {steps.map((step, index) => (
            <div key={index} className="relative pl-16 pb-12 last:pb-0">
              {/* Dot */}
              <div className={`absolute left-4 w-5 h-5 rounded-full border-2 ${step.isHead ? 'bg-[#00ff9d] border-[#00ff9d] glow-primary-strong' : 'bg-[#141416] border-[#00ff9d]/50'}`} />

              {/* Content */}
              <div className={`bg-[#141416] border rounded-xl p-6 ${step.isHead ? 'border-[#00ff9d]/50 glow-primary' : 'border-[#2A2A30]'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[#00D4FF] text-sm">{step.hash}</span>
                  {step.isHead && <span className="font-mono text-xs text-[#00ff9d] bg-[#00ff9d]/10 px-2 py-0.5 rounded">(HEAD -&gt; main)</span>}
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#00ff9d]/10 flex items-center justify-center text-[#00ff9d] flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-mono text-white font-medium mb-1">{step.title}</h3>
                    <p className="text-white/50 text-sm">{step.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
