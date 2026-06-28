"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, BrainCircuit, Download, ExternalLink, FileText } from "lucide-react";
import { StudyShell } from "@/components/study/StudyShell";
import { getClassById, getSubjectById, MATERIAL_TYPE_LABELS } from "@/data/ncert-curriculum";
import { getMcqCount } from "@/data/ncert-mcq";

export default function SubjectPage() {
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

  const mcqCount = getMcqCount(classId, subjectId);

  return (
    <StudyShell
      backHref={`/study/class/${classId}`}
      backLabel={cls.label}
      title={subject.name}
      subtitle={subject.description}
      badge={`${cls.label} · NCERT`}
    >
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Link
          href={`/study/class/${classId}/${subjectId}/mcq`}
          className="glass-card rounded-2xl p-6 hover:bg-white/[0.08] transition-all border border-emerald-500/20 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg">MCQ Practice</h3>
              <p className="text-sm text-slate-400">{mcqCount} questions · Test your knowledge</p>
            </div>
          </div>
        </Link>
        <div className="glass-card rounded-2xl p-6 border border-indigo-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Textbooks</h3>
              <p className="text-sm text-slate-400">
                {subject.textbooks.length} NCERT book{subject.textbooks.length > 1 ? "s" : ""} · View or download PDFs
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          NCERT Textbooks
        </h2>
        <div className="space-y-3">
          {subject.textbooks.map((book) => (
            <div
              key={book.id}
              className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-semibold text-white">{book.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {book.language} · {book.chapters.length} chapters · Code: {book.bookCode}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/study/class/${classId}/${subjectId}/textbook/${book.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold"
                >
                  <BookOpen className="w-4 h-4" />
                  Chapters & PDFs
                </Link>
                <a
                  href={book.fullBookZip}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Related Study Materials
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {subject.materials.map((mat) => (
            <a
              key={mat.id}
              href={mat.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-xl p-4 hover:bg-white/[0.08] transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300">
                      {MATERIAL_TYPE_LABELS[mat.type]}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-semibold text-sm text-white">{mat.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{mat.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </StudyShell>
  );
}
