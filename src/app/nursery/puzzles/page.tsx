"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { NURSERY_PUZZLES } from "@/data/nursery-puzzles";

export default function NurseryPuzzlesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-pink-500/5 to-amber-500/10 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-12">
          <Link
            href="/nursery"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Nursery</span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-300">Nursery · Class 1 · Ages 3–7</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              Fun <span className="gradient-text">Puzzles</span>
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto">
              Tap, drag, and match — learn colors, shapes, shadows, and counting through play.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {NURSERY_PUZZLES.map((puzzle, i) => (
              <motion.div
                key={puzzle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={puzzle.href} className="block group h-full">
                  <div className="glass-card rounded-3xl p-6 h-full hover:bg-white/[0.08] transition-all hover:scale-[1.02] border border-white/10">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${puzzle.gradient} flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      {puzzle.emoji}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">{puzzle.title}</h2>
                    <p className="text-xs text-amber-300/90 font-semibold mb-2">{puzzle.ages}</p>
                    <p className="text-sm text-slate-400 mb-3">{puzzle.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {puzzle.skills.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
