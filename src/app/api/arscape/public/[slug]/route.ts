import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { toARScapeScene } from "@/lib/arscape-utils";
import ARScape from "@/models/ARScape";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    await connectDB();
    const scene = await ARScape.findOne({ slug, status: "published" });
    if (!scene) return NextResponse.json({ error: "Scene not found" }, { status: 404 });

    return NextResponse.json({ scene: toARScapeScene(scene) });
  } catch (err) {
    console.error("ARScape public get error:", err);
    return NextResponse.json({ error: "Failed to load scene" }, { status: 500 });
  }
}
