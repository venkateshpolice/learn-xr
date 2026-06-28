"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { drainFillLevel, type TankHole } from "@/lib/waterPressurePhysics";

export function TankDrainSimulator({
  fillLevelRef,
  holes,
  paused,
  onFillChange,
}: {
  fillLevelRef: React.MutableRefObject<number>;
  holes: TankHole[];
  paused: boolean;
  onFillChange: (level: number) => void;
}) {
  const holesRef = useRef(holes);
  holesRef.current = holes;

  useFrame((_, delta) => {
    if (paused) return;
    const next = drainFillLevel(fillLevelRef.current, holesRef.current, delta);
    if (Math.abs(next - fillLevelRef.current) < 1e-6) return;
    fillLevelRef.current = next;
    onFillChange(next);
  });

  return null;
}
