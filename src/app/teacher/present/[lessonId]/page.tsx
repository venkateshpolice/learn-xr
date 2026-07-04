"use client";

import Link from "next/link";
import { use } from "react";
import PresentBoard from "@/components/teacher/PresentBoard";
import { getLessonById } from "@/data/teacher-lessons";

export default function TeacherPresentLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = use(params);
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Lesson not found</h1>
          <Link href="/teacher/present" className="text-indigo-400 hover:underline text-sm">
            ← Back to presenter
          </Link>
        </div>
      </div>
    );
  }

  return <PresentBoard lesson={lesson} />;
}
