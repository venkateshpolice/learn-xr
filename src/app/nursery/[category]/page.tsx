"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ScanLine, Smartphone, Eye, X } from "lucide-react";
import { getCategoryById, getItemEmoji } from "@/data/nursery-categories";

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const category = getCategoryById(categoryId);

  const [mode, setMode] = useState<"markerless" | "marker">("markerless");
  const [arItem, setArItem] = useState<string | null>(null);

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Category not found</h1>
          <Link href="/nursery" className="text-indigo-400 hover:underline">
            Go back to categories
          </Link>
        </div>
      </div>
    );
  }

  const activeItem = arItem
    ? category.items.find((i) => i.name === arItem)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* AR Viewer Modal */}
      {arItem && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl bg-slate-900 rounded-3xl overflow-hidden border border-white/10"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {getItemEmoji(categoryId, arItem)}
                </span>
                <div>
                  <h3 className="text-xl font-bold">{arItem}</h3>
                  <p className="text-sm text-slate-400">
                    {mode === "markerless"
                      ? "Surface Tracking AR"
                      : "Marker-Based AR"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setArItem(null)}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-square w-full bg-gradient-to-b from-slate-800 to-slate-900 relative">
              {/* @ts-expect-error model-viewer is a web component */}
              <model-viewer
                src={activeItem.modelUrl}
                alt={`3D model of ${arItem}`}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                touch-action="pan-y"
                auto-rotate
                shadow-intensity="1"
                style={{ width: "100%", height: "100%" }}
              >
                <button
                  slot="ar-button"
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl font-semibold text-white flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Eye className="w-5 h-5" />
                  View in Your Space
                </button>
              {/* @ts-expect-error model-viewer is a web component */}
              </model-viewer>
            </div>

            <div className="p-5 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Tap &quot;View in Your Space&quot; to see {arItem} in AR
              </p>
              <button
                onClick={() => setArItem(null)}
                className="px-4 py-2 rounded-lg glass-card text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Page Header */}
      <div className="relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br opacity-10 ${category.gradient} pointer-events-none`}
        />
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-12">
          <Link
            href="/nursery"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Categories</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div className="flex items-center gap-5">
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg`}
              >
                <span className="text-4xl">{category.emoji}</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {category.label}
                </h1>
                <p className="text-slate-400 mt-1">{category.description}</p>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="glass-card rounded-2xl p-1.5 flex gap-1">
              <button
                onClick={() => setMode("markerless")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  mode === "markerless"
                    ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Markerless AR
              </button>
              <button
                onClick={() => setMode("marker")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  mode === "marker"
                    ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ScanLine className="w-4 h-4" />
                Marker-Based
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {mode === "markerless" ? (
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <p className="text-slate-300 text-sm">
                Surface Tracking — Place 3D models on any flat surface using
                your camera
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {category.items.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="glass-card rounded-2xl overflow-hidden hover:bg-white/[0.08] transition-all duration-300 hover:scale-[1.03] hover:border-white/20">
                    {/* Card visual */}
                    <div className="aspect-square bg-gradient-to-br from-white/[0.03] to-white/[0.01] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 group-hover:from-indigo-500/10 group-hover:to-cyan-500/10 transition-colors" />
                      <span className="text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                        {getItemEmoji(categoryId, item.name)}
                      </span>
                    </div>

                    {/* Card info */}
                    <div className="p-4">
                      <h4 className="font-bold text-white text-lg mb-3">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => setArItem(item.name)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Eye className="w-4 h-4" />
                        View in AR
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <p className="text-slate-300 text-sm">
                Marker-Based — Print and scan these markers to see 3D models appear
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {category.items.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="glass-card rounded-2xl overflow-hidden hover:bg-white/[0.08] transition-all duration-300 hover:scale-[1.03] hover:border-white/20">
                    {/* Marker visual */}
                    <div className="aspect-square bg-gradient-to-br from-white/[0.03] to-white/[0.01] flex items-center justify-center relative overflow-hidden p-6">
                      <div className="w-full h-full rounded-xl border-2 border-dashed border-indigo-500/30 flex flex-col items-center justify-center gap-3 relative">
                        <ScanLine className="w-8 h-8 text-indigo-400/50" />
                        <span className="text-4xl">
                          {getItemEmoji(categoryId, item.name)}
                        </span>
                        <span className="text-xs text-slate-500 absolute bottom-2">
                          SCAN ME
                        </span>
                      </div>
                    </div>

                    {/* Card info */}
                    <div className="p-4">
                      <h4 className="font-bold text-white text-lg mb-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-400 mb-3">
                        Print marker & scan
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setArItem(item.name)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Preview
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 glass-card rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                          <ScanLine className="w-3.5 h-3.5" />
                          Marker
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
