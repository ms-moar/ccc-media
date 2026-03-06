"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

useGLTF.setDecoderPath("/draco/");

/* total orbit sweep: 0 → 270 ° (front → right → rear → left side) */
const TOTAL_ANGLE = Math.PI * 1.5;

/* scroll fraction where the static hold ends and movement begins */
const HOLD = 0.05;

/* 5th-order Hermite – C2 continuous, zero velocity at endpoints */
function smootherstep(t: number): number {
  t = Math.max(0, Math.min(1, t));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

type Bounds = { size: THREE.Vector3; offset: THREE.Vector3 };

export default function Scene() {
  const scroll = useScroll();
  const { scene } = useGLTF("/gwagon.glb", true) as { scene: THREE.Group };

  /* ---- bounds (once) ---- */
  const bounds = useMemo<Bounds>(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    return { size, offset: center };
  }, [scene]);

  /* ---- derived constants (once) ---- */
  const config = useMemo(() => {
    const maxDim = Math.max(bounds.size.x, bounds.size.y, bounds.size.z);
    const baseDistance = maxDim * 1.6;
    const closeDistance = baseDistance * 0.5;
    const baseHeight = bounds.size.y * 0.35;
    const closeHeight = bounds.size.y * 0.1;
    /* lookAt offset during the close-up – shifts focus onto the body */
    const detailOffset = new THREE.Vector3(0, -bounds.size.y * 0.1, 0);
    return { baseDistance, closeDistance, baseHeight, closeHeight, detailOffset };
  }, [bounds.size]);

  /* ---- pre-allocated vectors (no GC in render loop) ---- */
  const goalPos = useRef(new THREE.Vector3());
  const goalTarget = useRef(new THREE.Vector3());
  const smoothPos = useRef(new THREE.Vector3());
  const smoothTarget = useRef(new THREE.Vector3());
  const needsInit = useRef(true);

  /* ---- shadows ---- */
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  /* ---- per-frame camera drive ---- */
  useFrame(({ camera }, delta) => {
    const offset = scroll.offset;

    let angle: number;
    let distance: number;
    let height: number;
    let tx: number;
    let ty: number;
    let tz: number;

    if (offset < HOLD) {
      /* brief static front view */
      angle = 0;
      distance = config.baseDistance;
      height = config.baseHeight;
      tx = 0;
      ty = 0;
      tz = 0;
    } else {
      /* continuous 270° sweep with bell-curve zoom */
      const t = smootherstep((offset - HOLD) / (1 - HOLD));

      /* orbit angle: 0 → 270° */
      angle = TOTAL_ANGLE * t;

      /* sin(π·t) → 0 at start, peaks at 1 in the middle, 0 at end */
      const zoom = Math.sin(Math.PI * t);

      distance = config.baseDistance + (config.closeDistance - config.baseDistance) * zoom;
      height = config.baseHeight + (config.closeHeight - config.baseHeight) * zoom;

      /* shift lookAt toward body detail during the close-up */
      tx = config.detailOffset.x * zoom;
      ty = config.detailOffset.y * zoom;
      tz = config.detailOffset.z * zoom;
    }

    /* spherical → cartesian */
    goalPos.current.set(
      tx + Math.sin(angle) * distance,
      ty + height,
      tz + Math.cos(angle) * distance,
    );
    goalTarget.current.set(tx, ty, tz);

    /* first frame: snap to goal instantly */
    if (needsInit.current) {
      smoothPos.current.copy(goalPos.current);
      smoothTarget.current.copy(goalTarget.current);
      needsInit.current = false;
    }

    /* frame-rate-independent exponential smoothing (THREE.MathUtils.damp) */
    const lambda = 10; // responsiveness – higher = snappier
    const dt = Math.min(delta, 0.05); // clamp to prevent jumps on tab-switch

    smoothPos.current.x = THREE.MathUtils.damp(smoothPos.current.x, goalPos.current.x, lambda, dt);
    smoothPos.current.y = THREE.MathUtils.damp(smoothPos.current.y, goalPos.current.y, lambda, dt);
    smoothPos.current.z = THREE.MathUtils.damp(smoothPos.current.z, goalPos.current.z, lambda, dt);

    smoothTarget.current.x = THREE.MathUtils.damp(smoothTarget.current.x, goalTarget.current.x, lambda, dt);
    smoothTarget.current.y = THREE.MathUtils.damp(smoothTarget.current.y, goalTarget.current.y, lambda, dt);
    smoothTarget.current.z = THREE.MathUtils.damp(smoothTarget.current.z, goalTarget.current.z, lambda, dt);

    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothTarget.current);
  });

  return (
    <group position={bounds.offset.clone().multiplyScalar(-1)}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/gwagon.glb");
