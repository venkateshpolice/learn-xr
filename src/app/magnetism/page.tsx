"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Text, RoundedBox, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { ArrowLeft, RotateCcw, Magnet, Info, Link2 } from "lucide-react";
import Link from "next/link";

type Pole = "N" | "S";
type MagnetId = "A" | "B";
type ForceType = "attract" | "repel" | "none" | "attached";

interface MagnetBody {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotationY: number;
}

const MAGNET_LENGTH = 2.4;
const MAGNET_HEIGHT = 0.55;
const MAGNET_DEPTH = 0.7;
const TABLE_Y = MAGNET_HEIGHT / 2 + 0.02;
const MAGNETIC_K = 18;
const DAMPING = 0.82;
const MAX_SPEED = 8;
const FORCE_RANGE = 6;
const SNAP_POLE_DIST = 1.35;
const ATTACHED_GAP = 0.02;
const BREAK_STRETCH = 1.0;
const MASS = 1;
const _vecScratch = new THREE.Vector3();

function speak(text: string) {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  } catch {}
}

function getPoleWorldPos(m: MagnetBody, pole: Pole): THREE.Vector3 {
  const offset = new THREE.Vector3(pole === "N" ? MAGNET_LENGTH / 2 : -MAGNET_LENGTH / 2, 0, 0);
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), m.rotationY);
  return m.position.clone().add(offset);
}

function getClosestPolePair(a: MagnetBody, b: MagnetBody) {
  const poles: Pole[] = ["N", "S"];
  let best = { p1: "N" as Pole, p2: "S" as Pole, dist: Infinity, same: false };
  for (const p1 of poles) {
    for (const p2 of poles) {
      const d = getPoleWorldPos(a, p1).distanceTo(getPoleWorldPos(b, p2));
      if (d < best.dist) best = { p1, p2, dist: d, same: p1 === p2 };
    }
  }
  return best;
}

function getForceType(a: MagnetBody, b: MagnetBody, attached: boolean): ForceType {
  if (attached) return "attached";
  const dist = a.position.distanceTo(b.position);
  if (dist > FORCE_RANGE) return "none";
  const pair = getClosestPolePair(a, b);
  return pair.same ? "repel" : "attract";
}

function clampToTable(pos: THREE.Vector3) {
  pos.x = THREE.MathUtils.clamp(pos.x, -6, 6);
  pos.z = THREE.MathUtils.clamp(pos.z, -3, 3);
  pos.y = TABLE_Y;
}

function clampAttachedPair(leader: MagnetBody, follower: MagnetBody, leaderToFollower: THREE.Vector3) {
  clampToTable(leader.position);
  follower.position.copy(leader.position).add(leaderToFollower);
  clampToTable(follower.position);
  const expected = leader.position.clone().add(leaderToFollower);
  if (follower.position.distanceToSquared(expected) > 0.0001) {
    leader.position.copy(follower.position).sub(leaderToFollower);
    clampToTable(leader.position);
    follower.position.copy(leader.position).add(leaderToFollower);
  }
}

function computeMagneticForces(a: MagnetBody, b: MagnetBody) {
  const fa = new THREE.Vector3();
  const fb = new THREE.Vector3();
  const poles: Pole[] = ["N", "S"];

  for (const p1 of poles) {
    for (const p2 of poles) {
      const pos1 = getPoleWorldPos(a, p1);
      const pos2 = getPoleWorldPos(b, p2);
      const diff = pos2.clone().sub(pos1);
      const r = Math.max(diff.length(), 0.35);
      const strength = MAGNETIC_K / (r * r);
      const dir = diff.normalize();
      const same = p1 === p2;
      // opposite poles attract (+dir on A toward B pole)
      const sign = same ? -1 : 1;
      fa.add(dir.clone().multiplyScalar(sign * strength));
      fb.add(dir.clone().multiplyScalar(-sign * strength));
    }
  }
  return { fa, fb };
}

function poleFacingRotation(pole: Pole, worldDir: THREE.Vector3): number {
  const d = worldDir.clone().setY(0).normalize();
  if (d.lengthSq() < 1e-6) return 0;
  return pole === "N" ? Math.atan2(-d.z, d.x) : Math.atan2(d.z, -d.x);
}

function snapAttachedPositions(a: MagnetBody, b: MagnetBody, pair: ReturnType<typeof getClosestPolePair>) {
  const p1 = getPoleWorldPos(a, pair.p1);
  const p2 = getPoleWorldPos(b, pair.p2);
  const attachDir = p2.clone().sub(p1);
  if (attachDir.lengthSq() < 1e-6) attachDir.set(1, 0, 0);
  else attachDir.normalize();

  a.rotationY = poleFacingRotation(pair.p1, attachDir);
  b.rotationY = poleFacingRotation(pair.p2, attachDir.clone().negate());

  const poleA = getPoleWorldPos(a, pair.p1);
  const poleOffB = getPoleWorldPos(b, pair.p2).sub(b.position);
  const targetPoleB = poleA.clone().addScaledVector(attachDir, ATTACHED_GAP);
  b.position.copy(targetPoleB.sub(poleOffB));

  const offset = _vecScratch.copy(b.position).sub(a.position);
  clampAttachedPair(a, b, offset);
}

export default function MagnetismPage() {
  const [forceType, setForceType] = useState<ForceType>("none");
  const [attached, setAttached] = useState(false);
  const [dragging, setDragging] = useState<MagnetId | null>(null);
  const [showTip, setShowTip] = useState(true);
  const [tick, setTick] = useState(0);
  const lastSpoken = useRef<ForceType>("none");

  const physics = useRef({
    a: { position: new THREE.Vector3(-3.5, TABLE_Y, 0), velocity: new THREE.Vector3(), rotationY: 0 },
    b: { position: new THREE.Vector3(3.5, TABLE_Y, 0), velocity: new THREE.Vector3(), rotationY: Math.PI },
    attached: false,
    attachOffset: new THREE.Vector3(),
  });

  useEffect(() => {
    const { a, b } = physics.current;
    const type = getForceType(a, b, physics.current.attached);
    setForceType(type);
    setAttached(physics.current.attached);
    if (type !== "none" && type !== lastSpoken.current) {
      lastSpoken.current = type;
      if (type === "attract") speak("Opposite poles attract! Pull them closer.");
      else if (type === "repel") speak("Like poles repel! They push apart.");
      else if (type === "attached") speak("Magnets attached! Opposite poles snapped together.");
    }
    if (type === "none") lastSpoken.current = "none";
  }, [tick, dragging]);

  const flipMagnet = (id: MagnetId) => {
    if (physics.current.attached) {
      physics.current.attached = false;
      setAttached(false);
    }
    if (id === "A") physics.current.a.rotationY += Math.PI;
    else physics.current.b.rotationY += Math.PI;
    physics.current.a.velocity.set(0, 0, 0);
    physics.current.b.velocity.set(0, 0, 0);
    setTick((t) => t + 1);
    speak("Magnet flipped. Try bringing the poles together again.");
  };

  const reset = () => {
    physics.current = {
      a: { position: new THREE.Vector3(-3.5, TABLE_Y, 0), velocity: new THREE.Vector3(), rotationY: 0 },
      b: { position: new THREE.Vector3(3.5, TABLE_Y, 0), velocity: new THREE.Vector3(), rotationY: Math.PI },
      attached: false,
      attachOffset: new THREE.Vector3(),
    };
    setDragging(null);
    setAttached(false);
    setForceType("none");
    lastSpoken.current = "none";
    setTick((t) => t + 1);
  };

  return (
    <div className="h-screen w-screen text-white relative overflow-hidden bg-gradient-to-b from-[#0a1020] via-[#121830] to-[#0a0e18]">
      <div className="absolute top-3 left-3 z-30">
        <Link href="/labs/physics" className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-xs text-slate-200 hover:text-white transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Physics Lab
        </Link>
      </div>

      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
          <Magnet className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Magnetism Lab</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-30">
        <button onClick={reset} className="bg-black/40 backdrop-blur-sm p-2 rounded-lg border border-white/15 text-slate-300 hover:text-white transition-all">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <Canvas shadows camera={{ position: [0, 7, 10], fov: 45 }} gl={{ antialias: true }}>
        <Scene physics={physics} dragging={dragging} setDragging={setDragging} forceType={forceType} attached={attached} onPhysicsUpdate={() => setTick((t) => t + 1)} />
      </Canvas>

      <div className="absolute bottom-4 left-4 z-20 max-w-sm">
        <div className="bg-black/75 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">Real Physics Simulation</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Magnets use magnetic forces in real time. Opposite poles snap together when close!
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500" /><span className="text-slate-400">N = North (red)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500" /><span className="text-slate-400">S = South (blue)</span></div>
            <div className="flex items-center gap-2 pt-1"><span>🧲</span><span className="text-emerald-300">Opposite poles → Attract & snap</span></div>
            <div className="flex items-center gap-2"><span>↔️</span><span className="text-rose-300">Same poles → Repel</span></div>
            <div className="flex items-center gap-2"><Link2 className="w-3 h-3 text-cyan-400" /><span className="text-cyan-300">Pull hard to detach</span></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        {(["A", "B"] as MagnetId[]).map((id) => (
          <button key={id} onClick={() => flipMagnet(id)} className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 text-xs text-slate-200 hover:text-white hover:border-indigo-400/40 transition-all">
            Flip Magnet {id} ↻
          </button>
        ))}
      </div>

      <AnimatePresence>
        {forceType !== "none" && (
          <motion.div key={forceType} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
            <div className={`px-6 py-3 rounded-2xl border backdrop-blur-xl font-bold text-lg shadow-2xl ${
              forceType === "attached" ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300" :
              forceType === "attract" ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300" :
              "bg-rose-500/20 border-rose-400/40 text-rose-300"
            }`}>
              {forceType === "attached" ? "🔗 Attached!" : forceType === "attract" ? "✨ Attracting!" : "💥 Repelling!"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTip && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowTip(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 max-w-md mx-4 text-center" onClick={(e) => e.stopPropagation()}>
              <div className="text-5xl mb-4">🧲</div>
              <h2 className="text-2xl font-bold mb-2">Magnetic Forces</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Drag magnets close — opposite poles <strong className="text-emerald-400">attract and snap together</strong>.
                Same poles <strong className="text-rose-400">repel</strong>. Pull firmly to separate attached magnets.
              </p>
              <button onClick={() => setShowTip(false)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold">Start Experiment →</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Scene({
  physics, dragging, setDragging, forceType, attached, onPhysicsUpdate,
}: {
  physics: React.RefObject<{
    a: MagnetBody;
    b: MagnetBody;
    attached: boolean;
    attachOffset: THREE.Vector3;
  }>;
  dragging: MagnetId | null;
  setDragging: (id: MagnetId | null) => void;
  forceType: ForceType;
  attached: boolean;
  onPhysicsUpdate: () => void;
}) {
  const magnetARef = useRef<THREE.Group>(null);
  const magnetBRef = useRef<THREE.Group>(null);
  const uiSyncTimer = useRef(0);

  useFrame((_, delta) => {
    const p = physics.current;
    const { a, b } = p;
    const dt = Math.min(delta, 0.033);
    const pair = getClosestPolePair(a, b);

    // Snap attach when opposite poles close
    if (!p.attached && !pair.same && pair.dist < SNAP_POLE_DIST && dragging === null) {
      p.attached = true;
      snapAttachedPositions(a, b, pair);
      p.attachOffset.copy(b.position).sub(a.position);
      a.velocity.set(0, 0, 0);
      b.velocity.set(0, 0, 0);
    }

    if (p.attached) {
      if (dragging === "A") {
        clampAttachedPair(a, b, p.attachOffset);
      } else if (dragging === "B") {
        clampAttachedPair(b, a, _vecScratch.copy(p.attachOffset).negate());
      } else {
        b.position.copy(a.position).add(p.attachOffset);
        clampAttachedPair(a, b, p.attachOffset);
        a.velocity.set(0, 0, 0);
        b.velocity.set(0, 0, 0);
      }

      if (dragging !== null) {
        const dragMag = dragging === "A" ? a : b;
        const other = dragging === "A" ? b : a;
        const stretch = dragMag.position.distanceTo(other.position) - p.attachOffset.length();
        if (stretch > BREAK_STRETCH) {
          p.attached = false;
          const breakDir = dragMag.position.clone().sub(other.position).normalize();
          other.velocity.copy(breakDir.multiplyScalar(2));
        }
      }
    } else if (dragging === null) {
      const { fa, fb } = computeMagneticForces(a, b);
      const centerDist = a.position.distanceTo(b.position);
      if (centerDist < FORCE_RANGE) {
        a.velocity.add(fa.clone().multiplyScalar(dt / MASS));
        b.velocity.add(fb.clone().multiplyScalar(dt / MASS));
      }

      a.velocity.multiplyScalar(DAMPING);
      b.velocity.multiplyScalar(DAMPING);

      if (a.velocity.length() > MAX_SPEED) a.velocity.setLength(MAX_SPEED);
      if (b.velocity.length() > MAX_SPEED) b.velocity.setLength(MAX_SPEED);

      a.position.add(a.velocity.clone().multiplyScalar(dt));
      b.position.add(b.velocity.clone().multiplyScalar(dt));

      // Prevent magnets overlapping
      const minCenter = MAGNET_LENGTH * 0.85;
      const dir = b.position.clone().sub(a.position);
      const dist = dir.length();
      if (dist < minCenter && dist > 0.01) {
        const push = dir.normalize().multiplyScalar((minCenter - dist) / 2);
        a.position.sub(push);
        b.position.add(push);
        a.velocity.add(push.clone().multiplyScalar(-2));
        b.velocity.add(push.clone().multiplyScalar(2));
      }

      clampToTable(a.position);
      clampToTable(b.position);
    }

    if (magnetARef.current) {
      magnetARef.current.position.copy(a.position);
      magnetARef.current.rotation.y = a.rotationY;
    }
    if (magnetBRef.current) {
      magnetBRef.current.position.copy(b.position);
      magnetBRef.current.rotation.y = b.rotationY;
    }

    uiSyncTimer.current += dt;
    if (uiSyncTimer.current > 0.08) {
      uiSyncTimer.current = 0;
      onPhysicsUpdate();
    }
  });

  return (
    <>
      <color attach="background" args={["#0a1020"]} />
      <fog attach="fog" args={["#0a1020", 18, 35]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 12, 8]} intensity={1.8} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[-8, 6, 4]} intensity={0.6} color="#6688ff" />
      <pointLight position={[8, 4, 4]} intensity={0.5} color="#ff6688" />

      <LabTable />
      <IronFilings physics={physics} />

      <BarMagnet3D id="A" groupRef={magnetARef} body={physics.current.a} dragging={dragging === "A"} physics={physics} onDragStart={() => setDragging("A")} onDragEnd={() => setDragging(null)} />
      <BarMagnet3D id="B" groupRef={magnetBRef} body={physics.current.b} dragging={dragging === "B"} physics={physics} onDragStart={() => setDragging("B")} onDragEnd={() => setDragging(null)} />

      <MagneticFieldLines physics={physics} forceType={forceType} />
      <ForceArrows physics={physics} forceType={forceType} />
      {attached && <AttachmentGlow physics={physics} />}

      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={20} blur={2} />
    </>
  );
}

function LabTable() {
  return (
    <group>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[14, 0.1, 8]} />
        <meshStandardMaterial color="#1a2235" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#252d42" roughness={0.85} />
      </mesh>
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={i} position={[(i - 7) * 1, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.01, 8]} />
          <meshBasicMaterial color="#3a4560" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function BarMagnet3D({
  id, groupRef, body, dragging, physics, onDragStart, onDragEnd,
}: {
  id: MagnetId;
  groupRef: React.RefObject<THREE.Group | null>;
  body: MagnetBody;
  dragging: boolean;
  physics: React.RefObject<{ a: MagnetBody; b: MagnetBody; attached: boolean; attachOffset: THREE.Vector3 }>;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const { camera, gl } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -TABLE_Y), []);
  const intersection = useMemo(() => new THREE.Vector3(), []);
  const offset = useMemo(() => new THREE.Vector3(), []);
  const dragActive = useRef(false);
  const scaleRef = useRef(1);

  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    raycaster.ray.intersectPlane(plane, intersection);
    return intersection.clone();
  }, [camera, gl, plane, intersection]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragActive.current) return;
      const world = screenToWorld(e.clientX, e.clientY);
      body.position.set(
        THREE.MathUtils.clamp(world.x + offset.x, -6, 6),
        TABLE_Y,
        THREE.MathUtils.clamp(world.z + offset.z, -3, 3)
      );
      body.velocity.set(0, 0, 0);
    };
    const onUp = () => {
      if (dragActive.current) {
        dragActive.current = false;
        onDragEnd();
      }
    };
    gl.domElement.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      gl.domElement.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl, screenToWorld, offset, body, physics, id, onDragEnd]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    dragActive.current = true;
    onDragStart();
    const world = screenToWorld(e.clientX, e.clientY);
    offset.set(body.position.x - world.x, 0, body.position.z - world.z);
    body.velocity.set(0, 0, 0);
    gl.domElement.setPointerCapture(e.pointerId);
  };

  useFrame(({ clock }) => {
    if (groupRef.current) {
      scaleRef.current = dragging ? 1 + Math.sin(clock.getElapsedTime() * 8) * 0.04 : THREE.MathUtils.lerp(scaleRef.current, 1, 0.15);
      groupRef.current.scale.y = scaleRef.current;
    }
  });

  const halfLen = MAGNET_LENGTH / 2;

  return (
    <group ref={groupRef} position={body.position} rotation={[0, body.rotationY, 0]}>
      <group onPointerDown={handlePointerDown}>
        <RoundedBox args={[halfLen, MAGNET_HEIGHT, MAGNET_DEPTH]} position={[-halfLen / 2, 0, 0]} radius={0.08} smoothness={3} castShadow>
          <meshStandardMaterial color="#1565C0" roughness={0.25} metalness={0.6} emissive="#1565C0" emissiveIntensity={dragging ? 0.35 : 0.08} />
        </RoundedBox>
        <RoundedBox args={[halfLen, MAGNET_HEIGHT, MAGNET_DEPTH]} position={[halfLen / 2, 0, 0]} radius={0.08} smoothness={3} castShadow>
          <meshStandardMaterial color="#C62828" roughness={0.25} metalness={0.6} emissive="#C62828" emissiveIntensity={dragging ? 0.35 : 0.08} />
        </RoundedBox>
        <mesh castShadow>
          <boxGeometry args={[0.12, MAGNET_HEIGHT + 0.02, MAGNET_DEPTH + 0.02]} />
          <meshStandardMaterial color="#b0bec5" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>
      <Text position={[-halfLen / 2, MAGNET_HEIGHT / 2 + 0.15, 0]} fontSize={0.28} color="#90caf9" anchorX="center">S</Text>
      <Text position={[halfLen / 2, MAGNET_HEIGHT / 2 + 0.15, 0]} fontSize={0.28} color="#ef9a9a" anchorX="center">N</Text>
      <Text position={[0, MAGNET_HEIGHT / 2 + 0.35, 0]} fontSize={0.14} color="#ffffff" anchorX="center" outlineWidth={0.01} outlineColor="#000">{id}</Text>
      {dragging && <pointLight position={[0, 0.5, 0]} color="#aabbff" intensity={3} distance={3} />}
    </group>
  );
}

function MagneticFieldLines({ physics, forceType }: { physics: React.RefObject<{ a: MagnetBody; b: MagnetBody }>; forceType: ForceType }) {
  const lineObject = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(75, 3));
    const material = new THREE.LineBasicMaterial({ color: "#66bb6a", transparent: true, opacity: 0.75 });
    return new THREE.Line(geometry, material);
  }, []);
  const lineRef = useRef<THREE.Line>(lineObject);
  const { a, b } = physics.current;
  const pair = getClosestPolePair(a, b);

  useFrame(() => {
    const line = lineRef.current;
    if (!line || forceType === "none") {
      if (line) line.visible = false;
      return;
    }
    line.visible = true;
    const material = line.material as THREE.LineBasicMaterial;
    material.color.set(forceType === "repel" ? "#ef5350" : "#66bb6a");
    const from = getPoleWorldPos(physics.current.a, pair.p1);
    const to = getPoleWorldPos(physics.current.b, pair.p2);
    const pts: number[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const mid = from.clone().lerp(to, t);
      mid.y += Math.sin(t * Math.PI) * (forceType === "repel" ? -0.5 : 0.6);
      pts.push(mid.x, mid.y + 0.1, mid.z);
    }
    const geo = line.geometry as THREE.BufferGeometry;
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    geo.computeBoundingSphere();
  });

  return <primitive ref={lineRef} object={lineObject} />;
}

function ForceArrows({ physics, forceType }: { physics: React.RefObject<{ a: MagnetBody; b: MagnetBody }>; forceType: ForceType }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const { a, b } = physics.current;
    ref.current.visible = forceType === "attract" || forceType === "repel";
    if (!ref.current.visible) return;
    const mid = a.position.clone().lerp(b.position, 0.5);
    ref.current.position.set(mid.x, 1.2 + Math.sin(clock.getElapsedTime() * 3) * 0.08, mid.z);
  });

  if (forceType !== "attract" && forceType !== "repel") return null;

  const { a, b } = physics.current;
  const dir = b.position.clone().sub(a.position).normalize();
  const color = forceType === "attract" ? "#66bb6a" : "#ef5350";
  const mid = a.position.clone().lerp(b.position, 0.5);

  return (
    <group ref={ref} position={[mid.x, 1.2, mid.z]}>
      <mesh quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), forceType === "attract" ? dir : dir.clone().negate())}>
        <coneGeometry args={[0.15, 0.5, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function AttachmentGlow({ physics }: { physics: React.RefObject<{ a: MagnetBody; b: MagnetBody }> }) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(() => {
    if (!ref.current) return;
    const { a, b } = physics.current;
    ref.current.position.set(
      (a.position.x + b.position.x) / 2,
      TABLE_Y + 0.35,
      (a.position.z + b.position.z) / 2,
    );
  });
  return <pointLight ref={ref} color="#66ddff" intensity={4} distance={2.5} decay={2} />;
}

function IronFilings({ physics }: { physics: React.RefObject<{ a: MagnetBody; b: MagnetBody }> }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 400;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 12,
    z: (Math.random() - 0.5) * 6,
  })), []);

  useFrame(() => {
    if (!ref.current) return;
    const { a, b } = physics.current;
    positions.forEach((pos, i) => {
      const p = new THREE.Vector3(pos.x, 0.04, pos.z);
      const toA = a.position.clone().sub(p);
      const toB = b.position.clone().sub(p);
      const field = toA.normalize().multiplyScalar(1 / (toA.length() + 0.5)).add(toB.normalize().multiplyScalar(1 / (toB.length() + 0.5)));
      dummy.position.set(pos.x, 0.04, pos.z);
      dummy.rotation.set(0, Math.atan2(field.x, field.z), 0);
      dummy.scale.set(1, 1, Math.min(2.2, field.length() * 0.9 + 0.3));
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.06, 0.01, 0.02]} />
      <meshStandardMaterial color="#78909c" roughness={0.6} metalness={0.8} />
    </instancedMesh>
  );
}
