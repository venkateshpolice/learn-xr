"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Ruler,
  Glasses,
  Info,
} from "lucide-react";

const MODEL_SRC = "/models/vernier/verniercaliper.glb";
const MODEL_USDZ = "/models/vernier/VernierCaliper.usdz";

type ModelViewerElement = HTMLElement & {
  loaded?: boolean;
  availableAnimations?: string[];
  animationName?: string;
  currentTime?: number;
  play: (options?: { repetitions?: number }) => void;
  pause: () => void;
};

export default function VernierCaliperPage() {
  const viewerRef = useRef<ModelViewerElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [animations, setAnimations] = useState<string[]>([]);
  const [activeAnim, setActiveAnim] = useState<string>("");

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const onLoad = () => {
      const names = [...(el.availableAnimations ?? [])];
      setAnimations(names);
      setLoaded(true);
      if (names.length > 0) {
        const first = names[0]!;
        setActiveAnim(first);
        el.animationName = first;
      }
    };

    const onFinished = () => setPlaying(false);
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);

    el.addEventListener("load", onLoad);
    el.addEventListener("finished", onFinished);
    el.addEventListener("pause", onPause);
    el.addEventListener("play", onPlay);

    if (el.loaded) onLoad();

    return () => {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("finished", onFinished);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("play", onPlay);
    };
  }, []);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    if (playing) el.removeAttribute("auto-rotate");
    else el.setAttribute("auto-rotate", "");
  }, [playing]);

  const playAnimation = () => {
    const el = viewerRef.current;
    if (!el || animations.length === 0) return;
    if (activeAnim) el.animationName = activeAnim;
    el.play({ repetitions: Infinity });
    setPlaying(true);
  };

  const pauseAnimation = () => {
    viewerRef.current?.pause();
    setPlaying(false);
  };

  const togglePlay = () => {
    if (playing) pauseAnimation();
    else playAnimation();
  };

  const restartAnimation = () => {
    const el = viewerRef.current;
    if (!el) return;
    el.currentTime = 0;
    if (playing) el.play({ repetitions: Infinity });
  };

  const selectAnimation = (name: string) => {
    const el = viewerRef.current;
    if (!el) return;
    setActiveAnim(name);
    el.animationName = name;
    el.currentTime = 0;
    if (playing) el.play({ repetitions: Infinity });
  };

  return (
    <div className="h-screen w-screen text-white relative overflow-hidden bg-gradient-to-b from-[#0a1020] via-[#111827] to-[#070b14]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a1020]/80 backdrop-blur-md">
        <Link
          href="/labs/physics"
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Physics Lab
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Ruler className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm">Vernier Caliper</h1>
            <p className="text-[10px] text-slate-400">3D measurement tool</p>
          </div>
        </div>
        <div className="w-20" />
      </header>

      <div className="absolute inset-0 pt-14 pb-44 sm:pb-48 flex items-center justify-center">
        <div className="w-full h-full max-w-5xl px-4">
          {/* @ts-expect-error model-viewer web component */}
          <model-viewer
            ref={viewerRef}
            src={MODEL_SRC}
            ios-src={MODEL_USDZ}
            alt="Vernier Caliper 3D Model"
            camera-controls
            touch-action="pan-y"
            shadow-intensity="1.2"
            shadow-softness="0.85"
            exposure="1.15"
            environment-image="neutral"
            auto-rotate
            rotation-per-second="12deg"
            interaction-prompt="auto"
            ar
            ar-modes="webxr scene-viewer quick-look"
            style={{
              width: "100%",
              height: "100%",
              minHeight: "320px",
              background: "transparent",
            }}
          />
        </div>
      </div>

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-black/50 border border-white/10 text-sm text-slate-300">
            Loading 3D model…
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-24 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-20"
      >
        <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl">
          <div className="flex items-start gap-2 mb-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-sm text-cyan-200">How to use</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Drag to rotate · Pinch/scroll to zoom · Press <strong className="text-slate-300">Play</strong> to
                animate the sliding jaw. A vernier caliper measures length to 0.02 mm precision using main and vernier scales.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 inset-x-0 z-30 border-t border-white/10 bg-[#0a1020]/95 backdrop-blur-md px-4 py-4">
        <div className="max-w-lg mx-auto space-y-3">
          {animations.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {animations.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => selectAnimation(name)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    activeAnim === name
                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={restartAnimation}
              disabled={!loaded || animations.length === 0}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
              title="Restart animation"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              disabled={!loaded || animations.length === 0}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm border transition-all disabled:opacity-40 ${
                playing
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-200 hover:bg-amber-500/30"
                  : "bg-cyan-500/20 border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/30"
              }`}
            >
              {playing ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause Animation
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Play Animation
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <Glasses className="w-3 h-3" />
            AR available on supported devices · Animation: {activeAnim || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
