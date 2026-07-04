"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, CheckCircle2, Clock, Users } from "lucide-react";
import { StatCard } from "@/components/teacher/LessonCard";
import {
  getAssignments,
  getEngagementByLesson,
  getEngagementEvents,
  getEngagementSummary,
  seedDemoData,
} from "@/lib/teacher-store";

export default function TeacherEngagementPage() {
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all");
  const [events, setEvents] = useState<ReturnType<typeof getEngagementEvents>>([]);
  const [assignments, setAssignments] = useState<ReturnType<typeof getAssignments>>([]);
  const [summary, setSummary] = useState(getEngagementSummary());

  useEffect(() => {
    seedDemoData();
    setAssignments(getAssignments());
    setEvents(getEngagementEvents());
    setSummary(getEngagementSummary());
  }, []);

  const filteredEvents = useMemo(
    () =>
      assignmentFilter === "all"
        ? events
        : events.filter((e) => e.assignmentId === assignmentFilter),
    [events, assignmentFilter],
  );

  const filteredSummary = useMemo(
    () =>
      assignmentFilter === "all"
        ? summary
        : getEngagementSummary(assignmentFilter),
    [assignmentFilter, summary],
  );

  const byLesson = useMemo(() => getEngagementByLesson(), [events]);
  const maxCount = Math.max(...byLesson.map((l) => l.count), 1);

  const byStudent = useMemo(() => {
    const map = new Map<string, { started: number; completed: number; minutes: number }>();
    for (const e of filteredEvents) {
      const cur = map.get(e.studentName) ?? { started: 0, completed: 0, minutes: 0 };
      cur.started += 1;
      if (e.completedAt) {
        cur.completed += 1;
        cur.minutes += e.durationMinutes;
      }
      map.set(e.studentName, cur);
    }
    return [...map.entries()]
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.completed - a.completed);
  }, [filteredEvents]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-400">
          Analytics
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2 mb-2">Track Engagement</h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
          Monitor which students completed assigned activities, time spent, and
          lesson popularity across your classes.
        </p>
      </div>

      <div className="mb-6">
        <label className="text-xs text-slate-500 mb-2 block">Filter by assignment</label>
        <select
          value={assignmentFilter}
          onChange={(e) => setAssignmentFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-indigo-500/50"
        >
          <option value="all">All assignments</option>
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title} ({a.className})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          label="Total Sessions"
          value={filteredSummary.totalEvents}
          icon={BarChart3}
        />
        <StatCard
          label="Completed"
          value={filteredSummary.completedCount}
          sub={`${filteredSummary.completionRate}% rate`}
          icon={CheckCircle2}
        />
        <StatCard
          label="Active Students"
          value={filteredSummary.activeStudents}
          icon={Users}
        />
        <StatCard
          label="Avg. Duration"
          value={`${filteredSummary.avgDurationMinutes}m`}
          icon={Clock}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Lesson popularity */}
        <div className="glass-card rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Engagement by Lesson</h2>
          <div className="space-y-3">
            {byLesson.slice(0, 8).map((row) => (
              <div key={row.lessonId}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 truncate pr-2">{row.title}</span>
                  <span className="text-slate-500 shrink-0">
                    {row.completed}/{row.count}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all"
                    style={{ width: `${(row.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {byLesson.length === 0 && (
              <p className="text-sm text-slate-500">No engagement data yet.</p>
            )}
          </div>
        </div>

        {/* Student table */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 overflow-hidden">
          <h2 className="text-sm font-semibold text-white mb-4">Student Progress</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-white/10">
                  <th className="pb-2 font-medium">Student</th>
                  <th className="pb-2 font-medium">Started</th>
                  <th className="pb-2 font-medium">Done</th>
                  <th className="pb-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {byStudent.map((s) => (
                  <tr key={s.name} className="border-b border-white/5">
                    <td className="py-2.5 text-white">{s.name}</td>
                    <td className="py-2.5 text-slate-400">{s.started}</td>
                    <td className="py-2.5">
                      <span
                        className={
                          s.completed === s.started
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }
                      >
                        {s.completed}/{s.started}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{s.minutes}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {byStudent.length === 0 && (
              <p className="text-sm text-slate-500 py-4">
                Share an assignment join link with students to start tracking.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity log */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredEvents.slice(0, 20).map((e) => (
            <div
              key={e.id}
              className="flex flex-wrap items-center gap-2 py-2 border-b border-white/5 text-sm"
            >
              <span className="font-medium text-white">{e.studentName}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{e.lessonTitle}</span>
              <span className="text-slate-500">·</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  e.completedAt
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-amber-500/15 text-amber-400"
                }`}
              >
                {e.completedAt ? `Completed · ${e.durationMinutes}m` : "In progress"}
              </span>
              {e.score != null && (
                <span className="text-xs text-slate-500 ml-auto">Score: {e.score}%</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-4">
          Students log activity via assignment join links at{" "}
          <Link href="/teacher/assignments" className="text-indigo-400 hover:underline">
            /teacher/join/[code]
          </Link>
        </p>
      </div>
    </div>
  );
}
