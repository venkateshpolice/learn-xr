"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import { CELL_VOLTAGE, ON_BOARD, type PartType } from "@/lib/circuitBuilder";

const COPPER = "#b87333";

export function RealisticBulb({ brightness, label }: { brightness: number; label?: boolean }) {
  const glow = Math.max(0, Math.min(1, brightness));
  const filamentRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const flicker = glow > 0.05 ? 1 + Math.sin(clock.getElapsedTime() * 24) * 0.04 * glow : 1;
    if (filamentRef.current) {
      filamentRef.current.scale.setScalar(0.85 + glow * 0.3 * flicker);
    }
    if (haloRef.current) {
      haloRef.current.scale.setScalar(1 + glow * 0.4 * flicker);
      const hm = haloRef.current.material as THREE.MeshBasicMaterial;
      hm.opacity = glow * 0.35;
      hm.color.setHex(glow > 0.2 ? 0xffee88 : 0xffdd66);
    }
  });

  const filamentCurve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      pts.push(new THREE.Vector3(Math.sin(t * Math.PI * 3) * 0.035, -0.06 + t * 0.12, 0));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  return (
    <group>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 12]} />
        <meshStandardMaterial color={COPPER} metalness={0.9} roughness={0.2} />
      </mesh>

      <mesh castShadow>
        <sphereGeometry args={[0.34, 28, 28]} />
        <meshPhysicalMaterial
          color="#fffef8"
          transmission={0.55}
          thickness={0.35}
          roughness={0.04}
          ior={1.45}
          transparent
          opacity={0.88}
          emissive="#ffaa00"
          emissiveIntensity={glow * 0.35}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={haloRef}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshBasicMaterial color="#ffdd66" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>

      <group ref={filamentRef} position={[0, 0.02, 0]}>
        <mesh>
          <tubeGeometry args={[filamentCurve, 24, 0.009, 6, false]} />
          <meshBasicMaterial
            color={glow > 0.05 ? "#fffef0" : "#fff8e0"}
            toneMapped={false}
            transparent
            opacity={0.35 + glow * 0.65}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.2 + glow * 0.95} />
        </mesh>
      </group>

      {glow > 0.08 && (
        <pointLight color="#ffcc66" intensity={glow * 2.2} distance={2.5} decay={2} />
      )}

      <mesh rotation={[Math.PI, 0, 0]} position={[0, -0.08, 0]}>
        <coneGeometry args={[0.17, 0.2, 16, 1, true]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.75} roughness={0.28} side={THREE.DoubleSide} />
      </mesh>

      {label !== false && (
        <Text position={[0, -0.52, 0]} fontSize={0.11} color={glow > 0.1 ? "#fde68a" : "#64748b"} anchorX="center">
          BULB
        </Text>
      )}
    </group>
  );
}

export function OnBoardPart({
  type,
  brightness,
  switchClosed,
  onToggleSwitch,
}: {
  type: PartType;
  brightness?: number;
  switchClosed?: boolean;
  onToggleSwitch?: () => void;
}) {
  const lift = ON_BOARD.lift(type);
  const s = ON_BOARD.scale;

  return (
    <group scale={s} position={[0, lift, 0]}>
      {type === "cell" && <BatteryCell3D compact label={false} />}
      {type === "bulb" && <RealisticBulb brightness={brightness ?? 0} label={false} />}
      {type === "switch" && <Switch3D closed={switchClosed ?? true} onToggle={onToggleSwitch} />}
      {type === "insulator" && <Insulator3D />}
      {/* Pin legs into breadboard holes */}
      <BoardPins type={type} />
    </group>
  );
}

function BoardPins({ type }: { type: PartType }) {
  const pinY = -0.04;
  const configs: Record<PartType, [number, number, number][]> = {
    cell: [
      [-0.38, pinY, 0],
      [0.38, pinY, 0],
    ],
    bulb: [
      [-0.22, pinY, 0],
      [0.22, pinY, 0],
    ],
    switch: [
      [-0.28, pinY, 0],
      [0.28, pinY, 0],
    ],
    insulator: [
      [-0.28, pinY, 0],
      [0.28, pinY, 0],
    ],
  };
  return (
    <group>
      {configs[type].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <cylinderGeometry args={[0.018, 0.014, 0.07, 8]} />
          <meshStandardMaterial color="#b87333" metalness={0.92} roughness={0.18} />
        </mesh>
      ))}
    </group>
  );
}

export function BatteryCell3D({ compact, label = true }: { compact?: boolean; label?: boolean }) {
  return (
    <group scale={compact ? 0.9 : 1}>
      <RoundedBox args={[0.55, 0.85, 0.55]} radius={0.08} castShadow>
        <meshStandardMaterial color="#1e40af" roughness={0.45} metalness={0.15} />
      </RoundedBox>
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.12, 16]} />
        <meshStandardMaterial color={COPPER} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.48, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.06, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
      </mesh>
      <Text position={[0, 0.72, 0]} fontSize={0.16} color="#fef08a" anchorX="center" outlineWidth={0.01} outlineColor="#000">
        +
      </Text>
      <Text position={[0, -0.62, 0]} fontSize={0.14} color="#cbd5e1" anchorX="center">
        −
      </Text>
      {label && (
        <Text position={[0, -0.95, 0]} fontSize={0.12} color="#94a3b8" anchorX="center">
          {CELL_VOLTAGE}V CELL
        </Text>
      )}
    </group>
  );
}

export function Switch3D({
  closed,
  onToggle,
}: {
  closed: boolean;
  onToggle?: () => void;
}) {
  const leverRef = useRef<THREE.Mesh>(null);
  const target = closed ? -0.35 : 0.35;

  useFrame((_, delta) => {
    if (leverRef.current) {
      leverRef.current.rotation.z = THREE.MathUtils.lerp(leverRef.current.rotation.z, target, delta * 8);
    }
  });

  return (
    <group onClick={(e) => { e.stopPropagation(); onToggle?.(); }}>
      <RoundedBox args={[0.55, 0.28, 0.35]} radius={0.05} castShadow>
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.2} />
      </RoundedBox>
      <mesh position={[-0.18, 0.05, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 10]} />
        <meshStandardMaterial color={COPPER} metalness={0.9} />
      </mesh>
      <mesh ref={leverRef} position={[-0.18, 0.1, 0]} rotation={[0, 0, target]}>
        <boxGeometry args={[0.32, 0.04, 0.06]} />
        <meshStandardMaterial color={closed ? "#22c55e" : "#ef4444"} metalness={0.4} roughness={0.4} />
      </mesh>
      <Text position={[0, -0.28, 0]} fontSize={0.1} color={closed ? "#86efac" : "#fca5a5"} anchorX="center">
        {closed ? "ON" : "OFF"}
      </Text>
    </group>
  );
}

export function Insulator3D() {
  return (
    <group>
      <RoundedBox args={[0.65, 0.16, 0.22]} radius={0.04}>
        <meshStandardMaterial color="#dc2626" roughness={0.55} emissive="#450a0a" emissiveIntensity={0.2} />
      </RoundedBox>
      <Text position={[0, 0.22, 0]} fontSize={0.1} color="#fecaca" anchorX="center">
        INSULATOR
      </Text>
    </group>
  );
}

export function TerminalPin({
  position,
  active,
  selected,
  onClick,
  size = 0.07,
}: {
  position: [number, number, number];
  active: boolean;
  selected: boolean;
  onClick: () => void;
  size?: number;
}) {
  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <sphereGeometry args={[size, 12, 12]} />
      <meshStandardMaterial
        color={selected ? "#38bdf8" : active ? "#fbbf24" : "#64748b"}
        emissive={selected ? "#0ea5e9" : active ? "#f59e0b" : "#000000"}
        emissiveIntensity={selected ? 1.2 : active ? 0.6 : 0}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}
