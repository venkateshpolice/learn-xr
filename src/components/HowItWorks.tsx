"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Headset, BookOpen, Gamepad2, Award } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { siteImages } from "@/data/site-images";

const steps = [
  {
    number: "01",
    icon: Headset,
    title: "Put On Your Headset",
    description: "Grab a VR headset or use your phone's AR capabilities. Works with all major devices.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Choose Your Subject",
    description: "Pick from science, history, mathematics, geography, or biology. New subjects monthly.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    number: "03",
    icon: Gamepad2,
    title: "Interact & Explore",
    description: "Walk around, touch objects, conduct experiments. Every interaction teaches a concept.",
    color: "from-pink-500 to-rose-500",
  },
  {
    number: "04",
    icon: Award,
    title: "Earn & Progress",
    description: "Complete challenges, earn badges, and track progress. Teachers get detailed analytics.",
    color: "from-emerald-500 to-teal-500",
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      className="relative"
    >
      <div className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 h-full hover:bg-white/[0.07] transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0`}>
            <step.icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-3xl font-black text-white/10">{step.number}</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold mb-2 text-white">{step.title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const imageRef = useRef(null);
  const imageInView = useInView(imageRef, { once: true, margin: "-60px" });

  return (
    <section id="how-it-works" className="relative py-16 sm:py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="How It Works"
          eyebrowColor="text-cyan-400"
          title={<>Start Learning in <span className="gradient-text">4 Simple Steps</span></>}
          description="Open on any device, point at a marker or surface, and start exploring in seconds."
        />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            ref={imageRef}
            initial={{ opacity: 0, x: -24 }}
            animate={imageInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="absolute -inset-0.5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-cyan-500/25 to-indigo-500/25 blur-sm" />
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10">
              <Image
                src={siteImages.vrSpaceStation}
                alt="How interactive 3D learning works — scan, explore, and learn"
                width={1200}
                height={800}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-auto object-cover aspect-[4/3] sm:aspect-[3/2]"
              />
            </div>
          </motion.div>

          <div className="order-1 lg:order-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {steps.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
