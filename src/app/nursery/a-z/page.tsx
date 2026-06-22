"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Eye, ScanLine, X } from "lucide-react";
import { azLetterModels, hasArModel, type AZLetterModel } from "@/data/a-z-models";

function LetterArModal({ model, onClose }: { model: AZLetterModel; onClose: () => void }) {
  if (!hasArModel(model)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-slate-900 rounded-3xl overflow-hidden border border-white/10"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {model.letter}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {model.letter} — {model.word}
              </h3>
              <p className="text-sm text-slate-400">3D model · View in AR on your device</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="aspect-square w-full bg-gradient-to-b from-slate-800 to-slate-900 relative">
          {/* @ts-expect-error model-viewer web component */}
          <model-viewer
            key={model.letter}
            src={model.glb}
            ios-src={model.usdz}
            poster={model.poster}
            alt={`3D model of ${model.word}`}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            touch-action="pan-y"
            auto-rotate
            shadow-intensity="1.2"
            shadow-softness="0.8"
            exposure="1.1"
            environment-image="neutral"
            style={{ width: "100%", height: "100%" }}
          >
            <button
              slot="ar-button"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl font-semibold text-white flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
            >
              <Eye className="w-5 h-5" />
              View in Your Space
            </button>
            {/* @ts-expect-error model-viewer web component */}
          </model-viewer>
        </div>

        <div className="p-5 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            Tap <span className="text-white font-medium">View in Your Space</span> to place {model.word} in AR
          </p>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 px-4 py-2 rounded-lg glass-card text-sm font-medium hover:bg-white/10 transition-colors text-white"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function NurseryAlphabetArPage() {
  const [activeLetter, setActiveLetter] = useState<AZLetterModel | null>(null);
  const availableCount = azLetterModels.filter(hasArModel).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {activeLetter && (
        <LetterArModal model={activeLetter} onClose={() => setActiveLetter(null)} />
      )}

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-cyan-500/10 pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-12">
          <Link
            href="/nursery"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Nursery</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-400 flex items-center justify-center shadow-lg">
                <span className="text-4xl">🔤</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">A–Z AR Models</h1>
                <p className="text-slate-400 mt-1 max-w-xl">
                  Tap a letter to preview its 3D model and open it in Augmented Reality on your phone or tablet.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-2xl px-5 py-3 text-sm text-slate-300">
              <span className="text-indigo-400 font-semibold">{availableCount}</span> of 26 letters have AR models
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-violet-400" />
          <p className="text-slate-300 text-sm">
            Each card uses GLB (Android / Web) and USDZ (iPhone / iPad) for AR viewing
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
          {azLetterModels.map((model, index) => {
            const ready = hasArModel(model);
            return (
              <motion.div
                key={model.letter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.02 }}
              >
                <button
                  type="button"
                  disabled={!ready}
                  onClick={() => ready && setActiveLetter(model)}
                  className={`w-full text-left group ${ready ? "cursor-pointer" : "cursor-not-allowed opacity-55"}`}
                >
                  <div
                    className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 h-full ${
                      ready
                        ? "hover:bg-white/[0.08] hover:scale-[1.03] hover:border-white/20"
                        : "border-white/5"
                    }`}
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-indigo-500/10 to-violet-500/5 flex items-center justify-center relative overflow-hidden">
                      {model.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={model.poster}
                          alt={model.word}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-5xl">{model.emoji}</span>
                      )}
                      <div className="absolute top-2 left-2 w-9 h-9 rounded-lg bg-indigo-600/90 backdrop-blur-sm flex items-center justify-center font-bold text-white shadow-md">
                        {model.letter}
                      </div>
                      {!ready && (
                        <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-slate-400">
                          Soon
                        </span>
                      )}
                    </div>

                    <div className="p-3.5">
                      <h4 className="font-bold text-white text-sm mb-0.5">{model.word}</h4>
                      {ready ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 group-hover:text-indigo-300">
                          <ScanLine className="w-3 h-3" />
                          View in AR
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Model coming soon</span>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
