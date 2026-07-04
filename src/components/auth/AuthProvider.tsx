"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@/types/auth";

type AuthContextValue = {
  user: SessionUser | null;
  loaded: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  signingOut: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = res.ok ? await res.json() : { user: null };
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  const signOut = useCallback(async () => {
    setSigningOut(true);
    try {
      const res = await fetch("/api/auth/signout", { method: "POST" });
      if (!res.ok) throw new Error("Sign out failed");
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      await refresh();
    } finally {
      setSigningOut(false);
    }
  }, [router, refresh]);

  const value = useMemo(
    () => ({
      user,
      loaded,
      isAuthenticated: !!user,
      refresh,
      signOut,
      signingOut,
    }),
    [user, loaded, refresh, signOut, signingOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
