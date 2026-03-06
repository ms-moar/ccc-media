# Task 4: CTA — Book a Test Drive Section

## Context

This is a Next.js 16 + React 19 + Tailwind CSS 4 project for a car landing page. The page lives in `app/page.tsx`. The site uses a dark theme (background `#0b0b0c`, white/light text). Geist Sans is the font.

This section should be the **last section on the page**, placed after the Pricing section in `app/page.tsx`. If the Pricing component doesn't exist yet, place this after whatever the last section currently is.

## Objective

Create a high-impact call-to-action section to convert visitors into test drive bookings.

## Requirements

1. **Create a new component** `app/components/CTATestDrive.tsx`.

2. **Content:**
   - **Headline:** "Ready to drive it?"
   - **Subtext:** "Schedule a test drive at your nearest showroom."
   - **Primary button:** "Book a Test Drive"

3. **Layout:**
   - Full-width section with generous vertical padding (`py-24` or more).
   - Content centered, max-width constrained for readability.
   - Visually distinct from other sections — use a gradient background (e.g., subtle dark-to-darker gradient, or a hint of color like a very dark blue/charcoal gradient) to differentiate.
   - Headline large and bold (`text-4xl md:text-6xl font-bold`).
   - Subtext below headline, muted (`text-neutral-400 text-lg`).
   - Button below subtext with clear spacing.

4. **Button styling:**
   - Prominent: `bg-white text-black font-semibold px-8 py-4 rounded-full text-lg`.
   - Hover state: `hover:bg-neutral-200 transition-colors`.
   - The button is a `<button>` or `<a href="#">` — no real form submission needed.

5. **Optional enhancement (nice-to-have):**
   - A minimal inline form below the button with three fields: Name, Email, Preferred Location — and a submit button.
   - If included, use basic HTML form elements styled with Tailwind. No form validation or backend logic needed.
   - If this feels like too much scope, skip the form and just use the button.

6. **Integration:** Import and render `<CTATestDrive />` in `app/page.tsx` as the last section before the closing `</main>` or equivalent.

## Files to Create

- `app/components/CTATestDrive.tsx`

## Files to Modify

- `app/page.tsx` — Import and place `<CTATestDrive />` as the final section.

## Out of Scope

- Do NOT implement real form submission or backend endpoints.
- Do NOT modify other sections.
- No new dependencies required.
