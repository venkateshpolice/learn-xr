"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Beaker,
  BookOpen,
  ChevronRight,
  Eye,
  FlaskConical,
  Layers,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Volume2,
  HelpCircle,
  Link2,
  Move3D,
  CheckCircle2,
  XCircle,
  Glasses,
  Search,
  Loader2,
  Unlink,
  FilePlus2,
  AlertTriangle,
  Wand2,
} from "lucide-react";
import MoleculeScene, { type ViewMode } from "@/components/chemistry/MoleculeScene";
import BondBuilderPanel from "@/components/chemistry/BondBuilderPanel";
import {
  MOLECULES,
  ELEMENTS,
  BUILDER_ELEMENTS,
  QUIZ_QUESTIONS,
  cloneMolecule,
  getMoleculeById,
  type AtomDef,
  type BondDef,
  type ElementSymbol,
  type GradeBand,
  type MoleculeDef,
} from "@/data/molecules-data";
import {
  identifyCompound,
  computeHillFormula,
  formatFormulaDisplay,
  countValenceWarnings,
  inferBondType,
  type CompoundIdentification,
} from "@/lib/molecule-chemistry";
import { buildFromFormula, snapAtomsForBond, BOND_SNAP_LENGTH } from "@/lib/formula-builder";

type Tab = "library" | "builder" | "quiz";

const GRADE_LABELS: Record<GradeBand, string> = {
  middle: "Middle School",
  secondary: "Secondary",
  senior: "Senior Secondary",
};

function speak(text: string) {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    }
  } catch {}
}

function nextAtomPosition(count: number, anchor?: [number, number, number]): [number, number, number] {
  if (anchor) {
    const angle = count * 1.4;
    return [
      anchor[0] + Math.cos(angle) * BOND_SNAP_LENGTH,
      anchor[1] + Math.sin(count * 0.5) * 0.3,
      anchor[2] + Math.sin(angle) * BOND_SNAP_LENGTH * 0.5,
    ];
  }
  const angle = count * 1.15;
  const r = 1.2 + count * 0.08;
  return [Math.cos(angle) * r, Math.sin(count * 0.6) * 0.4, Math.sin(angle) * r];
}

export default function ChemistryLabPage() {
  const vrRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<Tab>("library");
  const [activeMoleculeId, setActiveMoleculeId] = useState("water");
  const [atoms, setAtoms] = useState<AtomDef[]>(() => cloneMolecule(getMoleculeById("water")!).atoms);
  const [bonds, setBonds] = useState<BondDef[]>(() => cloneMolecule(getMoleculeById("water")!).bonds);
  const [viewMode, setViewMode] = useState<ViewMode>("ball-stick");
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedAtom, setSelectedAtom] = useState<number | null>(null);
  const [gradeFilter, setGradeFilter] = useState<GradeBand | "all">("all");
  const [builderElement, setBuilderElement] = useState<ElementSymbol>("C");
  const [bondMode, setBondMode] = useState(false);
  const [bondFrom, setBondFrom] = useState<number | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [bondOrder, setBondOrder] = useState<1 | 2 | 3>(1);
  const [identification, setIdentification] = useState<CompoundIdentification | null>(() => {
    const water = getMoleculeById("water")!;
    return {
      name: water.name,
      formula: "H2O",
      formulaDisplay: water.formula,
      description: water.description,
      bondType: water.bondType,
      category: water.category,
      source: "library",
    };
  });
  const [identifying, setIdentifying] = useState(false);
  const identifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [formulaInput, setFormulaInput] = useState("");
  const [formulaError, setFormulaError] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);

  const activeMolecule = activeMoleculeId !== "custom" ? getMoleculeById(activeMoleculeId) : undefined;

  const valenceWarnings = useMemo(() => countValenceWarnings(atoms, bonds), [atoms, bonds]);
  const liveFormula = useMemo(() => computeHillFormula(atoms), [atoms]);
  const liveFormulaDisplay = useMemo(() => formatFormulaDisplay(liveFormula), [liveFormula]);

  const runIdentification = useCallback(async (currentAtoms: AtomDef[], currentBonds: BondDef[]) => {
    setIdentifying(true);
    try {
      const result = await identifyCompound(currentAtoms, currentBonds);
      setIdentification(result);
    } finally {
      setIdentifying(false);
    }
  }, []);

  useEffect(() => {
    if (identifyTimer.current) clearTimeout(identifyTimer.current);
    identifyTimer.current = setTimeout(() => {
      runIdentification(atoms, bonds);
    }, 500);
    return () => {
      if (identifyTimer.current) clearTimeout(identifyTimer.current);
    };
  }, [atoms, bonds, runIdentification]);

  const filteredMolecules = useMemo(
    () => MOLECULES.filter((m) => gradeFilter === "all" || m.grade === gradeFilter),
    [gradeFilter],
  );

  const loadMolecule = useCallback((mol: MoleculeDef) => {
    const cloned = cloneMolecule(mol);
    setActiveMoleculeId(mol.id);
    setAtoms(cloned.atoms);
    setBonds(cloned.bonds);
    setSelectedAtom(null);
    setBondFrom(null);
    setBondMode(false);
    setIdentification({
      name: mol.name,
      formula: computeHillFormula(cloned.atoms),
      formulaDisplay: mol.formula,
      description: mol.description,
      bondType: mol.bondType,
      category: mol.category,
      source: "library",
    });
    setTab("library");
  }, []);

  const startNewMolecule = useCallback(() => {
    setActiveMoleculeId("custom");
    setAtoms([]);
    setBonds([]);
    setSelectedAtom(null);
    setBondFrom(null);
    setBondMode(false);
    setTab("builder");
  }, []);

  const resetBuilder = useCallback(() => {
    const water = getMoleculeById("water")!;
    loadMolecule(water);
    setTab("builder");
  }, [loadMolecule]);

  const addAtom = useCallback(() => {
    setAtoms((prev) => {
      const anchor =
        selectedAtom !== null ? prev[selectedAtom]?.position : prev.length > 0 ? prev[prev.length - 1].position : undefined;
      return [
        ...prev,
        { element: builderElement, position: nextAtomPosition(prev.length, anchor) },
      ];
    });
    setActiveMoleculeId("custom");
  }, [builderElement, selectedAtom]);

  const buildFromFormulaInput = useCallback(async () => {
    setFormulaError(null);
    setBuilding(true);
    try {
      const result = await buildFromFormula(formulaInput);
      if (!result.ok) {
        setFormulaError(result.error);
        return;
      }
      setFormulaInput(result.formulaConventional);
      setAtoms(result.atoms);
      setBonds(result.bonds);
      setActiveMoleculeId(result.molecule?.id ?? "custom");
      setSelectedAtom(null);
      setBondFrom(null);
      setBondMode(false);

      if (result.molecule) {
        setIdentification({
          name: result.molecule.name,
          formula: result.formula,
          formulaDisplay: result.formulaDisplay || result.molecule.formula,
          description: result.molecule.description,
          bondType: result.molecule.bondType,
          category: result.molecule.category,
          source: result.source === "pubchem" ? "pubchem" : result.source === "generated" ? "generated" : "library",
          cid: result.cid,
        });
      } else {
        const id = await identifyCompound(result.atoms, result.bonds);
        setIdentification({
          ...id,
          formulaDisplay: result.formulaDisplay,
          source: result.source === "pubchem" ? "pubchem" : result.source === "generated" ? "generated" : id.source,
          cid: result.cid,
        });
      }
      setTab("builder");
    } finally {
      setBuilding(false);
    }
  }, [formulaInput]);

  const removeSelectedAtom = useCallback(() => {
    if (selectedAtom === null) return;
    setAtoms((prev) => prev.filter((_, i) => i !== selectedAtom));
    setBonds((prev) =>
      prev
        .filter((b) => b.from !== selectedAtom && b.to !== selectedAtom)
        .map((b) => ({
          ...b,
          from: b.from > selectedAtom ? b.from - 1 : b.from,
          to: b.to > selectedAtom ? b.to - 1 : b.to,
        })),
    );
    setSelectedAtom(null);
    setBondFrom(null);
    setActiveMoleculeId("custom");
  }, [selectedAtom]);

  const nudgeAtom = useCallback(
    (axis: 0 | 1 | 2, delta: number) => {
      if (selectedAtom === null) return;
      setAtoms((prev) =>
        prev.map((a, i) => {
          if (i !== selectedAtom) return a;
          const pos = [...a.position] as [number, number, number];
          pos[axis] += delta;
          return { ...a, position: pos };
        }),
      );
      setActiveMoleculeId("custom");
    },
    [selectedAtom],
  );

  const handleAtomSelect = useCallback(
    (index: number | null) => {
      if (bondMode && index !== null) {
        if (bondFrom === null) {
          setBondFrom(index);
          setSelectedAtom(index);
        } else if (bondFrom !== index) {
          setAtoms((prev) => snapAtomsForBond(prev, bondFrom, index, bondOrder));
          setBonds((prev) => {
            const exists = prev.findIndex(
              (b) =>
                (b.from === bondFrom && b.to === index) || (b.from === index && b.to === bondFrom),
            );
            if (exists >= 0) {
              const next = [...prev];
              next[exists] = { ...next[exists], order: bondOrder };
              return next;
            }
            return [...prev, { from: bondFrom, to: index, order: bondOrder }];
          });
          setBondFrom(null);
          setBondMode(false);
          setSelectedAtom(index);
          setActiveMoleculeId("custom");
        }
        return;
      }
      setSelectedAtom(index);
    },
    [bondMode, bondFrom, bondOrder],
  );

  const removeBondAt = useCallback(
    (atomA: number, atomB: number) => {
      setBonds((prev) =>
        prev.filter(
          (b) =>
            !((b.from === atomA && b.to === atomB) || (b.from === atomB && b.to === atomA)),
        ),
      );
      setActiveMoleculeId("custom");
    },
    [],
  );

  const cycleBondOrder = useCallback(() => {
    if (selectedAtom === null) return;
    setBonds((prev) =>
      prev.map((b) => {
        if (b.from !== selectedAtom && b.to !== selectedAtom) return b;
        const next = ((b.order % 3) + 1) as 1 | 2 | 3;
        return { ...b, order: next };
      }),
    );
    setActiveMoleculeId("custom");
  }, [selectedAtom]);

  const connectedBonds = useMemo(() => {
    if (selectedAtom === null) return [];
    return bonds
      .map((b, i) => {
        if (b.from === selectedAtom) return { index: i, partner: b.to, order: b.order };
        if (b.to === selectedAtom) return { index: i, partner: b.from, order: b.order };
        return null;
      })
      .filter(Boolean) as { index: number; partner: number; order: number }[];
  }, [bonds, selectedAtom]);

  const handleQuizAnswer = (optionIndex: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(optionIndex);
    const q = QUIZ_QUESTIONS[quizIndex];
    if (optionIndex === q.answer) setQuizScore((s) => s + 1);
  };

  const nextQuiz = () => {
    setQuizIndex((i) => (i + 1) % QUIZ_QUESTIONS.length);
    setQuizAnswer(null);
    setShowHint(false);
  };

  const displayName =
    identification?.name ??
    (activeMolecule?.name ?? (atoms.length ? "Identifying…" : "New Molecule"));
  const displayFormula =
    identification?.formulaDisplay ?? activeMolecule?.formula ?? liveFormulaDisplay;
  const displayDescription =
    identification?.description ?? activeMolecule?.description;
  const displayBondType =
    identification?.bondType ?? activeMolecule?.bondType ?? inferBondType(atoms, bonds);
  const displayCategory = identification?.category ?? activeMolecule?.category;

  return (
    <div className="h-screen bg-[#070b14] text-white flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-white/10 bg-[#0a1020]/90 backdrop-blur-md z-30">
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Home</span>
            </Link>
            <div className="h-5 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm sm:text-base truncate">Interactive Chemistry Lab</h1>
                <p className="text-xs text-slate-400 truncate hidden sm:block">
                  Build & explore molecules in 3D · WebXR ready
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode((v) => (v === "ball-stick" ? "spacefill" : "ball-stick"))}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              {viewMode === "ball-stick" ? "Ball & Stick" : "Space Fill"}
            </button>
            <button
              type="button"
              onClick={() => setAutoRotate((r) => !r)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                autoRotate
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Spin
            </button>
          </div>
        </div>

        <div className="flex justify-center px-4 pb-2">
          <div className="inline-flex gap-1 overflow-x-auto max-w-full">
          {(
            [
              { id: "library" as Tab, label: "Molecule Library", icon: BookOpen },
              { id: "builder" as Tab, label: "Bond Builder", icon: Beaker },
              { id: "quiz" as Tab, label: "Quick Quiz", icon: HelpCircle },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === id
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left panel */}
        <AnimatePresence initial={false}>
          {leftOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 self-stretch h-full min-h-0 border-r border-white/10 bg-[#0c1222]/95 overflow-hidden hidden md:flex flex-col"
            >
              <div className="w-[300px] flex flex-col flex-1 min-h-0 h-full">
                {tab === "library" && (
                  <>
                    <div className="shrink-0 p-4 pb-3 border-b border-white/10">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Filter by level
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(["all", "middle", "secondary", "senior"] as const).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGradeFilter(g)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              gradeFilter === g
                                ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40"
                                : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                            }`}
                          >
                            {g === "all" ? "All" : GRADE_LABELS[g]}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-3">
                        {filteredMolecules.length} molecule{filteredMolecules.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-4 space-y-2">
                      {filteredMolecules.map((mol) => (
                        <button
                          key={mol.id}
                          type="button"
                          onClick={() => loadMolecule(mol)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            activeMoleculeId === mol.id
                              ? "bg-emerald-500/15 border-emerald-500/40"
                              : "bg-white/[0.03] border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.06]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm">{mol.name}</span>
                            <span className="text-emerald-400 font-mono text-sm shrink-0">{mol.formula}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{mol.description}</p>
                          <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                            {GRADE_LABELS[mol.grade]} · {mol.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {tab === "builder" && (
                  <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-4">
                    <BondBuilderPanel
                      formulaInput={formulaInput}
                      formulaError={formulaError}
                      building={building}
                      identifying={identifying}
                      displayName={displayName}
                      displayFormula={displayFormula}
                      identificationSource={identification?.source}
                      builderElement={builderElement}
                      bondOrder={bondOrder}
                      bondMode={bondMode}
                      bondFrom={bondFrom}
                      selectedAtom={selectedAtom}
                      atoms={atoms}
                      bonds={bonds}
                      valenceWarnings={valenceWarnings}
                      connectedBonds={connectedBonds}
                      onFormulaChange={(v) => {
                        setFormulaInput(v);
                        setFormulaError(null);
                      }}
                      onBuildFormula={buildFromFormulaInput}
                      onSetBuilderElement={setBuilderElement}
                      onSetBondOrder={setBondOrder}
                      onStartNew={startNewMolecule}
                      onAddAtom={addAtom}
                      onToggleBondMode={() => {
                        setBondMode((b) => !b);
                        setBondFrom(null);
                      }}
                      onCycleBondOrder={cycleBondOrder}
                      onIdentify={() => runIdentification(atoms, bonds)}
                      onRemoveAtom={removeSelectedAtom}
                      onReset={resetBuilder}
                      onNudge={nudgeAtom}
                      onRemoveBond={(partner) => selectedAtom !== null && removeBondAt(selectedAtom, partner)}
                    />
                  </div>
                )}

                {tab === "quiz" && (
                  <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-4 space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/15 to-indigo-500/15 border border-purple-500/25">
                      <p className="text-sm font-semibold mb-1">Score: {quizScore}</p>
                      <p className="text-xs text-slate-400">
                        Test your knowledge of molecular shapes and bonding!
                      </p>
                    </div>
                    {QUIZ_QUESTIONS.map((q, i) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setQuizIndex(i);
                          setQuizAnswer(null);
                          setShowHint(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors ${
                          quizIndex === i ? "bg-purple-500/20 text-purple-200" : "text-slate-400 hover:bg-white/5"
                        }`}
                      >
                        Q{i + 1}: {q.question.slice(0, 40)}…
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setLeftOpen((o) => !o)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-5 h-12 items-center justify-center bg-[#0c1222] border border-white/10 rounded-r-lg text-slate-400 hover:text-white"
          style={{ left: leftOpen ? 300 : 0 }}
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${leftOpen ? "rotate-180" : ""}`} />
        </button>

        {/* 3D Canvas */}
        <div ref={vrRef} className="flex-1 relative min-h-[50vh]">
          <Canvas shadows camera={{ position: [0, 2.5, 9], fov: 45 }}>
            <MoleculeScene
              atoms={atoms}
              bonds={bonds}
              viewMode={viewMode}
              selectedAtom={selectedAtom}
              onSelectAtom={handleAtomSelect}
              autoRotate={autoRotate}
              vrContainerRef={vrRef}
            />
          </Canvas>

          <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2 pointer-events-none">
            {(tab === "builder" || activeMoleculeId === "custom") && (
              <div className="pointer-events-auto px-4 py-2.5 rounded-xl bg-[#0c1222]/92 border border-emerald-500/30 backdrop-blur-md max-w-sm">
                <div className="flex items-center gap-2">
                  {identifying ? (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                  ) : (
                    <FlaskConical className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{displayName}</p>
                    <p className="text-emerald-400 font-mono text-xs">{displayFormula || "Add atoms…"}</p>
                  </div>
                </div>
              </div>
            )}
            {tab === "library" && (
              <select
                className="pointer-events-auto px-3 py-2 rounded-lg bg-[#0c1222]/90 border border-white/15 text-sm max-w-full md:hidden"
                value={activeMoleculeId}
                onChange={(e) => {
                  const mol = getMoleculeById(e.target.value);
                  if (mol) loadMolecule(mol);
                }}
              >
                {MOLECULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.formula})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-xs text-slate-300 pointer-events-none hidden sm:block">
            Drag to rotate · Scroll to zoom · Click atoms to inspect
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/40 backdrop-blur border border-white/10 text-xs text-emerald-300">
            <Glasses className="w-3.5 h-3.5" />
            VR headset supported
          </div>
        </div>

        {/* Right panel */}
        <AnimatePresence initial={false}>
          {rightOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 self-stretch h-full min-h-0 border-l border-white/10 bg-[#0c1222]/95 overflow-hidden hidden lg:flex flex-col"
            >
              <div className="w-[320px] flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-4">
                {tab !== "quiz" ? (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div>
                        <h2 className="text-xl font-bold">{displayName}</h2>
                        <p className="text-2xl font-mono text-emerald-400 mt-1">{displayFormula || "—"}</p>
                        {identification?.iupacName && identification.iupacName !== displayName && (
                          <p className="text-xs text-slate-400 mt-1 italic">{identification.iupacName}</p>
                        )}
                        {identification?.molecularWeight != null &&
                          !Number.isNaN(Number(identification.molecularWeight)) && (
                          <p className="text-xs text-slate-500 mt-1">
                            MW: {Number(identification.molecularWeight).toFixed(2)} g/mol
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const text = displayDescription
                            ? `${displayName}. ${displayDescription}`
                            : displayName;
                          speak(text);
                        }}
                        disabled={!displayName || displayName === "New Molecule"}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors shrink-0 disabled:opacity-40"
                        title="Listen"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                        {displayBondType}
                      </span>
                      {displayCategory && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                          {displayCategory}
                        </span>
                      )}
                      {identification?.source && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">
                          {identification.source === "pubchem"
                            ? "PubChem"
                            : identification.source === "library"
                              ? "Library"
                              : identification.source === "generated"
                                ? "Auto-generated"
                                : identification.source === "formula"
                                  ? "Known formula"
                                  : "Unidentified"}
                        </span>
                      )}
                      {activeMolecule && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                          {GRADE_LABELS[activeMolecule.grade]}
                        </span>
                      )}
                    </div>

                    {displayDescription && (
                      <p className="text-sm text-slate-300 leading-relaxed mb-4">{displayDescription}</p>
                    )}

                    {identification?.synonyms && identification.synonyms.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Also known as
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {identification.synonyms.slice(0, 6).map((syn) => (
                            <span
                              key={syn}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10"
                            >
                              {syn}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeMolecule && (
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Did you know?
                        </p>
                        {activeMolecule.facts.map((fact, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-slate-300"
                          >
                            {fact}
                          </div>
                        ))}
                      </div>
                    )}

                    {tab === "builder" && atoms.length === 0 && (
                      <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sm text-sky-200 mb-4">
                        <p className="font-semibold mb-2">Quick start</p>
                        <ul className="space-y-1 text-xs text-sky-200/90">
                          <li>• Type <strong className="font-mono">HCl</strong> above and click <strong>Build</strong></li>
                          <li>• Or add H + Cl atoms, then <strong>Create Bond</strong> and click both in 3D</li>
                        </ul>
                      </div>
                    )}

                    {selectedAtom !== null && atoms[selectedAtom] && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-500/25">
                        <p className="text-xs text-slate-400 mb-2">Selected atom #{selectedAtom + 1}</p>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full border-2 border-white/30"
                            style={{ backgroundColor: ELEMENTS[atoms[selectedAtom].element].color }}
                          />
                          <div>
                            <p className="font-bold text-lg">{ELEMENTS[atoms[selectedAtom].element].name}</p>
                            <p className="text-sm text-slate-400">
                              Symbol: {atoms[selectedAtom].element} · Z ={" "}
                              {ELEMENTS[atoms[selectedAtom].element].atomicNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-white/10">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        CPK Color Legend
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {Object.values(ELEMENTS)
                          .slice(0, 8)
                          .map((el) => (
                            <div key={el.symbol} className="flex items-center gap-2 text-xs text-slate-400">
                              <div
                                className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                                style={{ backgroundColor: el.color }}
                              />
                              {el.symbol} — {el.name}
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold">Question {quizIndex + 1}</h2>
                    <p className="text-slate-300">{QUIZ_QUESTIONS[quizIndex].question}</p>
                    <div className="space-y-2">
                      {QUIZ_QUESTIONS[quizIndex].options.map((opt, i) => {
                        const q = QUIZ_QUESTIONS[quizIndex];
                        const answered = quizAnswer !== null;
                        const isCorrect = i === q.answer;
                        const isSelected = quizAnswer === i;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleQuizAnswer(i)}
                            disabled={answered}
                            className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                              !answered
                                ? "border-white/10 bg-white/[0.03] hover:border-purple-500/40 hover:bg-purple-500/10"
                                : isCorrect
                                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                                  : isSelected
                                    ? "border-red-500/50 bg-red-500/15 text-red-200"
                                    : "border-white/5 bg-white/[0.02] text-slate-500"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {answered && isCorrect && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                              {answered && isSelected && !isCorrect && <XCircle className="w-4 h-4 shrink-0" />}
                              {opt}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {showHint && (
                      <p className="text-sm text-amber-300/90 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        Hint: {QUIZ_QUESTIONS[quizIndex].hint}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowHint(true)}
                        className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10"
                      >
                        Show Hint
                      </button>
                      {quizAnswer !== null && (
                        <button
                          type="button"
                          onClick={nextQuiz}
                          className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-semibold"
                        >
                          Next Question
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setRightOpen((o) => !o)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden lg:flex w-5 h-12 items-center justify-center bg-[#0c1222] border border-white/10 rounded-l-lg text-slate-400 hover:text-white"
          style={{ right: rightOpen ? 320 : 0 }}
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${rightOpen ? "" : "rotate-180"}`} />
        </button>
      </div>

      {/* Mobile bottom bar for builder */}
      {tab === "builder" && (
        <div className="md:hidden shrink-0 border-t border-white/10 bg-[#0c1222] p-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={formulaInput}
              onChange={(e) => {
                setFormulaInput(e.target.value);
                setFormulaError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && buildFromFormulaInput()}
              placeholder="h2so4, h2o, hcl…"
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-sm font-mono"
            />
            <button
              type="button"
              onClick={buildFromFormulaInput}
              disabled={building}
              className="px-3 py-2 rounded-xl bg-emerald-600 text-sm font-semibold disabled:opacity-50"
            >
              {building ? "…" : "Build"}
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto">
          {BUILDER_ELEMENTS.map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => setBuilderElement(sym)}
              className={`shrink-0 w-10 h-10 rounded-full border-2 ${
                builderElement === sym ? "border-emerald-400 scale-110" : "border-white/20"
              }`}
              style={{ backgroundColor: ELEMENTS[sym].color }}
            />
          ))}
          <button
            type="button"
            onClick={addAtom}
            className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 text-sm font-semibold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
          </div>
        </div>
      )}
    </div>
  );
}
