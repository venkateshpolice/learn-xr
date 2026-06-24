"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Play,
  ArrowRight,
  Glasses,
  Scan,
  Rocket,
  FlaskConical,
} from "lucide-react";

const exploreLinks = [
  { href: "/solar-system", label: "Solar System", icon: Rocket, color: "from-blue-500 to-cyan-500" },
  { href: "/chemistry-lab", label: "Chemistry Lab", icon: FlaskConical, color: "from-emerald-500 to-teal-500" },
  { href: "/trigonometry", label: "Trigonometry", icon: Scan, color: "from-violet-500 to-fuchsia-500" },
  { href: "/labs", label: "All Labs", icon: Glasses, color: "from-indigo-500 to-purple-500" },
];

const stats = [
  { value: "50+", label: "Lessons" },
  { value: "12", label: "XR Experiences" },
  { value: "10K+", label: "Students" },
];

const fade = (delay: number, y = 28) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] as const },
});

function StatsBar({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card rounded-xl sm:rounded-2xl px-3 py-3 sm:px-5 sm:py-4 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex -space-x-2 shrink-0">
            {["AR", "VR", "3D"].map((tag) => (
              <span
                key={tag}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 border-2 border-slate-900 flex items-center justify-center text-[9px] sm:text-[10px] font-bold"
              >
                {tag[0]}
              </span>
            ))}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-white truncate">Live XR Classroom</p>
            <p className="text-[10px] sm:text-xs text-slate-400 leading-snug">
              Interactive · Gamified · Curriculum-aligned
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-6 md:gap-8 border-t border-white/10 pt-3 sm:border-0 sm:pt-0">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center sm:text-right">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-none">{value}</p>
              <p className="text-[9px] sm:text-[11px] text-slate-500 uppercase tracking-wide mt-1 leading-tight">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative">
      {/* Background */}
      <div className="absolute inset-0 bg-slate-950 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-24 sm:-top-32 left-1/2 -translate-x-1/2 w-[min(900px,120vw)] h-[280px] sm:h-[500px] bg-indigo-600/20 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute top-1/3 -left-20 sm:-left-32 w-[240px] sm:w-[400px] h-[240px] sm:h-[400px] bg-cyan-500/10 rounded-full blur-[80px] sm:blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[min(500px,90vw)] h-[200px] sm:h-[300px] bg-fuchsia-600/10 rounded-full blur-[80px] sm:blur-[100px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[5.5rem] sm:pt-28 md:pt-32 lg:pt-36 pb-6 sm:pb-8">
        {/* Header copy */}
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-10 lg:mb-14">
          <motion.div
            {...fade(0.1)}
            className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-5 sm:mb-8 max-w-full"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-300 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-indigo-200/90 tracking-wide text-center">
              Immersive Education Platform
            </span>
          </motion.div>

          <motion.h1
            {...fade(0.22)}
            className="text-[1.875rem] leading-[1.1] min-[400px]:text-[2.125rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 px-1"
          >
            <span className="block text-white">Learning Beyond</span>
            <span className="block mt-0.5 sm:mt-1">
              <span className="gradient-text">Books with AR & VR</span>
            </span>
          </motion.h1>

          <motion.p
            {...fade(0.34)}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-6 sm:mb-8 px-1"
          >
            Step inside interactive worlds — explore planets, run virtual science
            experiments, and master tough concepts through hands-on XR learning.
          </motion.p>

          <motion.div
            {...fade(0.46)}
            className="flex flex-col min-[480px]:flex-row items-stretch min-[480px]:items-center justify-center gap-2.5 sm:gap-4 w-full max-w-md sm:max-w-none mx-auto"
          >
            <a
              href="#features"
              className="group w-full min-[480px]:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-slate-950 font-semibold text-sm sm:text-base md:text-lg hover:bg-slate-100 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-white/10"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950 shrink-0" />
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform hidden min-[480px]:block" />
            </a>
            <a
              href="#cta"
              className="w-full min-[480px]:w-auto min-h-[48px] inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/25 active:scale-[0.98] transition-all duration-300"
            >
              Request School Demo
            </a>
          </motion.div>
        </div>

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-4 sm:mb-6 md:mb-10 lg:mb-12 group/hero"
        >
          <div className="absolute -inset-0.5 sm:-inset-1 rounded-2xl sm:rounded-[1.75rem] bg-gradient-to-r from-indigo-500/40 via-cyan-400/30 to-fuchsia-500/40 blur-sm opacity-70 sm:opacity-80" />
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-slate-900/50 shadow-2xl shadow-indigo-950/50">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent z-10 pointer-events-none md:from-slate-950 md:via-slate-950/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-slate-950/30 z-10 pointer-events-none hidden sm:block" />

            <Image
              src="/img/hero.png"
              alt="Students learning with AR and VR in an immersive classroom"
              width={1400}
              height={780}
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px"
              className="w-full h-auto object-cover object-center aspect-[4/3] min-[480px]:aspect-[3/2] sm:aspect-[16/9] md:aspect-[2/1]"
            />

            {/* Stats overlay — tablet & desktop only */}
            <div className="absolute bottom-0 inset-x-0 z-20 p-3 sm:p-4 md:p-6 hidden md:block">
              <StatsBar />
            </div>
          </div>

          {/* Solar explore — button only on hero hover (desktop) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden lg:flex opacity-0 scale-95 pointer-events-none group-hover/hero:opacity-100 group-hover/hero:scale-100 group-hover/hero:pointer-events-auto transition-all duration-300 ease-out">
            <Link
              href="/solar-system"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 hover:from-blue-400 hover:to-cyan-400 hover:scale-105 active:scale-[0.98] transition-all duration-300"
            >
              Explore
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.25, duration: 0.6 }}
            className="absolute right-2 lg:right-4 top-[28%] z-20 hidden lg:block glass-card rounded-xl px-4 py-3 shadow-xl"
          >
            <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-0.5">Mission complete</p>
            <p className="text-sm font-semibold">+50 pts earned</p>
          </motion.div>
        </motion.div>

        {/* Mobile & tablet: stats + badges below image */}
        <div className="md:hidden space-y-3 mb-8 sm:mb-10">
          <StatsBar />
          <div className="flex justify-center">
            <Link
              href="/solar-system"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-transform"
            >
              Explore Solar System
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>

        {/* Quick explore */}
        <motion.div {...fade(0.65, 20)} className="text-center">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 mb-3 sm:mb-4">
            Jump into an experience
          </p>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-2 sm:gap-3 max-w-lg sm:max-w-none mx-auto">
            {exploreLinks.map(({ href, label, icon: Icon, color }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08, duration: 0.5 }}
                className="min-w-0"
              >
                <Link
                  href={href}
                  className="group flex items-center gap-2 sm:gap-2.5 pl-1.5 pr-3 sm:pl-2 sm:pr-4 py-2 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 active:scale-[0.98] transition-all duration-300 min-h-[44px]"
                >
                  <span
                    className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate">
                    {label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
