"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import { TiltCard } from "./ui/tilt-card";

gsap.registerPlugin(ScrollTrigger);

const features = [
  "4-year / 50,000-mile warranty",
  "Complimentary scheduled maintenance (3 years)",
  "2 years unlimited charging credits",
  "Over-the-air software updates",
  "24/7 roadside assistance",
];

export default function Pricing() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const priceRef = useRef<HTMLParagraphElement | null>(null);
  const featureRefs = useRef<HTMLLIElement[]>([]);
  featureRefs.current = [];

  useGSAP(
    () => {
      if (!cardRef.current || !priceRef.current) return;
      const items = featureRefs.current.filter(Boolean);

      const counter = { value: 0 };
      const formatValue = (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(value);

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
        },
      });

      timeline.from(cardRef.current, {
        opacity: 0,
        scale: 0.92,
        duration: 0.8,
        ease: "power2.out",
      });

      timeline.to(counter, {
        value: 148500,
        duration: 1.5,
        ease: "power1.inOut",
        snap: { value: 1 },
        onStart: () => {
          if (priceRef.current) {
            priceRef.current.textContent = formatValue(0);
          }
        },
        onUpdate: () => {
          if (priceRef.current) {
            priceRef.current.textContent = formatValue(
              Math.round(counter.value)
            );
          }
        },
      });

      if (items.length) {
        timeline.from(items, {
          opacity: 0,
          x: -20,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.1,
        });
      }
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id="pricing" className="px-6 py-20 md:px-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-white/50">
            Own the Future
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
            Pricing
          </h2>
        </div>
        <TiltCard
          ref={cardRef}
          containerClassName="mx-auto w-full max-w-lg"
          className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur md:p-10"
        >
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              Model
            </p>
            <h3 className="text-2xl font-semibold text-white">
              G-Wagon GLB Concept
            </h3>
          </div>
          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              Starting MSRP
            </p>
            <p ref={priceRef} className="mt-3 text-5xl font-bold text-white">
              $148,500
            </p>
          </div>
          <ul className="mt-8 space-y-3 text-sm text-white/70">
            {features.map((feature, index) => (
              <li
                key={feature}
                ref={(element) => {
                  if (element) featureRefs.current[index] = element;
                }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                  <span className="text-xs text-white">✓</span>
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <HoverBorderGradient
            as="a"
            href="#"
            containerClassName="mt-10 w-full"
            className="w-full justify-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition-colors group-hover:bg-neutral-200"
          >
            Configure Yours
            <svg
              aria-hidden
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </HoverBorderGradient>
        </TiltCard>
      </div>
    </section>
  );
}
