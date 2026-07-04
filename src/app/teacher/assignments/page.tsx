"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Plus, Trash2, Users } from "lucide-react";
import AssignActivityModal from "@/components/teacher/AssignActivityModal";
import { getLessonsByIds } from "@/data/teacher-lessons";
import {
  deleteAssignment,
  getAssignments,
  getJoinUrl,
  seedDemoData,
  updateAssignment,
} from "@/lib/teacher-store";
import type { TeacherAssignment } from "@/types/teacher";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refresh = () => setAssignments(getAssignments());

  useEffect(() => {
    seedDemoData();
    refresh();
  }, []);

  const copyLink = (a: TeacherAssignment) => {
    navigator.clipboard.writeText(getJoinUrl(a.joinCode));
    setCopiedId(a.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Assignments
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2 mb-1">Assign Activities</h1>
          <p className="text-slate-400 text-sm">
            Create assignments, share join codes with students, and link 3D lessons.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAssignOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Assignment
        </button>
      </div>

      <div className="space-y-4">
        {assignments.map((a) => {
          const lessons = getLessonsByIds(a.lessonIds);
          return (
            <div key={a.id} className="glass-card rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-lg font-bold text-white">{a.title}</h2>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold ${
                        a.status === "active"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          : "bg-slate-500/15 text-slate-400"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">
                    {a.className} · Due {a.dueDate}
                    {a.notes && ` · ${a.notes}`}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {lessons.map((l) => (
                      <span
                        key={l.id}
                        className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300"
                      >
                        {l.title}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-mono font-bold text-emerald-300">
                        {a.joinCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyLink(a)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors"
                    >
                      {copiedId === a.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy student link
                        </>
                      )}
                    </button>
                    {a.status === "active" && (
                      <button
                        type="button"
                        onClick={() => {
                          updateAssignment(a.id, { status: "completed" });
                          refresh();
                        }}
                        className="text-xs text-slate-500 hover:text-slate-300"
                      >
                        Mark completed
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Delete this assignment?")) {
                          deleteAssignment(a.id);
                          refresh();
                        }
                      }}
                      className="inline-flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {assignments.length === 0 && (
          <div className="text-center py-16 glass-card rounded-2xl">
            <p className="text-slate-500 mb-4">No assignments yet.</p>
            <button
              type="button"
              onClick={() => setAssignOpen(true)}
              className="text-indigo-400 hover:underline text-sm"
            >
              Create your first assignment
            </button>
          </div>
        )}
      </div>

      <AssignActivityModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onCreated={() => refresh()}
      />
    </div>
  );
}
