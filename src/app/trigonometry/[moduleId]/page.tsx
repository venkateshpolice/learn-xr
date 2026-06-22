"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTrigModule, type TrigModuleId } from "@/data/trigonometry-modules";
import { TRIG_MODULE_COMPONENTS } from "@/components/trigonometry/modules/registry";

export default function TrigonometryModulePage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const mod = getTrigModule(moduleId);
  const Component = TRIG_MODULE_COMPONENTS[moduleId as TrigModuleId];

  if (!mod || !Component) {
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

  return <Component />;
}
