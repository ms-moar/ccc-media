"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ScrollControls,
  useGLTF,
  useScroll,
} from "@react-three/drei";
import * as THREE from "three";

const FRONT_ANGLE = 0;
const MID_ANGLE = Math.PI * 0.5;
const REAR_ANGLE = Math.PI;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const lerpVec3 = (a: THREE.Vector3, b: THREE.Vector3, t: number) =>
  new THREE.Vector3(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));

type Bounds = {
  center: THREE.Vector3;
  size: THREE.Vector3;
  offset: THREE.Vector3;
};

function CameraRig({ bounds }: { bounds: Bounds }) {
  const scroll = useScroll();
  const wheelTarget = useMemo(() => {
    return new THREE.Vector3(
      bounds.size.x * 0.35,
      -bounds.size.y * 0.15,
      bounds.size.z * 0.35
    );
  }, [bounds]);

  useFrame(({ camera }) => {
    const offset = scroll.offset;
    const baseDistance = Math.max(bounds.size.x, bounds.size.y, bounds.size.z) * 2.2;
    const closeDistance = baseDistance * 0.65;
    const baseHeight = bounds.size.y * 0.35;
    const closeHeight = bounds.size.y * 0.18;

    let angle = FRONT_ANGLE;
    let distance = baseDistance;
    let height = baseHeight;
    let target = bounds.center;

    if (offset >= 1 / 3 && offset < 2 / 3) {
      const t = easeInOutCubic((offset - 1 / 3) * 3);
      angle = lerp(FRONT_ANGLE, MID_ANGLE, t);
      distance = lerp(baseDistance, closeDistance, t);
      height = lerp(baseHeight, closeHeight, t);
      target = lerpVec3(bounds.center, wheelTarget, t);
    } else if (offset >= 2 / 3) {
      const t = easeInOutCubic((offset - 2 / 3) * 3);
      angle = lerp(MID_ANGLE, REAR_ANGLE, t);
      distance = lerp(closeDistance, baseDistance, t);
      height = lerp(closeHeight, baseHeight, t);
      target = lerpVec3(wheelTarget, bounds.center, t);
    }

    const x = Math.sin(angle) * distance;
    const z = Math.cos(angle) * distance;

    camera.position.set(target.x + x, target.y + height, target.z + z);
    camera.lookAt(target);
  });

  return null;
}

useGLTF.setDecoderPath("/draco/");

function CarModel({ onBounds }: { onBounds: (bounds: Bounds) => void }) {
  const { scene } = useGLTF("/gwagon.glb", true);
  const bounds = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const rawCenter = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(rawCenter);
    return { center: new THREE.Vector3(0, 0, 0), size, offset: rawCenter };
  }, [scene]);

  useEffect(() => {
    onBounds(bounds);
  }, [bounds, onBounds]);

  return (
    <group position={bounds.offset.clone().multiplyScalar(-1)}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/gwagon.glb");

export default function CarHero() {
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const handleBounds = useCallback((next: Bounds) => setBounds(next), []);

  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 2]}
      camera={{ fov: 40, near: 0.1, far: 2000 }}
    >
      <color attach="background" args={["#0b0b0c"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <Suspense fallback={null}>
        <Environment preset="sunset" />
        <ScrollControls pages={3} damping={0}>
          {bounds ? <CameraRig bounds={bounds} /> : null}
          <CarModel onBounds={handleBounds} />
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
}
