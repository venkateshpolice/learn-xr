"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw, Star, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PuzzleConfetti() {
  const colors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA", "#F472B6", "#FBBF24"];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            width: 6 + Math.random() * 8,
            height: 6 + Math.random() * 8,
            backgroundColor: colors[i % colors.length],
          }}
          initial={{ y: -20, opacity: 1 }}
          animate={{ y: "110vh", rotate: 720, opacity: [1, 1, 0] }}
          transition={{ duration: 2 + Math.random(), delay: Math.random() * 0.6 }}
        />
      ))}
    </div>
  );
}

export function PuzzleShell({
  title,
  subtitle,
  stars,
  total,
  narration,
  onToggleNarration,
  onRestart,
  children,
  complete,
}: {
  title: string;
  subtitle: string;
  stars: number;
  total: number;
  narration: boolean;
  onToggleNarration: () => void;
  onRestart: () => void;
  children: React.ReactNode;
  complete?: boolean;
}) {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-sky-100 via-amber-50 to-orange-100 text-slate-800">
      {complete && <PuzzleConfetti />}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-amber-200/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <Link
            href="/nursery/puzzles"
            className="flex items-center gap-1.5 text-amber-800/70 hover:text-amber-900 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Puzzles
          </Link>
          <div className="text-center min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-amber-900 truncate">{title}</h1>
            <p className="text-[10px] text-amber-700/70 hidden sm:block">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={onToggleNarration} className="p-2 rounded-xl bg-amber-100/80">
              {narration ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4 text-amber-700" />}
            </button>
            <button type="button" onClick={onRestart} className="p-2 rounded-xl bg-amber-100/80">
              <RotateCcw className="w-4 h-4 text-amber-700" />
            </button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto flex justify-center gap-1 mt-2">
          {Array.from({ length: total }, (_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < stars ? "text-yellow-500 fill-yellow-400" : "text-amber-200"}`}
            />
          ))}
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4"
          >
            <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full border-4 border-yellow-300">
              <span className="text-5xl mb-3 block">🎉</span>
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Super Star!</h2>
              <p className="text-amber-700 mb-6">You finished the puzzle!</p>
              <button
                type="button"
                onClick={onRestart}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
