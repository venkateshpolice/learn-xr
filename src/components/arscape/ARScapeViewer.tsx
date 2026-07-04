"use client";

import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { Eye, ScanLine } from "lucide-react";
import type { ARScapeObject, ARScapeScene } from "@/types/arscape";
import SceneModel from "./SceneModel";

const ModelViewerAR = dynamic(() => import("./ModelViewerAR"), { ssr: false });

interface ARScapeViewerProps {
  scene: ARScapeScene;
}

function PreviewScene({ objects }: { objects: ARScapeObject[] }) {
  return (
    <>
      <color attach="background" args={["#0f172a"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} />
      <Grid infiniteGrid fadeDistance={20} cellColor="#334155" sectionColor="#475569" />
      {objects.map((obj) => (
        <SceneModel
          key={obj.id}
          object={obj}
          selected={false}
          transformMode="translate"
          onSelect={() => {}}
          onTransformChange={() => {}}
        />
      ))}
      <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function ARScapeViewer({ scene }: ARScapeViewerProps) {
  const arObject = useMemo(() => {
    if (scene.arPrimaryObjectId) {
      return scene.objects.find((o) => o.id === scene.arPrimaryObjectId) ?? scene.objects[0];
    }
    return scene.objects[0];
  }, [scene]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <ScanLine className="w-5 h-5 text-cyan-400" />
          <span className="text-xs text-cyan-400 font-medium uppercase tracking-wider">Nexscape ARScape</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{scene.title}</h1>
        {scene.description && <p className="text-slate-400 text-sm mb-6">{scene.description}</p>}
      </div>

      {/* 3D preview of full scene */}
      {scene.objects.length > 1 && (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <p className="text-xs text-slate-500 mb-2">Scene preview ({scene.objects.length} models)</p>
          <div className="h-[280px] rounded-2xl overflow-hidden border border-white/10">
            <Canvas camera={{ position: [4, 3, 6], fov: 45 }}>
              <Suspense fallback={null}>
                <PreviewScene objects={scene.objects} />
              </Suspense>
            </Canvas>
          </div>
        </div>
      )}

      {/* AR model-viewer */}
      {arObject && (
        <div className="max-w-2xl mx-auto px-4 pb-12">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium">View in AR — {arObject.name}</span>
            </div>
            <div className="aspect-square w-full bg-gradient-to-b from-slate-800 to-slate-900">
              <ModelViewerAR
                modelUrl={arObject.modelUrl}
                usdzUrl={arObject.usdzUrl}
                title={arObject.name}
                poster={arObject.thumbnailUrl}
              />
            </div>
            <p className="p-4 text-xs text-slate-500 text-center">
              Tap &quot;View in Your Space&quot; on mobile to place the model in your environment
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
