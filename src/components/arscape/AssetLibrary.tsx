"use client";

import { useRef, useState } from "react";
import { Box, Loader2, Upload } from "lucide-react";
import SketchfabAssetModal from "./SketchfabAssetModal";
import type { ARScapeAsset } from "@/types/arscape";

interface AssetLibraryProps {
  onAddAsset: (asset: ARScapeAsset) => void;
}

export default function AssetLibrary({ onAddAsset }: AssetLibraryProps) {
  const [sketchfabOpen, setSketchfabOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/arscape/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Upload failed");
        return;
      }
      onAddAsset(data.asset);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-3 border-b border-white/10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Asset Library
          </p>

          <button
            type="button"
            onClick={() => setSketchfabOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600/80 to-indigo-600/80 hover:from-cyan-600 hover:to-indigo-600 text-xs font-semibold transition-all"
          >
            <Box className="w-3.5 h-3.5" />
            Browse Sketchfab Library
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Upload</p>
          <input
            ref={fileRef}
            type="file"
            accept=".glb,.gltf,.usdz"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full py-8 rounded-xl border-2 border-dashed border-white/15 hover:border-indigo-500/40 transition-colors flex flex-col items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            ) : (
              <Upload className="w-6 h-6 text-slate-500" />
            )}
            <span className="text-xs text-slate-400">
              {uploading ? "Uploading…" : "Upload .glb / .gltf (max 25 MB)"}
            </span>
          </button>
        </div>
      </div>

      <SketchfabAssetModal
        open={sketchfabOpen}
        onClose={() => setSketchfabOpen(false)}
        onAddAsset={onAddAsset}
      />
    </>
  );
}
