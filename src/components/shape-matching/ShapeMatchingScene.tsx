"use client";

import { ContactShadows, Environment, OrbitControls, RoundedBox, Text } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Suspense, useMemo, useCallback } from "react";
import type { RapierRigidBody } from "@react-three/rapier";
import {
  SHAPES,
  BOARD_CENTER,
  TRAY_CENTER,
  TABLE_Y,
  TABLE_WIDTH,
  TABLE_DEPTH,
  TABLE_BODY_HEIGHT,
  TABLE_MAT_THICKNESS,
  BOARD_THICKNESS,
  BOARD_WIDTH,
  BOARD_DEPTH,
  TRAY_WIDTH,
  TRAY_DEPTH,
  PLAY_CENTER_X,
  getBoardSlotLocalPositions,
  type ShapeId,
} from "@/data/shape-matching-data";
import { ShapeMatchingContext } from "./game-context";
import { ShapeMatchingBackdrop } from "./ShapeMatchingBackdrop";
import { DraggableShape, TableCollider, PlacedShape, SnapToHoleShape } from "./DraggableShape";
import { HoleOutline, SlotGlowRing } from "./ShapeMesh";

interface SnapAnim {
  start: [number, number, number];
  hole: [number, number, number];
}

interface ShapeMatchingSceneProps {
  trayPositions: Map<ShapeId, [number, number, number]>;
  placedPositions: Map<ShapeId, [number, number, number]>;
  snappingShapes: Map<ShapeId, SnapAnim>;
  onSnapComplete: (id: ShapeId, holePos: [number, number, number]) => void;
  gameState: {
    placed: Set<ShapeId>;
    locked: Set<ShapeId>;
    dragging: ShapeId | null;
    hoverSlot: ShapeId | null;
    hoverValid: boolean;
    wrongFlash: ShapeId | null;
    successGlow: ShapeId | null;
    completed: boolean;
    xp: number;
  };
  onDragStart: (id: ShapeId) => void;
  onDragEnd: (id: ShapeId, position: [number, number, number]) => void;
  onDragMove: (id: ShapeId, position: [number, number, number]) => void;
  getSlotWorldPosition: (id: ShapeId) => [number, number, number];
  isLocked: (id: ShapeId) => boolean;
  bodyRefs: React.MutableRefObject<Map<ShapeId, RapierRigidBody>>;
}

function EnvironmentScene({
  trayPositions,
  placedPositions,
  snappingShapes,
  onSnapComplete,
  gameState,
  onDragStart,
  onDragEnd,
  onDragMove,
  getSlotWorldPosition,
  isLocked,
  bodyRefs,
}: ShapeMatchingSceneProps) {
  const slots = useMemo(() => getBoardSlotLocalPositions(), []);
  const isDragging = gameState.dragging !== null;
  const orbitTarget = useMemo(
    () => [PLAY_CENTER_X, TABLE_Y + BOARD_THICKNESS / 2, 0] as [number, number, number],
    [],
  );

  const registerBody = useCallback(
    (id: ShapeId, body: RapierRigidBody | null) => {
      if (body) bodyRefs.current.set(id, body);
      else bodyRefs.current.delete(id);
    },
    [bodyRefs],
  );

  const ctx = useMemo(
    () => ({
      ...gameState,
      onDragStart,
      onDragEnd,
      onDragMove,
      getSlotWorldPosition,
      isLocked,
    }),
    [gameState, onDragStart, onDragEnd, onDragMove, getSlotWorldPosition, isLocked],
  );

  return (
    <ShapeMatchingContext.Provider value={ctx}>
      <color attach="background" args={["#ffedd5"]} />
      <fog attach="fog" args={["#ffedd5", 14, 32]} />

      <ShapeMatchingBackdrop />

      <hemisphereLight args={["#bae6fd", "#fed7aa", 0.6]} />
      <ambientLight intensity={0.32} color="#fffbeb" />
      <directionalLight
        position={[5, 11, 7]}
        intensity={1.25}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={28}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.0002}
        color="#fff7ed"
      />
      <directionalLight position={[-5, 6, -4]} intensity={0.45} color="#bfdbfe" />
      <pointLight position={[0, 5, 4]} intensity={0.35} color="#fef08a" distance={18} decay={2} />
      <Environment preset="city" environmentIntensity={0.22} />

      {/* Table — red-brown mat sits just below puzzle board & tray */}
      <mesh position={[0, TABLE_Y - TABLE_BODY_HEIGHT / 2 - 0.02, 0]} receiveShadow>
        <boxGeometry args={[TABLE_WIDTH, TABLE_BODY_HEIGHT, TABLE_DEPTH]} />
        <meshStandardMaterial color="#92400e" roughness={0.75} />
      </mesh>
      <mesh position={[0, TABLE_Y - TABLE_MAT_THICKNESS / 2, 0]} receiveShadow>
        <boxGeometry args={[TABLE_WIDTH - 0.15, TABLE_MAT_THICKNESS, TABLE_DEPTH - 0.12]} />
        <meshStandardMaterial
          color="#b45309"
          roughness={0.45}
          metalness={0.05}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>

      {/* Puzzle board — top face at local y = BOARD_THICKNESS */}
      <group position={BOARD_CENTER}>
        <RoundedBox
          args={[BOARD_WIDTH, BOARD_THICKNESS, BOARD_DEPTH]}
          radius={0.04}
          smoothness={4}
          position={[0, BOARD_THICKNESS / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#d4a574"
            roughness={0.65}
            metalness={0.02}
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </RoundedBox>
        <Text position={[0, BOARD_THICKNESS + 0.14, -BOARD_DEPTH / 2 - 0.14]} fontSize={0.14} color="#78350f" anchorX="center">
          Puzzle Board
        </Text>
        {slots.map((slot) => {
          const showGreen = gameState.successGlow === slot.id;
          const showRed = gameState.wrongFlash === slot.id;
          const showHover =
            gameState.hoverSlot === slot.id && gameState.dragging !== null;
          return (
            <group key={slot.id} position={[slot.x, BOARD_THICKNESS - 0.02, slot.z]}>
              <HoleOutline shapeId={slot.id} />
              {gameState.locked.has(slot.id) && (
                <SlotGlowRing shapeId={slot.id} color="#86efac" scale={1.04} />
              )}
              {showGreen && <SlotGlowRing shapeId={slot.id} color="#4ade80" scale={1.1} />}
              {showRed && <SlotGlowRing shapeId={slot.id} color="#ef4444" scale={1.08} />}
              {showHover && gameState.hoverValid && (
                <SlotGlowRing shapeId={slot.id} color="#86efac" scale={1.12} />
              )}
              {showHover && !gameState.hoverValid && (
                <SlotGlowRing shapeId={slot.id} color="#fca5a5" scale={1.08} />
              )}
            </group>
          );
        })}
      </group>

      {/* Shape tray — same thickness, depth, and surface height as puzzle board */}
      <group position={TRAY_CENTER}>
        <RoundedBox
          args={[TRAY_WIDTH, BOARD_THICKNESS, TRAY_DEPTH]}
          radius={0.04}
          smoothness={4}
          position={[0, BOARD_THICKNESS / 2, 0]}
          receiveShadow
        >
          <meshStandardMaterial color="#c4a574" roughness={0.7} />
        </RoundedBox>
        <Text position={[0, BOARD_THICKNESS + 0.14, -TRAY_DEPTH / 2 - 0.14]} fontSize={0.14} color="#78350f" anchorX="center">
          Shape Tray
        </Text>
      </group>

      <Physics gravity={[0, -9.81, 0]} timeStep="vary">
        <TableCollider />
        {SHAPES.map((shape) =>
          isLocked(shape.id) || snappingShapes.has(shape.id) ? null : (
            <DraggableShape
              key={shape.id}
              id={shape.id}
              color={shape.color}
              initialPosition={trayPositions.get(shape.id) ?? [TRAY_CENTER[0], TABLE_Y + 0.2, TRAY_CENTER[2]]}
              bodyRef={registerBody}
            />
          ),
        )}
      </Physics>

      {Array.from(snappingShapes.entries()).map(([id, anim]) => {
        const info = SHAPES.find((s) => s.id === id)!;
        return (
          <SnapToHoleShape
            key={`snap-${id}`}
            id={id}
            color={info.color}
            start={anim.start}
            hole={anim.hole}
            onComplete={() => onSnapComplete(id, anim.hole)}
          />
        );
      })}

      {Array.from(placedPositions.entries()).map(([id, pos]) => {
        const info = SHAPES.find((s) => s.id === id)!;
        return <PlacedShape key={`placed-${id}`} id={id} color={info.color} position={pos} />;
      })}

      <ContactShadows
        position={[0, TABLE_Y - 0.02, 0]}
        opacity={0.5}
        scale={16}
        blur={2.8}
        far={5}
        color="#5c3d22"
      />

      <OrbitControls
        makeDefault
        enabled={!isDragging}
        target={orbitTarget}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={5.5}
        maxDistance={11}
      />
    </ShapeMatchingContext.Provider>
  );
}

export default function ShapeMatchingScene(props: ShapeMatchingSceneProps) {
  return (
    <Suspense fallback={null}>
      <EnvironmentScene {...props} />
    </Suspense>
  );
}
