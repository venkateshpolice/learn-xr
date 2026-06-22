"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Glasses, Scan } from "lucide-react";
import {
  TRIGONOMETRY_MODULES,
  TRIG_CATEGORIES,
  type TrigModuleCategory,
} from "@/data/trigonometry-modules";

export default function TrigonometryDashboard() {
  const categories = Object.keys(TRIG_CATEGORIES) as TrigModuleCategory[];

  return (
    <div className="min-h-screen bg-[#070714] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 px-4 sm:px-6 py-6 pb-20 max-w-6xl mx-auto">
        <Link
          href="/labs/math"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Math Lab
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                Trigonometry Laboratory
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">Interactive 3D · Graphs · WebXR · Grade 8 → University</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            Explore sine, cosine, and tangent through immersive simulations. Drag angles on the unit circle,
            build wave equations, solve triangles, and step into AR/VR — all with live MathJax formulas.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-medium">
              {TRIGONOMETRY_MODULES.length} Modules
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1">
              <Scan className="w-3 h-3" /> AR Ready
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center gap-1">
              <Glasses className="w-3 h-3" /> VR Ready
            </span>
          </div>
        </motion.div>

        {categories.map((cat, catIdx) => {
          const modules = TRIGONOMETRY_MODULES.filter((m) => m.category === cat);
          if (modules.length === 0) return null;
          return (
            <section key={cat} className="mb-12">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                {TRIG_CATEGORIES[cat]}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((mod, idx) => {
                  const Icon = mod.icon;
                  return (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIdx * 0.05 + idx * 0.04 }}
                    >
                      <Link href={`/trigonometry/${mod.id}`} className="block group h-full">
                        <div className="relative h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.07] hover:border-white/20 transition-all overflow-hidden">
                          <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${mod.gradient}`} />
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-sm group-hover:text-violet-200 transition-colors">
                                {mod.title}
                              </h3>
                              <p className="text-[11px] text-fuchsia-400/80">{mod.subtitle}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">{mod.description}</p>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-500">{mod.grades}</span>
                            {mod.has3D && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">3D</span>
                            )}
                            {mod.hasXR && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">XR</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
