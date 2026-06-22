"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { nurseryCategories, getCategoryHref } from "@/data/nursery-categories";

export default function NurseryPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-cyan-500/10 pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delay" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-slate-300">Ages 3–5 Years</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Nursery <span className="gradient-text">AR Learning</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Choose a category and explore 3D models in Augmented Reality.
              Point your camera and watch objects come to life!
            </p>
            <Link
              href="/shape-matching"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg hover:scale-[1.02] transition-transform"
            >
              🧩 Shape Matching Puzzle — Play Now
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {nurseryCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Link href={getCategoryHref(category)} className="block group">
                <div className="glass-card rounded-3xl p-6 md:p-8 text-center hover:bg-white/[0.08] transition-all duration-300 hover:scale-105 hover:border-white/20 h-full relative">
                  {category.badge && (
                    <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
                      {category.badge}
                    </span>
                  )}
                  <div
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <span className="text-4xl md:text-5xl">{category.emoji}</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                    {category.label}
                  </h3>
                  <p className="text-sm text-slate-400">{category.description}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    {category.href ? "Play now" : `${category.items.length} items`}
                    <svg
                      className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
