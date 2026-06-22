"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

const STAGES = [
  {
    id: "overview",
    title: "Butterfly Life Cycle",
    subtitle: "Complete Metamorphosis",
    description: "Butterflies undergo one of nature's most incredible transformations — Complete Metamorphosis. This means they pass through four completely different body forms during their life. From a tiny egg to a crawling caterpillar, then a seemingly lifeless chrysalis, and finally a beautiful winged adult.",
    funFact: "The word 'metamorphosis' comes from Greek meaning 'transformation' — butterflies literally rebuild their entire body inside the chrysalis!",
    label: "🦋 Overview",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "egg",
    title: "1. Egg Stage",
    subtitle: "The Beginning of Life",
    description: "A female butterfly carefully lays tiny eggs on specific host plants — the same plants the caterpillar will eat when it hatches. Eggs can be round, oval, or cylindrical, and are often laid on the underside of leaves for protection. Each egg has a hard outer shell (chorion) with tiny holes for air.",
    funFact: "A Monarch butterfly can lay 300-500 eggs in just two weeks! Each egg is only about 1mm across — smaller than a pinhead.",
    label: "🥚 Egg",
    color: "from-yellow-400 to-amber-500",
  },
  {
    id: "larva",
    title: "2. Larva (Caterpillar)",
    subtitle: "The Eating Machine",
    description: "After 3-7 days, a tiny caterpillar (larva) hatches by eating its way out of the egg. Its first meal is often the eggshell itself! The caterpillar's only job is to eat and grow. It sheds its skin (molts) 4-5 times as it outgrows it — each stage between molts is called an 'instar'.",
    funFact: "A caterpillar increases its body weight by 2,700 times! If a human baby did this, it would weigh 8 tonnes by age 2!",
    label: "🐛 Caterpillar",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: "pupa",
    title: "3. Pupa (Chrysalis)",
    subtitle: "The Transformation Chamber",
    description: "When fully grown, the caterpillar forms a chrysalis (pupa). Inside, something extraordinary happens — the caterpillar's body completely dissolves into a cellular soup, then reorganizes into an entirely new creature with wings, antennae, compound eyes, and a proboscis (drinking straw tongue).",
    funFact: "Inside the chrysalis, special 'imaginal discs' that were dormant since the egg stage activate and build the butterfly's new body parts!",
    label: "🫛 Chrysalis",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "adult",
    title: "4. Adult Butterfly",
    subtitle: "The Final Form",
    description: "After 10-14 days, the adult butterfly (imago) emerges. Its wings are crumpled and wet — it must pump fluid into them and wait for them to dry and harden. Once ready, it flies off to feed on flower nectar, find a mate, and eventually lay eggs to restart the cycle.",
    funFact: "Butterflies taste with their feet! They have chemoreceptors on their legs that help them identify the right plants for laying eggs.",
    label: "🦋 Butterfly",
    color: "from-purple-400 to-violet-500",
  },
];

function speakStage(stage: typeof STAGES[0]) {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${stage.title}. ${stage.description}. Fun fact: ${stage.funFact}`);
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  } catch {}
}

export default function ButterflyLifecyclePage() {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [narration, setNarration] = useState(true);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= STAGES.length - 1) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, 12000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (!showIntro && narration) speakStage(STAGES[currentStage]);
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, [currentStage, showIntro, narration]);

  if (showIntro) {
    return (
      <div className="h-screen w-screen text-white relative overflow-hidden bg-gradient-to-b from-[#1a0a2e] via-[#2a1548] to-[#0f0820]">
        <div className="absolute top-3 left-3 z-30">
          <Link href="/" className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-xs text-slate-200 hover:text-white hover:bg-white/20 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center h-full px-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 max-w-lg w-full text-center shadow-2xl">
            <motion.div animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-7xl mb-6">🦋</motion.div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Butterfly Life Cycle</h1>
            <p className="text-slate-400 text-xs mb-4">Complete Metamorphosis in 3D</p>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">Witness one of nature&apos;s most stunning transformations — from a tiny egg to a beautiful butterfly. Explore the 3D model and learn about each incredible stage.</p>
            <div className="grid grid-cols-4 gap-2 mb-8">
              {[{ e: "🥚", l: "Egg" }, { e: "🐛", l: "Larva" }, { e: "🫛", l: "Pupa" }, { e: "🦋", l: "Adult" }].map((s) => (
                <div key={s.l} className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-2.5">
                  <div className="text-xl mb-0.5">{s.e}</div>
                  <div className="text-[9px] text-purple-300 font-semibold">{s.l}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowIntro(false)} className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-lg shadow-lg shadow-purple-500/30 transition-all active:scale-[0.98]">
              Explore Now →
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const stage = STAGES[currentStage];

  return (
    <div className="h-screen w-screen text-white relative overflow-hidden bg-gradient-to-b from-[#0f0820] via-[#1a1040] to-[#0a0515]">
      {/* Header controls */}
      <div className="absolute top-3 left-3 z-30">
        <Link href="/" className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-xs text-slate-200 hover:text-white hover:bg-white/20 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
      </div>
      <div className="absolute top-3 right-3 z-30">
        <button onClick={() => { setNarration(!narration); if (narration) window.speechSynthesis?.cancel(); }} className="bg-black/40 backdrop-blur-sm p-2 rounded-lg border border-white/15 text-slate-300 hover:text-white transition-all">
          {narration ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Stage indicators */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {STAGES.map((s, i) => (
          <button key={s.id} onClick={() => setCurrentStage(i)} className={`transition-all ${i === currentStage ? "w-5 h-2.5 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" : "w-2 h-2 rounded-full bg-white/25 hover:bg-white/50"}`} />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 w-56">
        <div className="bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/10">
          <motion.div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" animate={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%` }} />
        </div>
      </div>

      {/* Stage labels */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentStage(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${i === currentStage ? `bg-gradient-to-r ${s.color} text-white border-white/20 shadow-lg` : "bg-black/30 text-slate-400 border-white/5 hover:bg-black/50 hover:text-white"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 3D Model Viewer */}
      <div className="absolute inset-0 flex items-center justify-center pt-16">
        <div className="w-full h-full max-w-4xl max-h-[65vh] relative">
          {/* @ts-expect-error model-viewer web component */}
          <model-viewer
            src="/models/butterfly/life_cycle_of_a_butterfly.glb"
            ios-src="/models/butterfly/Life_Cycle_Of_a_Butterfly.usdz"
            alt="Butterfly Life Cycle 3D Model"
            auto-rotate
            camera-controls
            shadow-intensity="1.5"
            shadow-softness="0.8"
            exposure="1.2"
            environment-image="neutral"
            style={{ width: "100%", height: "100%", background: "transparent" }}
            ar
            ar-modes="webxr scene-viewer quick-look"
          />
        </div>
      </div>

      {/* Info card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-20 left-4 right-4 sm:left-6 sm:right-auto sm:bottom-24 sm:max-w-lg z-20"
        >
          <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
            <span className={`text-xs font-semibold uppercase tracking-wide bg-gradient-to-r ${stage.color} bg-clip-text text-transparent`}>{stage.subtitle}</span>
            <h2 className="text-xl font-bold mb-2 text-white">{stage.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">{stage.description}</p>
            <div className="flex items-start gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <span>💡</span>
              <p className="text-xs text-amber-300/90">{stage.funFact}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <button onClick={() => { setCurrentStage(0); setIsPlaying(false); }} className="bg-black/50 p-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white transition-all">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={() => setCurrentStage((p) => Math.max(0, p - 1))} disabled={currentStage === 0} className="bg-black/50 p-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white transition-all disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="bg-purple-500/20 px-5 py-2.5 rounded-xl border border-purple-400/30 text-purple-300 hover:text-white transition-all flex items-center gap-2 text-xs font-medium">
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isPlaying ? "Pause" : "Auto Play"}
        </button>
        <button onClick={() => setCurrentStage((p) => Math.min(STAGES.length - 1, p + 1))} disabled={currentStage === STAGES.length - 1} className="bg-black/50 p-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white transition-all disabled:opacity-30">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* AR button hint */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-slate-400">
          📱 View in AR available on mobile
        </div>
      </div>
    </div>
  );
}
