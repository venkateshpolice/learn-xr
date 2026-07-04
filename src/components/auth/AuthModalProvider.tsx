"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";
import type { UserRole } from "@/types/auth";

type AuthMode = "signin" | "signup";

type OpenAuthOptions = {
  mode?: AuthMode;
  role?: UserRole;
  redirect?: string;
};

type AuthModalContextValue = {
  openAuth: (options?: OpenAuthOptions) => void;
  closeAuth: () => void;
  isOpen: boolean;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}

function AuthUrlListener({ onOpen }: { onOpen: (opts: OpenAuthOptions) => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth !== "signin" && auth !== "signup") return;

    const role = searchParams.get("role") as UserRole | null;
    const redirect = searchParams.get("redirect") || "";

    onOpen({
      mode: auth,
      role: role ?? undefined,
      redirect,
    });

    const url = new URL(window.location.href);
    url.searchParams.delete("auth");
    url.searchParams.delete("role");
    url.searchParams.delete("redirect");
    const clean = `${url.pathname}${url.search}${url.hash}`;
    router.replace(clean, { scroll: false });
  }, [searchParams, router, onOpen]);

  return null;
}

export default function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [role, setRole] = useState<UserRole>("student");
  const [redirect, setRedirect] = useState("");

  const openAuth = useCallback((options?: OpenAuthOptions) => {
    setMode(options?.mode ?? "signin");
    if (options?.role) setRole(options.role);
    if (options?.redirect !== undefined) setRedirect(options.redirect);
    setIsOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider value={{ openAuth, closeAuth, isOpen }}>
      {children}
      <AuthUrlListener onOpen={openAuth} />
      <AuthModal
        open={isOpen}
        mode={mode}
        initialRole={role}
        redirect={redirect}
        onClose={closeAuth}
        onSwitchMode={setMode}
      />
    </AuthModalContext.Provider>
  );
}
