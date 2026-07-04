import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import {
  createSessionToken,
  setSessionCookie,
  toSessionUser,
  verifyPassword,
} from "@/lib/auth";
import type { SignInPayload, UserRole } from "@/types/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignInPayload;
    const { email, password, role } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await connectDB();

    const query: { email: string; role?: UserRole } = { email: email.toLowerCase() };
    if (role) query.role = role;

    const users = await User.find(query).select("+password");

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    let matched = users[0];
    if (users.length > 1 && role) {
      matched = users.find((u) => u.role === role) ?? users[0];
    } else if (users.length > 1 && !role) {
      return NextResponse.json(
        {
          error: "Multiple accounts found. Please select your role.",
          roles: users.map((u) => u.role),
        },
        { status: 409 },
      );
    }

    const valid = await verifyPassword(password, matched.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const sessionUser = toSessionUser(matched);
    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

    return NextResponse.json({ user: sessionUser });
  } catch (err) {
    console.error("Signin error:", err);
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
  }
}
