import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { toARScapeScene } from "@/lib/arscape-utils";
import ARScape from "@/models/ARScape";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "teacher" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const scenes = await ARScape.find({ teacherId: session.id })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      scenes: scenes.map((s) => ({
        id: String(s._id),
        teacherId: s.teacherId,
        title: s.title,
        description: s.description,
        objects: s.objects ?? [],
        arPrimaryObjectId: s.arPrimaryObjectId,
        status: s.status,
        slug: s.slug,
        publishedAt: s.publishedAt?.toISOString(),
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("ARScape list error:", err);
    return NextResponse.json({ error: "Failed to load scenes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "teacher" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const title = body.title?.trim() || "Untitled ARScape";

    await connectDB();
    const scene = await ARScape.create({
      teacherId: session.id,
      title,
      description: body.description?.trim(),
      objects: [],
      status: "draft",
    });

    return NextResponse.json({ scene: toARScapeScene(scene) }, { status: 201 });
  } catch (err) {
    console.error("ARScape create error:", err);
    return NextResponse.json({ error: "Failed to create scene" }, { status: 500 });
  }
}
