"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import type { CircuitLayout } from "@/data/circuit-stages";
import type { CircuitResult } from "@/lib/circuitPhysics";
import { buildCircuitGeometry, CELL_VOLTAGE, type WireSegment } from "@/lib/circuitPhysics";
import { StableLine } from "@/components/three/StableLine";
import { RealisticBulb } from "@/components/circuit/CircuitParts";

const COPPER = "#b87333";
const COPPER_BRIGHT = "#fbbf24";
const PLASTIC = "#dc2626";

function WirePath({ segment, live }: { segment: WireSegment; live: boolean }) {
  const color = segment.isInsulator ? PLASTIC : live ? COPPER_BRIGHT : "#64748b";
  const opacity = segment.isInsulator ? 0.85 : live ? 0.95 : 0.45;

  if (segment.isInsulator) {
    const [a, b] = [segment.points[0], segment.points[segment.points.length - 1]];
    const mid: [number, number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) + 0.4;
    return (
      <group position={mid}>
        <RoundedBox args={[len, 0.14, 0.14]} radius={0.04}>
          <meshStandardMaterial color={PLASTIC} roughness={0.6} emissive="#7f1d1d" emissiveIntensity={0.15} />
        </RoundedBox>
        <Text position={[0, 0.18, 0]} fontSize={0.12} color="#fecaca" anchorX="center">
          INSULATOR
        </Text>
      </group>
    );
  }

  return <StableLine points={segment.points} color={color} opacity={opacity} />;
}

function ElectronFlow({ points, active }: { points: [number, number, number][]; active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const count = 6;

  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    const t = clock.getElapsedTime() * 0.8;
    ref.current.children.forEach((child, i) => {
      const phase = (t + i / count) % 1;
      const idx = phase * (points.length - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(i0 + 1, points.length - 1);
      const f = idx - i0;
      const p0 = points[i0];
      const p1 = points[i1];
      child.position.set(
        p0[0] + (p1[0] - p0[0]) * f,
        p0[1] + (p1[1] - p0[1]) * f + 0.06,
        p0[2] + (p1[2] - p0[2]) * f,
      );
    });
  });

  if (!active) return null;

  return (
    <group ref={ref}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#fde047" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function BatteryCell({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.55, 0.85, 0.55]} radius={0.08} castShadow>
        <meshStandardMaterial color="#1e40af" roughness={0.45} metalness={0.15} />
      </RoundedBox>
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.12, 16]} />
        <meshStandardMaterial color={COPPER} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.48, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.06, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
      </mesh>
      <Text position={[0, 0.72, 0]} fontSize={0.16} color="#fef08a" anchorX="center" outlineWidth={0.01} outlineColor="#000">
        +
      </Text>
      <Text position={[0, -0.62, 0]} fontSize={0.14} color="#cbd5e1" anchorX="center">
        −
      </Text>
      <Text position={[0, 0.05, 0.32]} fontSize={0.11} color="#93c5fd" anchorX="center">
        {CELL_VOLTAGE}V
      </Text>
      <Text position={[0, -0.95, 0]} fontSize={0.13} color="#94a3b8" anchorX="center">
        CELL
      </Text>
    </group>
  );
}

function SwitchMesh({
  position,
  closed,
  onToggle,
}: {
  position: [number, number, number];
  closed: boolean;
  onToggle?: () => void;
}) {
  const leverRef = useRef<THREE.Mesh>(null);
  const target = closed ? -0.35 : 0.35;

  useFrame((_, delta) => {
    if (leverRef.current) {
      leverRef.current.rotation.z = THREE.MathUtils.lerp(leverRef.current.rotation.z, target, delta * 8);
    }
  });

  return (
    <group position={position}>
      <RoundedBox args={[0.55, 0.28, 0.35]} radius={0.05} castShadow onClick={onToggle}>
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.2} />
      </RoundedBox>
      <mesh position={[-0.18, 0.05, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 10]} />
        <meshStandardMaterial color={COPPER} metalness={0.9} />
      </mesh>
      <mesh ref={leverRef} position={[-0.18, 0.1, 0]} rotation={[0, 0, target]}>
        <boxGeometry args={[0.32, 0.04, 0.06]} />
        <meshStandardMaterial color={closed ? "#22c55e" : "#ef4444"} metalness={0.4} roughness={0.4} />
      </mesh>
      <Text position={[0, -0.28, 0]} fontSize={0.11} color={closed ? "#86efac" : "#fca5a5"} anchorX="center">
        {closed ? "ON" : "OFF"}
      </Text>
      <Text position={[0, 0.32, 0]} fontSize={0.11} color="#94a3b8" anchorX="center">
        SWITCH
      </Text>
    </group>
  );
}

function LabBench() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.08, 0]} receiveShadow castShadow>
        <boxGeometry args={[10, 0.12, 2.8]} />
        <meshStandardMaterial color="#334155" roughness={0.55} metalness={0.08} />
      </mesh>
      {/* Breadboard grid dots */}
      {Array.from({ length: 12 }, (_, i) =>
        Array.from({ length: 4 }, (_, j) => (
          <mesh key={`${i}-${j}`} position={[-2.75 + i * 0.5, 0.01, -0.6 + j * 0.4]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshStandardMaterial color="#475569" metalness={0.5} />
          </mesh>
        )),
      )}
    </group>
  );
}

export function CircuitWorld({
  layout,
  switchClosed,
  bulbCount,
  showInsulator,
  insulatorInPath,
  result,
  onSwitchToggle,
}: {
  layout: CircuitLayout;
  switchClosed: boolean;
  bulbCount: number;
  showInsulator: boolean;
  insulatorInPath: boolean;
  result: CircuitResult;
  onSwitchToggle?: () => void;
}) {
  const geo = useMemo(
    () => buildCircuitGeometry(layout, bulbCount, showInsulator, insulatorInPath),
    [layout, bulbCount, showInsulator, insulatorInPath],
  );

  const live = result.electronsFlow && !insulatorInPath;

  return (
    <group>
      <LabBench />
      <BatteryCell position={geo.cellPos} />
      <SwitchMesh position={geo.switchPos} closed={switchClosed} onToggle={onSwitchToggle} />

      {geo.bulbPositions.map((pos, i) => (
        <group key={i} position={pos}>
          <RealisticBulb brightness={result.bulbBrightness[i] ?? 0} />
        </group>
      ))}

      {geo.wires.map((seg, i) => (
        <group key={i}>
          <WirePath segment={seg} live={live && seg.live && !seg.isInsulator} />
          {!seg.isInsulator && (
            <ElectronFlow points={seg.points} active={live && seg.live} />
          )}
        </group>
      ))}

      {showInsulator && geo.insulatorPos && insulatorInPath && (
        <Text position={[geo.insulatorPos[0], geo.insulatorPos[1] + 0.45, 0]} fontSize={0.11} color="#fca5a5" anchorX="center">
          ✕ blocks current
        </Text>
      )}
    </group>
  );
}
