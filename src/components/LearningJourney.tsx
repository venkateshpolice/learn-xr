"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Sparkles } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { siteImages } from "@/data/site-images";
import { nurseryCategories, getCategoryHref } from "@/data/nursery-categories";

interface GradeData {
  id: string;
  label: string;
  age: string;
  color: string;
  subjects: { name: string; emoji: string; topics: string[] }[];
  highlight?: string;
}

const grades: GradeData[] = [
  {
    id: "nursery",
    label: "Nursery",
    age: "3–5 Years",
    color: "from-pink-500 to-rose-400",
    highlight: "Scan a flashcard → A 3D Lion appears and roars!",
    subjects: [{ name: "AR Modules", emoji: "📱", topics: ["Alphabet Recognition", "Numbers & Counting", "Shapes", "Colors", "Animals & Birds"] }],
  },
  {
    id: "grade-1-3",
    label: "Grade 1–3",
    age: "6–8 Years",
    color: "from-amber-500 to-orange-400",
    subjects: [
      { name: "Science", emoji: "🔬", topics: ["Plants", "Animal Habitats", "Human Body Basics", "Weather"] },
      { name: "Mathematics", emoji: "🧮", topics: ["Addition", "Subtraction", "Multiplication", "Geometry Basics"] },
      { name: "English", emoji: "📖", topics: ["Vocabulary", "Pronunciation", "Interactive Stories"] },
    ],
  },
  {
    id: "grade-4-5",
    label: "Grade 4–5",
    age: "9–10 Years",
    color: "from-emerald-500 to-teal-400",
    subjects: [
      { name: "Science", emoji: "🔬", topics: ["Solar System", "Food Chain", "Water Cycle", "Earth Structure"] },
      { name: "Mathematics", emoji: "🧮", topics: ["Fractions", "Decimals", "Area & Perimeter"] },
      { name: "Geography", emoji: "🌍", topics: ["Continents", "Oceans", "Mountains"] },
    ],
  },
  {
    id: "grade-6-8",
    label: "Grade 6–8",
    age: "11–13 Years",
    color: "from-cyan-500 to-blue-400",
    subjects: [
      { name: "Science", emoji: "🔬", topics: ["Human Anatomy", "Ecosystems", "States of Matter", "Electricity"] },
      { name: "Mathematics", emoji: "🧮", topics: ["Algebra", "Geometry", "Statistics"] },
      { name: "Computer Science", emoji: "💻", topics: ["Coding Basics", "Logic Building"] },
    ],
  },
  {
    id: "grade-9-10",
    label: "Grade 9–10",
    age: "14–15 Years",
    color: "from-indigo-500 to-violet-400",
    subjects: [
      { name: "Physics", emoji: "⚡", topics: ["Force", "Motion", "Electricity", "Optics"] },
      { name: "Chemistry", emoji: "⚗️", topics: ["Molecules", "Atomic Structure", "Chemical Reactions"] },
      { name: "Biology", emoji: "🧬", topics: ["Cell Structure", "Human Systems", "Genetics"] },
    ],
  },
  {
    id: "grade-11-12",
    label: "Grade 11–12",
    age: "16–18 Years",
    color: "from-purple-500 to-fuchsia-400",
    subjects: [
      { name: "Physics VR Labs", emoji: "⚡", topics: ["Electromagnetic Fields", "Wave Motion", "Optics Experiments"] },
      { name: "Chemistry VR Labs", emoji: "⚗️", topics: ["Chemical Bonding", "Organic Chemistry", "Virtual Lab Experiments"] },
      { name: "Mathematics", emoji: "📐", topics: ["Calculus", "Probability", "3D Geometry"] },
    ],
  },
];

export default function LearningJourney() {
  const [activeGrade, setActiveGrade] = useState("nursery");
  const panelRef = useRef(null);
  const panelInView = useInView(panelRef, { once: true, margin: "-60px" });
  const activeData = grades.find((g) => g.id === activeGrade)!;

  return (
    <section id="learning-journey" className="relative py-16 sm:py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Learning Journey"
          eyebrowColor="text-amber-400"
          title={<>Grade-Wise <span className="gradient-text">Curriculum</span></>}
          description="A carefully crafted immersive learning path from nursery through high school, aligned with standard curricula."
        />

        <div className="grid lg:grid-cols-[1fr_minmax(0,0.9fr)] gap-8 lg:gap-10 items-start">
          <div className="order-2 lg:order-1">
            <div className="flex flex-wrap gap-2 mb-6">
              {grades.map((grade) => (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => setActiveGrade(grade.id)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 min-h-[40px] ${
                    activeGrade === grade.id
                      ? `bg-gradient-to-r ${grade.color} text-white shadow-lg`
                      : "glass-card text-slate-300 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  {grade.label}
                </button>
              ))}
            </div>

            <motion.div
              key={activeGrade}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${activeData.color}`} />
                    {activeData.label}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">{activeData.age}</p>
                </div>
                {activeData.highlight && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-500/10 border border-pink-500/20 max-w-full">
                    <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                    <span className="text-xs sm:text-sm text-pink-300">{activeData.highlight}</span>
                  </div>
                )}
              </div>

              {activeGrade === "nursery" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {nurseryCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={getCategoryHref(category)}
                      className="group rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 sm:p-4 hover:bg-white/[0.06] transition-all text-center"
                    >
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform`}>
                        <span className="text-2xl">{category.emoji}</span>
                      </div>
                      <h4 className="font-semibold text-white text-xs sm:text-sm">{category.label}</h4>
                      <p className="text-[10px] text-slate-500">{category.items.length} items</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  {activeData.subjects.map((subject) => (
                    <div key={subject.name} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{subject.emoji}</span>
                        <h4 className="font-semibold text-white text-sm sm:text-base">{subject.name}</h4>
                      </div>
                      <ul className="space-y-1.5">
                        {subject.topics.map((topic) => (
                          <li key={topic} className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                            <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 24 }}
            animate={panelInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="absolute -inset-0.5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500/20 via-pink-500/15 to-violet-500/20 blur-sm" />
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10">
              <Image
                src={siteImages.audience3dLearning}
                alt="Interactive 3D learning for nursery and lower grades"
                width={1200}
                height={900}
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="w-full h-auto object-cover aspect-[4/3]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
