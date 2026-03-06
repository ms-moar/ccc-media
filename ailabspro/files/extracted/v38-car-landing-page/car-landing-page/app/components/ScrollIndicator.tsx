"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollIndicator() {
  const [isDismissed, setIsDismissed] = useState(false);
  const hasDismissedRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (hasDismissedRef.current) return;
      const section = document.getElementById("hero-scroll");
      if (!section) return;

      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight || 1;
      const scrollY = window.scrollY;
      const progress = (scrollY - sectionTop) / sectionHeight;

      if (progress > 0.1) {
        hasDismissedRef.current = true;
        setIsDismissed(true);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-500 ${
        isDismissed ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex h-12 w-12 flex-col items-center justify-center">
        <svg
          className="h-6 w-6 animate-bounce text-white/70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
