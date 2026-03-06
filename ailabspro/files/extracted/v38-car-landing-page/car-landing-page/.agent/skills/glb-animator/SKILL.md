---
name: glb-animator
description: "Animate GLB/GLTF models with React Three Fiber, Theatre.js, and scroll binding. Use when a user asks to implement high-fidelity GLB animations, set up R3F + Theatre.js wiring, or map scroll to animation timelines in React/Next.js projects. Handles installing deps, scaffolding scene components, and implementing prompt-directed animation beats with production-level polish."
---

# GLB Animator

## Goal

Implement prompt-directed, high-fidelity GLB animations with React Three Fiber + Theatre.js, bound to scroll. Use the included scaffold script to generate a working baseline, then refine lighting, camera, and timeline cues to match the prompt precisely.

## Inputs to confirm

- GLB file path (prefer `public/...` with a `/models/foo.glb` public URL).
- Framework details (Next.js app router vs. other React setup).
- Target page/component location and whether it can be overwritten.
- Animation intent: beats, timing, camera moves, object highlights, easing.
- Any named nodes/meshes in the GLB (or permission to run `gltfjsx`).

## Quick start (one command scaffold)

Run the scaffold script to generate a scroll-bound R3F + Theatre scene:

```bash
python3 skills/glb-animator/scripts/scaffold_glb_animation.py \
  --glb "/models/your-model.glb" \
  --out-dir app/three \
  --scene-name Scene \
  --canvas-name CanvasRoot \
  --project-name "GLB Animation" \
  --sheet-name "Scene" \
  --pages 3
```

Optional: also create a page file (overwrites only with `--force`):

```bash
python3 skills/glb-animator/scripts/scaffold_glb_animation.py \
  --glb "/models/your-model.glb" \
  --out-dir app/three \
  --with-page app/page.tsx \
  --force
```

## Workflow

1. Verify dependencies.
   - Install: `three`, `@react-three/fiber`, `@react-three/drei`, `@theatre/core`, `@theatre/r3f`, `@theatre/studio`, `@theatre/extension-studio`.
   - Ensure client components for any `Canvas` usage (Next.js app router requires `"use client"`).

2. Scaffold base components.
   - Use the script above to create `Scene` and `CanvasRoot`.
   - The generated setup already maps scroll to `sheet.sequence.position`.

3. Inspect the GLB and target nodes.
   - If object names matter, run `npx gltfjsx path/to/model.glb --transform`.
   - Wrap animated groups with `editable` (`e.group`, `e.mesh`) and use `theatreKey` per object.

4. Implement prompt-directed animation.
   - In Theatre Studio, create keyframes that match the prompt's beats.
   - Map each beat to a clear scroll range (e.g. 0–0.25, 0.25–0.6, 0.6–1.0).
   - Use easing curves that fit the brief (cinematic = soft ease, tech = sharper ease).

5. Polish for "perfection".
   - Adjust camera, DOF, lighting, and shadows to match the visual narrative.
   - Validate scroll smoothness (no jitter) and align keyframes with scroll positions.
   - Ensure model scale and ground contact feel physically consistent.

## Quality checklist

- Animation beats match the prompt in timing and intention.
- Theatre timeline length aligns with `ScrollControls pages`.
- Camera moves are smooth and purposeful, not accidental.
- Lighting supports the hero model and avoids overexposure.
- No warnings in console; GLB preloaded.

## References

- Use `references/patterns.md` for canonical code patterns and performance tips.
