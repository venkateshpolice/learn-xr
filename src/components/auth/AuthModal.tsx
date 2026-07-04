"use client";

import { Suspense, useEffect } from "react";
import { X } from "lucide-react";
import AuthForm from "@/components/auth/AuthForm";
import type { UserRole } from "@/types/auth";

type AuthModalProps = {
  open: boolean;
  mode: "signin" | "signup";
  initialRole: UserRole;
  redirect: string;
  onClose: () => void;
  onSwitchMode: (mode: "signin" | "signup") => void;
};

function AuthModalContent({
  open,
  mode,
  initialRole,
  redirect,
  onClose,
  onSwitchMode,
}: AuthModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#0c1222] shadow-2xl shadow-black/60"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-6 sm:p-8 pt-10">
          <AuthForm
            key={`${mode}-${initialRole}-${redirect}`}
            mode={mode}
            initialRole={initialRole}
            redirect={redirect}
            inModal
            onSwitchMode={onSwitchMode}
            onSuccess={onClose}
          />
        </div>
      </div>
    </div>
  );
}

export default function AuthModal(props: AuthModalProps) {
  return (
    <Suspense fallback={null}>
      <AuthModalContent {...props} />
    </Suspense>
  );
}
