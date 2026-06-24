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

export default function QuizModule() {
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
