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

export default function RightTriangleModule() {
  const mod = getTrigModule("right-triangle")!;
  const [angle, setAngle] = useState(35);
  const rad = angle * DEG_TO_RAD;
  const hyp = 1;
  const opp = hyp * Math.sin(rad);
  const adj = hyp * Math.cos(rad);

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Angle">
            <TrigSlider label="θ" value={angle} min={5} max={85} step={1} unit="°" onChange={setAngle} />
          </SidebarSection>
          <SidebarSection title="Ratios (hyp = 1)">
            <StatRow label="opposite" value={formatTrigValue(opp)} accent="text-emerald-300" />
            <StatRow label="adjacent" value={formatTrigValue(adj)} accent="text-cyan-300" />
            <StatRow label="sin θ = opp/hyp" value={formatTrigValue(opp)} />
            <StatRow label="cos θ = adj/hyp" value={formatTrigValue(adj)} />
            <StatRow label="tan θ = opp/adj" value={formatTrigValue(opp / adj)} />
          </SidebarSection>
          <SidebarSection title="SOH CAH TOA">
            <MathBlock>{`\\sin\\theta = \\frac{\\text{opposite}}{\\text{hypotenuse}}`}</MathBlock>
            <MathBlock>{`\\cos\\theta = \\frac{\\text{adjacent}}{\\text{hypotenuse}}`}</MathBlock>
            <MathBlock>{`\\tan\\theta = \\frac{\\text{opposite}}{\\text{adjacent}}`}</MathBlock>
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap>
        <RightTriangleScene angleDeg={angle} />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ GRAPH EXPLORER ═══════════════ */
