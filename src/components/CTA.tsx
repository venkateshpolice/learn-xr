"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { ArrowRight, School, GraduationCap, Play } from "lucide-react";
import { siteImages } from "@/data/site-images";

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="cta" className="relative py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto relative z-10"
      >
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 min-h-[420px] sm:min-h-[480px] flex items-center">
          <Image
            src={siteImages.stemLabs}
            alt="STEM labs — physics, math, chemistry and biology"
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/50 sm:to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

          <div className="relative z-10 p-6 sm:p-10 md:p-14 lg:p-16 max-w-2xl">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400 mb-4 block">
              Get Started Today
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Ready to{" "}
              <span className="gradient-text">Transform Learning?</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 mb-8 sm:mb-10 leading-relaxed max-w-xl">
              Join thousands of students and hundreds of schools already using
              immersive AR & VR to make education unforgettable.
            </p>

            <div className="flex flex-col min-[480px]:flex-row gap-3 sm:gap-4">
              <a
                href="#features"
                className="group inline-flex items-center justify-center gap-2.5 min-h-[48px] px-6 sm:px-8 py-3.5 rounded-xl sm:rounded-2xl bg-white text-slate-950 font-semibold text-sm sm:text-base hover:bg-slate-100 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                Start Learning
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#cta"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 sm:px-8 py-3.5 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base border border-white/20 bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-sm transition-all"
              >
                <School className="w-4 h-4" />
                Request School Demo
              </a>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 mt-6 sm:mt-8 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
              Free for individual students. School plans start at ₹999/month.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
