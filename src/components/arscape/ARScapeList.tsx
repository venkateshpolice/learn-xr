"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Box, Loader2, Plus, QrCode, ScanLine } from "lucide-react";
import type { ARScapeScene } from "@/types/arscape";

export default function ARScapeList() {
  const [scenes, setScenes] = useState<ARScapeScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = () => {
    fetch("/api/arscape")
      .then((r) => r.json())
      .then((d) => setScenes(d.scenes ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const createNew = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/arscape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "My ARScape" }),
      });
      const data = await res.json();
      if (data.scene?.id) {
        window.location.href = `/teacher/arscape/${data.scene.id}`;
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-3">
            <ScanLine className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-200/90">ARScape Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Create <span className="gradient-text">AR experiences</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg">
            Design 3D scenes with drag-and-drop, import from Sketchfab, publish, and share via QR code for
            students to view in AR.
          </p>
        </div>
        <button
          onClick={createNew}
          disabled={creating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm disabled:opacity-50"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New ARScape
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : scenes.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
          <Box className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No ARScapes yet. Create your first immersive scene.</p>
          <button
            onClick={createNew}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm"
          >
            Create ARScape
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {scenes.map((scene, i) => (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/teacher/arscape/${scene.id}`}
                className="block glass-card rounded-xl p-5 border border-white/10 hover:border-indigo-500/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-semibold group-hover:text-indigo-200 transition-colors truncate">
                    {scene.title}
                  </h2>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                      scene.status === "published"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {scene.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  {scene.objects.length} model{scene.objects.length !== 1 ? "s" : ""} · Updated{" "}
                  {new Date(scene.updatedAt).toLocaleDateString()}
                </p>
                {scene.status === "published" && scene.slug && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400">
                    <QrCode className="w-3 h-3" />
                    /ar/view/{scene.slug}
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
