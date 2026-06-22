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
    title: "Photosynthesis",
    subtitle: "How Plants Make Food",
    description: "Photosynthesis is the process plants use to convert sunlight, water, and carbon dioxide into glucose (food) and oxygen. It's the foundation of almost all life on Earth — without it, we wouldn't have food or breathable air!",
    funFact: "Plants produce about 70% of the oxygen in our atmosphere!",
    camera: [0, 3, 16] as [number, number, number],
    lookAt: [0, 2, 0] as [number, number, number],
  },
  {
    id: "sunlight",
    title: "1. Sunlight Absorption",
    subtitle: "Energy captured by Chlorophyll",
    description: "Leaves contain a green pigment called Chlorophyll inside Chloroplasts. Chlorophyll absorbs red and blue light from the sun and reflects green — that's why leaves look green! This light energy powers the entire process.",
    funFact: "A single leaf has millions of chloroplasts — each one is a tiny solar panel!",
    camera: [-1, 5, 8] as [number, number, number],
    lookAt: [0, 4, 0] as [number, number, number],
  },
  {
    id: "water",
    title: "2. Water Absorption",
    subtitle: "H₂O travels from roots to leaves",
    description: "Roots absorb water (H₂O) from the soil. Water travels up through the stem via tiny tubes called Xylem — like a straw! It reaches the leaves where it's split into hydrogen and oxygen using light energy (Photolysis).",
    funFact: "A large tree absorbs over 400 liters of water per day!",
    camera: [1.5, 0, 5] as [number, number, number],
    lookAt: [0, 0, 0] as [number, number, number],
  },
  {
    id: "co2",
    title: "3. CO₂ Intake",
    subtitle: "Carbon Dioxide enters through Stomata",
    description: "Tiny pores called Stomata on the underside of leaves open to let CO₂ in from the air. Guard cells control these openings — they open during the day and close at night. CO₂ provides the carbon atoms for making glucose.",
    funFact: "A leaf can have 100,000 stomata per square centimeter!",
    camera: [2, 4, 7] as [number, number, number],
    lookAt: [0.5, 4, 0] as [number, number, number],
  },
  {
    id: "reaction",
    title: "4. Chemical Reaction",
    subtitle: "6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂",
    description: "Inside chloroplasts, light energy splits water. Hydrogen combines with CO₂ through the Calvin Cycle to create glucose (C₆H₁₂O₆). This is where all the ingredients come together — sunlight provides energy, water gives hydrogen, CO₂ gives carbon.",
    funFact: "The Calvin Cycle was discovered by Melvin Calvin — Nobel Prize 1961!",
    camera: [0, 4, 6] as [number, number, number],
    lookAt: [0, 4, 0] as [number, number, number],
  },
  {
    id: "oxygen",
    title: "5. Oxygen Release",
    subtitle: "O₂ exits through Stomata",
    description: "Oxygen (O₂) is a byproduct of splitting water molecules. It exits leaves through stomata — the same pores that let CO₂ in. This oxygen is what all animals breathe! One tree produces enough O₂ for 4 people per year.",
    funFact: "The Amazon Rainforest produces 20% of world's oxygen — 'lungs of Earth'!",
    camera: [1, 5, 9] as [number, number, number],
    lookAt: [0, 5, 0] as [number, number, number],
  },
  {
    id: "glucose",
    title: "6. Glucose Storage",
    subtitle: "Food for growth & energy",
    description: "Glucose is used for energy (respiration), growth, and repair. Some is stored as starch in roots, stems, and fruits. Animals eat plants to get this energy — photosynthesis is the base of the entire food chain!",
    funFact: "Plants convert only 3-6% of sunlight into chemical energy, yet power all life!",
    camera: [0, 2, 10] as [number, number, number],
    lookAt: [0, 1.5, 0] as [number, number, number],
  },
];

function speakStage(stage: typeof STAGES[0]) {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${stage.title}. ${stage.description}. Fun fact: ${stage.funFact}`);
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  } catch {}
}

export default function PhotosynthesisPage() {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [narration, setNarration] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStage((prev) => { if (prev >= STAGES.length - 1) { setIsPlaying(false); return prev; } return prev + 1; });
    }, 10000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (!showIntro && narration) speakStage(STAGES[currentStage]);
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, [currentStage, showIntro, narration]);

  if (showIntro) {
    return (
      <div className="h-screen w-screen text-white relative overflow-hidden bg-gradient-to-b from-[#0a2010] via-[#1a4028] to-[#0c2818]">
        <div className="absolute top-3 left-3 z-30"><Link href="/" className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-xs text-slate-200 hover:text-white hover:bg-white/20 transition-all"><ArrowLeft className="w-3.5 h-3.5" /> Back</Link></div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center h-full px-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 max-w-lg w-full text-center shadow-2xl">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl mb-6">🌿</motion.div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Photosynthesis</h1>
            <p className="text-slate-400 text-xs mb-4">An Immersive 3D Learning Experience</p>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">Explore how plants convert sunlight, water, and CO₂ into food and oxygen through stunning 3D visualization with narration.</p>
            <div className="grid grid-cols-3 gap-2 mb-8">
              {[{ e: "☀️", l: "Sunlight" }, { e: "💧", l: "Water" }, { e: "🌬️", l: "CO₂" }, { e: "⚡", l: "Reaction" }, { e: "🫧", l: "Oxygen" }, { e: "🍬", l: "Glucose" }].map((s) => (
                <div key={s.l} className="rounded-xl bg-green-500/10 border border-green-500/20 p-2.5"><div className="text-xl mb-0.5">{s.e}</div><div className="text-[9px] text-green-300 font-semibold">{s.l}</div></div>
              ))}
            </div>
            <button onClick={() => setShowIntro(false)} className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-lg shadow-green-500/30 transition-all active:scale-[0.98]">Start Experience →</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const stage = STAGES[currentStage];

  return (
    <div className="h-screen w-screen text-white relative overflow-hidden">
      <div className="absolute top-3 left-3 z-30"><Link href="/" className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-xs text-slate-200 hover:text-white hover:bg-white/20 transition-all"><ArrowLeft className="w-3.5 h-3.5" /> Back</Link></div>
      <div className="absolute top-3 right-3 z-30"><button onClick={() => { setNarration(!narration); if (narration) window.speechSynthesis?.cancel(); }} className="bg-black/40 backdrop-blur-sm p-2 rounded-lg border border-white/15 text-slate-300 hover:text-white transition-all">{narration ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</button></div>

      <Canvas shadows camera={{ position: [0, 3, 16], fov: 48 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.5 }}>
        <Scene currentStage={currentStage} />
      </Canvas>

      <AnimatePresence mode="wait">
        <motion.div key={stage.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.5 }} className="absolute bottom-20 left-4 right-4 sm:left-6 sm:right-auto sm:bottom-24 sm:max-w-lg z-20">
          <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
            <span className="text-xs text-green-400 font-semibold uppercase tracking-wide">{stage.subtitle}</span>
            <h2 className="text-xl font-bold mb-2 text-white">{stage.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">{stage.description}</p>
            <div className="flex items-start gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10"><span>💡</span><p className="text-xs text-amber-300/90">{stage.funFact}</p></div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 w-56"><div className="bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/10"><motion.div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" animate={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%` }} /></div></div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <button onClick={() => { setCurrentStage(0); setIsPlaying(false); }} className="bg-black/50 p-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white transition-all"><RotateCcw className="w-4 h-4" /></button>
        <button onClick={() => setCurrentStage((p) => Math.max(0, p - 1))} disabled={currentStage === 0} className="bg-black/50 p-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white transition-all disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="bg-green-500/20 px-5 py-2.5 rounded-xl border border-green-400/30 text-green-300 hover:text-white transition-all flex items-center gap-2 text-xs font-medium">{isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}{isPlaying ? "Pause" : "Auto Play"}</button>
        <button onClick={() => setCurrentStage((p) => Math.min(STAGES.length - 1, p + 1))} disabled={currentStage === STAGES.length - 1} className="bg-black/50 p-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white transition-all disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
      </div>

      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {STAGES.map((s, i) => (<button key={s.id} onClick={() => setCurrentStage(i)} className={`transition-all ${i === currentStage ? "w-6 h-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50" : "w-2.5 h-2.5 rounded-full bg-white/25 hover:bg-white/50"}`} />))}
      </div>
    </div>
  );
}

function Scene({ currentStage }: { currentStage: number }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 3, 16));
  const targetLook = useRef(new THREE.Vector3(0, 2, 0));
  const currentLook = useRef(new THREE.Vector3(0, 2, 0));

  useEffect(() => {
    const s = STAGES[currentStage];
    targetPos.current.set(...s.camera);
    targetLook.current.set(...s.lookAt);
  }, [currentStage]);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.03);
    currentLook.current.lerp(targetLook.current, 0.03);
    camera.lookAt(currentLook.current);
  });

  return (
    <>
      <Background />
      <fog attach="fog" args={["#1a3520", 20, 50]} />
      <ambientLight intensity={0.3} color="#d0e8d0" />
      <directionalLight position={[-5, 12, 6]} intensity={2.2} color="#fff8e0" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-far={40} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-8} />
      <hemisphereLight color="#a8d8a8" groundColor="#2a3520" intensity={0.2} />

      <TheSun active={currentStage === 1} />
      <RealisticPlant currentStage={currentStage} />
      <RealisticGround />

      {/* Stage-specific effects */}
      <SunRays active={currentStage >= 1} />
      <WaterFlow active={currentStage >= 2} />
      <CO2Flow active={currentStage >= 3} />
      <ChemicalReaction active={currentStage >= 4} />
      <OxygenRelease active={currentStage >= 5} />
      <GlucoseStore active={currentStage >= 6} />

      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </>
  );
}

function Background() {
  const { scene } = useThree();
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048; c.height = 2048;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 2048);
    g.addColorStop(0, "#040d08"); g.addColorStop(0.2, "#0f2a18"); g.addColorStop(0.5, "#1a4a28"); g.addColorStop(0.8, "#0f3018"); g.addColorStop(1, "#061510");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 2048, 2048);
    scene.background = new THREE.CanvasTexture(c);
  }, [scene]);
  return null;
}

function TheSun({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 2) * 0.04); });
  return (
    <group position={[-5, 10, -6]}>
      <mesh><sphereGeometry args={[1.3, 48, 48]} /><meshBasicMaterial color="#FFFCE8" /></mesh>
      <mesh ref={ref}><sphereGeometry args={[1.7, 32, 32]} /><meshBasicMaterial color="#FFD700" transparent opacity={0.55} /></mesh>
      <mesh><sphereGeometry args={[2.3, 24, 24]} /><meshBasicMaterial color="#FFA500" transparent opacity={active ? 0.2 : 0.08} /></mesh>
      <pointLight color="#FDB813" intensity={active ? 5 : 2.5} distance={35} decay={1.2} />
    </group>
  );
}

function RealisticPlant({ currentStage }: { currentStage: number }) {
  const leafRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (leafRef.current) {
      const t = clock.getElapsedTime();
      leafRef.current.children.forEach((l, i) => { l.rotation.z = Math.sin(t * 0.4 + i) * 0.025; });
    }
  });

  const leafGlow = currentStage >= 4;
  const leafColor = currentStage >= 1 ? "#2ecc40" : "#228B22";

  return (
    <group>
      {/* Main trunk */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 4.5, 10]} />
        <meshStandardMaterial color="#3d5c1a" roughness={0.88} />
      </mesh>
      {/* Inner xylem visible line */}
      <mesh position={[0, 1.5, 0.08]}>
        <cylinderGeometry args={[0.03, 0.03, 4.5, 6]} />
        <meshStandardMaterial color={currentStage >= 2 ? "#2196F3" : "#4a6b28"} emissive={currentStage >= 2 ? "#2196F3" : "#000"} emissiveIntensity={currentStage >= 2 ? 0.3 : 0} roughness={0.5} transparent opacity={0.8} />
      </mesh>

      {/* Branches */}
      <mesh position={[-0.6, 3.2, 0]} rotation={[0, 0, 0.5]} castShadow>
        <cylinderGeometry args={[0.05, 0.1, 1.8, 6]} />
        <meshStandardMaterial color="#3d5c1a" roughness={0.88} />
      </mesh>
      <mesh position={[0.7, 3.6, 0]} rotation={[0, 0, -0.45]} castShadow>
        <cylinderGeometry args={[0.04, 0.08, 1.6, 6]} />
        <meshStandardMaterial color="#3d5c1a" roughness={0.88} />
      </mesh>
      <mesh position={[-0.3, 3.8, 0.2]} rotation={[0.2, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.03, 0.06, 1.2, 6]} />
        <meshStandardMaterial color="#4a6b28" roughness={0.85} />
      </mesh>

      {/* Roots — clearly visible */}
      {[
        { pos: [-0.5, -0.9, 0.2], rot: [0.2, 0, 0.6], len: 1.8, r: 0.07 },
        { pos: [0.4, -1.0, -0.1], rot: [-0.1, 0, -0.5], len: 1.6, r: 0.06 },
        { pos: [0, -1.1, 0.3], rot: [0.4, 0, 0.1], len: 1.5, r: 0.08 },
        { pos: [-0.3, -0.8, -0.3], rot: [-0.3, 0.2, 0.4], len: 1.4, r: 0.05 },
        { pos: [0.6, -0.7, 0.1], rot: [0.1, -0.1, -0.7], len: 1.7, r: 0.06 },
        { pos: [-0.7, -0.6, 0], rot: [0, 0, 0.8], len: 1.3, r: 0.04 },
        { pos: [0.2, -1.0, -0.2], rot: [-0.2, 0.3, -0.2], len: 1.2, r: 0.05 },
      ].map((root, i) => (
        <mesh key={i} position={root.pos as [number, number, number]} rotation={root.rot as [number, number, number]} castShadow>
          <cylinderGeometry args={[root.r * 0.4, root.r, root.len, 6]} />
          <meshStandardMaterial color="#5a3d18" roughness={0.92} />
        </mesh>
      ))}
      {/* Root tips with tiny hairs */}
      {[[-1.0, -1.6, 0.3], [0.8, -1.5, -0.1], [0, -1.8, 0.4], [-0.6, -1.4, -0.3], [1.0, -1.3, 0.1]].map(([x, y, z], i) => (
        <mesh key={`tip-${i}`} position={[x, y, z]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#7a5530" roughness={0.9} />
        </mesh>
      ))}

      {/* Leaves */}
      <group ref={leafRef}>
        {[
          { p: [-1.3, 3.6, 0.2], r: [0.2, 0, 0.5], s: 1.0 },
          { p: [1.1, 4.0, -0.1], r: [-0.1, 0, -0.4], s: 0.9 },
          { p: [-0.7, 4.5, 0.1], r: [0.1, 0.2, 0.3], s: 1.1 },
          { p: [0.6, 4.7, 0.2], r: [-0.15, -0.1, -0.3], s: 0.85 },
          { p: [0, 5.2, 0], r: [0.25, 0, 0.05], s: 1.2 },
          { p: [-1.5, 4.0, -0.1], r: [0.05, 0.1, 0.6], s: 0.7 },
          { p: [1.2, 4.3, 0.3], r: [-0.2, 0.1, -0.5], s: 0.75 },
        ].map((leaf, i) => (
          <group key={i} position={leaf.p as [number, number, number]} rotation={leaf.r as [number, number, number]} scale={[leaf.s, leaf.s, leaf.s]}>
            <mesh castShadow>
              <sphereGeometry args={[0.7, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
              <meshStandardMaterial color={leafColor} emissive={leafGlow ? "#22cc40" : "#000"} emissiveIntensity={leafGlow ? 0.2 : 0} roughness={0.65} transparent opacity={0.9} />
            </mesh>
            <mesh position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.03, 1.0]} />
              <meshBasicMaterial color="#1a5a10" transparent opacity={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function RealisticGround() {
  return (
    <group>
      {/* Soil surface */}
      <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#3d2a12" roughness={0.95} />
      </mesh>
      {/* Underground cross-section */}
      <mesh position={[0, -2.2, 0]}>
        <boxGeometry args={[30, 2.5, 20]} />
        <meshStandardMaterial color="#2a1a08" roughness={0.98} />
      </mesh>
      {/* Water table */}
      <mesh position={[0, -3.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#1a4a6a" roughness={0.3} metalness={0.3} transparent opacity={0.35} />
      </mesh>
      {/* Soil moisture dots */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 6, -1 - Math.random() * 2, (Math.random() - 0.5) * 4]}>
          <sphereGeometry args={[0.03 + Math.random() * 0.03, 6, 6]} />
          <meshBasicMaterial color="#4a90c8" transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Grass */}
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh key={`g-${i}`} position={[(Math.random() - 0.5) * 10, -0.6, (Math.random() - 0.5) * 6]} castShadow>
          <coneGeometry args={[0.06, 0.3 + Math.random() * 0.2, 4]} />
          <meshStandardMaterial color={`hsl(${115 + Math.random() * 20}, 55%, ${28 + Math.random() * 12}%)`} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function SunRays({ active }: { active: boolean }) {
  const arrowsRef = useRef<THREE.Group>(null);
  const sunPos: [number, number, number] = [-5, 10, -6];
  const targets: [number, number, number][] = [[-1.3, 4.5, 0.2], [-0.5, 5, 0], [0, 5.2, 0], [0.6, 4.8, 0.1], [1.2, 4.3, 0.2]];

  const raysData = useMemo(() => targets.map((t) => {
    const dir = new THREE.Vector3(t[0] - sunPos[0], t[1] - sunPos[1], t[2] - sunPos[2]);
    const len = dir.length();
    const mid: [number, number, number] = [(sunPos[0] + t[0]) / 2, (sunPos[1] + t[1]) / 2, (sunPos[2] + t[2]) / 2];
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { mid, len, quat, dir, target: t };
  }), []);

  useFrame(({ clock }) => {
    if (!arrowsRef.current || !active) return;
    const t = clock.getElapsedTime();
    let idx = 0;
    for (let r = 0; r < raysData.length; r++) {
      const ray = raysData[r];
      for (let a = 0; a < 3; a++) {
        const child = arrowsRef.current.children[idx];
        if (child) {
          const prog = ((t * 0.3 + a * 0.33 + r * 0.1) % 1);
          child.position.set(sunPos[0] + ray.dir.x * prog, sunPos[1] + ray.dir.y * prog, sunPos[2] + ray.dir.z * prog);
          child.visible = active;
        }
        idx++;
      }
    }
  });

  if (!active) return null;

  return (
    <group>
      {raysData.map((ray, i) => (
        <group key={i}>
          <mesh position={ray.mid} quaternion={ray.quat}>
            <cylinderGeometry args={[0.02, 0.02, ray.len, 4]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.6} />
          </mesh>
          <mesh position={ray.target} quaternion={ray.quat} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.1, 0.35, 6]} />
            <meshBasicMaterial color="#FFD700" opacity={0.9} transparent />
          </mesh>
        </group>
      ))}
      <group ref={arrowsRef}>
        {Array.from({ length: 5 * 3 }).map((_, i) => (
          <mesh key={i} quaternion={raysData[Math.floor(i / 3)].quat} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.07, 0.25, 5]} />
            <meshBasicMaterial color="#FFAA00" transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 5, 0.5]} color="#FFD700" intensity={4} distance={5} decay={2} />
    </group>
  );
}

function WaterFlow({ active }: { active: boolean }) {
  const soilRef = useRef<THREE.Group>(null);
  const stemRef = useRef<THREE.Points>(null);
  const count = 180;
  const stemData = useMemo(() => new Float32Array(count * 3), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (soilRef.current) {
      soilRef.current.children.forEach((child, i) => {
        const speed = 0.5 + (i % 4) * 0.12;
        const prog = ((t * speed + i * 0.2) % 1);
        const startX = ((i % 2 === 0) ? -1 : 1) * (0.3 + (i % 5) * 0.2);
        const startY = -1.5 - (i % 3) * 0.3;
        child.position.x = startX * (1 - prog * 1.2);
        child.position.y = startY + prog * (startY * -1 - 0.5);
        child.position.z = Math.sin(i * 1.5) * 0.2 * (1 - prog);
        (child as THREE.Mesh).scale.setScalar(0.8 + (1 - prog) * 0.4);
        child.visible = active;
      });
    }
    if (stemRef.current) {
      const pos = stemRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const speed = 0.25 + (i % 8) * 0.04;
        const prog = ((t * speed + i * 0.04) % 1);
        pos[i * 3] = Math.sin(prog * 5 + t * 0.3) * 0.06;
        pos[i * 3 + 1] = -0.8 + prog * 6.2;
        pos[i * 3 + 2] = Math.cos(prog * 4 + i * 0.1) * 0.05 + 0.08;
      }
      stemRef.current.geometry.attributes.position.needsUpdate = true;
      (stemRef.current.material as THREE.PointsMaterial).opacity = active ? 0.85 : 0;
    }
  });

  if (!active) return null;

  return (
    <group>
      {/* Water being absorbed by roots */}
      <group ref={soilRef}>
        {Array.from({ length: 15 }).map((_, i) => (
          <mesh key={i}><sphereGeometry args={[0.07, 8, 8]} /><meshBasicMaterial color="#42a5f5" transparent opacity={0.9} /></mesh>
        ))}
      </group>
      {/* Water flowing up stem */}
      <points ref={stemRef}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[stemData, 3]} count={count} /></bufferGeometry>
        <pointsMaterial color="#42a5f5" size={0.09} transparent opacity={0} sizeAttenuation depthWrite={false} />
      </points>
      {/* Direction arrow on stem */}
      <mesh position={[0.08, 2, 0.08]}><cylinderGeometry args={[0.02, 0.02, 3.5, 4]} /><meshBasicMaterial color="#2196F3" transparent opacity={0.5} /></mesh>
      <mesh position={[0.08, 3.8, 0.08]}><coneGeometry args={[0.08, 0.3, 6]} /><meshBasicMaterial color="#2196F3" transparent opacity={0.8} /></mesh>
      <pointLight position={[0, -1, 0.5]} color="#2196F3" intensity={2.5} distance={3.5} decay={2} />
    </group>
  );
}

function CO2Flow({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((child, i) => {
      const speed = 0.2 + (i % 5) * 0.05;
      const prog = ((t * speed + i * 0.15) % 1);
      const startX = 4 + (i % 3) * 1.5;
      const startY = 3.5 + (i % 4) * 0.6;
      child.position.x = startX - prog * (startX - 0.5);
      child.position.y = startY + Math.sin(t + i) * 0.2;
      child.position.z = (Math.sin(i * 2) * 0.5) * (1 - prog);
      child.visible = active;
    });
  });

  if (!active) return null;

  return (
    <group>
      <group ref={ref}>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i}><sphereGeometry args={[0.12, 8, 8]} /><meshStandardMaterial color="#90a4ae" transparent opacity={0.7} roughness={0.5} /></mesh>
        ))}
      </group>
      {/* CO2 label arrows */}
      <mesh position={[2.5, 4.2, 0.5]} rotation={[0, 0, Math.PI / 2 + 0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 3, 4]} />
        <meshBasicMaterial color="#78909c" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.8, 4.3, 0.5]} rotation={[0, 0, Math.PI / 2 + 0.2]}>
        <coneGeometry args={[0.08, 0.3, 6]} />
        <meshBasicMaterial color="#78909c" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function ChemicalReaction({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 50;
  const data = useMemo(() => new Float32Array(count * 3), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2 + Math.sin(t * 3 + i) * 0.2;
      pos[i * 3 + 1] = 3.8 + Math.random() * 2 + Math.sin(t * 2 + i * 0.5) * 0.15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    (ref.current.material as THREE.PointsMaterial).opacity = active ? 0.8 : 0;
  });

  if (!active) return null;

  return (
    <group>
      <points ref={ref}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[data, 3]} count={count} /></bufferGeometry>
        <pointsMaterial color="#4ade80" size={0.1} transparent opacity={0} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <pointLight position={[0, 4.5, 0.5]} color="#4ade80" intensity={4} distance={4} decay={2} />
      <pointLight position={[0, 4, 0]} color="#fbbf24" intensity={2} distance={3} decay={2} />
    </group>
  );
}

function OxygenRelease({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((child, i) => {
      const speed = 0.2 + (i % 6) * 0.04;
      const prog = ((t * speed + i * 0.12) % 1);
      child.position.x = (Math.sin(i * 1.5) * 1) + Math.sin(t + i) * prog * 0.5;
      child.position.y = 5 + prog * 4;
      child.position.z = (Math.cos(i * 1.2) * 0.8) + Math.cos(t * 0.5 + i) * prog * 0.3;
      (child as THREE.Mesh).scale.setScalar(0.6 + prog * 0.5);
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = active ? (1 - prog) * 0.7 : 0;
      child.visible = active;
    });
  });

  if (!active) return null;

  return (
    <group ref={ref}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i}><sphereGeometry args={[0.08, 8, 8]} /><meshBasicMaterial color="#a7f3d0" transparent opacity={0} /></mesh>
      ))}
    </group>
  );
}

function GlucoseStore({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((child, i) => {
      child.rotation.y = t * 0.5 + i;
      child.rotation.x = Math.sin(t * 0.3 + i) * 0.2;
      child.position.y = 1.2 + i * 0.4 + Math.sin(t * 0.5 + i * 1.5) * 0.15;
    });
  });

  if (!active) return null;

  return (
    <group ref={ref}>
      {[[-0.3, 1.2, 0.2], [0.3, 1.5, -0.1], [0, 1.8, 0.3]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh><dodecahedronGeometry args={[0.18, 0]} /><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} roughness={0.3} metalness={0.5} /></mesh>
          {[0, 1, 2, 3, 4, 5].map((j) => {
            const a = (j / 6) * Math.PI * 2;
            return <mesh key={j} position={[Math.cos(a) * 0.25, Math.sin(a) * 0.25, 0]}><sphereGeometry args={[0.04, 6, 6]} /><meshStandardMaterial color={j % 3 === 0 ? "#ef4444" : j % 3 === 1 ? "#fff" : "#3b82f6"} /></mesh>;
          })}
        </group>
      ))}
    </group>
  );
}
