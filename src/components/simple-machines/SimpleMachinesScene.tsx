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
  Weight,
} from "lucide-react";
import { SimpleMachinesWorld } from "@/components/simple-machines/SimpleMachinesWorld";
import {
  SIMPLE_MACHINE_STAGES,
  type MachineType,
} from "@/data/simple-machines-stages";
import { computeSimpleMachine } from "@/lib/simpleMachinesPhysics";
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

const MACHINE_TABS: { id: MachineType; label: string }[] = [
  { id: "lever", label: "Lever" },
  { id: "pulley", label: "Pulley" },
  { id: "inclined", label: "Ramp" },
];

export default function SimpleMachinesScene() {
  const [showIntro, setShowIntro] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [narration, setNarration] = useState(true);
  const [manualControl, setManualControl] = useState(false);

  const [machine, setMachine] = useState<MachineType>("lever");
  const [fulcrumPos, setFulcrumPos] = useState(0.5);
  const [loadWeight, setLoadWeight] = useState(5);
  const [effortWeight, setEffortWeight] = useState(5);
  const [pulleyCount, setPulleyCount] = useState(2);
  const [effortPull, setEffortPull] = useState(0.4);
  const [rampAngle, setRampAngle] = useState(20);
  const [blockWeight, setBlockWeight] = useState(8);

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { contextLost, canvasKey, onContextLost, remountCanvas } = useWebGLRecovery();

  const stage = SIMPLE_MACHINE_STAGES[currentStage];

  const result = computeSimpleMachine({
    machine,
    fulcrumPos,
    loadWeight,
    effortWeight,
    pulleyCount,
    effortPull,
    rampAngle,
    blockWeight,
  });

  useEffect(() => {
    if (manualControl || stage.id === "explore") return;
    setMachine(stage.machine);
    setFulcrumPos(stage.fulcrumPos);
    setLoadWeight(stage.loadWeight);
    setEffortWeight(stage.effortWeight);
    setPulleyCount(stage.pulleyCount);
    setEffortPull(stage.effortPull);
    setRampAngle(stage.rampAngle);
    setBlockWeight(stage.blockWeight);
  }, [currentStage, stage, manualControl]);

  useEffect(() => {
    if (!isPlaying || showIntro) return;
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= SIMPLE_MACHINE_STAGES.length - 1) {
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
    if (!narration || showIntro) return;
    speak(`${stage.title}. ${stage.description} Fun fact: ${stage.funFact}`);
  }, [currentStage, narration, showIntro, stage]);

  if (showIntro) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#06080f] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-6 sm:p-8 border border-white/15 max-w-md w-full text-center"
        >
          <Weight className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Simple Machines</h1>
          <p className="text-sm text-slate-400 mb-2">Ages 5–8 · Lever · Pulley · Inclined Plane</p>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Lift crates, tilt levers, and push boxes up ramps. Watch mechanical advantage change in real time!
          </p>
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors"
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

      <Canvas key={canvasKey} camera={{ position: stage.camera, fov: 42 }} gl={LIGHT_GL} dpr={1}>
        <LabSceneBackground preset="optics-lab" />
        <fog attach="fog" args={[fogColorForPreset("optics-lab"), 18, 40]} />
        <WebGLContextHandler onContextLost={onContextLost} />
        <Suspense fallback={null}>
          <Environment preset="warehouse" environmentIntensity={0.4} />
        </Suspense>
        <ambientLight intensity={0.35} color="#fff7ed" />
        <directionalLight position={[5, 9, 6]} intensity={0.75} color="#ffffff" castShadow />
        <directionalLight position={[-4, 5, -3]} intensity={0.2} color="#fde68a" />
        <SimpleMachinesWorld
          machine={machine}
          fulcrumPos={fulcrumPos}
          loadWeight={loadWeight}
          effortWeight={effortWeight}
          pulleyCount={pulleyCount}
          effortPull={effortPull}
          rampAngle={rampAngle}
          blockWeight={blockWeight}
          result={result}
        />
        <ContactShadows position={[0, -0.04, 0]} opacity={0.4} scale={22} blur={2} far={6} frames={1} />
        <CameraRig targetCamera={stage.camera} targetLookAt={stage.lookAt} controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={5}
          maxDistance={20}
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.78}
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
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90">
              Stage {currentStage + 1} of {SIMPLE_MACHINE_STAGES.length}
            </span>
            <h2 className="text-lg font-bold text-white mt-1">{stage.title}</h2>
            <p className="text-xs text-amber-200/80 mb-2">{stage.subtitle}</p>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">{stage.description}</p>
            <p className="text-[10px] text-slate-500 italic">💡 {stage.funFact}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Live physics readout */}
      <div className="absolute top-20 right-3 sm:right-6 z-20 pointer-events-none">
        <div className="glass-card rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 border border-amber-500/20 min-w-[9rem]">
          <p className="text-[9px] uppercase tracking-wider text-amber-400/80 font-semibold mb-1">Live Physics</p>
          <p className="text-sm font-bold text-white">MA = {result.mechanicalAdvantage.toFixed(1)}</p>
          <p className="text-[10px] text-slate-400 mt-1 leading-snug">{result.summary}</p>
          {result.canLift && (
            <span className="inline-block mt-1.5 text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              ✓ It moves!
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-6 z-20">
        <div className="glass-card rounded-2xl p-3 sm:p-4 border border-white/10 space-y-3">
          {/* Machine tabs */}
          <div className="flex gap-1.5">
            {MACHINE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMachine(tab.id);
                  setManualControl(true);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  machine === tab.id
                    ? "bg-amber-600 text-white"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sliders per machine */}
          {machine === "lever" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="text-slate-400">
                Fulcrum{" "}
                <input
                  type="range"
                  min={0.25}
                  max={0.75}
                  step={0.01}
                  value={fulcrumPos}
                  onChange={(e) => {
                    setFulcrumPos(+e.target.value);
                    setManualControl(true);
                  }}
                  className="w-full accent-amber-500"
                />
              </label>
              <label className="text-slate-400">
                Load {loadWeight.toFixed(1)} kg
                <input
                  type="range"
                  min={2}
                  max={12}
                  step={0.5}
                  value={loadWeight}
                  onChange={(e) => {
                    setLoadWeight(+e.target.value);
                    setManualControl(true);
                  }}
                  className="w-full accent-orange-500"
                />
              </label>
              <label className="text-slate-400">
                Effort {effortWeight.toFixed(1)} kg
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={0.5}
                  value={effortWeight}
                  onChange={(e) => {
                    setEffortWeight(+e.target.value);
                    setManualControl(true);
                  }}
                  className="w-full accent-cyan-500"
                />
              </label>
            </div>
          )}

          {machine === "pulley" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="text-slate-400">
                Pulleys {pulleyCount}
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={1}
                  value={pulleyCount}
                  onChange={(e) => {
                    setPulleyCount(+e.target.value);
                    setManualControl(true);
                  }}
                  className="w-full accent-amber-500"
                />
              </label>
              <label className="text-slate-400">
                Load {loadWeight.toFixed(1)} kg
                <input
                  type="range"
                  min={2}
                  max={15}
                  step={0.5}
                  value={loadWeight}
                  onChange={(e) => {
                    setLoadWeight(+e.target.value);
                    setManualControl(true);
                  }}
                  className="w-full accent-orange-500"
                />
              </label>
              <label className="text-slate-400">
                Pull {Math.round(effortPull * 100)}%
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={effortPull}
                  onChange={(e) => {
                    setEffortPull(+e.target.value);
                    setManualControl(true);
                  }}
                  className="w-full accent-cyan-500"
                />
              </label>
            </div>
          )}

          {machine === "inclined" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="text-slate-400">
                Angle {rampAngle.toFixed(0)}°
                <input
                  type="range"
                  min={10}
                  max={45}
                  step={1}
                  value={rampAngle}
                  onChange={(e) => {
                    setRampAngle(+e.target.value);
                    setManualControl(true);
                  }}
                  className="w-full accent-amber-500"
                />
              </label>
              <label className="text-slate-400">
                Box {blockWeight.toFixed(1)} kg
                <input
                  type="range"
                  min={2}
                  max={14}
                  step={0.5}
                  value={blockWeight}
                  onChange={(e) => {
                    setBlockWeight(+e.target.value);
                    setManualControl(true);
                  }}
                  className="w-full accent-orange-500"
                />
              </label>
              <label className="text-slate-400">
                Push {effortWeight.toFixed(1)} kg
                <input
                  type="range"
                  min={1}
                  max={14}
                  step={0.5}
                  value={effortWeight}
                  onChange={(e) => {
                    setEffortWeight(+e.target.value);
                    setManualControl(true);
                  }}
                  className="w-full accent-cyan-500"
                />
              </label>
            </div>
          )}

          {/* Stage nav */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setCurrentStage((s) => Math.max(0, s - 1));
                  setManualControl(false);
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                aria-label="Previous stage"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="p-2 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentStage((s) => Math.min(SIMPLE_MACHINE_STAGES.length - 1, s + 1));
                  setManualControl(false);
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                aria-label="Next stage"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentStage(0);
                  setManualControl(false);
                  setIsPlaying(false);
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                aria-label="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setNarration((n) => !n)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
              aria-label="Toggle narration"
            >
              {narration ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="hidden sm:flex items-center gap-1">
              {SIMPLE_MACHINE_STAGES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setCurrentStage(i);
                    setManualControl(false);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStage ? "bg-amber-400" : "bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Stage ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
