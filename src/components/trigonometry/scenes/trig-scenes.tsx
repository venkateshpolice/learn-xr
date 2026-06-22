"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Text, Grid, Environment } from "@react-three/drei";
import * as THREE from "three";
import { DEG_TO_RAD } from "@/data/trigonometry-modules";
import { WebXRButton } from "@/components/trigonometry/WebXRButton";
import { useSceneView } from "@/components/trigonometry/scenes/scene-view-context";
import CoordinateAxes from "@/components/three/CoordinateAxes";

const AXIS_LEN = 2.2;

/** −90° around X — turns drei Grid (vertical XY) into a horizontal XZ floor. */
const GRID_FLOOR_ROT: [number, number, number] = [-Math.PI / 2, 0, 0];

const gridProps = {
  cellThickness: 1,
  cellColor: "#6366f1",
  sectionThickness: 1.5,
  sectionColor: "#a5b4fc",
  fadeDistance: 50,
  fadeStrength: 0.6,
  infiniteGrid: false as const,
  side: THREE.DoubleSide,
  renderOrder: -1,
};

/** Grid on the math XY plane (unit circle, graphs) — same plane as z=0 content. */
function PlaneGrid({
  size = 6,
  z = -0.02,
}: {
  size?: number;
  z?: number;
}) {
  const { showGrid } = useSceneView();
  if (!showGrid) return null;

  const cellSize = size / 10;

  return (
    <Grid
      position={[0, 0, z]}
      rotation={[0, 0, 0]}
      args={[size, size]}
      cellSize={cellSize}
      sectionSize={cellSize * 2}
      {...gridProps}
    />
  );
}

/** Horizontal floor grid — rotated −90° on X. */
function FloorGrid({
  position = [0, -2.2, 0] as [number, number, number],
  size = 12,
}: {
  position?: [number, number, number];
  size?: number;
}) {
  const { showGrid } = useSceneView();
  if (!showGrid) return null;

  return (
    <Grid
      position={position}
      rotation={GRID_FLOOR_ROT}
      args={[size, size]}
      cellSize={0.5}
      sectionSize={1}
      {...gridProps}
    />
  );
}

/* ─── Unit Circle ─── */
export function UnitCircleScene({
  angleDeg,
  autoRotate = false,
  xrContainerRef,
  xrMode,
}: {
  angleDeg: number;
  autoRotate?: boolean;
  xrContainerRef?: React.RefObject<HTMLDivElement | null>;
  xrMode?: "ar" | "vr" | "both";
}) {
  const groupRef = useRef<THREE.Group>(null);
  const rad = angleDeg * DEG_TO_RAD;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const tan = Math.abs(cos) > 0.01 ? sin / cos : null;

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += delta * 0.2;
  });

  const circlePts = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const t = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t), Math.sin(t), 0));
    }
    return pts;
  }, []);

  return (
    <>
      <SceneLighting />
      {xrContainerRef && xrMode && <WebXRButton containerRef={xrContainerRef} mode={xrMode} />}
      <PlaneGrid size={5} />
      <CoordinateAxes length={AXIS_LEN} />

      <group ref={groupRef}>
        <Line points={circlePts} color="#a78bfa" lineWidth={2} />
        <Line points={[[0, 0, 0], [cos, sin, 0]]} color="#f472b6" lineWidth={3} />
        <Line points={[[0, 0, 0], [cos, 0, 0]]} color="#22d3ee" lineWidth={2} />
        <Line points={[[cos, 0, 0], [cos, sin, 0]]} color="#34d399" lineWidth={2} />
        {tan !== null && Math.abs(tan) < 4 && (
          <Line points={[[1, 0, 0], [1, tan, 0]]} color="#fbbf24" lineWidth={1.5} />
        )}

        <mesh position={[cos, sin, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.4} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.15, 0.35, 32, 1, 0, rad]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>

        <Text position={[cos + 0.15, sin + 0.15, 0.05]} fontSize={0.14} color="#f472b6">
          P(cos, sin)
        </Text>
      </group>

      <OrbitControls enablePan={false} minDistance={3} maxDistance={10} target={[0, 0, 0]} enableDamping />
    </>
  );
}

/* ─── Right Triangle ─── */
export function RightTriangleScene({ angleDeg }: { angleDeg: number }) {
  const rad = angleDeg * DEG_TO_RAD;
  const hyp = 2.5;
  const adj = hyp * Math.cos(rad);
  const opp = hyp * Math.sin(rad);

  return (
    <>
      <SceneLighting />
      <PlaneGrid size={5} />
      <CoordinateAxes length={AXIS_LEN} />

      <group position={[-adj / 2, -opp / 2, 0]}>
        <Line points={[[0, 0, 0], [adj, 0, 0]]} color="#22d3ee" lineWidth={3} />
        <Line points={[[adj, 0, 0], [adj, opp, 0]]} color="#34d399" lineWidth={3} />
        <Line points={[[0, 0, 0], [adj, opp, 0]]} color="#f472b6" lineWidth={3} />

        <mesh position={[adj / 2, -0.05, 0]}>
          <boxGeometry args={[adj, 0.04, 0.04]} />
          <meshStandardMaterial color="#22d3ee" />
        </mesh>
        <mesh position={[adj + 0.02, opp / 2, 0]}>
          <boxGeometry args={[0.04, opp, 0.04]} />
          <meshStandardMaterial color="#34d399" />
        </mesh>
        <mesh position={[adj / 2, opp / 2, 0]} rotation={[0, 0, Math.atan2(opp, adj)]}>
          <boxGeometry args={[hyp, 0.05, 0.05]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>

        <Text position={[adj / 2, -0.25, 0]} fontSize={0.16} color="#22d3ee" anchorX="center">
          adjacent
        </Text>
        <Text position={[adj + 0.35, opp / 2, 0]} fontSize={0.16} color="#34d399">
          opposite
        </Text>
        <Text position={[adj / 2 - 0.5, opp / 2 + 0.3, 0]} fontSize={0.16} color="#f472b6">
          hypotenuse
        </Text>

        <mesh position={[0.35, 0.35, 0]} rotation={[0, 0, 0]}>
          <ringGeometry args={[0, 0.35, 32, 1, 0, rad]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <OrbitControls enablePan={false} minDistance={4} maxDistance={12} target={[0, 0, 0]} enableDamping />
    </>
  );
}

/* ─── Graph (sin/cos/tan or transformed sin) ─── */
export function TrigGraphScene({
  fn,
  xMin = -Math.PI * 2,
  xMax = Math.PI * 2,
  yMin = -3,
  yMax = 3,
  extraFns,
}: {
  fn: (x: number) => number;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  extraFns?: { fn: (x: number) => number; color: string; label?: string }[];
}) {
  const xScale = 1.8 / (xMax - xMin);
  const yScale = 2.2 / (yMax - yMin);

  const toWorld = (x: number, y: number): [number, number, number] => [
    (x - (xMin + xMax) / 2) * xScale,
    (y - (yMin + yMax) / 2) * yScale,
    0,
  ];

  const mainPts = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const steps = 400;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = fn(x);
      if (Number.isFinite(y) && Math.abs(y) < 20) pts.push(new THREE.Vector3(...toWorld(x, y)));
    }
    return pts;
  }, [fn, xMin, xMax, yMin, yMax, xScale, yScale]);

  const extraLines = useMemo(() => {
    return (extraFns ?? []).map(({ fn: f, color }) => {
      const pts: THREE.Vector3[] = [];
      const steps = 400;
      for (let i = 0; i <= steps; i++) {
        const x = xMin + (i / steps) * (xMax - xMin);
        const y = f(x);
        if (Number.isFinite(y) && Math.abs(y) < 20) pts.push(new THREE.Vector3(...toWorld(x, y)));
      }
      return { pts, color };
    });
  }, [extraFns, xMin, xMax, yMin, yMax, xScale, yScale]);

  return (
    <>
      <SceneLighting />
      <PlaneGrid size={5.5} />
      <CoordinateAxes length={AXIS_LEN} />
      <Line points={mainPts} color="#a78bfa" lineWidth={2.5} />
      {extraLines.map((l, i) => (
        <Line key={i} points={l.pts} color={l.color} lineWidth={2} />
      ))}
      <OrbitControls enablePan={false} minDistance={3} maxDistance={10} enableDamping />
    </>
  );
}

/* ─── Wave ─── */
export function WaveScene({
  amplitude,
  frequency,
  phase,
  speed,
}: {
  amplitude: number;
  frequency: number;
  phase: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const basePositions = useRef<Float32Array | null>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(8, 4, 120, 40);
    basePositions.current = geo.attributes.position.array.slice() as Float32Array;
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    const base = basePositions.current;
    if (!mesh || !base) return;
    const pos = mesh.geometry.attributes.position;
    const t = clock.getElapsedTime() * speed;
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3];
      const bz = base[i * 3 + 2];
      pos.setZ(i, amplitude * Math.sin(frequency * bx + phase + t));
      pos.setY(i, bz);
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  });

  return (
    <>
      <SceneLighting />
      <color attach="background" args={["#0a0a18"]} />
      <FloorGrid position={[0, -2.5, 0]} size={14} />
      <CoordinateAxes length={3} />
      <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#38bdf8" roughness={0.3} metalness={0.1} side={THREE.DoubleSide} wireframe={false} />
      </mesh>
      <OrbitControls enablePan={false} minDistance={5} maxDistance={14} enableDamping />
    </>
  );
}

/* ─── Polar ─── */
export function PolarScene({ curve, maxR = 2 }: { curve: (theta: number) => number; maxR?: number }) {
  const pts = useMemo(() => {
    const p: THREE.Vector3[] = [];
    for (let i = 0; i <= 360; i++) {
      const theta = (i * Math.PI) / 180;
      const r = curve(theta);
      if (Number.isFinite(r) && r >= 0 && r <= maxR * 2) {
        p.push(new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), 0));
      }
    }
    return p;
  }, [curve, maxR]);

  const rings = useMemo(() => {
    const rs: THREE.Vector3[][] = [];
    for (let ri = 1; ri <= 4; ri++) {
      const r = (maxR * ri) / 4;
      const ring: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const t = (i / 64) * Math.PI * 2;
        ring.push(new THREE.Vector3(r * Math.cos(t), r * Math.sin(t), 0));
      }
      rs.push(ring);
    }
    return rs;
  }, [maxR]);

  return (
    <>
      <SceneLighting />
      <PlaneGrid size={5} />
      <CoordinateAxes length={AXIS_LEN} />
      {rings.map((ring, i) => (
        <Line key={i} points={ring} color="#334155" lineWidth={1} />
      ))}
      <Line points={pts} color="#f472b6" lineWidth={2.5} />
      <OrbitControls enablePan={false} minDistance={3} maxDistance={10} enableDamping />
    </>
  );
}

/* ─── Complex plane ─── */
export function ComplexPlaneScene({ re, im }: { re: number; im: number }) {
  const mag = Math.sqrt(re * re + im * im);
  const angle = Math.atan2(im, re);

  return (
    <>
      <SceneLighting />
      <PlaneGrid size={5} />
      <CoordinateAxes length={AXIS_LEN} xLabel="Re" yLabel="Im" />
      <Line points={[[0, 0, 0], [re, im, 0]]} color="#f472b6" lineWidth={3} />
      <mesh position={[re, im, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[mag, 0, 0]} rotation={[0, 0, angle]}>
        <ringGeometry args={[mag - 0.02, mag + 0.02, 64, 1, 0, angle]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <OrbitControls enablePan={false} minDistance={3} maxDistance={10} enableDamping />
    </>
  );
}

/* ─── 3D spherical point ─── */
export function SphericalScene({ azimuthDeg, elevationDeg, radius }: { azimuthDeg: number; elevationDeg: number; radius: number }) {
  const az = azimuthDeg * DEG_TO_RAD;
  const el = elevationDeg * DEG_TO_RAD;
  const x = radius * Math.cos(el) * Math.cos(az);
  const y = radius * Math.sin(el);
  const z = radius * Math.cos(el) * Math.sin(az);

  const sphereWire = useMemo(() => {
    const geo = new THREE.SphereGeometry(radius, 24, 16);
    return geo;
  }, [radius]);

  return (
    <>
      <SceneLighting />
      <FloorGrid position={[0, -2.5, 0]} size={10} />
      <CoordinateAxes length={2.8} />
      <mesh geometry={sphereWire}>
        <meshStandardMaterial color="#6366f1" wireframe transparent opacity={0.25} />
      </mesh>
      <Line points={[[0, 0, 0], [x, y, z]]} color="#f472b6" lineWidth={3} />
      <mesh position={[x, y, z]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.4} />
      </mesh>
      <OrbitControls enablePan={false} minDistance={4} maxDistance={14} enableDamping />
    </>
  );
}

/* ─── Vectors ─── */
export function VectorScene({
  ax, ay, az, bx, by, bz,
}: {
  ax: number; ay: number; az: number;
  bx: number; by: number; bz: number;
}) {
  const dot = ax * bx + ay * by + az * bz;
  const magA = Math.sqrt(ax * ax + ay * ay + az * az);
  const magB = Math.sqrt(bx * bx + by * by + bz * bz);
  const angleRad = magA > 0 && magB > 0 ? Math.acos(Math.min(1, Math.max(-1, dot / (magA * magB)))) : 0;

  return (
    <>
      <SceneLighting />
      <FloorGrid position={[0, -2.5, 0]} size={10} />
      <CoordinateAxes length={3} />
      <Arrow3D from={[0, 0, 0]} to={[ax, ay, az]} color="#22d3ee" />
      <Arrow3D from={[0, 0, 0]} to={[bx, by, bz]} color="#f472b6" />
      <Text position={[0, 2.2, 0]} fontSize={0.18} color="#fbbf24" anchorX="center">
        {`θ = ${((angleRad * 180) / Math.PI).toFixed(1)}°`}
      </Text>
      <OrbitControls enablePan={false} minDistance={4} maxDistance={14} enableDamping />
    </>
  );
}

/* ─── Helpers ─── */
function SceneLighting() {
  return (
    <>
      <color attach="background" args={["#0a0a18"]} />
      <Environment preset="city" environmentIntensity={0.35} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 4]} intensity={1.1} castShadow />
    </>
  );
}

function Arrow3D({ from, to, color }: { from: [number, number, number]; to: [number, number, number]; color: string }) {
  const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
  const len = dir.length();
  if (len < 0.01) return null;
  dir.normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  return (
    <group>
      <Line points={[from, to]} color={color} lineWidth={3} />
      <mesh position={to} quaternion={quat}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export function TrigCanvas({
  children,
  containerRef,
}: {
  children: React.ReactNode;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={containerRef} className="w-full h-full relative">
      {children}
    </div>
  );
}

export function defaultCanvasProps() {
  return {
    shadows: true as const,
    camera: { position: [0, 0, 6] as [number, number, number], fov: 45 },
    gl: { antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 },
  };
}
