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

export default function TransformationsModule() {
  const mod = getTrigModule("transformations")!;
  const [shiftX, setShiftX] = useState(0);
  const [shiftY, setShiftY] = useState(0);
  const [scaleY, setScaleY] = useState(1);

  const base = useCallback((x: number) => Math.sin(x), []);
  const transformed = useCallback((x: number) => scaleY * Math.sin(x - shiftX) + shiftY, [shiftX, shiftY, scaleY]);

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Transform">
            <div className="space-y-4">
              <TrigSlider label="Horizontal shift" value={shiftX} min={-3} max={3} step={0.1} onChange={setShiftX} />
              <TrigSlider label="Vertical shift" value={shiftY} min={-2} max={2} step={0.1} onChange={setShiftY} />
              <TrigSlider label="Vertical stretch" value={scaleY} min={0.25} max={3} step={0.1} onChange={setScaleY} />
            </div>
          </SidebarSection>
          <SidebarSection title="Equation">
            <MathBlock>{`y = ${scaleY.toFixed(1)}\\sin(x ${shiftX >= 0 ? "-" : "+"}${Math.abs(shiftX).toFixed(1)}) ${shiftY >= 0 ? "+" : ""}${shiftY.toFixed(1)}`}</MathBlock>
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap>
        <TrigGraphScene fn={transformed} extraFns={[{ fn: base, color: "#475569" }]} yMin={-4} yMax={4} />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ POLAR ═══════════════ */
