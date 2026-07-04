"use client";

import { useMemo, useState } from "react";
import AssignActivityModal from "@/components/teacher/AssignActivityModal";
import LessonCard, { LessonSearchBar } from "@/components/teacher/LessonCard";
import { searchLessons } from "@/data/teacher-lessons";
import type { LessonSubject, TeacherAssignment, TeacherLesson } from "@/types/teacher";

export default function TeacherLessonsPage() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string>("all");
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<TeacherLesson | null>(null);

  const results = useMemo(
    () =>
      searchLessons(
        query,
        subject === "all" ? undefined : (subject as LessonSubject),
      ),
    [query, subject],
  );

  const handleAssign = (lesson: TeacherLesson) => {
    setSelectedLesson(lesson);
    setAssignOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Lesson Library
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2 mb-2">Search & Launch Lessons</h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
          Find interactive 3D labs, launch them instantly, present on a smart board,
          or assign to your class.
        </p>
      </div>

      <div className="mb-8">
        <LessonSearchBar
          query={query}
          onQueryChange={setQuery}
          subject={subject}
          onSubjectChange={setSubject}
        />
      </div>

      <p className="text-xs text-slate-500 mb-4">
        {results.length} lesson{results.length !== 1 ? "s" : ""} found
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} onAssign={handleAssign} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          No lessons match your search. Try a different keyword or subject filter.
        </div>
      )}

      <AssignActivityModal
        open={assignOpen}
        onClose={() => {
          setAssignOpen(false);
          setSelectedLesson(null);
        }}
        preselectedLesson={selectedLesson}
        onCreated={(_a: TeacherAssignment) => {
          setAssignOpen(false);
          setSelectedLesson(null);
        }}
      />
    </div>
  );
}
