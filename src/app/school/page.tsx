"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, Copy, Users } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import type { SessionUser } from "@/types/auth";

export default function SchoolDashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);

  const copyCode = () => {
    if (!user?.schoolCode) return;
    navigator.clipboard.writeText(user.schoolCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <Link href="/" className="text-sm text-slate-500 hover:text-white mb-2 inline-block">
              ← Nexscape
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">{user?.schoolName ?? "School Dashboard"}</h1>
            <p className="text-slate-400 text-sm mt-1">Institution management</p>
          </div>
          <SignOutButton />
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Your school code</p>
              <p className="text-3xl font-mono font-bold text-emerald-400">{user?.schoolCode ?? "—"}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Share this code with teachers and students during signup to link them to your institution.
          </p>
          <button
            type="button"
            onClick={copyCode}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy school code"}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/teacher" className="glass-card rounded-2xl p-5 hover:bg-white/[0.07] transition-all">
            <Users className="w-5 h-5 text-indigo-400 mb-2" />
            <h2 className="font-bold mb-1">Teacher tools</h2>
            <p className="text-xs text-slate-500">Teachers at your school can use the Teacher Hub for lessons and assignments.</p>
          </Link>
          <div className="glass-card rounded-2xl p-5">
            <h2 className="font-bold mb-1">Account</h2>
            <p className="text-xs text-slate-500 mb-2">Signed in as {user?.email}</p>
            <p className="text-xs text-slate-500">Contact: {user?.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
