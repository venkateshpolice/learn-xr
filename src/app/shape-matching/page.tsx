"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Star, Trophy, Sparkles, RotateCcw, Volume2, VolumeX } from "lucide-react";
import type { RapierRigidBody } from "@react-three/rapier";
import ShapeMatchingScene from "@/components/shape-matching/ShapeMatchingScene";
import {
  SHAPES,
  PLACE_THRESHOLD,
  BOARD_CENTER,
  getBoardSlotLocalPositions,
  getBoardSnapY,
  createTrayLayout,
  TRY_AGAIN_PHRASES,
  getShapeInfo,
  type ShapeId,
} from "@/data/shape-matching-data";

function playTone(freqs: number[], duration = 0.35) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.08;
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
      osc.start(t);
      osc.stop(t + duration);
    });
  } catch {
    /* ignore */
  }
}

function playSuccess() {
  playTone([523, 659, 784, 1047], 0.25);
}

function playError() {
  playTone([280, 220], 0.2);
}

function playComplete() {
  playTone([523, 587, 659, 784, 880, 1047], 0.2);
}

function speak(text: string) {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.88;
      u.pitch = 1.15;
      window.speechSynthesis.speak(u);
    }
  } catch {
    /* ignore */
  }
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        color: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA", "#F472B6", "#FBBF24"][i % 6],
        size: 6 + Math.random() * 8,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: `${p.left}%`, top: -20, width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: [1, 1, 0], rotate: 720 }}
          transition={{ duration: 2.5 + Math.random(), delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

export default function ShapeMatchingPage() {
  const [gameKey, setGameKey] = useState(0);
  const [trayPositions, setTrayPositions] = useState(() => createTrayLayout());
  const [locked, setLocked] = useState<Set<ShapeId>>(new Set());
  const [placedPositions, setPlacedPositions] = useState<Map<ShapeId, [number, number, number]>>(new Map());
  const [dragging, setDragging] = useState<ShapeId | null>(null);
  const [hoverSlot, setHoverSlot] = useState<ShapeId | null>(null);
  const [hoverValid, setHoverValid] = useState(false);
  const [wrongFlash, setWrongFlash] = useState<ShapeId | null>(null);
  const [successGlow, setSuccessGlow] = useState<ShapeId | null>(null);
  const [completed, setCompleted] = useState(false);
  const [xp, setXp] = useState(0);
  const [infoShape, setInfoShape] = useState<ShapeId | null>(null);
  const [feedback, setFeedback] = useState("");
  const [narration, setNarration] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [snappingShapes, setSnappingShapes] = useState<
    Map<ShapeId, { start: [number, number, number]; hole: [number, number, number] }>
  >(new Map());

  const bodyRefs = useRef<Map<ShapeId, RapierRigidBody>>(new Map());

  const slotWorldPositions = useMemo(() => {
    const map = new Map<ShapeId, [number, number, number]>();
    const locals = getBoardSlotLocalPositions();
    const snapY = getBoardSnapY();
    for (const s of locals) {
      map.set(s.id, [BOARD_CENTER[0] + s.x, snapY, BOARD_CENTER[2] + s.z]);
    }
    return map;
  }, []);

  const getSlotWorldPosition = useCallback(
    (id: ShapeId) => slotWorldPositions.get(id) ?? [0, getBoardSnapY(), 0],
    [slotWorldPositions],
  );

  const isLocked = useCallback((id: ShapeId) => locked.has(id), [locked]);

  const findNearestSlot = useCallback(
    (pos: [number, number, number]) => {
      let best: { id: ShapeId; dist: number } | null = null;
      for (const [id, slotPos] of slotWorldPositions) {
        const dx = pos[0] - slotPos[0];
        const dz = pos[2] - slotPos[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (!best || dist < best.dist) best = { id, dist };
      }
      return best;
    },
    [slotWorldPositions],
  );

  const onDragStart = useCallback((id: ShapeId) => {
    setDragging(id);
    setFeedback("");
  }, []);

  const onDragMove = useCallback(
    (id: ShapeId, pos: [number, number, number]) => {
      const nearest = findNearestSlot(pos);
      if (!nearest || nearest.dist > PLACE_THRESHOLD * 1.4) {
        setHoverSlot(null);
        setHoverValid(false);
        return;
      }
      setHoverSlot(nearest.id);
      setHoverValid(nearest.id === id);
    },
    [findNearestSlot],
  );

  const handleSnapComplete = useCallback(
    (id: ShapeId, holePos: [number, number, number]) => {
      setSnappingShapes((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      setLocked((prev) => {
        const next = new Set(prev).add(id);
        if (next.size === SHAPES.length) {
          setTimeout(() => {
            setCompleted(true);
            playComplete();
            if (narration) speak("Congratulations! You completed the puzzle!");
          }, 600);
        }
        return next;
      });
      setPlacedPositions((prev) => new Map(prev).set(id, holePos));
    },
    [narration],
  );

  const onDragEnd = useCallback(
    (id: ShapeId, pos: [number, number, number]) => {
      setDragging(null);
      setHoverSlot(null);
      setHoverValid(false);

      const nearest = findNearestSlot(pos);
      if (!nearest || nearest.dist > PLACE_THRESHOLD) return;

      const body = bodyRefs.current.get(id);
      const slotPos = getSlotWorldPosition(nearest.id);

      if (nearest.id === id) {
        playSuccess();
        const info = getShapeInfo(id);
        const phrase = info.successPhrases[Math.floor(Math.random() * info.successPhrases.length)]!;
        setFeedback(phrase);
        setSuccessGlow(id);
        setInfoShape(id);
        setXp((x) => x + 10);
        if (narration) {
          speak(`${phrase} ${info.name}. ${info.examples}`);
        }

        const start: [number, number, number] = body
          ? (() => {
              body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
              const t = body.translation();
              return [t.x, t.y, t.z];
            })()
          : pos;

        bodyRefs.current.delete(id);
        setSnappingShapes((prev) => new Map(prev).set(id, { start, hole: slotPos }));

        setTimeout(() => setSuccessGlow(null), 1200);
      } else {
        playError();
        const msg = TRY_AGAIN_PHRASES[Math.floor(Math.random() * TRY_AGAIN_PHRASES.length)]!;
        setFeedback(msg);
        setWrongFlash(nearest.id);
        if (narration) speak(msg);
        setTimeout(() => setWrongFlash(null), 800);

        if (body) {
          body.setLinvel({ x: 0, y: 0, z: 0 }, true);
          body.applyImpulse({ x: (Math.random() - 0.5) * 0.25, y: 0.12, z: (Math.random() - 0.5) * 0.25 }, true);
        }
      }
    },
    [findNearestSlot, getSlotWorldPosition, narration],
  );

  const resetGame = () => {
    bodyRefs.current.clear();
    setTrayPositions(createTrayLayout());
    setLocked(new Set());
    setPlacedPositions(new Map());
    setSnappingShapes(new Map());
    setDragging(null);
    setCompleted(false);
    setXp(0);
    setInfoShape(null);
    setFeedback("");
    setGameKey((k) => k + 1);
  };

  const gameState = {
    placed: locked,
    locked,
    dragging,
    hoverSlot,
    hoverValid,
    wrongFlash,
    successGlow,
    completed,
    xp,
  };

  const info = infoShape ? getShapeInfo(infoShape) : null;

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 text-amber-950 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-amber-200 shadow-2xl text-center"
          >
            <Link
              href="/nursery"
              className="inline-flex items-center gap-1 text-amber-700/70 text-xs mb-4 hover:text-amber-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Nursery
            </Link>
            <div className="text-6xl mb-4">🧩</div>
          <h1 className="text-3xl font-bold mb-2 text-amber-900">Shape Matching Puzzle</h1>
          <p className="text-amber-800/80 text-sm mb-6 leading-relaxed">
            Pick up shapes from the tray on the right and fit each one into its matching hole on the board.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {SHAPES.slice(0, 8).map((s) => (
              <span
                key={s.id}
                className="w-8 h-8 rounded-lg shadow-sm border border-white/50"
                style={{ backgroundColor: s.color }}
                title={s.name}
              />
            ))}
            <span className="text-xs text-amber-700 self-center">+{SHAPES.length - 8} more</span>
          </div>
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Start Playing →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-sky-100 via-amber-50 to-orange-100 overflow-hidden">
      {completed && <Confetti />}

      <header className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-amber-200/80 bg-white/70 backdrop-blur-md z-20">
        <Link href="/nursery" className="flex items-center gap-2 text-amber-800/70 hover:text-amber-900 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Nursery
        </Link>
        <h1 className="font-bold text-amber-900 text-sm sm:text-base">Shape Matching</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
            {locked.size}/{SHAPES.length}
          </span>
          <span className="text-xs text-amber-600">{xp} XP</span>
          <button
            type="button"
            onClick={() => setNarration((n) => !n)}
            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-100"
          >
            {narration ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button type="button" onClick={resetGame} className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-100" title="Restart">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 relative min-h-0">
        <Canvas
          key={gameKey}
          shadows
          camera={{ position: [0, 4.35, 7.0], fov: 48 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
          dpr={[1, 1.5]}
        >
          <ShapeMatchingScene
            trayPositions={trayPositions}
            placedPositions={placedPositions}
            snappingShapes={snappingShapes}
            onSnapComplete={handleSnapComplete}
            gameState={gameState}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragMove={onDragMove}
            getSlotWorldPosition={getSlotWorldPosition}
            isLocked={isLocked}
            bodyRefs={bodyRefs}
          />
        </Canvas>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-white/90 border border-amber-200 shadow-lg text-amber-900 font-semibold text-sm z-10"
          >
            {feedback}
          </motion.div>
        )}

        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-xs z-10 pointer-events-none">
          <div className="bg-white/85 backdrop-blur-md rounded-xl px-3 py-2 border border-amber-200 text-[11px] text-amber-800">
            <span className="font-semibold">Board</span> ← holes · <span className="font-semibold">Tray</span> → pick shapes
          </div>
        </div>
      </div>

      <AnimatePresence>
        {info && (
          <motion.aside
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="absolute top-16 right-4 w-72 max-w-[calc(100%-2rem)] bg-white/95 backdrop-blur-xl rounded-2xl border border-amber-200 shadow-xl p-4 z-20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl shadow-inner border border-white" style={{ backgroundColor: info.color }} />
              <div>
                <h2 className="font-bold text-lg text-amber-900">{info.name}</h2>
                <p className="text-xs text-amber-600">
                  {info.sides} sides · {info.corners} corners
                </p>
              </div>
            </div>
            <p className="text-sm text-amber-800/90 leading-relaxed">
              <span className="font-medium">Real world:</span> {info.examples}
            </p>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-amber-200"
            >
              <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Congratulations!</h2>
              <p className="text-amber-800 mb-4">You completed the puzzle!</p>
              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3].map((i) => (
                  <Star key={i} className="w-8 h-8 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-amber-700 mb-2 flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4" /> {xp} XP · Achievement Unlocked!
              </p>
              <button
                type="button"
                onClick={resetGame}
                className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
