"use client";

import { useState } from "react";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import type { McqQuestion } from "@/data/ncert-mcq";

interface QuizPanelProps {
  questions: McqQuestion[];
  title: string;
}

export function QuizPanel({ questions, title }: QuizPanelProps) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[idx];

  const pick = (i: number) => {
    if (selected !== null || finished) return;
    setSelected(i);
    if (i === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
  };

  const restart = () => {
    setIdx(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="glass-card rounded-3xl p-8 text-center max-w-lg mx-auto">
        <div className="text-5xl mb-4">{pct >= 70 ? "🌟" : pct >= 40 ? "👍" : "📚"}</div>
        <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
        <p className="text-slate-400 mb-4">
          You scored {score} out of {questions.length} ({pct}%)
        </p>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-6">
      <div className="glass-card rounded-2xl p-5 h-fit space-y-4">
        <h3 className="font-semibold text-sm text-slate-300">{title}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Score</span>
            <span className="text-emerald-300 font-semibold">
              {score} / {questions.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Question</span>
            <span className="text-white font-semibold">
              {idx + 1} of {questions.length}
            </span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
            style={{ width: `${((idx + (selected !== null ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        {q.hint && selected !== null && selected !== q.answer && (
          <p className="text-xs text-amber-300/90 bg-amber-500/10 rounded-lg p-3">{q.hint}</p>
        )}
      </div>

      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold mb-6">{q.question}</h2>
        <div className="space-y-3 mb-6">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.answer;
            const isSelected = i === selected;
            let cls = "bg-white/[0.03] border-white/10 hover:border-indigo-500/30";
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
          <button
            type="button"
            onClick={next}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm"
          >
            {idx + 1 >= questions.length ? "Finish Quiz" : "Next Question"}
          </button>
        )}
      </div>
    </div>
  );
}
