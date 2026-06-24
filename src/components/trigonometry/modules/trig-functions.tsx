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

export default function TrigFunctionsModule() {
  const mod = getTrigModule("trig-functions")!;
  const [showSin, setShowSin] = useState(true);
  const [showCos, setShowCos] = useState(true);
  const [showTan, setShowTan] = useState(false);

  const extraFns = useMemo(() => {
    const fns: { fn: (x: number) => number; color: string }[] = [];
    if (showCos) fns.push({ fn: Math.cos, color: "#22d3ee" });
    if (showTan) fns.push({ fn: Math.tan, color: "#fbbf24" });
    return fns;
  }, [showCos, showTan]);

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Show functions">
            {[
              { label: "sin(x)", checked: showSin, set: setShowSin, color: "text-violet-300" },
              { label: "cos(x)", checked: showCos, set: setShowCos, color: "text-cyan-300" },
              { label: "tan(x)", checked: showTan, set: setShowTan, color: "text-amber-300" },
            ].map(({ label, checked, set, color }) => (
              <label key={label} className="flex items-center gap-2 text-sm cursor-pointer mb-2">
                <input type="checkbox" checked={checked} onChange={(e) => set(e.target.checked)} className="accent-violet-500" />
                <span className={color}>{label}</span>
              </label>
            ))}
          </SidebarSection>
          <SidebarSection title="Key values">
            <MathBlock>{`\\sin(0)=0,\\; \\sin(\\frac{\\pi}{2})=1`}</MathBlock>
            <MathBlock>{`\\cos(0)=1,\\; \\cos(\\frac{\\pi}{2})=0`}</MathBlock>
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap>
        <TrigGraphScene fn={showSin ? Math.sin : () => 0} extraFns={extraFns} yMin={-2.5} yMax={2.5} />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ RIGHT TRIANGLE ═══════════════ */
