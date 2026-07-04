"use client";

import Link from "next/link";
import {
  Box,
  Clock,
  ExternalLink,
  MonitorPlay,
  Plus,
  Presentation,
  Search,
} from "lucide-react";
import type { TeacherLesson } from "@/types/teacher";
import { SUBJECT_LABELS } from "@/data/teacher-lessons";

type LessonCardProps = {
  lesson: TeacherLesson;
  onAssign?: (lesson: TeacherLesson) => void;
  compact?: boolean;
};

export default function LessonCard({ lesson, onAssign, compact }: LessonCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 hover:bg-white/[0.07] hover:border-indigo-500/20 transition-all h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
            {SUBJECT_LABELS[lesson.subject]}
          </span>
          <h3 className="text-base font-bold text-white mt-1 leading-snug">{lesson.title}</h3>
        </div>
        <div className="flex gap-1 shrink-0">
          {lesson.has3D && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              3D
            </span>
          )}
          {lesson.hasXR && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/20">
              XR
            </span>
          )}
        </div>
      </div>

      {!compact && (
        <p className="text-sm text-slate-400 leading-relaxed mb-4 flex-1 line-clamp-2">
          {lesson.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
          {lesson.grades}
        </span>
        <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {lesson.durationMinutes} min
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mt-auto">
        <Link
          href={lesson.link}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold transition-colors"
        >
          <Box className="w-3.5 h-3.5" />
          Launch 3D
        </Link>
        <Link
          href={`/teacher/present/${lesson.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold transition-colors"
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          Present
        </Link>
        {onAssign && (
          <button
            type="button"
            onClick={() => onAssign(lesson)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Assign
          </button>
        )}
      </div>
    </div>
  );
}

export function LessonSearchBar({
  query,
  onQueryChange,
  subject,
  onSubjectChange,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  subject: string;
  onSubjectChange: (s: string) => void;
}) {
  const subjects = ["all", "physics", "chemistry", "biology", "math", "trigonometry", "nursery"] as const;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search lessons by title, topic, or grade…"
          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSubjectChange(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              subject === s
                ? "bg-indigo-500/25 text-indigo-200 border border-indigo-500/40"
                : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            {s === "all" ? "All Subjects" : SUBJECT_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  accent,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group glass-card rounded-2xl p-5 hover:bg-white/[0.07] transition-all block"
    >
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-bold text-white mb-1 flex items-center gap-2">
        {title}
        <ExternalLink className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </h3>
      <p className="text-sm text-slate-400">{description}</p>
    </Link>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <Icon className="w-4 h-4 text-indigo-400" />
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

export { Presentation };
