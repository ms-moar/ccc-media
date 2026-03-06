const plans = [
  {
    name: "@interviewos/free",
    version: "0.0.0",
    price: "Free",
    features: ["3 sessions/month", "Basic AI feedback", "Community support"],
    cta: "npm install --save",
    highlighted: false,
  },
  {
    name: "@interviewos/pro",
    version: "$19/mo",
    price: "$19",
    features: ["Unlimited sessions", "Advanced AI analysis", "Performance analytics", "Priority support"],
    cta: "npm install --save",
    highlighted: true,
  },
  {
    name: "@interviewos/enterprise",
    version: "Custom",
    price: "Custom",
    features: ["Team management", "API access", "Dedicated support", "Custom integrations"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative z-10 px-6 lg:px-20 py-24 bg-[#0d0d0f]">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <code className="font-mono text-[#00ff9d] text-lg">npm install @interviewos/pro</code>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative bg-[#141416] border rounded-2xl p-6 ${
                plan.highlighted
                  ? 'border-[#00ff9d]/50 glow-primary-strong'
                  : 'border-[#2A2A30]'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-xs text-[#00ff9d] bg-[#00ff9d]/10 border border-[#00ff9d]/30 px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="font-mono text-sm mb-6">
                <div className="text-[#C792EA]">{"{"}</div>
                <div className="pl-4">
                  <span className="text-[#00D4FF]">&quot;name&quot;</span>: <span className="text-[#FFB800]">&quot;{plan.name}&quot;</span>,
                </div>
                <div className="pl-4">
                  <span className="text-[#00D4FF]">&quot;version&quot;</span>: <span className="text-[#FFB800]">&quot;{plan.version}&quot;</span>,
                </div>
                <div className="pl-4">
                  <span className="text-[#00D4FF]">&quot;features&quot;</span>: [
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="pl-4">
                      <span className="text-[#FFB800]">&quot;{f}&quot;</span>{fi < plan.features.length - 1 && ','}
                    </div>
                  ))}
                  <span className="pl-4">]</span>
                </div>
                <div className="text-[#C792EA]">{"}"}</div>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-mono text-sm font-medium transition-all ${
                  plan.highlighted
                    ? 'bg-[#00ff9d] text-[#0A0A0B] hover:bg-[#00ff9d]/90 glow-primary'
                    : 'border border-[#2A2A30] text-white hover:border-[#00ff9d] hover:text-[#00ff9d]'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
