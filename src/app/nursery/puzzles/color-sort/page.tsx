"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PuzzleShell } from "@/components/nursery-puzzles/PuzzleShell";
import { playSuccess, playError, playComplete, speak, shuffle } from "@/lib/nursery-puzzle-utils";

const COLORS = [
  { id: "red", label: "Red", bg: "bg-red-400", border: "border-red-500", light: "bg-red-100" },
  { id: "blue", label: "Blue", bg: "bg-blue-400", border: "border-blue-500", light: "bg-blue-100" },
  { id: "yellow", label: "Yellow", bg: "bg-yellow-400", border: "border-yellow-500", light: "bg-yellow-100" },
  { id: "green", label: "Green", bg: "bg-green-500", border: "border-green-600", light: "bg-green-100" },
] as const;

type ColorId = (typeof COLORS)[number]["id"];

const ITEMS: { id: string; emoji: string; name: string; color: ColorId }[] = [
  { id: "apple", emoji: "🍎", name: "Apple", color: "red" },
  { id: "sun", emoji: "☀️", name: "Sun", color: "yellow" },
  { id: "leaf", emoji: "🍃", name: "Leaf", color: "green" },
  { id: "fish", emoji: "🐟", name: "Fish", color: "blue" },
  { id: "strawberry", emoji: "🍓", name: "Berry", color: "red" },
  { id: "banana", emoji: "🍌", name: "Banana", color: "yellow" },
  { id: "frog", emoji: "🐸", name: "Frog", color: "green" },
  { id: "balloon", emoji: "🎈", name: "Balloon", color: "blue" },
];

export default function ColorSortPuzzlePage() {
  const [gameKey, setGameKey] = useState(0);
  const [narration, setNarration] = useState(true);
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  const tray = useMemo(() => shuffle(ITEMS), [gameKey]);
  const remaining = tray.filter((i) => !sorted.has(i.id));
  const stars = sorted.size;

  const restart = useCallback(() => {
    setGameKey((k) => k + 1);
    setSorted(new Set());
    setComplete(false);
    setFlash(null);
  }, []);

  const tryDrop = (itemId: string, binColor: ColorId) => {
    const item = ITEMS.find((x) => x.id === itemId);
    if (!item || sorted.has(itemId)) return;

    if (item.color === binColor) {
      playSuccess();
      if (narration) speak(`Yes! ${item.name} is ${binColor}!`);
      setSorted((s) => {
        const next = new Set(s);
        next.add(itemId);
        if (next.size === ITEMS.length) {
          playComplete();
          if (narration) speak("Amazing! You sorted all the colors!");
          setComplete(true);
        }
        return next;
      });
    } else {
      playError();
      if (narration) speak("Try another basket!");
      setFlash(itemId);
      setTimeout(() => setFlash(null), 600);
    }
    setDragging(null);
  };

  return (
    <PuzzleShell
      title="Color Sort"
      subtitle="Drag each picture to its color basket"
      stars={stars}
      total={ITEMS.length}
      narration={narration}
      onToggleNarration={() => setNarration((n) => !n)}
      onRestart={restart}
      complete={complete}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {COLORS.map((c) => (
          <div
            key={c.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              if (id) tryDrop(id, c.id);
            }}
            className={`rounded-2xl border-4 border-dashed ${c.border} ${c.light} min-h-[7rem] p-2 flex flex-col items-center transition-all ${
              dragging ? "scale-[1.02] ring-2 ring-amber-300" : ""
            }`}
          >
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${c.bg} mb-2`}>
              {c.label}
            </span>
            <div className="flex flex-wrap gap-1 justify-center flex-1 content-center">
              {tray
                .filter((i) => sorted.has(i.id) && i.color === c.id)
                .map((i) => (
                  <span key={i.id} className="text-3xl">
                    {i.emoji}
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm font-semibold text-amber-800 mb-3">Drag these pictures 👇</p>
      <div className="flex flex-wrap justify-center gap-3">
        {remaining.map((item) => (
          <motion.div
            key={item.id}
            draggable
            onDragStart={() => setDragging(item.id)}
            onDragEnd={() => setDragging(null)}
            animate={flash === item.id ? { x: [0, -8, 8, -8, 0] } : {}}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-4 border-amber-200 shadow-lg flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
          >
            <span className="text-4xl">{item.emoji}</span>
            <span className="text-[10px] font-bold text-amber-800 mt-1">{item.name}</span>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-xs text-amber-700/60 mt-6">
        Tip: On phone, tap a picture then tap the matching color basket
      </p>
      {dragging && (
        <div className="fixed bottom-4 inset-x-4 flex flex-wrap justify-center gap-2 z-20 sm:hidden">
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => tryDrop(dragging, c.id)}
              className={`px-4 py-2 rounded-xl text-white font-bold text-sm ${c.bg}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </PuzzleShell>
  );
}
