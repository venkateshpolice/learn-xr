"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { TANK, G, jetSpeed, holeHeight, type TankHole } from "@/lib/waterPressurePhysics";

const JET_PARTICLES = 90;

function buildJetCurve(exitX: number, hy: number, speed: number, maxT: number): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  const vx = speed * 0.95;
  for (let i = 0; i <= 24; i++) {
    const t = (i / 24) * maxT;
    pts.push(new THREE.Vector3(exitX + vx * t, hy - 0.5 * G * t * t, 0));
  }
  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.25);
}

export function RealisticWaterJet({
  hole,
  fillLevel,
}: {
  hole: TankHole;
  fillLevel: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const hy = holeHeight(hole);
  const exitX = TANK.width / 2 + 0.02;
  const speed = jetSpeed(fillLevel, hole);
  const flowing = speed > 0.05;
  const maxT = 0.5 + speed * 0.11;
  const landX = exitX + speed * 0.95 * maxT;
  const landY = Math.max(0.02, hy - 0.5 * G * maxT * maxT);

  const streamCurve = useMemo(
    () => buildJetCurve(exitX, hy, speed, maxT),
    [exitX, hy, speed, maxT],
  );
  const tubeGeo = useMemo(
    () => new THREE.TubeGeometry(streamCurve, 32, 0.012 + speed * 0.002, 8, false),
    [streamCurve, speed],
  );

  const positions = useMemo(() => new Float32Array(JET_PARTICLES * 3), []);
  const velocities = useMemo(() => {
    const v = new Float32Array(JET_PARTICLES * 3);
    for (let i = 0; i < JET_PARTICLES; i++) {
      v[i * 3] = speed * (0.82 + Math.random() * 0.35);
      v[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
      v[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }
    return v;
  }, [speed]);

  const ages = useMemo(() => {
    const a = new Float32Array(JET_PARTICLES);
    for (let i = 0; i < JET_PARTICLES; i++) a[i] = Math.random();
    return a;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current || !flowing) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < JET_PARTICLES; i++) {
      ages[i] += delta * (1 + (i % 7) * 0.06);
      if (ages[i] > maxT) ages[i] = Math.random() * 0.05;

      const t = ages[i];
      const vx = velocities[i * 3];
      const vy = velocities[i * 3 + 1];
      pos[i * 3] = exitX + vx * t;
      pos[i * 3 + 1] = hy + vy * t - 0.5 * G * t * t;
      pos[i * 3 + 2] = velocities[i * 3 + 2] * t;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!flowing) return null;

  return (
    <group>
      <mesh geometry={tubeGeo} renderOrder={6}>
        <meshPhysicalMaterial
          color="#38bdf8"
          emissive="#0ea5e9"
          emissiveIntensity={0.15}
          transmission={0.35}
          thickness={0.08}
          transparent
          opacity={0.75}
          roughness={0.05}
          metalness={0.1}
          ior={1.333}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={tubeGeo} renderOrder={7}>
        <meshBasicMaterial color="#e0f2fe" transparent opacity={0.2} depthWrite={false} toneMapped={false} />
      </mesh>

      <points ref={ref} renderOrder={8}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} count={JET_PARTICLES} />
        </bufferGeometry>
        <pointsMaterial
          color="#bae6fd"
          size={0.035 + speed * 0.004}
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      <mesh position={[exitX, hy, 0]}>
        <sphereGeometry args={[0.032, 12, 12]} />
        <meshPhysicalMaterial
          color="#0ea5e9"
          emissive="#0284c7"
          emissiveIntensity={0.35}
          roughness={0.15}
          metalness={0.05}
          transmission={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[landX, landY, 0]} renderOrder={2}>
        <ringGeometry args={[0.04, 0.12 + speed * 0.015, 24]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.35} depthWrite={false} toneMapped={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[landX, 0.012, 0]}>
        <circleGeometry args={[0.06 + speed * 0.025, 24]} />
        <meshPhysicalMaterial
          color="#0284c7"
          metalness={0.55}
          roughness={0.08}
          transparent
          opacity={0.55}
          transmission={0.25}
          depthWrite={false}
        />
      </mesh>

      <Text position={[exitX + 0.35, hy + 0.12, 0]} fontSize={0.08} color="#7dd3fc" anchorX="left">
        {speed.toFixed(1)} m/s
      </Text>
    </group>
  );
}
