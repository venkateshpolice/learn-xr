"use client";

import { useParams } from "next/navigation";
import { StudyShell } from "@/components/study/StudyShell";
import { QuizPanel } from "@/components/study/QuizPanel";
import { getClassById, getSubjectById } from "@/data/ncert-curriculum";
import { getMcqForSubject } from "@/data/ncert-mcq";

export default function McqPage() {
  const params = useParams();
  const classId = params.classId as string;
  const subjectId = params.subjectId as string;

  const cls = getClassById(classId);
  const subject = getSubjectById(classId, subjectId);

  if (!cls || !subject) {
    return (
      <StudyShell backHref="/study" backLabel="All Classes" title="Not Found">
        <p className="text-slate-400">Subject not found.</p>
      </StudyShell>
    );
  }

  const questions = getMcqForSubject(classId, subjectId);

  return (
    <StudyShell
      backHref={`/study/class/${classId}/${subjectId}`}
      backLabel={subject.name}
      title={`${subject.name} — MCQ Quiz`}
      subtitle={`Practice questions for ${cls.label} ${subject.name}. Based on NCERT curriculum topics.`}
      badge={`${questions.length} Questions`}
    >
      <QuizPanel questions={questions} title={`${cls.label} · ${subject.name}`} />
    </StudyShell>
  );
}
