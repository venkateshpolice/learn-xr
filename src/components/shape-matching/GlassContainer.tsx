"use client";

import { RoundedBox, Text } from "@react-three/drei";
import { CONTAINER_CENTER, CONTAINER_DIMS, TABLE_Y } from "@/data/shape-matching-data";

const GLASS = {
  color: "#bae6fd",
  roughness: 0.08,
  metalness: 0.05,
  transmission: 0.82,
  thickness: 0.35,
  ior: 1.45,
  opacity: 0.35,
};

export interface ContainerDims {
  width: number;
  height: number;
  depth: number;
}

function GlassPanel({
  args,
  position,
}: {
  args: [number, number, number];
  position: [number, number, number];
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshPhysicalMaterial
        color={GLASS.color}
        transparent
        opacity={GLASS.opacity}
        roughness={GLASS.roughness}
        metalness={GLASS.metalness}
        transmission={GLASS.transmission}
        thickness={GLASS.thickness}
        ior={GLASS.ior}
        side={2}
        depthWrite={false}
      />
    </mesh>
  );
}

interface OpenGlassContainerProps {
  center: [number, number, number];
  dims: ContainerDims;
  label: string;
  pedestal?: boolean;
  chute?: boolean;
  chuteGapY?: number;
  /** Omit one wall so shapes are easy to pick (e.g. "x-" faces the puzzle board). */
  openFace?: "x+" | "x-" | "z+" | "z-";
}

/** Open-top transparent glass box. */
export function OpenGlassContainer({
  center,
  dims,
  label,
  pedestal = false,
  chute = false,
  chuteGapY = 0,
  openFace,
}: OpenGlassContainerProps) {
  const { width: w, height: h, depth: d } = dims;
  const wall = 0.045;

  return (
    <group position={center}>
      {pedestal && (
        <RoundedBox
          args={[w, 0.12, d]}
          radius={0.03}
          position={[0, -h / 2 - 0.06, 0]}
          receiveShadow
          castShadow
        >
          <meshStandardMaterial color="#92400e" roughness={0.75} />
        </RoundedBox>
      )}

      {/* Glass bottom */}
      <mesh position={[0, -h / 2 + wall / 2, 0]} receiveShadow>
        <boxGeometry args={[w, wall, d]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transparent
          opacity={0.55}
          roughness={0.1}
          transmission={0.7}
          thickness={0.2}
          ior={1.45}
        />
      </mesh>

      {/* Glass walls — open top; one side can stay open for picking */}
      <GlassPanel args={[w, h, wall]} position={[0, 0, d / 2 - wall / 2]} />
      <GlassPanel args={[w, h, wall]} position={[0, 0, -d / 2 + wall / 2]} />
      {openFace !== "x+" && <GlassPanel args={[wall, h, d]} position={[w / 2 - wall / 2, 0, 0]} />}
      {openFace !== "x-" && <GlassPanel args={[wall, h, d]} position={[-w / 2 + wall / 2, 0, 0]} />}

      {/* Rim highlight */}
      <RoundedBox args={[w + 0.02, 0.028, d + 0.02]} radius={0.012} position={[0, h / 2, 0]}>
        <meshStandardMaterial
          color="#e0f2fe"
          roughness={0.2}
          metalness={0.35}
          emissive="#7dd3fc"
          emissiveIntensity={0.15}
        />
      </RoundedBox>

      <Text
        position={[0, h / 2 + 0.14, 0]}
        fontSize={0.11}
        color="#0369a1"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {chute && chuteGapY > 0 && (
        <mesh position={[0, chuteGapY / 2, 0]}>
          <boxGeometry args={[w * 0.72, chuteGapY, w * 0.38]} />
          <meshPhysicalMaterial
            color="#dbeafe"
            transparent
            opacity={0.18}
            roughness={0.05}
            transmission={0.8}
            thickness={0.12}
            side={2}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

/** Collection jar below the puzzle board. */
export default function GlassContainer() {
  const h = CONTAINER_DIMS.height;
  const gapY = TABLE_Y - CONTAINER_CENTER[1] - h / 2;

  return (
    <OpenGlassContainer
      center={CONTAINER_CENTER}
      dims={CONTAINER_DIMS}
      label="Collection Jar"
      pedestal
      chute
      chuteGapY={gapY}
    />
  );
}
