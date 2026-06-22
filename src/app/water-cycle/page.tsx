"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Float, Text3D, Center } from "@react-three/drei";
import * as THREE from "three";
import { ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

const STAGES = [
  {
    id: "overview",
    title: "The Water Cycle",
    subtitle: "Nature's Endless Journey",
    description: "Water is always moving on Earth. It goes from oceans and lakes into the sky, forms clouds, falls as rain, and flows back to the oceans. This never-ending journey is called the Water Cycle — it has been running for billions of years!",
    funFact: "About 71% of Earth's surface is covered by water, but only 3% is freshwater!",
    camera: [0, 2, 22] as [number, number, number],
    lookAt: [0, 1, 0] as [number, number, number],
  },
  {
    id: "evaporation",
    title: "1. Evaporation",
    subtitle: "Water becomes invisible gas",
    description: "The Sun heats water in oceans, rivers, and lakes to over 100°C at the surface. Water molecules gain energy, break free, and rise as invisible water vapor. Plants also release vapor through tiny pores in their leaves — called Transpiration.",
    funFact: "Every day, about 1,000 cubic kilometers of water evaporates from Earth's surface!",
    camera: [-5, 0, 14] as [number, number, number],
    lookAt: [-3, 2, 0] as [number, number, number],
  },
  {
    id: "condensation",
    title: "2. Condensation",
    subtitle: "Vapor turns back to liquid",
    description: "As water vapor rises, it cools at higher altitudes. When it reaches the dew point, molecules slow down and cling to tiny dust particles, forming water droplets. Billions of these droplets together create the clouds we see in the sky.",
    funFact: "A single cumulus cloud can weigh over 500,000 kg — that's like 100 elephants floating in the air!",
    camera: [-1, 7, 14] as [number, number, number],
    lookAt: [0, 6, 0] as [number, number, number],
  },
  {
    id: "precipitation",
    title: "3. Precipitation",
    subtitle: "Water returns to Earth",
    description: "When cloud droplets combine and grow too heavy, gravity pulls them down as precipitation. Depending on temperature, it falls as rain, snow, sleet, or hail. A single raindrop can travel at 9 meters per second!",
    funFact: "The wettest place on Earth is Mawsynram, India — receiving about 11,871mm of rain per year!",
    camera: [5, 3, 14] as [number, number, number],
    lookAt: [4, 0, 0] as [number, number, number],
  },
  {
    id: "collection",
    title: "4. Collection",
    subtitle: "Water gathers and flows",
    description: "Precipitation collects in rivers, lakes, and oceans. Some infiltrates underground as groundwater. Rivers carry water downhill, eventually reaching the ocean. The water warms up again, and the cycle begins anew — forever!",
    funFact: "It takes a water molecule an average of 3,000 years to complete one full cycle!",
    camera: [3, -1, 14] as [number, number, number],
    lookAt: [2, -3, 0] as [number, number, number],
  },
];

function speakStage(stage: typeof STAGES[0]) {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = `${stage.title}. ${stage.description}. Fun fact: ${stage.funFact}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  } catch {}
}

export default function WaterCyclePage() {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [narration, setNarration] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= STAGES.length - 1) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (!showIntro && narration) {
      speakStage(STAGES[currentStage]);
    }
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, [currentStage, showIntro, narration]);

  const nextStage = () => setCurrentStage((p) => Math.min(p + 1, STAGES.length - 1));
  const prevStage = () => setCurrentStage((p) => Math.max(p - 1, 0));
  const reset = () => { setCurrentStage(0); setIsPlaying(false); };

  if (showIntro) {
    return (
      <div className="h-screen w-screen text-white relative overflow-hidden bg-gradient-to-b from-[#0a1628] via-[#122a4a] to-[#0c1f3d]">
        <div className="absolute top-3 left-3 z-30">
          <Link href="/" className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-xs text-slate-200 hover:text-white hover:bg-white/20 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center h-full px-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 max-w-lg w-full text-center shadow-2xl">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl mb-6">🌊</motion.div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">The Water Cycle</h1>
            <p className="text-slate-400 text-xs mb-4">An Immersive 3D Learning Experience</p>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">Watch water travel from oceans to sky and back in a stunning 3D visualization with narration, animated particles, and real-time weather effects.</p>
            <div className="grid grid-cols-4 gap-3 mb-8">
              {[
                { emoji: "☀️", label: "Evaporation", color: "orange" },
                { emoji: "☁️", label: "Condensation", color: "blue" },
                { emoji: "🌧️", label: "Precipitation", color: "indigo" },
                { emoji: "🌊", label: "Collection", color: "cyan" },
              ].map((s) => (
                <motion.div key={s.label} whileHover={{ scale: 1.05, y: -2 }} className={`rounded-xl bg-${s.color}-500/10 border border-${s.color}-500/20 p-3 cursor-default`}>
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <div className={`text-[10px] text-${s.color}-300 font-semibold`}>{s.label}</div>
                </motion.div>
              ))}
            </div>
            <button onClick={() => setShowIntro(false)} className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30 transition-all active:scale-[0.98]">
              Start Experience →
            </button>
            <p className="text-[10px] text-slate-500 mt-4">Includes voice narration • Use Next/Prev or Auto Play</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const stage = STAGES[currentStage];

  return (
    <div className="h-screen w-screen text-white relative overflow-hidden">
      <div className="absolute top-3 left-3 z-30">
        <Link href="/" className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-xs text-slate-200 hover:text-white hover:bg-white/20 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
      </div>

      {/* Narration toggle */}
      <div className="absolute top-3 right-3 z-30">
        <button
          onClick={() => { setNarration(!narration); if (narration) window.speechSynthesis?.cancel(); }}
          className="bg-black/40 backdrop-blur-sm p-2 rounded-lg border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          title={narration ? "Mute narration" : "Enable narration"}
        >
          {narration ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 2, 22], fov: 48 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.5 }}
      >
        <WaterCycleScene currentStage={currentStage} />
      </Canvas>

      {/* Info card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-auto sm:bottom-24 sm:left-6 sm:max-w-lg z-20"
        >
          <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wide">{stage.subtitle}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">{stage.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">{stage.description}</p>
            <div className="flex items-start gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <span className="text-base">💡</span>
              <p className="text-xs text-amber-300/90 leading-relaxed">{stage.funFact}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 w-64">
        <div className="bg-black/40 backdrop-blur-sm rounded-full h-1.5 overflow-hidden border border-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
            animate={{ width: `${((currentStage) / (STAGES.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <button onClick={reset} className="bg-black/50 backdrop-blur-sm p-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition-all" title="Reset">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={prevStage} disabled={currentStage === 0} className="bg-black/50 backdrop-blur-sm p-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-cyan-400/30 text-cyan-300 hover:text-white hover:border-cyan-400/50 transition-all flex items-center gap-2 text-xs font-medium">
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isPlaying ? "Pause" : "Auto Play"}
        </button>
        <button onClick={nextStage} disabled={currentStage === STAGES.length - 1} className="bg-black/50 backdrop-blur-sm p-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stage dots */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {STAGES.map((s, i) => (
          <button key={s.id} onClick={() => setCurrentStage(i)} className={`transition-all ${i === currentStage ? "w-6 h-2.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" : "w-2.5 h-2.5 rounded-full bg-white/25 hover:bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}

function WaterCycleScene({ currentStage }: { currentStage: number }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 2, 22));
  const targetLook = useRef(new THREE.Vector3(0, 1, 0));
  const currentLook = useRef(new THREE.Vector3(0, 1, 0));

  useEffect(() => {
    const stage = STAGES[currentStage];
    targetPos.current.set(...stage.camera);
    targetLook.current.set(...stage.lookAt);
  }, [currentStage]);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.022);
    currentLook.current.lerp(targetLook.current, 0.022);
    camera.lookAt(currentLook.current);
  });

  return (
    <>
      <SceneBackground />
      <fog attach="fog" args={["#1a3a5c", 22, 50]} />
      <ambientLight intensity={0.2} color="#a0c8e8" />
      <directionalLight position={[-8, 10, 5]} intensity={2.0} color="#fff8e0" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-far={50} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={15} shadow-camera-bottom={-15} />
      <directionalLight position={[5, 6, 8]} intensity={0.4} color="#60a5fa" />
      <hemisphereLight color="#87ceeb" groundColor="#0a2540" intensity={0.2} />

      <RealisticSun currentStage={currentStage} />
      <RealisticOcean currentStage={currentStage} />
      <Terrain />
      <RealisticClouds currentStage={currentStage} />
      <SteamEvaporation active={currentStage >= 1} />
      <HeatShimmer active={currentStage === 1} />
      <VaporTrails active={currentStage >= 1} />
      <RealisticRain active={currentStage >= 3} />
      <RainSplashes active={currentStage >= 3} />
      <Lightning active={currentStage === 3} />
      <RiverStream active={currentStage >= 4} />
      <Waterfall active={currentStage >= 4} />
      <GroundwaterSeep active={currentStage >= 4} />
      <StageLabels currentStage={currentStage} />
      <CycleArrows currentStage={currentStage} />

      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </>
  );
}

function SceneBackground() {
  const { scene } = useThree();
  useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 2048);
    gradient.addColorStop(0, "#020810");
    gradient.addColorStop(0.1, "#0a1e3d");
    gradient.addColorStop(0.3, "#143d6b");
    gradient.addColorStop(0.5, "#2878b5");
    gradient.addColorStop(0.7, "#1a6090");
    gradient.addColorStop(0.85, "#0d3a5c");
    gradient.addColorStop(1, "#061a2e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2048, 2048);
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 500;
      const r = Math.random() * 1.8;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
      ctx.fill();
    }
    scene.background = new THREE.CanvasTexture(canvas);
  }, [scene]);
  return null;
}

function RealisticSun({ currentStage }: { currentStage: number }) {
  const coronaRef = useRef<THREE.Mesh>(null);
  const raysRef = useRef<THREE.Group>(null);
  const flareRef = useRef<THREE.Mesh>(null);
  const isEvap = currentStage === 1;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coronaRef.current) {
      coronaRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.08 + Math.sin(t * 7.3) * 0.04);
      coronaRef.current.rotation.z = t * 0.08;
    }
    if (raysRef.current) {
      raysRef.current.rotation.z = t * 0.04;
      raysRef.current.children.forEach((ray, i) => {
        const pulse = 1 + Math.sin(t * 2.5 + i * 1.1) * 0.35;
        ray.scale.y = pulse;
        (ray as THREE.Mesh).material && ((ray as any).material.opacity = 0.25 + Math.sin(t * 1.5 + i) * 0.15);
      });
    }
    if (flareRef.current) {
      flareRef.current.scale.setScalar(isEvap ? 1.3 + Math.sin(t * 5) * 0.2 : 1 + Math.sin(t * 4) * 0.1);
    }
  });

  return (
    <group position={[-8, 8.5, -10]}>
      {/* Core white-hot center */}
      <mesh>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshBasicMaterial color="#FFFEF0" />
      </mesh>
      {/* Yellow surface */}
      <mesh>
        <sphereGeometry args={[1.9, 48, 48]} />
        <meshBasicMaterial color="#FFE066" transparent opacity={0.75} />
      </mesh>
      {/* Inner corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[2.6, 48, 48]} />
        <meshBasicMaterial color="#FFA500" transparent opacity={0.25} />
      </mesh>
      {/* Outer corona */}
      <mesh ref={flareRef}>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial color="#FF6B00" transparent opacity={isEvap ? 0.18 : 0.1} />
      </mesh>
      {/* Atmosphere haze */}
      <mesh>
        <sphereGeometry args={[5.0, 32, 32]} />
        <meshBasicMaterial color="#FF4500" transparent opacity={0.04} />
      </mesh>
      <mesh>
        <sphereGeometry args={[7.0, 24, 24]} />
        <meshBasicMaterial color="#FF2200" transparent opacity={0.015} />
      </mesh>

      {/* Animated rays */}
      <group ref={raysRef}>
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const length = 1.2 + (i % 4) * 0.6;
          return (
            <mesh key={i} position={[Math.cos(angle) * 3.0, Math.sin(angle) * 3.0, 0]} rotation={[0, 0, angle - Math.PI / 2]}>
              <boxGeometry args={[0.035, length, 0.008]} />
              <meshBasicMaterial color="#FFD700" transparent opacity={0.35} />
            </mesh>
          );
        })}
      </group>

      {/* Light beams toward water during evaporation */}
      {isEvap && (
        <group>
          {[[-0.5, -4], [0.5, -3.5], [1.5, -4.2]].map(([dx, dy], i) => (
            <mesh key={i} position={[3 + dx, dy, 3]} rotation={[0, 0, 0.6]}>
              <planeGeometry args={[0.15, 8]} />
              <meshBasicMaterial color="#FFD700" transparent opacity={0.06} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}

      <pointLight color="#FDB813" intensity={6} distance={45} decay={1.2} />
      <pointLight color="#FF8C00" intensity={2.5} distance={25} decay={2} />
    </group>
  );
}

function RealisticOcean({ currentStage }: { currentStage: number }) {
  const surfaceRef = useRef<THREE.Mesh>(null);
  const foamRef = useRef<THREE.Points>(null);
  const shimmerRef = useRef<THREE.Points>(null);
  const deepRef = useRef<THREE.Mesh>(null);

  const surfaceGeo = useMemo(() => new THREE.PlaneGeometry(34, 18, 100, 50), []);

  const foamData = useMemo(() => {
    const count = 500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 32;
      pos[i * 3 + 1] = -3.2 + Math.random() * 0.15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
    }
    return pos;
  }, []);

  const shimmerData = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = -3.15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (surfaceRef.current) {
      const pos = surfaceRef.current.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const wave1 = Math.sin(x * 0.35 + t * 0.7) * 0.18;
        const wave2 = Math.sin(z * 0.5 + t * 1.1) * 0.12;
        const wave3 = Math.sin((x + z) * 0.25 + t * 0.4) * 0.1;
        const wave4 = Math.sin(x * 1.2 + t * 2.5) * 0.03;
        pos.setY(i, wave1 + wave2 + wave3 + wave4);
      }
      pos.needsUpdate = true;
      surfaceRef.current.geometry.computeVertexNormals();
    }
    if (foamRef.current) {
      const pos = foamRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 500; i++) {
        pos[i * 3 + 1] = -3.2 + Math.sin(t * 1.3 + pos[i * 3] * 0.3) * 0.12 + Math.sin(t * 0.7 + i * 0.1) * 0.06;
      }
      foamRef.current.geometry.attributes.position.needsUpdate = true;
    }
    if (shimmerRef.current) {
      const mat = shimmerRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.2 + Math.sin(t * 1.5) * 0.15 + (currentStage === 1 ? 0.2 : 0);
    }
  });

  return (
    <group>
      <mesh position={[0, -5.8, -5]} receiveShadow>
        <boxGeometry args={[36, 5, 20]} />
        <meshStandardMaterial color="#03263d" roughness={0.5} metalness={0.05} />
      </mesh>

      <mesh ref={surfaceRef} geometry={surfaceGeo} position={[0, -3.2, -5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.45} transparent opacity={0.88} envMapIntensity={1} />
      </mesh>

      <mesh position={[0, -3.5, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[34, 18]} />
        <meshStandardMaterial color="#0369a1" roughness={0.25} metalness={0.3} transparent opacity={0.5} />
      </mesh>

      <points ref={foamRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[foamData, 3]} count={500} />
        </bufferGeometry>
        <pointsMaterial color="#e0f2fe" size={0.055} transparent opacity={0.55} sizeAttenuation depthWrite={false} />
      </points>

      <points ref={shimmerRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[shimmerData, 3]} count={200} />
        </bufferGeometry>
        <pointsMaterial color="#fef9c3" size={0.04} transparent opacity={0.2} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {currentStage >= 1 && (
        <pointLight position={[-3, -2.5, 1]} color="#ff9900" intensity={2} distance={10} decay={2} />
      )}
    </group>
  );
}

function Terrain() {
  const terrainRef = useRef<THREE.Mesh>(null);
  const lakeRef = useRef<THREE.Mesh>(null);

  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(40, 30, 150, 120);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      let height = 0;
      // Large mountain ridges
      height += Math.exp(-((x - 7) ** 2 + (y + 2) ** 2) / 12) * 8;
      height += Math.exp(-((x - 12) ** 2 + (y + 4) ** 2) / 10) * 6.5;
      height += Math.exp(-((x - 4) ** 2 + (y + 1) ** 2) / 8) * 5;
      // Medium hills
      height += Math.exp(-((x - 0) ** 2 + (y - 1) ** 2) / 6) * 3;
      height += Math.exp(-((x + 4) ** 2 + (y + 3) ** 2) / 5) * 2.5;
      height += Math.exp(-((x - 9) ** 2 + (y - 2) ** 2) / 7) * 3.5;
      height += Math.exp(-((x + 2) ** 2 + (y - 3) ** 2) / 4) * 2;
      // Rolling terrain noise
      height += Math.sin(x * 0.5) * Math.cos(y * 0.4) * 0.8;
      height += Math.sin(x * 1.2 + 1) * Math.cos(y * 0.9 + 2) * 0.3;
      height += Math.sin(x * 2.5 + 3) * Math.cos(y * 2.1 + 1) * 0.1;
      // Valley/river channel
      const riverDist = Math.abs(x - 3 + Math.sin(y * 0.3) * 2);
      if (riverDist < 1.5) height -= (1.5 - riverDist) * 0.8;
      // Cliff edge
      height += Math.exp(-((x - 5.5) ** 2 + (y + 0.5) ** 2) / 2) * 4;
      // Ocean side should be low
      if (x < -5) height *= Math.max(0, (x + 8) / 3);
      pos.setZ(i, Math.max(height * 0.7, -0.2));
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Lake water shader uniforms
  const lakeUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#0c7bb3") },
    uDeepColor: { value: new THREE.Color("#053d5a") },
  }), []);

  const lakeVertex = `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vec3 pos = position;
      float wave = sin(pos.x * 4.0 + uTime * 2.0) * 0.02
                 + sin(pos.y * 3.0 + uTime * 1.5) * 0.015
                 + sin((pos.x + pos.y) * 6.0 + uTime * 3.0) * 0.008;
      pos.z += wave;
      vNormal = normalize(normalMatrix * vec3(-cos(pos.x * 4.0 + uTime * 2.0) * 0.08, -cos(pos.y * 3.0 + uTime * 1.5) * 0.06, 1.0));
      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const lakeFragment = `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uDeepColor;
    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
      vec3 sunDir = normalize(vec3(-8.0, 8.5, -10.0) - vWorldPos);
      vec3 halfDir = normalize(sunDir + viewDir);
      float spec = pow(max(dot(vNormal, halfDir), 0.0), 64.0);
      float caustic = sin(vWorldPos.x * 8.0 + uTime * 2.5) * sin(vWorldPos.z * 8.0 + uTime * 2.0);
      caustic = pow(abs(caustic), 2.0) * 0.12;
      vec3 col = mix(uDeepColor, uColor, 0.5 + fresnel * 0.5);
      col += vec3(0.8, 0.95, 1.0) * spec * 0.8;
      col += vec3(0.2, 0.6, 0.9) * caustic;
      vec3 skyReflect = mix(vec3(0.05, 0.2, 0.4), vec3(0.4, 0.7, 1.0), fresnel);
      col = mix(col, skyReflect, fresnel * 0.4);
      gl_FragColor = vec4(col, 0.88 - fresnel * 0.1);
    }
  `;

  useFrame(({ clock }) => {
    if (lakeRef.current) {
      (lakeRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <group>
      {/* Large procedural terrain */}
      <mesh ref={terrainRef} geometry={terrainGeo} position={[3, -3.8, -8]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          color="#3a6b28"
          roughness={0.92}
          metalness={0.02}
          flatShading={false}
        />
      </mesh>

      {/* Snow caps on tall peaks */}
      <mesh position={[7, 1.8, -10]}>
        <coneGeometry args={[1.8, 2.2, 8]} />
        <meshStandardMaterial color="#f0f5fa" roughness={0.3} emissive="#e8f0f8" emissiveIntensity={0.06} />
      </mesh>
      <mesh position={[12, 0.8, -12]}>
        <coneGeometry args={[1.3, 1.6, 7]} />
        <meshStandardMaterial color="#e8f0f5" roughness={0.35} />
      </mesh>
      <mesh position={[4, 0.2, -9]}>
        <coneGeometry args={[1.0, 1.2, 6]} />
        <meshStandardMaterial color="#edf2f7" roughness={0.35} />
      </mesh>

      {/* Rocky cliff face */}
      <mesh position={[5.5, -1.5, -6]} castShadow>
        <boxGeometry args={[4, 4.5, 3]} />
        <meshStandardMaterial color="#4a5c3a" roughness={0.95} />
      </mesh>
      <mesh position={[5.5, 0.3, -6]} castShadow>
        <boxGeometry args={[3, 1.2, 2.5]} />
        <meshStandardMaterial color="#3d5030" roughness={0.92} />
      </mesh>
      <mesh position={[5.5, 0.9, -6]} castShadow>
        <boxGeometry args={[2, 0.6, 2]} />
        <meshStandardMaterial color="#5a7048" roughness={0.88} />
      </mesh>

      {/* River bed / valley with shader water */}
      <mesh ref={lakeRef} position={[2.5, -3.4, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 12, 40, 60]} />
        <shaderMaterial
          vertexShader={lakeVertex}
          fragmentShader={lakeFragment}
          uniforms={lakeUniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Circular lake with shader water */}
      <mesh position={[-1.5, -3.35, -4.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 36]} />
        <shaderMaterial
          vertexShader={lakeVertex}
          fragmentShader={lakeFragment}
          uniforms={lakeUniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ground texture layer beneath terrain */}
      <mesh position={[3, -3.85, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[42, 32]} />
        <meshStandardMaterial color="#1a3d12" roughness={0.98} />
      </mesh>

      {/* Trees - dense forest */}
      {[
        [-4, -3.0, -3, 1.2], [-2.5, -2.8, -3.5, 1.0], [-0.8, -3.0, -3, 0.8],
        [0.8, -2.9, -3.5, 0.9], [1.8, -2.8, -4, 0.7], [3.5, -2.5, -3, 0.6],
        [8, -1.2, -6, 1.0], [9.5, -1.5, -5.5, 0.9], [7, -1.8, -5, 0.75],
        [10.5, -1.8, -7, 0.85], [6, -2.2, -4.5, 0.6], [4.5, -2.5, -3.5, 0.55],
        [-3.5, -3.1, -5, 0.7], [-1.5, -3.2, -5.5, 0.65], [0, -3.1, -5, 0.8],
        [11, -2.0, -8, 0.75], [8.5, -1.4, -7, 1.1], [5.5, -2.3, -4, 0.5],
        [-5, -3.1, -4, 0.9], [-3, -3.0, -6, 0.6], [2, -3.0, -6, 0.7],
        [13, -2.5, -10, 0.8], [12, -2.2, -9, 0.65], [9, -1.7, -8, 0.5],
      ].map(([x, y, z, s], i) => (
        <group key={i} position={[x, y, z]} scale={[s, s, s]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.08, 1.2, 6]} />
            <meshStandardMaterial color="#2d1a08" roughness={0.92} />
          </mesh>
          <mesh position={[0, 1.4, 0]} castShadow>
            <coneGeometry args={[0.55, 1.4, 8]} />
            <meshStandardMaterial color="#0f4a0f" roughness={0.85} />
          </mesh>
          <mesh position={[0, 2.0, 0]} castShadow>
            <coneGeometry args={[0.4, 1.0, 7]} />
            <meshStandardMaterial color="#1a6b1a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.5, 0]} castShadow>
            <coneGeometry args={[0.22, 0.6, 6]} />
            <meshStandardMaterial color="#228B22" roughness={0.75} />
          </mesh>
        </group>
      ))}

      {/* Boulders/rocks on terrain */}
      {[
        [4, -2.8, -4, 0.5], [6, -2.0, -5, 0.4], [3, -3.0, -3, 0.35],
        [8, -2.2, -5.5, 0.45], [1, -3.2, -4, 0.3], [10, -2.5, -6, 0.5],
        [5, -2.5, -4.5, 0.25], [-2, -3.3, -4, 0.4],
      ].map(([x, y, z, s], i) => (
        <mesh key={`rock-${i}`} position={[x, y, z]} rotation={[Math.random(), Math.random(), 0]} castShadow>
          <dodecahedronGeometry args={[s, 1]} />
          <meshStandardMaterial color="#4a5040" roughness={0.95} metalness={0.02} />
        </mesh>
      ))}

      {/* Grass patches */}
      {[
        [-3, -3.15, -3], [0, -3.2, -3.5], [2, -3.1, -4], [7, -2.5, -5],
        [-1, -3.25, -4.5], [4, -2.8, -3.5], [6, -2.3, -4], [9, -2.0, -5.5],
      ].map(([x, y, z], i) => (
        <mesh key={`grass-${i}`} position={[x, y + 0.2, z]} castShadow>
          <coneGeometry args={[0.3, 0.5, 5]} />
          <meshStandardMaterial color="#4a9a30" roughness={0.85} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function RealisticClouds({ currentStage }: { currentStage: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const density = currentStage >= 2 ? 1 : currentStage >= 1 ? 0.45 : 0.15;
  const dark = currentStage >= 3;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((cloud, i) => {
      cloud.position.x += Math.sin(t * 0.06 + i * 2.5) * 0.0015;
      cloud.position.y += Math.cos(t * 0.12 + i * 3.2) * 0.0008;
    });
  });

  const baseColor = dark ? "#5a6a7a" : "#e4eef8";
  const darkColor = dark ? "#3a4a5a" : "#d0dff0";

  return (
    <group ref={groupRef}>
      {/* Large cumulus */}
      <group position={[-1, 6.2, -4]}>
        {[
          [0, 0, 0, 1.7], [1.4, 0.3, 0.3, 1.3], [-1.2, 0.1, -0.2, 1.1],
          [0.6, 0.8, 0.1, 1.0], [-0.6, 0.6, 0.2, 0.85], [0.2, -0.3, 0.3, 1.2],
          [2.0, 0.1, 0.1, 0.8], [-1.8, -0.1, 0, 0.75], [0.9, 1.0, -0.1, 0.6],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[r * density + r * 0.3, 24, 24]} />
            <meshStandardMaterial color={baseColor} roughness={0.92} transparent opacity={Math.min(0.93, density * 0.8 + 0.12)} />
          </mesh>
        ))}
      </group>

      {/* Rain cloud */}
      <group position={[4.5, 5.8, -5]}>
        {[
          [0, 0, 0, 1.5], [1.1, 0.2, 0.1, 1.1], [-0.9, 0.1, 0.2, 1.0],
          [0.5, 0.6, 0, 0.8], [-0.5, -0.2, 0.1, 1.1], [1.6, -0.1, 0.2, 0.7],
          [-1.4, 0.2, -0.1, 0.65], [0.3, -0.5, 0.3, 0.9],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[r * density + r * 0.2, 22, 22]} />
            <meshStandardMaterial color={dark ? "#3d4d5d" : darkColor} roughness={0.94} transparent opacity={Math.min(0.92, density * 0.75 + 0.1)} />
          </mesh>
        ))}
      </group>

      {/* High wispy cloud */}
      <group position={[-5.5, 7.5, -7]}>
        {[
          [0, 0, 0, 1.1], [1.0, 0.1, 0, 0.75], [-0.7, 0.05, 0.1, 0.7],
          [0.4, 0.3, 0, 0.5], [1.5, -0.05, 0, 0.5],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[r * density + r * 0.15, 18, 18]} />
            <meshStandardMaterial color="#d8e8f5" roughness={0.9} transparent opacity={Math.min(0.65, density * 0.5 + 0.08)} />
          </mesh>
        ))}
      </group>

      {/* Small cloud */}
      <group position={[8, 6.5, -8]}>
        {[
          [0, 0, 0, 0.8], [0.6, 0.1, 0, 0.55], [-0.4, 0, 0, 0.5],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[r * density + r * 0.2, 16, 16]} />
            <meshStandardMaterial color={baseColor} roughness={0.9} transparent opacity={Math.min(0.7, density * 0.6 + 0.08)} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function SteamEvaporation({ active }: { active: boolean }) {
  const steamRef = useRef<THREE.Points>(null);
  const count = 250;

  const { positions, velocities, lifetimes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel: number[] = [];
    const life: number[] = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18 - 1;
      pos[i * 3 + 1] = -3.1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
      vel.push((Math.random() - 0.5) * 0.25, 0.3 + Math.random() * 0.7, (Math.random() - 0.5) * 0.08);
      life.push(Math.random() * 12);
    }
    return { positions: pos, velocities: vel, lifetimes: life };
  }, []);

  useFrame(({ clock }) => {
    if (!steamRef.current) return;
    const t = clock.getElapsedTime();
    const posArr = steamRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const age = (t + lifetimes[i]) % 12;
      const progress = age / 12;
      posArr[i * 3] = positions[i * 3] + velocities[i * 3] * age + Math.sin(t * 0.4 + i * 0.7) * progress * 1.0;
      posArr[i * 3 + 1] = -3.1 + velocities[i * 3 + 1] * age + progress * progress * 0.5;
      posArr[i * 3 + 2] = positions[i * 3 + 2] + Math.cos(t * 0.25 + i * 0.4) * progress * 0.5;
    }
    steamRef.current.geometry.attributes.position.needsUpdate = true;
    const mat = steamRef.current.material as THREE.PointsMaterial;
    mat.opacity = active ? 0.35 : 0;
    mat.size = active ? 0.2 : 0;
  });

  return (
    <points ref={steamRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#bae6fd" size={0.2} transparent opacity={0} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function VaporTrails({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 80;

  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = -2 + Math.random() * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const cycle = ((t * 0.2 + i * 0.15) % 1);
      posArr[i * 3] = data[i * 3] + Math.sin(t * 0.3 + i) * 0.5;
      posArr[i * 3 + 1] = -3 + cycle * 10;
      posArr[i * 3 + 2] = data[i * 3 + 2] + Math.cos(t * 0.2 + i) * 0.3;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = active ? 0.2 : 0;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#93c5fd" size={0.12} transparent opacity={0} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function HeatShimmer({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 100;
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16 - 1;
      pos[i * 3 + 1] = -2.8 + Math.random() * 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3] = data[i * 3] + Math.sin(t * 4 + i * 0.7) * 0.12;
      posArr[i * 3 + 1] = data[i * 3 + 1] + Math.sin(t * 5 + i * 1.1) * 0.06 + Math.sin(t * 2) * 0.03;
      posArr[i * 3 + 2] = data[i * 3 + 2] + Math.cos(t * 3 + i * 0.5) * 0.05;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = active ? 0.5 : 0;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#fbbf24" size={0.09} transparent opacity={0} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function RealisticRain({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const count = 400;

  const rainData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.3) * 16 + 1,
      z: (Math.random() - 0.5) * 10 - 2,
      speed: 5 + Math.random() * 9,
      length: 0.25 + Math.random() * 0.55,
      offset: Math.random() * 20,
      windX: (Math.random() - 0.5) * 0.4,
      thickness: 0.006 + Math.random() * 0.01,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current || !active) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((drop, i) => {
      const d = rainData[i];
      const cycle = ((t * d.speed + d.offset) % 13);
      drop.position.set(d.x + d.windX * cycle * 0.25, 6.5 - cycle, d.z);
      drop.visible = active;
    });
  });

  return (
    <group ref={groupRef}>
      {rainData.map((d, i) => (
        <mesh key={i} position={[d.x, 6.5, d.z]} rotation={[0.05, 0, -0.08]}>
          <cylinderGeometry args={[d.thickness, d.thickness * 2.5, d.length, 4]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.65} />
        </mesh>
      ))}
    </group>
  );
}

function RainSplashes({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 120;
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.3) * 14 + 2;
      pos[i * 3 + 1] = -3.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const phase = (t * 4 + i * 0.8) % 1;
      const arc = phase * (1 - phase) * 4;
      posArr[i * 3] = data[i * 3] + Math.sin(i * 2.7) * phase * 0.4;
      posArr[i * 3 + 1] = -3.2 + arc * 0.6;
      posArr[i * 3 + 2] = data[i * 3 + 2] + Math.cos(i * 1.9) * phase * 0.4;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = active ? 0.55 : 0;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#bfdbfe" size={0.045} transparent opacity={0} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Lightning({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setFlash(true);
        setTimeout(() => setFlash(false), 100);
        setTimeout(() => { setFlash(true); setTimeout(() => setFlash(false), 60); }, 150);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [active]);

  if (!active || !flash) return null;

  return (
    <group position={[4.5, 4, -4]}>
      <pointLight color="#e0e7ff" intensity={15} distance={25} decay={2} />
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[0.03, 2.5, 0.01]} />
        <meshBasicMaterial color="#e0e7ff" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.15, -1.5, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.025, 1.2, 0.01]} />
        <meshBasicMaterial color="#c7d2fe" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function RiverStream({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      pos[i * 3] = 5 + t * 10;
      pos[i * 3 + 1] = -3.2;
      pos[i * 3 + 2] = -3 + Math.sin(t * 5) * 0.7;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    const t = clock.getElapsedTime();
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const progress = i / count;
      const flowOffset = (t * 2.5 + i * 0.04) % 1;
      posArr[i * 3] = 4.5 + ((progress + flowOffset) % 1) * 12;
      posArr[i * 3 + 1] = -3.15 + Math.sin(t * 2.5 + progress * 10) * 0.07;
      posArr[i * 3 + 2] = -3 + Math.sin(progress * 5 + t * 0.4) * 0.6;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = active ? 0.7 : 0;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#22d3ee" size={0.07} transparent opacity={0} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Waterfall({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const mistRef = useRef<THREE.Points>(null);
  const count = 150;

  const fallData = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 5.5 + (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = -5 + (Math.random() - 0.5) * 0.3;
    }
    return pos;
  }, []);

  const mistData = useMemo(() => {
    const count = 50;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 5.5 + (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 1] = -3.3 + Math.random() * 0.8;
      pos[i * 3 + 2] = -5 + (Math.random() - 0.5) * 1.5;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    const t = clock.getElapsedTime();
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const speed = 4 + (i % 7) * 0.6;
      const cycle = ((t * speed + i * 0.15) % 3) / 3;
      posArr[i * 3] = 5.5 + (Math.sin(i * 0.5) * 0.15) + Math.sin(t + i) * 0.03;
      posArr[i * 3 + 1] = -0.5 - cycle * 3.2;
      posArr[i * 3 + 2] = -5 + (Math.cos(i * 0.3) * 0.12);
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = active ? 0.85 : 0;

    if (mistRef.current) {
      const mPos = mistRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 50; i++) {
        mPos[i * 3] = mistData[i * 3] + Math.sin(t * 2 + i) * 0.3;
        mPos[i * 3 + 1] = mistData[i * 3 + 1] + Math.sin(t * 1.5 + i * 0.5) * 0.15;
        mPos[i * 3 + 2] = mistData[i * 3 + 2] + Math.cos(t * 1.8 + i) * 0.2;
      }
      mistRef.current.geometry.attributes.position.needsUpdate = true;
      (mistRef.current.material as THREE.PointsMaterial).opacity = active ? 0.3 : 0;
    }
  });

  return (
    <>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[fallData, 3]} count={count} />
        </bufferGeometry>
        <pointsMaterial color="#7dd3fc" size={0.055} transparent opacity={0} sizeAttenuation depthWrite={false} />
      </points>
      <points ref={mistRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[mistData, 3]} count={50} />
        </bufferGeometry>
        <pointsMaterial color="#e0f2fe" size={0.18} transparent opacity={0} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {active && (
        <>
          <mesh position={[5.5, -3.35, -5]}>
            <sphereGeometry args={[0.5, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} roughness={0.15} metalness={0.4} />
          </mesh>
          <pointLight position={[5.5, -2.5, -4.5]} color="#7dd3fc" intensity={1} distance={4} decay={2} />
        </>
      )}
    </>
  );
}

function GroundwaterSeep({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 40;
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 3 + Math.random() * 6;
      pos[i * 3 + 1] = -3.5 - Math.random() * 1.5;
      pos[i * 3 + 2] = -3 + (Math.random() - 0.5) * 3;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    const t = clock.getElapsedTime();
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const speed = 0.3 + (i % 4) * 0.1;
      posArr[i * 3] = data[i * 3] + Math.sin(t * speed + i) * 0.2;
      posArr[i * 3 + 1] = data[i * 3 + 1] + Math.sin(t * 0.5 + i * 0.3) * 0.1;
      posArr[i * 3 + 2] = data[i * 3 + 2] + Math.cos(t * speed + i) * 0.15;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = active ? 0.4 : 0;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#06b6d4" size={0.06} transparent opacity={0} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function CycleArrows({ currentStage }: { currentStage: number }) {
  const arrows = [
    { from: [-4, -2, 1], to: [-3, 4, 0], color: "#fbbf24", show: currentStage === 1 },
    { from: [-2, 4.5, 0], to: [2, 6, 0], color: "#60a5fa", show: currentStage === 2 },
    { from: [4, 5, 0], to: [5, 0, 0], color: "#818cf8", show: currentStage === 3 },
    { from: [5, -2, 0], to: [0, -3, 0], color: "#22d3ee", show: currentStage === 4 },
  ];

  return (
    <>
      {arrows.map((a, idx) => a.show && (
        <AnimatedArrow key={idx} from={a.from as [number, number, number]} to={a.to as [number, number, number]} color={a.color} />
      ))}
    </>
  );
}

function AnimatedArrow({ from, to, color }: { from: [number, number, number]; to: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Points>(null);
  const count = 30;

  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      pos[i * 3] = from[0] + (to[0] - from[0]) * t;
      pos[i * 3 + 1] = from[1] + (to[1] - from[1]) * t;
      pos[i * 3 + 2] = from[2] + (to[2] - from[2]) * t;
    }
    return pos;
  }, [from, to]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const prog = ((i / count + t * 0.3) % 1);
      posArr[i * 3] = from[0] + (to[0] - from[0]) * prog + Math.sin(t + i) * 0.1;
      posArr[i * 3 + 1] = from[1] + (to[1] - from[1]) * prog + Math.sin(t * 1.5 + i) * 0.08;
      posArr[i * 3 + 2] = from[2] + (to[2] - from[2]) * prog;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.12} transparent opacity={0.7} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function StageLabels({ currentStage }: { currentStage: number }) {
  const labels = [
    { text: "Evaporation", pos: [-4, 1.5, 2] as [number, number, number], show: currentStage === 1, color: "#fbbf24" },
    { text: "Condensation", pos: [0, 8, -1] as [number, number, number], show: currentStage === 2, color: "#60a5fa" },
    { text: "Precipitation", pos: [5, 4.5, 1] as [number, number, number], show: currentStage === 3, color: "#818cf8" },
    { text: "Collection", pos: [4.5, -1.8, 2] as [number, number, number], show: currentStage === 4, color: "#22d3ee" },
  ];

  return (
    <>
      {labels.map((l) => (
        l.show && (
          <Float key={l.text} speed={1.5} rotationIntensity={0} floatIntensity={0.15}>
            <group position={l.pos}>
              <mesh position={[0, 0, -0.02]}>
                <planeGeometry args={[3.8, 0.9]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.65} />
              </mesh>
              <mesh position={[0, 0, -0.015]}>
                <planeGeometry args={[3.85, 0.95]} />
                <meshBasicMaterial color={l.color} transparent opacity={0.12} />
              </mesh>
              <Center position={[0, 0, 0.01]}>
                <Text3D font="/fonts/helvetiker_bold.typeface.json" size={0.3} height={0.04}>
                  {l.text}
                  <meshBasicMaterial color={l.color} />
                </Text3D>
              </Center>
            </group>
          </Float>
        )
      ))}
    </>
  );
}
