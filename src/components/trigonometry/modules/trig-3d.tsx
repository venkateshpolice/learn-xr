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

export default function Trig3DModule() {
  const mod = getTrigModule("trig-3d")!;
  const [azimuth, setAzimuth] = useState(45);
  const [elevation, setElevation] = useState(30);
  const [radius, setRadius] = useState(2);
  const vrRef = useRef<HTMLDivElement>(null);

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Spherical coordinates">
            <TrigSlider label="Azimuth (φ)" value={azimuth} min={0} max={360} step={1} unit="°" onChange={setAzimuth} />
            <TrigSlider label="Elevation (θ)" value={elevation} min={-89} max={89} step={1} unit="°" onChange={setElevation} />
            <TrigSlider label="Radius (r)" value={radius} min={0.5} max={3} step={0.1} onChange={setRadius} />
          </SidebarSection>
          <SidebarSection title="Conversion">
            <MathBlock>{`x = r\\cos\\theta\\cos\\phi`}</MathBlock>
            <MathBlock>{`y = r\\sin\\theta`}</MathBlock>
            <MathBlock>{`z = r\\cos\\theta\\sin\\phi`}</MathBlock>
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap containerRef={vrRef}>
        <SphericalScene azimuthDeg={azimuth} elevationDeg={elevation} radius={radius} />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ VECTOR TRIG ═══════════════ */
