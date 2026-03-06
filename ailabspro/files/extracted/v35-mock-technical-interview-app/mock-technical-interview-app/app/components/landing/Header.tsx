import Link from "next/link";
import { TerminalIcon } from "../ui/Icons";

export function Header() {
  return (
    <header className="relative z-50 flex items-center justify-between px-6 lg:px-20 py-6 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#00ff9d] rounded flex items-center justify-center text-[#0A0A0B] font-bold text-sm">
          <TerminalIcon />
        </div>
        <h2 className="text-xl font-bold font-mono tracking-tighter text-white">
          Interview<span className="text-[#00ff9d]">OS</span>
        </h2>
      </Link>

      <nav className="hidden md:flex items-center gap-10">
        <a className="text-sm font-medium text-white/70 hover:text-[#00ff9d] transition-colors" href="#features">Features</a>
        <a className="text-sm font-medium text-white/70 hover:text-[#00ff9d] transition-colors" href="#pricing">Pricing</a>
        <a className="text-sm font-medium text-white/70 hover:text-[#00ff9d] transition-colors" href="#how-it-works">How It Works</a>
        <Link className="text-sm font-medium text-white/70 hover:text-[#00ff9d] transition-colors" href="/signin">Sign In</Link>
      </nav>

      <Link href="/signup" className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-[#0A0A0B] px-6 py-2 rounded-lg text-sm font-bold tracking-tight transition-all glow-primary">
        Get Started
      </Link>
    </header>
  );
}
