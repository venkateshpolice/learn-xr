"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import type { MachineResult } from "@/lib/simpleMachinesPhysics";
import { computePulleyRig, PULLEY_CFG } from "@/lib/pulleyGeometry";

const WOOD = "#8b5a2b";
const WOOD_DARK = "#5c3d1e";
const METAL = "#a8b4c4";
const METAL_DARK = "#3d4a5c";
const ROPE = "#b8956c";

function CeilingBeam() {
  const { ceilingY } = PULLEY_CFG;
  const beamHalf = 2.4;
  return (
    <group>
      <mesh position={[0, ceilingY + 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[beamHalf * 2, 0.22, 0.38]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.72} metalness={0.05} />
      </mesh>
      <mesh position={[0, ceilingY + 0.24, 0]}>
        <boxGeometry args={[beamHalf * 2 + 0.08, 0.06, 0.42]} />
        <meshStandardMaterial color={WOOD} roughness={0.68} />
      </mesh>
      <mesh position={[0, ceilingY + 1.2, -0.8]} receiveShadow>
        <boxGeometry args={[6, 2.8, 0.12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>
    </group>
  );
}

function PulleyWheel({
  position,
  radius,
  fixed,
}: {
  position: [number, number, number];
  radius: number;
  fixed: boolean;
}) {
  return (
    <group position={position}>
      {fixed && (
        <group position={[0, 0.18, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.1, 0.35, 0.14]} />
            <meshStandardMaterial color={METAL_DARK} metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <torusGeometry args={[0.08, 0.025, 8, 16]} />
            <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      )}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[radius, 0.042, 14, 36]} />
        <meshStandardMaterial color="#2f3d4f" metalness={0.92} roughness={0.18} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.88, radius * 0.88, 0.1, 28]} />
        <meshStandardMaterial color={METAL} metalness={0.88} roughness={0.22} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[radius * 0.72, 0.018, 8, 28]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.045, 0.045, 0.14, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

function MovableBlock({
  position,
  radius,
}: {
  position: [number, number, number];
  radius: number;
}) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.72, 0.1, 0.22]} />
        <meshStandardMaterial color={METAL_DARK} metalness={0.8} roughness={0.28} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.14, 12]} />
        <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.15} />
      </mesh>
      <PulleyWheel position={[0, 0.52, 0]} radius={radius} fixed={false} />
    </group>
  );
}

function LoadCrate({ mass }: { mass: number }) {
  const s = 0.55 + mass * 0.028;
  return (
    <group>
      <mesh position={[0, s / 2 + 0.08, 0]} castShadow>
        <torusGeometry args={[0.1, 0.022, 8, 20]} />
        <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
        <meshStandardMaterial color={METAL_DARK} metalness={0.8} />
      </mesh>
      <RoundedBox args={[s, s, s]} position={[0, -s / 2 + 0.05, 0]} radius={0.04} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#92400e" roughness={0.62} metalness={0.04} />
      </RoundedBox>
      <mesh position={[0, -s / 2 + 0.05, s / 2 + 0.01]}>
        <boxGeometry args={[s * 0.9, s * 0.35, 0.03]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} />
      </mesh>
      <Text position={[0, s * 0.35, 0]} fontSize={0.17} color="#fef3c7" anchorX="center" outlineWidth={0.012} outlineColor="#451a03">
        LOAD
      </Text>
      <Text position={[0, -s - 0.15, 0]} fontSize={0.15} color="#fde68a" anchorX="center">
        {mass.toFixed(1)} kg
      </Text>
    </group>
  );
}

function EffortHand() {
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.22, 0]}>
        <capsuleGeometry args={[0.07, 0.28, 6, 12]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.5} />
      </mesh>
      <Text position={[0, 0.32, 0]} fontSize={0.15} color="#7dd3fc" anchorX="center" outlineWidth={0.01} outlineColor="#0c4a6e">
        PULL ↓
      </Text>
    </group>
  );
}

function RopeAnchor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <torusGeometry args={[0.07, 0.02, 8, 16]} />
        <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  );
}

function updateRopeMesh(mesh: THREE.Mesh, points: [number, number, number][]) {
  if (points.length < 2) return;
  const vecs = points.map((p) => new THREE.Vector3(...p));
  const curve = new THREE.CatmullRomCurve3(vecs, false, "catmullrom", 0.12);
  mesh.geometry.dispose();
  mesh.geometry = new THREE.TubeGeometry(curve, Math.max(56, points.length * 8), 0.028, 10, false);
}

export function PulleyExperiment({
  pulleyCount,
  loadWeight,
  effortPull,
  result,
}: {
  pulleyCount: number;
  loadWeight: number;
  effortPull: number;
  result: MachineResult;
}) {
  const loadRef = useRef<THREE.Group>(null);
  const effortRef = useRef<THREE.Group>(null);
  const ropeRef = useRef<THREE.Mesh>(null);
  const movableRefs = useRef<THREE.Group[]>([]);
  const smoothLift = useRef(0);

  const rig = useMemo(
    () => computePulleyRig(pulleyCount, result.loadLift, effortPull),
    [pulleyCount, result.loadLift, effortPull],
  );

  const fixedWheels = rig.wheels.filter((w) => w.fixed);
  const movableWheels = rig.wheels.filter((w) => !w.fixed);

  const initialRopeGeo = useMemo(() => {
    if (rig.rope.length < 2) return null;
    const vecs = rig.rope.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(vecs, false, "catmullrom", 0.12);
    return new THREE.TubeGeometry(curve, Math.max(56, rig.rope.length * 8), 0.028, 10, false);
  }, [rig.rope]);

  useFrame((_, delta) => {
    smoothLift.current = THREE.MathUtils.lerp(smoothLift.current, result.loadLift, delta * 3);
    const live = computePulleyRig(pulleyCount, smoothLift.current, effortPull);

    if (loadRef.current) loadRef.current.position.set(...live.loadPosition);
    if (effortRef.current) effortRef.current.position.set(...live.effortPosition);
    if (ropeRef.current) updateRopeMesh(ropeRef.current, live.rope);

    const movables = live.wheels.filter((w) => !w.fixed);
    movables.forEach((w, i) => {
      const g = movableRefs.current[i];
      if (g) g.position.set(w.position[0], w.position[1] - 0.52, w.position[2]);
    });
  });

  return (
    <group>
      <CeilingBeam />
      <RopeAnchor position={rig.ropeAnchor} />

      {fixedWheels.map((w) => (
        <PulleyWheel key={w.id} position={w.position} radius={w.radius} fixed />
      ))}

      {movableWheels.map((w, i) => (
        <group
          key={w.id}
          ref={(el) => {
            if (el) movableRefs.current[i] = el;
          }}
          position={[w.position[0], w.position[1] - 0.52, w.position[2]]}
        >
          <MovableBlock position={[0, 0, 0]} radius={w.radius} />
        </group>
      ))}

      {initialRopeGeo && (
        <mesh ref={ropeRef} geometry={initialRopeGeo} castShadow>
          <meshStandardMaterial color={ROPE} roughness={0.92} metalness={0} />
        </mesh>
      )}

      <group ref={loadRef} position={rig.loadPosition}>
        <LoadCrate mass={loadWeight} />
      </group>

      <group ref={effortRef} position={rig.effortPosition}>
        <EffortHand />
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.06, 1.8]} />
        <meshStandardMaterial color="#475569" roughness={0.55} metalness={0.12} />
      </mesh>

      <Text position={[2.1, PULLEY_CFG.ceilingY + 0.55, 0]} fontSize={0.14} color="#94a3b8" anchorX="center">
        {rig.label}
      </Text>
    </group>
  );
}
