import { NextResponse } from "next/server";
import { clearSessionCookie, COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie();
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
