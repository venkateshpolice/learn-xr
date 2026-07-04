"use client";

import { Suspense } from "react";
import AuthRedirectPage from "@/components/auth/AuthRedirectPage";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <AuthRedirectPage mode="signup" />
    </Suspense>
  );
}
