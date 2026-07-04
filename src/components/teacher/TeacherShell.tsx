"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MonitorPlay,
  ScanLine,
  Search,
  X,
} from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, seedDemoData } from "@/lib/teacher-store";

const navItems = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/teacher/lessons", label: "Search Lessons", icon: Search },
  { href: "/teacher/present", label: "Smart Board", icon: MonitorPlay },
  { href: "/teacher/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/teacher/engagement", label: "Engagement", icon: BarChart3 },
  { href: "/teacher/arscape", label: "ARScape", icon: ScanLine },
];

export default function TeacherShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user: sessionUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState({ name: "", school: "", subject: "" });

  const isFullBleed =
    /^\/teacher\/present\/[^/]+$/.test(pathname) ||
    /^\/teacher\/join\/[^/]+$/.test(pathname) ||
    /^\/teacher\/arscape\/[^/]+$/.test(pathname);

  useEffect(() => {
    seedDemoData();
    setProfile(getProfile());
  }, []);

  useEffect(() => {
    if (sessionUser) {
      setProfile({
        name: sessionUser.name,
        school: sessionUser.schoolName ?? "",
        subject: sessionUser.subject ?? "Teacher",
      });
    }
  }, [sessionUser]);

  if (isFullBleed) {
    return <>{children}</>;
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-[#060a14] text-white flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/10 bg-slate-950/50">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">
                Nex<span className="text-indigo-400">scape</span>
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Teacher Hub</p>
            </div>
          </Link>
          {profile.name && (
            <div className="glass-card rounded-xl p-3">
              <p className="text-sm font-semibold truncate">{sessionUser?.name ?? profile.name}</p>
              <p className="text-xs text-slate-400 truncate">{sessionUser?.schoolName ?? profile.school}</p>
              <p className="text-[10px] text-indigo-400 mt-1">{sessionUser?.subject ?? profile.subject}</p>
              <SignOutButton variant="sidebar" className="mt-2" />
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(href, exact)
                  ? "bg-indigo-500/20 text-white border border-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/labs"
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Browse student labs
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-slate-950 border-r border-white/10 p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold">Teacher Hub</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map(({ href, label, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                    isActive(href, exact) ? "bg-indigo-500/20 text-white" : "text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm">Teacher Dashboard</span>
        </header>

        <main className="flex-1 relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/8 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
