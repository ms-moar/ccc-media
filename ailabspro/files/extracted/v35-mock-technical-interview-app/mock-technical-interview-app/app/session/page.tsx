"use client";

import { useState } from "react";
import Link from "next/link";
import { TerminalIcon } from "../components/ui/Icons";

// Icon Components
function MicIcon({ muted = false }: { muted?: boolean }) {
  return muted ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .74-.11 1.46-.32 2.14" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  );
}

function HintIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
      <circle cx="8" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// Sample code for the editor
const sampleCode = `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }

    map.set(nums[i], i);
  }

  return [];
}

// Example usage:
// twoSum([2, 7, 11, 15], 9) => [0, 1]
`;

export default function SessionPage() {
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuestion] = useState(3);
  const [code, setCode] = useState(sampleCode);
  const totalQuestions = 10;

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col">
      {/* Grid Background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Decorative Glows */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-[#00ff9d]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-64 h-64 bg-[#00D4FF]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-[#2A2A30] bg-[#0A0A0B]/90 backdrop-blur-md">
        {/* Left: Logo & Session Type */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00ff9d] rounded flex items-center justify-center text-[#0A0A0B]">
              <TerminalIcon />
            </div>
            <span className="text-lg font-bold font-mono tracking-tighter text-white">
              Interview<span className="text-[#00ff9d]">OS</span>
            </span>
          </Link>

          {/* Session Type Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#141416] border border-[#2A2A30] rounded-lg">
            <span className="w-2 h-2 bg-[#00ff9d] rounded-full animate-pulse" />
            <span className="text-sm font-mono text-[#00ff9d]">Technical Interview</span>
          </div>
        </div>

        {/* Center: Timer */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#141416] border border-[#2A2A30] rounded-lg">
          <ClockIcon />
          <span className="font-mono text-lg font-bold text-white tabular-nums">25:00</span>
        </div>

        {/* Right: End Session */}
        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-lg text-[#FF6B6B] hover:bg-[#FF6B6B]/20 transition-all">
          <XIcon />
          <span className="hidden sm:inline text-sm font-medium">End Session</span>
        </Link>
      </header>

      {/* Progress Bar */}
      <div className="relative z-40 px-6 py-3 border-b border-[#2A2A30] bg-[#141416]/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-mono text-[#9CA3AF]">
            Question <span className="text-[#00ff9d]">{currentQuestion}</span> of {totalQuestions}
          </span>
          <span className="text-sm font-mono text-[#9CA3AF]">
            {Math.round((currentQuestion / totalQuestions) * 100)}% Complete
          </span>
        </div>
        <div className="w-full h-2 bg-[#2A2A30] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00ff9d] rounded-full transition-all duration-500"
            style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 lg:p-6 relative z-10 overflow-hidden">
        {/* LEFT: AI Interviewer Panel */}
        <div className="lg:w-2/5 flex flex-col gap-4">
          {/* AI Avatar Card */}
          <div className="terminal-window card-hover">
            <div className="terminal-header">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-yellow" />
              <div className="terminal-dot terminal-dot-green" />
              <span className="ml-2 text-xs font-mono text-[#6B7280]">ai_interviewer.exe</span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                {/* AI Avatar */}
                <div className="w-16 h-16 bg-[#00ff9d]/10 border-2 border-[#00ff9d] rounded-full flex items-center justify-center glow-primary">
                  <div className="text-[#00ff9d]">
                    <BotIcon />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Interviewer</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00ff9d] rounded-full animate-blink" />
                    <span className="text-sm text-[#00ff9d] font-mono">Active</span>
                  </div>
                </div>
              </div>

              {/* Voice Indicator */}
              <div className="flex items-center gap-1 mb-4">
                {[12, 18, 24, 14, 28, 16, 22, 10].map((height, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#00ff9d] rounded-full animate-pulse"
                    style={{
                      height: `${height}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
                <span className="ml-2 text-xs text-[#6B7280] font-mono">Speaking...</span>
              </div>
            </div>
          </div>

          {/* Current Question Terminal */}
          <div className="terminal-window flex-1 card-hover">
            <div className="terminal-header">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-yellow" />
              <div className="terminal-dot terminal-dot-green" />
              <span className="ml-2 text-xs font-mono text-[#6B7280]">current_question.md</span>
            </div>
            <div className="p-6 font-mono">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#00ff9d]">$</span>
                <span className="text-[#6B7280]">cat question_03.txt</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#0A0A0B] border border-[#2A2A30] rounded-lg">
                  <h4 className="text-[#00D4FF] text-sm mb-2"># Problem: Two Sum</h4>
                  <p className="text-white/90 text-sm leading-relaxed mb-4">
                    Given an array of integers <code className="text-[#C792EA] bg-[#C792EA]/10 px-1 rounded">nums</code> and an integer <code className="text-[#C792EA] bg-[#C792EA]/10 px-1 rounded">target</code>, return indices of the two numbers such that they add up to <code className="text-[#C792EA] bg-[#C792EA]/10 px-1 rounded">target</code>.
                  </p>
                  <p className="text-white/90 text-sm leading-relaxed mb-4">
                    You may assume that each input would have exactly one solution, and you may not use the same element twice.
                  </p>
                  <div className="text-[#6B7280] text-xs">
                    <span className="text-[#FFB800]">Difficulty:</span> Medium |
                    <span className="text-[#00D4FF] ml-2">Time:</span> O(n) expected
                  </div>
                </div>

                <div className="flex items-center text-[#00ff9d]">
                  <span className="animate-blink">_</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Code Editor Panel */}
        <div className="lg:w-3/5 flex flex-col">
          <div className="terminal-window flex-1 card-hover flex flex-col">
            <div className="terminal-header justify-between">
              <div className="flex items-center">
                <div className="terminal-dot terminal-dot-red" />
                <div className="terminal-dot terminal-dot-yellow" />
                <div className="terminal-dot terminal-dot-green" />
                <span className="ml-2 text-xs font-mono text-[#6B7280]">solution.ts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-mono bg-[#00D4FF]/10 text-[#00D4FF] rounded">TypeScript</span>
                <span className="px-2 py-0.5 text-xs font-mono bg-[#C792EA]/10 text-[#C792EA] rounded">Auto-save</span>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 flex overflow-hidden">
              {/* Line Numbers */}
              <div className="py-4 pl-4 pr-2 text-right font-mono text-sm text-[#6B7280] select-none bg-[#0A0A0B]/50 border-r border-[#2A2A30]">
                {code.split('\n').map((_, index) => (
                  <div key={index} className="leading-6">
                    {index + 1}
                  </div>
                ))}
              </div>
              {/* Editable Code Area */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 p-4 bg-transparent text-white font-mono text-sm leading-6 resize-none outline-none overflow-auto"
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="// Write your code here..."
              />
            </div>

            {/* Editor Footer */}
            <div className="px-4 py-2 border-t border-[#2A2A30] bg-[#0A0A0B]/50 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs font-mono text-[#6B7280]">
                <span>Ln 1, Col 1</span>
                <span>UTF-8</span>
                <span>2 spaces</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-xs font-mono bg-[#2A2A30] hover:bg-[#3A3A40] text-white rounded transition-colors">
                  Run Tests
                </button>
                <button className="px-3 py-1 text-xs font-mono bg-[#00ff9d]/10 hover:bg-[#00ff9d]/20 text-[#00ff9d] rounded transition-colors">
                  Format
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Control Bar */}
      <footer className="relative z-50 flex items-center justify-between px-6 py-4 border-t border-[#2A2A30] bg-[#141416]/90 backdrop-blur-md">
        {/* Left Controls */}
        <div className="flex items-center gap-3">
          {/* Mic Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              isMuted
                ? 'bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 text-[#FF6B6B] hover:bg-[#FF6B6B]/20'
                : 'bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00ff9d] hover:bg-[#00ff9d]/20 glow-primary'
            }`}
          >
            <MicIcon muted={isMuted} />
            <span className="hidden sm:inline text-sm">{isMuted ? 'Unmute' : 'Muted'}</span>
          </button>

          {/* Skip Question */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#2A2A30] hover:bg-[#3A3A40] border border-[#3A3A40] rounded-lg text-white transition-all">
            <SkipIcon />
            <span className="hidden sm:inline text-sm font-medium">Skip</span>
          </button>

          {/* Get Hint */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/30 rounded-lg text-[#FFB800] transition-all">
            <HintIcon />
            <span className="hidden sm:inline text-sm font-medium">Hint</span>
            <span className="hidden md:inline text-xs text-[#FFB800]/60 ml-1">(2 left)</span>
          </button>
        </div>

        {/* Right: Submit */}
        <Link href="/results" className="flex items-center gap-2 px-6 py-2.5 bg-[#00ff9d] hover:bg-[#00ff9d]/90 rounded-lg text-[#0A0A0B] font-bold transition-all glow-primary hover:scale-[1.02]">
          <SendIcon />
          <span className="text-sm">Submit Answer</span>
        </Link>
      </footer>
    </div>
  );
}

// Simple syntax highlighting component
function CodeLine({ line }: { line: string }) {
  // Basic syntax highlighting
  const highlightedLine = line
    // Keywords
    .replace(/\b(function|const|let|var|return|for|if|else|new|typeof|instanceof)\b/g, '<span class="text-[#C792EA]">$1</span>')
    // Types
    .replace(/\b(number|string|boolean|void|null|undefined|Map)\b/g, '<span class="text-[#00D4FF]">$1</span>')
    // Numbers
    .replace(/\b(\d+)\b/g, '<span class="text-[#FFB800]">$1</span>')
    // Strings
    .replace(/(["'`][^"'`]*["'`])/g, '<span class="text-[#00ff9d]">$1</span>')
    // Comments
    .replace(/(\/\/.*$)/g, '<span class="text-[#6B7280]">$1</span>')
    // Function names
    .replace(/\b(twoSum|get|set|has)\b(?=\()/g, '<span class="text-[#00D4FF]">$1</span>');

  return <span dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }} />;
}
