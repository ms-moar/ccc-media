# Task 3: Pricing Section

## Context

This is a Next.js 16 + React 19 + Tailwind CSS 4 project for a car landing page. The page lives in `app/page.tsx`. The site uses a dark theme (background `#0b0b0c`, white/light text). Geist Sans is the font.

This section should appear **after the Car Specs section** in `app/page.tsx`. If the Car Specs component (`app/components/CarSpecs.tsx`) doesn't exist yet, place this section after the hero section and leave a comment indicating it should follow specs.

## Objective

Display a pricing card with a primary price and a list of included features.

## Requirements

1. **Create a new component** `app/components/Pricing.tsx`.

2. **Content (placeholder values):**
   - **Model name:** "G-Wagon GLB Concept"
   - **Price:** "$148,500" with "Starting MSRP" label
   - **Included features list:**
     - 4-year / 50,000-mile warranty
     - Complimentary scheduled maintenance (3 years)
     - 2 years unlimited charging credits
     - Over-the-air software updates
     - 24/7 roadside assistance
   - **CTA button:** "Configure Yours" (styled as primary button, can be a `<button>` or `<a>` with `href="#"`)

3. **Layout:**
   - Single centered pricing card on a slightly differentiated background (e.g., `bg-neutral-900` or a subtle gradient to stand out from the `#0b0b0c` page background).
   - Card max-width ~`max-w-lg` centered with `mx-auto`.
   - Price is the visual focal point: very large, bold (`text-5xl font-bold`).
   - Feature list with checkmarks or bullet points, clean vertical spacing.
   - Section heading above the card: "Pricing" or "Own the Future".

4. **Styling:**
   - Dark theme consistent with the rest of the site.
   - Card can have a subtle border (`border border-neutral-800`) or slight background differentiation.
   - CTA button: white background, dark text, rounded, hover state (e.g., `bg-white text-black hover:bg-neutral-200 transition`).

5. **Integration:** Import and render `<Pricing />` in `app/page.tsx` after the specs section.

## Files to Create

- `app/components/Pricing.tsx`

## Files to Modify

- `app/page.tsx` — Import and place `<Pricing />` after specs.

## Out of Scope

- Do NOT implement multiple pricing tiers (just one card).
- Do NOT add payment processing or form logic.
- Do NOT modify other sections.
- No new dependencies required.
