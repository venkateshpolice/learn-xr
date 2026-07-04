"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Copy,
  Download,
  Globe,
  Loader2,
  Move,
  QrCode,
  RotateCw,
  Save,
  Scale,
  Trash2,
  X,
} from "lucide-react";
import AssetLibrary from "./AssetLibrary";
import { generateObjectId } from "@/lib/arscape-utils";
import type { ARScapeAsset, ARScapeObject, ARScapeScene } from "@/types/arscape";

const EditorCanvas = dynamic(() => import("./EditorCanvas"), { ssr: false });

interface ARScapeEditorProps {
  sceneId: string;
}

export default function ARScapeEditor({ sceneId }: ARScapeEditorProps) {
  const [scene, setScene] = useState<ARScapeScene | null>(null);
  const [objects, setObjects] = useState<ARScapeObject[]>([]);
  const [title, setTitle] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<"translate" | "rotate" | "scale">("translate");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    viewUrl: string;
    qrCodeUrl: string;
  } | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetch(`/api/arscape/${sceneId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.scene) {
          setScene(d.scene);
          setObjects(d.scene.objects ?? []);
          setTitle(d.scene.title);
        }
      })
      .finally(() => setLoading(false));
  }, [sceneId]);

  const addAsset = useCallback((asset: ARScapeAsset, position: [number, number, number] = [0, 0.5, 0]) => {
    const offset = Math.random() * 0.8 - 0.4;
    const obj: ARScapeObject = {
      id: generateObjectId(),
      name: asset.name,
      modelUrl: asset.modelUrl,
      usdzUrl: asset.usdzUrl,
      thumbnailUrl: asset.thumbnailUrl,
      source: asset.source,
      sketchfabUid: asset.sketchfabUid,
      position: [position[0] + offset, position[1], position[2] + offset],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    setObjects((prev) => [...prev, obj]);
    setSelectedId(obj.id);
  }, []);

  const updateObject = useCallback((id: string, patch: Partial<ARScapeObject>) => {
    setObjects((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  const removeSelected = () => {
    if (!selectedId) return;
    setObjects((prev) => prev.filter((o) => o.id !== selectedId));
    setSelectedId(null);
  };

  const save = async (): Promise<boolean> => {
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch(`/api/arscape/${sceneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          objects,
          arPrimaryObjectId: selectedId ?? objects[0]?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScene(data.scene);
      setSaveMessage("Saved");
      setTimeout(() => setSaveMessage(""), 2000);
      return true;
    } catch (e) {
      setSaveMessage(e instanceof Error ? e.message : "Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    try {
      const saved = await save();
      if (!saved) return;
      const res = await fetch(`/api/arscape/${sceneId}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScene(data.scene);
      setPublishResult({ viewUrl: data.viewUrl, qrCodeUrl: data.qrCodeUrl });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!scene) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400 mb-4">Scene not found</p>
        <Link href="/teacher/arscape" className="text-indigo-400 hover:underline text-sm">
          Back to ARScape
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] lg:h-screen">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-white/10 bg-slate-950/90 shrink-0">
        <Link
          href="/teacher/arscape"
          className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-[140px] max-w-xs px-3 py-1.5 text-sm font-semibold bg-white/5 border border-white/10 rounded-lg outline-none focus:border-indigo-500/50"
        />
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${
            scene.status === "published"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-amber-500/20 text-amber-400"
          }`}
        >
          {scene.status}
        </span>

        <div className="flex items-center gap-1 ml-auto">
          {(["translate", "rotate", "scale"] as const).map((mode) => {
            const Icon = mode === "translate" ? Move : mode === "rotate" ? RotateCw : Scale;
            return (
              <button
                key={mode}
                onClick={() => setTransformMode(mode)}
                disabled={!selectedId}
                title={mode}
                className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
                  transformMode === mode ? "bg-indigo-500/30 text-white" : "hover:bg-white/10 text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
          <button
            onClick={removeSelected}
            disabled={!selectedId}
            className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
          <button
            onClick={publish}
            disabled={publishing || objects.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold disabled:opacity-50"
          >
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            Publish
          </button>
        </div>
        {saveMessage && <span className="text-xs text-emerald-400 w-full sm:w-auto">{saveMessage}</span>}
      </div>

      {/* Editor layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[240px_1fr_200px] gap-3 p-3 min-h-0 overflow-hidden">
        <div className="min-h-[200px] lg:min-h-0 lg:h-full overflow-hidden">
          <AssetLibrary onAddAsset={(a) => addAsset(a)} />
        </div>

        <div className="min-h-[360px] lg:min-h-0">
          <EditorCanvas
            objects={objects}
            selectedId={selectedId}
            transformMode={transformMode}
            onSelect={setSelectedId}
            onUpdateObject={updateObject}
            onDropAsset={(asset, pos) => addAsset(asset, pos)}
          />
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-3 overflow-y-auto min-h-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Scene Objects ({objects.length})
          </p>
          {objects.length === 0 ? (
            <p className="text-xs text-slate-500">Add models from the library</p>
          ) : (
            <ul className="space-y-1">
              {objects.map((obj) => (
                <li key={obj.id}>
                  <button
                    onClick={() => setSelectedId(obj.id)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs truncate transition-colors ${
                      selectedId === obj.id
                        ? "bg-indigo-500/25 text-white"
                        : "hover:bg-white/5 text-slate-400"
                    }`}
                  >
                    {obj.name}
                    {scene.arPrimaryObjectId === obj.id || (!scene.arPrimaryObjectId && objects[0]?.id === obj.id) ? (
                      <span className="ml-1 text-[9px] text-cyan-400">AR</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selectedId && (
            <button
              onClick={() => {
                fetch(`/api/arscape/${sceneId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ arPrimaryObjectId: selectedId, title, objects }),
                });
              }}
              className="mt-3 w-full text-[10px] py-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              Set as AR primary model
            </button>
          )}
        </div>
      </div>

      {/* Publish modal with QR */}
      {publishResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass-card rounded-2xl border border-white/10 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-400" />
                Published!
              </h3>
              <button onClick={() => setPublishResult(null)} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Scan the QR code to open the AR view on any phone or tablet.
            </p>
            <div className="flex justify-center mb-4 p-4 bg-white rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publishResult.qrCodeUrl} alt="QR code" className="w-48 h-48" />
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-xs break-all mb-4">
              <span className="flex-1 text-slate-300">{publishResult.viewUrl}</span>
              <button
                onClick={() => navigator.clipboard.writeText(publishResult.viewUrl)}
                className="p-1.5 shrink-0 hover:bg-white/10 rounded"
                title="Copy link"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <a
                href={publishResult.qrCodeUrl}
                download="arscape-qr.png"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download QR
              </a>
              <a
                href={publishResult.viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold"
              >
                Open AR View
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
