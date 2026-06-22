"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Sparkles } from "@react-three/drei";
import { TABLE_Y } from "@/data/shape-matching-data";

function createSkyGradientTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, "#7dd3fc");
  gradient.addColorStop(0.28, "#bae6fd");
  gradient.addColorStop(0.52, "#fef9c3");
  gradient.addColorStop(0.78, "#ffedd5");
  gradient.addColorStop(1, "#fdba74");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 4, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function ShapeMatchingBackdrop() {
  const skyMap = useMemo(() => createSkyGradientTexture(), []);

  return (
    <group>
      {/* Gradient sky dome */}
      <mesh renderOrder={-100}>
        <sphereGeometry args={[30, 56, 56]} />
        <meshBasicMaterial map={skyMap} side={THREE.BackSide} depthWrite={false} fog={false} />
      </mesh>

      {/* Soft playroom floor beyond the table */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, TABLE_Y - 0.58, 0]} receiveShadow>
        <circleGeometry args={[18, 80]} />
        <meshStandardMaterial color="#e8d4b8" roughness={0.94} metalness={0} />
      </mesh>

      {/* Warm floor glow ring around the play area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, TABLE_Y - 0.565, 0]}>
        <ringGeometry args={[6.2, 17, 80]} />
        <meshStandardMaterial
          color="#fde68a"
          transparent
          opacity={0.22}
          roughness={1}
          metalness={0}
          depthWrite={false}
        />
      </mesh>

      {/* Gentle floating sparkles — nursery/playroom feel */}
      <Sparkles
        count={60}
        scale={[24, 11, 16]}
        position={[0, 4, 0]}
        size={2.2}
        speed={0.14}
        opacity={0.32}
        color="#fffef5"
      />

      {/* Soft background color accents */}
      {[
        { pos: [-9, 3.5, -6] as const, color: "#fda4af", scale: 1.8 },
        { pos: [10, 4, -5] as const, color: "#a5f3fc", scale: 2.1 },
        { pos: [0, 5.5, -10] as const, color: "#fde68a", scale: 2.6 },
      ].map((blob, i) => (
        <mesh key={i} position={blob.pos} renderOrder={-90}>
          <sphereGeometry args={[blob.scale, 24, 24]} />
          <meshBasicMaterial color={blob.color} transparent opacity={0.12} depthWrite={false} fog={false} />
        </mesh>
      ))}
    </group>
  );
}
