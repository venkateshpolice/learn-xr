import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
  toSessionUser,
} from "@/lib/auth";
import type { SignUpPayload, UserRole } from "@/types/auth";

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

function generateSchoolCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignUpPayload;
    const { role, name, email, password } = body;

    if (!role || !name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const validRoles: UserRole[] = ["student", "teacher", "school", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    if (role === "admin") {
      const invite = process.env.ADMIN_INVITE_CODE;
      if (!invite || body.adminInviteCode !== invite) {
        return NextResponse.json({ error: "Invalid admin invite code" }, { status: 403 });
      }
    }

    if (role === "student" && !body.grade?.trim()) {
      return NextResponse.json({ error: "Grade is required for students" }, { status: 400 });
    }

    if (role === "teacher" && !body.subject?.trim()) {
      return NextResponse.json({ error: "Subject is required for teachers" }, { status: 400 });
    }

    if (role === "school" && !body.schoolName?.trim()) {
      return NextResponse.json({ error: "School name is required" }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase(), role });
    if (existing) {
      return NextResponse.json(
        { error: `An account with this email already exists as ${role}` },
        { status: 409 },
      );
    }

    let schoolCode = body.schoolCode?.trim().toUpperCase();

    if (role === "school") {
      schoolCode = generateSchoolCode();
    }

    let resolvedSchoolName = body.schoolName?.trim();

    if (role === "student" && schoolCode) {
      const school = await User.findOne({ role: "school", schoolCode });
      if (!school) {
        return NextResponse.json({ error: "Invalid school code" }, { status: 400 });
      }
      resolvedSchoolName = school.schoolName;
    }

    const hashed = await hashPassword(password);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashed,
      name: name.trim(),
      role,
      grade: role === "student" ? body.grade?.trim() : undefined,
      subject: role === "teacher" ? body.subject?.trim() : undefined,
      schoolName:
        role === "school" ? resolvedSchoolName : resolvedSchoolName || undefined,
      schoolCode: role === "school" ? schoolCode : schoolCode || undefined,
    });

    const sessionUser = toSessionUser(user);
    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

    return NextResponse.json(
      {
        user: sessionUser,
        schoolCode: role === "school" ? schoolCode : undefined,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
