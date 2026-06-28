"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PuzzleShell } from "@/components/nursery-puzzles/PuzzleShell";
import { playSuccess, playError, playComplete, speak, shuffle } from "@/lib/nursery-puzzle-utils";

const EMOJIS = ["⭐", "🍎", "🐶", "🌸", "🎈", "🦋", "🍌", "⚽"];

function buildRound() {
  const count = 1 + Math.floor(Math.random() * 5);
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const wrongNums = shuffle([1, 2, 3, 4, 5].filter((n) => n !== count)).slice(0, 2);
  const options = shuffle([count, ...wrongNums]).map((n) => ({ n, correct: n === count }));
  return { count, emoji, options };
}

const ROUNDS = 6;

export default function CountFunPuzzlePage() {
  const [gameKey, setGameKey] = useState(0);
  const [narration, setNarration] = useState(true);
  const [round, setRound] = useState(0);
  const [stars, setStars] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);

  const rounds = useMemo(
    () => Array.from({ length: ROUNDS }, () => buildRound()),
    [gameKey],
  );
  const current = rounds[round];

  const restart = useCallback(() => {
    setGameKey((k) => k + 1);
    setRound(0);
    setStars(0);
    setComplete(false);
  }, []);

  const pick = (n: number) => {
    if (!current) return;
    if (n === current.count) {
      playSuccess();
      if (narration) speak(`Yes! ${n} objects!`);
      setStars((s) => s + 1);
      if (round >= ROUNDS - 1) {
        playComplete();
        if (narration) speak("Wonderful counting!");
        setComplete(true);
      } else {
        setTimeout(() => setRound((r) => r + 1), 700);
      }
    } else {
      playError();
      if (narration) speak("Count again!");
      setWrong(n);
      setTimeout(() => setWrong(null), 500);
    }
  };

  if (!current) return null;

  return (
    <PuzzleShell
      title="Count & Pick"
      subtitle="How many do you see? Tap the number!"
      stars={stars}
      total={ROUNDS}
      narration={narration}
      onToggleNarration={() => setNarration((n) => !n)}
      onRestart={restart}
      complete={complete}
    >
      <motion.div
        key={round}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border-4 border-amber-200 p-6 sm:p-8 shadow-xl mb-8"
      >
        <p className="text-center text-sm font-semibold text-amber-800 mb-4">Count the objects:</p>
        <div className="flex flex-wrap justify-center gap-3 min-h-[5rem]">
          {Array.from({ length: current.count }, (_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="text-5xl sm:text-6xl"
            >
              {current.emoji}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <p className="text-center text-sm font-bold text-amber-900 mb-4">Pick the number 👇</p>
      <div className="flex justify-center gap-4">
        {current.options.map(({ n }) => (
          <motion.button
            key={n}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => pick(n)}
            animate={wrong === n ? { x: [0, -8, 8, 0] } : {}}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-2xl sm:text-3xl font-bold border-4 shadow-lg transition-colors ${
              wrong === n
                ? "bg-red-100 border-red-300 text-red-600"
                : "bg-gradient-to-br from-sky-400 to-blue-500 border-blue-600 text-white hover:from-sky-300"
            }`}
          >
            {n}
          </motion.button>
        ))}
      </div>

      <p className="text-center text-xs text-amber-700/60 mt-8">
        Question {round + 1} of {ROUNDS}
      </p>
    </PuzzleShell>
  );
}
