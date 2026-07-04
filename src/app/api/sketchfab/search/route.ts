import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  CURATED_SKETCHFAB_MODELS,
  getCategoryQuery,
  getCuratedByCategory,
} from "@/data/sketchfab-categories";
import type { SketchfabSearchResult } from "@/types/arscape";

const SKETCHFAB_API = "https://api.sketchfab.com/v3";

function curatedToResults(category: string, q: string): SketchfabSearchResult[] {
  return getCuratedByCategory(category, q).map((m) => ({
    uid: m.uid,
    name: m.name,
    thumbnailUrl: m.thumbnailUrl,
    viewerUrl: `https://sketchfab.com/3d-models/${m.uid}`,
    isDownloadable: true,
    category: m.category,
  }));
}

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "teacher" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() || "all";
    const page = searchParams.get("page") || "1";

    const token = process.env.SKETCHFAB_API_TOKEN;
    const searchQuery = q || getCategoryQuery(category);

    if (!token) {
      return NextResponse.json({
        results: curatedToResults(category, q),
        usingFallback: true,
        categories: CURATED_SKETCHFAB_MODELS.length,
        message: "Using curated library — add SKETCHFAB_API_TOKEN for live Sketchfab search",
      });
    }

    const url = `${SKETCHFAB_API}/search?type=models&q=${encodeURIComponent(searchQuery)}&downloadable=true&page=${page}&page_size=24`;
    const res = await fetch(url, {
      headers: { Authorization: `Token ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json({
        results: curatedToResults(category, q),
        usingFallback: true,
        message: "Sketchfab API unavailable — showing curated models",
      });
    }

    const data = await res.json();
    const results: SketchfabSearchResult[] = (data.results ?? []).map(
      (m: {
        uid: string;
        name: string;
        thumbnails?: { images?: { url: string }[] };
        viewerUrl?: string;
        isDownloadable?: boolean;
        categories?: { name: string }[];
      }) => ({
        uid: m.uid,
        name: m.name,
        thumbnailUrl: m.thumbnails?.images?.[0]?.url ?? "",
        viewerUrl: m.viewerUrl ?? `https://sketchfab.com/models/${m.uid}`,
        isDownloadable: m.isDownloadable ?? false,
        category: m.categories?.[0]?.name,
      }),
    );

    return NextResponse.json({ results, usingFallback: false, page: Number(page) });
  } catch (err) {
    console.error("Sketchfab search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
