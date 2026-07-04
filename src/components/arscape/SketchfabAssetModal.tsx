"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Check,
  Eye,
  Layers,
  Loader2,
  Plus,
  ScanLine,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { SKETCHFAB_CATEGORIES } from "@/data/sketchfab-categories";
import type { ARScapeAsset, SketchfabSearchResult } from "@/types/arscape";

const ModelViewerAR = dynamic(() => import("./ModelViewerAR"), { ssr: false });

interface SketchfabAssetModalProps {
  open: boolean;
  onClose: () => void;
  onAddAsset: (asset: ARScapeAsset) => void;
}

interface LoadedModel {
  uid: string;
  name: string;
  modelUrl: string;
  usdzUrl?: string;
  thumbnailUrl: string;
}

export default function SketchfabAssetModal({ open, onClose, onAddAsset }: SketchfabAssetModalProps) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SketchfabSearchResult[]>([]);
  const [note, setNote] = useState("");
  const [searching, setSearching] = useState(false);
  const [loadingUid, setLoadingUid] = useState<string | null>(null);
  const [preview, setPreview] = useState<LoadedModel | null>(null);
  const [loadError, setLoadError] = useState("");

  const runSearch = useCallback(async () => {
    setSearching(true);
    setLoadError("");
    try {
      const params = new URLSearchParams({ category });
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/sketchfab/search?${params}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setNote(data.message ?? "");
    } finally {
      setSearching(false);
    }
  }, [category, query]);

  useEffect(() => {
    if (open) runSearch();
  }, [open, category]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) {
      setPreview(null);
      setLoadError("");
      return;
    }
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const loadModel = async (item: SketchfabSearchResult) => {
    setLoadingUid(item.uid);
    setLoadError("");
    try {
      const res = await fetch("/api/sketchfab/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: item.uid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? "Could not load model");
        return;
      }
      setPreview({
        uid: item.uid,
        name: data.name ?? item.name,
        modelUrl: data.modelUrl,
        usdzUrl: data.usdzUrl,
        thumbnailUrl: item.thumbnailUrl,
      });
    } finally {
      setLoadingUid(null);
    }
  };

  const addToScene = () => {
    if (!preview) return;
    onAddAsset({
      id: preview.uid,
      name: preview.name,
      modelUrl: preview.modelUrl,
      usdzUrl: preview.usdzUrl,
      thumbnailUrl: preview.thumbnailUrl,
      source: "sketchfab",
      sketchfabUid: preview.uid,
    });
    setPreview(null);
    onClose();
  };

  const activeCategory = SKETCHFAB_CATEGORIES.find((c) => c.id === category);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#030712]/90 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-6xl h-[94vh] sm:h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl border border-white/10 bg-[#080d18] shadow-[0_0_80px_-12px_rgba(99,102,241,0.35)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.25]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.15) 1px, transparent 0)",
                  backgroundSize: "28px 28px",
                }}
              />
              <div className="absolute -top-24 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/15 rounded-full blur-[80px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center gap-4 px-4 sm:px-6 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#080d18]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-lg sm:text-xl tracking-tight">
                      Sketchfab <span className="gradient-text">Assets</span>
                    </h2>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-400">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      GLB + USDZ
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {activeCategory?.icon} {activeCategory?.label} · Click a model to preview in AR
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Main layout */}
            <div className="relative z-10 flex-1 flex min-h-0">
              {/* Category sidebar — desktop */}
              <aside className="hidden md:flex flex-col w-52 shrink-0 border-r border-white/10 bg-black/20">
                <p className="px-4 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Categories
                </p>
                <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
                  {SKETCHFAB_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                        category === cat.id
                          ? "bg-gradient-to-r from-indigo-500/25 to-cyan-500/10 text-white border border-indigo-500/30 shadow-sm shadow-indigo-500/10"
                          : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <span className="text-base leading-none">{cat.icon}</span>
                      <span className="font-medium truncate">{cat.label}</span>
                    </button>
                  ))}
                </nav>
              </aside>

              {/* Center: search + grid */}
              <div className="flex-1 flex flex-col min-w-0 min-h-0">
                {/* Search bar */}
                <div className="px-4 sm:px-5 py-3 border-b border-white/10 shrink-0 space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && runSearch()}
                        placeholder="Search dinosaurs, planets, anatomy…"
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-white/[0.04] border border-white/10 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                    <button
                      onClick={runSearch}
                      disabled={searching}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-sm font-semibold disabled:opacity-50 shadow-lg shadow-indigo-500/20 shrink-0 transition-all"
                    >
                      {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                    </button>
                  </div>

                  {/* Mobile categories scroll */}
                  <div className="md:hidden overflow-x-auto -mx-1 px-1 pb-1">
                    <div className="flex gap-2 min-w-max">
                      {SKETCHFAB_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                            category === cat.id
                              ? "bg-indigo-500/30 text-white border border-indigo-400/40"
                              : "bg-white/5 text-slate-400 border border-white/10"
                          }`}
                        >
                          <span>{cat.icon}</span>
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                {(note || loadError) && (
                  <div className="px-4 sm:px-5 pt-3 shrink-0 space-y-1">
                    {note && (
                      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-200/80">{note}</p>
                      </div>
                    )}
                    {loadError && (
                      <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
                        {loadError}
                      </div>
                    )}
                  </div>
                )}

                {/* Results header */}
                <div className="flex items-center justify-between px-4 sm:px-5 py-2 shrink-0">
                  <p className="text-xs text-slate-500">
                    {searching ? "Searching…" : `${results.length} model${results.length !== 1 ? "s" : ""}`}
                  </p>
                  {preview && (
                    <span className="md:hidden text-[10px] text-indigo-400 font-medium">
                      Preview below ↓
                    </span>
                  )}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-5 pb-4 min-h-0">
                  {searching ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] animate-pulse"
                        >
                          <div className="aspect-square bg-slate-800/60" />
                          <div className="p-3 space-y-2">
                            <div className="h-3 bg-slate-800/60 rounded w-3/4" />
                            <div className="h-2 bg-slate-800/40 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <Box className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-300 mb-1">No models found</p>
                      <p className="text-xs text-slate-500 max-w-xs">
                        Try a different category or search term like &quot;heart&quot;, &quot;rocket&quot;, or
                        &quot;elephant&quot;.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {results.map((item, i) => {
                        const isSelected = preview?.uid === item.uid;
                        const isLoading = loadingUid === item.uid;

                        return (
                          <motion.button
                            key={item.uid}
                            type="button"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.03, 0.24) }}
                            onClick={() => loadModel(item)}
                            disabled={isLoading}
                            className={`group text-left rounded-2xl overflow-hidden border transition-all duration-200 ${
                              isSelected
                                ? "border-indigo-400/60 ring-2 ring-indigo-500/25 shadow-lg shadow-indigo-500/10 scale-[1.02]"
                                : "border-white/10 hover:border-indigo-500/35 hover:shadow-md hover:shadow-indigo-500/5"
                            }`}
                          >
                            <div className="aspect-square relative bg-slate-900 overflow-hidden">
                              {item.thumbnailUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.thumbnailUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                  <Box className="w-10 h-10 text-slate-700" />
                                </div>
                              )}

                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                                <span className="text-[10px] font-medium text-white/90 flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> Preview
                                </span>
                              </div>

                              {/* AR badge */}
                              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide bg-black/50 backdrop-blur-sm border border-white/10 text-cyan-300">
                                AR
                              </span>

                              {isLoading && (
                                <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
                                  <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
                                </div>
                              )}

                              {isSelected && !isLoading && (
                                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>

                            <div className="p-3 bg-white/[0.02] border-t border-white/5">
                              <p className="text-xs font-semibold truncate text-slate-200 group-hover:text-white transition-colors">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                <ScanLine className="w-2.5 h-2.5" />
                                {item.isDownloadable ? "GLB · USDZ" : "View only"}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Preview panel */}
              <aside
                className={`flex flex-col shrink-0 border-t md:border-t-0 md:border-l border-white/10 bg-black/30 backdrop-blur-sm transition-all duration-300 ${
                  preview ? "w-full md:w-[360px]" : "hidden md:flex md:w-[320px]"
                }`}
              >
                <AnimatePresence mode="wait">
                  {preview ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      className="flex flex-col h-full min-h-[280px] md:min-h-0"
                    >
                      <div className="p-4 border-b border-white/10">
                        <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold mb-1">
                          Live Preview
                        </p>
                        <h3 className="text-base font-bold truncate">{preview.name}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            .glb
                          </span>
                          {preview.usdzUrl ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
                              .usdz
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-500/15 text-slate-500 border border-slate-500/25">
                              no usdz
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="relative flex-1 min-h-[240px] md:min-h-0">
                        <div className="absolute inset-3 rounded-2xl overflow-hidden border border-white/10 shadow-inner shadow-black/40 bg-gradient-to-b from-slate-800/80 to-slate-950">
                          <ModelViewerAR
                            modelUrl={preview.modelUrl}
                            usdzUrl={preview.usdzUrl}
                            title={preview.name}
                            poster={preview.thumbnailUrl}
                          />
                        </div>
                      </div>

                      <div className="p-4 space-y-3 border-t border-white/10">
                        <button
                          onClick={addToScene}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Plus className="w-4 h-4" />
                          Add to Scene
                        </button>
                        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                          <Eye className="w-3 h-3 inline mr-1 -mt-0.5" />
                          Android & Web use GLB · iOS Quick Look uses USDZ
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex flex-col items-center justify-center p-8 text-center"
                    >
                      <div className="relative mb-5">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 border border-white/10 flex items-center justify-center">
                          <ScanLine className="w-9 h-9 text-indigo-400/70" />
                        </div>
                        <div className="absolute -inset-3 rounded-[28px] border border-indigo-500/10 animate-pulse" />
                      </div>
                      <p className="text-sm font-semibold text-slate-300 mb-2">Pick a 3D model</p>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                        Select any thumbnail to load a live AR preview before adding it to your scene.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </aside>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
