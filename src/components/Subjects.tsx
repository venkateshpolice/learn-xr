"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const subjects = [
  {
    name: "Astronomy",
    emoji: "🌌",
    description: "Explore the cosmos up close",
    topics: ["Solar System", "Black Holes", "Star Formation", "Space Travel"],
    gradient: "from-blue-600/20 to-indigo-600/20",
    border: "border-blue-500/30",
  },
  {
    name: "History",
    emoji: "🏛️",
    description: "Walk through time periods",
    topics: [
      "Ancient Egypt",
      "Roman Empire",
      "Medieval Era",
      "World Wars",
    ],
    gradient: "from-amber-600/20 to-orange-600/20",
    border: "border-amber-500/30",
  },
  {
    name: "Biology",
    emoji: "🧬",
    description: "Dive into living systems",
    topics: ["Cell Structure", "Human Anatomy", "Ecosystems", "Genetics"],
    gradient: "from-emerald-600/20 to-green-600/20",
    border: "border-emerald-500/30",
  },
  {
    name: "Chemistry",
    emoji: "⚗️",
    description: "Experiment without limits",
    topics: [
      "Molecular Bonds",
      "Reactions",
      "Periodic Table",
      "Organic Chemistry",
    ],
    gradient: "from-purple-600/20 to-violet-600/20",
    border: "border-purple-500/30",
  },
  {
    name: "Geography",
    emoji: "🌍",
    description: "Travel the world virtually",
    topics: ["Plate Tectonics", "Climate Zones", "Ocean Currents", "Volcanoes"],
    gradient: "from-cyan-600/20 to-teal-600/20",
    border: "border-cyan-500/30",
  },
  {
    name: "Mathematics",
    emoji: "📐",
    description: "See math come alive",
    topics: ["3D Geometry", "Calculus", "Fractals", "Statistics"],
    gradient: "from-rose-600/20 to-pink-600/20",
    border: "border-rose-500/30",
  },
];

export default function Subjects() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section id="subjects" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
            Subjects
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Every Subject,{" "}
            <span className="gradient-text">Reimagined</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            From the depths of the ocean to the surface of Mars, every lesson
            becomes an adventure.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => {
            const SubjectCard = () => {
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
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`glass-card rounded-2xl p-8 hover:bg-white/[0.08] transition-all duration-300 hover:scale-[1.02] ${subject.border}`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center text-2xl`}
                    >
                      {subject.emoji}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{subject.name}</h3>
                      <p className="text-sm text-slate-400">
                        {subject.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {subject.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-3 py-1 text-xs rounded-full bg-white/5 text-slate-300 border border-white/10"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            };

            return <SubjectCard key={subject.name} />;
          })}
        </div>
      </div>
    </section>
  );
}
