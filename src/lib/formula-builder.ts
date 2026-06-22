import {
  MOLECULES,
  ELEMENTS,
  cloneMolecule,
  type AtomDef,
  type BondDef,
  type ElementSymbol,
  type MoleculeDef,
} from "@/data/molecules-data";
import { computeHillFormula, formatFormulaDisplay } from "@/lib/molecule-chemistry";
import { generateGenericMolecule } from "@/lib/molecule-generator";

export { formatFormulaDisplay } from "@/lib/molecule-chemistry";

const SCALE = 1.35;

const SUB_MAP: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
  "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
};

/** Strip spaces & unicode subscripts; keeps letter case as typed. */
export function normalizeFormulaInput(input: string): string {
  return input
    .trim()
    .replace(/\s/g, "")
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => SUB_MAP[c] ?? c);
}


/** Longest-first so "Cl" matches before "C". */
const ELEMENTS_BY_LENGTH = (Object.keys(ELEMENTS) as ElementSymbol[]).sort(
  (a, b) => b.length - a.length,
);

/**
 * Parse formulas case-insensitively: h2o, h2so4, nh4no3, H₂SO₄ all work.
 * Uses known element symbols (avoids "so" being read as one invalid element).
 */
export function parseFormulaInput(input: string): Map<ElementSymbol, number> | null {
  const normalized = normalizeFormulaInput(input);
  if (!normalized) return null;

  const counts = new Map<ElementSymbol, number>();
  let i = 0;

  while (i < normalized.length) {
    let matched = false;
    for (const sym of ELEMENTS_BY_LENGTH) {
      const chunk = normalized.slice(i, i + sym.length);
      if (chunk.toLowerCase() !== sym.toLowerCase()) continue;

      i += sym.length;
      let digits = "";
      while (i < normalized.length && /\d/.test(normalized[i]!)) {
        digits += normalized[i++];
      }
      const n = digits ? parseInt(digits, 10) : 1;
      if (n <= 0 || n > 999) return null;
      counts.set(sym, (counts.get(sym) ?? 0) + n);
      matched = true;
      break;
    }
    if (!matched) return null;
  }

  return counts.size > 0 ? counts : null;
}

export function compositionToHill(counts: Map<ElementSymbol, number>): string {
  const atoms: AtomDef[] = [];
  for (const [element, count] of counts) {
    for (let i = 0; i < count; i++) atoms.push({ element, position: [0, 0, 0] });
  }
  return computeHillFormula(atoms);
}

/** User-friendly formula string (H2SO4 not Hill H2O4S). */
export function formatConventionalFormula(counts: Map<ElementSymbol, number>): string {
  const hill = compositionToHill(counts);

  const BY_HILL: Record<string, string> = {
    H2O: "H2O",
    HCl: "HCl",
    CO2: "CO2",
    CH4: "CH4",
    NH3: "NH3",
    O2: "O2",
    NaCl: "NaCl",
    C2H6O: "C2H5OH",
    C2H4: "C2H4",
    C6H12O6: "C6H12O6",
    H2O4S: "H2SO4",
    HNO3: "HNO3",
    H3O4P: "H3PO4",
    H4N2O3: "NH4NO3",
    H2S: "H2S",
    H2O2: "H2O2",
    SO2: "SO2",
    SO3: "SO3",
    CaCO3: "CaCO3",
  };
  if (BY_HILL[hill]) return BY_HILL[hill];

  // Inorganic without carbon: H first, then other elements alphabetically
  if (!counts.has("C")) {
    const parts: string[] = [];
    if (counts.has("H")) {
      const n = counts.get("H")!;
      parts.push(n === 1 ? "H" : `H${n}`);
    }
    for (const sym of [...counts.keys()].filter((k) => k !== "H").sort()) {
      const n = counts.get(sym)!;
      parts.push(n === 1 ? sym : `${sym}${n}`);
    }
    return parts.join("");
  }

  return hill;
}

function hillFromMolecule(mol: MoleculeDef): string {
  return computeHillFormula(mol.atoms);
}

function displayFormulaToAscii(formula: string): string {
  return normalizeFormulaInput(formula);
}

function findLibraryByFormula(counts: Map<ElementSymbol, number>): MoleculeDef | undefined {
  const targetHill = compositionToHill(counts);
  for (const mol of MOLECULES) {
    const parsed = parseFormulaInput(mol.formula);
    if (parsed && compositionToHill(parsed) === targetHill) return mol;
    if (hillFromMolecule(mol) === targetHill) return mol;
  }
  return undefined;
}

function expectedAtomCount(counts: Map<ElementSymbol, number>): number {
  return [...counts.values()].reduce((a, b) => a + b, 0);
}

export type BuildSource = "library" | "template" | "pubchem" | "generated";

export interface BuildFromFormulaResult {
  ok: true;
  atoms: AtomDef[];
  bonds: BondDef[];
  formula: string;
  formulaConventional: string;
  formulaDisplay: string;
  molecule?: MoleculeDef;
  source: BuildSource;
  cid?: number;
}

export interface BuildFromFormulaError {
  ok: false;
  error: string;
}

/** Local-only build (library + templates, no network). */
export function buildFromFormulaLocal(input: string): BuildFromFormulaResult | BuildFromFormulaError {
  const counts = parseFormulaInput(input);
  if (!counts || counts.size === 0) {
    return {
      ok: false,
      error: "Could not parse formula. Try h2o, hcl, h2so4, c6h12o6 (any case).",
    };
  }

  const hill = compositionToHill(counts);
  const conventional = formatConventionalFormula(counts);
  const formulaDisplay = formatFormulaDisplay(conventional);
  const expected = expectedAtomCount(counts);

  const library = findLibraryByFormula(counts);
  if (library && library.atoms.length === expected) {
    const cloned = cloneMolecule(library);
    return {
      ok: true,
      atoms: cloned.atoms,
      bonds: cloned.bonds,
      formula: hill,
      formulaConventional: displayFormulaToAscii(library.formula) || conventional,
      formulaDisplay: library.formula,
      molecule: library,
      source: "library",
    };
  }

  const generated = generateFromComposition(counts);
  if (generated && generated.atoms.length === expected) {
    return {
      ok: true,
      atoms: generated.atoms,
      bonds: generated.bonds,
      formula: hill,
      formulaConventional: conventional,
      formulaDisplay,
      source: "template",
      molecule: library,
    };
  }

  if (library) {
    const cloned = cloneMolecule(library);
    return {
      ok: true,
      atoms: cloned.atoms,
      bonds: cloned.bonds,
      formula: hill,
      formulaConventional: displayFormulaToAscii(library.formula) || conventional,
      formulaDisplay: library.formula,
      molecule: library,
      source: "library",
    };
  }

  if (generated) {
    return {
      ok: true,
      atoms: generated.atoms,
      bonds: generated.bonds,
      formula: hill,
      formulaConventional: conventional,
      formulaDisplay,
      source: "template",
    };
  }

  return {
    ok: false,
    error: `Recognized as ${conventional} — fetching full 3D structure…`,
  };
}

/** Full build: local first, then PubChem 3D via API. */
export async function buildFromFormula(input: string): Promise<BuildFromFormulaResult | BuildFromFormulaError> {
  const counts = parseFormulaInput(input);
  if (!counts || counts.size === 0) {
    return {
      ok: false,
      error: "Could not parse formula. Try h2o, hcl, h2so4, c6h12o6 (any case).",
    };
  }

  const expected = expectedAtomCount(counts);
  const local = buildFromFormulaLocal(input);

  if (local.ok && local.atoms.length === expected && local.source === "library") {
    return local;
  }

  if (local.ok && local.atoms.length === expected && local.bonds.length > 0) {
    return local;
  }

  try {
    const res = await fetch(`/api/chemistry/build?formula=${encodeURIComponent(input.trim())}`);
    const data = (await res.json()) as BuildFromFormulaResult | BuildFromFormulaError;
    if (data.ok) return data;
    if (local.ok) return local;
    return data;
  } catch {
    const counts = parseFormulaInput(input);
    if (counts) {
      const hill = compositionToHill(counts);
      const conventional = formatConventionalFormula(counts);
      const generic = generateGenericMolecule(counts, hill);
      if (generic.atoms.length > 0) {
        return {
          ok: true,
          atoms: generic.atoms,
          bonds: generic.bonds,
          formula: hill,
          formulaConventional: conventional,
          formulaDisplay: formatFormulaDisplay(conventional),
          source: "generated",
        };
      }
    }
    if (local.ok) return local;
    const conventional = counts ? formatConventionalFormula(counts) : input;
    return {
      ok: false,
      error: `Could not build ${conventional}.`,
    };
  }
}

function diatomic(
  a: ElementSymbol,
  b: ElementSymbol,
  order: 1 | 2 | 3 = 1,
): { atoms: AtomDef[]; bonds: BondDef[] } {
  const d = 0.8 * SCALE;
  return {
    atoms: [
      { element: a, position: [-d, 0, 0] },
      { element: b, position: [d, 0, 0] },
    ],
    bonds: [{ from: 0, to: 1, order }],
  };
}

function linearTriatomic(
  center: ElementSymbol,
  end: ElementSymbol,
  order: 1 | 2 | 3,
): { atoms: AtomDef[]; bonds: BondDef[] } {
  const d = 1.16 * SCALE;
  return {
    atoms: [
      { element: center, position: [0, 0, 0] },
      { element: end, position: [-d, 0, 0] },
      { element: end, position: [d, 0, 0] },
    ],
    bonds: [
      { from: 0, to: 1, order },
      { from: 0, to: 2, order },
    ],
  };
}

function bentTriatomic(
  center: ElementSymbol,
  end: ElementSymbol,
): { atoms: AtomDef[]; bonds: BondDef[] } {
  const s = SCALE;
  return {
    atoms: [
      { element: center, position: [0, 0, 0] },
      { element: end, position: [0.76 * s, 0.55 * s, 0] },
      { element: end, position: [-0.76 * s, 0.55 * s, 0] },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
    ],
  };
}

function tetrahedral(center: ElementSymbol, end: ElementSymbol): { atoms: AtomDef[]; bonds: BondDef[] } {
  const s = SCALE;
  const d = 0.63 * s;
  return {
    atoms: [
      { element: center, position: [0, 0, 0] },
      { element: end, position: [d, d, d] },
      { element: end, position: [-d, -d, d] },
      { element: end, position: [-d, d, -d] },
      { element: end, position: [d, -d, -d] },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
    ],
  };
}

function pyramidal(center: ElementSymbol, end: ElementSymbol): { atoms: AtomDef[]; bonds: BondDef[] } {
  const s = SCALE;
  return {
    atoms: [
      { element: center, position: [0, 0.2 * s, 0] },
      { element: end, position: [0.94 * s, -0.27 * s, 0] },
      { element: end, position: [-0.47 * s, -0.27 * s, 0.81 * s] },
      { element: end, position: [-0.47 * s, -0.27 * s, -0.81 * s] },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
    ],
  };
}

function ionicPair(metal: ElementSymbol, nonMetal: ElementSymbol): { atoms: AtomDef[]; bonds: BondDef[] } {
  const d = 1.4 * SCALE;
  return {
    atoms: [
      { element: metal, position: [-d, 0, 0] },
      { element: nonMetal, position: [d, 0, 0] },
    ],
    bonds: [{ from: 0, to: 1, order: 1 }],
  };
}

function sulfuricAcid(): { atoms: AtomDef[]; bonds: BondDef[] } {
  const s = SCALE;
  return {
    atoms: [
      { element: "S", position: [0, 0, 0] },
      { element: "O", position: [1.05 * s, 0, 0] },
      { element: "O", position: [-1.05 * s, 0, 0] },
      { element: "O", position: [0, 0.85 * s, 0.55 * s] },
      { element: "O", position: [0, -0.85 * s, 0.55 * s] },
      { element: "H", position: [0, 1.35 * s, 0.95 * s] },
      { element: "H", position: [0, -1.35 * s, 0.95 * s] },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 2 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
      { from: 3, to: 5, order: 1 },
      { from: 4, to: 6, order: 1 },
    ],
  };
}

function nitricAcid(): { atoms: AtomDef[]; bonds: BondDef[] } {
  const s = SCALE;
  return {
    atoms: [
      { element: "N", position: [0, 0, 0] },
      { element: "O", position: [1.0 * s, 0, 0] },
      { element: "O", position: [-0.75 * s, 0.75 * s, 0] },
      { element: "O", position: [-0.75 * s, -0.75 * s, 0] },
      { element: "H", position: [-1.25 * s, 1.15 * s, 0] },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 2, to: 4, order: 1 },
    ],
  };
}

const METALS = new Set<ElementSymbol>(["Na", "Ca"]);

/** Heuristic 3D layout from elemental composition. */
function generateFromComposition(
  counts: Map<ElementSymbol, number>,
): { atoms: AtomDef[]; bonds: BondDef[] } | null {
  const hill = compositionToHill(counts);

  if (hill === "H2O4S") return sulfuricAcid();
  if (hill === "HNO3") return nitricAcid();

  const entries = [...counts.entries()];
  const total = entries.reduce((s, [, n]) => s + n, 0);

  if (total === 2 && entries.length === 2) {
    const [[a, na], [b, nb]] = entries;
    if (na === 1 && nb === 1) {
      if (METALS.has(a) && !METALS.has(b)) return ionicPair(a, b);
      if (METALS.has(b) && !METALS.has(a)) return ionicPair(b, a);
      const order: 1 | 2 | 3 =
        (a === "O" && b === "O") || (a === "N" && b === "N") ? 2 : 1;
      return diatomic(a, b, order);
    }
  }

  if (total === 3 && entries.length === 2) {
    if (hill === "CO2") return linearTriatomic("C", "O", 2);
    if (hill === "H2O") return bentTriatomic("O", "H");
    if (hill === "H2S") return bentTriatomic("S", "H");
    const sorted = entries.sort((x, y) => y[1] - x[1]);
    const [[a, na], [, nb]] = sorted;
    if (na === 1 && nb === 2) return linearTriatomic(a, entries.find(([, n]) => n === 2)![0], 1);
  }

  if (total === 4 && counts.get("N") === 1 && counts.get("H") === 3) return pyramidal("N", "H");
  if (total === 5 && counts.get("C") === 1 && counts.get("H") === 4) return tetrahedral("C", "H");

  if (total === 3 && hill === "SO2") return bentTriatomic("S", "O");

  return null;
}

/** Standard bond length for snapping manual bonds (scaled Å). */
export const BOND_SNAP_LENGTH = 1.05 * SCALE;

export function snapAtomsForBond(
  atoms: AtomDef[],
  fromIdx: number,
  toIdx: number,
  order: 1 | 2 | 3,
): AtomDef[] {
  const from = atoms[fromIdx]?.position;
  const to = atoms[toIdx]?.position;
  if (!from || !to) return atoms;

  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  let len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (len < 0.01) len = 1;

  const scale = (BOND_SNAP_LENGTH * (order === 2 ? 0.92 : order === 3 ? 0.88 : 1)) / len;
  const newPos: [number, number, number] = [
    from[0] + dx * scale,
    from[1] + dy * scale,
    from[2] + dz * scale,
  ];

  return atoms.map((a, i) => (i === toIdx ? { ...a, position: newPos } : a));
}

export function getAtomBallRadius(element: ElementSymbol, viewMode: "ball-stick" | "spacefill"): number {
  const r = ELEMENTS[element].radius;
  return viewMode === "spacefill" ? r * 1.85 : r * 0.95;
}
