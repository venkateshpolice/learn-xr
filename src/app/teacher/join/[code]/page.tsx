"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ArrowLeft, Box, CheckCircle2, Play } from "lucide-react";
import { getLessonsByIds } from "@/data/teacher-lessons";
import {
  getAssignmentByCode,
  recordEngagementComplete,
  recordEngagementStart,
} from "@/lib/teacher-store";
import type { EngagementEvent, TeacherAssignment, TeacherLesson } from "@/types/teacher";

export default function StudentJoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const [assignment, setAssignment] = useState<TeacherAssignment | null>(null);
  const [lessons, setLessons] = useState<TeacherLesson[]>([]);
  const [studentName, setStudentName] = useState("");
  const [joined, setJoined] = useState(false);
  const [activeEvents, setActiveEvents] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    const a = getAssignmentByCode(code);
    if (a) {
      setAssignment(a);
      setLessons(getLessonsByIds(a.lessonIds));
    }
  }, [code]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) setJoined(true);
  };

  const startLesson = (lessonId: string, link: string) => {
    if (!assignment || !studentName.trim()) return;
    const event = recordEngagementStart(assignment.id, studentName, lessonId);
    setActiveEvents((prev) => ({ ...prev, [lessonId]: event.id }));
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const markComplete = (lessonId: string) => {
    const eventId = activeEvents[lessonId];
    if (!eventId) return;
    recordEngagementComplete(eventId, 75 + Math.floor(Math.random() * 25));
    setCompleted((prev) => new Set(prev).add(lessonId));
  };

  if (!assignment) {
    return (
      <div className="min-h-screen bg-[#060a14] text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Invalid join code</h1>
          <p className="text-slate-400 text-sm mb-6">
            The code <span className="font-mono text-white">{code}</span> doesn&apos;t match
            any active assignment. Ask your teacher for the correct link.
          </p>
          <Link href="/" className="text-indigo-400 hover:underline text-sm">
            ← Back to Nexscape
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-10 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Nexscape
        </Link>

        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Class Activity
          </span>
          <h1 className="text-xl sm:text-2xl font-bold mt-3 mb-1">{assignment.title}</h1>
          <p className="text-sm text-slate-500">
            {assignment.className} · Due {assignment.dueDate}
          </p>
          {assignment.notes && (
            <p className="text-sm text-slate-400 mt-3 pt-3 border-t border-white/10">
              {assignment.notes}
            </p>
          )}
        </div>

        {!joined ? (
          <form onSubmit={handleJoin} className="glass-card rounded-2xl p-6 space-y-4">
            <label className="text-sm font-medium">Enter your name to join</label>
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
              placeholder="Your full name"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500/50"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors"
            >
              Join Activity
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 mb-4">
              Hi <span className="text-white font-medium">{studentName}</span> — complete
              each lesson below. Open the 3D lab, then mark it done when finished.
            </p>

            {lessons.map((lesson) => {
              const isDone = completed.has(lesson.id);
              const hasStarted = !!activeEvents[lesson.id];

              return (
                <div
                  key={lesson.id}
                  className={`glass-card rounded-xl p-4 ${
                    isDone ? "border-emerald-500/30 bg-emerald-500/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{lesson.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{lesson.description}</p>
                    </div>
                    {isDone && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!isDone && (
                      <button
                        type="button"
                        onClick={() => startLesson(lesson.id, lesson.link)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold"
                      >
                        <Box className="w-3.5 h-3.5" />
                        {hasStarted ? "Re-open 3D" : "Start 3D Lab"}
                      </button>
                    )}
                    {hasStarted && !isDone && (
                      <button
                        type="button"
                        onClick={() => markComplete(lesson.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Mark complete
                      </button>
                    )}
                    {isDone && (
                      <span className="text-xs text-emerald-400 font-medium py-2">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
