"use client";

import { useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls } from "@react-three/drei";
import { getProject } from "@theatre/core";
import { SheetProvider } from "@theatre/r3f";

import {{SCENE_COMPONENT}} from "./{{SCENE_COMPONENT}}";

export default function {{CANVAS_COMPONENT}}() {
  const sheet = useMemo(
    () => getProject("{{PROJECT_NAME}}").sheet("{{SHEET_NAME}}"),
    []
  );

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
    <div className="h-screen w-full">
      <Canvas dpr={[1, 2]} gl={{ antialias: true }} shadows>
        <color attach="background" args={["#f2f2f2"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[6, 8, 6]} intensity={1.2} />
        <ScrollControls pages={{{PAGES}}} damping={0.2}>
          <SheetProvider sheet={sheet}>
            <{{SCENE_COMPONENT}} />
          </SheetProvider>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
