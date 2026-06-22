"use client";

import { SceneViewContext } from "@/components/trigonometry/scenes/scene-view-context";

/** Context must live inside Canvas so R3F scene nodes receive showGrid. */
export function SceneViewBridge({
  showGrid,
  children,
}: {
  showGrid: boolean;
  children: React.ReactNode;
}) {
  return (
    <SceneViewContext.Provider value={{ showGrid }}>{children}</SceneViewContext.Provider>
  );
}
