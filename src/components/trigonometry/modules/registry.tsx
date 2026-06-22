"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
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
  defaultCanvasProps,
} from "@/components/trigonometry/scenes/trig-scenes";
import {
  getTrigModule,
  formatTrigValue,
  DEG_TO_RAD,
  type TrigModuleId,
} from "@/data/trigonometry-modules";
import { TRIG_FORMULAS, TRIG_QUIZ, TRIG_CHALLENGES } from "@/data/trigonometry-content";
import { RotateCcw, CheckCircle, XCircle, Timer, Grid3x3 } from "lucide-react";
import { SceneViewBridge } from "@/components/trigonometry/scenes/SceneViewBridge";

function CanvasWrap({
  children,
  containerRef,
}: {
  children: React.ReactNode;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[50vh] relative">
      <button
        type="button"
        onClick={() => setShowGrid((g) => !g)}
        className={`absolute top-3 right-3 z-10 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
          showGrid
            ? "bg-indigo-500/25 border-indigo-500/40 text-indigo-200"
            : "bg-black/50 border-white/15 text-slate-400 hover:text-white"
        }`}
        title="Toggle coordinate grid"
      >
        <Grid3x3 className="w-3.5 h-3.5" />
        Grid
      </button>
      <Canvas {...defaultCanvasProps()}>
        <SceneViewBridge showGrid={showGrid}>{children}</SceneViewBridge>
      </Canvas>
    </div>
  );
}

/* ═══════════════ UNIT CIRCLE ═══════════════ */
export function UnitCircleModule() {
  const mod = getTrigModule("unit-circle")!;
  const [angle, setAngle] = useState(45);
  const [autoRotate, setAutoRotate] = useState(false);
  const vrRef = useRef<HTMLDivElement>(null);
  const rad = angle * DEG_TO_RAD;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const tan = Math.abs(cos) > 0.001 ? sin / cos : Infinity;

  return (
    <TrigModuleShell
      module={mod}
      headerExtra={
        <button
          type="button"
          onClick={() => setAutoRotate((r) => !r)}
          className={`px-3 py-1.5 rounded-lg border text-xs ${autoRotate ? "bg-violet-500/20 border-violet-500/40 text-violet-300" : "bg-white/5 border-white/10"}`}
        >
          <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
          Spin
        </button>
      }
      sidebar={
        <>
          <SidebarSection title="Angle">
            <TrigSlider label="θ (degrees)" value={angle} min={0} max={360} step={1} unit="°" onChange={setAngle} />
            <p className="text-xs text-slate-500 mt-2">
              Radians: <span className="font-mono text-violet-300">{formatTrigValue(rad, 4)}</span>
            </p>
          </SidebarSection>
          <SidebarSection title="Values">
            <div className="space-y-2">
              <StatRow label="sin(θ)" value={formatTrigValue(sin)} accent="text-emerald-300" />
              <StatRow label="cos(θ)" value={formatTrigValue(cos)} accent="text-cyan-300" />
              <StatRow label="tan(θ)" value={Number.isFinite(tan) ? formatTrigValue(tan) : "undefined"} accent="text-amber-300" />
            </div>
          </SidebarSection>
          <SidebarSection title="Formula">
            <MathBlock>{`\\cos^2\\theta + \\sin^2\\theta = 1`}</MathBlock>
            <MathBlock>{`x = \\cos\\theta,\\quad y = \\sin\\theta`}</MathBlock>
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap containerRef={vrRef}>
        <UnitCircleScene angleDeg={angle} autoRotate={autoRotate} xrContainerRef={vrRef} xrMode="both" />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ TRIG FUNCTIONS ═══════════════ */
export function TrigFunctionsModule() {
  const mod = getTrigModule("trig-functions")!;
  const [showSin, setShowSin] = useState(true);
  const [showCos, setShowCos] = useState(true);
  const [showTan, setShowTan] = useState(false);

  const extraFns = useMemo(() => {
    const fns: { fn: (x: number) => number; color: string }[] = [];
    if (showCos) fns.push({ fn: Math.cos, color: "#22d3ee" });
    if (showTan) fns.push({ fn: Math.tan, color: "#fbbf24" });
    return fns;
  }, [showCos, showTan]);

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Show functions">
            {[
              { label: "sin(x)", checked: showSin, set: setShowSin, color: "text-violet-300" },
              { label: "cos(x)", checked: showCos, set: setShowCos, color: "text-cyan-300" },
              { label: "tan(x)", checked: showTan, set: setShowTan, color: "text-amber-300" },
            ].map(({ label, checked, set, color }) => (
              <label key={label} className="flex items-center gap-2 text-sm cursor-pointer mb-2">
                <input type="checkbox" checked={checked} onChange={(e) => set(e.target.checked)} className="accent-violet-500" />
                <span className={color}>{label}</span>
              </label>
            ))}
          </SidebarSection>
          <SidebarSection title="Key values">
            <MathBlock>{`\\sin(0)=0,\\; \\sin(\\frac{\\pi}{2})=1`}</MathBlock>
            <MathBlock>{`\\cos(0)=1,\\; \\cos(\\frac{\\pi}{2})=0`}</MathBlock>
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap>
        <TrigGraphScene fn={showSin ? Math.sin : () => 0} extraFns={extraFns} yMin={-2.5} yMax={2.5} />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ RIGHT TRIANGLE ═══════════════ */
export function RightTriangleModule() {
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
export function GraphExplorerModule() {
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
export function WaveSimulatorModule() {
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
export function InverseTrigModule() {
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
export function IdentitiesModule() {
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
export function TransformationsModule() {
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
export function PolarModule() {
  const mod = getTrigModule("polar-coordinates")!;
  const [preset, setPreset] = useState<"rose" | "cardioid" | "spiral">("rose");

  const curve = useMemo(() => {
    if (preset === "rose") return (t: number) => Math.cos(3 * t);
    if (preset === "cardioid") return (t: number) => 1 + Math.cos(t);
    return (t: number) => t / (2 * Math.PI);
  }, [preset]);

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Curve preset">
            {(["rose", "cardioid", "spiral"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1.5 border ${preset === p ? "bg-blue-500/20 border-blue-500/40 text-blue-300" : "bg-white/5 border-white/10"}`}
              >
                {p === "rose" ? "Rose: r = cos(3θ)" : p === "cardioid" ? "Cardioid: r = 1 + cos(θ)" : "Spiral: r = θ/2π"}
              </button>
            ))}
          </SidebarSection>
          <SidebarSection title="Polar ↔ Cartesian">
            <MathBlock>{`x = r\\cos\\theta,\\quad y = r\\sin\\theta`}</MathBlock>
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap>
        <PolarScene curve={curve} maxR={2} />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ COMPLEX PLANE ═══════════════ */
export function ComplexPlaneModule() {
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
export function Trig3DModule() {
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
export function VectorTrigModule() {
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
export function QuizModule() {
  const mod = getTrigModule("quiz")!;
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const q = TRIG_QUIZ[idx];

  const pick = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    setIdx((i) => (i + 1) % TRIG_QUIZ.length);
    setSelected(null);
  };

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Progress">
            <StatRow label="Score" value={`${score} / ${TRIG_QUIZ.length}`} accent="text-pink-300" />
            <StatRow label="Question" value={`${idx + 1} of ${TRIG_QUIZ.length}`} />
          </SidebarSection>
          {q.hint && selected !== null && selected !== q.answer && (
            <SidebarSection title="Hint">
              <p className="text-xs text-slate-400">{q.hint}</p>
            </SidebarSection>
          )}
        </>
      }
    >
      <div className="flex items-center justify-center h-full p-6">
        <div className="max-w-xl w-full space-y-6">
          <h2 className="text-lg font-bold">{q.question}</h2>
          {q.formula && <MathBlock>{q.formula}</MathBlock>}
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.answer;
              const isSelected = i === selected;
              let cls = "bg-white/[0.03] border-white/10 hover:border-pink-500/30";
              if (selected !== null && isSelected && isCorrect) cls = "bg-emerald-500/15 border-emerald-500/40";
              else if (selected !== null && isSelected && !isCorrect) cls = "bg-red-500/15 border-red-500/40";
              else if (selected !== null && isCorrect) cls = "bg-emerald-500/10 border-emerald-500/30";
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(i)}
                  disabled={selected !== null}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${cls}`}
                >
                  {selected !== null && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {selected !== null && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <button type="button" onClick={next} className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-500 font-semibold text-sm">
              Next Question
            </button>
          )}
        </div>
      </div>
    </TrigModuleShell>
  );
}

/* ═══════════════ CHALLENGE ═══════════════ */
export function ChallengeModule() {
  const mod = getTrigModule("challenge")!;
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "fail" | null>(null);

  const ch = TRIG_CHALLENGES[idx];

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, idx]);

  const submit = () => {
    const num = parseFloat(input.trim());
    const ok =
      (!Number.isNaN(num) && Math.abs(num - Number(ch.answer)) < 0.08) ||
      input.trim().toLowerCase() === String(ch.answer).toLowerCase();
    setFeedback(ok ? "ok" : "fail");
    if (ok) setScore((s) => s + 1);
    setTimeout(() => {
      setIdx((i) => (i + 1) % TRIG_CHALLENGES.length);
      setInput("");
      setFeedback(null);
      setTimeLeft(30);
    }, 1200);
  };

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Challenge">
            <StatRow label="Score" value={String(score)} accent="text-amber-300" />
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
              <Timer className="w-4 h-4 text-amber-400" />
              <span className={`font-mono text-lg ${timeLeft <= 10 ? "text-red-400" : "text-amber-300"}`}>{timeLeft}s</span>
            </div>
          </SidebarSection>
        </>
      }
    >
      <div className="flex items-center justify-center h-full p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <p className="text-xl font-bold">{ch.prompt}</p>
          {ch.formula && <MathBlock>{ch.formula}</MathBlock>}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Your answer"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-center font-mono text-lg focus:outline-none focus:border-amber-500/50"
          />
          <button type="button" onClick={submit} className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 font-semibold">
            Submit
          </button>
          {feedback === "ok" && <p className="text-emerald-400">Correct!</p>}
          {feedback === "fail" && <p className="text-red-400">Answer: {ch.answer}</p>}
        </div>
      </div>
    </TrigModuleShell>
  );
}

/* ═══════════════ FORMULA LIBRARY ═══════════════ */
export function FormulaLibraryModule() {
  const mod = getTrigModule("formula-library")!;
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string>("all");

  const filtered = useMemo(() => {
    return TRIG_FORMULAS.filter((f) => {
      const matchCat = cat === "all" || f.category === cat;
      const matchSearch =
        !search ||
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        f.latex.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, cat]);

  const categories = ["all", ...new Set(TRIG_FORMULAS.map((f) => f.category))];

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="Search">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search formulas…"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-violet-500/40"
            />
          </SidebarSection>
          <SidebarSection title="Category">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`px-2.5 py-1 rounded-full text-xs border ${cat === c ? "bg-violet-500/25 border-violet-500/40 text-violet-300" : "bg-white/5 border-white/10 text-slate-400"}`}
                >
                  {c === "all" ? "All" : c}
                </button>
              ))}
            </div>
          </SidebarSection>
        </>
      }
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto grid gap-4 sm:grid-cols-2">
          {filtered.map((f) => (
            <div key={f.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <p className="text-sm font-semibold text-violet-300 mb-2">{f.title}</p>
              <MathBlock>{f.latex}</MathBlock>
              {f.note && <p className="text-xs text-slate-500 mt-2">{f.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </TrigModuleShell>
  );
}

/* ═══════════════ AR MODE ═══════════════ */
export function ARModeModule() {
  const mod = getTrigModule("ar-mode")!;
  const [angle, setAngle] = useState(45);
  const vrRef = useRef<HTMLDivElement>(null);

  return (
    <TrigModuleShell
      module={mod}
      sidebar={
        <>
          <SidebarSection title="AR Instructions">
            <p className="text-xs text-slate-400 leading-relaxed">
              Tap <strong className="text-emerald-300">Enter AR</strong> to place the unit circle in your room.
              Requires a WebXR-compatible AR device (Android Chrome recommended).
            </p>
          </SidebarSection>
          <SidebarSection title="Angle">
            <TrigSlider label="θ" value={angle} min={0} max={360} step={1} unit="°" onChange={setAngle} />
          </SidebarSection>
        </>
      }
    >
      <CanvasWrap containerRef={vrRef}>
        <UnitCircleScene angleDeg={angle} xrContainerRef={vrRef} xrMode="ar" />
      </CanvasWrap>
    </TrigModuleShell>
  );
}

/* ═══════════════ VR MODE ═══════════════ */
export function VRModeModule() {
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

/* ═══════════════ REGISTRY ═══════════════ */
export const TRIG_MODULE_COMPONENTS: Record<TrigModuleId, React.ComponentType> = {
  "unit-circle": UnitCircleModule,
  "trig-functions": TrigFunctionsModule,
  "right-triangle": RightTriangleModule,
  "graph-explorer": GraphExplorerModule,
  "wave-simulator": WaveSimulatorModule,
  "inverse-trig": InverseTrigModule,
  identities: IdentitiesModule,
  transformations: TransformationsModule,
  "polar-coordinates": PolarModule,
  "complex-plane": ComplexPlaneModule,
  "trig-3d": Trig3DModule,
  "vector-trig": VectorTrigModule,
  quiz: QuizModule,
  challenge: ChallengeModule,
  "formula-library": FormulaLibraryModule,
  "ar-mode": ARModeModule,
  "vr-mode": VRModeModule,
};
