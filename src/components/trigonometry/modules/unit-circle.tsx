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

export default function UnitCircleModule() {
  const mod = getTrigModule("unit-circle")!;
  const [angle, setAngle] = useState(45);
  const [autoRotate, setAutoRotate] = useState(false);
  const vrRef = useRef<HTMLDivElement>(null);
  const rad = angle * DEG_TO_RAD;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const tan = Math.abs(cos) > 0.001 ? sin / cos : Infinity;

  return (
    <TrigModuleShell
      module={mod}
      headerExtra={
        <button
          type="button"
          onClick={() => setAutoRotate((r) => !r)}
          className={`px-3 py-1.5 rounded-lg border text-xs ${autoRotate ? "bg-violet-500/20 border-violet-500/40 text-violet-300" : "bg-white/5 border-white/10"}`}
        >
          <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
          Spin
        </button>
      }
      sidebar={
        <>
          <SidebarSection title="Angle">
            <TrigSlider label="θ (degrees)" value={angle} min={0} max={360} step={1} unit="°" onChange={setAngle} />
            <p className="text-xs text-slate-500 mt-2">
              Radians: <span className="font-mono text-violet-300">{formatTrigValue(rad, 4)}</span>
            </p>
          </SidebarSection>
          <SidebarSection title="Values">
            <div className="space-y-2">
              <StatRow label="sin(θ)" value={formatTrigValue(sin)} accent="text-emerald-300" />
              <StatRow label="cos(θ)" value={formatTrigValue(cos)} accent="text-cyan-300" />
              <StatRow label="tan(θ)" value={Number.isFinite(tan) ? formatTrigValue(tan) : "undefined"} accent="text-amber-300" />
            </div>
          </SidebarSection>
          <SidebarSection title="Formula">
            <MathBlock>{`\\cos^2\\theta + \\sin^2\\theta = 1`}</MathBlock>
            <MathBlock>{`x = \\cos\\theta,\\quad y = \\sin\\theta`}</MathBlock>
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap containerRef={vrRef}>
        <UnitCircleScene angleDeg={angle} autoRotate={autoRotate} xrContainerRef={vrRef} xrMode="both" />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ TRIG FUNCTIONS ═══════════════ */
