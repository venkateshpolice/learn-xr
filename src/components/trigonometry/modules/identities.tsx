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

export default function IdentitiesModule() {
  const mod = getTrigModule("identities")!;
  const [angle, setAngle] = useState(37);
  const rad = angle * DEG_TO_RAD;
  const sin2 = Math.sin(rad) ** 2;
  const cos2 = Math.cos(rad) ** 2;
  const sum = sin2 + cos2;
  const doubleSin = Math.sin(2 * rad);
  const doubleFormula = 2 * Math.sin(rad) * Math.cos(rad);

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Angle">
            <TrigSlider label="θ" value={angle} min={0} max={360} step={1} unit="°" onChange={setAngle} />
          </SidebarSection>
          <SidebarSection title="Pythagorean identity">
            <MathBlock>{`\\sin^2\\theta + \\cos^2\\theta = 1`}</MathBlock>
            <StatRow label="sin²θ" value={formatTrigValue(sin2, 4)} />
            <StatRow label="cos²θ" value={formatTrigValue(cos2, 4)} />
            <StatRow label="Sum" value={formatTrigValue(sum, 6)} accent={Math.abs(sum - 1) < 1e-10 ? "text-emerald-300" : "text-red-300"} />
          </SidebarSection>
          <SidebarSection title="Double angle">
            <MathBlock>{`\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta`}</MathBlock>
            <StatRow label="sin(2θ)" value={formatTrigValue(doubleSin, 4)} />
            <StatRow label="2 sin θ cos θ" value={formatTrigValue(doubleFormula, 4)} accent="text-amber-300" />
          </SidebarSection>
        </>
      }
    >
      <div className="flex items-center justify-center h-full p-8 bg-gradient-to-br from-[#0a0a18] to-[#1a1030]">
        <div className="max-w-lg space-y-6 text-center">
          <MathBlock>{`\\sin^2(${angle}°) + \\cos^2(${angle}°) = ${formatTrigValue(sum, 6)}`}</MathBlock>
          <MathBlock>{`\\sin(2 \\cdot ${angle}°) = ${formatTrigValue(doubleSin, 4)}`}</MathBlock>
          <p className="text-sm text-slate-400">Adjust θ in the sidebar — identities hold for every angle.</p>
        </div>
      </div>
    </TrigModuleShell>
  );
}

/* ═══════════════ TRANSFORMATIONS ═══════════════ */
