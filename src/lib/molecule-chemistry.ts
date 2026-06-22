import {
  MOLECULES,
  type AtomDef,
  type BondDef,
  type ElementSymbol,
  type MoleculeDef,
} from "@/data/molecules-data";

const SUBSCRIPTS = "₀₁₂₃₄₅₆₇₈₉";

export interface CompoundIdentification {
  name: string;
  iupacName?: string;
  formula: string;
  formulaDisplay: string;
  description?: string;
  synonyms?: string[];
  bondType?: string;
  category?: string;
  source: "library" | "pubchem" | "formula" | "unknown" | "generated";
  cid?: number;
  molecularWeight?: number;
}

/** Hill notation: C, then H, then other elements alphabetically. */
export function computeHillFormula(atoms: AtomDef[]): string {
  const counts = new Map<string, number>();
  for (const atom of atoms) {
    counts.set(atom.element, (counts.get(atom.element) ?? 0) + 1);
  }
  if (counts.size === 0) return "";

  const symbols = [...counts.keys()];
  const ordered: string[] = [];

  if (counts.has("C")) {
    ordered.push("C");
    if (counts.has("H")) ordered.push("H");
    for (const sym of symbols.sort()) {
      if (sym !== "C" && sym !== "H") ordered.push(sym);
    }
  } else {
    ordered.push(...symbols.sort());
  }

  return ordered
    .map((sym) => {
      const n = counts.get(sym)!;
      return n === 1 ? sym : `${sym}${n}`;
    })
    .join("");
}

export function formatFormulaDisplay(formula: string): string {
  return formula.replace(/(\d+)/g, (_, digits: string) =>
    digits
      .split("")
      .map((d) => SUBSCRIPTS[parseInt(d, 10)] ?? d)
      .join(""),
  );
}

/** Element-multiset + bond-edge signature for matching library structures. */
export function getStructureKey(atoms: AtomDef[], bonds: BondDef[]): string {
  const elements = atoms.map((a) => a.element).sort().join(",");
  const edges = bonds
    .map((b) => {
      const a = atoms[b.from]?.element ?? "?";
      const c = atoms[b.to]?.element ?? "?";
      const pair = [a, c].sort().join("-");
      return `${pair}:${b.order}`;
    })
    .sort()
    .join("|");
  return `${elements}::${edges}`;
}

export function findLibraryMatch(atoms: AtomDef[], bonds: BondDef[]): MoleculeDef | undefined {
  const key = getStructureKey(atoms, bonds);
  return MOLECULES.find((mol) => getStructureKey(mol.atoms, mol.bonds) === key);
}

interface AdjEdge {
  to: number;
  order: 1 | 2 | 3;
}

function buildAdjacency(atoms: AtomDef[], bonds: BondDef[]): Map<number, AdjEdge[]> {
  const adj = new Map<number, AdjEdge[]>();
  for (let i = 0; i < atoms.length; i++) adj.set(i, []);
  for (const bond of bonds) {
    adj.get(bond.from)?.push({ to: bond.to, order: bond.order });
    adj.get(bond.to)?.push({ to: bond.from, order: bond.order });
  }
  return adj;
}

function bondSymbol(order: 1 | 2 | 3): string {
  if (order === 2) return "=";
  if (order === 3) return "#";
  return "";
}

function atomToken(element: ElementSymbol): string {
  return element.length > 1 || element === "H" ? `[${element}]` : element;
}

function writeSmilesDfs(
  idx: number,
  parent: number,
  atoms: AtomDef[],
  adj: Map<number, AdjEdge[]>,
  visited: Set<number>,
): string {
  visited.add(idx);
  let out = atomToken(atoms[idx].element);

  const neighbors = (adj.get(idx) ?? [])
    .filter((e) => e.to !== parent && !visited.has(e.to))
    .sort((a, b) => a.to - b.to);

  if (neighbors.length === 0) return out;

  if (neighbors.length === 1) {
    const n = neighbors[0];
    return out + bondSymbol(n.order) + writeSmilesDfs(n.to, idx, atoms, adj, visited);
  }

  for (let i = 0; i < neighbors.length; i++) {
    const n = neighbors[i];
    const branch = bondSymbol(n.order) + writeSmilesDfs(n.to, idx, atoms, adj, visited);
    out += i === 0 ? branch : `(${branch})`;
  }
  return out;
}

export function generateSmiles(atoms: AtomDef[], bonds: BondDef[]): string | null {
  if (atoms.length === 0) return null;
  if (atoms.length === 1) return atomToken(atoms[0].element);

  const adj = buildAdjacency(atoms, bonds);
  const visited = new Set<number>();
  const fragments: string[] = [];

  const startPriority = (i: number) => {
    const rank: Partial<Record<ElementSymbol, number>> = {
      C: 0,
      N: 1,
      O: 2,
      S: 3,
      P: 4,
      Cl: 5,
      F: 6,
      Na: 7,
      Ca: 8,
      H: 9,
    };
    return rank[atoms[i].element] ?? 6;
  };

  for (let i = 0; i < atoms.length; i++) {
    if (visited.has(i)) continue;

    if ((adj.get(i)?.length ?? 0) === 0) {
      fragments.push(atomToken(atoms[i].element));
      visited.add(i);
      continue;
    }

    let start = i;
    for (let j = i + 1; j < atoms.length; j++) {
      if (!visited.has(j) && (adj.get(j)?.length ?? 0) > 0 && startPriority(j) < startPriority(start)) {
        start = j;
      }
    }
    fragments.push(writeSmilesDfs(start, -1, atoms, adj, visited));
  }

  return fragments.join(".") || null;
}

/** Local lookup table for common classroom formulas (fallback before API). */
const FORMULA_ALIASES: Record<string, Partial<CompoundIdentification>> = {
  H2O: { name: "Water", bondType: "Polar covalent", category: "Essential" },
  HCl: {
    name: "Hydrogen Chloride",
    bondType: "Polar covalent",
    category: "Acids",
    description:
      "A polar diatomic molecule. When dissolved in water it forms hydrochloric acid — used in industry and (diluted) in digestion.",
  },
  CO2: { name: "Carbon Dioxide", bondType: "Nonpolar covalent", category: "Gases" },
  CH4: { name: "Methane", bondType: "Nonpolar covalent", category: "Hydrocarbons" },
  NH3: { name: "Ammonia", bondType: "Polar covalent", category: "Essential" },
  O2: { name: "Oxygen", bondType: "Nonpolar covalent", category: "Gases" },
  NaCl: { name: "Sodium Chloride", bondType: "Ionic", category: "Ionic" },
  C2H6O: { name: "Ethanol", bondType: "Covalent", category: "Organic" },
  C2H4: { name: "Ethene", bondType: "Covalent", category: "Organic" },
  C6H12O6: {
    name: "Glucose",
    bondType: "Covalent",
    category: "Biochemistry",
    description: "Primary blood sugar — fuel for cellular respiration. Plants make it via photosynthesis.",
  },
  H2O4S: {
    name: "Sulfuric Acid",
    bondType: "Covalent",
    category: "Acids",
    description: "Strong diprotic acid — used in car batteries, fertilizers, and chemical industry.",
  },
  H4N2O3: {
    name: "Ammonium Nitrate",
    bondType: "Ionic",
    category: "Fertilizers",
    description: "Ionic compound of NH₄⁺ and NO₃⁻ — widely used in fertilizers and (historically) explosives.",
  },
  HNO3: {
    name: "Nitric Acid",
    bondType: "Covalent",
    category: "Acids",
    description: "Strong acid used in fertilizers and gold processing (aqua regia with HCl).",
  },
};

export function identifyLocally(atoms: AtomDef[], bonds: BondDef[]): CompoundIdentification | null {
  const library = findLibraryMatch(atoms, bonds);
  if (library) {
    return {
      name: library.name,
      formula: computeHillFormula(atoms),
      formulaDisplay: library.formula,
      description: library.description,
      bondType: library.bondType,
      category: library.category,
      source: "library",
    };
  }

  const formula = computeHillFormula(atoms);
  if (!formula) return null;

  const alias = FORMULA_ALIASES[formula];
  if (alias) {
    return {
      name: alias.name ?? formula,
      formula,
      formulaDisplay: formatFormulaDisplay(formula),
      description: alias.category ? `${alias.name} — ${alias.category} compound` : undefined,
      bondType: alias.bondType,
      category: alias.category,
      source: "formula",
    };
  }

  return null;
}

export async function identifyCompound(
  atoms: AtomDef[],
  bonds: BondDef[],
): Promise<CompoundIdentification> {
  const formula = computeHillFormula(atoms);
  const formulaDisplay = formatFormulaDisplay(formula);

  if (atoms.length === 0) {
    return {
      name: "Empty",
      formula: "",
      formulaDisplay: "",
      description: "Add atoms to start building a molecule.",
      source: "unknown",
    };
  }

  const local = identifyLocally(atoms, bonds);
  if (local?.source === "library") return local;

  const smiles = generateSmiles(atoms, bonds);

  try {
    const params = new URLSearchParams();
    if (smiles) params.set("smiles", smiles);
    params.set("formula", formula);

    const res = await fetch(`/api/chemistry/identify?${params.toString()}`);
    if (res.ok) {
      const data = (await res.json()) as CompoundIdentification;
      if (data.name && data.source !== "unknown") {
        const mw =
          data.molecularWeight != null && !Number.isNaN(Number(data.molecularWeight))
            ? Number(data.molecularWeight)
            : undefined;
        return {
          ...data,
          formula,
          formulaDisplay: data.formulaDisplay || formulaDisplay,
          molecularWeight: mw,
        };
      }
    }
  } catch {
    /* fall through to local/formula fallback */
  }

  if (local) return local;

  const unbonded = bonds.length === 0 && atoms.length > 1;
  return {
    name: unbonded ? "Unbonded Atoms" : "Unknown Compound",
    formula,
    formulaDisplay,
    description: unbonded
      ? "Connect atoms with bonds to form a molecule, then we'll identify the substance."
      : `Formula ${formulaDisplay} — not found in our database. Try adding standard bonds or check your structure.`,
    source: "unknown",
  };
}

export function inferBondType(atoms: AtomDef[], bonds: BondDef[]): string {
  const symbols = new Set(atoms.map((a) => a.element));
  const hasMetal = symbols.has("Na") || symbols.has("Ca");
  const hasNonMetal = [...symbols].some((s) => s === "Cl" || s === "O" || s === "H");
  if (hasMetal && hasNonMetal && bonds.length <= 1) return "Ionic (simplified)";
  if (bonds.some((b) => b.order >= 2)) return "Covalent (multiple bond)";
  if (bonds.length > 0) return "Covalent";
  return "Not bonded";
}

export function countValenceWarnings(atoms: AtomDef[], bonds: BondDef[]): string[] {
  const valence: Partial<Record<ElementSymbol, number>> = {
    H: 1,
    C: 4,
    N: 3,
    O: 2,
    F: 1,
    Cl: 1,
    Na: 1,
    S: 2,
    P: 3,
    Ca: 2,
  };
  const used = new Array(atoms.length).fill(0);
  for (const b of bonds) {
    used[b.from] += b.order;
    used[b.to] += b.order;
  }
  const warnings: string[] = [];
  atoms.forEach((a, i) => {
    const max = valence[a.element];
    if (max !== undefined && used[i] > max) {
      warnings.push(`${a.element} atom #${i + 1} has ${used[i]} bonds (typical max ${max})`);
    }
  });
  return warnings;
}
