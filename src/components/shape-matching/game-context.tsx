"use client";

import { createContext, useContext } from "react";
import type { ShapeId } from "@/data/shape-matching-data";

export interface ShapeMatchingGameState {
  placed: Set<ShapeId>;
  locked: Set<ShapeId>;
  dragging: ShapeId | null;
  hoverSlot: ShapeId | null;
  hoverValid: boolean;
  wrongFlash: ShapeId | null;
  successGlow: ShapeId | null;
  completed: boolean;
  xp: number;
}

export interface ShapeMatchingActions {
  onDragStart: (id: ShapeId) => void;
  onDragEnd: (id: ShapeId, position: [number, number, number]) => void;
  onDragMove: (id: ShapeId, position: [number, number, number]) => void;
  getSlotWorldPosition: (id: ShapeId) => [number, number, number];
  isLocked: (id: ShapeId) => boolean;
}

type Ctx = ShapeMatchingGameState & ShapeMatchingActions;

export const ShapeMatchingContext = createContext<Ctx | null>(null);

export function useShapeMatching() {
  const ctx = useContext(ShapeMatchingContext);
  if (!ctx) throw new Error("useShapeMatching outside provider");
  return ctx;
}
