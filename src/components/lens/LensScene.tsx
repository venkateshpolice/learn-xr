"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Focus,
  Eye,
} from "lucide-react";
import { LensWorld } from "@/components/lens/LensWorld";
import { LensViewfinder } from "@/components/lens/LensViewfinder";
import {
  computeLensImage,
  LENS_STAGES,
  getFocalLength,
  type LensType,
} from "@/lib/lensPhysics";
import {
  useWebGLRecovery,
  WebGLContextHandler,
  WebGLRecoveryOverlay,
  LIGHT_GL,
} from "@/components/three/WebGLRecovery";
import { LabSceneBackground, fogColorForPreset } from "@/components/three/LabSceneBackground";

function speak(text: string) {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.88;
      window.speechSynthesis.speak(u);
    }
  } catch {}
}

function CameraRig({
  target,
  controlsRef,
}: {
  target: [number, number, number];
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const animating = useRef(false);
  const startPos = useRef(new THREE.Vector3());
  const endPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const endTarget = useRef(new THREE.Vector3());
  const progress = useRef(1);

  useEffect(() => {
    startPos.current.copy(camera.position);
    startTarget.current.copy(controlsRef.current?.target ?? new THREE.Vector3());
    endPos.current.set(target[0], target[1] + 2, target[2] + 9);
    endTarget.current.set(...target);
    progress.current = 0;
    animating.current = true;
  }, [target, camera, controlsRef]);

  useFrame((_, delta) => {
    if (!animating.current) return;
    progress.current = Math.min(progress.current + delta * 0.7, 1);
    const t = 1 - Math.pow(1 - progress.current, 3);
    camera.position.lerpVectors(startPos.current, endPos.current, t);
    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(startTarget.current, endTarget.current, t);
      controlsRef.current.update();
    }
    if (progress.current >= 1) animating.current = false;
  });

  return null;
}

export default function LensScene() {
  const [showIntro, setShowIntro] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [narration, setNarration] = useState(true);
  const [lensType, setLensType] = useState<LensType>("convex");
  const [objectDistance, setObjectDistance] = useState(5);
  const [objectHeight] = useState(1.1);
  const [manualControl, setManualControl] = useState(false);

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { contextLost, canvasKey, onContextLost, remountCanvas } = useWebGLRecovery();

  const stage = LENS_STAGES[currentStage];
  const f = getFocalLength();
  const result = computeLensImage(lensType, objectDistance, objectHeight);

  useEffect(() => {
    if (manualControl || stage.id === "explore") return;
    setLensType(stage.lensType);
    setObjectDistance(stage.objectDistance);
  }, [currentStage, stage, manualControl]);

  useEffect(() => {
    if (!isPlaying || showIntro) return;
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= LENS_STAGES.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        setManualControl(false);
        return prev + 1;
      });
    }, 12000);
    return () => clearInterval(timer);
  }, [isPlaying, showIntro]);

  useEffect(() => {
    if (showIntro || !narration) return;
    speak(`${stage.title}. ${stage.description}`);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [currentStage, showIntro, narration, stage]);

  const nextStage = () => {
    setManualControl(false);
    setCurrentStage((p) => Math.min(p + 1, LENS_STAGES.length - 1));
  };
  const prevStage = () => {
    setManualControl(false);
    setCurrentStage((p) => Math.max(p - 1, 0));
  };
  const reset = () => {
    setCurrentStage(0);
    setIsPlaying(false);
    setManualControl(false);
  };

  const magLabel = Number.isFinite(result.magnification)
    ? `${Math.abs(result.magnification).toFixed(2)}×`
    : "∞";

  if (showIntro) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0a0f1a] via-[#101828] to-[#0a0f18] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-8 sm:p-10 border border-white/15 max-w-lg w-full text-center shadow-2xl"
        >
          <Focus className="w-16 h-16 text-violet-400 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Convex & Concave Lenses
          </h1>
          <p className="text-slate-400 text-xs mb-4">Interactive 3D Optics Lab</p>
          <p className="text-slate-300 mb-6 text-sm leading-relaxed">
            Move an object toward a realistic glass lens. Watch principal rays trace real and virtual images, and see the live viewfinder update as magnification changes.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-3 text-left">
              <div className="text-[10px] text-violet-300 font-semibold mb-1">Convex ⊃</div>
              <div className="text-[9px] text-slate-500">Converges light · real & virtual images</div>
            </div>
            <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-left">
              <div className="text-[10px] text-cyan-300 font-semibold mb-1">Concave ⊂</div>
              <div className="text-[9px] text-slate-500">Diverges light · always virtual image</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-600 text-white font-bold text-lg hover:from-violet-400 hover:to-cyan-500 shadow-lg transition-all active:scale-[0.98]"
          >
            Start Experience →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {contextLost && <WebGLRecoveryOverlay onReload={remountCanvas} />}

      <Canvas
        key={canvasKey}
        camera={{ position: [0, 2, 11], fov: 42 }}
        gl={{
          ...LIGHT_GL,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
        dpr={1}
      >
        <LabSceneBackground preset="lens-lab" />
        <fog attach="fog" args={[fogColorForPreset("lens-lab"), 20, 42]} />
        <WebGLContextHandler onContextLost={onContextLost} />
        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={0.55} />
        </Suspense>
        <ambientLight intensity={0.35} color="#eef2ff" />
        <directionalLight position={[4, 8, 6]} intensity={0.85} color="#ffffff" />
        <directionalLight position={[-6, 4, -2]} intensity={0.25} color="#c7d2fe" />
        <directionalLight position={[0, 2, -8]} intensity={0.15} color="#ffffff" />
        <LensWorld
          lensType={lensType}
          objectDistance={objectDistance}
          objectHeight={objectHeight}
          result={result}
        />
        <ContactShadows position={[0, -1.12, 0]} opacity={0.35} scale={20} blur={2} far={5} frames={1} />
        <CameraRig target={[0, 0, 0]} controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={5}
          maxDistance={22}
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.75}
        />
      </Canvas>

      {/* Stage panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-[5.5rem] sm:bottom-24 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-20 pointer-events-none"
        >
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 pointer-events-auto">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400/90">
              Stage {currentStage + 1} of {LENS_STAGES.length}
            </span>
            <h2 className="text-lg font-bold text-white mt-1">{stage.title}</h2>
            <p className="text-xs text-violet-300/80 mb-2">{stage.subtitle}</p>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">{stage.description}</p>
            <p className="text-[10px] text-emerald-400/90 border-t border-white/5 pt-2">{result.description}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Viewfinder — what you see through the lens */}
      <div className="absolute top-16 sm:top-20 left-3 z-20 w-36 sm:w-44">
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-white/10 bg-black/30">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Live view</span>
          </div>
          <div className="aspect-[4/3] relative">
            <LensViewfinder result={result} lensType={lensType} />
          </div>
          <div className="px-2 py-1.5 text-[9px] font-mono text-slate-400 border-t border-white/5">
            {result.isVirtual ? "Virtual · " : result.isReal ? "Real · " : ""}
            {result.isInverted ? "Inverted · " : "Upright · "}
            {magLabel}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-16 sm:top-20 right-3 sm:right-4 z-20 w-[calc(100%-10rem)] sm:w-56 max-w-[14rem] sm:max-w-none ml-auto">
        <div className="glass-card rounded-xl p-3 border border-white/10 space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Lens type</div>
          <div className="grid grid-cols-2 gap-1.5">
            {(["convex", "concave"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setLensType(t);
                  setManualControl(true);
                }}
                className={`py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                  lensType === t
                    ? t === "convex"
                      ? "bg-violet-500/25 text-violet-200 border border-violet-500/30"
                      : "bg-cyan-500/25 text-cyan-200 border border-cyan-500/30"
                    : "text-slate-400 border border-transparent hover:bg-white/[0.06]"
                }`}
              >
                {t === "convex" ? "⊃ Convex" : "⊂ Concave"}
              </button>
            ))}
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Object distance</span>
              <span>{objectDistance.toFixed(1)} u ({(objectDistance / f).toFixed(2)} F)</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={0.1}
              value={objectDistance}
              onChange={(e) => {
                setObjectDistance(Number(e.target.value));
                setManualControl(true);
              }}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-[8px] text-slate-600 mt-0.5">
              <span>Near lens</span>
              <span>Far away</span>
            </div>
          </div>

          <div className="rounded-lg bg-white/[0.04] p-2 border border-white/5 space-y-1">
            <div className="text-[9px] uppercase text-slate-500">Thin lens equation</div>
            <div className="text-[10px] font-mono text-violet-300">1/f = 1/do + 1/di</div>
            <div className="text-[9px] font-mono text-slate-400">
              do={objectDistance.toFixed(1)} · f={f.toFixed(1)} · di=
              {Number.isFinite(result.di) ? result.di.toFixed(2) : "∞"} · M={magLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Stage dots + transport */}
      <div className="absolute top-[11.5rem] sm:top-24 left-3 z-20 flex gap-1.5">
        {LENS_STAGES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setManualControl(false);
              setCurrentStage(i);
            }}
            className={`h-1.5 rounded-full transition-all ${i === currentStage ? "w-6 bg-violet-400" : "w-1.5 bg-white/20"}`}
            aria-label={s.title}
          />
        ))}
      </div>

      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 pb-[max(0px,env(safe-area-inset-bottom))]">
        <div className="glass-card rounded-2xl px-2 py-1.5 border border-white/10 flex items-center gap-1">
          <button type="button" onClick={prevStage} disabled={currentStage === 0} className="p-2 rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setIsPlaying((p) => !p)} className="p-2 rounded-lg hover:bg-white/10 text-slate-300">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button type="button" onClick={nextStage} disabled={currentStage === LENS_STAGES.length - 1} className="p-2 rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-white/10" />
          <button type="button" onClick={reset} className="p-2 rounded-lg hover:bg-white/10 text-slate-300">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setNarration((n) => !n)} className="p-2 rounded-lg hover:bg-white/10 text-slate-300">
            {narration ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
