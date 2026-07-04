"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  MonitorPlay,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import AssignActivityModal from "@/components/teacher/AssignActivityModal";
import LessonCard, { QuickActionCard, StatCard } from "@/components/teacher/LessonCard";
import { TEACHER_LESSONS } from "@/data/teacher-lessons";
import {
  getAssignments,
  getEngagementSummary,
  seedDemoData,
} from "@/lib/teacher-store";
import type { TeacherAssignment } from "@/types/teacher";

export default function TeacherDashboardPage() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [summary, setSummary] = useState({
    totalEvents: 0,
    completedCount: 0,
    avgDurationMinutes: 0,
    activeStudents: 0,
    completionRate: 0,
  });
  const [assignOpen, setAssignOpen] = useState(false);

  const refresh = () => {
    setAssignments(getAssignments());
    setSummary(getEngagementSummary());
  };

  useEffect(() => {
    seedDemoData();
    refresh();
  }, []);

  const featured = TEACHER_LESSONS.filter((l) =>
    ["solar-system", "photosynthesis", "water-cycle", "electricity"].includes(l.id),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-8 sm:mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
          Teacher Hub
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 mb-2">
          Welcome back — your classroom command center
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
          Search lessons, launch 3D models on smart boards, assign activities to
          classes, and track student engagement — all in one place.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        <StatCard
          label="Active Assignments"
          value={assignments.filter((a) => a.status === "active").length}
          sub={`${assignments.length} total`}
          icon={ClipboardList}
        />
        <StatCard
          label="Students Engaged"
          value={summary.activeStudents}
          sub="This week"
          icon={Users}
        />
        <StatCard
          label="Completion Rate"
          value={`${summary.completionRate}%`}
          sub={`${summary.completedCount} completed`}
          icon={TrendingUp}
        />
        <StatCard
          label="Avg. Time"
          value={`${summary.avgDurationMinutes}m`}
          sub="Per activity"
          icon={BarChart3}
        />
      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
        Quick Actions
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <QuickActionCard
          href="/teacher/lessons"
          icon={Search}
          title="Search Lessons"
          description="Find labs by subject, grade, or keyword"
          accent="from-indigo-500 to-violet-500"
        />
        <QuickActionCard
          href="/teacher/present"
          icon={MonitorPlay}
          title="Smart Board Mode"
          description="Fullscreen presenter with talking points"
          accent="from-cyan-500 to-blue-500"
        />
        <button
          type="button"
          onClick={() => setAssignOpen(true)}
          className="group glass-card rounded-2xl p-5 hover:bg-white/[0.07] transition-all text-left w-full"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-white mb-1">Assign Activity</h3>
          <p className="text-sm text-slate-400">Create assignment with join code for students</p>
        </button>
        <QuickActionCard
          href="/teacher/engagement"
          icon={BarChart3}
          title="Track Engagement"
          description="View completion rates and time spent"
          accent="from-fuchsia-500 to-pink-500"
        />
      </div>

      {/* Recent assignments */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Recent Assignments
        </h2>
        <Link href="/teacher/assignments" className="text-xs text-indigo-400 hover:text-indigo-300">
          View all →
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {assignments.slice(0, 3).map((a) => (
          <Link
            key={a.id}
            href="/teacher/assignments"
            className="glass-card rounded-xl p-4 hover:bg-white/[0.07] transition-all block"
          >
            <p className="font-semibold text-white mb-1 truncate">{a.title}</p>
            <p className="text-xs text-slate-500 mb-2">{a.className} · Due {a.dueDate}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              Code: {a.joinCode}
            </span>
          </Link>
        ))}
        {assignments.length === 0 && (
          <p className="text-sm text-slate-500 col-span-full">
            No assignments yet.{" "}
            <button
              type="button"
              onClick={() => setAssignOpen(true)}
              className="text-indigo-400 hover:underline"
            >
              Create your first one
            </button>
          </p>
        )}
      </div>

      {/* Featured lessons */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
        Popular Lessons
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featured.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            onAssign={() => setAssignOpen(true)}
            compact
          />
        ))}
      </div>

      <AssignActivityModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onCreated={() => refresh()}
      />
    </div>
  );
}
