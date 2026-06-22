"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Headset, BookOpen, Gamepad2, Award } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Headset,
    title: "Put On Your Headset",
    description:
      "Grab a VR headset or use your phone's AR capabilities. Our platform works with all major devices.",
    color: "indigo",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Choose Your Subject",
    description:
      "Pick from science, history, mathematics, geography, or biology. New subjects are added monthly.",
    color: "cyan",
  },
  {
    number: "03",
    icon: Gamepad2,
    title: "Interact & Explore",
    description:
      "Walk around, touch objects, conduct experiments. Every interaction is designed to teach a concept.",
    color: "pink",
  },
  {
    number: "04",
    icon: Award,
    title: "Earn & Progress",
    description:
      "Complete challenges, earn badges, and track your progress. Teachers get detailed analytics.",
    color: "emerald",
  },
];

export default function HowItWorks() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-32 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Start Learning in{" "}
            <span className="gradient-text">4 Simple Steps</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Getting started with immersive learning is easier than you think.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/50 via-cyan-500/50 to-pink-500/50 -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const StepCard = () => {
                const ref = useRef(null);
                const isInView = useInView(ref, {
                  once: true,
                  margin: "-50px",
                });

                return (
                  <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    className="relative text-center"
                  >
                    <div className="relative z-10 glass-card rounded-2xl p-8 hover:bg-white/[0.08] transition-all duration-300">
                      <div className="text-5xl font-black text-white/5 absolute top-4 right-4">
                        {step.number}
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-cyan-600/30 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6">
                        <step.icon className="w-8 h-8 text-indigo-300" />
                      </div>
                      <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              };

              return <StepCard key={step.number} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
