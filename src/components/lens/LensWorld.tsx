"use client";

import { Suspense, useMemo } from "react";
import { MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { LensType } from "@/lib/lensPhysics";
import { buildLensProfile2D, lensHolderRadius } from "@/lib/lensGeometry";
import { getFocalLength } from "@/lib/lensPhysics";
import { StableLine } from "@/components/three/StableLine";

function LensMesh({ lensType }: { lensType: LensType }) {
  const profile = useMemo(() => {
    return buildLensProfile2D(lensType, 32).map(({ x, y }) => new THREE.Vector2(x, y));
  }, [lensType]);

  const geometry = useMemo(() => {
    const geo = new THREE.LatheGeometry(profile, 40);
    geo.rotateY(Math.PI / 2);
    return geo;
  }, [profile]);

  const holderR = lensHolderRadius(lensType);
  const isConcave = lensType === "concave";

  return (
    <group>
      <Suspense
        fallback={
          <mesh geometry={geometry}>
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={0.92}
              thickness={0.4}
              roughness={0.04}
              ior={1.52}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
        }
      >
        <mesh geometry={geometry} castShadow receiveShadow>
          <MeshTransmissionMaterial
            backside
            backsideThickness={0.3}
            backsideEnvMapIntensity={1.4}
            samples={4}
            resolution={256}
            backsideResolution={128}
            transmission={1}
            thickness={0.42}
            chromaticAberration={0.04}
            anisotropy={0.12}
            anisotropicBlur={0.08}
            ior={1.52}
            color="#ffffff"
            roughness={0.01}
            metalness={0}
            attenuationColor="#f8fafc"
            attenuationDistance={7}
          />
        </mesh>
      </Suspense>

      {/* Fresnel rim — bright white edge catch */}
      <mesh geometry={geometry} scale={1.018}>
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          transmission={0.96}
          thickness={0.1}
          ior={1.52}
          roughness={0}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.04}
          side={THREE.BackSide}
          envMapIntensity={1.5}
          depthWrite={false}
        />
      </mesh>

      {/* Subtle front specular veil */}
      <mesh geometry={geometry} scale={1.008}>
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.06}
          transmission={0.85}
          thickness={0.05}
          ior={1.52}
          roughness={0}
          metalness={0}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[holderR, 0.06, 8, 40]} />
        <meshStandardMaterial color={isConcave ? "#64748b" : "#475569"} metalness={0.85} roughness={0.2} />
      </mesh>
      {isConcave && (
        <>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 1.85, 0]}>
            <torusGeometry args={[holderR * 0.92, 0.045, 6, 32]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -1.85, 0]}>
            <torusGeometry args={[holderR * 0.92, 0.045, 6, 32]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.25} />
          </mesh>
        </>
      )}
    </group>
  );
}

function ObjectArrow({ x, height, color = "#f97316" }: { x: number; height: number; color?: string }) {
  const h = Math.max(height, 0.2);
  return (
    <group position={[x, 0, 0]}>
      {/* Stand */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Arrow shaft */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[0.08, h, 0.08]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {/* Arrow head */}
      <mesh position={[0, h + 0.18, 0]}>
        <coneGeometry args={[0.22, 0.38, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      {/* Object label dot */}
      <mesh position={[0, h + 0.45, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#fff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function ImageArrow({
  x,
  height,
  isVirtual,
  isInverted,
}: {
  x: number;
  height: number;
  isVirtual: boolean;
  isInverted: boolean;
}) {
  const h = Math.abs(height);
  const opacity = isVirtual ? 0.55 : 0.85;
  const color = isVirtual ? "#a78bfa" : "#4ade80";

  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, (isInverted ? -1 : 1) * (h / 2), 0]}>
        <boxGeometry args={[0.07, h, 0.07]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          emissive={color}
          emissiveIntensity={isVirtual ? 0.5 : 0.25}
        />
      </mesh>
      <mesh
        position={[0, (isInverted ? -1 : 1) * (h + 0.18), 0]}
        rotation={[0, 0, isInverted ? Math.PI : 0]}
      >
        <coneGeometry args={[0.2, 0.35, 4]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {isVirtual && (
        <mesh position={[x > 0 ? -0.5 : 0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[0.02, 3]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.2} />
        </mesh>
      )}
    </group>
  );
}

function ProjectionScreen({ x, show, imageHeight }: { x: number; show: boolean; imageHeight: number }) {
  if (!show) return null;
  return (
    <group position={[x, 0, -0.5]}>
      <RoundedBox args={[0.08, 4.5, 3.2]} radius={0.04}>
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} metalness={0} />
      </RoundedBox>
      {/* Projected image glow on screen */}
      <mesh position={[0.05, 0, 0]}>
        <planeGeometry args={[0.01, Math.abs(imageHeight) * 1.2, 1]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.15} toneMapped={false} />
      </mesh>
    </group>
  );
}

function FocalMarker({ x, label }: { x: number; label: string }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#fbbf24" toneMapped={false} />
      </mesh>
      <StableLine
        points={[
          [0, -0.3, 0],
          [0, 0.3, 0],
        ]}
        color="#fbbf24"
        opacity={0.5}
      />
    </group>
  );
}

function RayBundle({ rays }: { rays: { points: [number, number, number][]; color: string; dashed?: boolean }[] }) {
  return (
    <>
      {rays.map((ray, i) => (
        <StableLine key={`${i}-${ray.color}-${ray.dashed}`} points={ray.points} color={ray.color} opacity={ray.dashed ? 0.35 : 0.75} />
      ))}
    </>
  );
}

function OpticalBench() {
  return (
    <group position={[0, -1.2, 0]}>
      <mesh>
        <boxGeometry args={[18, 0.15, 2.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Distance scale ticks */}
      {Array.from({ length: 17 }, (_, i) => i - 8).map((x) => (
        <mesh key={x} position={[x, 0.1, 0.85]}>
          <boxGeometry args={[0.02, 0.08, 0.02]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}
    </group>
  );
}

export function LensWorld({
  lensType,
  objectDistance,
  objectHeight,
  result,
}: {
  lensType: LensType;
  objectDistance: number;
  objectHeight: number;
  result: ReturnType<typeof import("@/lib/lensPhysics").computeLensImage>;
}) {
  const f = getFocalLength();
  const objectX = -objectDistance;

  return (
    <group>
      <OpticalBench />

      {/* Optical axis */}
      <StableLine
        points={[
          [-10, 0, 0],
          [10, 0, 0],
        ]}
        color="#64748b"
        opacity={0.35}
      />

      <LensMesh lensType={lensType} />
      <FocalMarker x={-f} label="F" />
      <FocalMarker x={f} label="F'" />

      <ObjectArrow x={objectX} height={objectHeight} />

      {!Number.isFinite(result.di) ? null : (
        <>
          <ImageArrow
            x={result.imageX}
            height={result.imageHeight}
            isVirtual={result.isVirtual}
            isInverted={result.isInverted}
          />
          <ProjectionScreen
            x={result.isReal ? result.imageX : f * 2.2}
            show={result.isReal}
            imageHeight={result.imageHeight}
          />
        </>
      )}

      <RayBundle rays={result.rays} />
    </group>
  );
}