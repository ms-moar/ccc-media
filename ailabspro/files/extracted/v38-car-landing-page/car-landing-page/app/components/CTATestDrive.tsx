"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ShimmerButton } from "./ui/shimmer-button";
import { TiltCard } from "./ui/tilt-card";
gsap.registerPlugin(ScrollTrigger);

export default function CTATestDrive() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subtextRef = useRef<HTMLParagraphElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const wordRefs = useRef<HTMLSpanElement[]>([]);
  wordRefs.current = [];
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mailtoHref, setMailtoHref] = useState("");

  const headlineWords = ["Ready", "to", "drive", "it?"];

  useGSAP(
    () => {
      if (!headlineRef.current) return;
      const words = wordRefs.current.filter(Boolean);

      if (words.length) {
        gsap.from(words, {
          opacity: 0,
          y: 40,
          rotateX: 30,
          duration: 0.6,
          ease: "back.out(1.4)",
          stagger: 0.08,
          scrollTrigger: {
            trigger: headlineRef.current,
            start: "top 85%",
          },
        });
      }

      if (subtextRef.current) {
        gsap.from(subtextRef.current, {
          opacity: 0,
          duration: 0.6,
          delay: 0.3,
          scrollTrigger: {
            trigger: headlineRef.current,
            start: "top 85%",
          },
        });
      }

      if (buttonRef.current) {
        gsap.from(buttonRef.current, {
          opacity: 0,
          scale: 0.8,
          duration: 0.5,
          ease: "back.out(1.7)",
          delay: 0.5,
          scrollTrigger: {
            trigger: headlineRef.current,
            start: "top 85%",
          },
        });
      }
    },
    { scope: sectionRef }
  );

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleOpen = () => {
    setIsSubmitted(false);
    setMailtoHref("");
    setIsOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const date = String(formData.get("date") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();

    const bodyLines = [
      `Name: ${name || "N/A"}`,
      `Email: ${email || "N/A"}`,
      `Phone: ${phone || "N/A"}`,
      `Preferred date: ${date || "N/A"}`,
      `Location: ${location || "N/A"}`,
      `Notes: ${notes || "N/A"}`,
    ];

    const subject = encodeURIComponent("Test Drive Request");
    const body = encodeURIComponent(bodyLines.join("\n"));
    const mailto = `mailto:testdrive@prototypex.com?subject=${subject}&body=${body}`;
    setMailtoHref(mailto);
    window.location.href = mailto;
    setIsSubmitted(true);
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-white/10 bg-gradient-to-br from-[#0f1116] via-[#0b0b0c] to-[#070708] py-28"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left md:px-16">
        <div>
          <h2 ref={headlineRef} className="text-4xl font-bold text-white md:text-6xl">
            {headlineWords.map((word, index) => (
              <span
                key={`${word}-${index}`}
                ref={(element) => {
                  if (element) wordRefs.current[index] = element;
                }}
                className="inline-block mr-2 last:mr-0 sm:mr-3"
              >
                {word}
              </span>
            ))}
          </h2>
          <p ref={subtextRef} className="mt-4 text-lg text-neutral-400">
            Schedule a test drive at your nearest showroom.
          </p>
        </div>
        <ShimmerButton
          ref={buttonRef}
          as="button"
          type="button"
          onClick={handleOpen}
          containerClassName="rounded-none px-8 py-4 text-lg font-semibold"
          className="uppercase tracking-[0.2em]"
        >
          Book a Test Drive
        </ShimmerButton>
      </div>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <TiltCard
            role="dialog"
            aria-modal="true"
            aria-labelledby="test-drive-title"
            containerClassName="w-full max-w-2xl"
            maxTilt={4}
            scale={1}
            glare={false}
            className="rounded-3xl border border-white/10 bg-[#0f1116]/95 p-8 text-left text-white shadow-2xl backdrop-blur"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Test drive</p>
                <h3 id="test-drive-title" className="mt-3 text-3xl font-semibold">
                  Book your slot
                </h3>
                <p className="mt-3 text-sm text-white/60">
                  Tell us where and when you want to experience Prototype X. We will confirm within one business day.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-white/40 hover:text-white"
                aria-label="Close booking form"
              >
                X
              </button>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-white/70">
                    Full name
                    <input
                      name="name"
                      required
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
                      placeholder="Jordan Blake"
                    />
                  </label>
                  <label className="text-sm text-white/70">
                    Email
                    <input
                      name="email"
                      type="email"
                      required
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
                      placeholder="jordan@company.com"
                    />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-white/70">
                    Phone (optional)
                    <input
                      name="phone"
                      type="tel"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
                      placeholder="+1 (415) 555-0100"
                    />
                  </label>
                  <label className="text-sm text-white/70">
                    Preferred date
                    <input
                      name="date"
                      type="date"
                      required
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white focus:border-white/40 focus:outline-none"
                    />
                  </label>
                </div>
                <label className="text-sm text-white/70">
                  Location
                  <select
                    name="location"
                    required
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white focus:border-white/40 focus:outline-none"
                  >
                    <option value="">Select a showroom</option>
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="New York">New York</option>
                    <option value="Chicago">Chicago</option>
                    <option value="Miami">Miami</option>
                  </select>
                </label>
                <label className="text-sm text-white/70">
                  Notes (optional)
                  <textarea
                    name="notes"
                    rows={3}
                    className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
                    placeholder="Any preferences or accessibility needs?"
                  />
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-white/50">
                    By submitting, you agree to be contacted about availability.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-full border border-white/20 px-5 py-3 text-sm text-white/70 transition hover:border-white/40 hover:text-white"
                    >
                      Not now
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
                    >
                      Send request
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                <p className="text-base font-semibold text-emerald-100">Request sent.</p>
                <p className="mt-2 text-sm text-emerald-100/70">
                  We will reach out with confirmation shortly. If your email client did not open, use the link below.
                </p>
                {mailtoHref && (
                  <a
                    href={mailtoHref}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 px-4 py-2 text-sm text-emerald-100 transition hover:border-emerald-300/60"
                  >
                    Open email draft
                  </a>
                )}
              </div>
            )}
          </TiltCard>
        </div>
      )}
    </section>
  );
}
