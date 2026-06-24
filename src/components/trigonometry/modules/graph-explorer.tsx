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

export default function GraphExplorerModule() {
  const mod = getTrigModule("graph-explorer")!;
  const [A, setA] = useState(1);
  const [B, setB] = useState(1);
  const [C, setC] = useState(0);
  const [D, setD] = useState(0);

  const fn = useCallback((x: number) => A * Math.sin(B * x + C) + D, [A, B, C, D]);

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Parameters">
            <div className="space-y-4">
              <TrigSlider label="A — amplitude" value={A} min={0.1} max={3} step={0.1} onChange={setA} />
              <TrigSlider label="B — frequency" value={B} min={0.25} max={4} step={0.25} onChange={setB} />
              <TrigSlider label="C — phase (rad)" value={C} min={-Math.PI} max={Math.PI} step={0.1} onChange={setC} />
              <TrigSlider label="D — vertical shift" value={D} min={-2} max={2} step={0.1} onChange={setD} />
            </div>
          </SidebarSection>
          <SidebarSection title="Equation">
            <MathBlock>{`y = ${A.toFixed(1)}\\sin(${B.toFixed(2)}x ${C >= 0 ? "+" : ""}${C.toFixed(2)}) ${D >= 0 ? "+" : ""}${D.toFixed(1)}`}</MathBlock>
            <p className="text-xs text-slate-500 mt-2">Period = {formatTrigValue((2 * Math.PI) / B, 2)} rad</p>
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap>
        <TrigGraphScene fn={fn} yMin={-4} yMax={4} />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ WAVE SIMULATOR ═══════════════ */
