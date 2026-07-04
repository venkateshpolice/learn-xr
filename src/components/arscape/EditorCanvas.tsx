"use client";

import { Suspense, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import type { ARScapeAsset, ARScapeObject } from "@/types/arscape";
import SceneModel from "./SceneModel";

interface EditorCanvasProps {
  objects: ARScapeObject[];
  selectedId: string | null;
  transformMode: "translate" | "rotate" | "scale";
  onSelect: (id: string | null) => void;
  onUpdateObject: (id: string, patch: Partial<ARScapeObject>) => void;
  onDropAsset: (asset: ARScapeAsset, position: [number, number, number]) => void;
}

function SceneContent({
  objects,
  selectedId,
  transformMode,
  onSelect,
  onUpdateObject,
}: Omit<EditorCanvasProps, "onDropAsset">) {
  return (
    <>
      <color attach="background" args={["#0f172a"]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[6, 10, 4]} intensity={1.2} />
      <Grid infiniteGrid fadeDistance={28} cellColor="#334155" sectionColor="#475569" />

      {objects.map((obj) => (
        <SceneModel
          key={obj.id}
          object={obj}
          selected={obj.id === selectedId}
          transformMode={transformMode}
          onSelect={onSelect}
          onTransformChange={onUpdateObject}
        />
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onClick={() => onSelect(null)}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      <OrbitControls makeDefault minPolarAngle={0.15} maxPolarAngle={Math.PI / 2.05} />
    </>
  );
}

export default function EditorCanvas({
  objects,
  selectedId,
  transformMode,
  onSelect,
  onUpdateObject,
  onDropAsset,
}: EditorCanvasProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const raw = e.dataTransfer.getData("application/arscape-asset");
      if (!raw) return;
      try {
        const asset = JSON.parse(raw) as ARScapeAsset;
        onDropAsset(asset, [0, 0.5, 0]);
      } catch {
        /* ignore */
      }
    },
    [onDropAsset],
  );

  return (
    <div
      className={`relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border transition-colors ${
        dragOver ? "border-indigo-400 bg-indigo-500/10" : "border-white/10 bg-slate-900/80"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {dragOver && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <p className="px-4 py-2 rounded-xl bg-indigo-600/90 text-sm font-semibold">
            Drop model here
          </p>
        </div>
      )}

      <Canvas shadows camera={{ position: [4, 3.5, 6], fov: 45 }}>
        <Suspense fallback={null}>
          <SceneContent
            objects={objects}
            selectedId={selectedId}
            transformMode={transformMode}
            onSelect={onSelect}
            onUpdateObject={onUpdateObject}
          />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-3 left-3 text-[10px] text-slate-500 bg-black/40 px-2 py-1 rounded-lg">
        Drag from library · Click to select · Gizmo to move / rotate / scale
      </div>
    </div>
  );
}
