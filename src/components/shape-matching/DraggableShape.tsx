"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import {
  RigidBody,
  RapierRigidBody,
  CuboidCollider,
  interactionGroups,
} from "@react-three/rapier";
import * as THREE from "three";
import gsap from "gsap";
import { ShapeMesh } from "./ShapeMesh";
import { useShapeMatching } from "./game-context";
import type { ShapeId } from "@/data/shape-matching-data";
import {
  BOARD_CENTER,
  BOARD_THICKNESS,
  BOARD_WIDTH,
  BOARD_DEPTH,
  SHAPE_DEPTH,
  SHAPE_SCALE,
  TABLE_Y,
  TABLE_WIDTH,
  TABLE_DEPTH,
  TRAY_CENTER,
  TRAY_WIDTH,
  TRAY_DEPTH,
  getPanelSurfaceY,
  clampToTableSurface,
} from "@/data/shape-matching-data";

const FLAT_ROTATION = { x: 0, y: 0, z: 0, w: 1 };
const ENV_COLLISION = interactionGroups(1, [2]);
const SHAPE_COLLISION = interactionGroups(2, [1]);

function flattenBody(body: RapierRigidBody) {
  body.setRotation(FLAT_ROTATION, true);
  body.setAngvel({ x: 0, y: 0, z: 0 }, true);
}

const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -getPanelSurfaceY());
const _raycaster = new THREE.Raycaster();
const _target = new THREE.Vector3();

interface DraggableShapeProps {
  id: ShapeId;
  color: string;
  initialPosition: [number, number, number];
  bodyRef?: (id: ShapeId, body: RapierRigidBody | null) => void;
}

export function DraggableShape({ id, color, initialPosition, bodyRef: registerBody }: DraggableShapeProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const { camera, pointer } = useThree();
  const [dragging, setDragging] = useState(false);
  const offset = useRef(new THREE.Vector3());

  const {
    onDragStart,
    onDragEnd,
    onDragMove,
    dragging: globalDragging,
    hoverValid,
    hoverSlot,
    successGlow,
  } = useShapeMatching();

  const isHoverTarget = hoverSlot === id && globalDragging === id;
  const glow = successGlow === id;
  const emissiveIntensity = glow ? 0.45 : isHoverTarget ? (hoverValid ? 0.28 : 0.18) : dragging ? 0.12 : 0;

  const pointerToTable = (out: THREE.Vector3) => {
    _raycaster.setFromCamera(pointer, camera);
    _raycaster.ray.intersectPlane(_plane, out);
    return out;
  };

  useFrame(() => {
    if (!dragging || !bodyRef.current) return;
    pointerToTable(_target);
    _target.add(offset.current);
    const clamped = clampToTableSurface(_target.x, _target.z);
    _target.x = clamped.x;
    _target.z = clamped.z;
    _target.y = getPanelSurfaceY() + SHAPE_DEPTH / 2 + 0.02;
    bodyRef.current.setNextKinematicTranslation(_target);
    flattenBody(bodyRef.current);
    onDragMove(id, [_target.x, _target.y, _target.z]);
  });

  const handlePointerDown = (e: THREE.Event & { stopPropagation: () => void; pointerId: number }) => {
    e.stopPropagation();
    const body = bodyRef.current;
    if (!body) return;
    setDragging(true);
    onDragStart(id);
    body.setEnabledTranslations(true, true, true, true);
    body.setBodyType(2, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    flattenBody(body);
    pointerToTable(_target);
    const t = body.translation();
    offset.current.set(t.x - _target.x, 0, t.z - _target.z);
    (e.target as unknown as Element & { setPointerCapture?: (id: number) => void })?.setPointerCapture?.(
      e.pointerId,
    );
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const body = bodyRef.current;
    if (!body) return;
    const t = body.translation();
    body.setBodyType(0, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.setEnabledTranslations(false, false, false, true);
    flattenBody(body);
    onDragEnd(id, [t.x, t.y, t.z]);
  };

  return (
    <RigidBody
      ref={(rb) => {
        bodyRef.current = rb;
        registerBody?.(id, rb);
      }}
      position={initialPosition}
      rotation={[0, 0, 0]}
      enabledRotations={[false, false, false]}
      colliders={false}
      collisionGroups={SHAPE_COLLISION}
      gravityScale={0}
      lockTranslations={!dragging}
      linearDamping={0.96}
      angularDamping={0.98}
      friction={0.92}
      restitution={0.02}
      mass={0.35}
    >
      <CuboidCollider args={[0.38, SHAPE_DEPTH / 2, 0.38]} collisionGroups={SHAPE_COLLISION} />
      <group
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        scale={dragging ? 1.04 : 1}
      >
        <ShapeMesh
          shapeId={id}
          color={color}
          scale={SHAPE_SCALE}
          emissive={isHoverTarget && !hoverValid ? "#ef4444" : color}
          emissiveIntensity={emissiveIntensity}
        />
      </group>
    </RigidBody>
  );
}

/** Snap a shape into its matching hole on the board. */
function animateSnapToHole(
  target: THREE.Object3D,
  holePos: [number, number, number],
  onComplete?: () => void,
) {
  const proxy = { x: target.position.x, y: target.position.y, z: target.position.z };
  const apply = () => target.position.set(proxy.x, proxy.y, proxy.z);

  return gsap.to(proxy, {
    x: holePos[0],
    y: holePos[1],
    z: holePos[2],
    duration: 0.42,
    ease: "back.out(1.4)",
    onUpdate: apply,
    onComplete: () => {
      target.position.set(holePos[0], holePos[1], holePos[2]);
      target.rotation.set(0, 0, 0);
      onComplete?.();
    },
  });
}

export interface SnapToHoleProps {
  id: ShapeId;
  color: string;
  start: [number, number, number];
  hole: [number, number, number];
  onComplete: () => void;
}

/** Visual snap animation when a shape is placed in the correct hole. */
export function SnapToHoleShape({ id, color, start, hole, onComplete }: SnapToHoleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.position.set(start[0], start[1], start[2]);
    group.rotation.set(0, 0, 0);
    const tween = animateSnapToHole(group, hole, () => onCompleteRef.current());
    return () => {
      tween?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per snap instance
  }, [id]);

  return (
    <group ref={groupRef}>
      <ShapeMesh shapeId={id} color={color} scale={SHAPE_SCALE} emissiveIntensity={0.18} />
    </group>
  );
}

export function TableCollider() {
  const trayHalfW = TRAY_WIDTH / 2;
  const trayHalfD = TRAY_DEPTH / 2;

  return (
    <>
      <RigidBody type="fixed" colliders={false} position={[0, TABLE_Y - 0.1, 0]} collisionGroups={ENV_COLLISION}>
        <CuboidCollider
          args={[TABLE_WIDTH / 2, 0.1, TABLE_DEPTH / 2]}
          friction={0.95}
          restitution={0.02}
          collisionGroups={ENV_COLLISION}
        />
      </RigidBody>
      {/* Board top */}
      <RigidBody
        type="fixed"
        colliders={false}
        position={[BOARD_CENTER[0], getPanelSurfaceY() - 0.02, BOARD_CENTER[2]]}
        collisionGroups={ENV_COLLISION}
      >
        <CuboidCollider
          args={[BOARD_WIDTH / 2, 0.03, BOARD_DEPTH / 2]}
          friction={0.95}
          restitution={0.02}
          collisionGroups={ENV_COLLISION}
        />
      </RigidBody>
      {/* Tray top — same surface height as board */}
      <RigidBody
        type="fixed"
        colliders={false}
        position={[TRAY_CENTER[0], getPanelSurfaceY() - 0.02, TRAY_CENTER[2]]}
        collisionGroups={ENV_COLLISION}
      >
        <CuboidCollider
          args={[trayHalfW, 0.03, trayHalfD]}
          friction={0.95}
          restitution={0.02}
          collisionGroups={ENV_COLLISION}
        />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[TRAY_CENTER[0] + trayHalfW + 0.04, TABLE_Y + 0.12, TRAY_CENTER[2]]}
        collisionGroups={ENV_COLLISION}
      >
        <CuboidCollider args={[0.05, 0.18, trayHalfD + 0.1]} collisionGroups={ENV_COLLISION} />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[TRAY_CENTER[0], TABLE_Y + 0.12, TRAY_CENTER[2] - trayHalfD - 0.04]}
        collisionGroups={ENV_COLLISION}
      >
        <CuboidCollider args={[trayHalfW + 0.1, 0.18, 0.05]} collisionGroups={ENV_COLLISION} />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[TRAY_CENTER[0], TABLE_Y + 0.12, TRAY_CENTER[2] + trayHalfD + 0.04]}
        collisionGroups={ENV_COLLISION}
      >
        <CuboidCollider args={[trayHalfW + 0.1, 0.18, 0.05]} collisionGroups={ENV_COLLISION} />
      </RigidBody>
    </>
  );
}

export function PlacedShape({ id, color, position }: { id: ShapeId; color: string; position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0, 0]}>
      <ShapeMesh shapeId={id} color={color} scale={SHAPE_SCALE} emissiveIntensity={0.06} />
    </group>
  );
}

/** @deprecated Use PlacedShape */
export function CollectedShape(props: { id: ShapeId; color: string; position: [number, number, number] }) {
  return <PlacedShape {...props} />;
}

/** @deprecated Use PlacedShape */
export function LockedShape(props: { id: ShapeId; color: string; position: [number, number, number] }) {
  return <PlacedShape {...props} />;
}
