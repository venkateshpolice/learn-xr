"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  ChevronLeft,
  ChevronRight,
  Copy,
  Maximize,
  Minimize,
  Users,
} from "lucide-react";
import type { TeacherLesson } from "@/types/teacher";
import { SUBJECT_LABELS } from "@/data/teacher-lessons";
import { getJoinUrl } from "@/lib/teacher-store";

type PresentBoardProps = {
  lesson: TeacherLesson;
  joinCode?: string;
};

export default function PresentBoard({ lesson, joinCode }: PresentBoardProps) {
  const [step, setStep] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const notes = [
    `Lesson: ${lesson.title}`,
    ...lesson.presenterNotes,
    "Open the 3D model for the class to explore together.",
    "Students can join on their devices using the class code shown.",
  ];

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setStep((s) => Math.min(s + 1, notes.length - 1));
      }
      if (e.key === "ArrowLeft") {
        setStep((s) => Math.max(s - 1, 0));
      }
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [notes.length, toggleFullscreen]);

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const copyJoinLink = () => {
    if (!joinCode) return;
    navigator.clipboard.writeText(getJoinUrl(joinCode));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top bar — hidden in presentation focus */}
      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-white/10 bg-slate-950/90 backdrop-blur-md shrink-0">
        <Link
          href="/teacher/present"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Exit presenter</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {joinCode && (
            <button
              type="button"
              onClick={copyJoinLink}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              JOIN: {joinCode}
              <Copy className="w-3 h-3 text-slate-500" />
              {copied && <span className="text-emerald-400">Copied!</span>}
            </button>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
            title="Fullscreen (F)"
          >
            {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main presentation area — optimized for smart boards */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16 text-center">
          <p className="text-sm sm:text-base font-semibold uppercase tracking-[0.2em] text-indigo-400 mb-4">
            {SUBJECT_LABELS[lesson.subject]} · {lesson.grades}
          </p>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 max-w-4xl leading-[1.1]">
            {step === 0 ? lesson.title : notes[step]}
          </h1>

          {step === 0 && (
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-400 max-w-2xl leading-relaxed mb-10">
              {lesson.description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href={lesson.link}
              target="_blank"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-lg sm:text-xl font-bold shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Box className="w-6 h-6" />
              Launch 3D Model
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <p className="text-xs text-slate-600 mt-8">
            ← → arrow keys to navigate · F for fullscreen
          </p>
        </div>

        {/* Side panel — talking points */}
        <aside className="lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-slate-900/50 p-4 sm:p-6 overflow-y-auto shrink-0">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Presenter Notes
          </h2>
          <ol className="space-y-2">
            {notes.map((note, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                    step === i
                      ? "bg-indigo-500/20 border border-indigo-500/40 text-white"
                      : "text-slate-400 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span className="text-[10px] text-indigo-400 font-mono mr-2">{i + 1}</span>
                  {note}
                </button>
              </li>
            ))}
          </ol>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="p-2 rounded-lg bg-white/5 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs text-slate-500">
              {step + 1} / {notes.length}
            </span>
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(notes.length - 1, s + 1))}
              disabled={step === notes.length - 1}
              className="p-2 rounded-lg bg-white/5 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
