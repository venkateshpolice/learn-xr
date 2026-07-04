"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, GraduationCap, Shield, User } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  grade?: string;
  subject?: string;
  schoolName?: string;
  schoolCode?: string;
  createdAt: string;
};

type Stats = {
  total: number;
  students: number;
  teachers: number;
  schools: number;
  admins: number;
};

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else {
          setUsers(d.users);
          setStats(d.stats);
        }
      });
  }, []);

  const roleIcon = (role: string) => {
    switch (role) {
      case "student":
        return GraduationCap;
      case "teacher":
        return User;
      case "school":
        return Building2;
      default:
        return Shield;
    }
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <Link href="/" className="text-sm text-slate-500 hover:text-white mb-2 inline-block">
              ← Nexscape
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Shield className="w-7 h-7 text-fuchsia-400" />
              Admin Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Platform user management</p>
          </div>
          <SignOutButton />
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {[
              { label: "Total", value: stats.total },
              { label: "Students", value: stats.students },
              { label: "Teachers", value: stats.teachers },
              { label: "Schools", value: stats.schools },
              { label: "Admins", value: stats.admins },
            ].map(({ label, value }) => (
              <div key={label} className="glass-card rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="font-bold">Registered users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-white/10">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Details</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const Icon = roleIcon(u.role);
                  return (
                    <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-5 py-3">
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 text-xs capitalize">
                          <Icon className="w-3.5 h-3.5 text-indigo-400" />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">
                        {u.grade && `Grade: ${u.grade}`}
                        {u.subject && `Subject: ${u.subject}`}
                        {u.schoolName && ` · ${u.schoolName}`}
                        {u.schoolCode && ` · Code: ${u.schoolCode}`}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && !error && (
              <p className="text-center text-slate-500 py-12 text-sm">No users registered yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
