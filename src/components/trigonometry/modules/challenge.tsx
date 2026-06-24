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

export default function ChallengeModule() {
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
