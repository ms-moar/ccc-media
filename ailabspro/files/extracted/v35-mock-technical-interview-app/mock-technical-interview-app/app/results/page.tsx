"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data for the results
const mockSessionData = {
  type: "Technical Interview",
  date: "January 23, 2026",
  duration: "45 min",
  overallScore: 87,
};

const mockScoreBreakdown = [
  { label: "Technical Accuracy", score: 92, color: "#00ff9d" },
  { label: "Communication", score: 85, color: "#00D4FF" },
  { label: "Problem Solving", score: 88, color: "#C792EA" },
  { label: "Time Management", score: 78, color: "#FFB800" },
];

const mockFeedback = {
  summary: "Strong technical fundamentals with room for improvement in time management.",
  strengths: [
    "Excellent understanding of data structures",
    "Clear explanation of algorithmic complexity",
    "Good use of edge case handling",
  ],
  improvements: [
    "Consider optimizing initial solution before diving into code",
    "Practice time-boxing problem sections",
    "Work on communicating trade-offs more explicitly",
  ],
  recommendation: "Focus on system design patterns for your next session.",
};

const mockQuestions = [
  {
    id: 1,
    question: "Implement a function to find the two numbers in an array that add up to a target sum.",
    userAnswer: "Used a HashMap approach with O(n) time complexity...",
    feedback: "Excellent solution! You correctly identified the optimal approach using a hash map. Your explanation of the time-space tradeoff was clear.",
    score: 95,
  },
  {
    id: 2,
    question: "Design a simple URL shortener system. What components would you include?",
    userAnswer: "Discussed load balancer, application servers, database with sharding...",
    feedback: "Good high-level design. Consider discussing cache invalidation strategies and how you would handle analytics/click tracking.",
    score: 82,
  },
  {
    id: 3,
    question: "Explain the difference between a stack and a queue. When would you use each?",
    userAnswer: "Stack is LIFO, queue is FIFO. Use cases include...",
    feedback: "Solid understanding of fundamentals. Your real-world examples were helpful in demonstrating practical applications.",
    score: 90,
  },
];

// Icons
function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

// Score Circle Component
function ScoreCircle({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-48 h-48">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-[#00ff9d]/20 blur-xl animate-pulse-glow" />

      {/* SVG Circle */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="#2A2A30"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="#00ff9d"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: "drop-shadow(0 0 10px rgba(0, 255, 157, 0.5))",
          }}
        />
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-[#00ff9d] text-glow font-mono">{score}</span>
        <span className="text-white/40 text-sm font-mono">/100</span>
      </div>
    </div>
  );
}

// Progress Bar Component
function ProgressBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full h-2 bg-[#2A2A30] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${score}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}40`,
        }}
      />
    </div>
  );
}

// Question Review Item Component
function QuestionReviewItem({ question, index }: { question: typeof mockQuestions[0]; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-[#2A2A30] rounded-xl overflow-hidden card-hover relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="w-8 h-8 rounded-lg bg-[#00ff9d]/10 text-[#00ff9d] font-mono text-sm flex items-center justify-center">
            {index + 1}
          </span>
          <div>
            <p className="text-white font-medium line-clamp-1">{question.question}</p>
            <p className="text-white/40 text-sm font-mono mt-1">Score: {question.score}/100</p>
          </div>
        </div>
        <ChevronDownIcon
          className={`text-white/40 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-[#2A2A30]">
          <div className="pt-4">
            <p className="text-[#00D4FF] text-xs font-mono uppercase tracking-wider mb-2">Your Response</p>
            <p className="text-white/70 text-sm bg-[#0A0A0B] rounded-lg p-3 font-mono">
              {question.userAnswer}
            </p>
          </div>
          <div>
            <p className="text-[#C792EA] text-xs font-mono uppercase tracking-wider mb-2">AI Feedback</p>
            <p className="text-white/70 text-sm bg-[#0A0A0B] rounded-lg p-3">
              {question.feedback}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Grid Background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Decorative Glows */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-[#00ff9d]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-[#00ff9d]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-6 py-12 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-[#00ff9d] animate-pulse" />
            <span className="font-mono text-[#00ff9d] text-sm uppercase tracking-wider">Session Complete</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Interview <span className="text-[#00ff9d]">Results</span>
          </h1>
          <div className="flex items-center justify-center gap-4 text-white/50 font-mono text-sm">
            <span>{mockSessionData.type}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>{mockSessionData.date}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>{mockSessionData.duration}</span>
          </div>
        </header>

        {/* Overall Score Section */}
        <section className="flex flex-col items-center mb-16">
          <ScoreCircle score={mockSessionData.overallScore} />
          <p className="mt-6 text-white/60 text-center max-w-md">
            Great performance! You scored above average in most categories.
          </p>
        </section>

        {/* Score Breakdown Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold">Score Breakdown</h2>
            <span className="font-mono text-sm text-[#00ff9d] bg-[#00ff9d]/10 px-3 py-1 rounded">{`// metrics`}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockScoreBreakdown.map((item) => (
              <div
                key={item.label}
                className="relative bg-[#141416] border border-[#2A2A30] rounded-xl p-5 card-hover"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">{item.label}</span>
                  <span className="font-mono font-bold" style={{ color: item.color }}>
                    {item.score}%
                  </span>
                </div>
                <ProgressBar score={item.score} color={item.color} />
              </div>
            ))}
          </div>
        </section>

        {/* AI Feedback Terminal Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold">AI Analysis</h2>
            <span className="font-mono text-sm text-[#00D4FF] bg-[#00D4FF]/10 px-3 py-1 rounded">{`// feedback`}</span>
          </div>

          <div className="terminal-window glow-primary">
            <div className="terminal-header">
              <div className="flex gap-2">
                <div className="terminal-dot terminal-dot-red" />
                <div className="terminal-dot terminal-dot-yellow" />
                <div className="terminal-dot terminal-dot-green" />
              </div>
              <div className="flex-1 text-center text-xs font-mono text-white/40">
                interviewos@feedback — analysis.json
              </div>
              <div className="w-12" />
            </div>

            <div className="p-6 font-mono text-sm leading-relaxed space-y-4 max-h-[500px] overflow-y-auto">
              {/* Console output style */}
              <div>
                <span className="text-white/40">{">"} console.log(feedback.summary)</span>
                <div className="mt-1 text-[#00ff9d] pl-4">&quot;{mockFeedback.summary}&quot;</div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <span className="text-white/40">{">"} console.log(feedback.strengths)</span>
                <div className="mt-2 pl-4">
                  <span className="text-[#C792EA]">{"["}</span>
                  {mockFeedback.strengths.map((strength, i) => (
                    <div key={i} className="flex items-start gap-2 pl-4 py-1">
                      <span className="text-[#00ff9d]"><CheckCircleIcon /></span>
                      <span className="text-white/80">&quot;{strength}&quot;{i < mockFeedback.strengths.length - 1 ? "," : ""}</span>
                    </div>
                  ))}
                  <span className="text-[#C792EA]">{"]"}</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <span className="text-white/40">{">"} console.log(feedback.improvements)</span>
                <div className="mt-2 pl-4">
                  <span className="text-[#C792EA]">{"["}</span>
                  {mockFeedback.improvements.map((improvement, i) => (
                    <div key={i} className="flex items-start gap-2 pl-4 py-1">
                      <span className="text-[#FFB800]"><AlertCircleIcon /></span>
                      <span className="text-white/80">&quot;{improvement}&quot;{i < mockFeedback.improvements.length - 1 ? "," : ""}</span>
                    </div>
                  ))}
                  <span className="text-[#C792EA]">{"]"}</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <span className="text-white/40">{">"} console.log(feedback.recommendation)</span>
                <div className="mt-1 text-[#00D4FF] pl-4">&quot;{mockFeedback.recommendation}&quot;</div>
              </div>

              <div className="pt-4 flex items-center gap-2">
                <span className="text-[#00ff9d]">$</span>
                <span className="w-2 h-5 bg-[#00ff9d] animate-blink" />
              </div>
            </div>
          </div>
        </section>

        {/* Question Review Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold">Question Review</h2>
            <span className="font-mono text-sm text-[#C792EA] bg-[#C792EA]/10 px-3 py-1 rounded">{`// ${mockQuestions.length} questions`}</span>
          </div>

          <div className="space-y-4">
            {mockQuestions.map((question, index) => (
              <QuestionReviewItem key={question.id} question={question} index={index} />
            ))}
          </div>
        </section>

        {/* Action Buttons Section */}
        <section className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 border-t border-white/5">
          <button className="w-full sm:w-auto min-w-[180px] h-12 bg-[#00ff9d] text-[#0A0A0B] rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all glow-primary">
            <RefreshIcon />
            <span>Try Again</span>
          </button>

          <button className="w-full sm:w-auto min-w-[180px] h-12 border border-[#00D4FF]/30 text-[#00D4FF] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#00D4FF]/10 hover:border-[#00D4FF] transition-all">
            <ShareIcon />
            <span>Share Results</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto min-w-[180px] h-12 border border-[#2A2A30] text-white/70 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 hover:border-white/20 transition-all"
          >
            <HomeIcon />
            <span>Back to Dashboard</span>
          </Link>
        </section>

        {/* Footer Note */}
        <footer className="mt-16 text-center">
          <p className="text-white/30 text-sm font-mono">
            {`// Results auto-saved to your profile`}
          </p>
        </footer>
      </main>
    </div>
  );
}
