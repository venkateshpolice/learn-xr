"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, RotateCcw, X, HelpCircle, Rocket } from "lucide-react";
import { ROCKET_LAUNCH_QUIZ, ROCKET_LAUNCH_QUIZ_TITLE } from "@/data/rocket-launch-quiz";

interface RocketLaunchQuizProps {
  open: boolean;
  onClose: () => void;
  /** Quiz opened without starting the 3D experience */
  standalone?: boolean;
  onStartExperience?: () => void;
}

export function RocketLaunchQuiz({ open, onClose, standalone = false, onStartExperience }: RocketLaunchQuizProps) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = ROCKET_LAUNCH_QUIZ;
  const q = questions[idx];

  const reset = () => {
    setIdx(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  const handleClose = () => {
    onClose();
    reset();
  };

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

  if (!open) return null;

  const pct = Math.round((score / questions.length) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="w-full max-w-2xl max-h-[85dvh] overflow-y-auto glass-card rounded-2xl sm:rounded-3xl border border-orange-500/25 shadow-2xl shadow-black/40 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 rounded-t-2xl sm:rounded-t-3xl" />

          {/* Header */}
          <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-500/20 flex items-center justify-center border border-orange-500/20 shrink-0">
                <HelpCircle className="w-5 h-5 text-orange-300" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white truncate">{ROCKET_LAUNCH_QUIZ_TITLE}</h2>
                <p className="text-[10px] sm:text-xs text-slate-400">Test your knowledge of the full launch process</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
              aria-label="Close quiz"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {finished ? (
            <div className="p-6 sm:p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-600/25">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <p className="text-4xl mb-2">{pct >= 80 ? "🚀" : pct >= 60 ? "🌟" : "📚"}</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Mission Debrief Complete!</h3>
              <p className="text-slate-400 mb-1">
                You scored <span className="text-orange-300 font-semibold">{score}</span> out of{" "}
                <span className="text-white font-semibold">{questions.length}</span>
              </p>
              <p className="text-sm text-slate-500 mb-6">{pct}% — {pct >= 80 ? "Launch director material!" : pct >= 60 ? "Solid flight knowledge!" : "Review the stages and try again."}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 font-semibold text-sm transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry Quiz
                </button>
                {standalone && onStartExperience ? (
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      onStartExperience();
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 font-semibold text-sm transition-all"
                  >
                    <Rocket className="w-4 h-4" />
                    Begin 3D Launch
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 font-semibold text-sm transition-all"
                >
                  {standalone ? "Back to Menu" : "Back to Launch"}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              {/* Progress */}
              <div className="flex items-center justify-between text-[10px] sm:text-xs mb-3">
                <span className="text-slate-500">
                  Question <span className="text-white font-semibold">{idx + 1}</span> of {questions.length}
                </span>
                <span className="text-slate-500">
                  Score: <span className="text-orange-300 font-semibold">{score}</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-5">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                  style={{ width: `${((idx + (selected !== null ? 1 : 0)) / questions.length) * 100}%` }}
                />
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed mb-4">{q.question}</h3>

              <div className="space-y-2.5 mb-4">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.answer;
                  const isSelected = i === selected;
                  let cls = "bg-white/[0.03] border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5";
                  if (selected !== null && isSelected && isCorrect) cls = "bg-emerald-500/15 border-emerald-500/40";
                  else if (selected !== null && isSelected && !isCorrect) cls = "bg-red-500/15 border-red-500/40";
                  else if (selected !== null && isCorrect) cls = "bg-emerald-500/10 border-emerald-500/30";

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pick(i)}
                      disabled={selected !== null}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-center gap-3 text-sm ${cls}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[11px] font-bold text-slate-400 shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {selected !== null && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {selected !== null && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                      <span className="text-slate-200">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {selected !== null && q.hint && selected !== q.answer && (
                <p className="text-xs text-amber-300/90 bg-amber-500/10 rounded-lg p-3 mb-4 border border-amber-500/15">
                  💡 {q.hint}
                </p>
              )}

              {selected !== null && (
                <button
                  type="button"
                  onClick={next}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 font-semibold text-sm transition-all"
                >
                  {idx + 1 >= questions.length ? "Finish Quiz" : "Next Question"}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
