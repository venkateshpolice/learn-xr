"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { getTrigModule, type TrigModuleId } from "@/data/trigonometry-modules";
import { loadTrigModule } from "@/components/trigonometry/modules/module-loaders";

export default function TrigonometryModulePage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const mod = getTrigModule(moduleId);
  const [ModuleComponent, setModuleComponent] = useState<ComponentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!mod) {
      setLoading(false);
      setModuleComponent(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    setModuleComponent(null);

    loadTrigModule(moduleId as TrigModuleId)
      .then((Component) => {
        if (cancelled) return;
        if (!Component) {
          setLoadError(true);
          setLoading(false);
          return;
        }
        setModuleComponent(() => Component);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [moduleId, mod]);

  if (!mod || loadError || (!loading && !ModuleComponent)) {
    return (
      <div className="min-h-screen bg-[#070714] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Module not found</h1>
          <Link href="/trigonometry" className="text-violet-400 hover:text-violet-300 text-sm">
            ← Back to Trigonometry Lab
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !ModuleComponent) {
    return (
      <div className="min-h-screen bg-[#070714] text-white flex items-center justify-center px-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading {mod.title}…</p>
        </div>
      </div>
    );
  }

  return <ModuleComponent />;
}
