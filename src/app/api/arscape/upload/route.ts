import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSessionUser } from "@/lib/auth";
import { generateObjectId } from "@/lib/arscape-utils";
import { isReadOnlyServerless } from "@/lib/model-storage";

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "teacher" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isReadOnlyServerless()) {
      return NextResponse.json(
        {
          error:
            "File upload is not available on this host yet. Use Sketchfab library models or deploy with object storage (S3).",
        },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "glb" && ext !== "gltf") {
      return NextResponse.json({ error: "Only .glb and .gltf files are supported" }, { status: 400 });
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 25 MB" }, { status: 400 });
    }

    const id = generateObjectId();
    const filename = `${id}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "arscape");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const modelUrl = `/uploads/arscape/${filename}`;

    return NextResponse.json({
      asset: {
        id,
        name: file.name.replace(/\.(glb|gltf)$/i, ""),
        modelUrl,
        thumbnailUrl: "",
        source: "upload" as const,
      },
    });
  } catch (err) {
    console.error("ARScape upload error:", err);
    return NextResponse.json({ error: "Failed to upload model" }, { status: 500 });
  }
}
