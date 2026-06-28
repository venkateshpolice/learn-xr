"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TANK, waterSurfaceHeight } from "@/lib/waterPressurePhysics";

const INNER_W = TANK.width - TANK.wall * 2.4;
const INNER_D = TANK.depth - TANK.wall * 2.4;

const _deep = new THREE.Color("#0369a1");
const _shallow = new THREE.Color("#38bdf8");
const _foam = new THREE.Color("#e0f2fe");

export function RealisticTankWater({ fillLevel }: { fillLevel: number }) {
  const targetH = waterSurfaceHeight(fillLevel);
  const smoothH = useRef(Math.max(0.01, targetH));
  const surfaceGroupRef = useRef<THREE.Group>(null);
  const surfaceRef = useRef<THREE.Mesh>(null);
  const causticsRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const shallowRef = useRef<THREE.Mesh>(null);
  const backTintRef = useRef<THREE.Mesh>(null);
  const bodyMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const surfaceMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const surfaceGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(INNER_W * 0.98, INNER_D * 0.98, 48, 28);
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
    return g;
  }, []);

  const baseSurface = useMemo(
    () => Float32Array.from(surfaceGeo.attributes.position.array),
    [surfaceGeo],
  );

  useFrame(({ clock }, delta) => {
    smoothH.current = THREE.MathUtils.lerp(smoothH.current, targetH, delta * 4);
    const h = smoothH.current;
    if (h < 0.02) return;

    const t = clock.getElapsedTime();
    const pos = surfaceGeo.attributes.position;
    const colors = surfaceGeo.attributes.color as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const lx = baseSurface[i * 3];
      const ly = baseSurface[i * 3 + 1];
      const ripple =
        Math.sin(lx * 9 + t * 1.4) * 0.0028 +
        Math.sin(ly * 7 - t * 1.1) * 0.0022 +
        Math.sin((lx + ly) * 5 + t * 0.7) * 0.0015;
      pos.setXYZ(i, lx, ly, ripple);

      const crest = THREE.MathUtils.clamp(ripple * 120 + 0.5, 0, 1);
      const c = _deep.clone().lerp(_shallow, crest * 0.45 + 0.2);
      if (crest > 0.72) c.lerp(_foam, (crest - 0.72) * 1.5);
      colors.setXYZ(i, c.r, c.g, c.b);
    }
    pos.needsUpdate = true;
    colors.needsUpdate = true;
    surfaceGeo.computeVertexNormals();

    if (surfaceGroupRef.current) surfaceGroupRef.current.position.y = h;
    if (surfaceRef.current) surfaceRef.current.position.y = 0;
    if (surfaceMatRef.current) {
      surfaceMatRef.current.emissiveIntensity = 0.06 + Math.sin(t * 1.5) * 0.025;
    }
    if (bodyMatRef.current) {
      bodyMatRef.current.thickness = Math.min(h, 1.4);
      bodyMatRef.current.emissiveIntensity = 0.015 + Math.sin(t * 0.6) * 0.008;
    }
    const bodyH = Math.max(0.02, h - 0.018);
    if (bodyRef.current) {
      bodyRef.current.scale.y = bodyH / TANK.height;
      bodyRef.current.position.y = bodyH / 2;
    }
    if (shallowRef.current) {
      const sh = Math.min(bodyH * 0.28, 0.45);
      shallowRef.current.scale.y = sh / 0.45;
      shallowRef.current.position.y = bodyH * 0.82;
    }
    if (backTintRef.current) {
      backTintRef.current.scale.y = bodyH / TANK.height;
      backTintRef.current.position.y = bodyH / 2;
    }
    if (causticsRef.current) {
      const m = causticsRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = h > 0.2 ? 0.07 + Math.sin(t * 2.2) * 0.025 + Math.sin(t * 3.7 + 1) * 0.015 : 0;
      causticsRef.current.scale.set(1 + Math.sin(t * 1.1) * 0.02, 1, 1 + Math.cos(t * 0.9) * 0.02);
    }
  });

  if (targetH < 0.02 && smoothH.current < 0.02) return null;

  return (
    <group>
      <mesh ref={backTintRef} position={[0, TANK.height / 2, -INNER_D / 2 + 0.015]} renderOrder={0}>
        <planeGeometry args={[INNER_W * 0.98, TANK.height]} />
        <meshBasicMaterial color="#0c4a6e" transparent opacity={0.22} depthWrite={false} />
      </mesh>

      <mesh ref={causticsRef} position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={0}>
        <planeGeometry args={[INNER_W * 0.92, INNER_D * 0.92]} />
        <meshBasicMaterial
          color="#67e8f9"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={bodyRef} position={[0, TANK.height / 2, 0]} renderOrder={1} castShadow receiveShadow>
        <boxGeometry args={[INNER_W, TANK.height, INNER_D]} />
        <meshPhysicalMaterial
          ref={bodyMatRef}
          color="#0284c7"
          emissive="#0c4a6e"
          emissiveIntensity={0.015}
          transmission={0.42}
          thickness={1.4}
          roughness={0.04}
          metalness={0.08}
          ior={1.333}
          transparent
          opacity={0.9}
          attenuationColor="#0369a1"
          attenuationDistance={1.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={shallowRef} position={[0, TANK.height * 0.82, 0]} renderOrder={2}>
        <boxGeometry args={[INNER_W * 0.94, 0.45, INNER_D * 0.94]} />
        <meshPhysicalMaterial
          color="#7dd3fc"
          transmission={0.55}
          thickness={0.12}
          roughness={0.02}
          transparent
          opacity={0.28}
          depthWrite={false}
          ior={1.333}
        />
      </mesh>

      <group ref={surfaceGroupRef} position={[0, smoothH.current, 0]}>
        <mesh ref={surfaceRef} geometry={surfaceGeo} rotation={[-Math.PI / 2, 0, 0]} renderOrder={4}>
          <meshPhysicalMaterial
            ref={surfaceMatRef}
            vertexColors
            color="#7dd3fc"
            emissive="#bae6fd"
            emissiveIntensity={0.06}
            metalness={0.55}
            roughness={0.06}
            transparent
            opacity={0.94}
            transmission={0.2}
            thickness={0.05}
            ior={1.333}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        <mesh position={[0.15, 0.003, 0.08]} rotation={[-Math.PI / 2, 0, 0.35]} renderOrder={5}>
          <planeGeometry args={[INNER_W * 0.55, 0.06]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.18} depthWrite={false} toneMapped={false} />
        </mesh>

        {[
          [INNER_W / 2 - 0.02, -INNER_D / 2 + 0.02],
          [-INNER_W / 2 + 0.02, -INNER_D / 2 + 0.02],
          [INNER_W / 2 - 0.02, INNER_D / 2 - 0.02],
          [-INNER_W / 2 + 0.02, INNER_D / 2 - 0.02],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, -0.008, z]} renderOrder={3}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshPhysicalMaterial
              color="#bae6fd"
              transmission={0.6}
              transparent
              opacity={0.7}
              roughness={0.05}
              ior={1.333}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
