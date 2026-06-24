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

export default function VectorTrigModule() {
  const mod = getTrigModule("vector-trig")!;
  const [ax, setAx] = useState(2);
  const [ay, setAy] = useState(1);
  const [bx, setBx] = useState(1);
  const [by, setBy] = useState(2);

  const dot = ax * bx + ay * by;
  const magA = Math.sqrt(ax * ax + ay * ay);
  const magB = Math.sqrt(bx * bx + by * by);
  const angleDeg = magA > 0 && magB > 0 ? (Math.acos(Math.min(1, dot / (magA * magB))) * 180) / Math.PI : 0;

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Vector a">
            <TrigSlider label="aₓ" value={ax} min={-3} max={3} step={0.1} onChange={setAx} />
            <TrigSlider label="aᵧ" value={ay} min={-3} max={3} step={0.1} onChange={setAy} />
          </SidebarSection>
          <SidebarSection title="Vector b">
            <TrigSlider label="bₓ" value={bx} min={-3} max={3} step={0.1} onChange={setBx} />
            <TrigSlider label="bᵧ" value={by} min={-3} max={3} step={0.1} onChange={setBy} />
          </SidebarSection>
          <SidebarSection title="Results">
            <StatRow label="a · b" value={formatTrigValue(dot)} />
            <StatRow label="Angle θ" value={`${formatTrigValue(angleDeg, 1)}°`} accent="text-lime-300" />
          </SidebarSection>
          <SidebarSection title="Formula">
            <MathBlock>{`\\cos\\theta = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}||\\vec{b}|}`}</MathBlock>
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap>
        <VectorScene ax={ax} ay={ay} az={0} bx={bx} by={by} bz={0} />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ QUIZ ═══════════════ */
