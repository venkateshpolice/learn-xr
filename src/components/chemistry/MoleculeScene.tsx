"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, ContactShadows, Float } from "@react-three/drei";
import { VRButton } from "three-stdlib";
import * as THREE from "three";
import {
  ELEMENTS,
  type AtomDef,
  type BondDef,
  type ElementSymbol,
} from "@/data/molecules-data";

export type ViewMode = "ball-stick" | "spacefill";

interface MoleculeSceneProps {
  atoms: AtomDef[];
  bonds: BondDef[];
  viewMode: ViewMode;
  selectedAtom: number | null;
  onSelectAtom: (index: number | null) => void;
  autoRotate: boolean;
  vrContainerRef: React.RefObject<HTMLDivElement | null>;
}

function BondStick({
  from,
  to,
  fromElement,
  toElement,
  order,
  viewMode,
}: {
  from: [number, number, number];
  to: [number, number, number];
  fromElement: ElementSymbol;
  toElement: ElementSymbol;
  order: 1 | 2 | 3;
  viewMode: ViewMode;
}) {
  if (viewMode === "spacefill") return null;

  const r1 = ELEMENTS[fromElement].radius * 0.95;
  const r2 = ELEMENTS[toElement].radius * 0.95;
  const offsets = order === 1 ? [0] : order === 2 ? [-0.08, 0.08] : [-0.1, 0, 0.1];
  const radius = order === 3 ? 0.06 : 0.075;

  return (
    <>
      {offsets.map((lateral, i) => (
        <BondCylinder
          key={i}
          from={from}
          to={to}
          trimStart={r1}
          trimEnd={r2}
          radius={radius}
          lateral={lateral}
        />
      ))}
    </>
  );
}

function BondCylinder({
  from,
  to,
  trimStart,
  trimEnd,
  radius,
  lateral = 0,
}: {
  from: [number, number, number];
  to: [number, number, number];
  trimStart: number;
  trimEnd: number;
  radius: number;
  lateral?: number;
}) {
  const geom = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const dir = new THREE.Vector3().subVectors(end, start);
    const fullLen = dir.length();
    if (fullLen < 0.05) return null;

    dir.normalize();
    const a = start.clone().addScaledVector(dir, trimStart);
    const b = end.clone().addScaledVector(dir, -trimEnd);
    const len = a.distanceTo(b);
    if (len < 0.05) return null;

    const mid = a.clone().add(b).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    if (lateral !== 0) {
      const perp = new THREE.Vector3(1, 0, 0).applyQuaternion(quat).multiplyScalar(lateral);
      mid.add(perp);
    }

    return { position: mid, quaternion: quat, length: len };
  }, [from, to, trimStart, trimEnd, lateral]);

  if (!geom) return null;

  return (
    <mesh position={geom.position} quaternion={geom.quaternion} castShadow renderOrder={1}>
      <cylinderGeometry args={[radius, radius, geom.length, 16]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.4} roughness={0.35} />
    </mesh>
  );
}

function AtomSphere({
  element,
  position,
  viewMode,
  selected,
  onClick,
}: {
  element: ElementSymbol;
  position: [number, number, number];
  viewMode: ViewMode;
  selected: boolean;
  onClick: () => void;
}) {
  const info = ELEMENTS[element];
  const scale = viewMode === "spacefill" ? info.radius * 1.85 : info.radius * 0.95;

  return (
    <group position={position}>
      <mesh castShadow onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <sphereGeometry args={[scale, 32, 32]} />
        <meshStandardMaterial
          color={info.color}
          metalness={viewMode === "spacefill" ? 0.15 : 0.25}
          roughness={0.35}
          emissive={selected ? "#ffffff" : "#000000"}
          emissiveIntensity={selected ? 0.25 : 0}
        />
      </mesh>
      {viewMode === "ball-stick" && (
        <Text
          position={[0, scale + 0.22, 0]}
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          outlineWidth={0.015}
          outlineColor="#0f172a"
        >
          {element}
        </Text>
      )}
    </group>
  );
}

function LabBench() {
  return (
    <group>
      <mesh position={[0, -2.2, 0]} receiveShadow>
        <boxGeometry args={[14, 0.35, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[0, -2.02, 0]} receiveShadow>
        <boxGeometry args={[13.5, 0.04, 7.5]} />
        <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.35} />
      </mesh>
      <Float speed={1.2} floatIntensity={0.15} rotationIntensity={0.05}>
        <group position={[-4.5, -1.5, -2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.35, 0.4, 1.2, 16]} />
            <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.45} roughness={0.05} transmission={0.5} />
          </mesh>
        </group>
      </Float>
      <Float speed={0.9} floatIntensity={0.1}>
        <group position={[4.8, -1.55, 1.5]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.28, 0.32, 0.9, 16]} />
            <meshPhysicalMaterial color="#4ade80" transparent opacity={0.4} roughness={0.05} transmission={0.45} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

function WebXRSetup({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const { gl } = useThree();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    gl.xr.enabled = true;
    const container = containerRef.current;
    if (!container) return;

    const btn = VRButton.createButton(gl, {
      optionalFeatures: ["local-floor", "bounded-floor"],
    }) as HTMLButtonElement;
    btn.className =
      "absolute bottom-4 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold border border-emerald-400/40 shadow-lg transition-colors";
    btn.textContent = btn.textContent || "Enter VR";
    container.appendChild(btn);
    buttonRef.current = btn;

    return () => {
      btn.remove();
    };
  }, [gl, containerRef]);

  return null;
}

export default function MoleculeScene({
  atoms,
  bonds,
  viewMode,
  selectedAtom,
  onSelectAtom,
  autoRotate,
  vrContainerRef,
}: MoleculeSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <>
      <color attach="background" args={["#0c1222"]} />
      <fog attach="fog" args={["#0c1222", 14, 38]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[8, 12, 6]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 4, -4]} intensity={0.5} color="#34d399" />
      <pointLight position={[6, 2, 4]} intensity={0.35} color="#60a5fa" />

      <WebXRSetup containerRef={vrContainerRef} />

      <LabBench />

      <group ref={groupRef} position={[0, -0.8, 0]}>
        {atoms.map((atom, i) => (
          <AtomSphere
            key={`atom-${i}-${atom.element}`}
            element={atom.element}
            position={atom.position}
            viewMode={viewMode}
            selected={selectedAtom === i}
            onClick={() => onSelectAtom(selectedAtom === i ? null : i)}
          />
        ))}
        {bonds.map((b, i) => {
          const a = atoms[b.from];
          const c = atoms[b.to];
          if (!a || !c) return null;
          return (
            <BondStick
              key={`bond-${b.from}-${b.to}-${i}-${b.order}`}
              from={a.position}
              to={c.position}
              fromElement={a.element}
              toElement={c.element}
              order={b.order}
              viewMode={viewMode}
            />
          );
        })}
      </group>

      <ContactShadows position={[0, -2.02, 0]} opacity={0.45} scale={16} blur={2.5} far={6} />
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={18}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 1.85}
        target={[0, -0.5, 0]}
      />
    </>
  );
}
