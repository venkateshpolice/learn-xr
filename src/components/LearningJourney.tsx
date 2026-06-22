"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { nurseryCategories, getCategoryHref } from "@/data/nursery-categories";

interface GradeData {
  id: string;
  label: string;
  age: string;
  color: string;
  subjects: {
    name: string;
    emoji: string;
    topics: string[];
  }[];
  highlight?: string;
}

const grades: GradeData[] = [
  {
    id: "nursery",
    label: "Nursery",
    age: "3–5 Years",
    color: "from-pink-500 to-rose-400",
    highlight: "Scan a flashcard → A 3D Lion appears and roars!",
    subjects: [
      { name: "AR Modules", emoji: "📱", topics: ["Alphabet Recognition", "Numbers & Counting", "Shapes", "Colors", "Fruits & Vegetables", "Animals & Birds", "Body Parts", "Rhymes in AR", "Storytelling"] },
    ],
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
      { name: "Social Studies", emoji: "🏘️", topics: ["Community Helpers", "Transport Systems"] },
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
      { name: "History", emoji: "🏛️", topics: ["Ancient Civilizations"] },
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
      { name: "Geography", emoji: "🌍", topics: ["Volcanoes", "Rivers", "Climate"] },
      { name: "History", emoji: "🏛️", topics: ["World History", "Indian History"] },
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
      { name: "Mathematics", emoji: "📐", topics: ["Trigonometry", "Coordinate Geometry"] },
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
      { name: "Biology", emoji: "🧬", topics: ["Human Anatomy", "DNA", "Biotechnology"] },
      { name: "Mathematics", emoji: "📐", topics: ["Calculus", "Probability", "3D Geometry"] },
    ],
  },
];

export default function LearningJourney() {
  const [activeGrade, setActiveGrade] = useState("nursery");
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  const activeData = grades.find((g) => g.id === activeGrade)!;

  return (
    <section id="learning-journey" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
            Learning Journey
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Grade-Wise{" "}
            <span className="gradient-text">Curriculum</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A carefully crafted immersive learning path from nursery through
            high school, aligned with standard curricula.
          </p>
        </motion.div>

        {/* Grade Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {grades.map((grade) => (
            <button
              key={grade.id}
              onClick={() => setActiveGrade(grade.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeGrade === grade.id
                  ? "bg-gradient-to-r " + grade.color + " text-white shadow-lg scale-105"
                  : "glass-card text-slate-300 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {grade.label}
            </button>
          ))}
        </div>

        {/* Active Grade Content */}
        <motion.div
          key={activeGrade}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-3xl p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <span
                  className={`inline-block w-3 h-3 rounded-full bg-gradient-to-r ${activeData.color}`}
                />
                {activeData.label}
              </h3>
              <p className="text-slate-400 mt-1">{activeData.age}</p>
            </div>
            {activeData.highlight && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-pink-300">{activeData.highlight}</span>
              </div>
            )}
          </div>

          {activeGrade === "nursery" ? (
            /* Nursery Category Cards */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {nurseryCategories.map((category) => (
                <Link
                  key={category.id}
                  href={getCategoryHref(category)}
                  className="group rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:bg-white/[0.06] transition-all duration-300 hover:scale-[1.03] hover:border-white/20 text-center"
                >
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <span className="text-3xl">{category.emoji}</span>
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-1">
                    {category.label}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {category.items.length} items
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            /* Other Grades - Subject Cards */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeData.subjects.map((subject) => (
                <div
                  key={subject.name}
                  className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{subject.emoji}</span>
                    <h4 className="font-semibold text-white">{subject.name}</h4>
                  </div>
                  <ul className="space-y-2">
                    {subject.topics.map((topic) => (
                      <li
                        key={topic}
                        className="flex items-center gap-2 text-sm text-slate-400"
                      >
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
    </section>
  );
}
