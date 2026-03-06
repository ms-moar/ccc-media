import Link from "next/link";
import { TerminalIcon, ChartIcon, TrophyIcon, BrainIcon } from "../components/ui/Icons";

// Mock data for the dashboard
const recentSessions = [
  { id: 1, type: "Technical", title: "Array Manipulation", date: "Jan 22, 2026", score: 87, status: "completed" },
  { id: 2, type: "Behavioral", title: "Leadership Experience", date: "Jan 20, 2026", score: 92, status: "completed" },
  { id: 3, type: "System Design", title: "URL Shortener", date: "Jan 18, 2026", score: 78, status: "completed" },
  { id: 4, type: "Technical", title: "Binary Search", date: "Jan 15, 2026", score: 95, status: "completed" },
];

const goals = [
  { id: 1, text: "Complete 5 technical interviews", progress: 3, total: 5 },
  { id: 2, text: "Reach 90% average score", progress: 87, total: 90 },
  { id: 3, text: "Practice system design daily", progress: 4, total: 7 },
];

function getTypeColor(type: string) {
  switch (type) {
    case "Technical":
      return "text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/20";
    case "Behavioral":
      return "text-[#00D4FF] bg-[#00D4FF]/10 border-[#00D4FF]/20";
    case "System Design":
      return "text-[#C792EA] bg-[#C792EA]/10 border-[#C792EA]/20";
    default:
      return "text-white/60 bg-white/10 border-white/20";
  }
}

function getScoreColor(score: number) {
  if (score >= 90) return "text-[#00ff9d]";
  if (score >= 75) return "text-[#00D4FF]";
  if (score >= 60) return "text-[#FFB800]";
  return "text-[#FF6B6B]";
}

export default function DashboardPage() {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-[#0A0A0B] grid-bg">
      {/* Header */}
      <header className="border-b border-[#2A2A30] bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00ff9d] rounded flex items-center justify-center text-[#0A0A0B]">
              <TerminalIcon />
            </div>
            <h1 className="text-xl font-bold font-mono tracking-tighter">
              Interview<span className="text-[#00ff9d]">OS</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-white/60 hover:text-[#00ff9d] transition-colors text-sm">Settings</Link>
            <Link href="/settings" className="w-8 h-8 rounded-full bg-[#141416] border border-[#2A2A30] flex items-center justify-center text-sm font-mono text-[#00ff9d] hover:border-[#00ff9d]/50 transition-colors">
              JD
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {greeting}, <span className="text-[#00ff9d]">developer</span>
            <span className="animate-blink">_</span>
          </h2>
          <p className="text-white/60 font-mono text-sm">
            <span className="text-[#00ff9d]">$</span> Ready to level up your interview skills?
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="relative bg-[#141416] border border-[#2A2A30] rounded-xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/40 text-sm font-mono">total_sessions</span>
              <div className="w-8 h-8 rounded bg-[#00ff9d]/10 flex items-center justify-center text-[#00ff9d]">
                <TerminalIcon />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">24</div>
            <div className="text-xs text-[#00ff9d] mt-1">+3 this week</div>
          </div>

          <div className="relative bg-[#141416] border border-[#2A2A30] rounded-xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/40 text-sm font-mono">avg_score</span>
              <div className="w-8 h-8 rounded bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF]">
                <ChartIcon />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">87%</div>
            <div className="text-xs text-[#00D4FF] mt-1">+5% from last month</div>
          </div>

          <div className="relative bg-[#141416] border border-[#2A2A30] rounded-xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/40 text-sm font-mono">streak_days</span>
              <div className="w-8 h-8 rounded bg-[#C792EA]/10 flex items-center justify-center text-[#C792EA]">
                <TrophyIcon />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">7</div>
            <div className="text-xs text-[#C792EA] mt-1">Personal best!</div>
          </div>

          <div className="relative bg-[#141416] border border-[#2A2A30] rounded-xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/40 text-sm font-mono">time_practiced</span>
              <div className="w-8 h-8 rounded bg-[#FFB800]/10 flex items-center justify-center text-[#FFB800]">
                <BrainIcon />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">12.5h</div>
            <div className="text-xs text-[#FFB800] mt-1">This month</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Sessions */}
          <div className="lg:col-span-2">
            <div className="terminal-window glow-primary">
              <div className="terminal-header">
                <div className="terminal-dot terminal-dot-red" />
                <div className="terminal-dot terminal-dot-yellow" />
                <div className="terminal-dot terminal-dot-green" />
                <span className="font-mono text-xs text-white/40 ml-2">recent_sessions.log</span>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <Link
                      href="/results"
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-[#0A0A0B] rounded-lg border border-[#2A2A30] hover:border-[#3A3A40] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`font-mono text-xs px-2 py-1 rounded border ${getTypeColor(session.type)}`}>
                          {session.type.toUpperCase()}
                        </span>
                        <div>
                          <div className="font-medium text-white">{session.title}</div>
                          <div className="text-xs text-white/40 font-mono">{session.date}</div>
                        </div>
                      </div>
                      <div className={`text-xl font-bold font-mono ${getScoreColor(session.score)}`}>
                        {session.score}%
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/results" className="block w-full mt-4 py-3 text-sm font-mono text-white/60 hover:text-[#00ff9d] border border-[#2A2A30] rounded-lg hover:border-[#00ff9d]/30 transition-colors text-center">
                  View all sessions...
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-[#141416] border border-[#2A2A30] rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-[#00ff9d]">&gt;</span> Quick Actions
              </h3>
              <div className="space-y-3">
                <Link href="/session" className="w-full py-3 px-4 bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-[#0A0A0B] rounded-lg font-bold text-sm transition-all glow-primary flex items-center justify-center gap-2">
                  <TerminalIcon />
                  Start Technical Interview
                </Link>
                <Link href="/session" className="w-full py-3 px-4 bg-transparent border border-[#00D4FF]/50 text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2">
                  <BrainIcon />
                  Start Behavioral Interview
                </Link>
                <Link href="/session" className="w-full py-3 px-4 bg-transparent border border-[#C792EA]/50 text-[#C792EA] hover:bg-[#C792EA]/10 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2">
                  <ChartIcon />
                  Start System Design
                </Link>
              </div>
            </div>

            {/* Upcoming Goals */}
            <div className="bg-[#141416] border border-[#2A2A30] rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-[#00ff9d]">&gt;</span> Goals
              </h3>
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/80">{goal.text}</span>
                      <span className="font-mono text-xs text-[#00ff9d]">
                        {goal.progress}/{goal.total}
                      </span>
                    </div>
                    <div className="h-2 bg-[#0A0A0B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00ff9d] rounded-full transition-all"
                        style={{ width: `${(goal.progress / goal.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Chart Area */}
        <div className="mt-6">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-yellow" />
              <div className="terminal-dot terminal-dot-green" />
              <span className="font-mono text-xs text-white/40 ml-2">skill_progress.chart</span>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <span className="text-[#00ff9d]">&gt;</span> Skill Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Code Quality */}
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#2A2A30"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#00ff9d"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${87 * 3.52} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#00ff9d] font-mono">87%</span>
                    </div>
                  </div>
                  <div className="font-medium text-white">Code Quality</div>
                  <div className="text-xs text-white/40 font-mono">+12% this month</div>
                </div>

                {/* Communication */}
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#2A2A30"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#00D4FF"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${92 * 3.52} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#00D4FF] font-mono">92%</span>
                    </div>
                  </div>
                  <div className="font-medium text-white">Communication</div>
                  <div className="text-xs text-white/40 font-mono">+8% this month</div>
                </div>

                {/* Problem Solving */}
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#2A2A30"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#C792EA"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${78 * 3.52} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#C792EA] font-mono">78%</span>
                    </div>
                  </div>
                  <div className="font-medium text-white">Problem Solving</div>
                  <div className="text-xs text-white/40 font-mono">+15% this month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
