"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MonitorPlay } from "lucide-react";
import { LessonSearchBar } from "@/components/teacher/LessonCard";
import { searchLessons, SUBJECT_LABELS } from "@/data/teacher-lessons";
import type { LessonSubject } from "@/types/teacher";

export default function TeacherPresentPickerPage() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");

  const results = useMemo(
    () =>
      searchLessons(
        query,
        subject === "all" ? undefined : (subject as LessonSubject),
      ).filter((l) => l.has3D),
    [query, subject],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          Smart Board
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2 mb-2">Present on Smart Board</h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
          Choose a lesson to enter fullscreen presenter mode — large text, step-by-step
          talking points, and one-click 3D launch for your classroom display.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-5 mb-8 flex items-start gap-3">
        <MonitorPlay className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-400">
          <strong className="text-white">Tip:</strong> Connect your laptop to the smart
          board, open presenter mode, press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">F</kbd> for
          fullscreen, then launch the 3D model for the whole class.
        </div>
      </div>

      <div className="mb-8">
        <LessonSearchBar
          query={query}
          onQueryChange={setQuery}
          subject={subject}
          onSubjectChange={setSubject}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/teacher/present/${lesson.id}`}
            className="glass-card rounded-xl p-4 hover:bg-white/[0.07] hover:border-violet-500/30 transition-all group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MonitorPlay className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-violet-400 uppercase tracking-wide">
                {SUBJECT_LABELS[lesson.subject]}
              </p>
              <p className="font-semibold text-white truncate">{lesson.title}</p>
              <p className="text-xs text-slate-500">{lesson.grades}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
