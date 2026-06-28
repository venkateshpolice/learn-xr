"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function wirePath(from: [number, number, number], to: [number, number, number]): THREE.Vector3[] {
  const midY = Math.max(from[1], to[1]) + 0.1;
  return [
    new THREE.Vector3(...from),
    new THREE.Vector3(from[0], midY, from[2]),
    new THREE.Vector3(to[0], midY, to[2]),
    new THREE.Vector3(...to),
  ];
}

export function ConductorWire({
  from,
  to,
  live,
}: {
  from: [number, number, number];
  to: [number, number, number];
  live: boolean;
}) {
  const electronsRef = useRef<THREE.Group>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(wirePath(from, to), false, "catmullrom", 0.35), [from, to]);
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 32, 0.028, 8, false), [curve]);

  const samplePoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) pts.push(curve.getPoint(i / 24));
    return pts;
  }, [curve]);

  useFrame(({ clock }) => {
    if (!electronsRef.current || !live) return;
    const t = clock.getElapsedTime() * 0.9;
    const count = electronsRef.current.children.length;
    electronsRef.current.children.forEach((child, i) => {
      const phase = (t + i / count) % 1;
      const p = curve.getPoint(phase);
      child.position.copy(p);
    });
  });

  return (
    <group>
      <mesh geometry={tubeGeo} castShadow>
        <meshStandardMaterial
          color={live ? "#c9892b" : "#64748b"}
          emissive={live ? "#fbbf24" : "#000000"}
          emissiveIntensity={live ? 0.55 : 0}
          metalness={0.85}
          roughness={live ? 0.28 : 0.55}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={tubeGeo}>
        <meshBasicMaterial
          color={live ? "#fde68a" : "#475569"}
          transparent
          opacity={live ? 0.18 : 0.08}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      {live && (
        <group ref={electronsRef}>
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.022, 6, 6]} />
              <meshBasicMaterial color="#fef08a" toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}
      {/* Terminal ferrules at each end */}
      {[from, to].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial
            color={live ? "#b87333" : "#64748b"}
            emissive={live ? "#f59e0b" : "#000000"}
            emissiveIntensity={live ? 0.4 : 0}
            metalness={0.9}
            roughness={0.25}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
