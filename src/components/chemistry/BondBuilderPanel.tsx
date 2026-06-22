"use client";

import {
  Plus,
  RotateCcw,
  Trash2,
  Link2,
  Search,
  Loader2,
  Unlink,
  FilePlus2,
  Move3D,
  Wand2,
  AlertTriangle,
} from "lucide-react";
import { ELEMENTS, BUILDER_ELEMENTS, type AtomDef, type BondDef, type ElementSymbol } from "@/data/molecules-data";

export interface BondBuilderPanelProps {
  formulaInput: string;
  formulaError: string | null;
  building: boolean;
  identifying: boolean;
  displayName: string;
  displayFormula: string;
  identificationSource?: string;
  builderElement: ElementSymbol;
  bondOrder: 1 | 2 | 3;
  bondMode: boolean;
  bondFrom: number | null;
  selectedAtom: number | null;
  atoms: AtomDef[];
  bonds: BondDef[];
  valenceWarnings: string[];
  connectedBonds: { index: number; partner: number; order: number }[];
  onFormulaChange: (v: string) => void;
  onBuildFormula: () => void;
  onSetBuilderElement: (el: ElementSymbol) => void;
  onSetBondOrder: (o: 1 | 2 | 3) => void;
  onStartNew: () => void;
  onAddAtom: () => void;
  onToggleBondMode: () => void;
  onCycleBondOrder: () => void;
  onIdentify: () => void;
  onRemoveAtom: () => void;
  onReset: () => void;
  onNudge: (axis: 0 | 1 | 2, delta: number) => void;
  onRemoveBond: (partner: number) => void;
}

export default function BondBuilderPanel({
  formulaInput,
  formulaError,
  building,
  identifying,
  displayName,
  displayFormula,
  identificationSource,
  builderElement,
  bondOrder,
  bondMode,
  bondFrom,
  selectedAtom,
  atoms,
  bonds,
  valenceWarnings,
  connectedBonds,
  onFormulaChange,
  onBuildFormula,
  onSetBuilderElement,
  onSetBondOrder,
  onStartNew,
  onAddAtom,
  onToggleBondMode,
  onCycleBondOrder,
  onIdentify,
  onRemoveAtom,
  onReset,
  onNudge,
  onRemoveBond,
}: BondBuilderPanelProps) {
  return (
    <>
      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 mb-4">
        <p className="text-xs text-emerald-300/80 mb-1 font-semibold uppercase tracking-wider">
          Live identification
        </p>
        <p className="font-bold text-base leading-tight">
          {building ? "Building 3D…" : identifying ? "Analyzing…" : displayName}
        </p>
        <p className="text-emerald-400 font-mono text-lg mt-0.5">{displayFormula || "—"}</p>
        {identificationSource === "pubchem" && (
          <p className="text-[10px] text-slate-500 mt-1">3D from PubChem · {atoms.length} atoms · {bonds.length} bonds</p>
        )}
        {identificationSource === "generated" && (
          <p className="text-[10px] text-amber-400/80 mt-1">Auto-generated layout · {atoms.length} atoms · {bonds.length} bonds</p>
        )}
      </div>

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        Build from formula
      </p>
      <div className="flex gap-2 mb-1">
        <input
          type="text"
          value={formulaInput}
          onChange={(e) => onFormulaChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onBuildFormula()}
          placeholder="c6h12o6, h2so4, h2o…"
          className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
        />
        <button
          type="button"
          onClick={onBuildFormula}
          disabled={building}
          className="shrink-0 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm font-semibold flex items-center gap-1.5 transition-colors"
        >
          {building ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          Build
        </button>
      </div>
      {formulaError && <p className="text-xs text-red-300 mb-3">{formulaError}</p>}
      <p className="text-[10px] text-slate-500 mb-4">
                      Any case · NH₄NO₃ · C₆H₁₂O₆ · always builds a 3D model
      </p>

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Manual bond builder
      </p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {BUILDER_ELEMENTS.map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => onSetBuilderElement(sym)}
            className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
              builderElement === sym
                ? "border-emerald-400 bg-emerald-500/15 scale-105"
                : "border-white/10 bg-white/[0.03] hover:border-white/20"
            }`}
          >
            <div
              className="w-8 h-8 rounded-full mb-1 border border-white/20"
              style={{ backgroundColor: ELEMENTS[sym].color }}
            />
            <span className="text-xs font-bold">{sym}</span>
          </button>
        ))}
      </div>

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bond type</p>
      <div className="flex gap-1.5 mb-4">
        {([1, 2, 3] as const).map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onSetBondOrder(o)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              bondOrder === o
                ? "bg-sky-500/25 border-sky-400/50 text-sky-200"
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
            }`}
          >
            {o === 1 ? "Single" : o === 2 ? "Double" : "Triple"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onStartNew}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors"
        >
          <FilePlus2 className="w-4 h-4" />
          New Blank Molecule
        </button>
        <button
          type="button"
          onClick={onAddAtom}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add {ELEMENTS[builderElement].name} Atom
        </button>
        <button
          type="button"
          onClick={onToggleBondMode}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors border ${
            bondMode
              ? "bg-sky-500/20 border-sky-400/50 text-sky-300"
              : "bg-white/5 border-white/10 hover:bg-white/10"
          }`}
        >
          <Link2 className="w-4 h-4" />
          {bondMode
            ? bondFrom === null
              ? "Step 1: Click first atom…"
              : "Step 2: Click second atom…"
            : `Create ${bondOrder === 1 ? "Single" : bondOrder === 2 ? "Double" : "Triple"} Bond`}
        </button>
        {bondMode && (
          <p className="text-[11px] text-sky-300/90 text-center px-2">
            {bondFrom === null
              ? "Click an atom sphere in the 3D view"
              : `Connect to another atom (from ${ELEMENTS[atoms[bondFrom]?.element]?.name ?? "?"})`}
          </p>
        )}
        <button
          type="button"
          onClick={onCycleBondOrder}
          disabled={selectedAtom === null || connectedBonds.length === 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 disabled:opacity-40 transition-colors"
        >
          <Link2 className="w-4 h-4" />
          Cycle Bond Order
        </button>
        <button
          type="button"
          onClick={onIdentify}
          disabled={identifying || building || atoms.length === 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-sm font-semibold disabled:opacity-40 transition-colors"
        >
          {identifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Identify Substance
        </button>
        <button
          type="button"
          onClick={onRemoveAtom}
          disabled={selectedAtom === null}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-medium disabled:opacity-40 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Remove Selected Atom
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Water
        </button>
      </div>

      {connectedBonds.length > 0 && selectedAtom !== null && (
        <div className="mt-4 p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
          <p className="text-xs text-slate-400">Bonds on selected atom</p>
          {connectedBonds.map((b) => (
            <div key={b.index} className="flex items-center justify-between text-xs">
              <span>
                → {ELEMENTS[atoms[b.partner].element].name} (
                {b.order === 1 ? "single" : b.order === 2 ? "double" : "triple"})
              </span>
              <button
                type="button"
                onClick={() => onRemoveBond(b.partner)}
                className="p-1 rounded text-red-300 hover:bg-red-500/20"
                title="Remove bond"
              >
                <Unlink className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedAtom !== null && (
        <div className="mt-4 p-3 rounded-xl bg-white/[0.04] border border-white/10">
          <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
            <Move3D className="w-3.5 h-3.5" />
            Nudge selected atom
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {(["X", "Y", "Z"] as const).map((label, axis) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-center text-slate-500">{label}</span>
                <button type="button" onClick={() => onNudge(axis as 0 | 1 | 2, 0.2)} className="py-1 rounded bg-white/10 hover:bg-white/15">+</button>
                <button type="button" onClick={() => onNudge(axis as 0 | 1 | 2, -0.2)} className="py-1 rounded bg-white/10 hover:bg-white/15">−</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {valenceWarnings.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
          <p className="text-xs text-amber-300 flex items-center gap-1 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Valence check
          </p>
          {valenceWarnings.map((w) => (
            <p key={w} className="text-[11px] text-amber-200/80">{w}</p>
          ))}
        </div>
      )}

      {atoms.length === 0 && (
        <div className="mt-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/25 text-xs text-sky-200/90">
          <p className="font-semibold mb-1">Quick start</p>
          <p>Type <strong className="font-mono">c6h12o6</strong> for glucose or <strong className="font-mono">h2so4</strong> for sulfuric acid.</p>
        </div>
      )}
    </>
  );
}
