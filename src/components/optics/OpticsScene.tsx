"use client";

import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
  FlipHorizontal,
  ArrowDownToLine,
} from "lucide-react";
import { StableLine, type Point3 } from "@/components/three/StableLine";
import {
  useWebGLRecovery,
  WebGLContextHandler,
  WebGLRecoveryOverlay,
  LIGHT_GL,
} from "@/components/three/WebGLRecovery";
import { LabSceneBackground, fogColorForPreset } from "@/components/three/LabSceneBackground";
import { GlassMedium } from "@/components/optics/GlassMedium";
import {
  TorchSource,
  LightBeamTube,
  AnimatedPhoton,
} from "@/components/optics/OpticsLightEffects";
import {
  OPTICS_STAGES,
  MATERIALS,
  type OpticsMode,
} from "@/data/optics-stages";

const RAY_LENGTH = 5;
const DEG = Math.PI / 180;

function speakStage(stage: (typeof OPTICS_STAGES)[0]) {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`${stage.title}. ${stage.description} Fun fact: ${stage.funFact}`);
      u.rate = 0.88;
      window.speechSynthesis.speak(u);
    }
  } catch {}
}

function computeRays(
  mode: OpticsMode,
  angleDeg: number,
  n1: number,
  n2: number,
) {
  const thetaI = angleDeg * DEG;
  const sinI = Math.sin(thetaI);
  const hit = new THREE.Vector3(0, 0, 0);

  let incidentEnd: THREE.Vector3;
  let reflectedEnd: THREE.Vector3 | null = null;
  let refractedEnd: THREE.Vector3 | null = null;
  let thetaR = thetaI;
  let thetaT: number | null = null;
  let isTIR = false;

  if (mode === "reflection") {
    incidentEnd = new THREE.Vector3(-Math.sin(thetaI) * RAY_LENGTH, Math.cos(thetaI) * RAY_LENGTH, 0);
    reflectedEnd = new THREE.Vector3(Math.sin(thetaI) * RAY_LENGTH, Math.cos(thetaI) * RAY_LENGTH, 0);
  } else if (mode === "refraction") {
    incidentEnd = new THREE.Vector3(-Math.sin(thetaI) * RAY_LENGTH, Math.cos(thetaI) * RAY_LENGTH, 0);
    const sinT = (n1 / n2) * sinI;
    if (Math.abs(sinT) <= 1) {
      thetaT = Math.asin(sinT);
      refractedEnd = new THREE.Vector3(Math.sin(thetaT) * RAY_LENGTH, -Math.cos(thetaT) * RAY_LENGTH, 0);
    }
    const reflectance = Math.pow((n1 - n2) / (n1 + n2), 2);
    if (reflectance > 0.02) {
      reflectedEnd = new THREE.Vector3(Math.sin(thetaI) * RAY_LENGTH * 0.4, Math.cos(thetaI) * RAY_LENGTH * 0.4, 0);
    }
  } else {
    // TIR: light from dense medium (n1) into air (n2=1)
    incidentEnd = new THREE.Vector3(-Math.sin(thetaI) * RAY_LENGTH, -Math.cos(thetaI) * RAY_LENGTH, 0);
    const criticalAngle = Math.asin(Math.min(n2 / n1, 1));
    if (thetaI > criticalAngle) {
      isTIR = true;
      thetaR = thetaI;
      reflectedEnd = new THREE.Vector3(Math.sin(thetaI) * RAY_LENGTH, -Math.cos(thetaI) * RAY_LENGTH, 0);
    } else {
      const sinT = (n1 / n2) * sinI;
      thetaT = Math.asin(sinT);
      refractedEnd = new THREE.Vector3(Math.sin(thetaT) * RAY_LENGTH, Math.cos(thetaT) * RAY_LENGTH, 0);
    }
  }

  return { hit, incidentEnd: incidentEnd!, reflectedEnd, refractedEnd, thetaI, thetaR, thetaT, isTIR, criticalAngle: mode === "tir" ? Math.asin(Math.min(n2 / n1, 1)) : null };
}

function AnimatedRay({
  sx,
  sy,
  sz,
  ex,
  ey,
  ez,
  color,
  opacity = 1,
}: {
  sx: number;
  sy: number;
  sz: number;
  ex: number;
  ey: number;
  ez: number;
  color: string;
  opacity?: number;
}) {
  return (
    <group>
      <LightBeamTube sx={sx} sy={sy} sz={sz} ex={ex} ey={ey} ez={ez} color={color} opacity={opacity} />
      <AnimatedPhoton sx={sx} sy={sy} sz={sz} ex={ex} ey={ey} ez={ez} color={color} />
    </group>
  );
}

function AngleArc({
  radius,
  startAngle,
  endAngle,
  color,
}: {
  radius: number;
  startAngle: number;
  endAngle: number;
  color: string;
}) {
  const points = useMemo(() => {
    const pts: Point3[] = [];
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const a = startAngle + (endAngle - startAngle) * (i / steps);
      pts.push([Math.sin(a) * radius, Math.cos(a) * radius, 0.01]);
    }
    return pts;
  }, [radius, startAngle, endAngle]);

  return <StableLine points={points} color={color} opacity={0.7} />;
}

function NormalLine() {
  const points = useMemo<Point3[]>(() => [[0, -3.5, 0], [0, 3.5, 0]], []);
  return <StableLine points={points} color="#94a3b8" opacity={0.4} />;
}

function InterfaceSurface({
  mode,
  materialId,
  materialColor,
  ior,
}: {
  mode: OpticsMode;
  materialId: string;
  materialColor: string;
  ior: number;
}) {
  return (
    <GlassMedium
      mode={mode}
      materialId={materialId}
      materialColor={materialColor}
      ior={ior}
      inverted={mode === "tir"}
    />
  );
}

function OpticsWorld({
  mode,
  angleDeg,
  materialId,
}: {
  mode: OpticsMode;
  angleDeg: number;
  materialId: string;
}) {
  const material = MATERIALS.find((m) => m.id === materialId) ?? MATERIALS[2];
  const n1 = mode === "tir" ? material.n : 1.0;
  const n2 = mode === "tir" ? 1.0 : material.n;

  const rays = useMemo(() => computeRays(mode, angleDeg, n1, n2), [mode, angleDeg, n1, n2]);

  const incidentColor = "#ffd080";
  const reflectColor = "#ff9944";
  const refractColor = "#66ddff";

  const { hit, incidentEnd, reflectedEnd, refractedEnd } = rays;

  return (
    <group>
      <ambientLight intensity={0.2} color="#8899bb" />
      <directionalLight position={[6, 10, 4]} intensity={0.55} color="#c8d4ff" />
      <directionalLight position={[-4, 6, -3]} intensity={0.15} color="#aaccff" />

      <InterfaceSurface mode={mode} materialId={materialId} materialColor={material.color} ior={material.n} />
      <NormalLine />

      <ContactShadows position={[0, -4.98, 0]} opacity={0.45} scale={18} blur={2.5} far={6} color="#000000" frames={1} />

      {/* Hit point marker */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#fff4cc" emissive="#ffcc44" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>

      <AnimatedRay sx={hit.x} sy={hit.y} sz={hit.z} ex={incidentEnd.x} ey={incidentEnd.y} ez={incidentEnd.z} color={incidentColor} />
      <TorchSource
        fromX={incidentEnd.x}
        fromY={incidentEnd.y}
        fromZ={incidentEnd.z}
        toX={hit.x}
        toY={hit.y}
        toZ={hit.z}
      />

      {reflectedEnd && (
        <AnimatedRay
          sx={hit.x} sy={hit.y} sz={hit.z}
          ex={reflectedEnd.x} ey={reflectedEnd.y} ez={reflectedEnd.z}
          color={reflectColor}
          opacity={mode === "refraction" ? 0.35 : 1}
        />
      )}

      {refractedEnd && (
        <AnimatedRay
          sx={hit.x} sy={hit.y} sz={hit.z}
          ex={refractedEnd.x} ey={refractedEnd.y} ez={refractedEnd.z}
          color={refractColor}
        />
      )}

      {/* Angle arcs */}
      {mode === "reflection" && (
        <>
          <AngleArc radius={1.2} startAngle={Math.PI / 2} endAngle={Math.PI / 2 + rays.thetaI} color={incidentColor} />
          <AngleArc radius={1.4} startAngle={Math.PI / 2 - rays.thetaR} endAngle={Math.PI / 2} color={reflectColor} />
        </>
      )}

      {mode === "refraction" && rays.thetaT !== null && (
        <>
          <AngleArc radius={1.2} startAngle={Math.PI / 2} endAngle={Math.PI / 2 + rays.thetaI} color={incidentColor} />
          <AngleArc radius={1.4} startAngle={Math.PI / 2} endAngle={Math.PI / 2 - rays.thetaT} color={refractColor} />
        </>
      )}

      {mode === "tir" && (
        <>
          <AngleArc radius={1.2} startAngle={-Math.PI / 2} endAngle={-Math.PI / 2 + rays.thetaI} color={incidentColor} />
          {rays.isTIR ? (
            <AngleArc radius={1.4} startAngle={-Math.PI / 2 - rays.thetaR} endAngle={-Math.PI / 2} color={reflectColor} />
          ) : rays.thetaT !== null ? (
            <AngleArc radius={1.4} startAngle={Math.PI / 2} endAngle={Math.PI / 2 - rays.thetaT} color={refractColor} />
          ) : null}
        </>
      )}
    </group>
  );
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
    progress.current = Math.min(progress.current + delta * 0.8, 1);
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

function LabTable() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.05, 0]} receiveShadow>
      <planeGeometry args={[20, 12]} />
      <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.15} envMapIntensity={0.4} />
    </mesh>
  );
}

export default function OpticsScene() {
  const [showIntro, setShowIntro] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [narration, setNarration] = useState(true);
  const [mode, setMode] = useState<OpticsMode>("reflection");
  const [angle, setAngle] = useState(35);
  const [materialId, setMaterialId] = useState("glass");
  const [manualControl, setManualControl] = useState(false);

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { contextLost, canvasKey, onContextLost, remountCanvas } = useWebGLRecovery();

  const stage = OPTICS_STAGES[currentStage];
  const material = MATERIALS.find((m) => m.id === materialId) ?? MATERIALS[2];
  const n1 = mode === "tir" ? material.n : 1.0;
  const n2 = mode === "tir" ? 1.0 : material.n;
  const rays = computeRays(mode, angle, n1, n2);

  useEffect(() => {
    if (manualControl || stage.id === "explore") return;
    setMode(stage.mode);
    setAngle(stage.angle);
    setMaterialId(stage.materialId);
  }, [currentStage, stage, manualControl]);

  useEffect(() => {
    if (!isPlaying || showIntro) return;
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= OPTICS_STAGES.length - 1) {
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
    speakStage(OPTICS_STAGES[currentStage]);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [currentStage, showIntro, narration]);

  const nextStage = () => { setManualControl(false); setCurrentStage((p) => Math.min(p + 1, OPTICS_STAGES.length - 1)); };
  const prevStage = () => { setManualControl(false); setCurrentStage((p) => Math.max(p - 1, 0)); };
  const reset = () => { setCurrentStage(0); setIsPlaying(false); setManualControl(false); };

  const snellLHS = n1 * Math.sin(rays.thetaI);
  const snellRHS = rays.thetaT !== null ? n2 * Math.sin(rays.thetaT) : null;

  if (showIntro) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0a0f1a] via-[#0f1a2e] to-[#0a0f18] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-8 sm:p-10 border border-white/15 max-w-lg w-full text-center shadow-2xl"
        >
          <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl sm:text-7xl mb-6">
            💡
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">
            Reflection & Refraction
          </h1>
          <p className="text-slate-400 text-xs mb-4">Interactive 3D Optics Lab</p>
          <p className="text-slate-300 mb-6 text-sm leading-relaxed">
            Fire a torch beam at mirrors and clear glass blocks. Watch volumetric light rays, bloom, and real-time refraction while learning reflection, Snell&apos;s law, and total internal reflection.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-8">
            {[
              { icon: "🪞", label: "Reflection", sub: "θi = θr" },
              { icon: "🔷", label: "Refraction", sub: "Snell's Law" },
              { icon: "🌐", label: "TIR", sub: "Fiber optics" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/[0.04] border border-white/10 p-2.5">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="text-[10px] text-slate-200 font-semibold">{item.label}</div>
                <div className="text-[9px] text-slate-500">{item.sub}</div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-600 text-white font-bold text-lg hover:from-amber-400 hover:to-cyan-500 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            Start Experience →
          </button>
          <p className="text-[10px] text-slate-500 mt-4">7 guided stages · Live Snell&apos;s Law · Interactive laser angle</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {contextLost && <WebGLRecoveryOverlay onReload={remountCanvas} />}
      <Canvas
        key={canvasKey}
        camera={{ position: stage.camera, fov: 45 }}
        gl={LIGHT_GL}
        dpr={1}
      >
        <LabSceneBackground preset="optics-lab" />
        <fog attach="fog" args={[fogColorForPreset("optics-lab"), 22, 48]} />
        <WebGLContextHandler onContextLost={onContextLost} />
        <LabTable />
        <Suspense fallback={null}>
          <OpticsWorld mode={mode} angleDeg={angle} materialId={materialId} />
        </Suspense>
        <CameraRig targetCamera={stage.camera} targetLookAt={stage.lookAt} controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enableZoom
          enablePan={false}
          minDistance={4}
          maxDistance={22}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Stage panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute bottom-[5.5rem] sm:bottom-24 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-20 pointer-events-none"
        >
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 pointer-events-auto shadow-lg shadow-black/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/90">
                Stage {currentStage + 1} of {OPTICS_STAGES.length}
              </span>
              {rays.isTIR && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  Total Internal Reflection!
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-0.5">{stage.title}</h2>
            <p className="text-xs text-cyan-300/80 mb-2">{stage.subtitle}</p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">{stage.description}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 italic border-t border-white/5 pt-2">💡 {stage.funFact}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute top-16 sm:top-20 right-3 sm:right-4 z-20 w-[calc(100%-1.5rem)] sm:w-60">
        <div className="glass-card rounded-xl p-3 border border-white/10 space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Mode</div>
          <div className="grid grid-cols-3 gap-1">
            {([
              { id: "reflection" as const, label: "Reflect", icon: FlipHorizontal },
              { id: "refraction" as const, label: "Refract", icon: ArrowDownToLine },
              { id: "tir" as const, label: "TIR", icon: "↩" },
            ]).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMode(m.id); setManualControl(true); }}
                className={`py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                  mode === m.id
                    ? "bg-cyan-500/25 text-cyan-200 border border-cyan-500/30"
                    : "text-slate-400 border border-transparent hover:bg-white/[0.06]"
                }`}
              >
                {typeof m.icon === "string" ? m.icon : <m.icon className="w-3.5 h-3.5 mx-auto" />}
                <span className="block mt-0.5">{m.label}</span>
              </button>
            ))}
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Angle of incidence</span>
              <span>{angle}°</span>
            </div>
            <input
              type="range"
              min={5}
              max={85}
              value={angle}
              onChange={(e) => { setAngle(Number(e.target.value)); setManualControl(true); }}
              className="w-full accent-amber-500"
            />
          </div>

          {mode !== "reflection" && (
            <div>
              <div className="text-[10px] text-slate-500 mb-1.5">Material (n)</div>
              <div className="grid grid-cols-2 gap-1">
                {MATERIALS.filter((m) => m.id !== "air").map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setMaterialId(m.id); setManualControl(true); }}
                    className={`py-1 px-2 rounded-lg text-[10px] font-medium transition-all ${
                      materialId === m.id
                        ? "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                        : "text-slate-400 border border-transparent hover:bg-white/[0.06]"
                    }`}
                  >
                    {m.name} ({m.n})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Snell's law */}
          <div className="rounded-lg bg-white/[0.04] p-2 border border-white/5">
            <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Snell&apos;s Law</div>
            <div className="text-xs font-mono text-amber-300">
              n₁·sin(θ₁) = n₂·sin(θ₂)
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              {n1.toFixed(2)}·sin({angle}°) = {snellLHS.toFixed(3)}
              {snellRHS !== null && ` ≈ ${n2.toFixed(2)}·sin(${Math.round((rays.thetaT! * 180) / Math.PI)}°) = ${snellRHS.toFixed(3)}`}
              {rays.isTIR && " → TIR (no refraction)"}
            </div>
          </div>
        </div>
      </div>

      {/* Stage dots */}
      <div className="absolute top-16 sm:top-20 left-3 z-20 flex gap-1.5">
        {OPTICS_STAGES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { setManualControl(false); setCurrentStage(i); }}
            className={`h-1.5 rounded-full transition-all ${i === currentStage ? "w-6 bg-cyan-400" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
            aria-label={`Stage ${i + 1}: ${s.title}`}
          />
        ))}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 pb-[max(0px,env(safe-area-inset-bottom))]">
        <div className="glass-card rounded-2xl px-2 py-1.5 sm:px-3 sm:py-2 border border-white/10 flex items-center gap-1 sm:gap-2">
          <button type="button" onClick={prevStage} disabled={currentStage === 0} className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-30 transition-colors" aria-label="Previous">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setIsPlaying((p) => !p)} className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors" aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button type="button" onClick={nextStage} disabled={currentStage === OPTICS_STAGES.length - 1} className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-30 transition-colors" aria-label="Next">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-white/10 mx-0.5" />
          <button type="button" onClick={reset} className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors" aria-label="Reset">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setNarration((n) => !n)} className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors" aria-label="Toggle narration">
            {narration ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
