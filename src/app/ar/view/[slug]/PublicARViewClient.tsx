"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ARScapeViewer from "@/components/arscape/ARScapeViewer";
import type { ARScapeScene } from "@/types/arscape";

export default function PublicARViewPage({ slug }: { slug: string }) {
  const [scene, setScene] = useState<ARScapeScene | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/arscape/public/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.scene) setScene(d.scene);
        else setError(d.error ?? "Scene not found");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error || !scene) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">ARScape not found</h1>
          <p className="text-slate-400 text-sm">{error || "This link may be invalid or unpublished."}</p>
        </div>
      </div>
    );
  }

  return <ARScapeViewer scene={scene} />;
}
