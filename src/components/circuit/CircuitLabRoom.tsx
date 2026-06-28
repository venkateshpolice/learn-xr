"use client";

import { GRID, BOARD } from "@/lib/circuitBuilder";

export function CircuitLabRoom() {
  return (
    <group>
      <mesh position={[0, 1.35, -2.6]} receiveShadow>
        <planeGeometry args={[10.5, 3.8]} />
        <meshStandardMaterial color="#121a28" roughness={0.88} metalness={0.04} />
      </mesh>

      <mesh position={[-3.2, 0.55, -2.55]}>
        <boxGeometry args={[0.9, 1.1, 0.12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      <mesh position={[3.2, 0.55, -2.55]}>
        <boxGeometry args={[0.9, 1.1, 0.12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {[-2.2, 0, 2.2].map((x) => (
        <group key={x} position={[x, 3.1, 0.8]}>
          <mesh castShadow>
            <boxGeometry args={[1.1, 0.06, 0.28]} />
            <meshStandardMaterial
              color="#fef3c7"
              emissive="#fbbf24"
              emissiveIntensity={0.55}
              toneMapped={false}
            />
          </mesh>
          <pointLight color="#fde68a" intensity={0.25} distance={5} decay={2} />
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, BOARD.originY - 0.22, 0]} receiveShadow>
        <planeGeometry args={[14, 5]} />
        <meshStandardMaterial color="#3d3024" roughness={0.88} metalness={0.02} />
      </mesh>
    </group>
  );
}
