"use client";

import { useState } from "react";
import { Download, ExternalLink, BookOpen, FileText, Monitor } from "lucide-react";
import type { NcertTextbook } from "@/data/ncert-curriculum";

interface TextbookViewerProps {
  textbook: NcertTextbook;
  classLabel: string;
  subjectName: string;
  initialChapter?: number;
}

export function TextbookViewer({
  textbook,
  classLabel,
  subjectName,
  initialChapter = 1,
}: TextbookViewerProps) {
  const [activeChapter, setActiveChapter] = useState(initialChapter);
  const chapter =
    textbook.chapters.find((c) => c.number === activeChapter) ?? textbook.chapters[0];

  const openChapter = () => {
    window.open(chapter.pdfUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-indigo-300 font-medium mb-1">
            {classLabel} · {subjectName}
          </p>
          <h2 className="text-xl font-bold">{textbook.title}</h2>
          <p className="text-sm text-slate-400 mt-1">
            {textbook.language} · {textbook.chapters.length} chapters · NCERT {textbook.bookCode}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={textbook.fullBookZip}
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Full Book
          </a>
          <a
            href={textbook.ncertPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            NCERT Portal
          </a>
        </div>
      </div>

      <p className="text-xs text-slate-500 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3">
        NCERT blocks embedded previews on other sites. Use <strong className="text-slate-400">View Online</strong> to
        open the official PDF in a new browser tab, or download chapters to read offline.
      </p>

      <div className="grid lg:grid-cols-[220px_1fr] gap-4">
        <div className="glass-card rounded-2xl p-4 max-h-[60vh] overflow-y-auto">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" />
            Chapters
          </h3>
          <ul className="space-y-1">
            {textbook.chapters.map((ch) => (
              <li key={ch.id}>
                <button
                  type="button"
                  onClick={() => setActiveChapter(ch.number)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    ch.number === chapter.number
                      ? "bg-indigo-500/20 text-indigo-200"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {ch.number}. {ch.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden" key={chapter.number}>
          <div className="px-4 py-3 border-b border-white/10">
            <span className="text-sm font-medium">
              Chapter {chapter.number}: {chapter.title}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center px-6 py-12 sm:py-16 min-h-[320px] bg-gradient-to-b from-indigo-500/5 to-transparent">
            <div className="w-20 h-20 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mb-5">
              <FileText className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-lg font-bold mb-2">{chapter.title}</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Official NCERT PDF for {textbook.title}, Chapter {chapter.number}. Opens on ncert.nic.in in your browser.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={openChapter}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition-colors"
              >
                <Monitor className="w-4 h-4" />
                View Online
              </button>
              <a
                href={chapter.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open PDF Link
              </a>
              <a
                href={chapter.pdfUrl}
                download
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-sm font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Chapter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
