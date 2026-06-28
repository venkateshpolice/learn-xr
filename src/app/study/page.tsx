"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { StudyShell } from "@/components/study/StudyShell";
import { NCERT_CLASSES } from "@/data/ncert-curriculum";

export default function StudyPage() {
  return (
    <StudyShell
      backHref="/"
      backLabel="Back to Home"
      title="NCERT Study Materials"
      subtitle="Free textbooks, syllabus, exemplar problems, and MCQ practice for Class 1 to 12 — aligned with CBSE curriculum."
      badge="Official NCERT Resources"
    >
      <div className="glass-card rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
          <GraduationCap className="w-6 h-6 text-indigo-300" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-300">
            Select your class → choose a subject → view or download NCERT textbooks, access related
            materials, and practice with MCQ quizzes.
          </p>
        </div>
        <a
          href="https://ncert.nic.in/textbook.php"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-300 hover:text-indigo-200 whitespace-nowrap"
        >
          ncert.nic.in ↗
        </a>
      </div>

      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        Select Your Class
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {NCERT_CLASSES.map((cls, i) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link href={`/study/class/${cls.id}`} className="block group">
              <div className="glass-card rounded-2xl p-4 sm:p-5 text-center hover:bg-white/[0.08] transition-all hover:scale-[1.03] border border-white/10 h-full">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${cls.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <span className="text-lg sm:text-xl font-bold">{cls.grade}</span>
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base">{cls.label}</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1">{cls.ageRange}</p>
                <p className="text-[10px] text-indigo-300/80 mt-2 flex items-center justify-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {cls.subjects.length} subjects
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </StudyShell>
  );
}
