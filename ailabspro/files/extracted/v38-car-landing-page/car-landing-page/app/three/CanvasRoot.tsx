"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, ScrollControls, useScroll } from "@react-three/drei";
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { UnsignedByteType } from "three";

import Scene from "./Scene";

function ScrollBinder({ selector }: { selector: string }) {
  const scroll = useScroll();

  useEffect(() => {
    const section = document.querySelector(selector) as HTMLElement | null;
    if (!section) return;

    let frame = 0;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const start = window.scrollY + rect.top;
      const end = start + section.offsetHeight - window.innerHeight;
      const maxScroll = scroll.el.scrollHeight - scroll.el.clientHeight;
      const progress = end <= start ? 0 : (window.scrollY - start) / (end - start);
      const clamped = Math.min(1, Math.max(0, progress));
      scroll.el.scrollTop = clamped * maxScroll;
    };

    const onScroll = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scroll, selector]);

  return null;
}

const POSTFX_DEBUG = false;

function PostFX() {
  const gl = useThree((state) => state.gl);
  const multisampling = gl.capabilities.isWebGL2 ? 4 : 0;

  const dof = POSTFX_DEBUG
    ? { worldFocusRange: 1.6, focalLength: 0.045, bokehScale: 3 }
    : { worldFocusRange: 2.6, focalLength: 0.035, bokehScale: 1.35 };

  const bloom = POSTFX_DEBUG
    ? {
        luminanceThreshold: 0.1,
        luminanceSmoothing: 0.25,
        intensity: 2.4,
        radius: 0.85,
      }
    : {
        luminanceThreshold: 0.6,
        luminanceSmoothing: 0.25,
        intensity: 0.9,
        radius: 0.8,
      };

  const chromaticOffset = POSTFX_DEBUG ? [0.02, 0.015] : [0.00075, 0.00055];
  const vignette = POSTFX_DEBUG ? { offset: 0.2, darkness: 1.1 } : { offset: 0.38, darkness: 0.6 };
  const noise = POSTFX_DEBUG
    ? { blendFunction: BlendFunction.ADD, opacity: 0.35 }
    : { blendFunction: BlendFunction.SOFT_LIGHT, opacity: 0.12 };

  return (
    <EffectComposer multisampling={multisampling} frameBufferType={UnsignedByteType} depthBuffer>
      <DepthOfField
        target={[0, 0.2, 0]}
        worldFocusRange={dof.worldFocusRange}
        focalLength={dof.focalLength}
        bokehScale={dof.bokehScale}
      />
      <Bloom
        mipmapBlur
        luminanceThreshold={bloom.luminanceThreshold}
        luminanceSmoothing={bloom.luminanceSmoothing}
        intensity={bloom.intensity}
        radius={bloom.radius}
      />
      <ChromaticAberration offset={chromaticOffset} />
      <Vignette offset={vignette.offset} darkness={vignette.darkness} />
      <Noise blendFunction={noise.blendFunction} opacity={noise.opacity} />
    </EffectComposer>
  );
}

export default function CanvasRoot({ sectionId = "hero-scroll" }: { sectionId?: string }) {
  return (
    <div className="h-screen w-full">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false }}
        camera={{ fov: 40, near: 0.1, far: 2000 }}
      >
        <color attach="background" args={["#0b0b0c"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[6, 8, 6]} intensity={1.2} />
        <Environment preset="warehouse" />
        <ScrollControls pages={3} damping={0.12} style={{ pointerEvents: "none" }}>
          <ScrollBinder selector={`#${sectionId}`} />
          <Scene />
        </ScrollControls>
        <PostFX />
      </Canvas>
    </div>
  );
}
