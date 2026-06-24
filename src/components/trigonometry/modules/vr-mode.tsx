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

export default function VRModeModule() {
  const mod = getTrigModule("vr-mode")!;
  const [angle, setAngle] = useState(45);
  const vrRef = useRef<HTMLDivElement>(null);

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="VR Instructions">
            <p className="text-xs text-slate-400 leading-relaxed">
              Click <strong className="text-cyan-300">Enter VR</strong> with a compatible headset.
              Explore the unit circle and 3D spherical coordinates in immersive VR.
            </p>
          </SidebarSection>
          <SidebarSection title="Scene">
            <TrigSlider label="Unit circle θ" value={angle} min={0} max={360} step={1} unit="°" onChange={setAngle} />
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap containerRef={vrRef}>
        <UnitCircleScene angleDeg={angle} xrContainerRef={vrRef} xrMode="vr" />
      </CanvasWrap>
    </TrigModuleShell>
  );
}
