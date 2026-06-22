"use client";

import { Line, Text } from "@react-three/drei";
import * as THREE from "three";

const X_COLOR = "#ef4444";
const Y_COLOR = "#22c55e";
const Z_COLOR = "#3b82f6";

function AxisArrow({
  to,
  color,
  label,
  labelOffset,
}: {
  to: [number, number, number];
  color: string;
  label: string;
  labelOffset: [number, number, number];
}) {
  const dir = new THREE.Vector3(...to).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const neg: [number, number, number] = [-to[0] * 0.35, -to[1] * 0.35, -to[2] * 0.35];

  return (
    <group>
      <Line points={[[0, 0, 0], to]} color={color} lineWidth={2.5} />
      <Line points={[neg, [0, 0, 0]]} color={color} lineWidth={1} />
      <mesh position={to} quaternion={quat}>
        <coneGeometry args={[0.06, 0.18, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      <Text
        position={labelOffset}
        fontSize={0.18}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#0f172a"
      >
        {label}
      </Text>
    </group>
  );
}

export interface CoordinateAxesProps {
  length?: number;
  xLabel?: string;
  yLabel?: string;
  zLabel?: string;
  showZ?: boolean;
}

/** RGB-style X (red), Y (green), Z (blue) coordinate axes with arrowheads. */
export default function CoordinateAxes({
  length = 2.5,
  xLabel = "x",
  yLabel = "y",
  zLabel = "z",
  showZ = true,
}: CoordinateAxesProps) {
  const pad = 0.22;

  return (
    <group renderOrder={5}>
      <AxisArrow
        to={[length, 0, 0]}
        color={X_COLOR}
        label={xLabel}
        labelOffset={[length + pad, 0, 0]}
      />
      <AxisArrow
        to={[0, length, 0]}
        color={Y_COLOR}
        label={yLabel}
        labelOffset={[0, length + pad, 0]}
      />
      {showZ && (
        <AxisArrow
          to={[0, 0, length]}
          color={Z_COLOR}
          label={zLabel}
          labelOffset={[0, 0, length + pad]}
        />
      )}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#f8fafc" emissive="#ffffff" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

export { X_COLOR, Y_COLOR, Z_COLOR };
