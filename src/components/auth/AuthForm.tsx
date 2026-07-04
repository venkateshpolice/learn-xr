"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  Shield,
  User,
} from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_DASHBOARD, ROLE_LABELS, type UserRole } from "@/types/auth";

const ROLES: UserRole[] = ["student", "teacher", "school", "admin"];

const roleIcons: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  student: GraduationCap,
  teacher: User,
  school: Building2,
  admin: Shield,
};

type AuthMode = "signin" | "signup";

type AuthFormProps = {
  mode: AuthMode;
  initialRole?: UserRole;
  redirect?: string;
  inModal?: boolean;
  onSwitchMode?: (mode: AuthMode) => void;
  onSuccess?: () => void;
};

export default function AuthForm({
  mode,
  initialRole = "student",
  redirect = "",
  inModal = false,
  onSwitchMode,
  onSuccess,
}: AuthFormProps) {
  const router = useRouter();
  const { refresh } = useAuth();

  const [role, setRole] = useState<UserRole>(
    ROLES.includes(initialRole) ? initialRole : "student",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [adminInviteCode, setAdminInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [schoolCodeCreated, setSchoolCodeCreated] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/signin";
      const body =
        mode === "signup"
          ? {
              role,
              name,
              email,
              password,
              grade: role === "student" ? grade : undefined,
              subject: role === "teacher" ? subject : undefined,
              schoolName: role === "school" ? schoolName : schoolName || undefined,
              schoolCode: role === "student" ? schoolCode : undefined,
              adminInviteCode: role === "admin" ? adminInviteCode : undefined,
            }
          : { email, password, role };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      if (data.schoolCode) {
        setSchoolCodeCreated(data.schoolCode);
        refresh();
        return;
      }

      refresh();
      onSuccess?.();

      const destination =
        redirect && redirect.startsWith("/")
          ? redirect
          : ROLE_DASHBOARD[data.user.role as UserRole];

      router.push(destination);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const shellClass = inModal ? "" : "glass-card rounded-2xl p-6 sm:p-8";
  const fieldClass = inModal
    ? "w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
    : "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-indigo-500/50";
  const fieldClassWithIcon = inModal
    ? "w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
    : "w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-indigo-500/50";

  if (schoolCodeCreated) {
    return (
      <div className={inModal ? "text-center" : "glass-card rounded-2xl p-8 text-center"}>
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2">School registered!</h2>
        <p className="text-slate-400 text-sm mb-4">
          Share this code with teachers and students to link their accounts:
        </p>
        <p className="text-3xl font-mono font-bold text-emerald-400 mb-6">{schoolCodeCreated}</p>
        <button
          type="button"
          onClick={() => {
            onSuccess?.();
            router.push("/school");
            router.refresh();
          }}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm"
        >
          Go to School Dashboard
        </button>
        <div className="mt-4">
          <SignOutButton className="justify-center w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">
          {mode === "signin" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-sm text-slate-400">
          {mode === "signin"
            ? "Sign in to your Nexscape account"
            : "Join Nexscape as a student, teacher, school, or admin"}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {ROLES.map((r) => {
          const Icon = roleIcons[r];
          return (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[10px] sm:text-xs font-medium transition-all ${
                role === r
                  ? "bg-indigo-500/25 text-indigo-200 border border-indigo-500/40"
                  : "bg-white/5 text-slate-500 border border-transparent hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {ROLE_LABELS[r]}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={fieldClassWithIcon}
                placeholder="Your name"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={fieldClassWithIcon}
              placeholder="you@school.edu"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={fieldClassWithIcon}
              placeholder="Min. 8 characters"
            />
          </div>
        </div>

        {mode === "signup" && role === "student" && (
          <>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Grade / Class</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
                className={fieldClass}
              >
                <option value="">Select grade</option>
                {[
                  "Nursery", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
                  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12",
                ].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">School code (optional)</label>
              <input
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                className={`${fieldClass} font-mono`}
                placeholder="ABC123"
              />
            </div>
          </>
        )}

        {mode === "signup" && role === "teacher" && (
          <>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className={fieldClass}
                placeholder="e.g. Science, Mathematics"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">School name</label>
              <input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className={fieldClass}
                placeholder="Your school"
              />
            </div>
          </>
        )}

        {mode === "signup" && role === "school" && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">School / Institution name</label>
            <input
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
              className={fieldClass}
              placeholder="Delhi Public School"
            />
          </div>
        )}

        {mode === "signup" && role === "admin" && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Admin invite code</label>
            <input
              value={adminInviteCode}
              onChange={(e) => setAdminInviteCode(e.target.value)}
              required
              className={`${fieldClass} font-mono`}
              placeholder="Required for admin registration"
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        {mode === "signin" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => onSwitchMode?.("signup")}
              className="text-indigo-400 hover:underline"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onSwitchMode?.("signin")}
              className="text-indigo-400 hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
