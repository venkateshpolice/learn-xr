"use client";

import { createContext, useContext } from "react";

export interface SceneViewOptions {
  showGrid: boolean;
}

export const SceneViewContext = createContext<SceneViewOptions>({ showGrid: true });

export function useSceneView() {
  return useContext(SceneViewContext);
}
