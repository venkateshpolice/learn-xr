import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await connectDB();
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    teachers: users.filter((u) => u.role === "teacher").length,
    schools: users.filter((u) => u.role === "school").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  return NextResponse.json({ users, stats });
}
