import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { generateSlug, getARViewUrl, toARScapeScene } from "@/lib/arscape-utils";
import ARScape from "@/models/ARScape";

type Params = { params: Promise<{ id: string }> };

function qrImageUrl(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(data)}`;
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "teacher" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const scene = await ARScape.findById(id);
    if (!scene) return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    if (session.role !== "admin" && scene.teacherId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (scene.objects.length === 0) {
      return NextResponse.json(
        { error: "Add at least one 3D model before publishing" },
        { status: 400 },
      );
    }

    if (!scene.slug) {
      let slug = generateSlug();
      let attempts = 0;
      while (attempts < 5) {
        const exists = await ARScape.findOne({ slug });
        if (!exists) break;
        slug = generateSlug();
        attempts++;
      }
      scene.slug = slug;
    }

    if (!scene.arPrimaryObjectId && scene.objects.length > 0) {
      scene.arPrimaryObjectId = scene.objects[0].id;
    }

    scene.status = "published";
    scene.publishedAt = new Date();
    await scene.save();

    const origin = new URL(request.url).origin;
    const viewUrl = getARViewUrl(scene.slug!, origin);

    return NextResponse.json({
      scene: toARScapeScene(scene),
      viewUrl,
      qrCodeUrl: qrImageUrl(viewUrl),
    });
  } catch (err) {
    console.error("ARScape publish error:", err);
    return NextResponse.json({ error: "Failed to publish scene" }, { status: 500 });
  }
}
