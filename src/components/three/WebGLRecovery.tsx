"use client";

import { useCallback, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";

export const LIGHT_GL = {
  antialias: false,
  powerPreference: "default" as const,
  stencil: false,
  alpha: false,
} as const;

export function useWebGLRecovery() {
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  const onContextLost = useCallback(() => setContextLost(true), []);

  const remountCanvas = useCallback(() => {
    setContextLost(false);
    setCanvasKey((k) => k + 1);
  }, []);

  return { contextLost, canvasKey, onContextLost, remountCanvas };
}

export function WebGLContextHandler({ onContextLost }: { onContextLost: () => void }) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    const handleLost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };

    canvas.addEventListener("webglcontextlost", handleLost, false);
    return () => canvas.removeEventListener("webglcontextlost", handleLost);
  }, [gl, onContextLost]);

  return null;
}

export function WebGLRecoveryOverlay({ onReload }: { onReload: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#060a12]/95 px-4">
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/15 max-w-sm w-full text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <h2 className="text-lg font-bold text-white mb-2">3D graphics paused</h2>
        <p className="text-sm text-slate-400 mb-5 leading-relaxed">
          The browser reclaimed GPU memory (WebGL context lost). This can happen after long sessions or heavy tabs.
        </p>
        <button
          type="button"
          onClick={onReload}
          className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors"
        >
          Reload 3D Scene
        </button>
      </div>
    </div>
  );
}
