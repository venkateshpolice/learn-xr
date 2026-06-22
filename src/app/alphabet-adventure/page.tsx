"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text3D, Center, RoundedBox, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { ArrowLeft, Trophy, Star, Sparkles, RotateCcw } from "lucide-react";
import Link from "next/link";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const LETTER_COLORS = [
  "#FF6B6B", "#FF8E53", "#FFC53D", "#51CF66", "#339AF0",
  "#845EF7", "#F06595", "#20C997", "#FD7E14", "#66D9E8",
  "#AE3EC9", "#FF922B", "#94D82D", "#4DABF7", "#E64980",
  "#38D9A9", "#FAB005", "#7950F2", "#E03131", "#1098AD",
  "#2F9E44", "#F76707", "#6741D9", "#C2255C", "#087F5B",
  "#3B5BDB",
];

const LETTER_WORDS: Record<string, string> = {
  A: "Apple", B: "Ball", C: "Cat", D: "Dog", E: "Elephant",
  F: "Fish", G: "Grapes", H: "Hat", I: "Ice cream", J: "Jug",
  K: "Kite", L: "Lion", M: "Mango", N: "Nest", O: "Orange",
  P: "Parrot", Q: "Queen", R: "Rabbit", S: "Sun", T: "Tiger",
  U: "Umbrella", V: "Van", W: "Watch", X: "Xylophone", Y: "Yak",
  Z: "Zebra",
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type GameStep = "username" | "playing" | "winner";

interface LetterState {
  letter: string;
  position: [number, number];
  placed: boolean;
}

function generateScatterPositions(): [number, number][] {
  const positions: [number, number][] = [];
  const cols = 9;
  const spacing = 1.35;
  for (let i = 0; i < 26; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const totalCols = Math.min(cols, 26 - row * cols);
    const offsetX = -((totalCols - 1) * spacing) / 2;
    const x = offsetX + col * spacing + (Math.random() - 0.5) * 0.25;
    const y = -row * 1.3 - 1.0 + (Math.random() - 0.5) * 0.2;
    positions.push([x, y]);
  }
  return positions;
}

function getDropSlotPosition(index: number): [number, number] {
  const spacing = 1.25;
  const perRow = 13;
  const row = Math.floor(index / perRow);
  const col = index % perRow;
  const totalCols = Math.min(perRow, 26 - row * perRow);
  const startX = -((totalCols - 1) * spacing) / 2;
  return [startX + col * spacing, 3.5 - row * 1.6];
}

function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(587, ctx.currentTime);
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

function playErrorSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(250, ctx.currentTime);
    osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(150, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}

function speakLetter(letter: string) {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const word = LETTER_WORDS[letter] || "";
      const utterance = new SpeechSynthesisUtterance(`${letter} for ${word}`);
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  } catch {}
}

function speakWrong() {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Wrong choice! Try again.");
      utterance.rate = 1.0;
      utterance.pitch = 0.9;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  } catch {}
}

function playCompletionSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523, 659, 784, 1047, 1319, 1568];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.5);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.5);
    });
  } catch {}
}

function speakCompletion() {
  try {
    if ("speechSynthesis" in window) {
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance("Congratulations! You completed the alphabet! Well done!");
        utterance.rate = 0.9;
        utterance.pitch = 1.3;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
      }, 800);
    }
  } catch {}
}

export default function AlphabetAdventurePage() {
  const [step, setStep] = useState<GameStep>("username");
  const [username, setUsername] = useState("");
  const [letters, setLetters] = useState<LetterState[]>([]);
  const [score, setScore] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [completionTime, setCompletionTime] = useState(0);
  const [placedCount, setPlacedCount] = useState(0);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragWorldPos, setDragWorldPos] = useState<[number, number]>([0, 0]);
  const [particleBurst, setParticleBurst] = useState<{ x: number; y: number; color: string; id: number } | null>(null);
  const [wrongCount, setWrongCount] = useState(0);

  const startGame = useCallback(() => {
    if (!username.trim()) return;
    const shuffled = shuffleArray(ALPHABET);
    const positions = generateScatterPositions();
    setLetters(shuffled.map((letter, i) => ({ letter, position: positions[i], placed: false })));
    setScore(0);
    setBonus(0);
    setPlacedCount(0);
    setWrongCount(0);
    setDragging(null);
    setStep("playing");
    setStartTime(Date.now());
  }, [username]);

  const placeLetter = useCallback((letter: string) => {
    const expectedIndex = placedCount;
    const [sx, sy] = getDropSlotPosition(expectedIndex);
    setLetters((prev) => prev.map((l) => l.letter === letter ? { ...l, placed: true, position: [sx, sy] } : l));
    setScore((s) => s + 10);
    setParticleBurst({ x: sx, y: sy, color: LETTER_COLORS[expectedIndex], id: Date.now() });
    const newCount = placedCount + 1;
    setPlacedCount(newCount);
    setDragging(null);

    playSuccessSound();
    speakLetter(letter);

    if (newCount === 26) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setCompletionTime(elapsed);
      setBonus(Math.max(0, 500 - elapsed * 2) + 100);
      playCompletionSound();
      speakCompletion();
      setTimeout(() => setStep("winner"), 1500);
    }
  }, [placedCount, startTime]);

  const handleDragMove = useCallback((x: number, y: number) => {
    setDragWorldPos([x, y]);
  }, []);

  const handleDragEnd = useCallback((x: number, y: number) => {
    if (dragging) {
      const isCorrect = dragging === ALPHABET[placedCount];
      const inDropZone = y > 0.8;
      const [slotX, slotY] = getDropSlotPosition(placedCount);
      const dist = Math.sqrt((x - slotX) ** 2 + (y - slotY) ** 2);

      if (isCorrect && (dist < 1.5 || inDropZone)) {
        placeLetter(dragging);
        return;
      }

      if (!isCorrect && inDropZone) {
        playErrorSound();
        speakWrong();
        setWrongCount((c) => c + 1);
      }
    }
    setDragging(null);
    document.body.style.cursor = "auto";
  }, [dragging, placedCount, placeLetter]);

  const resetGame = () => {
    const shuffled = shuffleArray(ALPHABET);
    const positions = generateScatterPositions();
    setLetters(shuffled.map((letter, i) => ({ letter, position: positions[i], placed: false })));
    setScore(0);
    setBonus(0);
    setPlacedCount(0);
    setWrongCount(0);
    setDragging(null);
    setStep("playing");
    setStartTime(Date.now());
  };

  return (
    <div className="h-screen w-screen text-white relative overflow-hidden bg-gradient-to-b from-[#1a0533] via-[#1e1b4b] to-[#0f172a]">
      <div className="absolute top-3 left-3 z-30">
        <Link href="/" className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-xs text-slate-200 hover:text-white hover:bg-white/20 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {step === "username" && <UsernameScreen key="username" username={username} setUsername={setUsername} onStart={startGame} />}
        {step === "playing" && (
          <GameScreen
            key="playing"
            letters={letters}
            placedCount={placedCount}
            score={score}
            username={username}
            dragging={dragging}
            dragWorldPos={dragWorldPos}
            setDragging={setDragging}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onReset={resetGame}
            particleBurst={particleBurst}
          />
        )}
        {step === "winner" && <WinnerScreen key="winner" username={username} score={score} bonus={bonus} completionTime={completionTime} wrongCount={wrongCount} onPlayAgain={resetGame} />}
      </AnimatePresence>
    </div>
  );
}

function UsernameScreen({ username, setUsername, onStart }: { username: string; setUsername: (s: string) => void; onStart: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center justify-center h-full px-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 max-w-md w-full text-center shadow-2xl">
        <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-6">🔤</motion.div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">Alphabet Adventure</h1>
        <p className="text-slate-300 mb-8 text-sm">Drag the 3D letter blocks up to the shelf. When the correct letter reaches the drop zone, it auto-fills!</p>
        <div className="space-y-4">
          <input type="text" placeholder="Enter your name..." value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onStart()} className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-center text-lg focus:outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/30 transition-all" maxLength={20} />
          <button onClick={onStart} disabled={!username.trim()} className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:from-indigo-400 hover:to-purple-500 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed">Start Adventure →</button>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-3 text-left">
          <div className="rounded-lg bg-white/5 border border-white/10 p-3"><div className="text-[10px] text-slate-400 uppercase">Per Letter</div><div className="text-sm font-bold text-emerald-400">+10 pts</div></div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-3"><div className="text-[10px] text-slate-400 uppercase">Complete</div><div className="text-sm font-bold text-amber-400">+100 pts</div></div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-3"><div className="text-[10px] text-slate-400 uppercase">Speed</div><div className="text-sm font-bold text-purple-400">Up to 500</div></div>
        </div>
      </div>
    </motion.div>
  );
}

function GameScreen({
  letters, placedCount, score, username, dragging, dragWorldPos, setDragging, onDragMove, onDragEnd, onReset, particleBurst,
}: {
  letters: LetterState[]; placedCount: number; score: number; username: string;
  dragging: string | null; dragWorldPos: [number, number];
  setDragging: (l: string | null) => void; onDragMove: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void; onReset: () => void;
  particleBurst: { x: number; y: number; color: string; id: number } | null;
}) {
  const nextExpected = ALPHABET[placedCount] || "✓";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full relative">
      {/* Minimal HUD */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <div className="bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px]"><span className="text-slate-400">{username}</span></div>
        <div className="bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px]"><span className="text-emerald-400 font-bold">{score} pts</span></div>
        <div className="bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px]"><span className="text-slate-300">{placedCount}/26</span></div>
        <button onClick={onReset} className="bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Reset</button>
      </div>

      {/* 3D Scene */}
      <Canvas
        shadows
        camera={{ position: [0, 0, 20], fov: 50 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.6 }}
        style={{ touchAction: "none" }}
      >
        <SceneContent
          letters={letters}
          placedCount={placedCount}
          dragging={dragging}
          dragWorldPos={dragWorldPos}
          setDragging={setDragging}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          particleBurst={particleBurst}
        />
      </Canvas>

      {/* Word display panel - right side */}
      {placedCount > 0 && (
        <div className="absolute top-14 right-3 z-20 w-40 max-h-[70vh] overflow-y-auto pointer-events-none">
          <div className="bg-black/50 backdrop-blur-md rounded-xl border border-white/10 p-2.5">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-2 text-center">Words</div>
            <div className="flex flex-col gap-1">
              {ALPHABET.slice(0, placedCount).map((letter, i) => (
                <motion.div
                  key={letter}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 px-2 py-1 rounded-md"
                  style={{ background: `${LETTER_COLORS[i]}20` }}
                >
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: LETTER_COLORS[i] }}
                  >
                    {letter}
                  </span>
                  <span className="text-[11px] text-slate-200 font-medium">
                    for <span className="text-white">{LETTER_WORDS[letter]}</span>
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <p className="text-[10px] text-slate-500 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
          Drag letters to the board in A–Z order and release to place
        </p>
      </div>
    </motion.div>
  );
}

function SceneContent({
  letters, placedCount, dragging, dragWorldPos, setDragging, onDragMove, onDragEnd, particleBurst,
}: {
  letters: LetterState[]; placedCount: number;
  dragging: string | null; dragWorldPos: [number, number];
  setDragging: (l: string | null) => void;
  onDragMove: (x: number, y: number) => void; onDragEnd: (x: number, y: number) => void;
  particleBurst: { x: number; y: number; color: string; id: number } | null;
}) {
  const { camera, gl, raycaster, pointer } = useThree();
  const dragPlaneRef = useRef<THREE.Mesh>(null);
  const dragOffsetRef = useRef<[number, number]>([0, 0]);

  const screenToWorld = useCallback((clientX: number, clientY: number): [number, number] => {
    const rect = gl.domElement.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
    const vec = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const t = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(t));
    return [pos.x, pos.y];
  }, [camera, gl]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const [wx, wy] = screenToWorld(e.clientX, e.clientY);
      onDragMove(wx + dragOffsetRef.current[0], wy + dragOffsetRef.current[1]);
    };

    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      const [wx, wy] = screenToWorld(e.clientX, e.clientY);
      onDragEnd(wx + dragOffsetRef.current[0], wy + dragOffsetRef.current[1]);
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onUp);

    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onUp);
    };
  }, [dragging, gl, screenToWorld, onDragMove, onDragEnd]);

  const handleLetterPointerDown = useCallback((letter: string, e: any) => {
    e.stopPropagation();
    const [wx, wy] = screenToWorld(e.clientX, e.clientY);
    const ls = letters.find((l) => l.letter === letter);
    if (ls) {
      dragOffsetRef.current = [ls.position[0] - wx, ls.position[1] - wy];
    }
    setDragging(letter);
    document.body.style.cursor = "grabbing";
  }, [letters, screenToWorld, setDragging]);

  return (
    <>
      <SkyBackground />

      {/* Lighting */}
      <ambientLight intensity={0.45} color="#c4b5fd" />
      <directionalLight
        position={[5, 12, 8]}
        intensity={2.0}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={60}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-4, 6, 3]} intensity={0.4} color="#a78bfa" />
      <pointLight position={[0, 0, 5]} intensity={0.3} color="#06b6d4" />
      <hemisphereLight color="#c4b5fd" groundColor="#1e1b4b" intensity={0.3} />

      {/* Shadow-only floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.0, -2]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <shadowMaterial transparent opacity={0.5} />
      </mesh>

      {/* Contact shadows for soft ambient occlusion */}
      <ContactShadows position={[0, -4.98, 0]} opacity={0.6} scale={30} blur={1.5} far={12} color="#000000" />

      {/* Wooden board on the ground */}
      <DropZone placedCount={placedCount} dragging={dragging} dragWorldPos={dragWorldPos} />

      {/* Letters scattered on the grass */}
      {letters.map((ls) => {
        const isNext = ls.letter === ALPHABET[placedCount];
        const isDragging = dragging === ls.letter;
        return (
          <LetterBlock
            key={ls.letter}
            letterState={ls}
            isNext={isNext}
            isDragging={isDragging}
            dragWorldPos={dragWorldPos}
            onPointerDown={(e: any) => handleLetterPointerDown(ls.letter, e)}
          />
        );
      })}

      {/* Particle burst effect */}
      {particleBurst && <ParticleBurst key={particleBurst.id} x={particleBurst.x} y={particleBurst.y} color={particleBurst.color} />}
    </>
  );
}

function ParticleBurst({ x, y, color }: { x: number; y: number; color: string }) {
  const ref = useRef<THREE.Points>(null);
  const startTime = useRef(0);

  const { positions, velocities } = useMemo(() => {
    const count = 30;
    const pos = new Float32Array(count * 3);
    const vel: number[] = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = 0.5;
      const angle = (Math.random() * Math.PI * 2);
      const speed = 2 + Math.random() * 4;
      vel.push(Math.cos(angle) * speed, Math.sin(angle) * speed, (Math.random() - 0.3) * 3);
    }
    return { positions: pos, velocities: vel };
  }, [x, y]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (startTime.current === 0) startTime.current = clock.getElapsedTime();
    const elapsed = clock.getElapsedTime() - startTime.current;

    const posArray = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < 30; i++) {
      posArray[i * 3] = x + velocities[i * 3] * elapsed;
      posArray[i * 3 + 1] = y + velocities[i * 3 + 1] * elapsed - 2 * elapsed * elapsed;
      posArray[i * 3 + 2] = 0.5 + velocities[i * 3 + 2] * elapsed;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;

    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = Math.max(0, 1 - elapsed * 1.5);
    mat.size = Math.max(0.05, 0.25 - elapsed * 0.15);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={30} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.25} transparent opacity={1} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function SkyBackground() {
  const { scene } = useThree();
  useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, "#2e1065");
    gradient.addColorStop(0.3, "#1e1b4b");
    gradient.addColorStop(0.7, "#172554");
    gradient.addColorStop(1, "#0f172a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    scene.background = new THREE.CanvasTexture(canvas);
  }, [scene]);
  return null;
}

function DropZone({ placedCount, dragging, dragWorldPos }: { placedCount: number; dragging: string | null; dragWorldPos: [number, number] }) {
  const isCorrectDrag = dragging === ALPHABET[placedCount];
  const [nextSlotX, nextSlotY] = getDropSlotPosition(placedCount);
  const nearSlot = isCorrectDrag && dragWorldPos[1] > 1.5;

  const boardWidth = 18;
  const boardHeight = 4.5;
  const floorY = -5.0;
  const legHeight = 5.5;
  const boardY = floorY + legHeight + boardHeight / 2;
  const boardZ = -1;

  return (
    <group>
      {/* Main board body - rich dark green chalkboard */}
      <mesh position={[0, boardY, boardZ]} castShadow receiveShadow>
        <boxGeometry args={[boardWidth, boardHeight, 0.25]} />
        <meshStandardMaterial color="#1a3a2a" roughness={0.92} metalness={0.02} />
      </mesh>

      {/* Board writing surface - slightly lighter green */}
      <mesh position={[0, boardY, boardZ + 0.13]}>
        <planeGeometry args={[boardWidth - 0.5, boardHeight - 0.5]} />
        <meshStandardMaterial color="#1f4a35" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* Decorative golden frame - top */}
      <mesh position={[0, boardY + boardHeight / 2, boardZ + 0.08]} castShadow>
        <boxGeometry args={[boardWidth + 0.1, 0.2, 0.35]} />
        <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Frame - bottom */}
      <mesh position={[0, boardY - boardHeight / 2, boardZ + 0.08]} castShadow>
        <boxGeometry args={[boardWidth + 0.1, 0.2, 0.35]} />
        <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Frame - left */}
      <mesh position={[-boardWidth / 2 - 0.05, boardY, boardZ + 0.08]} castShadow>
        <boxGeometry args={[0.2, boardHeight + 0.4, 0.35]} />
        <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Frame - right */}
      <mesh position={[boardWidth / 2 + 0.05, boardY, boardZ + 0.08]} castShadow>
        <boxGeometry args={[0.2, boardHeight + 0.4, 0.35]} />
        <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Corner decorations */}
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sy], i) => (
        <mesh key={i} position={[sx * (boardWidth / 2), boardY + sy * (boardHeight / 2), boardZ + 0.15]} castShadow>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color="#D4A520" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}

      {/* Legs - polished dark wood */}
      <mesh position={[-boardWidth / 2 + 1.2, floorY + legHeight / 2, boardZ - 0.15]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, legHeight, 12]} />
        <meshStandardMaterial color="#2a1508" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[boardWidth / 2 - 1.2, floorY + legHeight / 2, boardZ - 0.15]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, legHeight, 12]} />
        <meshStandardMaterial color="#2a1508" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Leg caps - gold accents */}
      <mesh position={[-boardWidth / 2 + 1.2, floorY + legHeight, boardZ - 0.15]} castShadow>
        <cylinderGeometry args={[0.17, 0.14, 0.15, 12]} />
        <meshStandardMaterial color="#D4A520" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[boardWidth / 2 - 1.2, floorY + legHeight, boardZ - 0.15]} castShadow>
        <cylinderGeometry args={[0.17, 0.14, 0.15, 12]} />
        <meshStandardMaterial color="#D4A520" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Cross bar - ornate */}
      <mesh position={[0, floorY + legHeight * 0.35, boardZ - 0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, boardWidth - 3, 12]} />
        <meshStandardMaterial color="#1a0f08" roughness={0.6} metalness={0.15} />
      </mesh>

      {/* Chalk tray / ledge */}
      <mesh position={[0, boardY - boardHeight / 2 - 0.18, boardZ + 0.3]} castShadow>
        <boxGeometry args={[boardWidth - 0.3, 0.15, 0.5]} />
        <meshStandardMaterial color="#3d2211" roughness={0.7} metalness={0.08} />
      </mesh>

      {/* Title text area - "A B C" at top of board */}
      <mesh position={[0, boardY + boardHeight / 2 - 0.35, boardZ + 0.14]}>
        <planeGeometry args={[4, 0.35]} />
        <meshBasicMaterial color="#2a5a40" transparent opacity={0.5} />
      </mesh>

      {/* Highlight glow on next slot when dragging near */}
      {nearSlot && (
        <>
          <mesh position={[nextSlotX, nextSlotY, boardZ + 0.16]}>
            <planeGeometry args={[1.3, 1.4]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.25} />
          </mesh>
          <pointLight position={[nextSlotX, nextSlotY, boardZ + 0.5]} color="#22d3ee" intensity={2} distance={2} decay={2} />
        </>
      )}

      {/* Letter slots on the board */}
      {ALPHABET.map((letter, i) => {
        const [x, y] = getDropSlotPosition(i);
        const isPlaced = i < placedCount;
        const isNext = i === placedCount;
        return (
          <group key={letter} position={[x, y, boardZ + 0.12]}>
            {/* Slot background */}
            <mesh>
              <planeGeometry args={[1.05, 1.15]} />
              <meshStandardMaterial
                color={isPlaced ? LETTER_COLORS[i] : "#251a0d"}
                emissive={isPlaced ? LETTER_COLORS[i] : "#000000"}
                emissiveIntensity={isPlaced ? 0.3 : 0}
                transparent opacity={isPlaced ? 0.9 : 0.3}
                roughness={0.8}
              />
            </mesh>
            {/* Placed letter block sitting on the board */}
            {isPlaced && (
              <group position={[0, 0, 0.12]}>
                <RoundedBox args={[0.95, 1.05, 0.2]} radius={0.04} smoothness={3} castShadow>
                  <meshStandardMaterial color={LETTER_COLORS[i]} emissive={LETTER_COLORS[i]} emissiveIntensity={0.25} metalness={0.2} roughness={0.4} />
                </RoundedBox>
                <Center position={[0, 0, 0.12]}>
                  <Text3D font="/fonts/helvetiker_bold.typeface.json" size={0.4} height={0.04}>
                    {letter}
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.15} />
                  </Text3D>
                </Center>
              </group>
            )}
            {/* Blinking ? on next slot */}
            {isNext && !isPlaced && (
              <BlinkingQuestion position={[0, 0, 0.05]} />
            )}
          </group>
        );
      })}
    </group>
  );
}

function BlinkingQuestion({ position }: { position: [number, number, number] }) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const blink = (Math.sin(t * 5) + 1) / 2;
    if (matRef.current) {
      matRef.current.opacity = 0.2 + blink * 0.8;
    }
    if (groupRef.current) {
      groupRef.current.scale.setScalar(0.9 + blink * 0.15);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Center>
        <Text3D font="/fonts/helvetiker_bold.typeface.json" size={0.45} height={0.03}>
          {"?"}
          <meshBasicMaterial ref={matRef} color="#ffffff" transparent opacity={1} />
        </Text3D>
      </Center>
    </group>
  );
}

function LetterBlock({
  letterState, isNext, isDragging, dragWorldPos, onPointerDown,
}: {
  letterState: LetterState; isNext: boolean; isDragging: boolean;
  dragWorldPos: [number, number]; onPointerDown: (e: any) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { letter, position, placed } = letterState;
  const colorIndex = ALPHABET.indexOf(letter);
  const color = LETTER_COLORS[colorIndex];
  const currentPos = useRef(new THREE.Vector3(position[0], position[1], 0));

  useFrame(() => {
    if (!groupRef.current) return;

    let tx: number, ty: number, tz: number;

    if (isDragging) {
      tx = dragWorldPos[0];
      ty = dragWorldPos[1];
      tz = 0.8;
      currentPos.current.set(tx, ty, tz);
    } else if (placed) {
      tx = position[0];
      ty = position[1];
      tz = -0.2;
      currentPos.current.lerp(new THREE.Vector3(tx, ty, tz), 0.1);
    } else {
      tx = position[0];
      ty = position[1];
      tz = 0;
      currentPos.current.lerp(new THREE.Vector3(tx, ty, tz), 0.12);
    }

    groupRef.current.position.copy(currentPos.current);

    const targetScale = isDragging ? 1.15 : hovered && !placed ? 1.06 : 1;
    const s = groupRef.current.scale.x;
    groupRef.current.scale.setScalar(s + (targetScale - s) * 0.25);
  });

  if (placed) return null;

  return (
    <group ref={groupRef} position={[position[0], position[1], 0]}>
      <RoundedBox
        args={[1.0, 1.1, 0.35]}
        radius={0.07}
        smoothness={4}
        onPointerDown={onPointerDown}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "grab"; }}
        onPointerOut={() => { setHovered(false); if (!isDragging) document.body.style.cursor = "auto"; }}
        castShadow
      >
        <meshStandardMaterial
          color={isDragging ? "#ffffff" : hovered ? "#ffffff" : color}
          emissive={isDragging ? color : hovered ? color : "#111111"}
          emissiveIntensity={isDragging ? 0.6 : hovered ? 0.35 : 0.05}
          metalness={0.3} roughness={0.35}
        />
      </RoundedBox>

      <Center position={[0, 0, 0.19]}>
        <Text3D font="/fonts/helvetiker_bold.typeface.json" size={0.45} height={0.07}>
          {letter}
          <meshStandardMaterial
            color={isDragging || hovered ? color : "#ffffff"}
            emissive={isDragging || hovered ? color : "#ffffff"}
            emissiveIntensity={0.2} metalness={0.4} roughness={0.2}
          />
        </Text3D>
      </Center>
    </group>
  );
}

function WinnerScreen({ username, score, bonus, completionTime, wrongCount, onPlayAgain }: { username: string; score: number; bonus: number; completionTime: number; wrongCount: number; onPlayAgain: () => void }) {
  const penalty = wrongCount * 5;
  const totalScore = Math.max(0, score + bonus - penalty);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-full">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 14], fov: 50 }}>
          <SkyBackground />
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={2} color="#FFD700" />
          <pointLight position={[-5, 3, 3]} intensity={1} color="#8b5cf6" />
          <CelebrationLetters />
        </Canvas>
      </div>
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 150 }} className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 max-w-sm w-full text-center shadow-2xl">
          <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block mb-3">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-1">🎉 Champion! 🎉</h1>
          <p className="text-lg text-indigo-300 font-semibold mb-5">{username}</p>
          <div className="space-y-2 mb-6">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/5 p-3 border border-white/10"><Star className="w-4 h-4 text-emerald-400 mx-auto mb-0.5" /><div className="text-xl font-bold text-emerald-400">{score}</div><div className="text-[9px] text-slate-400 uppercase">Base</div></div>
              <div className="rounded-xl bg-white/5 p-3 border border-white/10"><Sparkles className="w-4 h-4 text-amber-400 mx-auto mb-0.5" /><div className="text-xl font-bold text-amber-400">+{bonus}</div><div className="text-[9px] text-slate-400 uppercase">Bonus</div></div>
              <div className="rounded-xl bg-white/5 p-3 border border-red-500/20"><div className="text-[10px] text-red-400 mb-0.5">✗</div><div className="text-xl font-bold text-red-400">{wrongCount > 0 ? `-${penalty}` : "0"}</div><div className="text-[9px] text-slate-400 uppercase">{wrongCount} Wrong</div></div>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-3 border border-indigo-400/20"><div className="text-2xl font-bold text-white">{totalScore}</div><div className="text-[10px] text-slate-400">Total Score</div></div>
            <div className="rounded-xl bg-white/5 p-2 border border-white/10"><span className="text-xs text-slate-300">Time: <span className="text-white font-bold">{completionTime}s</span></span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={onPlayAgain} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/30 transition-all text-sm">Play Again</button>
            <Link href="/" className="flex-1 py-2.5 rounded-xl bg-white/10 border border-white/20 text-slate-200 font-bold hover:bg-white/20 transition-all text-center text-sm">Home</Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function CelebrationLetters() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.3; });
  return (
    <group ref={groupRef}>
      {ALPHABET.map((letter, i) => {
        const angle = (i / 26) * Math.PI * 2;
        const r = 5.5;
        return (
          <group key={letter} position={[Math.cos(angle) * r, Math.sin(angle) * r, 0]}>
            <RoundedBox args={[0.7, 0.85, 0.25]} radius={0.04}>
              <meshStandardMaterial color={LETTER_COLORS[i]} emissive={LETTER_COLORS[i]} emissiveIntensity={0.5} metalness={0.3} roughness={0.3} />
            </RoundedBox>
            <Center position={[0, 0, 0.14]}>
              <Text3D font="/fonts/helvetiker_bold.typeface.json" size={0.3} height={0.04}>
                {letter}
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
              </Text3D>
            </Center>
          </group>
        );
      })}
    </group>
  );
}
