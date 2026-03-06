# Task 2: Car Specs Section

## Context

This is a Next.js 16 + React 19 + Tailwind CSS 4 project for a car landing page. The page lives in `app/page.tsx`. The site uses a dark theme (background `#0b0b0c`, white/light text). Geist Sans is the font. Tailwind CSS 4 is used for all styling.

Currently `app/page.tsx` has a hero section followed by a basic description section. You need to add a **Car Specs** section after the hero.

## Objective

Add a structured, easy-to-scan vehicle specifications section below the hero.

## Requirements

1. **Create a new component** `app/components/CarSpecs.tsx` (server component — no `"use client"` needed unless adding interactivity).

2. **Spec items to display** (use these placeholder values):
   | Label | Value | Descriptor |
   |-------|-------|-----------|
   | Range | 350 mi | EPA estimated |
   | Top Speed | 155 mph | Electronically limited |
   | 0–60 mph | 3.2 s | Launch control |
   | Power | 603 hp | Combined output |
   | Drivetrain | AWD | Permanent all-wheel |
   | Battery | 120 kWh | Lithium-ion |
   | Charging | 22 min | 10%–80% DC fast charge |

3. **Layout:**
   - Responsive grid: 3 columns on desktop (`md:grid-cols-3`), 2 on tablet (`sm:grid-cols-2`), 1 on mobile.
   - Each spec item is a card/cell with: **value** (large, bold), **label** (medium), and **descriptor** (small, muted).
   - Use subtle borders or dividers between items — no heavy card shadows.
   - Section heading: "Specifications" or similar.

4. **Styling:**
   - Match the dark theme: dark background, white text, muted descriptors (`text-neutral-400` or similar).
   - High-contrast values — use `text-white text-3xl font-bold` or similar for the numbers.
   - Clean spacing: `py-20 px-6` or equivalent for section padding.

5. **Integration:** Import and render `<CarSpecs />` in `app/page.tsx` below the hero section (replace or augment the existing description section).

## Files to Create

- `app/components/CarSpecs.tsx`

## Files to Modify

- `app/page.tsx` — Import and place `<CarSpecs />` after the hero section.

## Out of Scope

- Do NOT modify the hero section or 3D canvas.
- Do NOT add animations or scroll effects to this section.
- No new dependencies required.
