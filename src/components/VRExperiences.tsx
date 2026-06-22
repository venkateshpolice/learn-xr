"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Rocket,
  FlaskConical,
  Briefcase,
  Globe,
  Atom,
  Dna,
  Stethoscope,
  Wrench,
  Plane,
  Microscope,
} from "lucide-react";

const vrCategories = [
  {
    title: "Virtual Field Trips",
    description: "Travel anywhere in the universe without leaving the classroom",
    icon: Globe,
    gradient: "from-cyan-500 to-blue-500",
    items: [
      { emoji: "🚀", label: "Space Station", desc: "Float in zero gravity and explore the ISS" },
      { emoji: "🏜️", label: "Egyptian Pyramids", desc: "Walk inside the Great Pyramid of Giza" },
      { emoji: "🌊", label: "Ocean Exploration", desc: "Dive into the deep sea with marine life" },
      { emoji: "🌴", label: "Rainforest Exploration", desc: "Trek through the Amazon ecosystem" },
    ],
  },
  {
    title: "Virtual Laboratories",
    description: "Conduct experiments in safe, realistic lab environments",
    icon: FlaskConical,
    gradient: "from-emerald-500 to-teal-500",
    items: [
      { emoji: "⚡", label: "Physics Lab", desc: "Experiment with forces, optics, and electricity" },
      { emoji: "⚗️", label: "Chemistry Lab", desc: "Mix compounds and observe reactions safely" },
      { emoji: "🧬", label: "Biology Lab", desc: "Dissect, observe cells, and study anatomy" },
    ],
  },
  {
    title: "Career Exploration",
    description: "Experience real-world careers through immersive simulations",
    icon: Briefcase,
    gradient: "from-amber-500 to-orange-500",
    items: [
      { emoji: "👨‍⚕️", label: "Doctor Simulation", desc: "Perform virtual surgeries and diagnose patients" },
      { emoji: "👷", label: "Engineer Simulation", desc: "Design structures and solve engineering problems" },
      { emoji: "✈️", label: "Pilot Simulation", desc: "Fly aircraft and navigate through skies" },
      { emoji: "🔬", label: "Scientist Simulation", desc: "Conduct research experiments in virtual labs" },
    ],
  },
];

export default function VRExperiences() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section id="vr-experiences" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
            VR Experiences
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Virtual Reality{" "}
            <span className="gradient-text">Immersion</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Step into fully immersive worlds where learning becomes an
            unforgettable adventure.
          </p>
        </motion.div>

        <div className="space-y-12">
          {vrCategories.map((category, catIndex) => {
            const CategoryCard = () => {
              const ref = useRef(null);
              const isInView = useInView(ref, { once: true, margin: "-50px" });

              return (
                <motion.div
                  ref={ref}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: catIndex * 0.15 }}
                  className="glass-card rounded-3xl p-8 md:p-10"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shrink-0`}
                    >
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {category.title}
                      </h3>
                      <p className="text-slate-400 mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {category.items.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:bg-white/[0.06] transition-all duration-300 group text-center"
                      >
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                          {item.emoji}
                        </div>
                        <h4 className="font-semibold text-white text-sm mb-1">
                          {item.label}
                        </h4>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            };

            return <CategoryCard key={category.title} />;
          })}
        </div>
      </div>
    </section>
  );
}
