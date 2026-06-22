"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Waves, ChevronDown, ChevronRight, MousePointerClick } from "lucide-react";

export interface WaveSettings {
  amplitude: number;
  frequency: number;
  speed: number;
  direction: number;
}

export interface WaterSettings {
  wave1: WaveSettings;
  wave2: WaveSettings;
  wave3: WaveSettings;
  choppiness: number;
  deepColor: string;
  shallowColor: string;
  opacity: number;
  metalness: number;
  roughness: number;
  foam: number;
  fresnel: number;
  rippleStrength: number;
  rippleSpeed: number;
  rippleDecay: number;
  timeScale: number;
  paused: boolean;
}

const POOL_W = 10;
const POOL_L = 20;
const POOL_DEPTH = 1.5;
const DECK_MARGIN = 3.5;

const DEFAULT_SETTINGS: WaterSettings = {
  wave1: { amplitude: 0.04, frequency: 1.2, speed: 0.5, direction: 0 },
  wave2: { amplitude: 0.025, frequency: 1.8, speed: 0.35, direction: 70 },
  wave3: { amplitude: 0.012, frequency: 2.5, speed: 0.45, direction: -40 },
  choppiness: 0.008,
  deepColor: "#0e7490",
  shallowColor: "#67e8f9",
  opacity: 0.88,
  metalness: 0.15,
  roughness: 0.05,
  foam: 0.08,
  fresnel: 0.8,
  rippleStrength: 0.18,
  rippleSpeed: 5,
  rippleDecay: 2.2,
  timeScale: 1,
  paused: false,
};

const PRESETS: Record<string, Partial<WaterSettings>> = {
  "Still Pool": {
    wave1: { amplitude: 0.008, frequency: 0.8, speed: 0.15, direction: 0 },
    wave2: { amplitude: 0.005, frequency: 1.2, speed: 0.1, direction: 45 },
    wave3: { amplitude: 0.003, frequency: 2, speed: 0.12, direction: -30 },
    choppiness: 0.002,
    foam: 0.02,
  },
  "Gentle Ripple": {
    wave1: { amplitude: 0.035, frequency: 1.1, speed: 0.45, direction: 0 },
    wave2: { amplitude: 0.02, frequency: 1.6, speed: 0.3, direction: 60 },
    wave3: { amplitude: 0.01, frequency: 2.2, speed: 0.35, direction: -25 },
    choppiness: 0.006,
    foam: 0.06,
  },
  "Swim Laps": {
    wave1: { amplitude: 0.06, frequency: 0.9, speed: 0.7, direction: 90 },
    wave2: { amplitude: 0.03, frequency: 1.4, speed: 0.5, direction: 90 },
    wave3: { amplitude: 0.015, frequency: 2, speed: 0.55, direction: 0 },
    choppiness: 0.012,
    foam: 0.1,
  },
  Splash: {
    wave1: { amplitude: 0.1, frequency: 1.3, speed: 1.0, direction: 15 },
    wave2: { amplitude: 0.07, frequency: 1.9, speed: 0.85, direction: -20 },
    wave3: { amplitude: 0.04, frequency: 2.8, speed: 1.1, direction: 50 },
    choppiness: 0.025,
    foam: 0.25,
    rippleStrength: 0.35,
  },
};

function createPoolTileTexture(base: string, grout: string, tiles = 4): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const step = size / tiles;
  const g = 3;
  ctx.fillStyle = grout;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = base;
  for (let row = 0; row < tiles; row++) {
    for (let col = 0; col < tiles; col++) {
      const shade = row % 2 === col % 2 ? 0 : 12;
      ctx.fillStyle = base;
      ctx.globalAlpha = 1;
      ctx.fillRect(col * step + g, row * step + g, step - g * 2, step - g * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.06 + shade * 0.005})`;
      ctx.fillRect(col * step + g, row * step + g, step - g * 2, (step - g * 2) * 0.35);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function isInsidePool(x: number, z: number, margin = 0.15): boolean {
  return Math.abs(x) <= POOL_W / 2 - margin && Math.abs(z) <= POOL_L / 2 - margin;
}

interface Ripple {
  x: number;
  z: number;
  start: number;
}

const MAX_RIPPLES = 4;
const _deepColor = new THREE.Color();
const _shallowColor = new THREE.Color();
const _foamColor = new THREE.Color("#5ec4e8");
const _vertexColor = new THREE.Color();

function dirFromDeg(deg: number): THREE.Vector2 {
  const rad = (deg * Math.PI) / 180;
  return new THREE.Vector2(Math.cos(rad), Math.sin(rad)).normalize();
}

function rippleHeight(
  x: number,
  z: number,
  t: number,
  ripple: Ripple,
  strength: number,
  speed: number,
  decay: number,
): number {
  const age = t - ripple.start;
  if (age <= 0 || age > 6) return 0;
  const d = Math.hypot(x - ripple.x, z - ripple.z);
  const ring = Math.sin(d * 8 - age * speed * 3);
  const fade = Math.exp(-age * decay) * Math.exp(-d * 0.35);
  return ring * fade * strength;
}

function WaterSurface({
  settingsRef,
  ripplesRef,
  onRipple,
}: {
  settingsRef: React.RefObject<WaterSettings | null>;
  ripplesRef: React.RefObject<Ripple[]>;
  onRipple: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const simTime = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(POOL_W, POOL_L, 96, 160);
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
    return geo;
  }, []);

  const basePositions = useMemo(
    () => Float32Array.from(geometry.attributes.position.array),
    [geometry],
  );

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!isInsidePool(e.point.x, e.point.z)) return;
    const ripples = ripplesRef.current!;
    const idx = ripples.length % MAX_RIPPLES;
    const ripple = { x: e.point.x, z: e.point.z, start: simTime.current };
    if (ripples.length < MAX_RIPPLES) ripples.push(ripple);
    else ripples[idx] = ripple;
    onRipple();
  };

  useFrame((_, delta) => {
    const s = settingsRef.current;
    const mesh = meshRef.current;
    if (!s || !mesh) return;

    if (!s.paused) simTime.current += delta * s.timeScale;
    const t = simTime.current;

    const pos = mesh.geometry.attributes.position;
    const colors = mesh.geometry.attributes.color as THREE.BufferAttribute;
    const ripples = ripplesRef.current ?? [];

    _deepColor.set(s.deepColor);
    _shallowColor.set(s.shallowColor);

    const dir1 = dirFromDeg(s.wave1.direction);
    const dir2 = dirFromDeg(s.wave2.direction);
    const dir3 = dirFromDeg(s.wave3.direction);

    for (let i = 0; i < pos.count; i++) {
      const lx = basePositions[i * 3];
      const ly = basePositions[i * 3 + 1];
      const worldX = lx;
      const worldZ = -ly;

      let h = 0;
      h += s.wave1.amplitude * Math.sin((worldX * dir1.x + worldZ * dir1.y) * s.wave1.frequency + t * s.wave1.speed);
      h += s.wave2.amplitude * Math.sin((worldX * dir2.x + worldZ * dir2.y) * s.wave2.frequency + t * s.wave2.speed);
      h += s.wave3.amplitude * Math.sin((worldX * dir3.x + worldZ * dir3.y) * s.wave3.frequency + t * s.wave3.speed);
      h += s.choppiness * Math.sin(worldX * 2.1 + worldZ * 1.7 + t * 1.3);
      h += s.choppiness * 0.6 * Math.sin(worldX * 3.5 - worldZ * 2.8 + t * 0.9);
      for (const r of ripples) {
        h += rippleHeight(worldX, worldZ, t, r, s.rippleStrength, s.rippleSpeed, s.rippleDecay);
      }

      pos.setXYZ(i, lx, ly, h);

      const crest = THREE.MathUtils.clamp((h + 0.04) / 0.12, 0, 1);
      _vertexColor.copy(_deepColor).lerp(_shallowColor, crest * 0.5 + 0.25);
      if (h > 0.05) _vertexColor.lerp(_foamColor, s.foam * THREE.MathUtils.clamp((h - 0.05) / 0.1, 0, 0.35));
      colors.setXYZ(i, _vertexColor.r, _vertexColor.g, _vertexColor.b);
    }

    pos.needsUpdate = true;
    colors.needsUpdate = true;
    mesh.geometry.computeVertexNormals();

    const mat = materialRef.current;
    if (mat) {
      mat.opacity = s.opacity;
      mat.metalness = s.metalness;
      mat.roughness = s.roughness;
      mat.transparent = true;
      mat.emissiveIntensity = s.fresnel * 0.03;
      mat.emissive.set(s.deepColor);
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, 0.02, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      renderOrder={3}
      onPointerDown={handleClick}
    >
      <meshStandardMaterial
        ref={materialRef}
        vertexColors
        color="#38bdf8"
        transparent
        opacity={0.88}
        metalness={0.2}
        roughness={0.15}
        side={THREE.FrontSide}
        depthWrite
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}

function PoolCaustics({ settingsRef }: { settingsRef: React.RefObject<WaterSettings | null> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const simTime = useRef(0);

  const geometry = useMemo(() => new THREE.PlaneGeometry(POOL_W - 0.2, POOL_L - 0.2, 64, 128), []);

  useFrame((_, delta) => {
    const s = settingsRef.current;
    const mesh = meshRef.current;
    if (!s || !mesh) return;
    if (!s.paused) simTime.current += delta * s.timeScale;
    const t = simTime.current;
    const pos = mesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const c =
        Math.sin(x * 2.4 + t * 1.1) * 0.04 +
        Math.sin(y * 1.9 - t * 0.9) * 0.035 +
        Math.sin((x + y) * 3.2 + t * 1.4) * 0.025;
      pos.setZ(i, c);
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, -POOL_DEPTH + 0.04, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <meshBasicMaterial color="#a5f3fc" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

const SCENE_BG = "#99DDFF";
const GROUND_COLOR = "#669933";
const GROUND_SIZE = 400;
const FOG_NEAR = 45;
const FOG_FAR = 140;

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[22, 38, 10]}
        intensity={1.1}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={120}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.0003}
      />
      <hemisphereLight args={[SCENE_BG, GROUND_COLOR, 0.33]} />
    </>
  );
}

function Tree({ position, scale = 1, variant = 0 }: { position: [number, number, number]; scale?: number; variant?: number }) {
  const greens = ["#166534", "#15803d", "#14532d", "#1a7431"] as const;
  const c1 = greens[variant % greens.length];
  const c2 = greens[(variant + 1) % greens.length];
  const c3 = greens[(variant + 2) % greens.length];
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.16, 1.4, 6]} />
        <meshStandardMaterial color="#6b4423" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <coneGeometry args={[1.15, 2.0, 8]} />
        <meshStandardMaterial color={c1} roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.55, 0]} castShadow>
        <coneGeometry args={[0.9, 1.5, 8]} />
        <meshStandardMaterial color={c2} roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.2, 0]} castShadow>
        <coneGeometry args={[0.55, 1.0, 8]} />
        <meshStandardMaterial color={c3} roughness={0.85} />
      </mesh>
    </group>
  );
}

function PoolEnvironment() {
  const grassGeometry = useMemo(() => {
    const outer = new THREE.Shape();
    const h = GROUND_SIZE / 2;
    outer.moveTo(-h, -h);
    outer.lineTo(h, -h);
    outer.lineTo(h, h);
    outer.lineTo(-h, h);
    outer.closePath();
    const hole = new THREE.Path();
    const hw = POOL_W / 2 + DECK_MARGIN + 0.3;
    const hl = POOL_L / 2 + DECK_MARGIN + 0.3;
    hole.moveTo(-hw, -hl);
    hole.lineTo(hw, -hl);
    hole.lineTo(hw, hl);
    hole.lineTo(-hw, hl);
    hole.closePath();
    outer.holes.push(hole);
    return new THREE.ShapeGeometry(outer, 1);
  }, []);
  const trees = useMemo(
    () =>
      [
        [-28, -32, 1.1, 0], [32, -28, 0.95, 1], [-38, 12, 1.15, 2], [36, 18, 1.0, 0],
        [-24, 38, 0.9, 1], [28, 42, 1.05, 3], [-42, -14, 1.2, 2], [40, -10, 0.85, 1],
        [-18, -55, 0.8, 0], [22, -48, 0.9, 2], [-35, 55, 0.75, 3], [38, 50, 0.85, 1],
        [-55, -8, 1.0, 0], [52, 8, 0.95, 2], [-12, 62, 0.7, 1], [15, -62, 0.8, 3],
      ] as [number, number, number, number][],
    [],
  );

  return (
    <group>
      {/* Large ground — matches three.js instancing_morph example */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow geometry={grassGeometry}>
        <meshStandardMaterial color={GROUND_COLOR} roughness={0.95} metalness={0} depthWrite />
      </mesh>

      {trees.map(([x, z, s, v], i) => (
        <Tree key={i} position={[x, -0.12, z]} scale={s} variant={v} />
      ))}

      <ContactShadows position={[0, -0.11, 0]} opacity={0.25} scale={50} blur={2} far={14} color="#334155" />
    </group>
  );
}

function SwimmingPool() {
  const floorTex = useMemo(() => {
    const t = createPoolTileTexture("#0891b2", "#0e7490", 8);
    t.repeat.set(8, 16);
    return t;
  }, []);
  const wallTex = useMemo(() => {
    const t = createPoolTileTexture("#06b6d4", "#0891b2", 4);
    t.repeat.set(4, 2);
    return t;
  }, []);

  const halfW = POOL_W / 2;
  const halfL = POOL_L / 2;
  const deckW = POOL_W + DECK_MARGIN * 2;
  const wallH = POOL_DEPTH - 0.08;
  const wallY = -0.04 - wallH / 2;

  return (
    <group>
      {/* Deck — ring around pool (not under water cavity) */}
      <mesh position={[0, -0.06, -(halfL + DECK_MARGIN / 2)]} receiveShadow>
        <boxGeometry args={[deckW, 0.12, DECK_MARGIN]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.06, halfL + DECK_MARGIN / 2]} receiveShadow>
        <boxGeometry args={[deckW, 0.12, DECK_MARGIN]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[-(halfW + DECK_MARGIN / 2), -0.06, 0]} receiveShadow>
        <boxGeometry args={[DECK_MARGIN, 0.12, POOL_L]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[halfW + DECK_MARGIN / 2, -0.06, 0]} receiveShadow>
        <boxGeometry args={[DECK_MARGIN, 0.12, POOL_L]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Coping — stone rim outside pool edge only */}
      {([
        [0, 0.05, -halfL - 0.2, POOL_W + 0.8, 0.07, 0.32],
        [0, 0.05, halfL + 0.2, POOL_W + 0.8, 0.07, 0.32],
        [-halfW - 0.2, 0.05, 0, 0.32, 0.07, POOL_L + 0.8],
        [halfW + 0.2, 0.05, 0, 0.32, 0.07, POOL_L + 0.8],
      ] as const).map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.45} metalness={0.08} />
        </mesh>
      ))}

      {/* Pool floor */}
      <mesh position={[0, -POOL_DEPTH, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[POOL_W - 0.15, POOL_L - 0.15]} />
        <meshStandardMaterial map={floorTex} roughness={0.35} metalness={0.05} color="#bae6fd" />
      </mesh>

      {/* Lane lines */}
      {[-3, 0, 3].map((x) => (
        <mesh key={x} position={[x, -POOL_DEPTH + 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, POOL_L - 1.5]} />
          <meshBasicMaterial color={x === 0 ? "#ef4444" : "#1e293b"} opacity={0.85} transparent />
        </mesh>
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={i} position={[0, -POOL_DEPTH + 0.012, -halfL + 1.5 + i * 1.7]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[POOL_W - 1, 0.06]} />
          <meshBasicMaterial color="#1e293b" opacity={0.5} transparent />
        </mesh>
      ))}

      {/* Pool walls — top edge below water surface */}
      <mesh position={[0, wallY, -halfL + 0.06]} receiveShadow>
        <boxGeometry args={[POOL_W - 0.12, wallH, 0.12]} />
        <meshStandardMaterial map={wallTex} roughness={0.35} color="#67e8f9" />
      </mesh>
      <mesh position={[0, wallY, halfL - 0.06]} receiveShadow>
        <boxGeometry args={[POOL_W - 0.12, wallH, 0.12]} />
        <meshStandardMaterial map={wallTex} roughness={0.35} color="#67e8f9" />
      </mesh>
      <mesh position={[-halfW + 0.06, wallY, 0]} receiveShadow>
        <boxGeometry args={[0.12, wallH, POOL_L - 0.12]} />
        <meshStandardMaterial map={wallTex} roughness={0.35} color="#67e8f9" />
      </mesh>
      <mesh position={[halfW - 0.06, wallY, 0]} receiveShadow>
        <boxGeometry args={[0.12, wallH, POOL_L - 0.12]} />
        <meshStandardMaterial map={wallTex} roughness={0.35} color="#67e8f9" />
      </mesh>

      {/* Ladder */}
      <group position={[halfW - 0.5, 0, -halfL + 2]}>
        {[-0.18, 0.18].map((x) => (
          <mesh key={x} position={[x, -0.5, 0]}>
            <boxGeometry args={[0.05, 1.2, 0.05]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, -0.15 - i * 0.22, 0]}>
            <boxGeometry args={[0.42, 0.04, 0.04]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Pool depth marker */}
      <mesh position={[-halfW + 0.6, -POOL_DEPTH / 2, halfL - 0.15]}>
        <boxGeometry args={[0.02, POOL_DEPTH - 0.2, 0.02]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function WaveScene({
  settingsRef,
  ripplesRef,
  onRipple,
}: {
  settingsRef: React.RefObject<WaterSettings | null>;
  ripplesRef: React.RefObject<Ripple[]>;
  onRipple: () => void;
}) {
  return (
    <>
      <color attach="background" args={[SCENE_BG]} />
      <fog attach="fog" args={[SCENE_BG, FOG_NEAR, FOG_FAR]} />
      <SceneLighting />

      <PoolEnvironment />
      <SwimmingPool />
      <PoolCaustics settingsRef={settingsRef} />
      <WaterSurface settingsRef={settingsRef} ripplesRef={ripplesRef} onRipple={onRipple} />

      <Text position={[0, 3.5, POOL_L / 2 - 1]} fontSize={0.35} color="#0c4a6e" anchorX="center" outlineWidth={0.015} outlineColor="#ffffff">
        Swimming Pool — click water to splash
      </Text>

      <OrbitControls
        enablePan={false}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={10}
        maxDistance={55}
        target={[0, -0.5, 0]}
      />
    </>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px] text-slate-300 py-0.5">
      <span className="w-[72px] shrink-0 truncate text-slate-400">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1 accent-sky-400 cursor-pointer"
      />
      <span className="w-9 text-right tabular-nums text-sky-300">{value.toFixed(2)}</span>
    </label>
  );
}

function Folder({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button type="button" onClick={onToggle} className="w-full flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-slate-200 hover:bg-white/5 transition-colors">
        {open ? <ChevronDown className="w-3 h-3 text-sky-400" /> : <ChevronRight className="w-3 h-3 text-sky-400" />}
        {title}
      </button>
      {open && <div className="px-3 pb-2 space-y-0.5">{children}</div>}
    </div>
  );
}

function WaterGUI({
  settings,
  onChange,
  onPreset,
  onReset,
}: {
  settings: WaterSettings;
  onChange: (patch: Partial<WaterSettings>) => void;
  onPreset: (name: string) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    wave1: true,
    wave2: true,
    wave3: false,
    water: true,
    ripples: true,
    animation: false,
  });

  const toggle = (key: string) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  const updateWave = (key: "wave1" | "wave2" | "wave3", field: keyof WaveSettings, value: number) => {
    onChange({ [key]: { ...settings[key], [field]: value } });
  };

  return (
    <div className="bg-[#1a1a1aee] backdrop-blur-md rounded-lg border border-white/10 shadow-2xl w-[280px] max-h-[calc(100vh-120px)] overflow-y-auto text-left">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#2a2a2a] rounded-t-lg">
        <span className="text-[11px] font-bold text-sky-300 tracking-wide">Pool Controls</span>
        <button type="button" onClick={onReset} className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded border border-white/10 hover:border-sky-400/40 transition-all">
          Reset
        </button>
      </div>

      <div className="px-3 py-2 border-b border-white/5 flex flex-wrap gap-1">
        {Object.keys(PRESETS).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onPreset(name)}
            className="text-[10px] px-2 py-1 rounded bg-sky-500/15 border border-sky-400/25 text-sky-300 hover:bg-sky-500/25 transition-all"
          >
            {name}
          </button>
        ))}
      </div>

      <Folder title="Wave 1" open={open.wave1} onToggle={() => toggle("wave1")}>
        <SliderRow label="Amplitude" value={settings.wave1.amplitude} min={0} max={0.15} step={0.005} onChange={(v) => updateWave("wave1", "amplitude", v)} />
        <SliderRow label="Frequency" value={settings.wave1.frequency} min={0.1} max={3} step={0.05} onChange={(v) => updateWave("wave1", "frequency", v)} />
        <SliderRow label="Speed" value={settings.wave1.speed} min={0} max={3} step={0.05} onChange={(v) => updateWave("wave1", "speed", v)} />
        <SliderRow label="Direction°" value={settings.wave1.direction} min={0} max={360} step={1} onChange={(v) => updateWave("wave1", "direction", v)} />
      </Folder>

      <Folder title="Wave 2" open={open.wave2} onToggle={() => toggle("wave2")}>
        <SliderRow label="Amplitude" value={settings.wave2.amplitude} min={0} max={0.15} step={0.005} onChange={(v) => updateWave("wave2", "amplitude", v)} />
        <SliderRow label="Frequency" value={settings.wave2.frequency} min={0.1} max={3} step={0.05} onChange={(v) => updateWave("wave2", "frequency", v)} />
        <SliderRow label="Speed" value={settings.wave2.speed} min={0} max={3} step={0.05} onChange={(v) => updateWave("wave2", "speed", v)} />
        <SliderRow label="Direction°" value={settings.wave2.direction} min={0} max={360} step={1} onChange={(v) => updateWave("wave2", "direction", v)} />
      </Folder>

      <Folder title="Wave 3 (Chop)" open={open.wave3} onToggle={() => toggle("wave3")}>
        <SliderRow label="Amplitude" value={settings.wave3.amplitude} min={0} max={0.08} step={0.005} onChange={(v) => updateWave("wave3", "amplitude", v)} />
        <SliderRow label="Frequency" value={settings.wave3.frequency} min={0.1} max={4} step={0.05} onChange={(v) => updateWave("wave3", "frequency", v)} />
        <SliderRow label="Speed" value={settings.wave3.speed} min={0} max={3} step={0.05} onChange={(v) => updateWave("wave3", "speed", v)} />
        <SliderRow label="Direction°" value={settings.wave3.direction} min={0} max={360} step={1} onChange={(v) => updateWave("wave3", "direction", v)} />
        <SliderRow label="Choppiness" value={settings.choppiness} min={0} max={0.06} step={0.002} onChange={(v) => onChange({ choppiness: v })} />
      </Folder>

      <Folder title="Water Appearance" open={open.water} onToggle={() => toggle("water")}>
        <label className="flex items-center gap-2 text-[11px] py-0.5">
          <span className="w-[72px] text-slate-400">Deep</span>
          <input type="color" value={settings.deepColor} onChange={(e) => onChange({ deepColor: e.target.value })} className="w-8 h-5 rounded cursor-pointer bg-transparent border-0" />
        </label>
        <label className="flex items-center gap-2 text-[11px] py-0.5">
          <span className="w-[72px] text-slate-400">Shallow</span>
          <input type="color" value={settings.shallowColor} onChange={(e) => onChange({ shallowColor: e.target.value })} className="w-8 h-5 rounded cursor-pointer bg-transparent border-0" />
        </label>
        <SliderRow label="Opacity" value={settings.opacity} min={0.5} max={1} step={0.01} onChange={(v) => onChange({ opacity: v })} />
        <SliderRow label="Foam" value={settings.foam} min={0} max={1} step={0.01} onChange={(v) => onChange({ foam: v })} />
        <SliderRow label="Fresnel" value={settings.fresnel} min={0} max={3} step={0.05} onChange={(v) => onChange({ fresnel: v })} />
        <SliderRow label="Metalness" value={settings.metalness} min={0} max={1} step={0.01} onChange={(v) => onChange({ metalness: v })} />
        <SliderRow label="Roughness" value={settings.roughness} min={0} max={1} step={0.01} onChange={(v) => onChange({ roughness: v })} />
      </Folder>

      <Folder title="Ripples (Click)" open={open.ripples} onToggle={() => toggle("ripples")}>
        <SliderRow label="Strength" value={settings.rippleStrength} min={0} max={1.5} step={0.05} onChange={(v) => onChange({ rippleStrength: v })} />
        <SliderRow label="Speed" value={settings.rippleSpeed} min={1} max={10} step={0.1} onChange={(v) => onChange({ rippleSpeed: v })} />
        <SliderRow label="Decay" value={settings.rippleDecay} min={0.5} max={5} step={0.1} onChange={(v) => onChange({ rippleDecay: v })} />
      </Folder>

      <Folder title="Animation" open={open.animation} onToggle={() => toggle("animation")}>
        <SliderRow label="Time Scale" value={settings.timeScale} min={0} max={3} step={0.05} onChange={(v) => onChange({ timeScale: v })} />
        <label className="flex items-center gap-2 text-[11px] py-1 text-slate-300">
          <input type="checkbox" checked={settings.paused} onChange={(e) => onChange({ paused: e.target.checked })} className="accent-sky-400" />
          Pause animation
        </label>
      </Folder>
    </div>
  );
}

function mergeSettings(base: WaterSettings, patch: Partial<WaterSettings>): WaterSettings {
  const next = { ...base, ...patch };
  if (patch.wave1) next.wave1 = { ...base.wave1, ...patch.wave1 };
  if (patch.wave2) next.wave2 = { ...base.wave2, ...patch.wave2 };
  if (patch.wave3) next.wave3 = { ...base.wave3, ...patch.wave3 };
  return next;
}

export default function WaveMotionPage() {
  const [settings, setSettings] = useState<WaterSettings>(DEFAULT_SETTINGS);
  const settingsRef = useRef<WaterSettings>(DEFAULT_SETTINGS);
  const ripplesRef = useRef<Ripple[]>([]);
  const [, setRippleTick] = useState(0);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const applyChange = useCallback((patch: Partial<WaterSettings>) => {
    setSettings((prev) => {
      const next = mergeSettings(prev, patch);
      settingsRef.current = next;
      return next;
    });
  }, []);

  const applyPreset = useCallback((name: string) => {
    const preset = PRESETS[name];
    if (!preset) return;
    setSettings((prev) => {
      const next = mergeSettings(prev, preset as Partial<WaterSettings>);
      settingsRef.current = next;
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    const next = structuredClone(DEFAULT_SETTINGS);
    settingsRef.current = next;
    ripplesRef.current = [];
    setSettings(next);
    setRippleTick((t) => t + 1);
  }, []);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-[#99DDFF]">
      <div className="absolute top-3 left-3 z-30">
        <Link href="/labs/physics" className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-xs text-slate-200 hover:text-white transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Physics Lab
        </Link>
      </div>

      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
          <Waves className="w-4 h-4 text-sky-400" />
          <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-sky-500 bg-clip-text text-transparent">Swimming Pool Lab</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-30">
        <button type="button" onClick={resetAll} className="bg-black/40 backdrop-blur-sm p-2 rounded-lg border border-white/15 text-slate-300 hover:text-white transition-all">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <Canvas shadows camera={{ position: [0, 8, 18], fov: 48 }} gl={{ antialias: true }} frameloop="always">
        <WaveScene settingsRef={settingsRef} ripplesRef={ripplesRef} onRipple={() => setRippleTick((t) => t + 1)} />
      </Canvas>

      <div className="absolute top-14 right-3 z-30">
        <WaterGUI settings={settings} onChange={applyChange} onPreset={applyPreset} onReset={resetAll} />
      </div>

      <div className="absolute bottom-4 left-4 z-20 max-w-xs">
        <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-semibold text-white">Pool Wave Physics</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A realistic swimming pool with tiled walls, lane lines & caustic light on the floor. Use presets like <strong className="text-sky-300">Still Pool</strong> or <strong className="text-sky-300">Splash</strong>. Click the water to make ripples.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white/5 rounded-lg px-2 py-1.5 border border-white/5">
              <span className="text-slate-500">Clear water</span>
              <p className="text-sky-300 font-medium">See tiles below</p>
            </div>
            <div className="bg-white/5 rounded-lg px-2 py-1.5 border border-white/5">
              <span className="text-slate-500">Caustics</span>
              <p className="text-sky-300 font-medium">Light on floor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
