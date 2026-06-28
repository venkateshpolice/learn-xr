"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface StudyShellProps {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
}

export function StudyShell({ backHref, backLabel, title, subtitle, badge, children }: StudyShellProps) {
  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>
        <div className="mb-8">
          {badge && (
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-3">
              {badge}
            </span>
          )}
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">{title}</h1>
          {subtitle && <p className="text-slate-400 text-sm sm:text-base max-w-2xl">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
