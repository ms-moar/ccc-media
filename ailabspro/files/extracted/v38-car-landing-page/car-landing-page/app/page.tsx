import ScrollTextBeats from "./components/ScrollTextBeats";
import ScrollIndicator from "./components/ScrollIndicator";
import CarSpecs from "./components/CarSpecs";
import Pricing from "./components/Pricing";
import CTATestDrive from "./components/CTATestDrive";
import CanvasRoot from "./three/CanvasRoot";

export default function Home() {
  return (
    <div className="bg-[#0b0b0c] text-white">
      <section id="hero-scroll" className="relative h-[300vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Layer 1: 3D canvas */}
          <div className="absolute inset-0">
            <CanvasRoot />
          </div>

          {/* Layer 2: gradient scrim */}
          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/10 to-black/80" />

          {/* Layer 3: text overlay */}
          <div className="relative z-10 flex h-full w-full flex-col justify-between px-6 py-10 md:px-16">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/70">
              <span>G-Wagon</span>
              <span>Prototype X</span>
            </div>
            <div className="flex w-full flex-1 items-center justify-center">
              <ScrollTextBeats />
            </div>
            <div className="grid max-w-3xl grid-cols-1 gap-6 text-sm text-white/70 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Power</p>
                <p className="mt-2 text-base text-white">Hand-crafted V8</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Torque</p>
                <p className="mt-2 text-base text-white">627 lb-ft</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Finish</p>
                <p className="mt-2 text-base text-white">Obsidian matte</p>
              </div>
            </div>
          </div>
          <ScrollIndicator />
        </div>
      </section>
      <CarSpecs />
      <Pricing />
      <CTATestDrive />
    </div>
  );
}
