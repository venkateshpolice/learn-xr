"use client";

import { useMemo } from "react";
import { Text } from "@react-three/drei";
import { BOARD, GRID } from "@/lib/circuitBuilder";

const HOLE_SP = 0.11;
const ROW_GROUPS = 7;

function springHole(x: number, z: number, y: number) {
  return (
    <group key={`${x}-${z}`} position={[x, y, z]}>
      <mesh position={[0, -0.012, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.022, 10]} />
        <meshStandardMaterial color="#2d3748" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.002, 0]}>
        <torusGeometry args={[0.013, 0.003, 8, 16]} />
        <meshStandardMaterial color="#718096" metalness={0.75} roughness={0.25} />
      </mesh>
    </group>
  );
}

export function RealisticBreadboard() {
  const holes = useMemo(() => {
    const list: [number, number, number][] = [];
    const surfaceY = BOARD.surfaceOffset;

    for (let row = 0; row < ROW_GROUPS; row++) {
      const z = -0.88 + row * HOLE_SP * 1.05;
      for (let col = 0; col < 5; col++) {
        const xLeft = -1.05 - col * HOLE_SP;
        const xRight = 1.05 + col * HOLE_SP;
        list.push([xLeft, surfaceY, z], [xRight, surfaceY, z]);
      }
    }

    for (let i = 0; i < 36; i++) {
      const t = i / 35;
      const x = -1.85 + t * 3.7;
      list.push([x, surfaceY, 1.28], [x, surfaceY, -1.28]);
    }

    return list;
  }, []);

  const sy = BOARD.surfaceOffset;

  return (
    <group position={[0, BOARD.originY, 0]}>
      <mesh position={[0, -0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[10.2, 0.18, 3.8]} />
        <meshStandardMaterial color="#6b4e2e" roughness={0.78} metalness={0.03} />
      </mesh>
      <mesh position={[0, -0.015, 0]} receiveShadow>
        <boxGeometry args={[9.9, 0.03, 3.55]} />
        <meshStandardMaterial color="#8f6a42" roughness={0.62} metalness={0.05} />
      </mesh>

      <mesh position={[0, 0.028, 0]} castShadow receiveShadow>
        <boxGeometry args={[9.4, 0.09, 3.15]} />
        <meshStandardMaterial color="#ddd4c0" roughness={0.52} metalness={0.02} />
      </mesh>
      <mesh position={[0, sy + 0.004, 0]} receiveShadow>
        <boxGeometry args={[9.15, 0.012, 2.95]} />
        <meshStandardMaterial color="#f2ead8" roughness={0.42} metalness={0.01} />
      </mesh>

      {[
        [0, sy + 0.008, 1.52, 9.0, 0.018, 0.06],
        [0, sy + 0.008, -1.52, 9.0, 0.018, 0.06],
        [-4.55, sy + 0.008, 0, 0.06, 0.018, 2.9],
        [4.55, sy + 0.008, 0, 0.06, 0.018, 2.9],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#c9bc9e" roughness={0.55} />
        </mesh>
      ))}

      <mesh position={[0, sy - 0.008, 0]}>
        <boxGeometry args={[0.14, 0.035, 2.75]} />
        <meshStandardMaterial color="#1a202c" roughness={0.85} />
      </mesh>

      <mesh position={[0, sy + 0.006, 1.35]}>
        <boxGeometry args={[8.8, 0.014, 0.18]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.45} metalness={0.08} />
      </mesh>
      <mesh position={[0, sy + 0.006, -1.35]}>
        <boxGeometry args={[8.8, 0.014, 0.18]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.45} metalness={0.08} />
      </mesh>
      <Text position={[-4.1, sy + 0.04, 1.35]} fontSize={0.09} color="#fecaca" anchorX="center">
        +
      </Text>
      <Text position={[-4.1, sy + 0.04, -1.35]} fontSize={0.09} color="#bfdbfe" anchorX="center">
        −
      </Text>

      {holes.map(([x, y, z]) => springHole(x, z, y))}

      <Text position={[0, sy + 0.42, -1.95]} fontSize={0.12} color="#94a3b8" anchorX="center">
        Solderless breadboard · drag parts here
      </Text>
    </group>
  );
}

export function BoardSnapGrid() {
  const markers: [number, number, number][] = [];
  for (let x = GRID.minX; x <= GRID.maxX; x += GRID.step) {
    for (let z = GRID.minZ; z <= GRID.maxZ; z += GRID.step) {
      markers.push([x, BOARD.surfaceY + 0.002, z]);
    }
  }
  return (
    <group>
      {markers.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.04, 0.055, 16]} />
          <meshBasicMaterial color="#c9bc9e" transparent opacity={0.12} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
