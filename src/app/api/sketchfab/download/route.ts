import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSessionUser } from "@/lib/auth";
import { generateObjectId } from "@/lib/arscape-utils";
import { CURATED_SKETCHFAB_MODELS } from "@/data/sketchfab-categories";

const SKETCHFAB_API = "https://api.sketchfab.com/v3";

const curatedMap = Object.fromEntries(CURATED_SKETCHFAB_MODELS.map((m) => [m.uid, m]));

async function cacheRemoteFile(
  remoteUrl: string,
  prefix: string,
  ext: "glb" | "usdz",
): Promise<string> {
  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`Failed to download ${ext} file`);

  const id = generateObjectId();
  const filename = `${prefix}-${id}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "arscape");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/arscape/${filename}`;
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "teacher" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uid } = await request.json();
    if (!uid) return NextResponse.json({ error: "Model UID required" }, { status: 400 });

    const curated = curatedMap[uid];
    if (curated) {
      return NextResponse.json({
        modelUrl: curated.glbUrl,
        usdzUrl: curated.usdzUrl,
        name: curated.name,
        thumbnailUrl: curated.thumbnailUrl,
      });
    }

    const token = process.env.SKETCHFAB_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Sketchfab download requires SKETCHFAB_API_TOKEN in .env.local" },
        { status: 503 },
      );
    }

    const res = await fetch(`${SKETCHFAB_API}/models/${uid}/download`, {
      headers: { Authorization: `Token ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "This model is not available for download. Try another model." },
        { status: 403 },
      );
    }

    const data = await res.json();
    const glbRemote = data.glb?.url ?? data.gltf?.url ?? data.source?.url;
    const usdzRemote = data.usdz?.url;

    if (!glbRemote) {
      return NextResponse.json({ error: "No GLB download URL returned" }, { status: 502 });
    }

    const prefix = `sketchfab-${uid.slice(0, 8)}`;
    const modelUrl = await cacheRemoteFile(glbRemote, prefix, "glb");
    let usdzUrl: string | undefined;
    if (usdzRemote) {
      usdzUrl = await cacheRemoteFile(usdzRemote, prefix, "usdz");
    }

    return NextResponse.json({
      modelUrl,
      usdzUrl,
      name: data.name ?? uid,
    });
  } catch (err) {
    console.error("Sketchfab download error:", err);
    return NextResponse.json({ error: "Failed to fetch model" }, { status: 500 });
  }
}
