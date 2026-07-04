"use client";

import { Suspense } from "react";
import AuthModalProvider from "@/components/auth/AuthModalProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthProvider>
        <AuthModalProvider>{children}</AuthModalProvider>
      </AuthProvider>
    </Suspense>
  );
}
