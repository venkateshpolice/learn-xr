"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PuzzleShell } from "@/components/nursery-puzzles/PuzzleShell";
import { playSuccess, playError, playComplete, speak, shuffle } from "@/lib/nursery-puzzle-utils";

const PAIRS = [
  { id: "cat", emoji: "🐱", shadow: "🐱", name: "Cat" },
  { id: "tree", emoji: "🌳", shadow: "🌲", name: "Tree" },
  { id: "car", emoji: "🚗", shadow: "🚙", name: "Car" },
  { id: "star", emoji: "⭐", shadow: "✨", name: "Star" },
  { id: "fish", emoji: "🐠", shadow: "🐟", name: "Fish" },
  { id: "house", emoji: "🏠", shadow: "🏡", name: "House" },
];

export default function ShadowMatchPuzzlePage() {
  const [gameKey, setGameKey] = useState(0);
  const [narration, setNarration] = useState(true);
  const [round, setRound] = useState(0);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  const deck = useMemo(() => shuffle(PAIRS), [gameKey]);
  const current = deck[round];
  const shadowOptions = useMemo(() => {
    if (!current) return [];
    const wrongs = shuffle(PAIRS.filter((p) => p.id !== current.id)).slice(0, 2);
    return shuffle([current, ...wrongs]);
  }, [current, gameKey, round]);

  const restart = useCallback(() => {
    setGameKey((k) => k + 1);
    setRound(0);
    setMatched(new Set());
    setComplete(false);
  }, []);

  const pickShadow = (id: string) => {
    if (!current || matched.has(current.id)) return;

    if (id === current.id) {
      playSuccess();
      if (narration) speak(`Correct! That is the ${current.name}!`);
      setMatched((m) => new Set(m).add(current.id));
      if (round >= deck.length - 1) {
        playComplete();
        if (narration) speak("You matched every shadow! Great job!");
        setComplete(true);
      } else {
        setTimeout(() => setRound((r) => r + 1), 600);
      }
    } else {
      playError();
      if (narration) speak("Not that one. Look again!");
      setWrong(id);
      setTimeout(() => setWrong(null), 500);
    }
  };

  if (!current) return null;

  return (
    <PuzzleShell
      title="Shadow Match"
      subtitle="Tap the shadow that matches the object"
      stars={matched.size}
      total={PAIRS.length}
      narration={narration}
      onToggleNarration={() => setNarration((n) => !n)}
      onRestart={restart}
      complete={complete}
    >
      <div className="text-center mb-8">
        <p className="text-sm font-semibold text-amber-800 mb-4">Find the shadow for:</p>
        <motion.div
          key={current.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex flex-col items-center bg-white rounded-3xl px-10 py-6 border-4 border-amber-200 shadow-xl"
        >
          <span className="text-7xl mb-2">{current.emoji}</span>
          <span className="text-lg font-bold text-amber-900">{current.name}</span>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
        {shadowOptions.map((opt) => (
          <motion.button
            key={opt.id}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => pickShadow(opt.id)}
            animate={wrong === opt.id ? { x: [0, -6, 6, 0] } : {}}
            className={`aspect-square rounded-2xl border-4 flex items-center justify-center text-5xl sm:text-6xl transition-all bg-slate-800/90 ${
              matched.has(current.id) && opt.id === current.id
                ? "border-green-400 ring-2 ring-green-300"
                : wrong === opt.id
                  ? "border-red-400 bg-red-900/40"
                  : "border-slate-600 hover:border-amber-400 hover:scale-105"
            }`}
          >
            <span className="opacity-40 grayscale">{opt.emoji}</span>
          </motion.button>
        ))}
      </div>

      <p className="text-center text-xs text-amber-700/60 mt-8">
        Round {round + 1} of {PAIRS.length}
      </p>
    </PuzzleShell>
  );
}
