"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import type { UserRole } from "@/types/auth";

/** Legacy /auth/* routes — open modal and return to previous page. */
export default function AuthRedirectPage({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuth } = useAuthModal();

  useEffect(() => {
    const role = searchParams.get("role") as UserRole | null;
    const redirect = searchParams.get("redirect") || "";

    openAuth({
      mode,
      role: role ?? undefined,
      redirect,
    });

    router.replace("/");
  }, [mode, openAuth, router, searchParams]);

  return null;
}
