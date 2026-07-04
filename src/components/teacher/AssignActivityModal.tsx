"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { TeacherAssignment, TeacherLesson } from "@/types/teacher";
import { TEACHER_LESSONS } from "@/data/teacher-lessons";
import { createAssignment } from "@/lib/teacher-store";

type AssignActivityModalProps = {
  open: boolean;
  onClose: () => void;
  preselectedLesson?: TeacherLesson | null;
  onCreated?: (assignment: TeacherAssignment) => void;
};

export default function AssignActivityModal({
  open,
  onClose,
  preselectedLesson,
  onCreated,
}: AssignActivityModalProps) {
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("Class 8-A");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      const defaultDue = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      setDueDate(defaultDue);
      setTitle(preselectedLesson ? `${preselectedLesson.title} — Activity` : "");
      setSelectedIds(preselectedLesson ? [preselectedLesson.id] : []);
    }
  }, [open, preselectedLesson]);

  if (!open) return null;

  const toggleLesson = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedIds.length === 0) return;

    const assignment = createAssignment({
      title: title.trim(),
      className: className.trim(),
      lessonIds: selectedIds,
      dueDate,
      notes: notes.trim() || undefined,
    });

    onCreated?.(assignment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 border border-white/15 bg-[#0c1222] shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Assign Activity</h2>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Assignment title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              placeholder="Week 3 — Water Cycle Lab"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Class</label>
              <input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">
              Select lessons ({selectedIds.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-lg border border-slate-700 bg-slate-800/50 p-2">
              {TEACHER_LESSONS.filter((l) => l.has3D).map((lesson) => (
                <label
                  key={lesson.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm ${
                    selectedIds.includes(lesson.id) ? "bg-indigo-500/15" : "hover:bg-white/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(lesson.id)}
                    onChange={() => toggleLesson(lesson.id)}
                    className="rounded border-white/20"
                  />
                  <span className="truncate">{lesson.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
              placeholder="Complete before Friday's quiz…"
            />
          </div>

          <button
            type="submit"
            disabled={selectedIds.length === 0}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-colors"
          >
            Create Assignment & Generate Join Code
          </button>
        </form>
      </div>
    </div>
  );
}
