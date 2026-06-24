"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Globe, FlaskConical, Briefcase, Glasses } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteImages } from "@/data/site-images";

const vrShowcases = [
  {
    title: "Explore the International Space Station",
    description: "Navigate ISS modules in immersive VR — Harmony, Columbus, Cupola, and more. Mission objectives, system status, and interactive controls.",
    icon: Briefcase,
    gradient: "from-indigo-500 to-violet-500",
    image: siteImages.vrIssExplore,
    imageAlt: "VR interface for exploring the International Space Station with module details",
    items: [
      { emoji: "🛰️", label: "ISS Modules", desc: "Tour every major module in 3D" },
      { emoji: "🔭", label: "Mission Objectives", desc: "Guided learning quests" },
      { emoji: "🌍", label: "Earth View", desc: "Observe our planet from orbit" },
      { emoji: "🎮", label: "Interactive Controls", desc: "Teleport, rotate, and zoom" },
    ],
  },
 
  
];

function ClearImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden">
      <div className="relative flex items-center justify-center p-3 sm:p-6 lg:p-8 min-h-[240px] sm:min-h-[320px] lg:min-h-[400px]">
        <Image
          src={src}
          alt={alt}
          width={1600}
          height={1000}
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="w-full h-auto max-h-[75vh] object-contain"
          priority={priority}
        />
      </div>
    </div>
  );
}

function ShowcaseBlock({ showcase, index }: { showcase: (typeof vrShowcases)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.05 }}
      className="space-y-5 sm:space-y-6"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${showcase.gradient} flex items-center justify-center shrink-0`}>
          <showcase.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{showcase.title}</h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-3xl leading-relaxed">{showcase.description}</p>
        </div>
      </div>

      <ClearImage src={showcase.image} alt={showcase.imageAlt} priority={index === 0} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {showcase.items.map((item) => (
          <div key={item.label} className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{item.emoji}</div>
            <h3 className="font-semibold text-white text-xs sm:text-sm mb-1">{item.label}</h3>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </motion.article>
  );
}

export default function VRExperiencesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="relative pt-24 sm:pt-28 pb-16 sm:pb-20 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">VR Experiences</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mt-4 mb-5 leading-tight">
              Virtual Reality{" "}
              <span className="gradient-text">Immersion</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-400 leading-relaxed">
              Step into fully immersive worlds — space stations, anatomy labs, and collaborative XR classrooms designed for unforgettable learning.
            </p>
          </motion.header>

          <div className="space-y-14 sm:space-y-20 lg:space-y-24">
            {vrShowcases.map((showcase, i) => (
              <ShowcaseBlock key={showcase.title} showcase={showcase} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 sm:mt-20 text-center"
          >
            <Link
              href="/labs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity"
            >
              Explore Interactive Labs
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
