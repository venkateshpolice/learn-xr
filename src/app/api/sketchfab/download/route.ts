import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { resolveModelDownloadUrl } from "@/lib/model-storage";
import { CURATED_SKETCHFAB_MODELS } from "@/data/sketchfab-categories";

const SKETCHFAB_API = "https://api.sketchfab.com/v3";

const curatedMap = Object.fromEntries(CURATED_SKETCHFAB_MODELS.map((m) => [m.uid, m]));

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "teacher" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { uid } = body;
    if (!uid) return NextResponse.json({ error: "Model UID required" }, { status: 400 });

    const curated = curatedMap[uid];
    if (curated) {
      return NextResponse.json({
        modelUrl: curated.glbUrl,
        usdzUrl: curated.usdzUrl,
        name: curated.name,
        thumbnailUrl: curated.thumbnailUrl,
        cached: false,
      });
    }

    const token = process.env.SKETCHFAB_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        {
          error:
            "Sketchfab is not configured on the server. Set SKETCHFAB_API_TOKEN in production environment variables.",
        },
        { status: 503 },
      );
    }

    const apiRes = await fetch(`${SKETCHFAB_API}/models/${uid}/download`, {
      headers: { Authorization: `Token ${token}` },
    });

    if (apiRes.status === 401 || apiRes.status === 403) {
      return NextResponse.json(
        { error: "This model is not available for download, or the Sketchfab API token is invalid." },
        { status: 403 },
      );
    }

    if (!apiRes.ok) {
      const detail = await apiRes.text().catch(() => "");
      console.error("Sketchfab download API error:", apiRes.status, detail);
      return NextResponse.json(
        { error: "Sketchfab could not provide a download for this model." },
        { status: 502 },
      );
    }

    const data = await apiRes.json();
    const glbRemote: string | undefined =
      data.glb?.url ?? data.gltf?.url ?? data.source?.url;
    const usdzRemote: string | undefined = data.usdz?.url;

    if (!glbRemote) {
      return NextResponse.json({ error: "No GLB/GLTF download URL returned from Sketchfab" }, { status: 502 });
    }

    const prefix = `sketchfab-${String(uid).slice(0, 8)}`;
    const modelUrl = await resolveModelDownloadUrl(glbRemote, prefix, "glb");
    const usdzUrl = usdzRemote
      ? await resolveModelDownloadUrl(usdzRemote, prefix, "usdz")
      : undefined;

    return NextResponse.json({
      modelUrl,
      usdzUrl,
      name: data.name ?? uid,
      cached: !modelUrl.startsWith("http"),
    });
  } catch (err) {
    console.error("Sketchfab download error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to fetch model",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
