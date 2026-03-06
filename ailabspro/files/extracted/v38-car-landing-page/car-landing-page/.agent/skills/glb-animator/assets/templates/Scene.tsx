"use client";

import { useGLTF, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { editable as e, useCurrentSheet } from "@theatre/r3f";

export default function {{SCENE_COMPONENT}}() {
  const sheet = useCurrentSheet();
  const scroll = useScroll();
  const { scene } = useGLTF("{{GLB_PATH}}") as { scene: THREE.Group };

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

useGLTF.preload("{{GLB_PATH}}");
