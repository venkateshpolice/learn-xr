"use client";

import { Eye } from "lucide-react";

interface ModelViewerARProps {
  modelUrl: string;
  usdzUrl?: string;
  title: string;
  poster?: string;
}

export default function ModelViewerAR({ modelUrl, usdzUrl, title, poster }: ModelViewerARProps) {
  return (
    <>
      {/* @ts-expect-error model-viewer web component */}
      <model-viewer
        src={modelUrl}
        ios-src={usdzUrl}
        poster={poster}
        alt={`3D model: ${title}`}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        touch-action="pan-y"
        auto-rotate
        shadow-intensity="1"
        exposure="1"
        environment-image="neutral"
        style={{ width: "100%", height: "100%" }}
      >
        <button
          slot="ar-button"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl font-semibold text-white flex items-center gap-2 hover:scale-105 transition-transform z-10"
        >
          <Eye className="w-5 h-5" />
          View in Your Space
        </button>
      {/* @ts-expect-error model-viewer web component */}
      </model-viewer>
    </>
  );
}
