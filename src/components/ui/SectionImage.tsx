"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type SectionImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  aspectClass?: string;
  overlay?: "bottom" | "full" | "none";
};

export default function SectionImage({
  src,
  alt,
  priority = false,
  className = "",
  aspectClass = "aspect-[16/10] sm:aspect-[2/1]",
  overlay = "bottom",
}: SectionImageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`relative ${className}`}
    >
      <div className="absolute -inset-0.5 sm:-inset-1 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-500/30 via-cyan-400/20 to-fuchsia-500/30 blur-sm opacity-70" />
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-slate-900/40 shadow-xl shadow-indigo-950/30">
        {overlay === "bottom" && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent z-10 pointer-events-none" />
        )}
        {overlay === "full" && (
          <div className="absolute inset-0 bg-slate-950/40 z-10 pointer-events-none" />
        )}
        <Image
          src={src}
          alt={alt}
          width={1400}
          height={875}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px"
          className={`w-full h-auto object-cover object-center ${aspectClass}`}
        />
      </div>
    </motion.div>
  );
}
