"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import type { MachineType } from "@/data/simple-machines-stages";
import type { MachineResult } from "@/lib/simpleMachinesPhysics";
import { BEAM_HALF } from "@/lib/simpleMachinesPhysics";
import { StableLine } from "@/components/three/StableLine";
import { PulleyExperiment } from "@/components/simple-machines/PulleyExperiment";

const WOOD = "#8b5a2b";
const WOOD_DARK = "#5c3d1e";
const METAL = "#94a3b8";
const METAL_DARK = "#475569";

function WeightBlock({
  position,
  mass,
  color,
  label,
  scale = 1,
}: {
  position: [number, number, number];
  mass: number;
  color: string;
  label: string;
  scale?: number;
}) {
  const s = 0.35 + mass * 0.045 * scale;
  return (
    <group position={position}>
      <RoundedBox args={[s, s, s]} radius={0.06} smoothness={4} castShadow>
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.08} />
      </RoundedBox>
      <Text
        position={[0, s * 0.65, 0]}
        fontSize={0.22}
        color="#f8fafc"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#0f172a"
      >
        {label}
      </Text>
      <Text
        position={[0, -s * 0.55, 0]}
        fontSize={0.16}
        color="#cbd5e1"
        anchorX="center"
        anchorY="middle"
      >
        {mass.toFixed(1)} kg
      </Text>
    </group>
  );
}

function LeverMachine({
  fulcrumPos,
  loadWeight,
  effortWeight,
  result,
}: {
  fulcrumPos: number;
  loadWeight: number;
  effortWeight: number;
  result: MachineResult;
}) {
  const beamRef = useRef<THREE.Group>(null);
  const smoothTilt = useRef(0);
  const fulcrumX = -BEAM_HALF + fulcrumPos * BEAM_HALF * 2;

  useFrame((_, delta) => {
    smoothTilt.current = THREE.MathUtils.lerp(smoothTilt.current, result.leverTilt, delta * 4);
    if (beamRef.current) beamRef.current.rotation.z = smoothTilt.current;
  });

  return (
    <group position={[0, 0.55, 0]}>
      {/* Fulcrum wedge */}
      <mesh position={[fulcrumX, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.85, 0.5, 3]} />
        <meshStandardMaterial color={METAL_DARK} metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[fulcrumX, -0.12, 0]}>
        <boxGeometry args={[0.35, 0.08, 0.55]} />
        <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.18} />
      </mesh>

      <group ref={beamRef} position={[fulcrumX, 0, 0]}>
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[BEAM_HALF * 2, 0.14, 0.55]} />
          <meshStandardMaterial color={WOOD} roughness={0.72} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[BEAM_HALF * 2, 0.03, 0.58]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
        </mesh>

        <WeightBlock
          position={[-BEAM_HALF + 0.35, 0.45, 0]}
          mass={effortWeight}
          color="#38bdf8"
          label="EFFORT"
        />
        <WeightBlock
          position={[BEAM_HALF - 0.35, 0.45, 0]}
          mass={loadWeight}
          color="#f97316"
          label="LOAD"
        />
      </group>

      <StableLine
        points={[
          [fulcrumX, -0.55, 0],
          [fulcrumX, 1.8, 0],
        ]}
        color="#64748b"
        opacity={0.35}
      />
    </group>
  );
}

function InclinedMachine({
  rampAngle,
  blockWeight,
  effortWeight,
  result,
}: {
  rampAngle: number;
  blockWeight: number;
  effortWeight: number;
  result: MachineResult;
}) {
  const rad = (rampAngle * Math.PI) / 180;
  const rampLen = result.rampLength || 7.5;
  const blockRef = useRef<THREE.Group>(null);
  const slideRef = useRef(0.35);

  useFrame((_, delta) => {
    slideRef.current = THREE.MathUtils.lerp(
      slideRef.current,
      0.35 + result.loadLift * (rampLen - 1.2),
      delta * 2.5,
    );
    if (blockRef.current) {
      blockRef.current.position.x = Math.cos(rad) * slideRef.current - rampLen / 2 + 0.5;
      blockRef.current.position.y = Math.sin(rad) * slideRef.current + 0.12;
    }
  });

  const blockDist = slideRef.current;
  const blockX = Math.cos(rad) * blockDist - rampLen / 2 + 0.5;
  const blockY = Math.sin(rad) * blockDist + 0.12;
  const pushX = blockX - 0.9 * Math.cos(rad);
  const pushY = blockY - 0.9 * Math.sin(rad);

  return (
    <group position={[0, 0, 0]}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.85} />
      </mesh>

      {/* Ramp */}
      <group position={[-rampLen / 2, 0, 0]} rotation={[0, 0, rad]}>
        <mesh position={[rampLen / 2, 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[rampLen, 0.16, 2.4]} />
          <meshStandardMaterial color={WOOD} roughness={0.68} metalness={0.04} />
        </mesh>
        {/* Side rails */}
        <mesh position={[rampLen / 2, 0.22, 1.05]}>
          <boxGeometry args={[rampLen, 0.06, 0.08]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.75} />
        </mesh>
        <mesh position={[rampLen / 2, 0.22, -1.05]}>
          <boxGeometry args={[rampLen, 0.06, 0.08]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.75} />
        </mesh>
      </group>

      {/* Block on ramp */}
      <group ref={blockRef} position={[blockX, blockY, 0]} rotation={[0, 0, rad]}>
        <RoundedBox args={[0.75, 0.75, 0.75]} radius={0.05} castShadow>
          <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.15} />
        </RoundedBox>
        <Text position={[0, 0.55, 0]} fontSize={0.17} color="#f1f5f9" anchorX="center">
          BOX
        </Text>
        <Text position={[0, -0.5, 0]} fontSize={0.14} color="#cbd5e1" anchorX="center">
          {blockWeight.toFixed(1)} kg
        </Text>
      </group>

      {/* Effort push arrow along ramp */}
      <group position={[pushX, pushY, 0.5]} rotation={[0, 0, rad]}>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.15, 0.35, 4]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.35} />
        </mesh>
        <Text position={[-0.35, 0.15, 0]} fontSize={0.15} color="#7dd3fc" anchorX="center">
          {effortWeight.toFixed(1)} kg
        </Text>
      </group>

      {/* Height indicator */}
      <StableLine
        points={[
          [rampLen / 2 - 0.2, 0, 0.5],
          [rampLen / 2 - 0.2, result.rampHeight, 0.5],
        ]}
        color="#fbbf24"
        opacity={0.6}
      />
    </group>
  );
}

function Workbench() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[18, 10]} />
      <meshStandardMaterial color="#1e293b" roughness={0.55} metalness={0.1} />
    </mesh>
  );
}

export function SimpleMachinesWorld({
  machine,
  fulcrumPos,
  loadWeight,
  effortWeight,
  pulleyCount,
  effortPull,
  rampAngle,
  blockWeight,
  result,
}: {
  machine: MachineType;
  fulcrumPos: number;
  loadWeight: number;
  effortWeight: number;
  pulleyCount: number;
  effortPull: number;
  rampAngle: number;
  blockWeight: number;
  result: MachineResult;
}) {
  return (
    <group>
      {machine !== "pulley" && <Workbench />}
      {machine === "lever" && (
        <LeverMachine
          fulcrumPos={fulcrumPos}
          loadWeight={loadWeight}
          effortWeight={effortWeight}
          result={result}
        />
      )}
      {machine === "pulley" && (
        <PulleyExperiment
          pulleyCount={pulleyCount}
          loadWeight={loadWeight}
          effortPull={effortPull}
          result={result}
        />
      )}
      {machine === "inclined" && (
        <InclinedMachine
          rampAngle={rampAngle}
          blockWeight={blockWeight}
          effortWeight={effortWeight}
          result={result}
        />
      )}
    </group>
  );
}
