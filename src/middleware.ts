import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "@/lib/auth";
import { ROLE_DASHBOARD, type UserRole } from "@/types/auth";

const PROTECTED: { prefix: string; roles: UserRole[] }[] = [
  { prefix: "/teacher", roles: ["teacher", "admin"] },
  { prefix: "/school", roles: ["school", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/student", roles: ["student", "admin"] },
];

const PUBLIC_PREFIXES = ["/teacher/join/", "/auth/"];

async function getUserFromRequest(
  request: NextRequest,
): Promise<{ role: UserRole } | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (!payload.role) return null;
    return { role: payload.role as UserRole };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (pathname.startsWith("/auth/")) {
      const user = await getUserFromRequest(request);
      if (user) {
        return NextResponse.redirect(new URL(ROLE_DASHBOARD[user.role], request.url));
      }
    }
    return NextResponse.next();
  }

  for (const { prefix, roles } of PROTECTED) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const user = await getUserFromRequest(request);

      if (!user) {
        const url = new URL("/", request.url);
        url.searchParams.set("auth", "signin");
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }

      if (!roles.includes(user.role)) {
        return NextResponse.redirect(new URL(ROLE_DASHBOARD[user.role], request.url));
      }

      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/teacher/:path*",
    "/school/:path*",
    "/admin/:path*",
    "/student/:path*",
    "/auth/:path*",
  ],
};
