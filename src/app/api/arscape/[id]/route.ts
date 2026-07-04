import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { toARScapeScene } from "@/lib/arscape-utils";
import ARScape from "@/models/ARScape";
import type { ARScapeObject } from "@/types/arscape";

type Params = { params: Promise<{ id: string }> };

async function getOwnedScene(id: string, teacherId: string, isAdmin: boolean) {
  await connectDB();
  const scene = await ARScape.findById(id);
  if (!scene) return null;
  if (!isAdmin && scene.teacherId !== teacherId) return null;
  return scene;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "teacher" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const scene = await getOwnedScene(id, session.id, session.role === "admin");
    if (!scene) return NextResponse.json({ error: "Scene not found" }, { status: 404 });

    return NextResponse.json({ scene: toARScapeScene(scene) });
  } catch (err) {
    console.error("ARScape get error:", err);
    return NextResponse.json({ error: "Failed to load scene" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "teacher" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const scene = await getOwnedScene(id, session.id, session.role === "admin");
    if (!scene) return NextResponse.json({ error: "Scene not found" }, { status: 404 });

    const body = await request.json();
    if (body.title !== undefined) scene.title = String(body.title).trim() || "Untitled ARScape";
    if (body.description !== undefined) scene.description = body.description?.trim();
    if (Array.isArray(body.objects)) scene.objects = body.objects as ARScapeObject[];
    if (body.arPrimaryObjectId !== undefined) scene.arPrimaryObjectId = body.arPrimaryObjectId;

    await scene.save();
    return NextResponse.json({ scene: toARScapeScene(scene) });
  } catch (err) {
    console.error("ARScape update error:", err);
    return NextResponse.json({ error: "Failed to save scene" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "teacher" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const scene = await getOwnedScene(id, session.id, session.role === "admin");
    if (!scene) return NextResponse.json({ error: "Scene not found" }, { status: 404 });

    await scene.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ARScape delete error:", err);
    return NextResponse.json({ error: "Failed to delete scene" }, { status: 500 });
  }
}
