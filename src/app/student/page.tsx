"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, FlaskConical, GraduationCap, Play } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import type { SessionUser } from "@/types/auth";

export default function StudentDashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <Link href="/" className="text-sm text-slate-500 hover:text-white mb-2 inline-block">
              ← Nexscape
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Hi, {user?.name ?? "Student"} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {user?.grade}
              {user?.schoolName && ` · ${user.schoolName}`}
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { href: "/study", icon: BookOpen, label: "Study Materials", desc: "NCERT books & MCQs", color: "from-indigo-500 to-violet-500" },
            { href: "/labs", icon: FlaskConical, label: "Science Labs", desc: "Interactive 3D experiments", color: "from-cyan-500 to-blue-500" },
            { href: "/nursery/puzzles", icon: Play, label: "Puzzle Games", desc: "Fun learning activities", color: "from-emerald-500 to-teal-500" },
          ].map(({ href, icon: Icon, label, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="glass-card rounded-2xl p-5 hover:bg-white/[0.07] transition-all group"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-bold text-white mb-1">{label}</h2>
              <p className="text-xs text-slate-500">{desc}</p>
            </Link>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold">Your learning hub</h2>
          </div>
          <p className="text-sm text-slate-400">
            Access assigned activities from your teacher via their join link at{" "}
            <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs">
              /teacher/join/[code]
            </code>
            . Complete labs and track your progress with your teacher.
          </p>
        </div>
      </div>
    </div>
  );
}
