"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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
  Sun,
  Moon,
} from "lucide-react";
import { StableLine, type Point3 } from "@/components/three/StableLine";
import {
  LIGHT_GL,
  useWebGLRecovery,
  WebGLContextHandler,
  WebGLRecoveryOverlay,
} from "@/components/three/WebGLRecovery";
import { LabSceneBackground } from "@/components/three/LabSceneBackground";
import { ECLIPSE_STAGES, type EclipseMode } from "@/data/eclipse-stages";

const SUN_POS = new THREE.Vector3(-18, 0, 0);
const EARTH_RADIUS = 0.65;
const MOON_RADIUS = 0.18;
const MOON_ORBIT = 2.4;
const ORBITAL_INCLINATION = (5 * Math.PI) / 180;
const ORIGIN = new THREE.Vector3(0, 0, 0);

function speakStage(stage: (typeof ECLIPSE_STAGES)[0]) {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = `${stage.title}. ${stage.description} Fun fact: ${stage.funFact}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  } catch {}
}

function getMoonPosition(angle: number, inclined: boolean): THREE.Vector3 {
  const y = inclined ? Math.sin(angle) * MOON_ORBIT * Math.sin(ORBITAL_INCLINATION) : 0;
  const xz = inclined
    ? MOON_ORBIT * Math.cos(angle)
    : MOON_ORBIT * Math.cos(angle);
  const z = inclined ? Math.sin(angle) * MOON_ORBIT * Math.cos(ORBITAL_INCLINATION) * 0.3 : Math.sin(angle) * MOON_ORBIT * 0.15;
  return new THREE.Vector3(xz, y, z);
}

function isSolarEclipseAligned(moonPos: THREE.Vector3, inclined: boolean): boolean {
  if (inclined) return Math.abs(moonPos.y) < 0.35 && moonPos.x < -MOON_ORBIT * 0.7;
  return Math.abs(moonPos.z) < 0.4 && moonPos.x < -MOON_ORBIT * 0.7;
}

function isLunarEclipseAligned(moonPos: THREE.Vector3, inclined: boolean): boolean {
  if (inclined) return Math.abs(moonPos.y) < 0.35 && moonPos.x > MOON_ORBIT * 0.7;
  return Math.abs(moonPos.z) < 0.4 && moonPos.x > MOON_ORBIT * 0.7;
}

function SunBody() {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sunRef.current) sunRef.current.rotation.y = t * 0.02;
    if (glowRef.current) glowRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.03);
  });

  return (
    <group position={SUN_POS.toArray()}>
      <mesh ref={sunRef}>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial color="#ffaa22" toneMapped={false} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[3.4, 24, 24]} />
        <meshBasicMaterial color="#FF6600" transparent opacity={0.18} blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <directionalLight position={[1, 0, 0]} intensity={2.5} color="#FFF0D0" />
    </group>
  );
}

function EarthBody() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.08;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshStandardMaterial color="#2266aa" roughness={0.55} metalness={0.08} emissive="#112244" emissiveIntensity={0.15} />
      </mesh>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.04, 24, 24]} />
        <meshBasicMaterial color="#5599FF" transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function MoonBody({
  px,
  py,
  pz,
  inEarthShadow,
  eclipseIntensity,
}: {
  px: number;
  py: number;
  pz: number;
  inEarthShadow: boolean;
  eclipseIntensity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const redTint = inEarthShadow ? eclipseIntensity : 0;
  const surfaceColor = useMemo(
    () => new THREE.Color().setRGB(1, 1 - redTint * 0.5, 1 - redTint * 0.7),
    [redTint],
  );
  const emissiveColor = useMemo(
    () => (inEarthShadow ? new THREE.Color(0.4, 0.05, 0.02).multiplyScalar(redTint) : new THREE.Color(0, 0, 0)),
    [inEarthShadow, redTint],
  );

  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  return (
    <group position={[px, py, pz]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[MOON_RADIUS, 24, 24]} />
        <meshStandardMaterial
          color={surfaceColor}
          roughness={0.95}
          metalness={0}
          emissive={emissiveColor}
          emissiveIntensity={inEarthShadow ? redTint * 0.6 : 0}
        />
      </mesh>
    </group>
  );
}

function ShadowCone({
  ox,
  oy,
  oz,
  dx,
  dy,
  dz,
  length,
  radiusStart,
  radiusEnd,
  color,
  opacity,
}: {
  ox: number;
  oy: number;
  oz: number;
  dx: number;
  dy: number;
  dz: number;
  length: number;
  radiusStart: number;
  radiusEnd: number;
  color: string;
  opacity: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    const dir = new THREE.Vector3(dx, dy, dz).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    groupRef.current.quaternion.copy(quat);
    groupRef.current.position.set(ox, oy, oz);
  }, [ox, oy, oz, dx, dy, dz]);

  return (
    <group ref={groupRef}>
      <mesh position={[0, -length / 2, 0]}>
        <cylinderGeometry args={[radiusEnd, radiusStart, length, 16, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function OrbitRing({ radius, inclined, opacity = 0.3 }: { radius: number; inclined: boolean; opacity?: number }) {
  const points = useMemo(() => {
    const pts: Point3[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      const y = inclined ? Math.sin(a) * radius * Math.sin(ORBITAL_INCLINATION) : 0;
      const x = Math.cos(a) * radius;
      const z = inclined ? Math.sin(a) * radius * Math.cos(ORBITAL_INCLINATION) * 0.3 : Math.sin(a) * radius * 0.15;
      pts.push([x, y, z]);
    }
    return pts;
  }, [radius, inclined]);

  return <StableLine points={points} color="#6688bb" opacity={opacity} />;
}

function EclipticPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <ringGeometry args={[3, 22, 64]} />
      <meshBasicMaterial color="#334466" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function SunEarthLine() {
  return <StableLine points={[[SUN_POS.x, SUN_POS.y, SUN_POS.z], [12, 0, 0]]} color="#ffaa44" opacity={0.25} />;
}

function EarthShadowOnMoon({
  moonPos,
  intensity,
}: {
  moonPos: THREE.Vector3;
  intensity: number;
}) {
  if (intensity < 0.05) return null;

  const earthToMoon = moonPos.clone().normalize();
  const shadowPos = moonPos.clone().sub(earthToMoon.clone().multiplyScalar(MOON_RADIUS * 0.3));

  return (
    <mesh position={shadowPos.toArray()} scale={intensity}>
      <sphereGeometry args={[MOON_RADIUS * 1.02, 32, 32]} />
      <meshBasicMaterial color="#1a0505" transparent opacity={0.7 * intensity} depthWrite={false} />
    </mesh>
  );
}

function MoonShadowOnEarth({
  moonPos,
  intensity,
}: {
  moonPos: THREE.Vector3;
  intensity: number;
}) {
  if (intensity < 0.05) return null;

  const sunToMoon = moonPos.clone().sub(SUN_POS).normalize();
  const shadowDist = EARTH_RADIUS * 2.5;
  const shadowPos = sunToMoon.clone().multiplyScalar(shadowDist);

  return (
    <group position={shadowPos.toArray()}>
      <mesh rotation={[0, 0, 0]}>
        <circleGeometry args={[EARTH_RADIUS * (0.3 + intensity * 0.5), 16]} />
        <meshBasicMaterial color="#000510" transparent opacity={0.85 * intensity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
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

function EclipseWorld({
  moonAngle,
  inclined,
  mode,
  showShadowCones,
}: {
  moonAngle: number;
  inclined: boolean;
  mode: EclipseMode;
  showShadowCones: boolean;
}) {
  const moonPos = useMemo(() => getMoonPosition(moonAngle, inclined), [moonAngle, inclined]);

  const solarAligned = isSolarEclipseAligned(moonPos, inclined);
  const lunarAligned = isLunarEclipseAligned(moonPos, inclined);

  const solarIntensity = solarAligned
    ? Math.max(0, 1 - Math.abs(moonPos.z) / 0.5 - (inclined ? Math.abs(moonPos.y) / 0.5 : 0))
    : 0;
  const lunarIntensity = lunarAligned
    ? Math.max(0, 1 - Math.abs(moonPos.z) / 0.5 - (inclined ? Math.abs(moonPos.y) / 0.5 : 0))
    : 0;

  const moonToEarth = useMemo(() => ORIGIN.clone().sub(moonPos).normalize(), [moonPos]);
  const earthToMoon = useMemo(() => moonPos.clone().normalize(), [moonPos]);

  return (
    <group>
      <ambientLight intensity={0.2} />
      <directionalLight position={SUN_POS.toArray()} intensity={2} color="#FFF5E0" />

      <EclipticPlane />
      <SunEarthLine />
      <OrbitRing radius={MOON_ORBIT} inclined={inclined} />

      <SunBody />
      <EarthBody />
      <MoonBody
        px={moonPos.x}
        py={moonPos.y}
        pz={moonPos.z}
        inEarthShadow={lunarIntensity > 0.3}
        eclipseIntensity={lunarIntensity}
      />

      {showShadowCones && (mode === "solar" || solarIntensity > 0.1) && (
        <>
          <ShadowCone
            ox={moonPos.x} oy={moonPos.y} oz={moonPos.z}
            dx={moonToEarth.x} dy={moonToEarth.y} dz={moonToEarth.z}
            length={3.5}
            radiusStart={MOON_RADIUS * 0.9}
            radiusEnd={0.08}
            color="#0a0a20"
            opacity={0.55}
          />
          <ShadowCone
            ox={moonPos.x} oy={moonPos.y} oz={moonPos.z}
            dx={moonToEarth.x} dy={moonToEarth.y} dz={moonToEarth.z}
            length={5}
            radiusStart={MOON_RADIUS * 1.4}
            radiusEnd={0.35}
            color="#1a1a40"
            opacity={0.2}
          />
        </>
      )}

      {showShadowCones && (mode === "lunar" || lunarIntensity > 0.1) && (
        <>
          <ShadowCone
            ox={0} oy={0} oz={0}
            dx={earthToMoon.x} dy={earthToMoon.y} dz={earthToMoon.z}
            length={4}
            radiusStart={EARTH_RADIUS * 0.95}
            radiusEnd={0.1}
            color="#0a0a20"
            opacity={0.5}
          />
          <ShadowCone
            ox={0} oy={0} oz={0}
            dx={earthToMoon.x} dy={earthToMoon.y} dz={earthToMoon.z}
            length={5.5}
            radiusStart={EARTH_RADIUS * 1.3}
            radiusEnd={0.4}
            color="#1a1a40"
            opacity={0.18}
          />
        </>
      )}

      <MoonShadowOnEarth moonPos={moonPos} intensity={solarIntensity} />
      <EarthShadowOnMoon moonPos={moonPos} intensity={lunarIntensity} />
    </group>
  );
}

function SimpleStarfield() {
  const positions = useMemo(() => {
    const arr = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      const r = 80 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.15} sizeAttenuation transparent opacity={0.6} depthWrite={false} />
    </points>
  );
}

export default function EclipseScene() {
  const [showIntro, setShowIntro] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [narration, setNarration] = useState(true);
  const [mode, setMode] = useState<EclipseMode>("solar");
  const [moonAngle, setMoonAngle] = useState(Math.PI);
  const [inclined, setInclined] = useState(false);
  const [manualControl, setManualControl] = useState(false);

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { contextLost, canvasKey, onContextLost, remountCanvas } = useWebGLRecovery();

  const stage = ECLIPSE_STAGES[currentStage];
  const isExploreStage = stage.id === "explore";

  useEffect(() => {
    if (manualControl || isExploreStage) return;
    setMoonAngle(stage.moonAngle);
    setInclined(stage.showInclination);
    if (stage.mode === "solar" || stage.mode === "lunar") setMode(stage.mode);
  }, [currentStage, stage, manualControl, isExploreStage]);

  useEffect(() => {
    if (!isPlaying || showIntro) return;
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= ECLIPSE_STAGES.length - 1) {
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
    speakStage(ECLIPSE_STAGES[currentStage]);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [currentStage, showIntro, narration]);

  const nextStage = () => {
    setManualControl(false);
    setCurrentStage((p) => Math.min(p + 1, ECLIPSE_STAGES.length - 1));
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

  const moonPos = getMoonPosition(moonAngle, inclined);
  const solarActive = isSolarEclipseAligned(moonPos, inclined);
  const lunarActive = isLunarEclipseAligned(moonPos, inclined);

  if (showIntro) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0a0a1a] via-[#0f1628] to-[#0a0a18] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-8 sm:p-10 border border-white/15 max-w-lg w-full text-center shadow-2xl"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-6xl sm:text-7xl mb-6"
          >
            🌑
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-indigo-400 bg-clip-text text-transparent">
            Solar & Lunar Eclipses
          </h1>
          <p className="text-slate-400 text-xs mb-4">Interactive 3D Physics Experience</p>
          <p className="text-slate-300 mb-6 text-sm leading-relaxed">
            Align the Sun, Moon, and Earth in 3D. Watch shadows form, explore umbra and penumbra, and learn why eclipses are rare celestial events.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
              <Sun className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <div className="text-[10px] text-amber-300 font-semibold">Solar Eclipse</div>
              <div className="text-[9px] text-slate-500 mt-0.5">Moon blocks the Sun</div>
            </div>
            <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3">
              <Moon className="w-6 h-6 text-indigo-300 mx-auto mb-1" />
              <div className="text-[10px] text-indigo-300 font-semibold">Lunar Eclipse</div>
              <div className="text-[9px] text-slate-500 mt-0.5">Earth shadows the Moon</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold text-lg hover:from-amber-400 hover:to-indigo-500 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            Start Experience →
          </button>
          <p className="text-[10px] text-slate-500 mt-4">7 guided stages · Voice narration · Interactive controls</p>
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
        gl={{
          ...LIGHT_GL,
          toneMapping: THREE.NoToneMapping,
        }}
        dpr={1}
      >
        <LabSceneBackground preset="space" />
        <WebGLContextHandler onContextLost={onContextLost} />
        <SimpleStarfield />
        <EclipseWorld
          moonAngle={moonAngle}
          inclined={inclined}
          mode={mode}
          showShadowCones={currentStage >= 2}
        />
        <CameraRig targetCamera={stage.camera} targetLookAt={stage.lookAt} controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enableZoom
          enablePan={false}
          minDistance={4}
          maxDistance={40}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.6}
        />
      </Canvas>

      {/* Stage info panel */}
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
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90">
                Stage {currentStage + 1} of {ECLIPSE_STAGES.length}
              </span>
              {(solarActive || lunarActive) && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {solarActive ? "☀️ Solar eclipse!" : "🌕 Lunar eclipse!"}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-0.5">{stage.title}</h2>
            <p className="text-xs text-amber-300/80 mb-2">{stage.subtitle}</p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">{stage.description}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 italic border-t border-white/5 pt-2">
              💡 {stage.funFact}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Interactive controls */}
      <div className="absolute top-16 sm:top-20 right-3 sm:right-4 z-20 w-[calc(100%-1.5rem)] sm:w-56">
        <div className="glass-card rounded-xl p-3 border border-white/10 space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Eclipse Type</div>
          <div className="flex gap-1.5">
            {(["solar", "lunar"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setManualControl(true);
                  setMoonAngle(m === "solar" ? Math.PI : 0);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === m
                    ? m === "solar"
                      ? "bg-amber-500/25 text-amber-200 border border-amber-500/30"
                      : "bg-indigo-500/25 text-indigo-200 border border-indigo-500/30"
                    : "text-slate-400 border border-transparent hover:bg-white/[0.06]"
                }`}
              >
                {m === "solar" ? "☀️ Solar" : "🌙 Lunar"}
              </button>
            ))}
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Moon position</span>
              <span>{Math.round((moonAngle * 180) / Math.PI)}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={(moonAngle * 180) / Math.PI}
              onChange={(e) => {
                setMoonAngle((Number(e.target.value) * Math.PI) / 180);
                setManualControl(true);
              }}
              className="w-full accent-amber-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inclined}
              onChange={(e) => {
                setInclined(e.target.checked);
                setManualControl(true);
              }}
              className="accent-orange-500"
            />
            <span className="text-xs text-slate-300">5° orbit tilt (why eclipses are rare)</span>
          </label>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 pb-[max(0px,env(safe-area-inset-bottom))]">
        <div className="glass-card rounded-2xl px-2 py-1.5 sm:px-3 sm:py-2 border border-white/10 flex items-center gap-1 sm:gap-2">
          <button type="button" onClick={prevStage} disabled={currentStage === 0} className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-30 transition-colors" aria-label="Previous stage">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setIsPlaying((p) => !p)} className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors" aria-label={isPlaying ? "Pause" : "Auto play"}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button type="button" onClick={nextStage} disabled={currentStage === ECLIPSE_STAGES.length - 1} className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-30 transition-colors" aria-label="Next stage">
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

      {/* Stage dots */}
      <div className="absolute top-16 sm:top-20 left-3 z-20 flex gap-1.5">
        {ECLIPSE_STAGES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setManualControl(false);
              setCurrentStage(i);
            }}
            className={`h-1.5 rounded-full transition-all ${
              i === currentStage ? "w-6 bg-amber-400" : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Go to stage ${i + 1}: ${s.title}`}
          />
        ))}
      </div>
    </div>
  );
}
