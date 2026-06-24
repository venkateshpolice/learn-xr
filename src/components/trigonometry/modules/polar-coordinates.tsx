"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import TrigModuleShell, { SidebarSection, StatRow, TrigSlider } from "@/components/trigonometry/TrigModuleShell";
import { MathBlock } from "@/components/trigonometry/MathFormula";
import {
  UnitCircleScene,
  RightTriangleScene,
  TrigGraphScene,
  WaveScene,
  PolarScene,
  ComplexPlaneScene,
  SphericalScene,
  VectorScene,
} from "@/components/trigonometry/scenes/trig-scenes";
import { getTrigModule, formatTrigValue, DEG_TO_RAD } from "@/data/trigonometry-modules";
import { TRIG_FORMULAS, TRIG_QUIZ, TRIG_CHALLENGES } from "@/data/trigonometry-content";
import { RotateCcw, CheckCircle, XCircle, Timer } from "lucide-react";
import CanvasWrap from "./CanvasWrap";

export default function PolarModule() {
  const mod = getTrigModule("polar-coordinates")!;
  const [preset, setPreset] = useState<"rose" | "cardioid" | "spiral">("rose");

  const curve = useMemo(() => {
    if (preset === "rose") return (t: number) => Math.cos(3 * t);
    if (preset === "cardioid") return (t: number) => 1 + Math.cos(t);
    return (t: number) => t / (2 * Math.PI);
  }, [preset]);

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Curve preset">
            {(["rose", "cardioid", "spiral"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1.5 border ${preset === p ? "bg-blue-500/20 border-blue-500/40 text-blue-300" : "bg-white/5 border-white/10"}`}
              >
                {p === "rose" ? "Rose: r = cos(3θ)" : p === "cardioid" ? "Cardioid: r = 1 + cos(θ)" : "Spiral: r = θ/2π"}
              </button>
            ))}
          </SidebarSection>
          <SidebarSection title="Polar ↔ Cartesian">
            <MathBlock>{`x = r\\cos\\theta,\\quad y = r\\sin\\theta`}</MathBlock>
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap>
        <PolarScene curve={curve} maxR={2} />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ COMPLEX PLANE ═══════════════ */
