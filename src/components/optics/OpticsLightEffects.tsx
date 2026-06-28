"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const _dir = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _quat = new THREE.Quaternion();

function aimGroup(group: THREE.Group, from: THREE.Vector3, to: THREE.Vector3) {
  _dir.subVectors(to, from);
  const len = _dir.length();
  if (len < 1e-6) return len;
  _dir.normalize();
  _quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), _dir);
  group.position.copy(from);
  group.quaternion.copy(_quat);
  return len;
}

const beamVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const beamFragment = `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    float radial = 1.0 - abs(vUv.x - 0.5) * 2.0;
    radial = pow(max(radial, 0.0), 2.2);
    float axial = 1.0 - vUv.y;
    float alpha = radial * pow(axial, 1.35) * uIntensity;
    vec3 col = uColor * (0.6 + radial * 0.8);
    gl_FragColor = vec4(col, alpha);
  }
`;

function createBeamMaterial(color: string, intensity: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    },
    vertexShader: beamVertex,
    fragmentShader: beamFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

export function VolumetricBeam({ length, radius, color, intensity = 0.28 }: { length: number; radius: number; color: string; intensity?: number }) {
  const material = useMemo(() => createBeamMaterial(color, intensity), [color, intensity]);

  useFrame(({ clock }) => {
    material.uniforms.uIntensity.value = intensity * (0.85 + Math.sin(clock.getElapsedTime() * 3.5) * 0.15);
  });

  return (
    <mesh position={[0, 0, length * 0.5]}>
      <coneGeometry args={[radius, length, 32, 1, true]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export function LightBeamTube({
  sx,
  sy,
  sz,
  ex,
  ey,
  ez,
  color,
  opacity = 0.55,
  radius = 0.035,
}: {
  sx: number;
  sy: number;
  sz: number;
  ex: number;
  ey: number;
  ez: number;
  color: string;
  opacity?: number;
  radius?: number;
}) {
  const start = useMemo(() => new THREE.Vector3(sx, sy, sz), [sx, sy, sz]);
  const end = useMemo(() => new THREE.Vector3(ex, ey, ez), [ex, ey, ez]);
  const { mid, length, quat } = useMemo(() => {
    _mid.addVectors(start, end).multiplyScalar(0.5);
    _dir.subVectors(end, start);
    const len = _dir.length();
    _dir.normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), _dir);
    return { mid: _mid.clone(), length: len, quat: q };
  }, [start, end]);

  const innerMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: opacity * 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [color, opacity],
  );

  const outerMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: opacity * 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [color, opacity],
  );

  return (
    <group position={mid.toArray()} quaternion={quat}>
      <mesh>
        <cylinderGeometry args={[radius * 2.2, radius * 2.8, length, 16, 1, true]} />
        <primitive object={outerMaterial} attach="material" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius * 0.55, radius, length, 12, 1, true]} />
        <primitive object={innerMaterial} attach="material" />
      </mesh>
    </group>
  );
}

export function TorchSource({
  fromX,
  fromY,
  fromZ,
  toX,
  toY,
  toZ,
}: {
  fromX: number;
  fromY: number;
  fromZ: number;
  toX: number;
  toY: number;
  toZ: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bulbRef = useRef<THREE.Mesh>(null);
  const spotRef = useRef<THREE.SpotLight>(null);

  const from = useMemo(() => new THREE.Vector3(fromX, fromY, fromZ), [fromX, fromY, fromZ]);
  const to = useMemo(() => new THREE.Vector3(toX, toY, toZ), [toX, toY, toZ]);

  const beamLength = useMemo(() => from.distanceTo(to), [from, to]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    aimGroup(groupRef.current, from, to);
    const flicker = 0.92 + Math.sin(clock.getElapsedTime() * 9) * 0.04 + Math.sin(clock.getElapsedTime() * 23) * 0.02;
    if (spotRef.current) spotRef.current.intensity = 45 * flicker;
    if (bulbRef.current) {
      bulbRef.current.scale.setScalar(0.95 + Math.sin(clock.getElapsedTime() * 6) * 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <VolumetricBeam length={beamLength} radius={0.22 + beamLength * 0.018} color="#ffcc66" intensity={0.32} />

      <spotLight
        ref={spotRef}
        position={[0, 0, 0.05]}
        angle={0.28}
        penumbra={0.65}
        distance={beamLength * 2.5}
        decay={1.6}
        intensity={45}
        color="#ffe8b0"
        castShadow={false}
      />

      {/* flashlight body */}
      <mesh position={[0, 0, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.18, 0.55, 20]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.17, 0.14, 0.12, 20]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* emissive bulb — picked up by bloom */}
      <mesh ref={bulbRef} position={[0, 0, 0.02]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color="#fff4cc"
          emissive="#ffaa33"
          emissiveIntensity={4}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 0, 0.05]} intensity={2.5} distance={3} color="#ffd080" decay={2} />
    </group>
  );
}

export function AnimatedPhoton({
  sx,
  sy,
  sz,
  ex,
  ey,
  ez,
  color,
}: {
  sx: number;
  sy: number;
  sz: number;
  ex: number;
  ey: number;
  ez: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const start = useMemo(() => new THREE.Vector3(sx, sy, sz), [sx, sy, sz]);
  const end = useMemo(() => new THREE.Vector3(ex, ey, ez), [ex, ey, ez]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * 0.65) % 1;
    ref.current.position.lerpVectors(start, end, t);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 10, 10]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.95} />
    </mesh>
  );
}
