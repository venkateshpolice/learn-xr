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

export default function InverseTrigModule() {
  const mod = getTrigModule("inverse-trig")!;
  const [fn, setFn] = useState<"asin" | "acos" | "atan">("asin");
  const [input, setInput] = useState(0.5);

  const result = useMemo(() => {
    if (fn === "asin") return Math.asin(Math.min(1, Math.max(-1, input)));
    if (fn === "acos") return Math.acos(Math.min(1, Math.max(-1, input)));
    return Math.atan(input);
  }, [fn, input]);

  const graphFn = useMemo(() => {
    if (fn === "asin") return (x: number) => (x >= -1 && x <= 1 ? Math.asin(x) : NaN);
    if (fn === "acos") return (x: number) => (x >= -1 && x <= 1 ? Math.acos(x) : NaN);
    return (x: number) => Math.atan(x);
  }, [fn]);

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Function">
            <div className="flex gap-2 flex-wrap">
              {(["asin", "acos", "atan"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFn(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${fn === f ? "bg-rose-500/20 border-rose-500/40 text-rose-300" : "bg-white/5 border-white/10"}`}
                >
                  {f === "asin" ? "arcsin" : f === "acos" ? "arccos" : "arctan"}
                </button>
              ))}
            </div>
          </SidebarSection>
          <SidebarSection title="Input → Output">
            <TrigSlider label="Input x" value={input} min={-1} max={1} step={0.05} onChange={setInput} />
            <StatRow label="Angle (rad)" value={formatTrigValue(result, 4)} />
            <StatRow label="Angle (°)" value={formatTrigValue((result * 180) / Math.PI, 2)} accent="text-rose-300" />
          </SidebarSection>
          <SidebarSection title="Formula">
            <MathBlock>{`\\theta = \\${fn === "asin" ? "arcsin" : fn === "acos" ? "arccos" : "arctan"}(x)`}</MathBlock>
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap>
        <TrigGraphScene fn={graphFn} xMin={-1.2} xMax={1.2} yMin={-2} yMax={3.5} />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ IDENTITIES ═══════════════ */
