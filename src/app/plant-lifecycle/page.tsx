"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

const STAGES = [
  {
    id: "seed",
    title: "1. The Seed",
    subtitle: "Life begins dormant",
    description: "A seed is a tiny package of life. It contains an embryo (baby plant), stored food (endosperm), and a tough protective coat (testa). Seeds can remain dormant for years, waiting for the perfect conditions — water, warmth, and oxygen — to begin growing.",
    funFact: "The oldest seed ever germinated was a 2,000-year-old date palm seed found near the Dead Sea!",
    camera: [0, -0.5, 4] as [number, number, number],
    lookAt: [0, -1, 0] as [number, number, number],
  },
  {
    id: "germination",
    title: "2. Germination",
    subtitle: "The seed awakens",
    description: "When water soaks through the seed coat, enzymes activate and break down stored food into energy. The embryo swells, the coat cracks open, and the radicle (first root) pushes downward into the soil seeking water and anchorage.",
    funFact: "Some seeds need fire, freezing, or even passing through an animal's digestive system to germinate!",
    camera: [0.5, -0.5, 3.5] as [number, number, number],
    lookAt: [0, -0.8, 0] as [number, number, number],
  },
  {
    id: "seedling",
    title: "3. Seedling Emerges",
    subtitle: "First leaves see the light",
    description: "The plumule (shoot) grows upward, breaking through the soil surface. The first leaves called cotyledons unfold — they contain stored food. Soon, true leaves develop and begin photosynthesis, making the plant self-sufficient for the first time.",
    funFact: "A seedling can push through concrete as it grows — the force of cellular expansion is incredibly powerful!",
    camera: [0.8, 0.5, 3] as [number, number, number],
    lookAt: [0, 0.3, 0] as [number, number, number],
  },
  {
    id: "growth",
    title: "4. Vegetative Growth",
    subtitle: "Building the body",
    description: "The young plant rapidly grows taller and wider. The stem thickens to support weight, branches spread to catch more sunlight, and the root system expands deep and wide underground. Leaves multiply to maximize photosynthesis and fuel growth.",
    funFact: "Bamboo is the fastest growing plant — it can grow up to 91 cm (35 inches) in a single day!",
    camera: [-1, 3, 8] as [number, number, number],
    lookAt: [0, 2.5, 0] as [number, number, number],
  },
  {
    id: "mature",
    title: "5. Mature Tree",
    subtitle: "Full size achieved",
    description: "The plant reaches its full height and spread. The trunk is thick and strong with bark for protection. A massive root network anchors the tree and absorbs water. The canopy provides shade and habitat for countless organisms. The tree is now ready to reproduce.",
    funFact: "The General Sherman tree (a giant sequoia) weighs about 2 million kg — the heaviest living organism!",
    camera: [0, 4, 14] as [number, number, number],
    lookAt: [0, 4, 0] as [number, number, number],
  },
  {
    id: "flowering",
    title: "6. Flowering & Pollination",
    subtitle: "Reproduction begins",
    description: "Flowers bloom with colorful petals and sweet nectar to attract pollinators like bees, butterflies, and hummingbirds. Pollen transfers from the stamen (male part) to the pistil (female part), either by insects, wind, or animals. This is pollination.",
    funFact: "A single bee colony can pollinate 300 million flowers per day!",
    camera: [1, 6, 7] as [number, number, number],
    lookAt: [0.5, 5.5, 0] as [number, number, number],
  },
  {
    id: "fruiting",
    title: "7. Fruit & Seed Formation",
    subtitle: "The next generation forms",
    description: "After pollination, the fertilized ovule develops into a seed, and the ovary swells into a fruit. Fruits protect seeds and help disperse them — some are eaten by animals, some float on water, some have wings to fly on wind, and some burst open explosively!",
    funFact: "The sandbox tree's fruits explode with such force that seeds fly 40 meters at 240 km/h!",
    camera: [1.5, 5, 8] as [number, number, number],
    lookAt: [0.5, 5, 0] as [number, number, number],
  },
  {
    id: "aging",
    title: "8. Aging & End of Life",
    subtitle: "The cycle completes",
    description: "Trees eventually age and die. Growth slows, branches weaken, leaves fall. But death is not the end — the fallen tree becomes a 'nurse log', providing nutrients and habitat for new seedlings, fungi, insects, and animals. Seeds it dropped grow into new trees, continuing the cycle.",
    funFact: "The oldest known tree, Methuselah (a bristlecone pine), is over 4,850 years old and still alive!",
    camera: [0, 3, 12] as [number, number, number],
    lookAt: [0, 2, 0] as [number, number, number],
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

export default function PlantLifecyclePage() {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [narration, setNarration] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStage((prev) => { if (prev >= STAGES.length - 1) { setIsPlaying(false); return prev; } return prev + 1; });
    }, 12000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (!showIntro && narration) speakStage(STAGES[currentStage]);
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, [currentStage, showIntro, narration]);

  if (showIntro) {
    return (
      <div className="h-screen w-screen text-white relative overflow-hidden bg-gradient-to-b from-[#0a1a08] via-[#132e10] to-[#0a1608]">
        <div className="absolute top-3 left-3 z-30"><Link href="/" className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-xs text-slate-200 hover:text-white hover:bg-white/20 transition-all"><ArrowLeft className="w-3.5 h-3.5" /> Back</Link></div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center h-full px-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 max-w-lg w-full text-center shadow-2xl">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl mb-6">🌳</motion.div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">Plant Life Cycle</h1>
            <p className="text-slate-400 text-xs mb-4">From Seed to Ancient Tree</p>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">Journey through the complete life of a plant — from a tiny dormant seed to a towering tree, and back again. Experience every stage in immersive 3D with narration.</p>
            <div className="grid grid-cols-4 gap-2 mb-8">
              {[{ e: "🌱", l: "Seed" }, { e: "🌿", l: "Sprout" }, { e: "🪴", l: "Growth" }, { e: "🌳", l: "Mature" }, { e: "🌸", l: "Flower" }, { e: "🍎", l: "Fruit" }, { e: "🍂", l: "Aging" }, { e: "♻️", l: "Cycle" }].map((s) => (
                <div key={s.l} className="rounded-xl bg-green-500/10 border border-green-500/20 p-2"><div className="text-lg mb-0.5">{s.e}</div><div className="text-[8px] text-green-300 font-semibold">{s.l}</div></div>
              ))}
            </div>
            <button onClick={() => setShowIntro(false)} className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-lime-600 text-white font-bold text-lg shadow-lg shadow-green-500/30 transition-all active:scale-[0.98]">Begin Journey →</button>
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

      <Canvas shadows camera={{ position: [0, -0.5, 4], fov: 50 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4 }}>
        <Scene currentStage={currentStage} />
      </Canvas>

      <AnimatePresence mode="wait">
        <motion.div key={stage.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.5 }} className="absolute bottom-20 left-4 right-4 sm:left-6 sm:right-auto sm:bottom-24 sm:max-w-lg z-20">
          <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
            <span className="text-xs text-lime-400 font-semibold uppercase tracking-wide">{stage.subtitle}</span>
            <h2 className="text-xl font-bold mb-2 text-white">{stage.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">{stage.description}</p>
            <div className="flex items-start gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10"><span>💡</span><p className="text-xs text-amber-300/90">{stage.funFact}</p></div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 w-56"><div className="bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/10"><motion.div className="h-full bg-gradient-to-r from-lime-400 to-green-500 rounded-full" animate={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%` }} /></div></div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <button onClick={() => { setCurrentStage(0); setIsPlaying(false); }} className="bg-black/50 p-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white transition-all"><RotateCcw className="w-4 h-4" /></button>
        <button onClick={() => setCurrentStage((p) => Math.max(0, p - 1))} disabled={currentStage === 0} className="bg-black/50 p-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white transition-all disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="bg-green-500/20 px-5 py-2.5 rounded-xl border border-green-400/30 text-green-300 hover:text-white transition-all flex items-center gap-2 text-xs font-medium">{isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}{isPlaying ? "Pause" : "Auto Play"}</button>
        <button onClick={() => setCurrentStage((p) => Math.min(STAGES.length - 1, p + 1))} disabled={currentStage === STAGES.length - 1} className="bg-black/50 p-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white transition-all disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
      </div>

      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {STAGES.map((s, i) => (<button key={s.id} onClick={() => setCurrentStage(i)} className={`transition-all ${i === currentStage ? "w-5 h-2.5 rounded-full bg-lime-400 shadow-lg shadow-lime-400/50" : "w-2 h-2 rounded-full bg-white/25 hover:bg-white/50"}`} />))}
      </div>
    </div>
  );
}

function Scene({ currentStage }: { currentStage: number }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, -0.5, 4));
  const targetLook = useRef(new THREE.Vector3(0, -1, 0));
  const currentLook = useRef(new THREE.Vector3(0, -1, 0));

  useEffect(() => {
    const s = STAGES[currentStage];
    targetPos.current.set(...s.camera);
    targetLook.current.set(...s.lookAt);
  }, [currentStage]);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.025);
    currentLook.current.lerp(targetLook.current, 0.025);
    camera.lookAt(currentLook.current);
  });

  return (
    <>
      <SceneBackground currentStage={currentStage} />
      <fog attach="fog" args={["#1a2e12", 18, 55]} />
      <ambientLight intensity={0.25} color="#e0f0d0" />
      <directionalLight position={[5, 12, 8]} intensity={2.5} color="#fff8e0" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-far={40} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-8} />
      <hemisphereLight color="#90c8a0" groundColor="#3a2510" intensity={0.2} />

      <Sun currentStage={currentStage} />
      <Ground currentStage={currentStage} />
      <SeedStage active={currentStage === 0} />
      <GerminationStage active={currentStage === 1} />
      <SeedlingStage active={currentStage === 2} />
      <VegetativeGrowth active={currentStage === 3} />
      <MatureTree active={currentStage >= 4} flowering={currentStage === 5} fruiting={currentStage === 6} aging={currentStage === 7} />
      <FlowerEffects active={currentStage === 5} />
      <FruitEffects active={currentStage === 6} />
      <AgingEffects active={currentStage === 7} />
      <RainEffect active={currentStage <= 2} />

      <OrbitControls enableZoom={true} enablePan={false} enableRotate={true} maxPolarAngle={Math.PI * 0.85} minPolarAngle={Math.PI * 0.1} maxDistance={25} minDistance={2} />
    </>
  );
}

function SceneBackground({ currentStage }: { currentStage: number }) {
  const { scene } = useThree();
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048; c.height = 2048;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 2048);
    if (currentStage <= 1) { g.addColorStop(0, "#0a1520"); g.addColorStop(0.4, "#1a2a18"); g.addColorStop(1, "#0a1208"); }
    else if (currentStage <= 3) { g.addColorStop(0, "#1a3a55"); g.addColorStop(0.3, "#3a8a55"); g.addColorStop(1, "#102010"); }
    else if (currentStage === 7) { g.addColorStop(0, "#2a1a08"); g.addColorStop(0.4, "#3a2a10"); g.addColorStop(1, "#1a0e05"); }
    else { g.addColorStop(0, "#1a4a6a"); g.addColorStop(0.35, "#2a7a4a"); g.addColorStop(1, "#0a2008"); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, 2048, 2048);
    scene.background = new THREE.CanvasTexture(c);
  }, [scene, currentStage]);
  return null;
}

function Sun({ currentStage }: { currentStage: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const intensity = currentStage >= 3 ? 1 : 0.6;
  useFrame(({ clock }) => { if (ref.current) ref.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.05); });
  return (
    <group position={[6, 10, -8]}>
      <mesh><sphereGeometry args={[1, 48, 48]} /><meshBasicMaterial color="#FFFDE0" /></mesh>
      <mesh ref={ref}><sphereGeometry args={[1.4, 32, 32]} /><meshBasicMaterial color="#FFD700" transparent opacity={0.4 * intensity} /></mesh>
      <mesh><sphereGeometry args={[2, 24, 24]} /><meshBasicMaterial color="#FFA500" transparent opacity={0.12 * intensity} /></mesh>
      <pointLight color="#FDB813" intensity={3 * intensity} distance={40} decay={1.2} />
    </group>
  );
}

function Ground({ currentStage }: { currentStage: number }) {
  const gardenTexture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 1024;
    const ctx = c.getContext("2d")!;

    // Base soil/garden color
    const baseColor = currentStage === 7 ? "#3a2510" : "#4a6a28";
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1024, 1024);

    // Add soil patches
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const r = 3 + Math.random() * 12;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = currentStage === 7
        ? `rgba(${40 + Math.random() * 30}, ${20 + Math.random() * 15}, ${5 + Math.random() * 10}, 0.6)`
        : `rgba(${50 + Math.random() * 40}, ${80 + Math.random() * 50}, ${20 + Math.random() * 20}, 0.5)`;
      ctx.fill();
    }

    // Grass-like strokes
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 4, y - 6 - Math.random() * 10);
      ctx.strokeStyle = currentStage === 7
        ? `rgba(${60 + Math.random() * 40}, ${40 + Math.random() * 20}, ${10}, 0.5)`
        : `rgba(${40 + Math.random() * 30}, ${100 + Math.random() * 55}, ${20 + Math.random() * 20}, 0.7)`;
      ctx.lineWidth = 1 + Math.random();
      ctx.stroke();
    }

    // Dirt specks
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      ctx.beginPath();
      ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${80 + Math.random() * 40}, ${50 + Math.random() * 30}, ${20}, 0.4)`;
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 4);
    return tex;
  }, [currentStage]);

  const soilParticles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    pos: [(Math.random() - 0.5) * 8, -1.6 - Math.random() * 3, (Math.random() - 0.5) * 6] as [number, number, number],
    size: 0.02 + Math.random() * 0.04,
    color: i % 3 === 0 ? "#5a9ac8" : "#6a4a28",
  })), []);
  const grassData = useMemo(() => Array.from({ length: 80 }, () => ({
    pos: [(Math.random() - 0.5) * 20, -1.38, (Math.random() - 0.5) * 10] as [number, number, number],
    height: 0.2 + Math.random() * 0.3,
    lean: (Math.random() - 0.5) * 0.3,
    color: `hsl(${100 + Math.random() * 30}, ${45 + Math.random() * 20}%, ${22 + Math.random() * 18}%)`,
  })), []);

  return (
    <group>
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial map={gardenTexture} roughness={0.92} />
      </mesh>
      <mesh position={[0, -4, 0]}>
        <boxGeometry args={[40, 4.5, 30]} />
        <meshStandardMaterial color="#1a0f05" roughness={0.98} />
      </mesh>
      {soilParticles.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[p.size, 5, 5]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.6} />
        </mesh>
      ))}
      {grassData.map((g, i) => (
        <mesh key={`gr-${i}`} position={g.pos} rotation={[0, 0, g.lean]} castShadow>
          <coneGeometry args={[0.03, g.height, 4]} />
          <meshStandardMaterial color={g.color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function SeedStage({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const soilChunks = useMemo(() => Array.from({ length: 8 }, () => ({
    pos: [(Math.random() - 0.5) * 0.8, -0.2 - Math.random() * 0.3, (Math.random() - 0.5) * 0.6] as [number, number, number],
    size: 0.05 + Math.random() * 0.05,
  })), []);
  const moisture = useMemo(() => Array.from({ length: 5 }, () => ({
    pos: [(Math.random() - 0.5) * 0.5, -0.1 - Math.random() * 0.3, (Math.random() - 0.5) * 0.4] as [number, number, number],
  })), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.visible = active;
    if (active) {
      const t = clock.getElapsedTime();
      ref.current.rotation.y = Math.sin(t * 0.3) * 0.05;
    }
  });

  return (
    <group ref={ref} position={[0, -1.3, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.8]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.05, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 12]} />
        <meshStandardMaterial color="#6B3E1C" roughness={0.9} />
      </mesh>
      {[0, 0.7, 1.4, 2.1, 2.8, 3.5].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.29, -0.02, Math.sin(a) * 0.29]} rotation={[0, a, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.4, 4]} />
          <meshBasicMaterial color="#4a2a10" transparent opacity={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0.15]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#a8d84a" emissive="#88b830" emissiveIntensity={0.2} roughness={0.5} />
      </mesh>
      {soilChunks.map((s, i) => (
        <mesh key={`s-${i}`} position={s.pos}>
          <dodecahedronGeometry args={[s.size, 0]} />
          <meshStandardMaterial color="#5a3a18" roughness={0.95} />
        </mesh>
      ))}
      {moisture.map((m, i) => (
        <mesh key={`w-${i}`} position={m.pos}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color="#5aa8e8" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function GerminationStage({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const radicleRef = useRef<THREE.Mesh>(null);
  const waterDrops = useMemo(() => Array.from({ length: 6 }, () => ({
    pos: [(Math.random() - 0.5) * 0.6, -0.3 - Math.random() * 0.5, (Math.random() - 0.5) * 0.4] as [number, number, number],
  })), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.visible = active;
    if (active && radicleRef.current) {
      const t = clock.getElapsedTime();
      const grow = Math.min(1, (Math.sin(t * 0.5) + 1) * 0.5 * 0.3 + 0.7);
      radicleRef.current.scale.y = grow;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.3, 0]}>
      <mesh position={[-0.08, 0, 0]} rotation={[0, 0, 0.15]} castShadow>
        <sphereGeometry args={[0.25, 12, 12, 0, Math.PI]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.85} />
      </mesh>
      <mesh position={[0.08, 0, 0]} rotation={[0, Math.PI, -0.15]} castShadow>
        <sphereGeometry args={[0.24, 12, 12, 0, Math.PI]} />
        <meshStandardMaterial color="#7B4E2C" roughness={0.85} />
      </mesh>
      <mesh ref={radicleRef} position={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.04, 0.6, 8]} />
        <meshStandardMaterial color="#F5F5DC" roughness={0.6} emissive="#e8e0a0" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0, -0.72, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#F0E68C" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.025, 0.3, 6]} />
        <meshStandardMaterial color="#90c060" roughness={0.6} emissive="#70a040" emissiveIntensity={0.15} />
      </mesh>
      {waterDrops.map((d, i) => (
        <mesh key={i} position={d.pos}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshBasicMaterial color="#4aa8e8" transparent opacity={0.8} />
        </mesh>
      ))}
      <pointLight position={[0, -0.3, 0.3]} color="#90ff60" intensity={1.5} distance={2} decay={2} />
    </group>
  );
}

function SeedlingStage({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const leavesRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.visible = active;
    if (active && leavesRef.current) {
      const t = clock.getElapsedTime();
      leavesRef.current.children.forEach((child, i) => {
        child.rotation.z = Math.sin(t * 0.8 + i * 2) * 0.08;
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      {/* Stem emerging from soil */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 1.4, 8]} />
        <meshStandardMaterial color="#5aaa30" roughness={0.6} />
      </mesh>
      {/* Cotyledon leaves */}
      <group ref={leavesRef} position={[0, 1.3, 0]}>
        <mesh position={[-0.2, 0, 0]} rotation={[0.3, 0, -0.4]} castShadow>
          <sphereGeometry args={[0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial color="#70c840" roughness={0.6} />
        </mesh>
        <mesh position={[0.2, 0, 0]} rotation={[0.3, 0, 0.4]} castShadow>
          <sphereGeometry args={[0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial color="#68c038" roughness={0.6} />
        </mesh>
        {/* True leaf emerging */}
        <mesh position={[0, 0.15, 0.05]} rotation={[0.6, 0, 0]} castShadow>
          <sphereGeometry args={[0.1, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
          <meshStandardMaterial color="#3aaa20" roughness={0.5} />
        </mesh>
      </group>
      {/* Root system (visible underground) */}
      {[
        { p: [0, -0.2, 0], r: [0.1, 0, 0.3], l: 0.8 },
        { p: [-0.1, -0.3, 0], r: [0, 0, 0.5], l: 0.6 },
        { p: [0.1, -0.25, 0.05], r: [0.2, 0, -0.4], l: 0.7 },
      ].map((root, i) => (
        <mesh key={i} position={root.p as [number, number, number]} rotation={root.r as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.01, 0.025, root.l, 6]} />
          <meshStandardMaterial color="#F5E6C8" roughness={0.7} />
        </mesh>
      ))}
      <pointLight position={[0, 1.5, 0.5]} color="#88ff44" intensity={2} distance={3} decay={2} />
    </group>
  );
}

function VegetativeGrowth({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const leavesRef = useRef<THREE.Group>(null);

  const leafData = useMemo(() => [
    [-1.2, 3.5, 0.2], [1.1, 4.0, -0.1], [-0.6, 4.5, 0.1], [0.7, 4.6, 0.2], [0, 5.0, 0], [-0.8, 4.2, -0.2], [0.5, 3.8, 0.3],
  ].map(([x, y, z]) => ({
    pos: [x, y, z] as [number, number, number],
    rot: [Math.random() * 0.3, Math.random(), Math.random() * 0.3 - 0.15] as [number, number, number],
    size: 0.35 + Math.random() * 0.15,
    color: `hsl(${110 + Math.random() * 20}, 65%, ${35 + Math.random() * 10}%)`,
  })), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.visible = active;
    if (active && leavesRef.current) {
      const t = clock.getElapsedTime();
      leavesRef.current.children.forEach((child, i) => {
        child.rotation.z = Math.sin(t * 0.5 + i * 1.2) * 0.04;
        child.rotation.x = Math.cos(t * 0.3 + i) * 0.02;
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.2, 5, 10]} />
        <meshStandardMaterial color="#4a7a20" roughness={0.75} />
      </mesh>
      {[
        { p: [-0.5, 3, 0.1], r: [0, 0, 0.6], l: 1.5 },
        { p: [0.6, 3.5, -0.1], r: [0, 0, -0.5], l: 1.3 },
        { p: [-0.3, 4, 0.2], r: [0.2, 0, 0.4], l: 1.0 },
        { p: [0.4, 4.3, 0], r: [-0.1, 0, -0.3], l: 0.8 },
      ].map((b, i) => (
        <mesh key={i} position={b.p as [number, number, number]} rotation={b.r as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.03, 0.06, b.l, 6]} />
          <meshStandardMaterial color="#3a6a18" roughness={0.8} />
        </mesh>
      ))}
      <group ref={leavesRef}>
        {leafData.map((leaf, i) => (
          <mesh key={i} position={leaf.pos} rotation={leaf.rot} castShadow>
            <sphereGeometry args={[leaf.size, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
            <meshStandardMaterial color={leaf.color} roughness={0.6} />
          </mesh>
        ))}
      </group>
      {/* Expanding root system */}
      {[
        { p: [-0.4, -0.4, 0.15], r: [0.2, 0, 0.6], l: 1.5 },
        { p: [0.5, -0.5, -0.1], r: [-0.1, 0, -0.5], l: 1.8 },
        { p: [0, -0.5, 0.3], r: [0.4, 0.2, 0.1], l: 1.4 },
        { p: [-0.6, -0.3, -0.2], r: [-0.2, 0, 0.7], l: 1.6 },
        { p: [0.3, -0.6, 0.1], r: [0.1, -0.1, -0.3], l: 1.3 },
      ].map((root, i) => (
        <mesh key={`r-${i}`} position={root.p as [number, number, number]} rotation={root.r as [number, number, number]}>
          <cylinderGeometry args={[0.02, 0.05, root.l, 6]} />
          <meshStandardMaterial color="#6B4E2C" roughness={0.9} />
        </mesh>
      ))}
      <pointLight position={[0, 4, 1]} color="#66cc33" intensity={2} distance={5} decay={2} />
    </group>
  );
}

function MatureTree({ active, flowering, fruiting, aging }: { active: boolean; flowering: boolean; fruiting: boolean; aging: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const canopyRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.visible = active;
    if (canopyRef.current && active) {
      const t = clock.getElapsedTime();
      canopyRef.current.children.forEach((child, i) => {
        child.rotation.z = Math.sin(t * 0.25 + i * 0.8) * 0.02;
        child.rotation.x = Math.cos(t * 0.2 + i * 0.5) * 0.015;
      });
    }
  });

  const leafColor = aging ? "#a87030" : "#2a8a20";
  const trunkColor = aging ? "#3a2a12" : "#4a3018";
  const barkRoughness = aging ? 1 : 0.9;

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      {/* Thick trunk */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.6, 6.5, 14]} />
        <meshStandardMaterial color={trunkColor} roughness={barkRoughness} />
      </mesh>
      {/* Bark texture details */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const y = 1 + (i % 4) * 1.5;
        return (
          <mesh key={`bark-${i}`} position={[Math.cos(angle) * 0.45, y, Math.sin(angle) * 0.45]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.08, 0.5 + Math.random() * 0.3, 0.03]} />
            <meshStandardMaterial color="#2a1808" roughness={1} />
          </mesh>
        );
      })}

      {/* Major branches */}
      {[
        { p: [-1.2, 4.5, 0.3], r: [0.1, 0, 0.7], l: 3 },
        { p: [1.3, 5, -0.2], r: [-0.1, 0, -0.6], l: 2.8 },
        { p: [-0.8, 5.5, 0.5], r: [0.3, 0.2, 0.5], l: 2.5 },
        { p: [0.9, 6, 0.2], r: [-0.2, -0.1, -0.45], l: 2.2 },
        { p: [0, 6.5, -0.3], r: [-0.2, 0, 0.1], l: 2 },
        { p: [-1.5, 5.2, -0.4], r: [-0.15, 0.3, 0.55], l: 2.3 },
      ].map((b, i) => (
        <mesh key={i} position={b.p as [number, number, number]} rotation={b.r as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.05, 0.12, b.l, 8]} />
          <meshStandardMaterial color={trunkColor} roughness={0.88} />
        </mesh>
      ))}

      {/* Canopy */}
      <group ref={canopyRef}>
        {[
          { p: [-1.8, 5.5, 0.5], s: 1.1 }, { p: [1.6, 6, -0.3], s: 1.0 }, { p: [-0.5, 6.5, 0.3], s: 1.3 },
          { p: [0.8, 6.8, 0.1], s: 1.1 }, { p: [0, 7.2, 0], s: 1.4 }, { p: [-1.2, 6.2, -0.3], s: 0.9 },
          { p: [1.2, 5.8, 0.4], s: 0.95 }, { p: [-0.3, 7, -0.2], s: 1.05 }, { p: [0.5, 7.3, 0.2], s: 1.0 },
        ].map(({ p, s }, i) => (
          <mesh key={i} position={p as [number, number, number]} castShadow>
            <sphereGeometry args={[0.8 * s, 12, 10]} />
            <meshStandardMaterial
              color={leafColor}
              roughness={0.65}
              emissive={flowering ? "#228B22" : aging ? "#804000" : "#000"}
              emissiveIntensity={flowering ? 0.15 : aging ? 0.1 : 0}
              transparent={aging}
              opacity={aging ? 0.7 : 1}
            />
          </mesh>
        ))}
      </group>

      {/* Root system - massive */}
      {[
        { p: [-0.8, -0.5, 0.3], r: [0.15, 0, 0.6], l: 2.5 },
        { p: [0.7, -0.6, -0.2], r: [-0.1, 0.1, -0.55], l: 2.8 },
        { p: [0, -0.7, 0.5], r: [0.4, 0.2, 0.1], l: 2.2 },
        { p: [-1, -0.4, -0.3], r: [-0.15, -0.1, 0.75], l: 2.6 },
        { p: [0.5, -0.5, 0.4], r: [0.3, 0.15, -0.4], l: 2.0 },
        { p: [-0.4, -0.8, -0.4], r: [-0.3, 0.2, 0.3], l: 1.8 },
      ].map((root, i) => (
        <mesh key={`root-${i}`} position={root.p as [number, number, number]} rotation={root.r as [number, number, number]}>
          <cylinderGeometry args={[0.04, 0.12, root.l, 6]} />
          <meshStandardMaterial color="#5a3a18" roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}

function FlowerEffects({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const beesRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.visible = active;
    if (beesRef.current && active) {
      const t = clock.getElapsedTime();
      beesRef.current.children.forEach((bee, i) => {
        const radius = 1.5 + (i % 3) * 0.5;
        const speed = 0.6 + i * 0.15;
        bee.position.x = Math.cos(t * speed + i * 2) * radius;
        bee.position.y = 5.5 + Math.sin(t * speed * 1.5 + i) * 0.8 + i * 0.3;
        bee.position.z = Math.sin(t * speed + i * 2) * radius * 0.5;
      });
    }
  });

  if (!active) return null;

  return (
    <group ref={ref} position={[0, -1.5, 0]}>
      {/* Flowers on tree */}
      {[
        [-1.5, 5.8, 0.6], [1.2, 6.2, -0.2], [-0.3, 7.0, 0.4], [0.8, 6.6, 0.3], [-0.8, 6.5, -0.2], [1.5, 5.5, 0.1], [-1, 7, 0.2],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          {/* Petals */}
          {[0, 1, 2, 3, 4].map((p) => {
            const a = (p / 5) * Math.PI * 2;
            return (
              <mesh key={p} position={[Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12]} rotation={[0.5, a, 0]}>
                <sphereGeometry args={[0.08, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
                <meshStandardMaterial color={i % 2 === 0 ? "#FF69B4" : "#FFB6C1"} emissive="#FF1493" emissiveIntensity={0.2} roughness={0.4} />
              </mesh>
            );
          })}
          {/* Center */}
          <mesh><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial color="#FFD700" emissive="#FFA500" emissiveIntensity={0.4} /></mesh>
        </group>
      ))}
      {/* Bees */}
      <group ref={beesRef}>
        {Array.from({ length: 5 }).map((_, i) => (
          <group key={i}>
            <mesh><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial color="#FFD700" roughness={0.6} /></mesh>
            <mesh position={[0, 0, -0.05]}><sphereGeometry args={[0.04, 6, 6]} /><meshStandardMaterial color="#1a1a00" roughness={0.8} /></mesh>
          </group>
        ))}
      </group>
      {/* Pollen particles */}
      <PollenParticles />
      <pointLight position={[0, 7, 1]} color="#ff88aa" intensity={3} distance={5} decay={2} />
    </group>
  );
}

function PollenParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 80;
  const data = useMemo(() => new Float32Array(count * 3), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const speed = 0.15 + (i % 6) * 0.03;
      const angle = t * speed + i * 0.8;
      const radius = 1 + (i % 4) * 0.5;
      pos[i * 3] = Math.cos(angle) * radius + Math.sin(t * 0.3 + i) * 0.3;
      pos[i * 3 + 1] = 5 + Math.sin(t * 0.5 + i * 0.4) * 1.5 + (i % 5) * 0.4;
      pos[i * 3 + 2] = Math.sin(angle) * radius * 0.4;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[data, 3]} count={count} /></bufferGeometry>
      <pointsMaterial color="#FFD700" size={0.05} transparent opacity={0.8} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function FruitEffects({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.visible = active;
    if (active) {
      const t = clock.getElapsedTime();
      ref.current.children.forEach((child, i) => {
        child.rotation.y = Math.sin(t * 0.3 + i) * 0.1;
      });
    }
  });

  if (!active) return null;

  return (
    <group ref={ref} position={[0, -1.5, 0]}>
      {/* Fruits hanging from branches */}
      {[
        { p: [-1.3, 5.2, 0.4], c: "#e63946", s: 0.18 },
        { p: [1.0, 5.8, -0.1], c: "#f4a261", s: 0.15 },
        { p: [-0.5, 6.0, 0.5], c: "#e63946", s: 0.2 },
        { p: [0.8, 6.5, 0.2], c: "#f4a261", s: 0.16 },
        { p: [-1.0, 6.3, -0.2], c: "#e76f51", s: 0.17 },
        { p: [0.3, 5.5, 0.3], c: "#e63946", s: 0.19 },
        { p: [1.5, 5.3, 0.1], c: "#f4a261", s: 0.14 },
      ].map(({ p, c, s }, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh castShadow>
            <sphereGeometry args={[s, 12, 12]} />
            <meshStandardMaterial color={c} roughness={0.4} metalness={0.1} />
          </mesh>
          {/* Stem */}
          <mesh position={[0, s + 0.05, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.15, 4]} />
            <meshStandardMaterial color="#4a3018" roughness={0.9} />
          </mesh>
          {/* Leaf at stem */}
          <mesh position={[0.04, s + 0.1, 0]} rotation={[0.5, 0, 0.3]}>
            <sphereGeometry args={[0.04, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.3]} />
            <meshStandardMaterial color="#4a8a20" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Seeds visible in one cut fruit */}
      <group position={[0, 4.5, 1.2]}>
        <mesh><sphereGeometry args={[0.22, 12, 12, 0, Math.PI]} /><meshStandardMaterial color="#e63946" roughness={0.4} /></mesh>
        <mesh rotation={[0, Math.PI, 0]}><sphereGeometry args={[0.2, 12, 12, 0, Math.PI]} /><meshStandardMaterial color="#FFFDD0" roughness={0.5} /></mesh>
        {[0, 1, 2, 3, 4].map((j) => (
          <mesh key={j} position={[(j - 2) * 0.06, -0.02, 0.02]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color="#3a2008" roughness={0.9} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 5, 1]} color="#ff6644" intensity={2} distance={4} decay={2} />
    </group>
  );
}

function AgingEffects({ active }: { active: boolean }) {
  const fallingRef = useRef<THREE.Group>(null);
  const fungiRef = useRef<THREE.Group>(null);

  const fungiRotations = useMemo(() => [
    [0.4, 1.5, 0.2], [-0.35, 2.2, 0.15], [0.3, 0.8, -0.2], [-0.4, 3, 0.1],
  ].map(([x]) => Math.random() * 3 + Math.PI / 2 * (x > 0 ? -1 : 1) * 0.7), []);

  const decompData = useMemo(() => Array.from({ length: 10 }, () => ({
    pos: [(Math.random() - 0.5) * 3, -0.1, (Math.random() - 0.5) * 2] as [number, number, number],
    w: 0.12 + Math.random() * 0.08,
    h: 0.1 + Math.random() * 0.06,
  })), []);

  useFrame(({ clock }) => {
    if (!fallingRef.current) return;
    fallingRef.current.visible = active;
    if (active) {
      const t = clock.getElapsedTime();
      fallingRef.current.children.forEach((leaf, i) => {
        const speed = 0.2 + (i % 5) * 0.05;
        const startY = 5 + (i % 4) * 1.5;
        const prog = ((t * speed + i * 0.3) % 1);
        leaf.position.x = (i - 8) * 0.3 + Math.sin(t * 0.5 + i) * 0.8;
        leaf.position.y = startY - prog * 7;
        leaf.position.z = Math.cos(t * 0.3 + i * 0.7) * 0.5;
        leaf.rotation.x = t * 0.5 + i;
        leaf.rotation.z = Math.sin(t + i) * 0.5;
      });
    }
    if (fungiRef.current) fungiRef.current.visible = active;
  });

  if (!active) return null;

  return (
    <group position={[0, -1.5, 0]}>
      <group ref={fallingRef}>
        {Array.from({ length: 16 }).map((_, i) => (
          <mesh key={i}>
            <planeGeometry args={[0.15, 0.12]} />
            <meshStandardMaterial color={["#c0652a", "#a84820", "#daa520", "#8B4513", "#CD853F"][i % 5]} roughness={0.7} side={THREE.DoubleSide} transparent opacity={0.9} />
          </mesh>
        ))}
      </group>
      <group ref={fungiRef}>
        {[
          [0.4, 1.5, 0.2], [-0.35, 2.2, 0.15], [0.3, 0.8, -0.2], [-0.4, 3, 0.1],
        ].map(([x, y, z], i) => (
          <group key={i} position={[x, y, z]} rotation={[0, fungiRotations[i], 0]}>
            <mesh>
              <cylinderGeometry args={[0.12, 0.05, 0.04, 12]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#c8a070" : "#a08050"} roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
      <group position={[1.5, 0, 0.5]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.015, 0.02, 0.5, 6]} />
          <meshStandardMaterial color="#66cc33" emissive="#44aa22" emissiveIntensity={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[-0.08, 0.45, 0]} rotation={[0.2, 0, -0.4]}>
          <sphereGeometry args={[0.07, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
          <meshStandardMaterial color="#44cc22" emissive="#33aa11" emissiveIntensity={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[0.08, 0.45, 0]} rotation={[0.2, 0, 0.4]}>
          <sphereGeometry args={[0.07, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
          <meshStandardMaterial color="#44cc22" emissive="#33aa11" emissiveIntensity={0.3} roughness={0.5} />
        </mesh>
        <pointLight position={[0, 0.5, 0.3]} color="#66ff33" intensity={2} distance={2} decay={2} />
      </group>
      {decompData.map((d, i) => (
        <mesh key={`d-${i}`} position={d.pos}>
          <planeGeometry args={[d.w, d.h]} />
          <meshStandardMaterial color={["#5a3a1a", "#6a4a28", "#4a2a10"][i % 3]} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function RainEffect({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 200;
  const data = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = Math.random() * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.visible = active;
    if (!active) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= 0.08;
      if (pos[i * 3 + 1] < -2) {
        pos[i * 3] = (Math.random() - 0.5) * 8;
        pos[i * 3 + 1] = 5 + Math.random() * 2;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[data, 3]} count={count} /></bufferGeometry>
      <pointsMaterial color="#7ab8e8" size={0.04} transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
}
