"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ScanLine, Smartphone, BrainCircuit, Globe, Bone, Landmark, BookOpenCheck, CreditCard, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteImages } from "@/data/site-images";

const arShowcases = [

  {
    title: "Marker-Based WebAR — Heart Anatomy",
    description: "No app install required. Scan a marker in your browser and explore an interactive 3D heart with labels, animation, and live BPM.",
    icon: Smartphone,
    gradient: "from-rose-500 to-pink-500",
    image: siteImages.arWebarHeart,
    imageAlt: "WebAR marker-based heart anatomy experience in the browser",
    items: [
      { icon: Bone, label: "Heart Anatomy", desc: "Rotate, zoom, explode view, and cross-section" },
      { icon: Globe, label: "Works in Browser", desc: "Instant access on any modern device" },
      { icon: ScanLine, label: "Marker Tracking", desc: "Stable, high-accuracy tracking" },
    ],
  },
  {
    title: "Markerless AR — Jet Engine",
    description: "Place engineering models on any flat surface. Explore jet engine components with real-world scale and surface detection.",
    icon: BrainCircuit,
    gradient: "from-cyan-500 to-teal-500",
    image: siteImages.arEngineExploded,
    imageAlt: "Markerless AR jet engine placed on a floor surface",
    items: [
      { icon: Landmark, label: "Engine Components", desc: "Fan, compressor, combustor, turbine, exhaust" },
      { icon: Globe, label: "Any Surface", desc: "Floor, table, or wall placement" },
      { icon: ScanLine, label: "QR Launch", desc: "Scan to experience WebAR instantly" },
    ],
  },
 
];

function ClearImage({ src, alt }: { src: string; alt: string }) {
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
          priority={false}
        />
      </div>
    </div>
  );
}

function ShowcaseBlock({ showcase }: { showcase: (typeof arShowcases)[0] }) {
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

      <ClearImage src={showcase.image} alt={showcase.imageAlt} />

      <div className="grid sm:grid-cols-3 gap-3">
        {showcase.items.map((item) => (
          <div key={item.label} className="glass-card rounded-xl p-4">
            <item.icon className="w-5 h-5 text-indigo-300 mb-2" />
            <h3 className="font-semibold text-white text-sm mb-1">{item.label}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </motion.article>
  );
}

export default function ARExperiencesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="relative pt-24 sm:pt-28 pb-16 sm:pb-20 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent pointer-events-none" />

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
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">AR Experiences</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mt-4 mb-5 leading-tight">
              Augmented Reality{" "}
              <span className="gradient-text">Learning Modes</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-400 leading-relaxed">
              Marker-based, WebAR, and markerless experiences — all designed for clear, interactive learning on phones and tablets.
            </p>
          </motion.header>

          <div className="space-y-14 sm:space-y-20 lg:space-y-24">
            {arShowcases.map((showcase) => (
              <ShowcaseBlock key={showcase.title} showcase={showcase} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
