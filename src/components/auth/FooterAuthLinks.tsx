"use client";

import Link from "next/link";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import SignOutButton from "@/components/auth/SignOutButton";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_DASHBOARD, type UserRole } from "@/types/auth";

const links: { label: string; mode: "signup" | "signin"; role?: UserRole }[] = [
  { label: "For Students", mode: "signup", role: "student" },
  { label: "For Schools", mode: "signup", role: "school" },
  { label: "For Teachers", mode: "signup", role: "teacher" },
];

export default function FooterAuthLinks() {
  const { openAuth } = useAuthModal();
  const { user, loaded, isAuthenticated } = useAuth();

  if (!loaded) return null;

  if (isAuthenticated && user) {
    return (
      <ul className="space-y-2.5">
        <li>
          <Link
            href={ROLE_DASHBOARD[user.role]}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            My Dashboard
          </Link>
        </li>
        <li>
          <SignOutButton className="text-sm" />
        </li>
      </ul>
    );
  }

  return (
    <ul className="space-y-2.5">
      {links.map((item) => (
        <li key={item.label}>
          <button
            type="button"
            onClick={() => openAuth({ mode: item.mode, role: item.role })}
            className="text-sm text-slate-400 hover:text-white transition-colors text-left"
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
