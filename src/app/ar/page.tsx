"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ScanLine, Smartphone, BrainCircuit, Globe, Bone, Landmark, QrCode, ImageIcon, Maximize2, X } from "lucide-react";
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
    arTryIt: {
      qr: siteImages.arHeartQr,
      marker: siteImages.arHeartMarker,
    },
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

function ImageLightbox({
  src,
  alt,
  open,
  onClose,
}: {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="relative w-full max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={1200}
          className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
}

function ArStepCard({
  step,
  title,
  description,
  src,
  alt,
  variant = "default",
  className = "",
}: {
  step: string;
  title: string;
  description: string;
  src: string;
  alt: string;
  variant?: "qr" | "marker" | "default";
  className?: string;
}) {
  const isQr = variant === "qr";
  const isMarker = variant === "marker";
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div className={`min-w-0 rounded-2xl border border-white/[0.08] bg-slate-950/40 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-bold tracking-widest text-rose-400/90">{step}</span>
          <span className="text-xs sm:text-sm font-semibold text-white">{title}</span>
        </div>
        {isQr ? (
          <QrCode className="w-4 h-4 text-slate-500 shrink-0" />
        ) : (
          <ImageIcon className="w-4 h-4 text-slate-500 shrink-0" />
        )}
      </div>
      <div
        className={`relative flex items-center justify-center ${
          isQr ? "p-4 sm:p-5 min-h-[130px] sm:min-h-[150px] bg-white" : isMarker
            ? "p-4 sm:p-6 lg:p-8 min-h-[240px] sm:min-h-[300px] lg:min-h-[360px] bg-slate-900/60"
            : "p-4 sm:p-5 min-h-[140px] sm:min-h-[160px] bg-slate-900/60"
        }`}
      >
        <Image
          src={src}
          alt={alt}
          width={isMarker ? 560 : 320}
          height={isMarker ? 560 : 320}
          sizes={isMarker ? "(max-width: 1024px) 80vw, 400px" : "(max-width: 1024px) 45vw, 200px"}
          className={`w-full h-auto object-contain ${
            isQr
              ? "max-h-[110px] sm:max-h-[130px]"
              : isMarker
                ? "max-h-[220px] sm:max-h-[280px] lg:max-h-[340px] rounded-md"
                : "max-h-[120px] sm:max-h-[150px] rounded-md"
          }`}
        />
        {isMarker && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/65 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-semibold text-white hover:bg-black/80 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            View bigger
          </button>
        )}
      </div>
      <p className="px-4 py-3 text-[11px] sm:text-xs text-slate-500 leading-relaxed border-t border-white/[0.04]">
        {description}
      </p>
      </div>

      {isMarker && (
        <ImageLightbox
          src={src}
          alt={alt}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

function HeartShowcaseCard({ showcase }: { showcase: (typeof arShowcases)[0] & { arTryIt: { qr: string; marker: string } } }) {
  return (
    <article className="rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-slate-900/30 overflow-hidden shadow-2xl shadow-black/20">
      <div className={`h-px bg-gradient-to-r ${showcase.gradient} opacity-80`} />

      {/* Header */}
      <div className="px-5 sm:px-8 lg:px-10 pt-7 sm:pt-8 pb-6 sm:pb-7 border-b border-white/[0.06]">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className={`hidden sm:flex w-12 h-12 rounded-xl bg-gradient-to-br ${showcase.gradient} items-center justify-center shrink-0 shadow-lg shadow-rose-500/10`}>
              <showcase.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-400 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                Marker-Based WebAR
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Heart Anatomy</h2>
              <p className="text-sm sm:text-base text-slate-400 mt-2.5 leading-relaxed">{showcase.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end shrink-0">
            {showcase.items.map((item) => (
              <div
                key={item.label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] sm:text-xs text-slate-300"
              >
                <item.icon className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Media — preview + steps */}
      <div className="p-5 sm:p-8 lg:p-10">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-4 sm:mb-5">
          How to launch the experience
        </p>

        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-4 sm:gap-5 lg:gap-6 items-stretch">
          {/* Main preview — full container */}
          <div className="relative rounded-2xl border border-white/10 bg-slate-950/50 overflow-hidden min-h-[280px] sm:min-h-[340px] lg:min-h-[480px] h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-950/15 via-transparent to-slate-950/30 pointer-events-none z-[1]" />
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] sm:text-xs font-medium text-white/90">WebAR preview</span>
            </div>
            <div className="relative z-[1] w-full h-full min-h-[280px] sm:min-h-[340px] lg:min-h-[480px]">
              <Image
                src={showcase.image}
                alt={showcase.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* QR + marker steps */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4 sm:gap-5">
            <ArStepCard
              step="Step 01"
              title="Scan QR code"
              description="Point your phone camera at the code to open the WebAR experience — no app install needed."
              src={showcase.arTryIt.qr}
              alt="QR code to launch heart anatomy WebAR"
              variant="qr"
              className="flex-1 lg:flex-none"
            />
            <ArStepCard
              step="Step 02"
              title="AR marker image"
              description="Print this marker or display it on a second screen, then aim your camera at it to anchor the 3D heart."
              src={showcase.arTryIt.marker}
              alt="Heart AR marker for WebAR tracking"
              variant="marker"
              className="flex-[1.6] sm:flex-[2] lg:flex-1"
            />
          </div>
        </div>

        {/* Feature details */}
        <div className="mt-6 sm:mt-8 grid sm:grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-white/[0.06]">
          {showcase.items.map((item) => (
            <div key={item.label} className="flex gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-rose-300" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white mb-0.5">{item.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

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

  if (showcase.arTryIt) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.05 }}
      >
        <HeartShowcaseCard showcase={showcase as (typeof arShowcases)[0] & { arTryIt: { qr: string; marker: string } }} />
      </motion.div>
    );
  }

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
