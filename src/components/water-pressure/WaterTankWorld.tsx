"use client";

import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import {
  TANK,
  holeHeight,
  waterSurfaceHeight,
  type TankHole,
} from "@/lib/waterPressurePhysics";
import { RealisticTankWater } from "@/components/water-pressure/RealisticTankWater";
import { RealisticWaterJet } from "@/components/water-pressure/RealisticWaterJet";

const GLASS = {
  color: "#f0f9ff",
  transmission: 0.92,
  thickness: 0.08,
  roughness: 0.04,
  ior: 1.52,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
};

function GlassPanel({
  position,
  args,
}: {
  position: [number, number, number];
  args: [number, number, number];
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshPhysicalMaterial
        {...GLASS}
        transparent
        opacity={0.22}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function DepthRuler() {
  const marks = [0, 0.5, 1, 1.5, 2, 2.5];
  return (
    <group position={[-TANK.width / 2 - 0.12, 0, 0]}>
      {marks.map((m) => (
        <group key={m} position={[0, m, 0.02]}>
          <mesh>
            <boxGeometry args={[0.08, 0.012, 0.02]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          <Text position={[-0.12, 0, 0.02]} fontSize={0.09} color="#94a3b8" anchorX="right">
            {m}m
          </Text>
        </group>
      ))}
    </group>
  );
}

function TankHoleMarker({ hole, fillLevel }: { hole: TankHole; fillLevel: number }) {
  const hy = holeHeight(hole);
  const surface = waterSurfaceHeight(fillLevel);
  const submerged = hy < surface - 0.02;

  return (
    <group position={[TANK.width / 2, hy, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.028, TANK.wall + 0.04, 12]} />
        <meshStandardMaterial
          color={submerged ? "#0c4a6e" : "#475569"}
          emissive={submerged ? "#0369a1" : "#334155"}
          emissiveIntensity={submerged ? 0.35 : 0.1}
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

function CollectionTray() {
  return (
    <group position={[2.2, 0.04, 0]}>
      <RoundedBox args={[3.2, 0.08, 1.4]} radius={0.03} receiveShadow>
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.35} />
      </RoundedBox>
    </group>
  );
}

function LabBench() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color="#3d3024" roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.08, 0]} receiveShadow castShadow>
        <boxGeometry args={[8, 0.12, 2.5]} />
        <meshStandardMaterial color="#5c4228" roughness={0.65} />
      </mesh>
    </group>
  );
}

export function WaterTankWorld({
  fillLevel,
  holes,
}: {
  fillLevel: number;
  holes: TankHole[];
}) {
  const hw = TANK.width / 2;
  const hd = TANK.depth / 2;
  const wall = TANK.wall;

  return (
    <group position={[0, 0.02, 0]}>
      <LabBench />

      <group>
        <mesh position={[0, wall / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[TANK.width, wall, TANK.depth]} />
          <meshPhysicalMaterial {...GLASS} opacity={0.5} />
        </mesh>

        <GlassPanel position={[0, TANK.height / 2, -hd + wall / 2]} args={[TANK.width, TANK.height, wall]} />
        <GlassPanel position={[0, TANK.height / 2, hd - wall / 2]} args={[TANK.width, TANK.height, wall]} />
        <GlassPanel position={[-hw + wall / 2, TANK.height / 2, 0]} args={[wall, TANK.height, TANK.depth]} />
        <GlassPanel position={[hw - wall / 2, TANK.height / 2, 0]} args={[wall, TANK.height, TANK.depth]} />

        <mesh position={[0, TANK.height, 0]}>
          <boxGeometry args={[TANK.width + 0.04, 0.04, TANK.depth + 0.04]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.25} />
        </mesh>

        <RealisticTankWater fillLevel={fillLevel} />
        <DepthRuler />

        <Text position={[0, TANK.height + 0.22, 0]} fontSize={0.14} color="#bae6fd" anchorX="center">
          Open Tank · P = ρgh
        </Text>

        {holes.map((hole) => (
          <group key={hole.id}>
            <TankHoleMarker hole={hole} fillLevel={fillLevel} />
            <RealisticWaterJet hole={hole} fillLevel={fillLevel} />
          </group>
        ))}

        <CollectionTray />
      </group>
    </group>
  );
}
