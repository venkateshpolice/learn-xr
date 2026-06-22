"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ScanLine,
  Smartphone,
  BrainCircuit,
  BookOpenCheck,
  CreditCard,
  FileText,
  Globe,
  Bone,
  Landmark,
  Mic,
  MessageCircle,
  Lightbulb,
} from "lucide-react";

const arCategories = [
  {
    title: "Marker-Based AR",
    description: "Point your camera at printed materials to unlock 3D content",
    icon: ScanLine,
    gradient: "from-indigo-500 to-blue-500",
    items: [
      { icon: BookOpenCheck, label: "Textbook Scan", desc: "Scan textbook pages to see 3D models pop up" },
      { icon: CreditCard, label: "Flashcard Scan", desc: "Interactive flashcards with 3D animations" },
      { icon: FileText, label: "Worksheet Scan", desc: "Worksheets come alive with AR overlays" },
    ],
  },
  {
    title: "Markerless AR",
    description: "Place virtual objects anywhere in your real environment",
    icon: Smartphone,
    gradient: "from-cyan-500 to-teal-500",
    items: [
      { icon: Globe, label: "Solar System in Room", desc: "Place planets orbiting in your bedroom" },
      { icon: Bone, label: "Human Body in Room", desc: "Life-sized anatomy model in your space" },
      { icon: Landmark, label: "Historical Monuments", desc: "Walk around ancient structures at scale" },
    ],
  },
  {
    title: "AI-Powered AR",
    description: "Smart AI assistant that answers questions in real-time",
    icon: BrainCircuit,
    gradient: "from-purple-500 to-pink-500",
    items: [
      { icon: MessageCircle, label: "AI Tutor", desc: "Personal AI tutor overlaid on study material" },
      { icon: Mic, label: "Voice Questions", desc: "Ask questions verbally, get visual answers" },
      { icon: Lightbulb, label: "Smart Explanations", desc: "Context-aware explanations with 3D visuals" },
    ],
  },
];

export default function ARExperiences() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section id="ar-experiences" className="py-32 px-6 relative">
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
            AR Experiences
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Augmented Reality{" "}
            <span className="gradient-text">Learning Modes</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Three powerful ways to bring learning to life using your phone or
            tablet camera.
          </p>
        </motion.div>

        <div className="space-y-12">
          {arCategories.map((category, catIndex) => {
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

                  <div className="grid sm:grid-cols-3 gap-4">
                    {category.items.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:bg-white/[0.06] transition-all duration-300 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <item.icon className="w-5 h-5 text-indigo-300" />
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
