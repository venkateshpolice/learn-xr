"use client";

import type { ComponentType } from "react";
import type { TrigModuleId } from "@/data/trigonometry-modules";

const TRIG_MODULE_LOADERS: Record<TrigModuleId, () => Promise<{ default: ComponentType }>> = {
  "unit-circle": () => import("./unit-circle"),
  "trig-functions": () => import("./trig-functions"),
  "right-triangle": () => import("./right-triangle"),
  "graph-explorer": () => import("./graph-explorer"),
  "wave-simulator": () => import("./wave-simulator"),
  "inverse-trig": () => import("./inverse-trig"),
  "identities": () => import("./identities"),
  "transformations": () => import("./transformations"),
  "polar-coordinates": () => import("./polar-coordinates"),
  "complex-plane": () => import("./complex-plane"),
  "trig-3d": () => import("./trig-3d"),
  "vector-trig": () => import("./vector-trig"),
  "quiz": () => import("./quiz"),
  "challenge": () => import("./challenge"),
  "formula-library": () => import("./formula-library"),
  "ar-mode": () => import("./ar-mode"),
  "vr-mode": () => import("./vr-mode"),
};

export async function loadTrigModule(id: TrigModuleId): Promise<ComponentType | null> {
  const loader = TRIG_MODULE_LOADERS[id];
  if (!loader) return null;
  const mod = await loader();
  return mod.default;
}
