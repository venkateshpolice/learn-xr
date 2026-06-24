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

export default function FormulaLibraryModule() {
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
