export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#0A0A0B] px-6 lg:px-20 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header Comment */}
        <div className="font-mono text-white/30 text-sm mb-12">
          <div>// ============================================</div>
          <div>// InterviewOS - Your career, upgraded.</div>
          <div>// ============================================</div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-mono text-white/50 text-sm mb-4">// Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Features</a></li>
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Pricing</a></li>
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Demo</a></li>
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-white/50 text-sm mb-4">// Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">About</a></li>
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Blog</a></li>
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-white/50 text-sm mb-4">// Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Docs</a></li>
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">API</a></li>
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Community</a></li>
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-white/50 text-sm mb-4">// Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Privacy</a></li>
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Terms</a></li>
              <li><a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Cookies</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">GitHub</a>
            <a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Twitter</a>
            <a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">LinkedIn</a>
            <a href="#" className="text-white/30 hover:text-[#00ff9d] transition-colors text-sm">Discord</a>
          </div>
          <div className="font-mono text-white/20 text-sm">
            © 2024 InterviewOS. Built with {"<3"} for developers.
          </div>
        </div>

        {/* EOF */}
        <div className="font-mono text-white/10 text-sm text-center mt-8">// EOF</div>
      </div>
    </footer>
  );
}
