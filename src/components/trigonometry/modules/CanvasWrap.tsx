"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid3x3 } from "lucide-react";
import { defaultCanvasProps } from "@/components/trigonometry/scenes/trig-scenes";
import { SceneViewBridge } from "@/components/trigonometry/scenes/SceneViewBridge";

export default function CanvasWrap({
  children,
  containerRef,
}: {
  children: React.ReactNode;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[50vh] relative">
      <button
        type="button"
        onClick={() => setShowGrid((g) => !g)}
        className={`absolute top-3 right-3 z-10 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
          showGrid
            ? "bg-indigo-500/25 border-indigo-500/40 text-indigo-200"
            : "bg-black/50 border-white/15 text-slate-400 hover:text-white"
        }`}
        title="Toggle coordinate grid"
      >
        <Grid3x3 className="w-3.5 h-3.5" />
        Grid
      </button>
      <Canvas {...defaultCanvasProps()}>
        <SceneViewBridge showGrid={showGrid}>{children}</SceneViewBridge>
      </Canvas>
    </div>
  );
}
