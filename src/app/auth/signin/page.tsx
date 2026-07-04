"use client";

import { Suspense } from "react";
import AuthRedirectPage from "@/components/auth/AuthRedirectPage";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <AuthRedirectPage mode="signin" />
    </Suspense>
  );
}
