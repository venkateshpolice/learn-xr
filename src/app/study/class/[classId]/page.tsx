"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { BookOpen, BrainCircuit } from "lucide-react";
import { StudyShell } from "@/components/study/StudyShell";
import { getClassById } from "@/data/ncert-curriculum";
import { getMcqCount } from "@/data/ncert-mcq";

export default function ClassSubjectsPage() {
  const params = useParams();
  const classId = params.classId as string;
  const cls = getClassById(classId);

  if (!cls) {
    return (
      <StudyShell backHref="/study" backLabel="All Classes" title="Class Not Found">
        <p className="text-slate-400">This class does not exist.</p>
      </StudyShell>
    );
  }

  const streams = [...new Set(cls.subjects.map((s) => s.stream ?? "Core"))];

  return (
    <StudyShell
      backHref="/study"
      backLabel="All Classes"
      title={cls.label}
      subtitle={cls.description}
      badge={`${cls.ageRange} · ${cls.subjects.length} subjects`}
    >
      {streams.length > 1 && (
        <p className="text-xs text-slate-500 mb-6">
          Subjects grouped by stream: {streams.join(", ")}
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cls.subjects.map((subject, i) => {
          const mcqCount = getMcqCount(classId, subject.id);
          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/study/class/${classId}/${subject.id}`} className="block group h-full">
                <div className="glass-card rounded-2xl p-5 h-full hover:bg-white/[0.08] transition-all hover:scale-[1.02] border border-white/10">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      {subject.emoji}
                    </div>
                    {subject.stream && subject.stream !== "Core" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-400">
                        {subject.stream}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white mb-1">{subject.name}</h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{subject.description}</p>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <span className="px-2 py-1 rounded-full bg-indigo-500/15 text-indigo-300 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {subject.textbooks.length} textbook{subject.textbooks.length > 1 ? "s" : ""}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center gap-1">
                      <BrainCircuit className="w-3 h-3" />
                      {mcqCount} MCQs
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </StudyShell>
  );
}
