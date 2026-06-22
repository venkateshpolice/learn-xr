"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Sparkles, Play } from "lucide-react";

const SolarScene = dynamic(() => import("./SolarScene"), { ssr: false });

export default function Hero() {
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float-delay" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float-delay-2" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-slate-300">
              The Future of Education is Immersive
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8"
          >
            Learning Beyond Books
            <br />
            <span className="gradient-text">with AR & VR</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Transform education through immersive experiences. Students can explore
            planets, walk through ancient civilizations, conduct virtual science
            experiments, and understand complex concepts through interactive AR and
            VR learning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#cta"
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 animate-pulse-glow"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Start Learning
              </span>
            </a>
            <a
              href="#cta"
              className="px-8 py-4 glass-card rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              Request School Demo
            </a>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-20 flex flex-col items-center gap-2"
          >
            <span className="text-xs text-slate-500">Scroll to explore</span>
            <div className="w-5 h-8 rounded-full border border-slate-600 flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3D Solar System Section */}
      {/* <section className="relative w-full h-[80vh] overflow-hidden">
        <SolarScene />
      </section> */}
    </>
  );
}
