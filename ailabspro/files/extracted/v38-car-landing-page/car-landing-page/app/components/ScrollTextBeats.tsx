"use client";

import { useEffect, useMemo, useState } from "react";

const BEATS = [
  "The future of performance.",
  "Precision engineered for the road.",
  "Drive the evolution.",
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function beatOpacity(progress: number, index: number) {
  const segments = BEATS.length;
  const segmentSize = 1 / segments;
  const start = index * segmentSize;
  const end = start + segmentSize;
  const local = (progress - start) / segmentSize;
  const fade = 0.2;

  if (local <= 0 || local >= 1) return 0;
  if (local < fade) return local / fade;
  if (local > 1 - fade) return (1 - local) / fade;
  return 1;
}

export default function ScrollTextBeats({ sectionId = "hero-scroll" }: { sectionId?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = document.querySelector(`#${sectionId}`) as HTMLElement | null;
    if (!section) return;

    let frame = 0;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const start = window.scrollY + rect.top;
      const end = start + section.offsetHeight - window.innerHeight;
      const raw = end <= start ? 0 : (window.scrollY - start) / (end - start);
      setProgress(clamp(raw));
    };

    const onScroll = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sectionId]);

  const opacities = useMemo(() => BEATS.map((_, index) => beatOpacity(progress, index)), [progress]);

  return (
    <div className="relative w-full max-w-4xl text-center">
      <div className="relative min-h-[4.5rem] md:min-h-[6.5rem]">
        {BEATS.map((text, index) => (
          <p
            key={text}
            className="absolute left-0 right-0 text-4xl font-bold leading-tight text-white transition-opacity duration-300 ease-out md:text-6xl"
            style={{ opacity: opacities[index], textShadow: "0 12px 30px rgba(0, 0, 0, 0.45)" }}
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
