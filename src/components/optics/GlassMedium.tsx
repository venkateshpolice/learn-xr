"use client";

import { Suspense, useMemo } from "react";
import { MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { StableLine } from "@/components/three/StableLine";
import type { OpticsMode } from "@/data/optics-stages";

interface GlassMediumProps {
  mode: OpticsMode;
  materialId: string;
  materialColor: string;
  ior: number;
  inverted?: boolean;
}

interface GlassProfile {
  tint: string;
  attenuation: string;
  attenuationDistance: number;
  thickness: number;
  chromaticAberration: number;
  anisotropy: number;
  anisotropicBlur: number;
  roughness: number;
  distortion: number;
  envIntensity: number;
}

const GLASS_PROFILES: Record<string, GlassProfile> = {
  water: {
    tint: "#e8f7ff",
    attenuation: "#0284c7",
    attenuationDistance: 1.8,
    thickness: 1.1,
    chromaticAberration: 0.025,
    anisotropy: 0.08,
    anisotropicBlur: 0.08,
    roughness: 0.02,
    distortion: 0.04,
    envIntensity: 1.1,
  },
  glass: {
    tint: "#f8fafc",
    attenuation: "#cbd5e1",
    attenuationDistance: 3.5,
    thickness: 0.85,
    chromaticAberration: 0.055,
    anisotropy: 0.18,
    anisotropicBlur: 0.12,
    roughness: 0.01,
    distortion: 0.06,
    envIntensity: 1.6,
  },
  diamond: {
    tint: "#ffffff",
    attenuation: "#e2e8f0",
    attenuationDistance: 5,
    thickness: 0.55,
    chromaticAberration: 0.14,
    anisotropy: 0.35,
    anisotropicBlur: 0.18,
    roughness: 0,
    distortion: 0.1,
    envIntensity: 2.2,
  },
};

const DEFAULT_PROFILE = GLASS_PROFILES.glass;

function GlassBlock({
  materialId,
  ior,
  inverted,
}: {
  materialId: string;
  ior: number;
  inverted?: boolean;
}) {
  const profile = GLASS_PROFILES[materialId] ?? DEFAULT_PROFILE;
  const y = inverted ? 1.55 : -1.55;
  const interfaceY = inverted ? -1.55 : 1.55;

  return (
    <group>
      {/* Main transmission body — top/bottom face sits exactly on y=0 interface */}
      <RoundedBox args={[9, 3.1, 2.6]} position={[0, y, 0]} radius={0.14} smoothness={6}>
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.35}
          backsideEnvMapIntensity={profile.envIntensity}
          samples={6}
          resolution={512}
          backsideResolution={256}
          transmission={1}
          thickness={profile.thickness}
          chromaticAberration={profile.chromaticAberration}
          anisotropy={profile.anisotropy}
          anisotropicBlur={profile.anisotropicBlur}
          distortion={profile.distortion}
          distortionScale={0.3}
          temporalDistortion={0.06}
          ior={ior}
          color={profile.tint}
          roughness={profile.roughness}
          metalness={0}
          attenuationColor={profile.attenuation}
          attenuationDistance={profile.attenuationDistance}
        />
      </RoundedBox>

      {/* Fresnel edge shell — bright rim catch light */}
      <RoundedBox args={[9.04, 3.14, 2.64]} position={[0, y, 0]} radius={0.15} smoothness={6}>
        <meshPhysicalMaterial
          transparent
          opacity={0.22}
          transmission={0.92}
          thickness={0.15}
          ior={ior}
          roughness={0}
          metalness={0}
          color="#ffffff"
          side={THREE.BackSide}
          envMapIntensity={profile.envIntensity * 0.8}
          depthWrite={false}
        />
      </RoundedBox>

      {/* Interface face highlight — polished surface at y=0 */}
      <mesh position={[0, interfaceY, 0]} rotation={inverted ? [Math.PI / 2, 0, 0] : [-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.6, 2.4]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          metalness={0.2}
          roughness={0.02}
          transmission={0.4}
          thickness={0.1}
          ior={ior}
          envMapIntensity={1.8}
          depthWrite={false}
        />
      </mesh>

      {/* Subtle caustic pool beneath refracted region */}
      {!inverted && (
        <mesh position={[1.2, -2.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.1, 32]} />
          <meshBasicMaterial
            color={profile.tint}
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}

function GlassPedestal({ inverted }: { inverted?: boolean }) {
  const y = inverted ? -0.15 : 0.15;
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, inverted ? 0.08 : -0.08, 0]}>
        <boxGeometry args={[10, 0.12, 3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, inverted ? 0.16 : -0.16, 0]}>
        <boxGeometry args={[10.2, 0.04, 3.2]} />
        <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.15} envMapIntensity={0.6} />
      </mesh>
    </group>
  );
}

function MirrorSurface() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshPhysicalMaterial
          color="#eef2f7"
          metalness={1}
          roughness={0.02}
          reflectivity={1}
          envMapIntensity={1.8}
          clearcoat={1}
          clearcoatRoughness={0.03}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

export function GlassMedium({ mode, materialId, materialColor, ior, inverted }: GlassMediumProps) {
  const profile = useMemo(() => GLASS_PROFILES[materialId] ?? DEFAULT_PROFILE, [materialId]);

  if (mode === "reflection") {
    return <MirrorSurface />;
  }

  return (
    <group>
      <GlassPedestal inverted={inverted} />

      {/* Air side backdrop for contrast */}
      <mesh position={[0, inverted ? -2.4 : 2.4, -1.2]}>
        <planeGeometry args={[14, 5]} />
        <meshBasicMaterial color="#0c1929" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      <Suspense fallback={null}>
        <GlassBlock materialId={materialId} ior={ior} inverted={inverted} />
      </Suspense>

      {/* Interface marker */}
      <StableLine points={[[-7, 0, 0], [7, 0, 0]]} color={profile.tint} opacity={0.65} />

      {/* Material label tint on block edge */}
      <mesh position={[4.55, inverted ? 1.55 : -1.55, 0]}>
        <planeGeometry args={[0.04, 2.8]} />
        <meshBasicMaterial color={materialColor} transparent opacity={0.35} toneMapped={false} />
      </mesh>
    </group>
  );
}
