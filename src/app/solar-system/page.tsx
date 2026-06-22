"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const SolarScene = dynamic(() => import("@/components/SolarScene"), {
  ssr: false,
});

export default function SolarSystemPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <SolarScene />

      {/* Back button */}
      <div className="absolute top-4 left-4 z-30">
        <Link
          href="/"
          className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <h1 className="text-lg font-bold text-white glass-card px-5 py-2 rounded-xl border border-white/10">
          Interactive Solar System
        </h1>
      </div>
    </div>
  );
}
