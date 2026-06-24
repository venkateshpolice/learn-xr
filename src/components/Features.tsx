"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  Globe, Microscope, Landmark, Rocket, Brain, Users, LetterText, Hash,
  Droplets, Leaf, TreePine, Bug, Atom, Pi, Triangle, Ruler, Waves, Magnet, Puzzle,
  ArrowUpRight,
} from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Image from "next/image";
import { siteImages } from "@/data/site-images";

const featureShowcaseImages = [
  {
    src: siteImages.anatomyLab,
    alt: "Students exploring human anatomy with interactive 3D AR",
    label: "Human Anatomy",
    tag: "3D Lab",
    accent: "from-rose-500 to-pink-500",
    mesh: "from-rose-950/80 via-slate-900 to-slate-950",
  },
  {
    src: siteImages.audienceClassroom,
    alt: "Children learning with AR markers in a classroom",
    label: "AR Classroom Experience",
    tag: "Live Demo",
    accent: "from-indigo-500 to-violet-500",
    mesh: "from-indigo-950/80 via-slate-900 to-slate-950",
  },
  {
    src: siteImages.heartView,
    alt: "Interactive 3D heart anatomy view",
    label: "Heart Explorer",
    tag: "Interactive",
    accent: "from-cyan-500 to-teal-500",
    mesh: "from-cyan-950/80 via-slate-900 to-slate-950",
  },
];

const features = [
  { icon: Globe, title: "Explore the Solar System", description: "Walk among planets and witness stellar phenomena in 3D.", gradient: "from-blue-500 to-cyan-500", link: "/solar-system" },
  { icon: LetterText, title: "Alphabet Adventure", description: "Drag-and-drop A–Z with points and speed bonuses.", gradient: "from-pink-500 to-rose-500", link: "/alphabet-adventure" },
  { icon: Puzzle, title: "Shape Matching Puzzle", description: "Montessori-style 3D puzzle with physics and voice learning.", gradient: "from-amber-500 to-orange-500", link: "/shape-matching" },
  { icon: Pi, title: "Trigonometry Laboratory", description: "17 modules — unit circle, waves, polar coords, WebXR.", gradient: "from-fuchsia-500 to-pink-500", link: "/trigonometry" },
  { icon: Triangle, title: "Geometry Editor", description: "Pick 3D shapes and adjust dimensions in real time.", gradient: "from-violet-500 to-purple-500", link: "/geometry-editor" },
  { icon: Ruler, title: "Vernier Caliper", description: "Realistic 3D caliper with AR support.", gradient: "from-cyan-500 to-blue-500", link: "/vernier-caliper" },
  { icon: Waves, title: "Wave Motion", description: "Interactive ripple physics in a 3D pool.", gradient: "from-sky-500 to-blue-500", link: "/wave-motion" },
  { icon: Magnet, title: "Magnetism Lab", description: "Drag bar magnets and watch force fields live.", gradient: "from-indigo-500 to-violet-500", link: "/magnetism" },
  { icon: Hash, title: "Number Adventure", description: "Arrange numbers 0–10 with counting facts.", gradient: "from-cyan-500 to-teal-500", link: "/number-adventure" },
  { icon: Droplets, title: "Water Cycle", description: "Drag evaporation, condensation & precipitation stages.", gradient: "from-sky-500 to-indigo-500", link: "/water-cycle" },
  { icon: Leaf, title: "Photosynthesis", description: "Plants making food from sunlight in 3D.", gradient: "from-green-500 to-emerald-500", link: "/photosynthesis" },
  { icon: TreePine, title: "Plant Life Cycle", description: "Seed to tree — germination through aging.", gradient: "from-lime-500 to-green-600", link: "/plant-lifecycle" },
  { icon: Bug, title: "Butterfly Life Cycle", description: "Complete metamorphosis with AR narration.", gradient: "from-purple-500 to-pink-500", link: "/butterfly-lifecycle" },
  { icon: Atom, title: "3D Periodic Table", description: "All 118 elements with rich detail cards.", gradient: "from-cyan-500 to-blue-500", link: "/periodic-table" },
  { icon: Atom, title: "Interactive Chemistry Lab", description: "Build molecules, run quizzes, WebXR VR.", gradient: "from-emerald-500 to-teal-500", link: "/chemistry-lab" },
  { icon: Landmark, title: "Walk Through History", description: "Step inside pyramids, coliseums, and castles.", gradient: "from-amber-500 to-orange-500" },
  { icon: Microscope, title: "Virtual Science Labs", description: "Chemistry, biology, and physics without risk.", gradient: "from-emerald-500 to-teal-500" },
  { icon: Brain, title: "Complex Concepts Simplified", description: "Abstract math and physics in interactive 3D.", gradient: "from-purple-500 to-pink-500" },
  { icon: Rocket, title: "Self-Paced Learning", description: "Repeat experiences until concepts click.", gradient: "from-rose-500 to-red-500" },
  { icon: Users, title: "Collaborative Experiences", description: "Multiple students in the same virtual space.", gradient: "from-indigo-500 to-violet-500" },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const inner = (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
      className={`group relative glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:bg-white/[0.07] transition-all duration-300 hover:border-indigo-500/25 h-full ${feature.link ? "cursor-pointer" : ""}`}
    >
      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
        <feature.icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 pr-6">{feature.title}</h3>
      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">{feature.description}</p>
      {feature.link && (
        <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-indigo-400/50 group-hover:text-indigo-300 transition-colors" />
      )}
    </motion.div>
  );
  return feature.link ? <Link href={feature.link}>{inner}</Link> : inner;
}

function ShowcaseCard({
  src,
  alt,
  label,
  tag,
  accent,
  mesh,
  index,
}: (typeof featureShowcaseImages)[0] & { index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative min-w-0"
    >
      <div className="relative h-full rounded-2xl sm:rounded-[1.25rem] lg:rounded-3xl overflow-hidden border border-white/[0.08] bg-slate-950/80 transition-all duration-500 group-hover:border-white/20 group-hover:-translate-y-1 group-hover:shadow-[0_24px_48px_-12px_rgba(99,102,241,0.25)]">
        <div className={`absolute inset-0 bg-gradient-to-br ${mesh}`} />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.08) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className={`absolute -top-12 -right-12 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-35`} />

        <div className="relative flex flex-col">
          <div className="relative flex items-center justify-center p-4 sm:p-5 lg:p-6 min-h-[200px] sm:min-h-[300px] lg:min-h-[360px] xl:min-h-[400px]">
            <div className="absolute inset-x-6 sm:inset-x-8 bottom-4 sm:bottom-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={1200}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 400px"
              className="relative z-10 w-full h-auto max-h-[180px] sm:max-h-[280px] lg:max-h-[340px] xl:max-h-[380px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          </div>

          <div className="relative border-t border-white/[0.06] px-4 py-3.5 sm:px-5 sm:py-4 bg-slate-950/60 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${accent} text-white shadow-sm mb-1.5 sm:mb-2`}
                >
                  {tag}
                </span>
                <p className="text-sm sm:text-base font-semibold text-white truncate">{label}</p>
              </div>
              <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/[0.08]">
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative pt-10 sm:pt-12 pb-16 sm:pb-20 lg:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/15 to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          // eyebrw="Features"
          title={<>Why Immersive Learning <span className="gradient-text">Works</span></>}
          description="Research shows students retain 75% more through experiential learning. Explore physics, math, chemistry, and biology labs in 3D."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-12 sm:mb-16 lg:mb-20">
          {featureShowcaseImages.map((item, i) => (
            <ShowcaseCard key={item.label} {...item} index={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <Link
            href="/labs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-sm sm:text-base font-semibold transition-all"
          >
            Browse All Labs
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
