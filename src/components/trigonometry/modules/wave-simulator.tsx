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

export default function WaveSimulatorModule() {
  const mod = getTrigModule("wave-simulator")!;
  const [amplitude, setAmplitude] = useState(0.5);
  const [frequency, setFrequency] = useState(1.5);
  const [phase, setPhase] = useState(0);
  const [speed, setSpeed] = useState(1);
  const vrRef = useRef<HTMLDivElement>(null);

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Wave parameters">
            <div className="space-y-4">
              <TrigSlider label="Amplitude (A)" value={amplitude} min={0.1} max={1.5} step={0.05} onChange={setAmplitude} />
              <TrigSlider label="Frequency (k)" value={frequency} min={0.5} max={4} step={0.1} onChange={setFrequency} />
              <TrigSlider label="Phase (φ)" value={phase} min={0} max={Math.PI * 2} step={0.1} onChange={setPhase} />
              <TrigSlider label="Speed" value={speed} min={0} max={3} step={0.1} onChange={setSpeed} />
            </div>
          </SidebarSection>
          <SidebarSection title="Equation">
            <MathBlock>{`z = A\\sin(kx + \\phi - \\omega t)`}</MathBlock>
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap containerRef={vrRef}>
        <WaveScene amplitude={amplitude} frequency={frequency} phase={phase} speed={speed} />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ INVERSE TRIG ═══════════════ */
