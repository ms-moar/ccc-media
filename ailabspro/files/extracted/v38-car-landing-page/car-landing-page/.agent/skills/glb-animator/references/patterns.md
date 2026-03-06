# GLB Animation Patterns

## Minimal R3F + Theatre + Scroll binding (App Router)

```tsx
"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useGLTF, useScroll } from "@react-three/drei";
import { getProject } from "@theatre/core";
import { SheetProvider, editable as e, useCurrentSheet } from "@theatre/r3f";

function Scene() {
  const sheet = useCurrentSheet();
  const scroll = useScroll();
  const { scene } = useGLTF("/models/model.glb") as { scene: THREE.Group };

  useFrame(() => {
    const length = sheet.sequence.length || 1;
    sheet.sequence.position = scroll.offset * length;
  });

  return (
    <e.group theatreKey="Model">
      <primitive object={scene} />
    </e.group>
  );
}

export default function CanvasRoot() {
  const sheet = useMemo(() => getProject("GLB Animation").sheet("Scene"), []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    Promise.all([
      import("@theatre/studio"),
      import("@theatre/extension-studio"),
    ]).then(([studioModule, extensionModule]) => {
      const studio = studioModule.default;
      const extension = extensionModule.default;
      studio.initialize();
      studio.extend(extension);
    });
  }, []);

  return (
    <Canvas>
      <ScrollControls pages={3} damping={0.2}>
        <SheetProvider sheet={sheet}>
          <Scene />
        </SheetProvider>
      </ScrollControls>
    </Canvas>
  );
}
```

## Node-level animation

- Use `gltfjsx` to inspect names: `npx gltfjsx path/to/model.glb --transform`.
- Import `nodes` and `materials` from `useGLTF` and target the desired mesh or group.
- Wrap specific objects with `e.mesh` / `e.group` and set `theatreKey` per animated object.

## Scroll binding details

- `scroll.offset` is normalized 0..1 across all pages.
- Sequence position should be `scroll.offset * sheet.sequence.length`.
- For multi-section pages, set `pages` to match sections (e.g. `pages={4}` for 4 full screens).

## Performance checklist

- Use `dpr={[1, 2]}` and `gl={{ antialias: true }}`.
- Prefer `mesh.castShadow` / `receiveShadow` for hero meshes only.
- Keep HDRI / environment maps small when possible.
