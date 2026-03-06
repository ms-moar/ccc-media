"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { TiltCard } from "./ui/tilt-card";
gsap.registerPlugin(ScrollTrigger);

const specs = [
  { label: "Range", value: "350 mi", descriptor: "EPA estimated" },
  { label: "Top Speed", value: "155 mph", descriptor: "Electronically limited" },
  { label: "0\u201360 mph", value: "3.2 s", descriptor: "Launch control" },
  { label: "Power", value: "603 hp", descriptor: "Combined output" },
  { label: "Drivetrain", value: "AWD", descriptor: "Permanent all-wheel" },
  { label: "Battery", value: "120 kWh", descriptor: "Lithium-ion" },
  { label: "Charging", value: "22 min", descriptor: "10%\u201380% DC fast charge" },
];

export default function CarSpecs() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  cardRefs.current = [];

  useGSAP(
    () => {
      if (!headingRef.current || !descriptionRef.current) return;

      gsap.from(headingRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%",
        },
      });

      gsap.from(descriptionRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.1,
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%",
        },
      });
    },
    { scope: sectionRef }
  );

  useGSAP(
    () => {
      if (!gridRef.current) return;
      const cards = cardRefs.current.filter(Boolean);
      if (!cards.length) return;
      gsap.from(cards, {
        opacity: 0,
        y: 60,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="border-t border-white/10 px-6 py-20 md:px-16"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-3">
          <div ref={headingRef} className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Specifications
            </p>
            <h2 className="text-3xl font-semibold text-white md:text-4xl">
              Performance by the numbers.
            </h2>
          </div>
          <p ref={descriptionRef} className="max-w-2xl text-sm text-white/70">
            A snapshot of the core figures that define the GLB Concept, tuned
            for instant readability.
          </p>
        </div>
        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"
        >
          {specs.map((spec, index) => (
            <TiltCard
              key={spec.label}
              ref={(element) => {
                if (element) cardRefs.current[index] = element;
              }}
              containerClassName="h-full"
              className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="mb-3 h-10 w-10" />
              <p className="text-3xl font-bold text-white">{spec.value}</p>
              <p className="mt-3 text-base font-medium text-white/80">
                {spec.label}
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                {spec.descriptor}
              </p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
