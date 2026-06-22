"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import {
  createCavityGeometry,
  createExtrudedShape,
  createFlatShapeGeometry,
  createHoleRimGeometry,
  getShapeOutlinePoints,
  orientShapeGeometry,
} from "@/lib/shape-profiles";
import { HOLE_DEPTH, SHAPE_DEPTH } from "@/data/shape-matching-data";

interface ShapeMeshProps {
  shapeId: string;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  scale?: number;
}

export function ShapeMesh({ shapeId, color, emissive, emissiveIntensity = 0, scale = 1 }: ShapeMeshProps) {
  const geometry = useMemo(() => {
    const geo = createExtrudedShape(shapeId, SHAPE_DEPTH, scale);
    return orientShapeGeometry(geo);
  }, [shapeId, scale]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        roughness={0.35}
        metalness={0.05}
        emissive={emissive ?? color}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

const holeSurfaceMat = {
  polygonOffset: true,
  polygonOffsetFactor: -2,
  polygonOffsetUnits: -2,
} as const;

/** 3D routed wooden puzzle hole — rim, chamfered walls, and dark floor. */
export function HoleOutline({ shapeId }: { shapeId: string }) {
  const { cavityGeo, floorY } = useMemo(() => {
    const geo = createCavityGeometry(shapeId, HOLE_DEPTH, 1.015);
    geo.computeBoundingBox();
    const minY = geo.boundingBox?.min.y ?? -HOLE_DEPTH;
    return { cavityGeo: geo, floorY: minY + 0.006 };
  }, [shapeId]);
  const floorGeo = useMemo(() => createFlatShapeGeometry(shapeId, 1.0, 32), [shapeId]);

  const rimGeo = useMemo(() => createHoleRimGeometry(shapeId, 1.06, 1.015), [shapeId]);

  const outerEdge = useMemo(() => getShapeOutlinePoints(shapeId, 1.03), [shapeId]);

  return (
    <group>
      {/* Wood rim — slightly above cavity opening to avoid z-fighting with board */}
      <mesh geometry={rimGeo} position={[0, 0.008, 0]} renderOrder={3} receiveShadow>
        <meshStandardMaterial color="#c4956a" roughness={0.72} metalness={0.02} {...holeSurfaceMat} />
      </mesh>

      {/* Recessed cavity */}
      <mesh geometry={cavityGeo} position={[0, -0.012, 0]} renderOrder={1} castShadow receiveShadow>
        <meshStandardMaterial color="#5c3d22" roughness={0.92} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Cavity floor — well below opening */}
      <mesh geometry={floorGeo} position={[0, floorY, 0]} renderOrder={0}>
        <meshStandardMaterial color="#2a1810" roughness={1} metalness={0} />
      </mesh>

      <Line points={outerEdge} position={[0, 0.01, 0]} color="#8b6914" lineWidth={2} renderOrder={5} />
    </group>
  );
}

export function SlotGlowRing({
  shapeId,
  color,
  scale = 1.08,
}: {
  shapeId: string;
  color: string;
  scale?: number;
}) {
  const geometry = useMemo(() => createFlatShapeGeometry(shapeId, scale, 28), [shapeId, scale]);

  return (
    <mesh geometry={geometry} position={[0, 0.028, 0]} renderOrder={10}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.4}
        depthWrite={false}
        depthTest={true}
        toneMapped={false}
      />
    </mesh>
  );
}
