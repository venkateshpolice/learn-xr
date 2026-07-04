"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut, Loader2 } from "lucide-react";

type SignOutButtonProps = {
  className?: string;
  variant?: "text" | "nav" | "sidebar";
};

export default function SignOutButton({
  className = "",
  variant = "text",
}: SignOutButtonProps) {
  const { signOut, signingOut } = useAuth();

  const styles =
    variant === "nav"
      ? "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 border border-white/15 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
      : variant === "sidebar"
        ? "inline-flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
        : `inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50 ${className}`;

  return (
    <button
      type="button"
      onClick={() => signOut()}
      disabled={signingOut}
      className={styles}
    >
      {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
