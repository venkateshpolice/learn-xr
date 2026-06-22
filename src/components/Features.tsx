"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  Globe,
  Microscope,
  Landmark,
  Rocket,
  Brain,
  Users,
  LetterText,
  Hash,
  Droplets,
  Leaf,
  TreePine,
  Bug,
  Atom,
  Pi,
  Triangle,
  Ruler,
  Waves,
  Magnet,
  Puzzle,
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Explore the Solar System",
    description:
      "Walk among planets, witness stellar phenomena, and understand the universe in a way textbooks never could.",
    gradient: "from-blue-500 to-cyan-500",
    link: "/solar-system",
  },
  {
    icon: LetterText,
    title: "Alphabet Adventure",
    description:
      "A fun 3D drag-and-drop game where kids arrange colorful alphabets A–Z in order. Earn points and speed bonuses!",
    gradient: "from-pink-500 to-rose-500",
    link: "/alphabet-adventure",
  },
  {
    icon: Puzzle,
    title: "Shape Matching Puzzle",
    description:
      "Montessori-style 3D puzzle — drag colorful shapes into matching holes with realistic physics, sounds, and voice learning.",
    gradient: "from-amber-500 to-orange-500",
    link: "/shape-matching",
  },
  {
    icon: Pi,
    title: "Trigonometry Laboratory",
    description:
      "17 interactive modules — unit circle, wave graphs, polar coordinates, quiz mode, formula library, and WebXR AR/VR.",
    gradient: "from-fuchsia-500 to-pink-500",
    link: "/trigonometry",
  },
  {
    icon: Triangle,
    title: "Geometry Editor",
    description:
      "Pick 3D shapes from a library and adjust radius, height, width & more in real time on a live 3D canvas.",
    gradient: "from-violet-500 to-purple-500",
    link: "/geometry-editor",
  },
  {
    icon: Ruler,
    title: "Vernier Caliper",
    description:
      "Explore a realistic 3D vernier caliper — play and pause jaw animation, rotate the model, and try AR on supported devices.",
    gradient: "from-cyan-500 to-blue-500",
    link: "/vernier-caliper",
  },
  {
    icon: Waves,
    title: "Wave Motion",
    description:
      "Swimming pool with clear water, caustics, lane lines, and interactive ripple physics — explore waves in 3D.",
    gradient: "from-sky-500 to-blue-500",
    link: "/wave-motion",
  },
  {
    icon: Magnet,
    title: "Magnetism Lab",
    description:
      "Drag two bar magnets in 3D — watch opposite poles attract and like poles repel with live force visualization.",
    gradient: "from-indigo-500 to-violet-500",
    link: "/magnetism",
  },
  {
    icon: Hash,
    title: "Number Adventure",
    description:
      "A 3D counting game where kids arrange numbers 0–10 in order. Learn number words and fun counting facts!",
    gradient: "from-cyan-500 to-teal-500",
    link: "/number-adventure",
  },
  {
    icon: Droplets,
    title: "Water Cycle",
    description:
      "Explore the water cycle in 3D! Drag stages like Evaporation, Condensation, Precipitation & Collection in order.",
    gradient: "from-sky-500 to-indigo-500",
    link: "/water-cycle",
  },
  {
    icon: Leaf,
    title: "Photosynthesis",
    description:
      "Watch how plants make food from sunlight, water & CO₂ in a stunning 3D step-by-step experience with narration.",
    gradient: "from-green-500 to-emerald-500",
    link: "/photosynthesis",
  },
  {
    icon: TreePine,
    title: "Plant Life Cycle",
    description:
      "Journey from seed to towering tree and back! Explore germination, growth, flowering, fruiting & aging in realistic 3D.",
    gradient: "from-lime-500 to-green-600",
    link: "/plant-lifecycle",
  },
  {
    icon: Bug,
    title: "Butterfly Life Cycle",
    description:
      "Witness complete metamorphosis in 3D — from egg to caterpillar, chrysalis to butterfly. Interactive AR model with narration.",
    gradient: "from-purple-500 to-pink-500",
    link: "/butterfly-lifecycle",
  },
  {
    icon: Atom,
    title: "3D Periodic Table",
    description:
      "Explore all 118 elements in an interactive 3D table. Click elements for details — atomic mass, electrons, discovery & more.",
    gradient: "from-cyan-500 to-blue-500",
    link: "/periodic-table",
  },
  {
    icon: Atom,
    title: "Interactive Chemistry Lab",
    description:
      "Build and explore molecules in 3D — ball-and-stick models, molecule builder, quizzes, and WebXR VR support.",
    gradient: "from-emerald-500 to-teal-500",
    link: "/chemistry-lab",
  },
  {
    icon: Landmark,
    title: "Walk Through History",
    description:
      "Step inside ancient Egyptian pyramids, Roman coliseums, and medieval castles. Experience history firsthand.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Microscope,
    title: "Virtual Science Labs",
    description:
      "Conduct chemistry experiments, dissect organisms, and observe molecular structures without any risk.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Brain,
    title: "Complex Concepts Simplified",
    description:
      "Visualize abstract mathematics, physics forces, and biological processes in interactive 3D environments.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Rocket,
    title: "Self-Paced Learning",
    description:
      "Students learn at their own speed, repeating experiences until concepts click. No pressure, just exploration.",
    gradient: "from-rose-500 to-red-500",
  },
  {
    icon: Users,
    title: "Collaborative Experiences",
    description:
      "Multiple students can join the same virtual space, working together on projects and discoveries.",
    gradient: "from-indigo-500 to-violet-500",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const content = (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`group glass-card rounded-2xl p-8 hover:bg-white/[0.08] transition-all duration-500 hover:scale-[1.02] hover:border-indigo-500/30 h-full ${feature.link ? "cursor-pointer" : ""}`}
    >
      <div
        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
      >
        <feature.icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
      <p className="text-slate-400 leading-relaxed">{feature.description}</p>
      {feature.link && (
        <p className="mt-4 text-sm text-indigo-400 font-medium group-hover:text-indigo-300 transition-colors">
          Click to explore →
        </p>
      )}
    </motion.div>
  );

  if (feature.link) {
    return <Link href={feature.link}>{content}</Link>;
  }

  return content;
}

export default function Features() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Why Immersive Learning{" "}
            <span className="gradient-text">Works</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Research shows students retain 75% more information through
            experiential learning compared to traditional methods.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
