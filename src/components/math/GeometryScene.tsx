"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Grid, Edges } from "@react-three/drei";
import CoordinateAxes from "@/components/three/CoordinateAxes";
import * as THREE from "three";
import type { ShapeId } from "@/data/geometry-shapes";

interface GeometrySceneProps {
  shapeId: ShapeId;
  params: Record<string, number>;
  color: string;
  wireframe: boolean;
  showEdges: boolean;
  autoRotate: boolean;
}

function ShapeMesh({
  shapeId,
  params,
  color,
  wireframe,
  showEdges,
}: Omit<GeometrySceneProps, "autoRotate">) {
  const p = params;

  const material = (
    <meshStandardMaterial
      color={color}
      wireframe={wireframe}
      metalness={0.25}
      roughness={0.35}
      envMapIntensity={0.7}
      side={shapeId === "plane" || shapeId === "ring" || shapeId === "circle" ? THREE.DoubleSide : THREE.FrontSide}
    />
  );

  const edges = showEdges && !wireframe ? <Edges color="#c4b5fd" threshold={15} /> : null;

  switch (shapeId) {
    case "sphere":
      return (
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[p.radius, p.widthSegments, p.heightSegments]} />
          {material}
          {edges}
        </mesh>
      );
    case "box":
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[p.width, p.height, p.depth]} />
          {material}
          {edges}
        </mesh>
      );
    case "cylinder":
      return (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[p.radiusTop, p.radiusBottom, p.height, p.radialSegments]} />
          {material}
          {edges}
        </mesh>
      );
    case "cone":
      return (
        <mesh castShadow receiveShadow>
          <coneGeometry args={[p.radius, p.height, p.radialSegments]} />
          {material}
          {edges}
        </mesh>
      );
    case "torus":
      return (
        <mesh castShadow receiveShadow>
          <torusGeometry args={[p.radius, p.tube, p.radialSegments, p.tubularSegments]} />
          {material}
          {edges}
        </mesh>
      );
    case "torusKnot":
      return (
        <mesh castShadow receiveShadow>
          <torusKnotGeometry args={[p.radius, p.tube, p.p, p.q, p.tubularSegments, p.radialSegments]} />
          {material}
          {edges}
        </mesh>
      );
    case "plane":
      return (
        <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[p.width, p.height, p.widthSegments, p.heightSegments]} />
          {material}
          {edges}
        </mesh>
      );
    case "ring":
      return (
        <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[p.innerRadius, p.outerRadius, p.thetaSegments]} />
          {material}
          {edges}
        </mesh>
      );
    case "circle":
      return (
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[p.radius, p.segments]} />
          {material}
          {edges}
        </mesh>
      );
    case "capsule":
      return (
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[p.radius, p.length, p.capSegments, p.radialSegments]} />
          {material}
          {edges}
        </mesh>
      );
    case "tetrahedron":
      return (
        <mesh castShadow receiveShadow>
          <tetrahedronGeometry args={[p.radius, 0]} />
          {material}
          {edges}
        </mesh>
      );
    case "octahedron":
      return (
        <mesh castShadow receiveShadow>
          <octahedronGeometry args={[p.radius, 0]} />
          {material}
          {edges}
        </mesh>
      );
    case "icosahedron":
      return (
        <mesh castShadow receiveShadow>
          <icosahedronGeometry args={[p.radius, 0]} />
          {material}
          {edges}
        </mesh>
      );
    case "dodecahedron":
      return (
        <mesh castShadow receiveShadow>
          <dodecahedronGeometry args={[p.radius, 0]} />
          {material}
          {edges}
        </mesh>
      );
    default:
      return null;
  }
}

export default function GeometryScene({
  shapeId,
  params,
  color,
  wireframe,
  showEdges,
  autoRotate,
}: GeometrySceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <>
      <color attach="background" args={["#0a0a18"]} />
      <fog attach="fog" args={["#0a0a18", 14, 36]} />

      <Environment preset="city" environmentIntensity={0.45} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#ddd6fe", "#1e1b4b", 0.4]} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={25}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight position={[-4, 3, -3]} intensity={0.4} color="#a78bfa" />
      <pointLight position={[4, 2, 3]} intensity={0.3} color="#f472b6" />

      <Grid
        position={[0, -2.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        args={[14, 14]}
        cellSize={0.5}
        cellThickness={1}
        cellColor="#6366f1"
        sectionSize={2}
        sectionThickness={1.5}
        sectionColor="#a5b4fc"
        fadeDistance={50}
        fadeStrength={0.6}
        infiniteGrid={false}
        side={THREE.DoubleSide}
        renderOrder={-1}
      />

      <CoordinateAxes length={3} />

      <group ref={groupRef} position={[0, 0, 0]}>
        <ShapeMesh
          shapeId={shapeId}
          params={params}
          color={color}
          wireframe={wireframe}
          showEdges={showEdges}
        />
      </group>

      <ContactShadows
        position={[0, -2.18, 0]}
        opacity={0.5}
        scale={12}
        blur={2.5}
        far={4}
        color="#020617"
      />

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={16}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 1.75}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.06}
      />
    </>
  );
}
