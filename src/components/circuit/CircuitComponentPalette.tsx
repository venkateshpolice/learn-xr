"use client";

import { Battery, Lightbulb, ToggleLeft, Ban, GripVertical } from "lucide-react";
import type { PartType } from "@/lib/circuitBuilder";

const ITEMS: {
  type: PartType;
  label: string;
  hint: string;
  color: string;
  border: string;
  icon: typeof Battery;
}[] = [
  { type: "cell", label: "Cell", hint: "3V power", color: "bg-blue-600/90", border: "border-blue-400/40", icon: Battery },
  { type: "bulb", label: "Bulb", hint: "6Ω load", color: "bg-yellow-600/90", border: "border-yellow-400/40", icon: Lightbulb },
  { type: "switch", label: "Switch", hint: "Open/close", color: "bg-emerald-600/90", border: "border-emerald-400/40", icon: ToggleLeft },
  { type: "insulator", label: "Insulator", hint: "Blocks flow", color: "bg-red-600/90", border: "border-red-400/40", icon: Ban },
];

export function CircuitComponentPalette({
  activeDrag,
  onDragStart,
  onQuickAdd,
}: {
  activeDrag: PartType | null;
  onDragStart: (type: PartType) => void;
  onQuickAdd: (type: PartType) => void;
}) {
  return (
    <div className="absolute top-36 left-3 sm:left-5 z-20 w-[7.5rem] sm:w-36 pointer-events-auto">
      <div className="glass-card rounded-2xl p-2.5 border border-white/10 space-y-1.5">
        <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold px-1 mb-1">
          Components
        </p>
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isDragging = activeDrag === item.type;
          return (
            <div
              key={item.type}
              role="button"
              tabIndex={0}
              onPointerDown={(e) => {
                e.preventDefault();
                onDragStart(item.type);
              }}
              onDoubleClick={() => onQuickAdd(item.type)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onQuickAdd(item.type);
              }}
              className={`flex items-center gap-2 px-2 py-2 rounded-xl border cursor-grab active:cursor-grabbing select-none touch-none transition-all ${
                isDragging
                  ? `${item.color} ${item.border} scale-95 opacity-80 ring-2 ring-cyan-400/50`
                  : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15"
              }`}
            >
              <GripVertical className="w-3 h-3 text-slate-500 shrink-0" />
              <Icon className={`w-4 h-4 shrink-0 ${isDragging ? "text-white" : "text-slate-300"}`} />
              <div className="min-w-0">
                <p className={`text-[11px] font-semibold leading-none ${isDragging ? "text-white" : "text-slate-200"}`}>
                  {item.label}
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5 truncate">{item.hint}</p>
              </div>
            </div>
          );
        })}
        <p className="text-[9px] text-slate-600 px-1 pt-1 leading-snug">
          Drag onto board · Double-click to auto-place
        </p>
      </div>
    </div>
  );
}
