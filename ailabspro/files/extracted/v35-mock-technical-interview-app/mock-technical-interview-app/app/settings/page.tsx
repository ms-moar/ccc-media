"use client";

import { useState } from "react";
import { TerminalIcon } from "../components/ui/Icons";

// Sidebar navigation items
const sidebarItems = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "preferences", label: "Preferences", icon: PaletteIcon },
  { id: "interview", label: "Interview Settings", icon: CodeIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "billing", label: "Billing", icon: CreditCardIcon },
  { id: "account", label: "Account", icon: ShieldIcon },
];

// Icon components
function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" />
      <circle cx="17.5" cy="10.5" r=".5" />
      <circle cx="8.5" cy="7.5" r=".5" />
      <circle cx="6.5" cy="12.5" r=".5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}

// Toggle Switch Component
function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? "bg-[#00ff9d]" : "bg-[#2A2A30]"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// Input Component
function TerminalInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-white/60 font-mono">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0A0A0B] border border-[#2A2A30] rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d]/20 transition-colors"
      />
    </div>
  );
}

// Textarea Component
function TerminalTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-white/60 font-mono">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[#0A0A0B] border border-[#2A2A30] rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d]/20 transition-colors resize-none"
      />
    </div>
  );
}

// Select Component
function TerminalSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-white/60 font-mono">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0A0A0B] border border-[#2A2A30] rounded-lg px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d]/20 transition-colors appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2300ff9d' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#141416]">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Section Header Component
function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
      <p className="text-sm text-white/50">{description}</p>
    </div>
  );
}

// Profile Section
function ProfileSection() {
  const [name, setName] = useState("Alex Chen");
  const [email, setEmail] = useState("alex.chen@example.com");
  const [bio, setBio] = useState("Full-stack developer preparing for FAANG interviews. Focused on system design and algorithms.");
  const [experience, setExperience] = useState("mid");
  const [targetCompanies, setTargetCompanies] = useState("Google, Meta, Amazon");

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Profile"
        description="Manage your personal information and interview preferences"
      />

      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#00ff9d]/10 border-2 border-[#00ff9d]/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-[#00ff9d]">AC</span>
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#00ff9d] rounded-full flex items-center justify-center text-[#0A0A0B] hover:bg-[#00ff9d]/90 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </button>
        </div>
        <div>
          <p className="text-white font-medium">Profile Photo</p>
          <p className="text-sm text-white/50">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TerminalInput label="Full Name" value={name} onChange={setName} placeholder="Enter your name" />
        <TerminalInput label="Email" value={email} onChange={setEmail} placeholder="Enter your email" type="email" />
      </div>

      <TerminalTextarea
        label="Bio"
        value={bio}
        onChange={setBio}
        placeholder="Tell us about yourself and your interview goals..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TerminalSelect
          label="Experience Level"
          value={experience}
          onChange={setExperience}
          options={[
            { value: "junior", label: "Junior (0-2 years)" },
            { value: "mid", label: "Mid-Level (2-5 years)" },
            { value: "senior", label: "Senior (5-8 years)" },
            { value: "staff", label: "Staff+ (8+ years)" },
          ]}
        />
        <TerminalInput
          label="Target Companies"
          value={targetCompanies}
          onChange={setTargetCompanies}
          placeholder="e.g., Google, Meta, Amazon"
        />
      </div>

      <button className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-[#0A0A0B] px-6 py-3 rounded-lg font-bold font-mono text-sm transition-all glow-primary">
        Save Changes
      </button>
    </div>
  );
}

// Preferences Section
function PreferencesSection() {
  const [darkMode, setDarkMode] = useState(true);
  const [editorTheme, setEditorTheme] = useState("monokai");
  const [fontSize, setFontSize] = useState("14");
  const [soundEffects, setSoundEffects] = useState(true);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Preferences"
        description="Customize your InterviewOS experience"
      />

      {/* Theme Toggle */}
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-dot terminal-dot-red" />
          <div className="terminal-dot terminal-dot-yellow" />
          <div className="terminal-dot terminal-dot-green" />
          <span className="ml-2 text-xs text-white/40 font-mono">appearance.config</span>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Dark Mode</p>
              <p className="text-sm text-white/50">Use dark theme across the application</p>
            </div>
            <ToggleSwitch enabled={darkMode} onChange={setDarkMode} />
          </div>

          <div className="border-t border-[#2A2A30] pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Sound Effects</p>
                <p className="text-sm text-white/50">Play sounds for timer and notifications</p>
              </div>
              <ToggleSwitch enabled={soundEffects} onChange={setSoundEffects} />
            </div>
          </div>
        </div>
      </div>

      {/* Editor Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TerminalSelect
          label="Code Editor Theme"
          value={editorTheme}
          onChange={setEditorTheme}
          options={[
            { value: "monokai", label: "Monokai" },
            { value: "dracula", label: "Dracula" },
            { value: "github-dark", label: "GitHub Dark" },
            { value: "one-dark", label: "One Dark Pro" },
            { value: "nord", label: "Nord" },
            { value: "synthwave", label: "SynthWave '84" },
          ]}
        />
        <TerminalSelect
          label="Font Size"
          value={fontSize}
          onChange={setFontSize}
          options={[
            { value: "12", label: "12px - Small" },
            { value: "14", label: "14px - Medium" },
            { value: "16", label: "16px - Large" },
            { value: "18", label: "18px - Extra Large" },
          ]}
        />
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <label className="block text-sm text-white/60 font-mono">Preview</label>
        <div className="bg-[#0A0A0B] border border-[#2A2A30] rounded-lg p-4 font-mono" style={{ fontSize: `${fontSize}px` }}>
          <div className="text-white/40">{"// Code preview"}</div>
          <div><span className="text-[#C792EA]">function</span> <span className="text-[#00D4FF]">solve</span>(input) {"{"}</div>
          <div className="pl-4"><span className="text-[#C792EA]">return</span> input.<span className="text-[#00D4FF]">map</span>(x {"=>"} x * <span className="text-[#FFB800]">2</span>);</div>
          <div>{"}"}</div>
        </div>
      </div>

      <button className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-[#0A0A0B] px-6 py-3 rounded-lg font-bold font-mono text-sm transition-all glow-primary">
        Save Preferences
      </button>
    </div>
  );
}

// Interview Settings Section
function InterviewSettingsSection() {
  const [duration, setDuration] = useState("45");
  const [difficulty, setDifficulty] = useState("adaptive");
  const [interviewTypes, setInterviewTypes] = useState({
    technical: true,
    behavioral: true,
    systemDesign: true,
  });
  const [feedbackVerbosity, setFeedbackVerbosity] = useState("detailed");

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Interview Settings"
        description="Configure your mock interview experience"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TerminalSelect
          label="Session Duration"
          value={duration}
          onChange={setDuration}
          options={[
            { value: "30", label: "30 minutes - Quick" },
            { value: "45", label: "45 minutes - Standard" },
            { value: "60", label: "60 minutes - Full" },
            { value: "90", label: "90 minutes - Extended" },
          ]}
        />
        <TerminalSelect
          label="Difficulty Level"
          value={difficulty}
          onChange={setDifficulty}
          options={[
            { value: "easy", label: "Easy - Fundamentals" },
            { value: "medium", label: "Medium - Intermediate" },
            { value: "hard", label: "Hard - Advanced" },
            { value: "adaptive", label: "Adaptive - AI Adjusts" },
          ]}
        />
      </div>

      {/* Interview Types */}
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-dot terminal-dot-red" />
          <div className="terminal-dot terminal-dot-yellow" />
          <div className="terminal-dot terminal-dot-green" />
          <span className="ml-2 text-xs text-white/40 font-mono">interview_types.json</span>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-white/60 font-mono mb-4">{"// Select interview types to practice"}</p>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <span className="text-[#00ff9d] font-mono text-sm">TECHNICAL</span>
              <span className="text-white/40 text-sm">Data structures & algorithms</span>
            </div>
            <ToggleSwitch
              enabled={interviewTypes.technical}
              onChange={(value) => setInterviewTypes({ ...interviewTypes, technical: value })}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-[#2A2A30]">
            <div className="flex items-center gap-3">
              <span className="text-[#00D4FF] font-mono text-sm">BEHAVIORAL</span>
              <span className="text-white/40 text-sm">STAR method questions</span>
            </div>
            <ToggleSwitch
              enabled={interviewTypes.behavioral}
              onChange={(value) => setInterviewTypes({ ...interviewTypes, behavioral: value })}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-[#2A2A30]">
            <div className="flex items-center gap-3">
              <span className="text-[#C792EA] font-mono text-sm">SYSTEM DESIGN</span>
              <span className="text-white/40 text-sm">Architecture & scalability</span>
            </div>
            <ToggleSwitch
              enabled={interviewTypes.systemDesign}
              onChange={(value) => setInterviewTypes({ ...interviewTypes, systemDesign: value })}
            />
          </div>
        </div>
      </div>

      <TerminalSelect
        label="AI Feedback Verbosity"
        value={feedbackVerbosity}
        onChange={setFeedbackVerbosity}
        options={[
          { value: "concise", label: "Concise - Key points only" },
          { value: "balanced", label: "Balanced - Moderate detail" },
          { value: "detailed", label: "Detailed - Comprehensive feedback" },
          { value: "verbose", label: "Verbose - Maximum detail" },
        ]}
      />

      <button className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-[#0A0A0B] px-6 py-3 rounded-lg font-bold font-mono text-sm transition-all glow-primary">
        Save Settings
      </button>
    </div>
  );
}

// Notifications Section
function NotificationsSection() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [practiceReminders, setPracticeReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [tipsAndUpdates, setTipsAndUpdates] = useState(false);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Notifications"
        description="Manage how you receive updates and reminders"
      />

      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-dot terminal-dot-red" />
          <div className="terminal-dot terminal-dot-yellow" />
          <div className="terminal-dot terminal-dot-green" />
          <span className="ml-2 text-xs text-white/40 font-mono">notifications.config</span>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-sm text-white/50">Receive important updates via email</p>
            </div>
            <ToggleSwitch enabled={emailNotifications} onChange={setEmailNotifications} />
          </div>

          <div className="flex items-center justify-between border-t border-[#2A2A30] pt-6">
            <div>
              <p className="text-white font-medium">Practice Reminders</p>
              <p className="text-sm text-white/50">Get reminded to practice regularly</p>
            </div>
            <ToggleSwitch enabled={practiceReminders} onChange={setPracticeReminders} />
          </div>

          <div className="flex items-center justify-between border-t border-[#2A2A30] pt-6">
            <div>
              <p className="text-white font-medium">Weekly Progress Report</p>
              <p className="text-sm text-white/50">Receive a summary of your weekly progress</p>
            </div>
            <ToggleSwitch enabled={weeklyReport} onChange={setWeeklyReport} />
          </div>

          <div className="flex items-center justify-between border-t border-[#2A2A30] pt-6">
            <div>
              <p className="text-white font-medium">Tips & Product Updates</p>
              <p className="text-sm text-white/50">Stay informed about new features and tips</p>
            </div>
            <ToggleSwitch enabled={tipsAndUpdates} onChange={setTipsAndUpdates} />
          </div>
        </div>
      </div>

      <button className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-[#0A0A0B] px-6 py-3 rounded-lg font-bold font-mono text-sm transition-all glow-primary">
        Save Preferences
      </button>
    </div>
  );
}

// Billing Section (Placeholder)
function BillingSection() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Billing"
        description="Manage your subscription and payment methods"
      />

      {/* Current Plan */}
      <div className="terminal-window glow-primary">
        <div className="terminal-header">
          <div className="terminal-dot terminal-dot-red" />
          <div className="terminal-dot terminal-dot-yellow" />
          <div className="terminal-dot terminal-dot-green" />
          <span className="ml-2 text-xs text-white/40 font-mono">current_plan.txt</span>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">Pro Plan</span>
                <span className="text-xs bg-[#00ff9d]/10 text-[#00ff9d] px-2 py-1 rounded font-mono">ACTIVE</span>
              </div>
              <p className="text-sm text-white/50 mt-1">Unlimited interviews, all features</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#00ff9d]">$29<span className="text-sm text-white/50">/mo</span></p>
              <p className="text-xs text-white/40">Renews Jan 15, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-[#141416] border border-[#2A2A30] rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-[#0A0A0B] rounded flex items-center justify-center border border-[#2A2A30]">
              <span className="text-xs font-mono text-[#00D4FF]">VISA</span>
            </div>
            <div>
              <p className="text-white font-mono">**** **** **** 4242</p>
              <p className="text-sm text-white/50">Expires 12/26</p>
            </div>
          </div>
          <button className="text-[#00ff9d] text-sm font-mono hover:underline">Update</button>
        </div>
      </div>

      {/* Billing History Link */}
      <div className="flex items-center justify-between py-4 border-t border-[#2A2A30]">
        <span className="text-white/60">View billing history</span>
        <button className="text-[#00ff9d] text-sm font-mono hover:underline flex items-center gap-1">
          View All
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Account Section (Placeholder)
function AccountSection() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Account"
        description="Manage your account security and data"
      />

      {/* Password Change */}
      <div className="bg-[#141416] border border-[#2A2A30] rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
        <div className="space-y-4">
          <TerminalInput label="Current Password" value="" onChange={() => {}} type="password" placeholder="Enter current password" />
          <TerminalInput label="New Password" value="" onChange={() => {}} type="password" placeholder="Enter new password" />
          <TerminalInput label="Confirm New Password" value="" onChange={() => {}} type="password" placeholder="Confirm new password" />
        </div>
        <button className="mt-6 bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-[#0A0A0B] px-6 py-3 rounded-lg font-bold font-mono text-sm transition-all glow-primary">
          Update Password
        </button>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-[#141416] border border-[#2A2A30] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Two-Factor Authentication</h3>
            <p className="text-sm text-white/50 mt-1">Add an extra layer of security to your account</p>
          </div>
          <button className="border border-[#00ff9d] text-[#00ff9d] px-4 py-2 rounded-lg font-mono text-sm hover:bg-[#00ff9d]/10 transition-colors">
            Enable 2FA
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-[#FF6B6B]/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-[#FF6B6B] mb-2">Danger Zone</h3>
        <p className="text-sm text-white/50 mb-4">Irreversible and destructive actions</p>
        <div className="flex gap-4">
          <button className="border border-[#FF6B6B]/50 text-[#FF6B6B] px-4 py-2 rounded-lg font-mono text-sm hover:bg-[#FF6B6B]/10 transition-colors">
            Export Data
          </button>
          <button className="border border-[#FF6B6B]/50 text-[#FF6B6B] px-4 py-2 rounded-lg font-mono text-sm hover:bg-[#FF6B6B]/10 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Settings Page
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection />;
      case "preferences":
        return <PreferencesSection />;
      case "interview":
        return <InterviewSettingsSection />;
      case "notifications":
        return <NotificationsSection />;
      case "billing":
        return <BillingSection />;
      case "account":
        return <AccountSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] grid-bg">
      {/* Header */}
      <header className="border-b border-[#2A2A30] bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#00ff9d] rounded flex items-center justify-center text-[#0A0A0B] font-bold text-sm">
                <TerminalIcon />
              </div>
              <h1 className="text-xl font-bold font-mono tracking-tighter text-white">
                Interview<span className="text-[#00ff9d]">OS</span>
              </h1>
            </a>
            <span className="text-white/30 mx-2">/</span>
            <span className="text-white/60 font-mono text-sm">settings</span>
          </div>
          <a
            href="/dashboard"
            className="text-sm text-white/60 hover:text-[#00ff9d] transition-colors font-mono flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Dashboard
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <nav className="terminal-window sticky top-24">
              <div className="terminal-header">
                <div className="terminal-dot terminal-dot-red" />
                <div className="terminal-dot terminal-dot-yellow" />
                <div className="terminal-dot terminal-dot-green" />
                <span className="ml-2 text-xs text-white/40 font-mono">settings.nav</span>
              </div>
              <div className="p-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        isActive
                          ? "bg-[#00ff9d]/10 text-[#00ff9d]"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon />
                      <span className="font-mono text-sm">{item.label}</span>
                      {isActive && (
                        <span className="ml-auto text-[#00ff9d] animate-blink">_</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-[#141416] border border-[#2A2A30] rounded-2xl p-8 card-hover">
              {renderSection()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
