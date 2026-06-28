"use client";

import { useParams } from "next/navigation";
import { StudyShell } from "@/components/study/StudyShell";
import { TextbookViewer } from "@/components/study/TextbookViewer";
import { getClassById, getSubjectById, getTextbookById } from "@/data/ncert-curriculum";

export default function TextbookPage() {
  const params = useParams();
  const classId = params.classId as string;
  const subjectId = params.subjectId as string;
  const bookId = params.bookId as string;

  const cls = getClassById(classId);
  const subject = getSubjectById(classId, subjectId);
  const textbook = getTextbookById(classId, subjectId, bookId);

  if (!cls || !subject || !textbook) {
    return (
      <StudyShell backHref="/study" backLabel="All Classes" title="Textbook Not Found">
        <p className="text-slate-400">This textbook could not be found.</p>
      </StudyShell>
    );
  }

  return (
    <StudyShell
      backHref={`/study/class/${classId}/${subjectId}`}
      backLabel={subject.name}
      title={textbook.title}
      badge={cls.label}
    >
      <TextbookViewer textbook={textbook} classLabel={cls.label} subjectName={subject.name} />
    </StudyShell>
  );
}
