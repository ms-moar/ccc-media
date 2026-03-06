# Task 1: Hero — Scroll-Synced Text Beats

## Context

This is a Next.js 16 + React 19 + Tailwind CSS 4 project for a car landing page. The 3D hero animation already exists and works:

- **`app/page.tsx`** — Main page with a hero section (300vh tall, sticky canvas).
- **`app/three/CanvasRoot.tsx`** — Canvas wrapper with scroll-binding to window scroll.
- **`app/three/Scene.tsx`** — 3D scene with a G-Wagon model and three-phase scroll-driven camera animation (front → side → rear, each phase is ~33% of scroll).
- **`app/components/CarHero.tsx`** — Alternate standalone hero canvas (not currently used in page.tsx).
- **`public/gwagon.glb`** — 3D model asset.
- **GSAP is NOT installed.** The scroll system uses `@react-three/drei` ScrollControls and a custom `ScrollBinder` in `CanvasRoot.tsx`.

The hero section currently has static text (headline, description, stats grid) that does NOT sync to scroll phases.

## Objective

Replace the current static hero text overlay with **three sequential text beats** that fade in/out in sync with the 3D camera animation phases.

## Requirements

1. **Three text beats tied to scroll progress:**
   - **Beat 1 (0%–33% scroll):** "The future of performance."
   - **Beat 2 (33%–66% scroll):** "Precision engineered for the road."
   - **Beat 3 (66%–100% scroll):** "Drive the evolution."

2. **Each beat should:**
   - Fade in when its scroll phase begins.
   - Hold visible during the middle of its phase.
   - Fade out as the next phase begins.
   - Use CSS transitions or `style={{ opacity }}` driven by scroll position — no additional libraries needed.

3. **Read scroll position from the DOM.** The hero section is 300vh tall with a sticky inner container. Use a scroll event listener or IntersectionObserver on the hero section to calculate a 0–1 progress value, then map it to the three beats.

4. **Typography:** Bold, minimal, large text (e.g., `text-4xl md:text-6xl font-bold`) centered over the canvas. White text with optional text-shadow for contrast against the 3D scene.

5. **Accessible fallback:** If the canvas fails to render (Suspense fallback), the three text beats should still display stacked vertically as static text.

6. **Keep the existing header** ("G-Wagon" / "GLB Concept" labels at top) — only replace the middle text overlay content.

## Files to Modify

- `app/page.tsx` — Update the text overlay inside the hero section.

## Files to Create (if needed)

- `app/components/ScrollTextBeats.tsx` — A `"use client"` component that reads scroll position and renders the three beats with opacity transitions.

## Out of Scope

- Do NOT modify the 3D scene, camera animation, or CanvasRoot.
- Do NOT install GSAP or any new dependencies.
- Do NOT touch the sections below the hero.
