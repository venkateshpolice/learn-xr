"use client";

import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_DASHBOARD } from "@/types/auth";

type AuthNavProps = {
  mobile?: boolean;
};

export function AuthNav({ mobile }: AuthNavProps = {}) {
  const { user, loaded, isAuthenticated } = useAuth();
  const { openAuth } = useAuthModal();

  if (!loaded) return null;

  if (isAuthenticated && user) {
    return (
      <div className={mobile ? "flex flex-col gap-2" : "flex items-center gap-2"}>
        <Link
          href={ROLE_DASHBOARD[user.role]}
          className={
            mobile
              ? "inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
              : "inline-flex px-4 py-2 text-sm font-medium text-white border border-white/15 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          }
        >
          Dashboard
        </Link>
        <SignOutButton variant={mobile ? "text" : "nav"} className={mobile ? "justify-center py-2" : ""} />
      </div>
    );
  }

  const signInClass = mobile
    ? "inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg w-full"
    : "inline-flex px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors";

  return (
    <button type="button" onClick={() => openAuth({ mode: "signin" })} className={signInClass}>
      Sign In
    </button>
  );
}

export default AuthNav;
