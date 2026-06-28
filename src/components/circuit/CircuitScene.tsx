"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
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
  Zap,
  Plus,
  Trash2,
  Cable,
  BookOpen,
  Wrench,
} from "lucide-react";
import { CircuitWorld } from "@/components/circuit/CircuitWorld";
import { CircuitBuilderWorld } from "@/components/circuit/CircuitBuilderWorld";
import { CircuitComponentPalette } from "@/components/circuit/CircuitComponentPalette";
import { CircuitBloom, CIRCUIT_GL } from "@/components/circuit/CircuitBloom";
import { CircuitLabRoom } from "@/components/circuit/CircuitLabRoom";
import { CIRCUIT_STAGES, type CircuitLayout } from "@/data/circuit-stages";
import { simulateCircuit, CELL_VOLTAGE } from "@/lib/circuitPhysics";
import {
  type PlacedPart,
  type WireLink,
  type TerminalId,
  type PartType,
  createPart,
  loadPreset,
  simulateBuilder,
  isGridOccupied,
  GRID,
  BOARD,
} from "@/lib/circuitBuilder";
import {
  useWebGLRecovery,
  WebGLContextHandler,
  WebGLRecoveryOverlay,
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

const LAYOUT_TABS: { id: CircuitLayout; label: string }[] = [
  { id: "basic", label: "Simple" },
  { id: "series", label: "Series" },
  { id: "parallel", label: "Parallel" },
  { id: "insulator", label: "Insulator" },
];

const PART_PALETTE: { type: PartType; label: string; color: string }[] = [
  { type: "cell", label: "Cell", color: "bg-blue-600" },
  { type: "bulb", label: "Bulb", color: "bg-yellow-600" },
  { type: "switch", label: "Switch", color: "bg-emerald-600" },
  { type: "insulator", label: "Insulator", color: "bg-red-600" },
];

function nextFreeSpot(parts: PlacedPart[]): { x: number; z: number } {
  for (let x = GRID.minX; x <= GRID.maxX; x += GRID.step) {
    for (let z = GRID.minZ; z <= GRID.maxZ; z += GRID.step) {
      if (!parts.some((p) => p.gridX === x && p.gridZ === z)) return { x, z };
    }
  }
  return { x: 0, z: 0 };
}

export default function CircuitScene() {
  const [showIntro, setShowIntro] = useState(true);
  const [labMode, setLabMode] = useState<"learn" | "builder">("builder");
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [narration, setNarration] = useState(true);
  const [manualControl, setManualControl] = useState(false);

  const [layout, setLayout] = useState<CircuitLayout>("basic");
  const [switchClosed, setSwitchClosed] = useState(true);
  const [bulbCount, setBulbCount] = useState(1);
  const [showInsulator, setShowInsulator] = useState(false);
  const [insulatorInPath, setInsulatorInPath] = useState(false);

  const [parts, setParts] = useState<PlacedPart[]>(() => loadPreset("basic").parts);
  const [wires, setWires] = useState<WireLink[]>(() => loadPreset("basic").wires);
  const [wireMode, setWireMode] = useState(true);
  const [pendingTerminal, setPendingTerminal] = useState<{ partId: string; terminal: TerminalId } | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [paletteDrag, setPaletteDrag] = useState<PartType | null>(null);
  const [dropPreview, setDropPreview] = useState<{ gridX: number; gridZ: number } | null>(null);

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { contextLost, canvasKey, onContextLost, remountCanvas } = useWebGLRecovery();

  const stage = CIRCUIT_STAGES[currentStage];
  const builderCamera: [number, number, number] = [0, 3.2, 10];
  const builderLookAt: [number, number, number] = [0, -0.25, 0];

  const learnResult = simulateCircuit({
    layout: layout === "insulator" ? "basic" : layout,
    switchClosed,
    bulbCount,
    insulatorInPath: showInsulator && insulatorInPath,
  });

  const builderSim = useMemo(() => simulateBuilder(parts, wires), [parts, wires]);
  const result = labMode === "builder" ? {
    isComplete: builderSim.isComplete,
    current: builderSim.current,
    layoutLabel: builderSim.layoutLabel,
    summary: builderSim.summary,
    electronsFlow: builderSim.electronsFlow,
  } : learnResult;

  const addPart = useCallback((type: PartType) => {
    const spot = nextFreeSpot(parts);
    setParts((p) => [...p, createPart(type, spot.x, spot.z)]);
  }, [parts]);

  const placePartAt = useCallback((type: PartType, gridX: number, gridZ: number) => {
    if (isGridOccupied(parts, gridX, gridZ)) return;
    const part = createPart(type, gridX, gridZ);
    setParts((p) => [...p, part]);
    setSelectedPartId(part.id);
    setWireMode(true);
  }, [parts]);

  const deleteSelected = useCallback(() => {
    if (!selectedPartId) return;
    setParts((p) => p.filter((x) => x.id !== selectedPartId));
    setWires((w) => w.filter((x) => x.fromPart !== selectedPartId && x.toPart !== selectedPartId));
    setSelectedPartId(null);
  }, [selectedPartId]);

  useEffect(() => {
    if (manualControl || stage.id === "explore" || labMode === "builder") return;
    setLayout(stage.layout);
    setSwitchClosed(stage.switchClosed);
    setBulbCount(stage.bulbCount);
    setShowInsulator(stage.showInsulator);
    setInsulatorInPath(stage.insulatorInPath);
  }, [currentStage, stage, manualControl, labMode]);

  useEffect(() => {
    if (!isPlaying || showIntro || labMode !== "learn") return;
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= CIRCUIT_STAGES.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        setManualControl(false);
        return prev + 1;
      });
    }, 12000);
    return () => clearInterval(timer);
  }, [isPlaying, showIntro, labMode]);

  useEffect(() => {
    if (!narration || showIntro || labMode !== "learn") return;
    speak(`${stage.title}. ${stage.description} Fun fact: ${stage.funFact}`);
  }, [currentStage, narration, showIntro, stage, labMode]);

  if (showIntro) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#06080f] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-6 sm:p-8 border border-white/15 max-w-md w-full text-center"
        >
          <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Advanced Circuit Lab</h1>
          <p className="text-sm text-slate-400 mb-2">Drag & drop · Wire terminals · Bloom-lit bulbs</p>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Build series and parallel circuits on a 3D breadboard. Drag components, connect terminals, and watch realistic bulb glow.
          </p>
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            className="w-full py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-semibold text-sm transition-colors"
          >
            Enter Lab →
          </button>
        </motion.div>
      </div>
    );
  }

  const cam = labMode === "builder" ? builderCamera : stage.camera;
  const look = labMode === "builder" ? builderLookAt : stage.lookAt;
  const bgPreset = "electric-lab" as const;

  return (
    <div className="absolute inset-0">
      {contextLost && <WebGLRecoveryOverlay onReload={remountCanvas} />}

      <Canvas key={canvasKey} camera={{ position: cam, fov: 42 }} gl={CIRCUIT_GL} dpr={1}>
        <fog attach="fog" args={[fogColorForPreset(bgPreset), 12, 34]} />
        <WebGLContextHandler onContextLost={onContextLost} />
        <LabSceneBackground preset={bgPreset} />
        <CircuitLabRoom />
        <ambientLight intensity={0.18} color="#c8d0e0" />
        <directionalLight position={[5, 8, 6]} intensity={0.55} color="#fff7ed" />
        <directionalLight position={[-3, 4, -2]} intensity={0.14} color="#fde68a" />
        <pointLight position={[0, 1.8, 2.5]} intensity={0.5} color="#fffbeb" distance={12} decay={2} />
        <pointLight position={[0, 0.6, 1]} intensity={0.35} color="#fef3c7" distance={6} decay={2} />

        {labMode === "builder" ? (
          <CircuitBuilderWorld
            parts={parts}
            wires={wires}
            sim={builderSim}
            wireMode={wireMode}
            pendingTerminal={pendingTerminal}
            paletteDragType={paletteDrag}
            dropPreview={dropPreview}
            onDropPreviewChange={setDropPreview}
            onPaletteDrop={placePartAt}
            onPaletteDragEnd={() => setPaletteDrag(null)}
            selectedPartId={selectedPartId}
            onPartsChange={setParts}
            onWiresChange={setWires}
            onPendingTerminal={setPendingTerminal}
            onSelectPart={setSelectedPartId}
          />
        ) : (
          <CircuitWorld
            layout={layout === "insulator" ? "basic" : layout}
            switchClosed={switchClosed}
            bulbCount={bulbCount}
            showInsulator={showInsulator}
            insulatorInPath={insulatorInPath}
            result={learnResult}
            onSwitchToggle={() => {
              setSwitchClosed((s) => !s);
              setManualControl(true);
            }}
          />
        )}

        <ContactShadows position={[0, BOARD.originY - 0.02, 0]} opacity={0.4} scale={18} blur={2.5} far={5} frames={1} />
        <CircuitBloom strength={1.05} threshold={0.78} />
        <CameraRig targetCamera={cam} targetLookAt={look} controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enabled={!paletteDrag}
          enablePan={labMode === "builder"}
          minDistance={5}
          maxDistance={18}
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.75}
        />
      </Canvas>

      {labMode === "builder" && (
        <CircuitComponentPalette
          activeDrag={paletteDrag}
          onDragStart={setPaletteDrag}
          onQuickAdd={addPart}
        />
      )}

      {/* Mode toggle */}
      <div className="absolute top-20 left-3 sm:left-6 z-20 flex gap-1.5">
        <button
          type="button"
          onClick={() => setLabMode("builder")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
            labMode === "builder"
              ? "bg-yellow-600 border-yellow-500 text-white"
              : "glass-card border-white/10 text-slate-400 hover:text-white"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" /> Builder
        </button>
        <button
          type="button"
          onClick={() => setLabMode("learn")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
            labMode === "learn"
              ? "bg-yellow-600 border-yellow-500 text-white"
              : "glass-card border-white/10 text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Learn
        </button>
      </div>

      {labMode === "learn" && (
        <AnimatePresence mode="wait">
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-[5.5rem] sm:bottom-24 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-20 pointer-events-none"
          >
            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 pointer-events-auto">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-yellow-400/90">
                Stage {currentStage + 1} of {CIRCUIT_STAGES.length}
              </span>
              <h2 className="text-lg font-bold text-white mt-1">{stage.title}</h2>
              <p className="text-xs text-yellow-200/80 mb-2">{stage.subtitle}</p>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">{stage.description}</p>
              <p className="text-[10px] text-slate-500 italic">💡 {stage.funFact}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <div className="absolute top-20 right-3 sm:right-6 z-20 pointer-events-none">
        <div className="glass-card rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 border border-yellow-500/20 min-w-[9.5rem]">
          <p className="text-[9px] uppercase tracking-wider text-yellow-400/80 font-semibold mb-1">Live Circuit</p>
          <p className="text-sm font-bold text-white">{result.layoutLabel}</p>
          <p className="text-[10px] text-slate-400 mt-1 leading-snug">{result.summary}</p>
          <div className="flex gap-2 mt-2 text-[10px]">
            <span className="text-cyan-400">V = {CELL_VOLTAGE} V</span>
            <span className="text-amber-400">I = {result.current.toFixed(2)} A</span>
          </div>
          {result.isComplete ? (
            <span className="inline-block mt-1.5 text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              ⚡ Circuit complete
            </span>
          ) : (
            <span className="inline-block mt-1.5 text-[9px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
              ○ Open circuit
            </span>
          )}
        </div>
      </div>

      <div className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-6 z-20">
        <div className="glass-card rounded-2xl p-3 sm:p-4 border border-white/10 space-y-3">
          {labMode === "builder" ? (
            <>
              <div className="flex flex-wrap gap-1.5">
                {PART_PALETTE.map((p) => (
                  <button
                    key={p.type}
                    type="button"
                    onClick={() => addPart(p.type)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white ${p.color} hover:opacity-90`}
                  >
                    <Plus className="w-3 h-3" /> {p.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setWireMode((w) => !w)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                    wireMode ? "bg-cyan-600 text-white" : "bg-white/5 text-slate-400"
                  }`}
                >
                  <Cable className="w-3 h-3" /> Wire {wireMode ? "ON" : "OFF"}
                </button>
                <button
                  type="button"
                  onClick={deleteSelected}
                  disabled={!selectedPartId}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-red-400 disabled:opacity-30"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["basic", "series", "parallel"] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      const loaded = loadPreset(preset);
                      setParts(loaded.parts);
                      setWires(loaded.wires);
                      setPendingTerminal(null);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/5 text-slate-300 hover:bg-white/10 capitalize"
                  >
                    Load {preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setParts([]);
                    setWires([]);
                    setPendingTerminal(null);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/5 text-slate-400 hover:bg-white/10"
                >
                  Clear board
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Sidebar: drag onto board · Wire ON: click two pins · Double-click sidebar to auto-place
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {LAYOUT_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setLayout(tab.id);
                      if (tab.id === "insulator") {
                        setShowInsulator(true);
                        setInsulatorInPath(true);
                      }
                      setManualControl(true);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      layout === tab.id ? "bg-yellow-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSwitchClosed((s) => !s);
                    setManualControl(true);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    switchClosed ? "bg-emerald-600/80 text-white" : "bg-red-600/80 text-white"
                  }`}
                >
                  Switch: {switchClosed ? "ON" : "OFF"}
                </button>
              </div>
              <div className="flex items-center gap-1 pt-1 border-t border-white/5">
                <button type="button" onClick={() => setCurrentStage((s) => Math.max(0, s - 1))} className="p-2 rounded-lg bg-white/5 text-slate-300">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setIsPlaying((p) => !p)} className="p-2 rounded-lg bg-yellow-600/80 text-white">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => setCurrentStage((s) => Math.min(CIRCUIT_STAGES.length - 1, s + 1))} className="p-2 rounded-lg bg-white/5 text-slate-300">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setNarration((n) => !n)} className="p-2 rounded-lg bg-white/5 text-slate-300 ml-auto">
                  {narration ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
