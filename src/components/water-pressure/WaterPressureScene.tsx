"use client";

import { useRef, useState, useEffect, useMemo, useCallback, Suspense } from "react";
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
  Volume2,
  VolumeX,
  Droplets,
  Plus,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { WaterTankWorld } from "@/components/water-pressure/WaterTankWorld";
import { TankDrainSimulator } from "@/components/water-pressure/TankDrainSimulator";
import { WATER_PRESSURE_STAGES } from "@/data/water-pressure-stages";
import {
  createHole,
  computeHoleReadings,
  formatPressure,
  formatSpeed,
  formatDepth,
  formatVolumeLiters,
  formatFlowRate,
  waterSurfaceHeight,
  waterVolume,
  totalOutflowRate,
  type TankHole,
} from "@/lib/waterPressurePhysics";
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
  targetCamera,
  targetLookAt,
  controlsRef,
}: {
  targetCamera: [number, number, number];
  targetLookAt: [number, number, number];
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
    endPos.current.set(...targetCamera);
    endTarget.current.set(...targetLookAt);
    progress.current = 0;
    animating.current = true;
  }, [targetCamera, targetLookAt, camera, controlsRef]);

  useFrame((_, delta) => {
    if (!animating.current) return;
    progress.current = Math.min(progress.current + delta * 0.65, 1);
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

const HOLE_PRESETS: { label: string; fraction: number }[] = [
  { label: "Low", fraction: 0.18 },
  { label: "Mid", fraction: 0.48 },
  { label: "High", fraction: 0.78 },
];

function holesFromFractions(fractions: number[]): TankHole[] {
  return fractions.map((f) => createHole(f));
}

export default function WaterPressureScene() {
  const [showIntro, setShowIntro] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [narration, setNarration] = useState(true);
  const [manualControl, setManualControl] = useState(false);

  const stage = WATER_PRESSURE_STAGES[currentStage];
  const [fillLevel, setFillLevel] = useState(stage.fillLevel);
  const [holes, setHoles] = useState<TankHole[]>(() => holesFromFractions(stage.holes));
  const [constantWater, setConstantWater] = useState(false);
  const fillLevelRef = useRef(stage.fillLevel);

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { contextLost, canvasKey, onContextLost, remountCanvas } = useWebGLRecovery();

  useEffect(() => {
    fillLevelRef.current = fillLevel;
  }, [fillLevel]);

  const readings = useMemo(() => computeHoleReadings(fillLevel, holes), [fillLevel, holes]);
  const surfaceY = waterSurfaceHeight(fillLevel);
  const volume = waterVolume(fillLevel);
  const outflow = totalOutflowRate(fillLevel, holes);
  const isDraining = outflow > 0 && fillLevel > 0.005 && !constantWater;
  const isSteadyJets = outflow > 0 && fillLevel > 0.005 && constantWater;

  const handleFillChange = useCallback((level: number) => {
    fillLevelRef.current = level;
    setFillLevel(level);
    setManualControl(true);
  }, []);

  const refillTank = useCallback(() => {
    setManualControl(true);
    fillLevelRef.current = 1;
    setFillLevel(1);
  }, []);

  const addHole = useCallback((fraction: number) => {
    setManualControl(true);
    setHoles((prev) => {
      const exists = prev.some((h) => Math.abs(h.heightFraction - fraction) < 0.06);
      if (exists || prev.length >= 5) return prev;
      return [...prev, createHole(fraction)];
    });
  }, []);

  const removeLastHole = useCallback(() => {
    setManualControl(true);
    setHoles((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, []);

  useEffect(() => {
    if (manualControl || stage.id === "explore") return;
    setFillLevel(stage.fillLevel);
    fillLevelRef.current = stage.fillLevel;
    setHoles(holesFromFractions(stage.holes));
  }, [currentStage, stage, manualControl]);

  useEffect(() => {
    if (!isPlaying || showIntro) return;
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= WATER_PRESSURE_STAGES.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        setManualControl(false);
        return prev + 1;
      });
    }, 14000);
    return () => clearInterval(timer);
  }, [isPlaying, showIntro]);

  useEffect(() => {
    if (!narration || showIntro) return;
    speak(`${stage.title}. ${stage.description} Fun fact: ${stage.funFact}`);
  }, [currentStage, narration, showIntro, stage]);

  if (showIntro) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#060810] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-6 sm:p-8 border border-white/15 max-w-md w-full text-center"
        >
          <Droplets className="w-12 h-12 text-sky-400 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Water Pressure Lab</h1>
          <p className="text-sm text-slate-400 mb-2">Fill · Drill holes · Watch jets</p>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Fill a transparent tank, make holes at different heights, and compare how depth affects pressure and jet speed.
          </p>
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-colors"
          >
            Start Lab →
          </button>
        </motion.div>
      </div>
    );
  }

  const bgPreset = "fluid-lab" as const;

  return (
    <div className="absolute inset-0">
      {contextLost && <WebGLRecoveryOverlay onReload={remountCanvas} />}

      <Canvas key={canvasKey} camera={{ position: stage.camera, fov: 42 }} gl={LIGHT_GL} dpr={1}>
        <fog attach="fog" args={[fogColorForPreset(bgPreset), 14, 36]} />
        <WebGLContextHandler onContextLost={onContextLost} />
        <LabSceneBackground preset={bgPreset} />
        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.55} />
        </Suspense>
        <ambientLight intensity={0.4} color="#dbeafe" />
        <directionalLight position={[4, 9, 6]} intensity={1} color="#ffffff" castShadow />
        <directionalLight position={[-4, 3, -3]} intensity={0.35} color="#7dd3fc" />
        <pointLight position={[1.5, 2.5, 3]} intensity={0.55} color="#bae6fd" distance={12} decay={2} />
        <pointLight position={[-2, 1.5, 2]} intensity={0.25} color="#38bdf8" distance={10} decay={2} />

        <WaterTankWorld fillLevel={fillLevel} holes={holes} />
        <TankDrainSimulator
          fillLevelRef={fillLevelRef}
          holes={holes}
          paused={fillLevel <= 0 || constantWater}
          onFillChange={handleFillChange}
        />

        <ContactShadows position={[0, -0.04, 0]} opacity={0.35} scale={14} blur={2.5} far={6} frames={1} />
        <CameraRig targetCamera={stage.camera} targetLookAt={stage.lookAt} controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          minDistance={4}
          maxDistance={16}
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.75}
        />
      </Canvas>

      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-[5.5rem] sm:bottom-24 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-20 pointer-events-none"
        >
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 pointer-events-auto">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-400/90">
              Stage {currentStage + 1} of {WATER_PRESSURE_STAGES.length}
            </span>
            <h2 className="text-lg font-bold text-white mt-1">{stage.title}</h2>
            <p className="text-xs text-sky-200/80 mb-2">{stage.subtitle}</p>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">{stage.description}</p>
            <p className="text-[10px] text-slate-500 italic">💡 {stage.funFact}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-20 right-3 sm:right-6 z-20 pointer-events-none">
        <div className="glass-card rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 border border-sky-500/20 min-w-[10rem] max-w-[13rem]">
          <p className="text-[9px] uppercase tracking-wider text-sky-400/80 font-semibold mb-1">Live readings</p>
          <p className="text-xs text-slate-300">
            Surface: <span className="text-cyan-300 font-semibold">{formatDepth(surfaceY)}</span>
          </p>
          <p className="text-xs text-slate-300 mt-0.5">
            Fill: <span className="text-cyan-300 font-semibold">{Math.round(fillLevel * 100)}%</span>
            {" · "}
            <span className="text-cyan-300 font-semibold">{formatVolumeLiters(volume)}</span>
          </p>
          {isDraining ? (
            <p className="text-[10px] text-amber-300 mt-1">
              Draining · {formatFlowRate(outflow)} total outflow
            </p>
          ) : isSteadyJets ? (
            <p className="text-[10px] text-emerald-400 mt-1">
              Constant level · jets steady ({formatFlowRate(outflow)} outflow)
            </p>
          ) : fillLevel <= 0.005 ? (
            <p className="text-[10px] text-red-400 mt-1">Tank empty — refill to continue</p>
          ) : null}
          <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto">
            {readings.length === 0 ? (
              <p className="text-[10px] text-slate-500">Add a hole to measure pressure</p>
            ) : (
              readings.map((r, i) => (
                <div
                  key={r.hole.id}
                  className={`text-[10px] rounded-lg px-2 py-1 ${r.flowing ? "bg-sky-500/10" : "bg-white/5"}`}
                >
                  <span className="font-semibold text-sky-200">Hole {i + 1}</span>
                  <span className="text-slate-500"> @ {formatDepth(r.hole.heightFraction * 2.5)}</span>
                  {r.flowing ? (
                    <>
                      <br />
                      <span className="text-emerald-400">P = {formatPressure(r.pressurePa)}</span>
                      <span className="text-slate-500"> · </span>
                      <span className="text-cyan-400">v = {formatSpeed(r.speedMs)}</span>
                    </>
                  ) : (
                    <span className="text-red-400"> · above water</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-6 z-20">
        <div className="glass-card rounded-2xl p-3 sm:p-4 border border-white/10 space-y-3">
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Water level</span>
              <span className="text-cyan-300 font-semibold">{Math.round(fillLevel * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(fillLevel * 100)}
              onChange={(e) => {
                setManualControl(true);
                const v = Number(e.target.value) / 100;
                fillLevelRef.current = v;
                setFillLevel(v);
              }}
              className="w-full accent-sky-500"
            />
          </div>

          <label className="flex items-center justify-between gap-2 cursor-pointer select-none">
            <span className="text-[10px] text-slate-400">Keep water level constant</span>
            <button
              type="button"
              role="switch"
              aria-checked={constantWater}
              onClick={() => setConstantWater((c) => !c)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                constantWater ? "bg-emerald-600" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  constantWater ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>
          <p className="text-[9px] text-slate-500 -mt-1">
            {constantWater
              ? "Tank stays full — compare jet pressure without emptying"
              : "Water drains through holes (Torricelli outflow)"}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {HOLE_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => addHole(p.fraction)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-600/80 text-white hover:bg-sky-500"
              >
                <Plus className="w-3 h-3" /> {p.label} hole
              </button>
            ))}
            <button
              type="button"
              onClick={refillTank}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/80 text-white hover:bg-cyan-500"
            >
              <RotateCcw className="w-3 h-3" /> Refill
            </button>
            <button
              type="button"
              onClick={removeLastHole}
              disabled={holes.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-red-400 disabled:opacity-30"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          </div>

          <div className="flex items-center gap-1 pt-1 border-t border-white/5">
            <button
              type="button"
              onClick={() => setCurrentStage((s) => Math.max(0, s - 1))}
              className="p-2 rounded-lg bg-white/5 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="p-2 rounded-lg bg-sky-600/80 text-white"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStage((s) => Math.min(WATER_PRESSURE_STAGES.length - 1, s + 1))}
              className="p-2 rounded-lg bg-white/5 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setNarration((n) => !n)}
              className="p-2 rounded-lg bg-white/5 text-slate-300 ml-auto"
            >
              {narration ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
