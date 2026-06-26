"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const SolarScene = dynamic(() => import("@/components/SolarScene"), {
  ssr: false,
});

export default function SolarSystemPage() {
  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black">
      <SolarScene />

      {/* Top bar — mobile-friendly */}
      <header className="absolute top-0 inset-x-0 z-30 flex items-start justify-between gap-2 px-3 pt-3 pb-2 sm:px-4 sm:pt-4 pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 glass-card px-2.5 py-2 sm:px-4 rounded-xl border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all shrink-0"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>

        <div className="pointer-events-none flex flex-col items-center min-w-0 flex-1 px-1 sm:px-4 max-w-[min(100%,14rem)] sm:max-w-md mx-auto">
          <h1 className="text-xs sm:text-lg font-bold text-white glass-card px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl border border-white/10 text-center leading-tight w-full truncate">
            Solar System
          </h1>
          <span className="mt-1.5 hidden min-[400px]:inline text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-cyan-400/90 glass-card px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-cyan-500/20">
            WebXR · AR & VR
          </span>
        </div>

        {/* Balance back button width on mobile */}
        <div className="w-10 sm:w-[7.5rem] shrink-0" aria-hidden />
      </header>
    </div>
  );
}
