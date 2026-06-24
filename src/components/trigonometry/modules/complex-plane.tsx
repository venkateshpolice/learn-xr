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

export default function ComplexPlaneModule() {
  const mod = getTrigModule("complex-plane")!;
  const [angle, setAngle] = useState(60);
  const [mag, setMag] = useState(1.5);
  const rad = angle * DEG_TO_RAD;
  const re = mag * Math.cos(rad);
  const im = mag * Math.sin(rad);

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Complex number">
            <TrigSlider label="|z| magnitude" value={mag} min={0.2} max={2.5} step={0.05} onChange={setMag} />
            <TrigSlider label="arg(z) angle" value={angle} min={0} max={360} step={1} unit="°" onChange={setAngle} />
          </SidebarSection>
          <SidebarSection title="Components">
            <StatRow label="Real (Re)" value={formatTrigValue(re)} accent="text-cyan-300" />
            <StatRow label="Imaginary (Im)" value={formatTrigValue(im)} accent="text-fuchsia-300" />
          </SidebarSection>
          <SidebarSection title="Euler's formula">
            <MathBlock>{`e^{i\\theta} = \\cos\\theta + i\\sin\\theta`}</MathBlock>
            <MathBlock>{`z = ${formatTrigValue(re)} + ${formatTrigValue(im)}i`}</MathBlock>
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap>
        <ComplexPlaneScene re={re} im={im} />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ 3D TRIG ═══════════════ */
