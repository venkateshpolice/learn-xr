"use client";

import { useRef, useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Stars, Text, Billboard, Float, Environment } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Rocket,
  Gauge,
  ArrowUp,
  Flame,
  Timer,
  HelpCircle,
} from "lucide-react";
import { ROCKET_LAUNCH_STAGES, rocketGroupY, type RocketLaunchStage } from "@/data/rocket-launch-stages";
import { RocketLaunchQuiz } from "@/components/rocket-launch/RocketLaunchQuiz";
import {
  useWebGLRecovery,
  WebGLContextHandler,
  WebGLRecoveryOverlay,
  LIGHT_GL,
} from "@/components/three/WebGLRecovery";

function speak(text: string) {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.88;
      window.speechSynthesis.speak(u);
    }
  } catch {}
}

/* ═══════ Camera Rig with Shake ═══════ */
function CameraRig({
  targetCamera,
  targetLookAt,
  controlsRef,
  shakeIntensity,
  orbitMode,
  trackTargetRef,
}: {
  targetCamera: [number, number, number];
  targetLookAt: [number, number, number];
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  shakeIntensity: number;
  orbitMode?: { center: [number, number, number]; radius: number; speed: number };
  trackTargetRef?: React.MutableRefObject<THREE.Vector3>;
}) {
  const { camera } = useThree();
  const animating = useRef(false);
  const startPos = useRef(new THREE.Vector3());
  const endPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const endTarget = useRef(new THREE.Vector3());
  const progress = useRef(1);
  const rocketCenter = useRef(new THREE.Vector3());
  const orbitCenter = useRef(new THREE.Vector3());

  useEffect(() => {
    startPos.current.copy(camera.position);
    startTarget.current.copy(controlsRef.current?.target ?? new THREE.Vector3());
    endPos.current.set(...targetCamera);
    endTarget.current.set(...targetLookAt);
    rocketCenter.current.set(...targetLookAt);
    progress.current = 0;
    animating.current = true;
  }, [targetCamera, targetLookAt, camera, controlsRef]);

  useFrame(({ clock }, delta) => {
    if (animating.current) {
      progress.current = Math.min(progress.current + delta * 0.55, 1);
      const t = 1 - Math.pow(1 - progress.current, 3);
      camera.position.lerpVectors(startPos.current, endPos.current, t);
      if (controlsRef.current) {
        if (trackTargetRef) {
          controlsRef.current.target.lerp(trackTargetRef.current, Math.min(delta * 4, 1 - t + 0.05));
        } else {
          controlsRef.current.target.lerpVectors(startTarget.current, endTarget.current, t);
        }
        controlsRef.current.update();
      }
      if (progress.current >= 1) animating.current = false;
    }

    if (!animating.current && orbitMode) {
      const center = trackTargetRef?.current ?? orbitCenter.current.set(...orbitMode.center);
      const time = clock.elapsedTime * orbitMode.speed;
      const r = orbitMode.radius;
      camera.position.x = center.x + Math.sin(time) * r;
      camera.position.y = center.y + Math.sin(time * 0.3) * 0.5 + 0.8;
      camera.position.z = center.z + Math.cos(time) * r;
      if (controlsRef.current) {
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
      }
    } else if (!animating.current && trackTargetRef && controlsRef.current) {
      controlsRef.current.target.lerp(trackTargetRef.current, delta * 4);
      controlsRef.current.update();
    } else if (!animating.current && controlsRef.current) {
      controlsRef.current.target.lerp(rocketCenter.current, delta * 2);
      controlsRef.current.update();
    }

    if (shakeIntensity > 0) {
      const time = clock.elapsedTime * 30;
      camera.position.x += Math.sin(time) * 0.015 * shakeIntensity;
      camera.position.y += Math.cos(time * 1.3) * 0.012 * shakeIntensity;
      camera.position.z += Math.sin(time * 0.7) * 0.01 * shakeIntensity;
    }
  });

  return null;
}

/* ═══════ Ground Terrain ═══════ */
const TERRAIN_PATCHES = Array.from({ length: 12 }, (_, i) => {
  const x = (((i * 7 + 3) % 12) / 12 - 0.5) * 60;
  const z = (((i * 11 + 5) % 12) / 12 - 0.5) * 60;
  const rot = ((i * 13) % 60) / 10;
  const scale = 1.5 + ((i * 17) % 30) / 10;
  return { x, z, rot, scale, skip: Math.abs(x) < 8 && Math.abs(z) < 8 };
});

function GroundTerrain() {
  return (
    <group>
      <mesh position={[0, -0.15, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#3a4a3a" roughness={0.95} metalness={0.05} />
      </mesh>
      {TERRAIN_PATCHES.map((p, i) =>
        p.skip ? null : (
          <mesh key={i} position={[p.x, 0.02, p.z]} rotation={[-Math.PI / 2, 0, p.rot]}>
            <circleGeometry args={[p.scale, 8]} />
            <meshStandardMaterial color="#4a5a4a" roughness={1} transparent opacity={0.5} />
          </mesh>
        ),
      )}
    </group>
  );
}

/* ═══════ Launch Pad (Detailed) ═══════ */
function LaunchPad() {
  return (
    <group position={[0, 0, 0]}>
      {/* Main concrete pad */}
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6.5, 0.16, 48]} />
        <meshStandardMaterial color="#666" roughness={0.95} metalness={0.1} />
      </mesh>
      {/* Inner platform */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.8, 0.35, 12]} />
        <meshStandardMaterial color="#888" roughness={0.85} metalness={0.2} />
      </mesh>
      {/* Flame trench */}
      <mesh position={[0, -0.2, 2.5]}>
        <boxGeometry args={[1.8, 0.4, 5]} />
        <meshStandardMaterial color="#444" roughness={0.9} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.4, 5.5]}>
        <boxGeometry args={[2.2, 0.1, 1.5]} />
        <meshStandardMaterial color="#555" roughness={0.9} metalness={0.3} />
      </mesh>

      {/* Launch tower */}
      <group position={[3.2, 0, 0]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={`vert-${i}`} position={[i % 2 === 0 ? -0.15 : 0.15, i * 0.7 + 0.35, i % 2 === 0 ? -0.15 : 0.15]} castShadow>
            <boxGeometry args={[0.08, 0.72, 0.08]} />
            <meshStandardMaterial color="#777" roughness={0.6} metalness={0.6} />
          </mesh>
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={`cross-${i}`} position={[0, i * 1.4 + 0.7, 0]} castShadow>
            <boxGeometry args={[0.35, 0.04, 0.04]} />
            <meshStandardMaterial color="#888" roughness={0.6} metalness={0.5} />
          </mesh>
        ))}
        {/* Umbilical arm */}
        <mesh position={[-1.2, 5, 0]} castShadow>
          <boxGeometry args={[2.2, 0.08, 0.12]} />
          <meshStandardMaterial color="#ee6600" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[-1.2, 3.2, 0]} castShadow>
          <boxGeometry args={[2, 0.08, 0.12]} />
          <meshStandardMaterial color="#ee6600" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Platform at top */}
        <mesh position={[0, 14, 0]}>
          <boxGeometry args={[1.2, 0.08, 1.2]} />
          <meshStandardMaterial color="#999" roughness={0.5} metalness={0.5} />
        </mesh>
        {/* Red warning light */}
        <mesh position={[0, 14.2, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ff2200" toneMapped={false} />
        </mesh>
        <pointLight position={[0, 14.2, 0]} color="#ff2200" intensity={2} distance={5} decay={2} />
      </group>

      {/* Hold-down clamps */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <group key={`clamp-${i}`} position={[Math.cos(a) * 1.2, 0.2, Math.sin(a) * 1.2]}>
            <mesh castShadow>
              <boxGeometry args={[0.2, 0.5, 0.2]} />
              <meshStandardMaterial color="#cc4400" roughness={0.5} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[0.35, 0.06, 0.06]} />
              <meshStandardMaterial color="#aa3300" roughness={0.5} metalness={0.6} />
            </mesh>
          </group>
        );
      })}

      {/* Propellant storage at pad */}
      <PadStorageTanks />

      {/* Water deluge tanks */}
      {[-1, 1].map((s) => (
        <group key={`deluge-${s}`} position={[s * 7, 0, 3]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 3, 12]} />
            <meshStandardMaterial color="#cccccc" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, 3.1, 0]}>
            <sphereGeometry args={[0.6, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#cccccc" roughness={0.4} metalness={0.6} />
          </mesh>
          <Billboard position={[0.9, 2, 0]}>
            <Text fontSize={0.12} color="#94a3b8" anchorX="left" outlineWidth={0.012} outlineColor="#000" font={undefined}>
              Water
            </Text>
          </Billboard>
        </group>
      ))}
    </group>
  );
}

/* ═══════ First Stage Fuel Tanks (LOX + RP-1) ═══════ */
function FirstStageFuelTanks({ showLabels = false }: { showLabels?: boolean }) {
  return (
    <group>
      {/* LOX tank — upper first stage (cold, white) */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.56, 2.55, 24]} />
        <meshPhysicalMaterial color="#f4f6f8" roughness={0.18} metalness={0.55} clearcoat={0.35} clearcoatRoughness={0.12} />
      </mesh>
      {/* Frost / condensation on LOX tank */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.558, 0.558, 1.1, 24]} />
        <meshPhysicalMaterial color="#dceaf5" roughness={0.35} metalness={0.4} clearcoat={0.5} transparent opacity={0.85} />
      </mesh>
      {/* LOX vent pipe */}
      <mesh position={[0.58, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.35, 8]} />
        <meshStandardMaterial color="#aaa" roughness={0.35} metalness={0.85} />
      </mesh>
      <mesh position={[0.75, 1.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Common bulkhead between LOX and RP-1 */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.545, 0.55, 0.14, 24]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.45} metalness={0.75} />
      </mesh>

      {/* RP-1 fuel tank — lower first stage */}
      <mesh position={[0, -1.65, 0]} castShadow>
        <cylinderGeometry args={[0.56, 0.55, 2.15, 24]} />
        <meshPhysicalMaterial color="#e8e4dc" roughness={0.22} metalness={0.48} clearcoat={0.25} />
      </mesh>
      {/* Elliptical bottom dome (fuel tank base) */}
      <mesh position={[0, -2.78, 0]}>
        <sphereGeometry args={[0.55, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhysicalMaterial color="#ddd8d0" roughness={0.25} metalness={0.5} clearcoat={0.2} />
      </mesh>

      {/* Propellant feed lines on tank exterior */}
      {[0, Math.PI].map((angle, i) => (
        <group key={`feed-${i}`} rotation={[0, angle, 0]}>
          <mesh position={[0.52, -0.2, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 1.6, 8]} />
            <meshStandardMaterial color="#888" roughness={0.35} metalness={0.8} />
          </mesh>
          <mesh position={[0.52, -1.05, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.08, 8]} />
            <meshStandardMaterial color="#666" roughness={0.3} metalness={0.85} />
          </mesh>
        </group>
      ))}

      {showLabels && (
        <group>
          <Billboard position={[1.05, 0.75, 0]}>
            <Text fontSize={0.14} color="#88ccff" anchorX="left" outlineWidth={0.015} outlineColor="#000" font={undefined}>
              LOX Tank
            </Text>
          </Billboard>
          <Billboard position={[1.05, -1.65, 0]}>
            <Text fontSize={0.14} color="#fbbf24" anchorX="left" outlineWidth={0.015} outlineColor="#000" font={undefined}>
              RP-1 Tank
            </Text>
          </Billboard>
        </group>
      )}
    </group>
  );
}

/* ═══════ Pad Storage Tanks (fixed on launch pad) ═══════ */
function PadStorageTanks() {
  return (
    <group>
      {/* LOX storage — tall white tank */}
      <group position={[-6.5, 0, -2.5]}>
        <mesh position={[0, 2.2, 0]} castShadow>
          <cylinderGeometry args={[1.1, 1.15, 4.4, 20]} />
          <meshPhysicalMaterial color="#e8eef2" roughness={0.25} metalness={0.55} clearcoat={0.3} />
        </mesh>
        <mesh position={[0, 4.55, 0]}>
          <sphereGeometry args={[1.1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#dce8f0" roughness={0.2} metalness={0.5} clearcoat={0.35} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[1.18, 1.2, 0.3, 20]} />
          <meshStandardMaterial color="#666" roughness={0.5} metalness={0.7} />
        </mesh>
        {/* Tank outlet */}
        <mesh position={[0.95, 1.2, 0.35]} rotation={[0, -0.6, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.35, 10]} />
          <meshStandardMaterial color="#bbb" roughness={0.35} metalness={0.8} />
        </mesh>
        <Billboard position={[1.5, 2.5, 0]}>
          <Text fontSize={0.22} color="#88ccff" anchorX="left" outlineWidth={0.02} outlineColor="#000" font={undefined}>
            LOX
          </Text>
        </Billboard>
      </group>

      {/* RP-1 storage — shorter dark tank */}
      <group position={[6.5, 0, -2.5]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[1, 1.05, 3, 20]} />
          <meshPhysicalMaterial color="#3a3530" roughness={0.35} metalness={0.45} clearcoat={0.15} />
        </mesh>
        <mesh position={[0, 3.1, 0]}>
          <sphereGeometry args={[1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#4a443c" roughness={0.35} metalness={0.4} />
        </mesh>
        <mesh position={[0.85, 0.9, 0.3]} rotation={[0, 0.6, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.35, 10]} />
          <meshStandardMaterial color="#777" roughness={0.4} metalness={0.75} />
        </mesh>
        <Billboard position={[1.4, 1.8, 0]}>
          <Text fontSize={0.22} color="#fbbf24" anchorX="left" outlineWidth={0.02} outlineColor="#000" font={undefined}>
            RP-1
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

/** Fill ports on rocket first stage (rocket-local coordinates) */
const ROCKET_LOX_PORT: [number, number, number] = [0.58, 0.35, -0.38];
const ROCKET_RP1_PORT: [number, number, number] = [0.58, -1.35, -0.38];

function RocketFillPorts() {
  return (
    <group>
      {(
        [
          { pos: ROCKET_LOX_PORT, label: "LOX", color: "#dde8f0" },
          { pos: ROCKET_RP1_PORT, label: "RP-1", color: "#666" },
        ] as const
      ).map(({ pos, label, color }) => (
        <group key={label} position={pos}>
          {/* Port penetrating tank skin */}
          <mesh rotation={[0, -Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.18, 10]} />
            <meshStandardMaterial color={color} roughness={0.35} metalness={0.75} />
          </mesh>
          {/* Quick-disconnect coupling */}
          <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.055, 0.055, 0.14, 12]} />
            <meshStandardMaterial color="#ee6600" roughness={0.4} metalness={0.65} />
          </mesh>
          <mesh position={[0.18, 0, 0]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color="#cc5500" roughness={0.35} metalness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function UmbilicalHose({
  from,
  to,
  radius,
  color,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  radius: number;
  color: string;
}) {
  const { position, rotation, length } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
    return {
      position: mid,
      rotation: new THREE.Euler().setFromQuaternion(quat),
      length: len,
    };
  }, [from, to]);

  return (
    <mesh position={position} rotation={rotation} castShadow>
      <cylinderGeometry args={[radius, radius, length, 10]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.55} />
    </mesh>
  );
}

/** Umbilical hoses parented to rocket — move with rocket, connect to pad tanks */
function PropellantUmbilicals({ groupY }: { groupY: number }) {
  const hoses = useMemo(() => {
    const loxPort = new THREE.Vector3(...ROCKET_LOX_PORT);
    const rp1Port = new THREE.Vector3(...ROCKET_RP1_PORT);
    const loxTank = new THREE.Vector3(-6.5, 1.2 - groupY, -2.5);
    const rp1Tank = new THREE.Vector3(6.5, 0.9 - groupY, -2.5);
    const loxMid = new THREE.Vector3(-2.8, 0.2 - groupY, -1.6);
    const rp1Mid = new THREE.Vector3(2.8, -0.4 - groupY, -1.6);
    return { loxPort, rp1Port, loxTank, rp1Tank, loxMid, rp1Mid };
  }, [groupY]);

  return (
    <group>
      <RocketFillPorts />
      <UmbilicalHose from={hoses.loxPort} to={hoses.loxMid} radius={0.05} color="#dde8f0" />
      <UmbilicalHose from={hoses.loxMid} to={hoses.loxTank} radius={0.05} color="#c8d8e8" />
      <UmbilicalHose from={hoses.rp1Port} to={hoses.rp1Mid} radius={0.055} color="#666" />
      <UmbilicalHose from={hoses.rp1Mid} to={hoses.rp1Tank} radius={0.055} color="#555" />
    </group>
  );
}

/* ═══════ Rocket stack layout (shared offsets) ═══════ */
const SECOND_STAGE_Y_WITH_BOOSTER = 3.8;
const SECOND_STAGE_HALF_H = 1.4;
const FAIRING_CYLINDER_HALF_H = 0.6;

function secondStageGroupY(showBooster: boolean): number {
  return showBooster ? SECOND_STAGE_Y_WITH_BOOSTER : 0;
}

/** Fairing cylinder sits flush on top of the second stage */
function fairingGroupY(showBooster: boolean): number {
  return secondStageGroupY(showBooster) + SECOND_STAGE_HALF_H + FAIRING_CYLINDER_HALF_H;
}

/** Payload sits on the second-stage deck (inside fairing) */
function payloadGroupY(showBooster: boolean): number {
  return secondStageGroupY(showBooster) + SECOND_STAGE_HALF_H + 0.25;
}

/* ═══════ Rocket Body (High Detail) ═══════ */
function RocketBody({
  showFairing,
  showBooster,
}: {
  showFairing: boolean;
  showBooster: boolean;
}) {
  return (
    <group>
      {/* ── First Stage ── */}
      {showBooster && (
        <group>
          <FirstStageFuelTanks />
          {/* Black stripe band */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.56, 0.56, 0.15, 24]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} />
          </mesh>
          {/* Brand stripe */}
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.565, 0.565, 0.3, 24]} />
            <meshStandardMaterial color="#cc2200" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Interstage (dark gray ring between stages) */}
          <mesh position={[0, 2.6, 0]}>
            <cylinderGeometry args={[0.54, 0.57, 0.5, 24]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Engine section */}
          <mesh position={[0, -2.6, 0]}>
            <cylinderGeometry args={[0.45, 0.58, 0.5, 24]} />
            <meshStandardMaterial color="#333" roughness={0.5} metalness={0.8} />
          </mesh>
          {/* Octaweb engine cluster */}
          <mesh position={[0, -2.9, 0]}>
            <cylinderGeometry args={[0.42, 0.45, 0.15, 24]} />
            <meshStandardMaterial color="#222" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* 9 Engine nozzles (Merlin pattern) */}
          <mesh position={[0, -3.2, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 0.5, 12]} />
            <meshPhysicalMaterial color="#1a1a1a" roughness={0.2} metalness={0.95} clearcoat={0.5} />
          </mesh>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const r = 0.28;
            return (
              <mesh key={`eng-${i}`} position={[Math.cos(a) * r, -3.2, Math.sin(a) * r]}>
                <cylinderGeometry args={[0.06, 0.1, 0.45, 10]} />
                <meshPhysicalMaterial color="#1a1a1a" roughness={0.2} metalness={0.95} clearcoat={0.5} />
              </mesh>
            );
          })}
          {/* Grid fins */}
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2;
            return (
              <mesh key={`fin-${i}`} position={[Math.cos(a) * 0.6, 2.2, Math.sin(a) * 0.6]} rotation={[0, -a, 0]}>
                <boxGeometry args={[0.5, 0.4, 0.03]} />
                <meshStandardMaterial color="#444" roughness={0.5} metalness={0.7} />
              </mesh>
            );
          })}
          {/* Landing legs (folded) */}
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
            return (
              <mesh key={`leg-${i}`} position={[Math.cos(a) * 0.55, -2.2, Math.sin(a) * 0.55]} rotation={[0, -a, 0.15]}>
                <boxGeometry args={[0.06, 1.5, 0.04]} />
                <meshStandardMaterial color="#333" roughness={0.5} metalness={0.6} />
              </mesh>
            );
          })}
          <Billboard position={[1.4, 0, 0]}>
            <Text fontSize={0.22} color="#94a3b8" anchorX="left" outlineWidth={0.02} outlineColor="#000" font={undefined}>
              1st Stage
            </Text>
          </Billboard>
        </group>
      )}

      {/* ── Second Stage ── */}
      <group position={[0, secondStageGroupY(showBooster), 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.48, 0.5, 2.8, 24]} />
          <meshPhysicalMaterial color="#fafafa" roughness={0.2} metalness={0.45} clearcoat={0.3} />
        </mesh>
        {/* MVac engine bell */}
        <mesh position={[0, -1.6, 0]}>
          <cylinderGeometry args={[0.22, 0.48, 0.6, 16]} />
          <meshPhysicalMaterial color="#222" roughness={0.2} metalness={0.95} clearcoat={0.6} />
        </mesh>
        <mesh position={[0, -2, 0]}>
          <cylinderGeometry args={[0.35, 0.22, 0.25, 16]} />
          <meshPhysicalMaterial color="#1a1a1a" roughness={0.2} metalness={0.95} />
        </mesh>
        {/* Equipment shelf */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.49, 0.49, 0.08, 24]} />
          <meshStandardMaterial color="#333" roughness={0.5} metalness={0.6} />
        </mesh>
        {!showBooster && (
          <Billboard position={[1.1, 0, 0]}>
            <Text fontSize={0.22} color="#94a3b8" anchorX="left" outlineWidth={0.02} outlineColor="#000" font={undefined}>
              2nd Stage
            </Text>
          </Billboard>
        )}
      </group>

      {/* ── Payload Fairing ── */}
      {showFairing && (
        <group position={[0, fairingGroupY(showBooster), 0]}>
          {/* Cylinder base */}
          <mesh castShadow>
            <cylinderGeometry args={[0.52, 0.52, 1.2, 24]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.15} metalness={0.35} clearcoat={0.4} />
          </mesh>
          {/* Ogive nose */}
          <mesh position={[0, 1.35, 0]} castShadow>
            <coneGeometry args={[0.52, 1.5, 24]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.15} metalness={0.35} clearcoat={0.4} />
          </mesh>
          {/* Seam line */}
          <mesh position={[0, 0, 0.525]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.005, 2.6, 0.005]} />
            <meshBasicMaterial color="#999" />
          </mesh>
          <Billboard position={[1.1, 0.5, 0]}>
            <Text fontSize={0.2} color="#94a3b8" anchorX="left" outlineWidth={0.02} outlineColor="#000" font={undefined}>
              Payload Fairing
            </Text>
          </Billboard>
        </group>
      )}

      {/* Satellite (visible when fairing separated but not deployed) */}
      {!showFairing && (
        <SatelliteOnRocket position={[0, payloadGroupY(showBooster), 0]} />
      )}
    </group>
  );
}

/* ═══════ Realistic Satellite Model ═══════ */
const SOLAR_CELL_ROWS = 4;
const SOLAR_CELL_COLS = 5;

function SolarPanelSegment({
  width,
  depth,
  offsetX,
}: {
  width: number;
  depth: number;
  offsetX: number;
}) {
  return (
    <group position={[offsetX, 0, 0]}>
      <mesh>
        <boxGeometry args={[width, 0.014, depth]} />
        <meshPhysicalMaterial
          color="#0c1638"
          roughness={0.06}
          metalness={0.82}
          emissive="#0a1540"
          emissiveIntensity={0.45}
          clearcoat={0.95}
          clearcoatRoughness={0.08}
        />
      </mesh>
      {/* Silver frame */}
      <mesh position={[0, 0.008, 0]}>
        <boxGeometry args={[width + 0.02, 0.004, depth + 0.02]} />
        <meshStandardMaterial color="#b8c0cc" roughness={0.25} metalness={0.9} />
      </mesh>
      {/* Cell grid */}
      {Array.from({ length: SOLAR_CELL_COLS - 1 }).map((_, i) => (
        <mesh key={`col-${i}`} position={[-width / 2 + ((i + 1) / SOLAR_CELL_COLS) * width, 0.009, 0]}>
          <boxGeometry args={[0.002, 0.001, depth - 0.04]} />
          <meshBasicMaterial color="#1a2548" />
        </mesh>
      ))}
      {Array.from({ length: SOLAR_CELL_ROWS - 1 }).map((_, i) => (
        <mesh key={`row-${i}`} position={[0, 0.009, -depth / 2 + ((i + 1) / SOLAR_CELL_ROWS) * depth]}>
          <boxGeometry args={[width - 0.04, 0.001, 0.002]} />
          <meshBasicMaterial color="#1a2548" />
        </mesh>
      ))}
    </group>
  );
}

function SolarPanelWing({
  side,
  folded,
  panelRef,
}: {
  side: -1 | 1;
  folded?: boolean;
  panelRef?: React.RefObject<THREE.Group | null>;
}) {
  const segW = 0.34;
  const segGap = 0.025;
  const panelDepth = 0.44;

  if (folded) {
    return (
      <group position={[side * 0.24, 0, 0]}>
        <mesh rotation={[0, 0, side * 0.08]}>
          <boxGeometry args={[0.04, 0.38, panelDepth]} />
          <meshPhysicalMaterial color="#0c1638" roughness={0.1} metalness={0.7} emissive="#081030" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[side * 0.02, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.05, 8]} />
          <meshStandardMaterial color="#666" roughness={0.3} metalness={0.85} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={panelRef} position={[side * 0.27, 0, 0]}>
      {/* Deployment hinge arm */}
      <mesh position={[side * 0.1, 0, 0]}>
        <boxGeometry args={[0.2, 0.022, 0.028]} />
        <meshStandardMaterial color="#888" roughness={0.35} metalness={0.85} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.06, 10]} />
        <meshStandardMaterial color="#777" roughness={0.3} metalness={0.9} />
      </mesh>
      <SolarPanelSegment width={segW} depth={panelDepth} offsetX={side * (0.12 + segW / 2)} />
      <SolarPanelSegment width={segW} depth={panelDepth} offsetX={side * (0.12 + segW + segGap + segW / 2)} />
      <SolarPanelSegment width={segW} depth={panelDepth} offsetX={side * (0.12 + (segW + segGap) * 2 + segW / 2)} />
    </group>
  );
}

function SatelliteMesh({
  folded = false,
  leftPanelRef,
  rightPanelRef,
  ledRef,
  showLabels = false,
}: {
  folded?: boolean;
  leftPanelRef?: React.RefObject<THREE.Group | null>;
  rightPanelRef?: React.RefObject<THREE.Group | null>;
  ledRef?: React.RefObject<THREE.MeshBasicMaterial | null>;
  showLabels?: boolean;
}) {
  const foilFaces: Array<{ pos: [number, number, number]; rot: [number, number, number] }> = [
    { pos: [0, 0, 0.255], rot: [0, 0, 0] },
    { pos: [0, 0, -0.255], rot: [0, Math.PI, 0] },
    { pos: [0.255, 0, 0], rot: [0, Math.PI / 2, 0] },
    { pos: [-0.255, 0, 0], rot: [0, -Math.PI / 2, 0] },
    { pos: [0, 0.27, 0], rot: [-Math.PI / 2, 0, 0] },
  ];

  return (
    <group scale={folded ? 0.88 : 1}>
      {/* Central bus */}
      <mesh castShadow>
        <boxGeometry args={[0.46, 0.5, 0.46]} />
        <meshPhysicalMaterial color="#1c1c28" roughness={0.35} metalness={0.65} clearcoat={0.2} />
      </mesh>

      {/* Gold MLI thermal blankets */}
      {foilFaces.map(({ pos, rot }, i) => (
        <mesh key={`foil-${i}`} position={pos} rotation={rot}>
          <planeGeometry args={[0.42, i === 4 ? 0.42 : 0.48]} />
          <meshPhysicalMaterial
            color="#c9a227"
            roughness={0.04}
            metalness={0.96}
            clearcoat={1}
            clearcoatRoughness={0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Avionics bay detail */}
      <mesh position={[0.12, 0.05, 0.24]}>
        <boxGeometry args={[0.14, 0.08, 0.02]} />
        <meshStandardMaterial color="#222" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[-0.1, -0.08, 0.24]}>
        <boxGeometry args={[0.1, 0.06, 0.015]} />
        <meshStandardMaterial color="#333" roughness={0.45} metalness={0.55} />
      </mesh>

      {/* Star tracker dome */}
      <mesh position={[-0.15, 0.18, 0.2]}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshPhysicalMaterial color="#111" roughness={0.1} metalness={0.3} clearcoat={0.9} transparent opacity={0.85} />
      </mesh>

      {/* High-gain parabolic dish */}
      <group position={[0, 0.05, -0.12]} rotation={[-0.35, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.005, 0.18, 0.04, 24, 1, true, 0, Math.PI * 2]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.12} metalness={0.88} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.06, 0.04]}>
          <cylinderGeometry args={[0.008, 0.008, 0.14, 8]} />
          <meshStandardMaterial color="#ccc" roughness={0.2} metalness={0.75} />
        </mesh>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh key={`strut-${i}`} position={[Math.cos(a) * 0.08, 0.02, Math.sin(a) * 0.08 + 0.02]} rotation={[0.4, a, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.12, 6]} />
              <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.8} />
            </mesh>
          );
        })}
      </group>

      {/* Secondary omni antenna */}
      <mesh position={[0.2, 0.22, 0.15]} rotation={[0.4, 0.3, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.22, 6]} />
        <meshStandardMaterial color="#bbb" roughness={0.25} metalness={0.7} />
      </mesh>
      <mesh position={[0.2, 0.34, 0.19]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color="#ddd" roughness={0.15} metalness={0.8} />
      </mesh>

      {/* RCS thrusters */}
      {(
        [
          [0.24, 0.1, 0.18],
          [-0.24, -0.1, -0.18],
          [0.15, -0.26, 0.1],
          [-0.15, -0.26, -0.1],
        ] as [number, number, number][]
      ).map(([x, y, z], i) => (
        <mesh key={`rcs-${i}`} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.018, 0.035, 8]} />
          <meshStandardMaterial color="#444" roughness={0.25} metalness={0.9} />
        </mesh>
      ))}

      {/* Solar panel wings */}
      <SolarPanelWing side={-1} folded={folded} panelRef={leftPanelRef} />
      <SolarPanelWing side={1} folded={folded} panelRef={rightPanelRef} />

      {/* Status LEDs */}
      <mesh position={[0.18, 0.12, 0.24]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        {ledRef ? (
          <meshBasicMaterial ref={ledRef} color="#00ff44" toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#00ff44" toneMapped={false} />
        )}
      </mesh>
      <mesh position={[-0.14, 0.12, 0.24]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color="#3388ff" toneMapped={false} />
      </mesh>

      {/* Sun glint on bus — subtle, scene lighting carries most of the look */}
      <pointLight position={[0.3, 0.4, 0.5]} color="#ffe8b0" intensity={0.25} distance={2.5} decay={2} />

      {showLabels && (
        <group>
          <Billboard position={[1.4, 0.55, 0]}>
            <Text fontSize={0.18} color="#fbbf24" anchorX="left" outlineWidth={0.02} outlineColor="#000" font={undefined}>
              Satellite
            </Text>
          </Billboard>
          <Billboard position={[1.4, 0.3, 0]}>
            <Text fontSize={0.11} color="#4ade80" anchorX="left" outlineWidth={0.015} outlineColor="#000" font={undefined}>
              Systems Online
            </Text>
          </Billboard>
        </group>
      )}
    </group>
  );
}

/* ═══════ Satellite On Rocket (pre-deploy) ═══════ */
function SatelliteOnRocket({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <SatelliteMesh folded showLabels={false} />
    </group>
  );
}

/* ═══════ Satellite Deploy Sequence ═══════ */
function DeploySequence({
  groupY,
  rocketTilt,
  targetRef,
}: {
  groupY: number;
  rocketTilt: number;
  targetRef: React.MutableRefObject<THREE.Vector3>;
}) {
  const satRef = useRef<THREE.Group>(null);
  const stageRef = useRef<THREE.Group>(null);
  const leftPanelRef = useRef<THREE.Group>(null);
  const rightPanelRef = useRef<THREE.Group>(null);
  const ledRef = useRef<THREE.MeshBasicMaterial>(null);
  const elapsed = useRef(0);
  const panelAngle = useRef(0);
  const satStartY = groupY + 1.6;

  useEffect(() => {
    elapsed.current = 0;
    panelAngle.current = 0;
    targetRef.current.set(0, satStartY, 0);
  }, [groupY, satStartY, targetRef]);

  useFrame(({ clock }, delta) => {
    elapsed.current += delta;
    const t = elapsed.current;
    const deploy = Math.min(Math.max(0, t - 0.4) / 2.2, 1);
    const ease = 1 - Math.pow(1 - deploy, 3);

    if (stageRef.current) {
      stageRef.current.position.x = -ease * 1.8;
      stageRef.current.position.y = groupY - ease * 0.4;
      stageRef.current.position.z = -ease * 0.5;
      stageRef.current.rotation.z = rocketTilt - ease * 0.08;
    }

    if (satRef.current) {
      satRef.current.position.x = ease * 3;
      satRef.current.position.y = satStartY + ease * 0.6 + Math.sin(t * 0.25) * 0.08;
      satRef.current.position.z = ease * 1.2;
      satRef.current.rotation.y += delta * 0.12;
      satRef.current.getWorldPosition(targetRef.current);
    }

    if (t > 1) {
      panelAngle.current = Math.min(panelAngle.current + delta * 0.5, Math.PI * 0.42);
      if (leftPanelRef.current) leftPanelRef.current.rotation.z = -panelAngle.current;
      if (rightPanelRef.current) rightPanelRef.current.rotation.z = panelAngle.current;
    }

    if (ledRef.current) {
      ledRef.current.color.set(clock.elapsedTime * 4 % (Math.PI * 2) > Math.PI ? "#00ff44" : "#004400");
    }
  });

  return (
    <group>
      <group ref={stageRef} position={[0, groupY, 0]} rotation={[0, 0, rocketTilt]}>
        <SecondStageMesh showLabel />
        <Billboard position={[0.8, -0.5, 0]}>
          <Text fontSize={0.12} color="#666" anchorX="left" outlineWidth={0.015} outlineColor="#000" font={undefined}>
            2nd Stage (spent)
          </Text>
        </Billboard>
      </group>

      <group ref={satRef} position={[0, satStartY, 0]}>
        <SatelliteMesh
          leftPanelRef={leftPanelRef}
          rightPanelRef={rightPanelRef}
          ledRef={ledRef}
          showLabels
        />
      </group>
    </group>
  );
}

/* ═══════ Real-Time Smoke Particles ═══════ */
function createSoftParticleTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.55)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.15)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const SMOKE_TEXTURE = typeof document !== "undefined" ? createSoftParticleTexture() : null;

const smokeVertexShader = /* glsl */ `
  attribute float aLife;
  attribute float aSize;
  varying float vLife;
  void main() {
    vLife = aLife;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (420.0 / max(-mvPosition.z, 1.0));
    gl_PointSize = clamp(gl_PointSize, 1.0, 128.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const smokeFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform sampler2D uMap;
  uniform float uOpacity;
  varying float vLife;
  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    float alpha = tex.a * vLife * uOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

type SmokeConfig = {
  count: number;
  color: string;
  spawnSpread: [number, number, number];
  upwardSpeed: [number, number];
  lateralSpeed: number;
  turbulence: number;
  sizeRange: [number, number];
  lifeRange: [number, number];
  drag: number;
  riseAccel: number;
  opacity: number;
};

const PAD_SMOKE: SmokeConfig = {
  count: 650,
  color: "#e8e8e8",
  spawnSpread: [2.4, 0.15, 2.2],
  upwardSpeed: [1.2, 3.5],
  lateralSpeed: 1.8,
  turbulence: 2.2,
  sizeRange: [0.35, 1.8],
  lifeRange: [1.2, 2.8],
  drag: 0.985,
  riseAccel: 0.8,
  opacity: 0.55,
};

const TRENCH_SMOKE: SmokeConfig = {
  count: 450,
  color: "#d0d0d0",
  spawnSpread: [1.6, 0.1, 1.4],
  upwardSpeed: [0.8, 2.8],
  lateralSpeed: 1.4,
  turbulence: 1.8,
  sizeRange: [0.4, 2.2],
  lifeRange: [1.0, 2.4],
  drag: 0.988,
  riseAccel: 0.6,
  opacity: 0.5,
};

const EXHAUST_SMOKE: SmokeConfig = {
  count: 500,
  color: "#bdbdbd",
  spawnSpread: [0.35, 0.08, 0.35],
  upwardSpeed: [-6, -2.5],
  lateralSpeed: 0.9,
  turbulence: 1.5,
  sizeRange: [0.2, 1.4],
  lifeRange: [0.6, 1.8],
  drag: 0.992,
  riseAccel: -0.2,
  opacity: 0.45,
};

const TRAIL_SMOKE: SmokeConfig = {
  count: 380,
  color: "#c8c8c8",
  spawnSpread: [0.5, 0.12, 0.5],
  upwardSpeed: [-1.5, 0.5],
  lateralSpeed: 0.7,
  turbulence: 1.2,
  sizeRange: [0.25, 1.6],
  lifeRange: [0.8, 2.2],
  drag: 0.99,
  riseAccel: 0.15,
  opacity: 0.35,
};

function RealtimeSmokeParticles({
  active,
  intensity = 1,
  config,
  position = [0, 0, 0],
}: {
  active: boolean;
  intensity?: number;
  config: SmokeConfig;
  position?: [number, number, number];
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const { count } = config;

  const buffers = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const life = new Float32Array(count);
    const size = new Float32Array(count);
    const duration = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      life[i] = 0;
      size[i] = 0;
      duration[i] = 1;
    }
    return { pos, vel, life, size, duration };
  }, [count]);

  const material = useMemo(() => {
    if (!SMOKE_TEXTURE) return null;
    return new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: SMOKE_TEXTURE },
        uColor: { value: new THREE.Color(config.color) },
        uOpacity: { value: config.opacity },
      },
      vertexShader: smokeVertexShader,
      fragmentShader: smokeFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, [config.color, config.opacity]);

  const spawn = useCallback(
    (i: number) => {
      const [sx, sy, sz] = config.spawnSpread;
      buffers.pos[i * 3] = (Math.random() - 0.5) * sx * 2;
      buffers.pos[i * 3 + 1] = Math.random() * sy;
      buffers.pos[i * 3 + 2] = (Math.random() - 0.5) * sz * 2;
      buffers.vel[i * 3] = (Math.random() - 0.5) * config.lateralSpeed * intensity;
      buffers.vel[i * 3 + 1] =
        config.upwardSpeed[0] + Math.random() * (config.upwardSpeed[1] - config.upwardSpeed[0]);
      buffers.vel[i * 3 + 1] *= intensity;
      buffers.vel[i * 3 + 2] = (Math.random() - 0.5) * config.lateralSpeed * intensity;
      buffers.life[i] = 1;
      buffers.duration[i] =
        config.lifeRange[0] + Math.random() * (config.lifeRange[1] - config.lifeRange[0]);
      buffers.size[i] = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]) * 0.3;
    },
    [buffers, config, intensity],
  );

  useFrame((_, delta) => {
    if (!active || intensity <= 0 || !pointsRef.current) return;
    const dt = Math.min(delta, 0.05);
    const lifeAttr = pointsRef.current.geometry.getAttribute("aLife") as THREE.BufferAttribute;
    const sizeAttr = pointsRef.current.geometry.getAttribute("aSize") as THREE.BufferAttribute;
    const posAttr = pointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    if (!lifeAttr || !sizeAttr || !posAttr) return;

    for (let i = 0; i < count; i++) {
      buffers.life[i] -= dt / buffers.duration[i];

      if (buffers.life[i] <= 0) {
        spawn(i);
      } else {
        buffers.pos[i * 3] += buffers.vel[i * 3] * dt;
        buffers.pos[i * 3 + 1] += buffers.vel[i * 3 + 1] * dt;
        buffers.pos[i * 3 + 2] += buffers.vel[i * 3 + 2] * dt;
        buffers.vel[i * 3] += (Math.random() - 0.5) * config.turbulence * dt;
        buffers.vel[i * 3 + 2] += (Math.random() - 0.5) * config.turbulence * dt;
        buffers.vel[i * 3 + 1] += config.riseAccel * dt;
        buffers.vel[i * 3] *= config.drag;
        buffers.vel[i * 3 + 1] *= config.drag;
        buffers.vel[i * 3 + 2] *= config.drag;
        const lifeT = buffers.life[i];
        buffers.size[i] = THREE.MathUtils.lerp(
          config.sizeRange[0],
          config.sizeRange[1],
          1 - lifeT,
        );
      }
    }

    posAttr.needsUpdate = true;
    lifeAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;

    if (material) {
      material.uniforms.uOpacity.value = config.opacity * intensity;
    }
  });

  if (!active || intensity <= 0 || !material) return null;

  return (
    <points ref={pointsRef} position={position} frustumCulled={false} renderOrder={2}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[buffers.pos, 3]} />
        <bufferAttribute attach="attributes-aLife" args={[buffers.life, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[buffers.size, 1]} />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
}

/* ═══════ Animated Fire Beam Stack ═══════ */
function FireBeamStack({
  intensity,
  length = 6,
  baseWidth = 0.55,
  layers = 5,
}: {
  intensity: number;
  length?: number;
  baseWidth?: number;
  layers?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current || intensity <= 0) return;
    const flicker = 0.9 + Math.sin(clock.elapsedTime * 18) * 0.1 + Math.sin(clock.elapsedTime * 31) * 0.05;
    ref.current.scale.set(flicker, 1, flicker);
  });

  if (intensity <= 0) return null;

  const beamLayers: Array<{ radiusMul: number; lenMul: number; color: string; opacity: number }> = [
    { radiusMul: 0.22, lenMul: 0.35, color: "#eef6ff", opacity: 0.75 },
    { radiusMul: 0.38, lenMul: 0.55, color: "#88ccff", opacity: 0.55 },
    { radiusMul: 0.55, lenMul: 0.72, color: "#ff9933", opacity: 0.45 },
    { radiusMul: 0.75, lenMul: 0.88, color: "#ff6622", opacity: 0.3 },
    { radiusMul: 1.0, lenMul: 1.0, color: "#ff3300", opacity: 0.18 },
  ];

  return (
    <group ref={ref} rotation={[Math.PI, 0, 0]}>
      {beamLayers.slice(0, layers).map(({ radiusMul, lenMul, color, opacity }, i) => (
        <mesh key={i} position={[0, (length * lenMul) / 2, 0]}>
          <coneGeometry args={[baseWidth * radiusMul * intensity, length * lenMul * intensity, 16, 1, true]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity * intensity}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {/* Bright inner beam core (elongated) */}
      <mesh position={[0, length * 0.45 * intensity, 0]}>
        <cylinderGeometry args={[baseWidth * 0.12 * intensity, baseWidth * 0.28 * intensity, length * 0.9 * intensity, 12, 1, true]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.85 * intensity}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ═══════ Multi-Layer Exhaust Plume ═══════ */
function ExhaustPlume({ intensity, hasBooster }: { intensity: number; hasBooster: boolean }) {
  const coreRef = useRef<THREE.Points>(null);
  const outerRef = useRef<THREE.Points>(null);
  const coreCount = 550;
  const outerCount = 700;

  const core = useRef({
    pos: new Float32Array(coreCount * 3),
    vel: new Float32Array(coreCount * 3),
    life: new Float32Array(coreCount),
  }).current;

  const outer = useRef({
    pos: new Float32Array(outerCount * 3),
    vel: new Float32Array(outerCount * 3),
    life: new Float32Array(outerCount),
  }).current;

  useEffect(() => {
    const init = (p: Float32Array, v: Float32Array, l: Float32Array, n: number, spread: number, speedMul: number) => {
      for (let i = 0; i < n; i++) {
        p[i * 3] = (Math.random() - 0.5) * spread;
        p[i * 3 + 1] = -Math.random() * 2;
        p[i * 3 + 2] = (Math.random() - 0.5) * spread;
        v[i * 3] = (Math.random() - 0.5) * 0.5 * speedMul;
        v[i * 3 + 1] = -(2 + Math.random() * 4) * speedMul;
        v[i * 3 + 2] = (Math.random() - 0.5) * 0.5 * speedMul;
        l[i] = Math.random();
      }
    };
    init(core.pos, core.vel, core.life, coreCount, 0.15, 1.2);
    init(outer.pos, outer.vel, outer.life, outerCount, 0.4, 0.8);
  }, [core, outer]);

  useFrame((_, delta) => {
    if (intensity <= 0) return;

    const update = (ref: React.RefObject<THREE.Points | null>, p: Float32Array, v: Float32Array, l: Float32Array, n: number, spread: number, speedMul: number) => {
      if (!ref.current) return;
      const attr = ref.current.geometry.getAttribute("position");
      if (!attr) return;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < n; i++) {
        l[i] -= delta * (1.2 + Math.random());
        if (l[i] <= 0) {
          arr[i * 3] = (Math.random() - 0.5) * spread * intensity;
          arr[i * 3 + 1] = 0;
          arr[i * 3 + 2] = (Math.random() - 0.5) * spread * intensity;
          v[i * 3] = (Math.random() - 0.5) * 0.6 * speedMul * intensity;
          v[i * 3 + 1] = -(2 + Math.random() * 5) * speedMul * intensity;
          v[i * 3 + 2] = (Math.random() - 0.5) * 0.6 * speedMul * intensity;
          l[i] = 0.4 + Math.random() * 0.6;
        } else {
          arr[i * 3] += v[i * 3] * delta;
          arr[i * 3 + 1] += v[i * 3 + 1] * delta;
          arr[i * 3 + 2] += v[i * 3 + 2] * delta;
          v[i * 3] *= 0.995;
          v[i * 3 + 2] *= 0.995;
        }
      }
      attr.needsUpdate = true;
    };

    update(coreRef, core.pos, core.vel, core.life, coreCount, 0.18, 1.5);
    update(outerRef, outer.pos, outer.vel, outer.life, outerCount, 0.65, 1.1);
  });

  if (intensity <= 0) return null;

  const nozzleY = hasBooster ? -3.5 : -2.2;
  const beamLength = hasBooster ? 7.5 : 5.5;
  const beamWidth = hasBooster ? 0.62 : 0.42;

  return (
    <group position={[0, nozzleY, 0]}>
      {/* Main fire beam — large stacked cones */}
      <FireBeamStack intensity={intensity} length={beamLength} baseWidth={beamWidth} layers={5} />

      {/* Inner blue-white core */}
      <points ref={coreRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[core.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#aaccff"
          size={0.1 * intensity}
          sizeAttenuation transparent
          opacity={0.95 * intensity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Orange-yellow outer flame */}
      <points ref={outerRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[outer.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#FF8822"
          size={0.22 * intensity}
          sizeAttenuation transparent
          opacity={0.75 * intensity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <RealtimeSmokeParticles
        active={intensity > 0}
        intensity={intensity}
        config={EXHAUST_SMOKE}
        position={[0, -0.4, 0]}
      />
      <RealtimeSmokeParticles
        active={intensity > 0}
        intensity={intensity * 0.7}
        config={TRAIL_SMOKE}
        position={[0, 0.6, 0]}
      />

      {/* Extra outer flame halo cones */}
      <mesh rotation={[Math.PI, 0, 0]} position={[0, 3.2 * intensity, 0]}>
        <coneGeometry args={[0.85 * intensity, 6.5 * intensity, 16, 1, true]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.12 * intensity} blending={THREE.AdditiveBlending} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <pointLight color="#FF8844" intensity={22 * intensity} distance={18} decay={2} />
      <pointLight color="#aaccff" intensity={8 * intensity} distance={8} decay={2} />
      <pointLight position={[0, -2 * intensity, 0]} color="#ff6622" intensity={14 * intensity} distance={14} decay={2} />
    </group>
  );
}

/* ═══════ Launch Pad Smoke (ignition / liftoff) ═══════ */
function PadSmoke({ active, intensity = 1 }: { active: boolean; intensity?: number }) {
  return (
    <group>
      <RealtimeSmokeParticles
        active={active}
        intensity={intensity}
        config={PAD_SMOKE}
        position={[0, 0.15, 2.6]}
      />
      <RealtimeSmokeParticles
        active={active}
        intensity={intensity * 0.85}
        config={TRENCH_SMOKE}
        position={[0, 0.05, 3.2]}
      />
    </group>
  );
}

/* ═══════ Flame Trench Glow (ignition / liftoff) ═══════ */
function FlameTrenchGlow({ intensity }: { intensity: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current || intensity <= 0) return;
    const pulse = 0.88 + Math.sin(clock.elapsedTime * 14) * 0.12;
    ref.current.scale.setScalar(pulse);
  });

  if (intensity <= 0) return null;

  return (
    <group ref={ref} position={[0, 0.08, 2.8]}>
      {/* Upward fire beam from flame trench */}
      <group rotation={[Math.PI * 0.42, 0, 0]} position={[0, 0.2, 0.6]}>
        <FireBeamStack intensity={intensity} length={5} baseWidth={0.9} layers={4} />
      </group>
      {/* Side blast beams */}
      {[-1, 1].map((side) => (
        <group key={side} rotation={[Math.PI * 0.55, side * 0.35, 0]} position={[side * 0.5, 0.1, 0.4]}>
          <FireBeamStack intensity={intensity * 0.7} length={3.5} baseWidth={0.5} layers={3} />
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.4, 32]} />
        <meshBasicMaterial
          color="#ff5500"
          transparent
          opacity={0.65 * intensity}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 3.2, 32]} />
        <meshBasicMaterial
          color="#ffaa33"
          transparent
          opacity={0.45 * intensity}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 4.5, 32]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.2 * intensity}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#ff6622" intensity={28 * intensity} distance={16} decay={2} position={[0, 1.2, 0]} />
      <pointLight color="#ffaa44" intensity={16 * intensity} distance={12} decay={2} position={[0, 0.3, 1.5]} />
    </group>
  );
}

/* ═══════ Pad Status Beacons (pad / countdown) ═══════ */
function PadBeacons({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    const on = Math.sin(clock.elapsedTime * 3) > 0;
    ref.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
        child.material.opacity = i % 2 === 0 ? (on ? 1 : 0.2) : (on ? 0.2 : 1);
      }
    });
  });

  if (!active) return null;

  return (
    <group ref={ref}>
      <mesh position={[3.2, 14.2, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ff2200" toneMapped={false} transparent opacity={1} />
      </mesh>
      <pointLight position={[3.2, 14.2, 0]} color="#ff2200" intensity={2.5} distance={6} decay={2} />
      <mesh position={[-5, 2, -4]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ffaa00" toneMapped={false} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

/* ═══════ Max-Q Pressure Ring ═══════ */
function MaxQPressureRing({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current || !visible) return;
    const s = 1.1 + Math.sin(clock.elapsedTime * 6) * 0.06;
    ref.current.scale.set(s, s, s);
    ref.current.rotation.y = clock.elapsedTime * 0.5;
  });

  if (!visible) return null;

  return (
    <mesh ref={ref} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.75, 0.02, 8, 32]} />
      <meshBasicMaterial color="#88ccff" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

/* ═══════ Atmospheric Haze ═══════ */
function AtmosphereHaze({ altitude }: { altitude: number }) {
  const opacity = Math.max(0, 1 - altitude / 80000) * 0.35;
  if (opacity <= 0) return null;

  return (
    <group>
      {/* Blue sky dome */}
      <mesh position={[0, 15, 0]}>
        <sphereGeometry args={[50, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#2a5a9a" transparent opacity={opacity} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Horizon glow */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[20, 55, 48]} />
        <meshBasicMaterial color="#88aacc" transparent opacity={opacity * 0.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ═══════ Cloud Layer ═══════ */
const CLOUD_DATA = Array.from({ length: 18 }, (_, i) => ({
  x: ((i * 7 + 3) % 18 / 18 * 2 - 1) * 30,
  z: ((i * 11 + 5) % 18 / 18 * 2 - 1) * 30,
  y: ((i * 13) % 15) / 10,
  scale: 2 + ((i * 17) % 40) / 10,
  opMul: 0.3 + ((i * 19) % 30) / 100,
}));

function CloudLayer({ altitude }: { altitude: number }) {
  const visible = altitude > 2000 && altitude < 60000;
  const opacity = visible ? Math.min(1, (altitude - 2000) / 5000) * 0.6 : 0;
  if (!visible) return null;

  const cloudY = Math.max(2, 8 - altitude / 10000);

  return (
    <group position={[0, cloudY, 0]}>
      {CLOUD_DATA.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[c.scale, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={opacity * c.opMul} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════ Trajectory Path ═══════ */
function TrajectoryArc() {
  const lineObj = useMemo(() => {
    const pts = Array.from({ length: 100 }, (_, i) => {
      const t = i / 99;
      const y = t * 28;
      const curve = Math.pow(t, 2.2) * 8;
      return new THREE.Vector3(curve, y, 0);
    });
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({
      color: "#66aaff",
      dashSize: 0.25,
      gapSize: 0.12,
      transparent: true,
      opacity: 0.4,
    });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    return line;
  }, []);

  return <primitive object={lineObj} />;
}

/* ═══════ Altitude Markers ═══════ */
function AltitudeMarkers({ altitude }: { altitude: number }) {
  if (altitude < 5000) return null;
  const markers = [
    { alt: 12000, label: "12 km — Max-Q", y: 8 },
    { alt: 70000, label: "70 km — Kármán Line", y: 13 },
    { alt: 110000, label: "110 km — Fairing Sep", y: 17 },
    { alt: 400000, label: "400 km — LEO Orbit", y: 22 },
  ];
  return (
    <group>
      {markers.filter(m => m.alt <= altitude * 1.5).map(m => (
        <group key={m.label} position={[-3, m.y, 0]}>
          <mesh>
            <boxGeometry args={[4, 0.005, 0.005]} />
            <meshBasicMaterial color="#4488cc" transparent opacity={0.3} />
          </mesh>
          <Billboard position={[-2.5, 0.2, 0]}>
            <Text fontSize={0.14} color="#4488cc" anchorX="left" outlineWidth={0.015} outlineColor="#000" font={undefined}>
              {m.label}
            </Text>
          </Billboard>
        </group>
      ))}
    </group>
  );
}

/* ═══════ Booster mesh (reusable) ═══════ */
function BoosterMesh() {
  return (
    <group>
      <FirstStageFuelTanks />
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.565, 0.565, 0.3, 24]} />
        <meshStandardMaterial color="#cc2200" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, -2.6, 0]}>
        <cylinderGeometry args={[0.42, 0.58, 0.5, 24]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.8} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <mesh key={`gf-${i}`} position={[Math.cos(a) * 0.65, 2.3, Math.sin(a) * 0.65]} rotation={[0, -a, Math.PI / 4]}>
            <boxGeometry args={[0.6, 0.5, 0.03]} />
            <meshStandardMaterial color="#555" roughness={0.4} metalness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ═══════ Second stage mesh (reusable) ═══════ */
function SecondStageMesh({ showLabel }: { showLabel?: boolean }) {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.48, 0.5, 2.8, 24]} />
        <meshPhysicalMaterial color="#fafafa" roughness={0.2} metalness={0.45} clearcoat={0.3} />
      </mesh>
      <mesh position={[0, -1.6, 0]}>
        <cylinderGeometry args={[0.22, 0.48, 0.6, 16]} />
        <meshPhysicalMaterial color="#222" roughness={0.2} metalness={0.95} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.35, 0.22, 0.25, 16]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.2} metalness={0.95} />
      </mesh>
      {showLabel && (
        <Billboard position={[1.1, 0, 0]}>
          <Text fontSize={0.22} color="#94a3b8" anchorX="left" outlineWidth={0.02} outlineColor="#000" font={undefined}>
            2nd Stage
          </Text>
        </Billboard>
      )}
    </group>
  );
}

/* ═══════ Separation Flash (explosive bolts) ═══════ */
const SPARK_OFFSETS = Array.from({ length: 12 }, (_, i) => ({
  angle: (i / 12) * Math.PI * 2,
  yBias: (i % 3 - 1) * 0.15,
}));

function SeparationFlash({ position, active }: { position: [number, number, number]; active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const sparkRefs = useRef<(THREE.Mesh | null)[]>([]);
  const elapsed = useRef(0);

  useEffect(() => {
    elapsed.current = 0;
  }, [active, position[0], position[1], position[2]]);

  useFrame((_, delta) => {
    if (!active || !ref.current) return;
    elapsed.current += delta;
    const t = elapsed.current;
    const fade = Math.max(0, 1 - t * 0.55);
    const sparkFade = Math.max(0, 1 - t * 0.35);

    if (ringRef.current) {
      ringRef.current.scale.set(1 + t * 2.5, 1 + t * 2.5, 1);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = fade * 0.65;
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(0.3 * fade + 0.1);
      (coreRef.current.material as THREE.MeshBasicMaterial).opacity = fade * 0.85;
    }
    if (lightRef.current) lightRef.current.intensity = 14 * fade;

    sparkRefs.current.forEach((spark, i) => {
      if (!spark) return;
      const s = SPARK_OFFSETS[i];
      const r = t * 1.8;
      spark.position.set(Math.cos(s.angle) * r, s.yBias * r, Math.sin(s.angle) * r);
      spark.scale.setScalar(sparkFade);
      (spark.material as THREE.MeshBasicMaterial).opacity = sparkFade * 0.9;
    });

    ref.current.visible = fade > 0.02;
  });

  if (!active) return null;

  return (
    <group ref={ref} position={position}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.8, 24]} />
        <meshBasicMaterial color="#ffaa44" transparent opacity={0.65} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} blending={THREE.AdditiveBlending} toneMapped={false} depthWrite={false} />
      </mesh>
      {SPARK_OFFSETS.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { sparkRefs.current[i] = el; }}
        >
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshBasicMaterial color="#ffcc66" transparent opacity={0.9} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
      <pointLight ref={lightRef} color="#ffaa44" intensity={14} distance={10} decay={2} />
    </group>
  );
}

/* ═══════ Stage Separation Sequence ═══════ */
function StageSeparationSequence({
  groupY,
  rocketTilt,
  exhaustIntensity,
  showFairing,
}: {
  groupY: number;
  rocketTilt: number;
  exhaustIntensity: number;
  showFairing: boolean;
}) {
  const stageRef = useRef<THREE.Group>(null);
  const boosterRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const boosterStartY = groupY - 3.8;
  const sepY = groupY - 1.9;

  useEffect(() => {
    elapsed.current = 0;
  }, []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = elapsed.current;
    const sep = Math.max(0, t - 0.35);

    if (stageRef.current) {
      stageRef.current.position.y = groupY + Math.min(t * 1.2, 2);
      stageRef.current.position.x = sep * 0.15;
    }

    if (boosterRef.current) {
      boosterRef.current.position.y = boosterStartY - sep * sep * 0.45;
      boosterRef.current.position.x = -sep * 0.55;
      boosterRef.current.position.z = sep * 0.3;
      boosterRef.current.rotation.x = sep * 0.18;
      boosterRef.current.rotation.z = -sep * 0.12;
      boosterRef.current.rotation.y = sep * 0.06;
    }
  });

  return (
    <group>
      <SeparationFlash position={[0, sepY, 0]} active />

      <group ref={stageRef} position={[0, groupY, 0]} rotation={[0, 0, rocketTilt]}>
        <RocketBody showFairing={showFairing} showBooster={false} />
        <ExhaustPlume intensity={exhaustIntensity} hasBooster={false} />
      </group>

      <group ref={boosterRef} position={[0, boosterStartY, 0]}>
        <BoosterMesh />
        <RetroBurnEffect delay={0.5} />
        <Billboard position={[1.2, 0, 0]}>
          <Text fontSize={0.16} color="#ff8866" anchorX="left" outlineWidth={0.02} outlineColor="#000" font={undefined}>
            Booster Return
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

function RetroBurnEffect({ delay }: { delay: number }) {
  const coneRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const retroT = Math.max(0, elapsed.current - delay);
    const retroBurn = Math.max(0, 1 - retroT * 0.25);
    if (coneRef.current) {
      coneRef.current.visible = retroBurn > 0.08;
      coneRef.current.scale.set(0.18 * retroBurn, 0.7 * retroBurn, 0.18 * retroBurn);
      (coneRef.current.material as THREE.MeshBasicMaterial).opacity = retroBurn * 0.55;
    }
    if (lightRef.current) lightRef.current.intensity = 4 * retroBurn;
  });

  return (
    <group position={[0, 2.7, 0]}>
      <mesh ref={coneRef}>
        <coneGeometry args={[1, 1, 8]} />
        <meshBasicMaterial color="#88bbff" transparent opacity={0.55} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <pointLight ref={lightRef} color="#88bbff" intensity={0} distance={4} decay={2} />
    </group>
  );
}

/* ═══════ Detached Fairing Halves (dramatic tumble) ═══════ */
function DetachedFairings({ visible, startY }: { visible: boolean; startY: number }) {
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    if (visible) elapsed.current = 0;
  }, [visible, startY]);

  useFrame((_, delta) => {
    if (!visible) return;
    elapsed.current += delta;
    const t = elapsed.current;

    if (leftRef.current) {
      leftRef.current.position.x = -0.55 - t * 0.8 - t * t * 0.1;
      leftRef.current.position.y = startY - t * 0.15;
      leftRef.current.position.z = -t * 0.3;
      leftRef.current.rotation.z = -t * 0.2;
      leftRef.current.rotation.x = t * 0.15;
      leftRef.current.rotation.y = t * 0.08;
    }
    if (rightRef.current) {
      rightRef.current.position.x = 0.55 + t * 0.8 + t * t * 0.1;
      rightRef.current.position.y = startY - t * 0.15;
      rightRef.current.position.z = t * 0.3;
      rightRef.current.rotation.z = t * 0.2;
      rightRef.current.rotation.x = -t * 0.15;
      rightRef.current.rotation.y = -t * 0.08;
    }
  });

  if (!visible) return null;

  const glint = Math.abs(Math.sin(elapsed.current * 2));

  return (
    <group>
      <group ref={leftRef} position={[-0.55, startY, 0]}>
        <mesh>
          <coneGeometry args={[0.52, 2.6, 24, 1, false, 0, Math.PI]} />
          <meshPhysicalMaterial color="#f0f0f0" roughness={0.12} metalness={0.4} side={THREE.DoubleSide} clearcoat={0.5} />
        </mesh>
        <mesh position={[0.2, 0.5, 0.3]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={glint * 0.4} blending={THREE.AdditiveBlending} toneMapped={false} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <coneGeometry args={[0.48, 2.4, 24, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#333" roughness={0.6} metalness={0.4} side={THREE.BackSide} />
        </mesh>
        <Billboard position={[0.8, 0, 0]}>
          <Text fontSize={0.12} color="#888" anchorX="left" outlineWidth={0.015} outlineColor="#000" font={undefined}>
            Fairing L
          </Text>
        </Billboard>
      </group>
      <group ref={rightRef} position={[0.55, startY, 0]}>
        <mesh>
          <coneGeometry args={[0.52, 2.6, 24, 1, false, Math.PI, Math.PI]} />
          <meshPhysicalMaterial color="#f0f0f0" roughness={0.12} metalness={0.4} side={THREE.DoubleSide} clearcoat={0.5} />
        </mesh>
        <mesh position={[-0.2, 0.5, 0.3]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={glint * 0.35} blending={THREE.AdditiveBlending} toneMapped={false} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <coneGeometry args={[0.48, 2.4, 24, 1, false, Math.PI, Math.PI]} />
          <meshStandardMaterial color="#333" roughness={0.6} metalness={0.4} side={THREE.BackSide} />
        </mesh>
        <Billboard position={[-0.8, 0, 0]}>
          <Text fontSize={0.12} color="#888" anchorX="right" outlineWidth={0.015} outlineColor="#000" font={undefined}>
            Fairing R
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

/* ═══════ Earth with Atmosphere ═══════ */
function EarthWithAtmosphere({ altitude }: { altitude: number }) {
  if (altitude < 50000) return null;
  const scale = 22 + altitude / 12000;
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.01;
  });

  return (
    <group ref={ref} position={[0, -scale - 3, 0]}>
      {/* Earth sphere */}
      <mesh receiveShadow>
        <sphereGeometry args={[scale, 64, 64]} />
        <meshPhysicalMaterial
          color="#1a4488"
          roughness={0.85}
          metalness={0.05}
          emissive="#1a3366"
          emissiveIntensity={0.08}
          clearcoat={0.15}
        />
      </mesh>
      {/* Continents hint */}
      <mesh rotation={[0.3, 1.2, 0]}>
        <sphereGeometry args={[scale * 1.002, 32, 32]} />
        <meshStandardMaterial color="#2a6a3a" roughness={0.8} transparent opacity={0.4} />
      </mesh>
      {/* Atmosphere glow ring */}
      <mesh>
        <sphereGeometry args={[scale * 1.03, 64, 64]} />
        <meshBasicMaterial color="#4488cc" transparent opacity={0.12} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[scale * 1.06, 64, 64]} />
        <meshBasicMaterial color="#6699dd" transparent opacity={0.06} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Cloud layer on Earth */}
      <mesh rotation={[0.1, 0.5, 0]}>
        <sphereGeometry args={[scale * 1.01, 48, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ═══════ Countdown Timer ═══════ */
function CountdownOverlay({ phase }: { phase: string }) {
  const [count, setCount] = useState(10);

  useEffect(() => {
    if (phase !== "countdown") return;
    setCount(10);
    const id = setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  if (phase !== "countdown") return null;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
      <motion.div
        key={count}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="text-7xl sm:text-9xl font-black text-white/90 font-mono tabular-nums" style={{ textShadow: "0 0 40px rgba(255,100,0,0.5), 0 0 80px rgba(255,60,0,0.3)" }}>
          T-{count}
        </div>
        <p className="text-orange-300/70 text-sm mt-2 uppercase tracking-widest">Systems Go</p>
      </motion.div>
    </div>
  );
}

/* ═══════ Gravity Turn Animated Rocket ═══════ */
function GravityTurnRocket({
  showFairing,
  showBooster,
  exhaustIntensity,
}: {
  showFairing: boolean;
  showBooster: boolean;
  exhaustIntensity: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const posRef = useRef(new THREE.Vector3(0, 9, 0));

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    elapsed.current += delta;
    const t = elapsed.current;
    const speed = 2.5;
    const gravity = 0.8;

    const angle = Math.PI / 2 - Math.min(t * 0.08, 0.55);
    const vx = Math.cos(angle) * speed * t;
    const vy = Math.sin(angle) * speed * t - 0.5 * gravity * t * t;

    posRef.current.x = vx * 0.3;
    posRef.current.y = 9 + vy * 0.4;
    posRef.current.z = 0;

    groupRef.current.position.copy(posRef.current);
    const tiltAngle = -Math.min(t * 0.06, 0.5);
    groupRef.current.rotation.z = tiltAngle;
  });

  return (
    <group ref={groupRef} position={[0, 9, 0]}>
      <RocketBody showFairing={showFairing} showBooster={showBooster} />
      <ExhaustPlume intensity={exhaustIntensity} hasBooster={showBooster} />
    </group>
  );
}

/* ═══════ Projectile Motion Arc Visualization ═══════ */
function ProjectileMotionArc() {
  const arcObj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const speed = 2.5;
    const gravity = 0.8;
    for (let i = 0; i <= 120; i++) {
      const t = i * 0.15;
      const angle = Math.PI / 2 - Math.min(t * 0.08, 0.55);
      const vx = Math.cos(angle) * speed * t;
      const vy = Math.sin(angle) * speed * t - 0.5 * gravity * t * t;
      pts.push(new THREE.Vector3(vx * 0.3, 9 + vy * 0.4, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({
      color: "#44ff88",
      dashSize: 0.2,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.6,
    });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    return line;
  }, []);

  return <primitive object={arcObj} />;
}

/* ═══════ Force Vectors (Thrust + Gravity arrows) ═══════ */
function ForceVectors() {
  const groupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    elapsed.current += delta;
    const t = elapsed.current;
    const speed = 2.5;
    const gravity = 0.8;
    const angle = Math.PI / 2 - Math.min(t * 0.08, 0.55);
    const vx = Math.cos(angle) * speed * t;
    const vy = Math.sin(angle) * speed * t - 0.5 * gravity * t * t;
    groupRef.current.position.set(vx * 0.3, 9 + vy * 0.4, 0);
  });

  return (
    <group ref={groupRef} position={[0, 9, 0]}>
      {/* Thrust vector (red arrow, along rocket axis) */}
      <group rotation={[0, 0, 0.4]}>
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 2, 8]} />
          <meshBasicMaterial color="#ff4444" toneMapped={false} />
        </mesh>
        <mesh position={[0, 3.6, 0]}>
          <coneGeometry args={[0.08, 0.25, 8]} />
          <meshBasicMaterial color="#ff4444" toneMapped={false} />
        </mesh>
        <Billboard position={[0.5, 3, 0]}>
          <Text fontSize={0.18} color="#ff6666" anchorX="left" outlineWidth={0.02} outlineColor="#000" font={undefined}>
            Thrust (F)
          </Text>
        </Billboard>
      </group>

      {/* Gravity vector (blue arrow, straight down) */}
      <group>
        <mesh position={[0, -2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
          <meshBasicMaterial color="#4488ff" toneMapped={false} />
        </mesh>
        <mesh position={[0, -2.85, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.08, 0.25, 8]} />
          <meshBasicMaterial color="#4488ff" toneMapped={false} />
        </mesh>
        <Billboard position={[0.5, -2.5, 0]}>
          <Text fontSize={0.18} color="#6699ff" anchorX="left" outlineWidth={0.02} outlineColor="#000" font={undefined}>
            Gravity (mg)
          </Text>
        </Billboard>
      </group>

      {/* Velocity resultant (yellow arrow, tangent to path) */}
      <group rotation={[0, 0, -0.25]}>
        <mesh position={[2.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 2, 8]} />
          <meshBasicMaterial color="#ffcc00" toneMapped={false} />
        </mesh>
        <mesh position={[3.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.07, 0.22, 8]} />
          <meshBasicMaterial color="#ffcc00" toneMapped={false} />
        </mesh>
        <Billboard position={[3.5, 0.4, 0]}>
          <Text fontSize={0.16} color="#ffdd44" anchorX="left" outlineWidth={0.02} outlineColor="#000" font={undefined}>
            Velocity (v)
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

/* ═══════ Projectile Motion Formula Overlay ═══════ */
function ProjectileMotionOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="absolute top-1/2 right-3 sm:right-5 -translate-y-1/2 z-20 pointer-events-none max-w-[200px] sm:max-w-[240px]">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="glass-card rounded-2xl p-3 sm:p-4 border border-emerald-500/20 space-y-2.5"
      >
        <p className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Projectile Motion</p>
        <div className="space-y-1.5 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-slate-300">F<sub>thrust</sub> &gt; mg</span>
          </div>
          <div className="bg-white/5 rounded-lg px-2 py-1.5 text-slate-300">
            x = v₀·cos(θ)·t
          </div>
          <div className="bg-white/5 rounded-lg px-2 py-1.5 text-slate-300">
            y = v₀·sin(θ)·t − ½gt²
          </div>
        </div>
        <div className="pt-1.5 border-t border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
            <span className="text-slate-500">Thrust vector</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            <span className="text-slate-500">Gravity vector</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
            <span className="text-slate-500">Resultant velocity</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-sm bg-emerald-400 shrink-0" />
            <span className="text-slate-500">Parabolic path</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════ Altitude-Aware Scene Lighting ═══════ */
function computeLightingTargets(altitude: number, phase: RocketLaunchStage["phase"]) {
  const spaceBlend = THREE.MathUtils.smoothstep(altitude, 12000, 95000);
  const isLaunchFire = phase === "ignition" || phase === "liftoff";
  const earthBlend = altitude > 45000 ? THREE.MathUtils.smoothstep(altitude, 45000, 110000) : 0;

  return {
    spaceBlend,
    ambientIntensity: THREE.MathUtils.lerp(0.4, 0.07, spaceBlend),
    ambientColor: "#dce8f5",
    ambientColorSpace: "#0a0a14",
    sunIntensity: THREE.MathUtils.lerp(1.45, 2.75, spaceBlend) * (isLaunchFire ? 0.9 : 1),
    sunColor: "#fff7ed",
    sunColorSpace: "#ffffff",
    fillIntensity: THREE.MathUtils.lerp(0.32, 0.05, spaceBlend),
    rimIntensity: THREE.MathUtils.lerp(0.18, 0.35, spaceBlend),
    hemiIntensity: THREE.MathUtils.lerp(0.7, 0.18, spaceBlend),
    hemiSky: "#7eb8e8",
    hemiSkySpace: "#060610",
    hemiGround: "#3d5c36",
    hemiGroundSpace: "#08060f",
    earthBounceIntensity: earthBlend * 0.6,
    exposure: THREE.MathUtils.lerp(1.1, 1.38, spaceBlend),
    fogColor: "#2a4a6a",
    fogColorSpace: "#020208",
    fogNear: THREE.MathUtils.lerp(26, 50, spaceBlend),
    fogFar: THREE.MathUtils.lerp(82, 170, spaceBlend),
    bgColor: "#1e4468",
    bgColorSpace: "#02020a",
    envIntensity: THREE.MathUtils.lerp(0.32, 0.04, spaceBlend),
    padGlow: isLaunchFire ? 1 : 0,
  };
}

function LaunchSceneLighting({
  altitude,
  phase,
  showExhaust,
  exhaustIntensity,
  engineY,
}: {
  altitude: number;
  phase: RocketLaunchStage["phase"];
  showExhaust: boolean;
  exhaustIntensity: number;
  engineY: number;
}) {
  const { gl, scene } = useThree();
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const earthRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const padGlowRef = useRef<THREE.PointLight>(null);

  const targets = useMemo(() => computeLightingTargets(altitude, phase), [altitude, phase]);
  const current = useRef({ exposure: 1.1, spaceBlend: 0, padGlow: 0 });

  const palette = useMemo(
    () => ({
      ambientA: new THREE.Color(targets.ambientColor),
      ambientB: new THREE.Color(targets.ambientColorSpace),
      sunA: new THREE.Color(targets.sunColor),
      sunB: new THREE.Color(targets.sunColorSpace),
      hemiSkyA: new THREE.Color(targets.hemiSky),
      hemiSkyB: new THREE.Color(targets.hemiSkySpace),
      hemiGroundA: new THREE.Color(targets.hemiGround),
      hemiGroundB: new THREE.Color(targets.hemiGroundSpace),
      fogA: new THREE.Color(targets.fogColor),
      fogB: new THREE.Color(targets.fogColorSpace),
      bgA: new THREE.Color(targets.bgColor),
      bgB: new THREE.Color(targets.bgColorSpace),
    }),
    [targets],
  );

  const colors = useMemo(
    () => ({
      ambient: new THREE.Color(),
      sun: new THREE.Color(),
      hemiSky: new THREE.Color(),
      hemiGround: new THREE.Color(),
      fog: new THREE.Color(),
      bg: new THREE.Color(),
    }),
    [],
  );

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
  }, [gl]);

  useFrame((_, delta) => {
    const t = Math.min(delta * 2.5, 1);
    const tb = targets.spaceBlend;
    current.current.spaceBlend = THREE.MathUtils.lerp(current.current.spaceBlend, tb, t);
    current.current.exposure = THREE.MathUtils.lerp(current.current.exposure, targets.exposure, t);
    current.current.padGlow = THREE.MathUtils.lerp(current.current.padGlow, targets.padGlow, t);
    gl.toneMappingExposure = current.current.exposure;

    colors.ambient.lerpColors(palette.ambientA, palette.ambientB, current.current.spaceBlend);
    colors.sun.lerpColors(palette.sunA, palette.sunB, current.current.spaceBlend);
    colors.hemiSky.lerpColors(palette.hemiSkyA, palette.hemiSkyB, current.current.spaceBlend);
    colors.hemiGround.lerpColors(palette.hemiGroundA, palette.hemiGroundB, current.current.spaceBlend);
    colors.fog.lerpColors(palette.fogA, palette.fogB, current.current.spaceBlend);
    colors.bg.lerpColors(palette.bgA, palette.bgB, current.current.spaceBlend);

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        targets.ambientIntensity,
        t,
      );
      ambientRef.current.color.copy(colors.ambient);
    }
    if (sunRef.current) {
      sunRef.current.intensity = THREE.MathUtils.lerp(sunRef.current.intensity, targets.sunIntensity, t);
      sunRef.current.color.copy(colors.sun);
    }
    if (fillRef.current) {
      fillRef.current.intensity = THREE.MathUtils.lerp(fillRef.current.intensity, targets.fillIntensity, t);
    }
    if (rimRef.current) {
      rimRef.current.intensity = THREE.MathUtils.lerp(rimRef.current.intensity, targets.rimIntensity, t);
    }
    if (earthRef.current) {
      earthRef.current.intensity = THREE.MathUtils.lerp(
        earthRef.current.intensity,
        targets.earthBounceIntensity,
        t,
      );
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = THREE.MathUtils.lerp(hemiRef.current.intensity, targets.hemiIntensity, t);
      hemiRef.current.color.copy(colors.hemiSky);
      hemiRef.current.groundColor.copy(colors.hemiGround);
    }
    if (padGlowRef.current) {
      padGlowRef.current.intensity = 6 * current.current.padGlow * Math.max(exhaustIntensity, 0.5);
    }

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(colors.fog);
      scene.fog.near = THREE.MathUtils.lerp(scene.fog.near, targets.fogNear, t);
      scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, targets.fogFar, t);
    }
    scene.background = colors.bg;
  });

  return (
    <group>
      <Environment preset="sunset" environmentIntensity={targets.envIntensity} background={false} />

      <ambientLight ref={ambientRef} intensity={targets.ambientIntensity} color={targets.ambientColor} />

      {/* Primary sun — harsh in vacuum, softer through atmosphere */}
      <directionalLight
        ref={sunRef}
        position={[14, 22, 10]}
        intensity={targets.sunIntensity}
        color={targets.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={22}
        shadow-camera-bottom={-6}
        shadow-camera-near={0.5}
        shadow-camera-far={55}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
      />

      {/* Cool sky fill */}
      <directionalLight ref={fillRef} position={[-9, 12, -6]} intensity={targets.fillIntensity} color="#a8c8f0" />

      {/* Rim edge light — especially helps rocket read in space */}
      <directionalLight ref={rimRef} position={[-12, 8, -14]} intensity={targets.rimIntensity} color="#c8e0ff" />

      {/* Earth albedo bounce from below in orbit */}
      <directionalLight ref={earthRef} position={[0, -14, 4]} intensity={targets.earthBounceIntensity} color="#5577bb" />

      <hemisphereLight
        ref={hemiRef}
        args={[targets.hemiSky, targets.hemiGround, targets.hemiIntensity]}
      />

      {/* Pad / flame trench warm bounce during ignition & liftoff */}
      <pointLight
        ref={padGlowRef}
        position={[0, 1.2, 2]}
        color="#ff7733"
        intensity={0}
        distance={22}
        decay={2}
      />

      {/* Engine exhaust illumination */}
      {showExhaust && (
        <pointLight
          position={[0, engineY, 0]}
          intensity={22 * exhaustIntensity}
          color="#ff7722"
          distance={20}
          decay={2}
        />
      )}

      {/* Secondary exhaust fill (blue shock diamond hint) */}
      {showExhaust && exhaustIntensity > 0.4 && (
        <pointLight
          position={[0, engineY - 0.5, 0.5]}
          intensity={6 * exhaustIntensity}
          color="#88bbff"
          distance={8}
          decay={2}
        />
      )}

      {/* Distant sun disc visible once above the atmosphere */}
      {targets.spaceBlend > 0.45 && (
        <mesh position={[70, 110, 55]}>
          <sphereGeometry args={[2.8, 20, 20]} />
          <meshBasicMaterial color="#fff8ec" toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

/* ═══════ Scene Content ═══════ */
function SceneContent({
  stage,
  satelliteTargetRef,
}: {
  stage: RocketLaunchStage;
  satelliteTargetRef: React.MutableRefObject<THREE.Vector3>;
}) {
  const showUmbilicals =
    stage.showBooster &&
    (stage.phase === "pad" || stage.phase === "countdown" || stage.phase === "ignition");
  const showDetachedFairings = stage.phase === "fairing-sep";
  const showPadSmoke = stage.phase === "ignition" || stage.phase === "liftoff";
  const showFlameTrench = stage.phase === "ignition" || stage.phase === "liftoff";
  const showPadBeacons = stage.phase === "pad" || stage.phase === "countdown";
  const isGravityTurn = stage.phase === "gravity-turn";
  const groupY = rocketGroupY(stage.rocketY);
  const engineY = groupY - 3.2;

  const rocketTilt =
    stage.phase === "maxq" ? -0.15 :
    stage.phase === "stage-sep" ? -0.25 :
    stage.phase === "fairing-sep" ? -0.35 :
    stage.phase === "orbit" || stage.phase === "deploy" ? -0.5 :
    0;

  return (
    <group>
      <LaunchSceneLighting
        altitude={stage.altitude}
        phase={stage.phase}
        showExhaust={stage.showExhaust}
        exhaustIntensity={stage.exhaustIntensity}
        engineY={engineY}
      />

      {/* Environment */}
      <AtmosphereHaze altitude={stage.altitude} />
      <CloudLayer altitude={stage.altitude} />

      {stage.altitude < 50000 && <GroundTerrain />}
      {stage.altitude < 50000 && <LaunchPad />}
      {showPadBeacons && <PadBeacons active />}
      {showFlameTrench && <FlameTrenchGlow intensity={stage.exhaustIntensity} />}
      {showPadSmoke && (
        <PadSmoke active intensity={stage.exhaustIntensity} />
      )}

      {/* ── Gravity Turn: animated rocket following parabolic arc ── */}
      {isGravityTurn ? (
        <group>
          <GravityTurnRocket
            showFairing={stage.showFairing}
            showBooster={stage.showBooster}
            exhaustIntensity={stage.exhaustIntensity}
          />
          <ProjectileMotionArc />
          <ForceVectors />
        </group>
      ) : stage.phase === "stage-sep" ? (
        <StageSeparationSequence
          key="stage-sep"
          groupY={groupY}
          rocketTilt={rocketTilt}
          exhaustIntensity={stage.exhaustIntensity}
          showFairing={stage.showFairing}
        />
      ) : stage.phase === "deploy" ? (
        <DeploySequence
          key="deploy"
          groupY={groupY}
          rocketTilt={rocketTilt}
          targetRef={satelliteTargetRef}
        />
      ) : (
        <group position={[0, groupY, 0]} rotation={[0, 0, rocketTilt]}>
          <RocketBody
            showFairing={stage.showFairing}
            showBooster={stage.showBooster}
          />
          {showUmbilicals && <PropellantUmbilicals groupY={groupY} />}
          {stage.showExhaust && (
            <ExhaustPlume
              intensity={stage.exhaustIntensity}
              hasBooster={stage.showBooster}
            />
          )}
          {stage.phase === "maxq" && <MaxQPressureRing visible />}
        </group>
      )}

      {showDetachedFairings && (
        <group position={[0, groupY, 0]} rotation={[0, 0, rocketTilt]}>
          <DetachedFairings visible startY={fairingGroupY(false)} />
        </group>
      )}
      {stage.showTrajectory && <TrajectoryArc />}
      <AltitudeMarkers altitude={stage.altitude} />
      <EarthWithAtmosphere altitude={stage.altitude} />

      <Stars radius={400} depth={250} count={8000} factor={4} saturation={0.15} fade speed={0.02} />

      {stage.altitude < 50000 && (
        <ContactShadows
          position={[0, -0.14, 0]}
          opacity={0.72}
          scale={22}
          blur={2.8}
          far={10}
          frames={1}
          color="#0a1020"
        />
      )}
    </group>
  );
}

/* ═══════ Main Scene ═══════ */
export default function RocketLaunchScene() {
  const [showIntro, setShowIntro] = useState(true);
  const [experienceStarted, setExperienceStarted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [narration, setNarration] = useState(true);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const satelliteTargetRef = useRef(new THREE.Vector3());
  const { contextLost, canvasKey, onContextLost, remountCanvas } = useWebGLRecovery();

  const stage = ROCKET_LAUNCH_STAGES[currentStage];

  const shakeIntensity =
    stage.phase === "ignition" ? 0.6 :
    stage.phase === "liftoff" ? 1.0 :
    stage.phase === "gravity-turn" ? 0.7 :
    stage.phase === "maxq" ? 0.4 :
    stage.phase === "stage-sep" ? 0.8 :
    0;

  const goNext = useCallback(() => {
    setCurrentStage((s) => Math.min(s + 1, ROCKET_LAUNCH_STAGES.length - 1));
  }, []);
  const goPrev = useCallback(() => {
    setCurrentStage((s) => Math.max(s - 1, 0));
  }, []);

  useEffect(() => {
    if (showQuiz) setIsPlaying(false);
  }, [showQuiz]);

  useEffect(() => {
    if (!isPlaying || showIntro || showQuiz) return;
    const id = setInterval(goNext, 14000);
    return () => clearInterval(id);
  }, [isPlaying, showIntro, showQuiz, goNext]);

  useEffect(() => {
    if (!narration || showIntro || !experienceStarted) return;
    speak(`${stage.title}. ${stage.description} Fun fact: ${stage.funFact}`);
  }, [currentStage, narration, showIntro, experienceStarted, stage]);

  const handleQuizClose = useCallback(() => {
    setShowQuiz(false);
    if (!experienceStarted) setShowIntro(true);
  }, [experienceStarted]);

  const handleStartExperience = useCallback(() => {
    setShowQuiz(false);
    setShowIntro(false);
    setExperienceStarted(true);
    setIsPlaying(true);
  }, []);

  const phaseColor =
    stage.phase === "pad" || stage.phase === "countdown" ? "text-sky-300" :
    stage.phase === "ignition" || stage.phase === "liftoff" ? "text-orange-300" :
    stage.phase === "gravity-turn" ? "text-emerald-300" :
    stage.phase === "maxq" ? "text-red-300" :
    stage.phase === "stage-sep" || stage.phase === "fairing-sep" ? "text-amber-300" :
    "text-emerald-300";

  return (
    <div className="absolute inset-0">
      {!experienceStarted && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0c1222] to-orange-950/40" />
      )}

      {experienceStarted && contextLost && <WebGLRecoveryOverlay onReload={remountCanvas} />}

      {experienceStarted && (
      <Canvas
        key={canvasKey}
        camera={{ position: stage.camera, fov: 50 }}
        gl={{
          ...LIGHT_GL,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        dpr={[1, 1.5]}
        shadows
      >
        <fog attach="fog" args={["#2a4a6a", 26, 82]} />
        <WebGLContextHandler onContextLost={onContextLost} />

        <Suspense fallback={null}>
          <SceneContent stage={stage} satelliteTargetRef={satelliteTargetRef} />
        </Suspense>

        <CameraRig
          targetCamera={stage.camera}
          targetLookAt={stage.lookAt}
          controlsRef={controlsRef}
          shakeIntensity={shakeIntensity}
          trackTargetRef={stage.phase === "deploy" ? satelliteTargetRef : undefined}
          orbitMode={stage.phase === "deploy" ? { center: stage.lookAt, radius: 5.5, speed: 0.15 } : undefined}
        />
        <OrbitControls
          ref={controlsRef}
          enableZoom
          enablePan={false}
          minDistance={3}
          maxDistance={45}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
      )}

      {experienceStarted && (
        <>
          <CountdownOverlay phase={stage.phase} />
          <ProjectileMotionOverlay visible={stage.phase === "gravity-turn"} />
        </>
      )}

      {/* ═══════ Intro Modal ═══════ */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="glass-card rounded-3xl p-6 sm:p-10 max-w-lg w-full text-center border border-orange-500/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Satellite Launch Lab</h2>
                <p className="text-xs text-orange-300/60 uppercase tracking-widest mb-4">Interactive 3D Experience</p>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Experience every stage of a rocket launch — from countdown on the pad to satellite deployment in orbit.
                  Watch Newton&apos;s laws, thermodynamics, and orbital mechanics come alive in immersive 3D.
                  Finish with a 15-question quiz covering the whole process.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: Timer, label: "10 Stages", sub: "Step by step" },
                    { icon: Flame, label: "Real Physics", sub: "Thrust & orbit" },
                    { icon: ArrowUp, label: "400 km", sub: "To orbit" },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="glass-card rounded-xl p-2.5 border border-white/5">
                      <Icon className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                      <p className="text-[11px] font-semibold text-white">{label}</p>
                      <p className="text-[9px] text-slate-500">{sub}</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleStartExperience}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-orange-600/20 active:scale-[0.98]"
                >
                  Begin Launch Sequence
                </button>
                <button
                  type="button"
                  onClick={() => { setShowIntro(false); setShowQuiz(true); }}
                  className="mt-3 w-full py-2.5 rounded-xl border border-orange-500/30 hover:bg-orange-500/10 text-orange-300 font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Take Launch Quiz
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ Stage info card ═══════ */}
      {experienceStarted && !showIntro && (
        <div className="absolute bottom-20 sm:bottom-24 left-3 sm:left-5 z-20 max-w-xs sm:max-w-sm pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="pointer-events-auto glass-card rounded-2xl p-4 sm:p-5 border border-orange-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-red-500" />
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500/30 to-red-500/20 flex items-center justify-center text-[11px] font-bold text-orange-300 border border-orange-500/20">
                  {currentStage + 1}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">{stage.title}</h3>
                  <p className="text-[10px] text-orange-300/70 font-medium">{stage.subtitle}</p>
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed mb-3">{stage.description}</p>
              <div className="text-[10px] text-amber-400/70 bg-amber-500/8 rounded-lg p-2.5 border border-amber-500/10 flex gap-1.5">
                <span className="shrink-0">💡</span>
                <span>{stage.funFact}</span>
              </div>
              {stage.phase === "deploy" && (
                <button
                  type="button"
                  onClick={() => setShowQuiz(true)}
                  className="mt-3 w-full py-2 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/25 text-[11px] font-semibold text-orange-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Take Launch Quiz
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ═══════ Live telemetry ═══════ */}
      {experienceStarted && !showIntro && (
        <div className="absolute top-14 sm:top-16 right-3 sm:right-5 z-20 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-3 sm:p-4 border border-orange-500/15 min-w-[160px]"
          >
            <div className="flex items-center gap-1.5 mb-2.5">
              <Gauge className="w-3 h-3 text-orange-400" />
              <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Live Telemetry</p>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-500 text-[10px]">Altitude</span>
                  <span className="text-white font-mono font-semibold">
                    {stage.altitude >= 1000 ? `${(stage.altitude / 1000).toFixed(0)} km` : `${stage.altitude} m`}
                  </span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                    initial={false}
                    animate={{ width: `${Math.min(100, (stage.altitude / 400000) * 100)}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-500 text-[10px]">Speed</span>
                  <span className="text-white font-mono font-semibold">
                    {stage.speed >= 1000 ? `${(stage.speed / 1000).toFixed(1)} km/s` : `${stage.speed} m/s`}
                  </span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
                    initial={false}
                    animate={{ width: `${Math.min(100, (stage.speed / 27600) * 100)}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/5">
                <span className="text-slate-500 text-[10px]">Phase</span>
                <span className={`font-semibold capitalize text-[11px] ${phaseColor}`}>
                  {stage.phase.replace("-", " ")}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══════ Stage progress dots ═══════ */}
      {experienceStarted && !showIntro && (
        <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="flex items-center gap-1 glass-card rounded-full px-3 py-1.5 border border-white/10">
            {ROCKET_LAUNCH_STAGES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStage(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentStage
                    ? "w-6 h-2.5 bg-gradient-to-r from-orange-400 to-red-500"
                    : i < currentStage
                      ? "w-2.5 h-2.5 bg-orange-400/50 hover:bg-orange-400/70"
                      : "w-2.5 h-2.5 bg-white/15 hover:bg-white/25"
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══════ Controls bar ═══════ */}
      {experienceStarted && !showIntro && (
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="flex items-center gap-2 sm:gap-3 glass-card rounded-2xl px-4 sm:px-5 py-2.5 border border-white/10 shadow-xl shadow-black/20">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentStage === 0}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 transition-all shadow-lg shadow-orange-600/20 active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={currentStage === ROCKET_LAUNCH_STAGES.length - 1}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowQuiz(true)}
              className={`p-1.5 rounded-lg transition-all ${showQuiz ? "bg-orange-500/20 text-orange-300" : "hover:bg-white/10 text-slate-400 hover:text-orange-300"}`}
              title="Launch quiz"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-0.5" />
            <button
              type="button"
              onClick={() => setNarration((n) => !n)}
              className={`p-1.5 rounded-lg transition-all ${narration ? "bg-orange-500/15 text-orange-300" : "hover:bg-white/10 text-slate-400"}`}
            >
              {narration ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <span className="text-[10px] text-slate-500 hidden sm:inline ml-1 tabular-nums font-mono">
              {currentStage + 1}/{ROCKET_LAUNCH_STAGES.length}
            </span>
          </div>
        </div>
      )}

      <RocketLaunchQuiz
        open={showQuiz}
        onClose={handleQuizClose}
        standalone={!experienceStarted}
        onStartExperience={handleStartExperience}
      />
    </div>
  );
}
