"use client";

import { useState, useMemo, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Box,
  Circle,
  Cone,
  Cylinder,
  Donut,
  Hexagon,
  Layers,
  Palette,
  RotateCcw,
  Shapes,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Infinity,
  Triangle,
} from "lucide-react";
import GeometryScene from "@/components/math/GeometryScene";
import {
  GEOMETRY_SHAPES,
  SHAPE_CATEGORIES,
  getDefaultParams,
  formatMetric,
  type ShapeId,
  type ShapeDef,
  type ShapeCategory,
} from "@/data/geometry-shapes";

const SHAPE_ICONS: Partial<Record<ShapeId, typeof Box>> = {
  sphere: Circle,
  box: Box,
  cylinder: Cylinder,
  cone: Cone,
  torus: Donut,
  torusKnot: Infinity,
  plane: Layers,
  ring: Donut,
  capsule: Cylinder,
  circle: Circle,
  tetrahedron: Triangle,
  octahedron: Hexagon,
  icosahedron: Shapes,
  dodecahedron: Shapes,
};

const PRESET_COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#22c55e", "#3b82f6", "#ef4444"];

function ParamSlider({
  def,
  value,
  onChange,
}: {
  def: ShapeDef["params"][number];
  value: number;
  onChange: (key: string, value: number) => void;
}) {
  const display = def.integer ? Math.round(value) : value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs text-slate-300">{def.label}</label>
        <span className="text-xs font-mono text-violet-300 tabular-nums">
          {display}
          {def.unit ? ` ${def.unit}` : ""}
        </span>
      </div>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={(e) => {
          const raw = parseFloat(e.target.value);
          onChange(def.key, def.integer ? Math.round(raw) : raw);
        }}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-violet-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>{def.min}</span>
        <span>{def.max}</span>
      </div>
    </div>
  );
}

export default function GeometryEditorPage() {
  const [selectedId, setSelectedId] = useState<ShapeId>("sphere");
  const [paramsByShape, setParamsByShape] = useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {};
    for (const shape of GEOMETRY_SHAPES) {
      initial[shape.id] = getDefaultParams(shape);
    }
    return initial;
  });
  const [color, setColor] = useState("#8b5cf6");
  const [wireframe, setWireframe] = useState(false);
  const [showEdges, setShowEdges] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<ShapeCategory | "all">("all");

  const selectedShape = useMemo(
    () => GEOMETRY_SHAPES.find((s) => s.id === selectedId)!,
    [selectedId],
  );

  const params = paramsByShape[selectedId] ?? getDefaultParams(selectedShape);

  const updateParam = useCallback((key: string, value: number) => {
    setParamsByShape((prev) => {
      const current = { ...prev[selectedId], [key]: value };
      if (selectedId === "ring") {
        if (key === "innerRadius" && value >= (current.outerRadius ?? 1)) {
          current.innerRadius = Math.max(0.05, (current.outerRadius ?? 1) - 0.05);
        }
        if (key === "outerRadius" && value <= (current.innerRadius ?? 0)) {
          current.outerRadius = (current.innerRadius ?? 0) + 0.05;
        }
      }
      return { ...prev, [selectedId]: current };
    });
  }, [selectedId]);

  const resetParams = useCallback(() => {
    setParamsByShape((prev) => ({
      ...prev,
      [selectedId]: getDefaultParams(selectedShape),
    }));
  }, [selectedId, selectedShape]);

  const selectShape = useCallback((id: ShapeId) => {
    setSelectedId(id);
    setParamsByShape((prev) => {
      if (prev[id]) return prev;
      const shape = GEOMETRY_SHAPES.find((s) => s.id === id);
      return shape ? { ...prev, [id]: getDefaultParams(shape) } : prev;
    });
  }, []);

  const filteredShapes = useMemo(
    () =>
      categoryFilter === "all"
        ? GEOMETRY_SHAPES
        : GEOMETRY_SHAPES.filter((s) => s.category === categoryFilter),
    [categoryFilter],
  );

  const shapesByCategory = useMemo(() => {
    const groups = new Map<ShapeCategory, ShapeDef[]>();
    for (const shape of filteredShapes) {
      const list = groups.get(shape.category) ?? [];
      list.push(shape);
      groups.set(shape.category, list);
    }
    return groups;
  }, [filteredShapes]);

  return (
    <div className="h-screen bg-[#070714] text-white flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-white/10 bg-[#0c0c1a]/95 backdrop-blur-md z-30">
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/labs"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Math Lab</span>
            </Link>
            <div className="h-5 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shrink-0">
                <Shapes className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm sm:text-base truncate">Geometry Editor</h1>
                <p className="text-xs text-slate-400 truncate hidden sm:block">
                  Explore 3D shapes · adjust dimensions in real time
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setWireframe((w) => !w)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                wireframe
                  ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <Grid3x3 className="w-3.5 h-3.5" />
              Wireframe
            </button>
            <button
              type="button"
              onClick={() => setAutoRotate((r) => !r)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                autoRotate
                  ? "bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Spin
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left — shape library */}
        <AnimatePresence initial={false}>
          {leftOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 self-stretch h-full min-h-0 border-r border-white/10 bg-[#0c0c1a]/95 overflow-hidden hidden md:flex flex-col"
            >
              <div className="w-[280px] flex flex-col flex-1 min-h-0 h-full">
                <div className="shrink-0 p-4 pb-3 border-b border-white/10">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Shapes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("all")}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        categoryFilter === "all"
                          ? "bg-violet-500/25 text-violet-300 border border-violet-500/40"
                          : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      All
                    </button>
                    {(Object.keys(SHAPE_CATEGORIES) as ShapeCategory[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          categoryFilter === cat
                            ? "bg-violet-500/25 text-violet-300 border border-violet-500/40"
                            : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {SHAPE_CATEGORIES[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-3 space-y-4">
                  {Array.from(shapesByCategory.entries()).map(([category, shapes]) => (
                    <div key={category}>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                        {SHAPE_CATEGORIES[category]}
                      </p>
                      <div className="space-y-1.5">
                        {shapes.map((shape) => {
                          const Icon = SHAPE_ICONS[shape.id] ?? Shapes;
                          const active = selectedId === shape.id;
                          return (
                            <button
                              key={shape.id}
                              type="button"
                              onClick={() => selectShape(shape.id)}
                              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                                active
                                  ? "bg-violet-500/15 border-violet-500/40"
                                  : "bg-white/[0.03] border-white/10 hover:border-violet-500/30 hover:bg-white/[0.06]"
                              }`}
                            >
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                  active ? "bg-violet-500/25" : "bg-white/5"
                                }`}
                              >
                                <Icon className={`w-4 h-4 ${active ? "text-violet-300" : "text-slate-400"}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm">{shape.name}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{shape.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setLeftOpen((o) => !o)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-5 h-12 items-center justify-center bg-[#0c0c1a] border border-white/10 rounded-r-lg text-slate-400 hover:text-white"
          style={{ left: leftOpen ? 280 : 0 }}
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${leftOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Center — 3D canvas */}
        <div className="flex-1 relative min-h-[50vh]">
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 2, 7], fov: 45 }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.05,
            }}
            onCreated={({ gl }) => {
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
            }}
          >
            <GeometryScene
              shapeId={selectedId}
              params={params}
              color={color}
              wireframe={wireframe}
              showEdges={showEdges}
              autoRotate={autoRotate}
            />
          </Canvas>

          {/* Mobile shape picker */}
          <select
            className="absolute top-3 left-3 px-3 py-2 rounded-lg bg-[#0c0c1a]/90 border border-white/15 text-sm max-w-[70%] md:hidden"
            value={selectedId}
            onChange={(e) => selectShape(e.target.value as ShapeId)}
          >
            {GEOMETRY_SHAPES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-xs text-slate-300 pointer-events-none hidden sm:block">
            Drag to rotate · Scroll to zoom
          </div>
        </div>

        {/* Right — properties */}
        <AnimatePresence initial={false}>
          {rightOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 self-stretch h-full min-h-0 border-l border-white/10 bg-[#0c0c1a]/95 overflow-hidden hidden lg:flex flex-col"
            >
              <div className="w-[300px] flex flex-col flex-1 min-h-0 h-full">
                <div className="shrink-0 p-4 border-b border-white/10">
                  <h2 className="text-lg font-bold">{selectedShape.name}</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedShape.description}</p>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-4 space-y-5">
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Dimensions
                      </p>
                      <button
                        type="button"
                        onClick={resetParams}
                        className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        Reset defaults
                      </button>
                    </div>
                    <div className="space-y-4">
                      {selectedShape.params.map((def) => (
                        <ParamSlider
                          key={def.key}
                          def={def}
                          value={params[def.key] ?? def.min}
                          onChange={updateParam}
                        />
                      ))}
                    </div>
                  </section>

                  {selectedShape.metrics.length > 0 && (
                    <section>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Calculated
                      </p>
                      <div className="space-y-2">
                        {selectedShape.metrics.map((metric) => {
                          const raw = metric.compute(params);
                          if (metric.label.includes("inner") && params.innerRadius >= params.outerRadius) {
                            return null;
                          }
                          return (
                            <div
                              key={metric.label}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/10"
                            >
                              <span className="text-xs text-slate-400">{metric.label}</span>
                              <span className="text-sm font-mono text-fuchsia-300">
                                {formatMetric(raw)} {metric.unit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  <section>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5" />
                      Appearance
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                            color === c ? "border-white scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-9 rounded-lg cursor-pointer bg-transparent border border-white/10"
                    />
                    <label className="flex items-center gap-2 mt-3 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showEdges}
                        onChange={(e) => setShowEdges(e.target.checked)}
                        className="rounded accent-violet-500"
                      />
                      Show edge outlines
                    </label>
                  </section>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setRightOpen((o) => !o)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden lg:flex w-5 h-12 items-center justify-center bg-[#0c0c1a] border border-white/10 rounded-l-lg text-slate-400 hover:text-white"
          style={{ right: rightOpen ? 300 : 0 }}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${rightOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Mobile properties drawer */}
      <div className="lg:hidden shrink-0 border-t border-white/10 bg-[#0c0c1a]/95 max-h-[40vh] overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{selectedShape.name}</h2>
          <button type="button" onClick={resetParams} className="text-xs text-violet-400">
            Reset
          </button>
        </div>
        <div className="space-y-4">
          {selectedShape.params.map((def) => (
            <ParamSlider
              key={def.key}
              def={def}
              value={params[def.key] ?? def.min}
              onChange={updateParam}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
