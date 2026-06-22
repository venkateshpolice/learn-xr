export type ElementSymbol = "H" | "C" | "N" | "O" | "F" | "Cl" | "Na" | "S" | "P" | "Ca";

export interface ElementInfo {
  symbol: ElementSymbol;
  name: string;
  color: string;
  radius: number;
  atomicNumber: number;
}

export const ELEMENTS: Record<ElementSymbol, ElementInfo> = {
  H: { symbol: "H", name: "Hydrogen", color: "#FFFFFF", radius: 0.31, atomicNumber: 1 },
  C: { symbol: "C", name: "Carbon", color: "#909090", radius: 0.76, atomicNumber: 6 },
  N: { symbol: "N", name: "Nitrogen", color: "#3050F8", radius: 0.71, atomicNumber: 7 },
  O: { symbol: "O", name: "Oxygen", color: "#FF0D0D", radius: 0.66, atomicNumber: 8 },
  F: { symbol: "F", name: "Fluorine", color: "#90E050", radius: 0.57, atomicNumber: 9 },
  Cl: { symbol: "Cl", name: "Chlorine", color: "#1FF01F", radius: 1.02, atomicNumber: 17 },
  Na: { symbol: "Na", name: "Sodium", color: "#AB5CF2", radius: 1.02, atomicNumber: 11 },
  S: { symbol: "S", name: "Sulfur", color: "#FFFF30", radius: 1.05, atomicNumber: 16 },
  P: { symbol: "P", name: "Phosphorus", color: "#FF8000", radius: 1.07, atomicNumber: 15 },
  Ca: { symbol: "Ca", name: "Calcium", color: "#3DFF00", radius: 1.31, atomicNumber: 20 },
};

export interface AtomDef {
  element: ElementSymbol;
  position: [number, number, number];
}

export interface BondDef {
  from: number;
  to: number;
  order: 1 | 2 | 3;
}

export type GradeBand = "middle" | "secondary" | "senior";

export interface MoleculeDef {
  id: string;
  name: string;
  formula: string;
  grade: GradeBand;
  category: string;
  bondType: string;
  description: string;
  facts: string[];
  atoms: AtomDef[];
  bonds: BondDef[];
}

const s = 1.35;

export const MOLECULES: MoleculeDef[] = [
  {
    id: "water",
    name: "Water",
    formula: "H₂O",
    grade: "middle",
    category: "Essential",
    bondType: "Polar covalent",
    description: "The most important molecule for life. Two hydrogen atoms bond to one oxygen in a bent shape.",
    facts: [
      "Bent shape (104.5°) makes water polar — great solvent!",
      "Hydrogen bonds between water molecules explain surface tension.",
      "Covers ~71% of Earth's surface.",
    ],
    atoms: [
      { element: "O", position: [0, 0, 0] },
      { element: "H", position: [0.76 * s, 0.55 * s, 0] },
      { element: "H", position: [-0.76 * s, 0.55 * s, 0] },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
    ],
  },
  {
    id: "co2",
    name: "Carbon Dioxide",
    formula: "CO₂",
    grade: "middle",
    category: "Gases",
    bondType: "Nonpolar covalent",
    description: "A linear molecule produced in respiration and combustion. Key greenhouse gas.",
    facts: [
      "Linear shape — no overall dipole moment.",
      "Plants use CO₂ in photosynthesis to make glucose.",
      "Dry ice is solid CO₂ at −78 °C.",
    ],
    atoms: [
      { element: "C", position: [0, 0, 0] },
      { element: "O", position: [-1.16 * s, 0, 0] },
      { element: "O", position: [1.16 * s, 0, 0] },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 2 },
    ],
  },
  {
    id: "methane",
    name: "Methane",
    formula: "CH₄",
    grade: "middle",
    category: "Hydrocarbons",
    bondType: "Nonpolar covalent",
    description: "Simplest hydrocarbon — tetrahedral shape with four C–H bonds.",
    facts: [
      "Main component of natural gas.",
      "Tetrahedral geometry — all H–C–H angles are 109.5°.",
      "Powerful greenhouse gas (traps heat in atmosphere).",
    ],
    atoms: [
      { element: "C", position: [0, 0, 0] },
      { element: "H", position: [0.63 * s, 0.63 * s, 0.63 * s] },
      { element: "H", position: [-0.63 * s, -0.63 * s, 0.63 * s] },
      { element: "H", position: [-0.63 * s, 0.63 * s, -0.63 * s] },
      { element: "H", position: [0.63 * s, -0.63 * s, -0.63 * s] },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
    ],
  },
  {
    id: "ammonia",
    name: "Ammonia",
    formula: "NH₃",
    grade: "secondary",
    category: "Essential",
    bondType: "Polar covalent",
    description: "Pyramidal molecule used in fertilizers and household cleaners.",
    facts: [
      "Lone pair on nitrogen gives ammonia its fishy smell.",
      "Used to make fertilizers that grow our food.",
      "Can form weak bonds with acids (Brønsted–Lowry base).",
    ],
    atoms: [
      { element: "N", position: [0, 0.2 * s, 0] },
      { element: "H", position: [0.94 * s, -0.27 * s, 0] },
      { element: "H", position: [-0.47 * s, -0.27 * s, 0.81 * s] },
      { element: "H", position: [-0.47 * s, -0.27 * s, -0.81 * s] },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
    ],
  },
  {
    id: "o2",
    name: "Oxygen",
    formula: "O₂",
    grade: "middle",
    category: "Gases",
    bondType: "Nonpolar covalent (double)",
    description: "The gas we breathe — a diatomic molecule with a double bond.",
    facts: [
      "Makes up ~21% of Earth's atmosphere.",
      "Double bond (O=O) is strong — needed for cellular respiration.",
      "Liquid oxygen is pale blue and used in rockets.",
    ],
    atoms: [
      { element: "O", position: [-0.6 * s, 0, 0] },
      { element: "O", position: [0.6 * s, 0, 0] },
    ],
    bonds: [{ from: 0, to: 1, order: 2 }],
  },
  {
    id: "nacl",
    name: "Sodium Chloride",
    formula: "NaCl",
    grade: "middle",
    category: "Ionic",
    bondType: "Ionic",
    description: "Table salt — an ionic compound of Na⁺ and Cl⁻ ions.",
    facts: [
      "Electrons transfer from sodium to chlorine (not shared!).",
      "Forms a crystal lattice in solid state.",
      "Dissolves in water because water is polar.",
    ],
    atoms: [
      { element: "Na", position: [-1.4 * s, 0, 0] },
      { element: "Cl", position: [1.4 * s, 0, 0] },
    ],
    bonds: [{ from: 0, to: 1, order: 1 }],
  },
  {
    id: "hcl",
    name: "Hydrochloric Acid",
    formula: "HCl",
    grade: "secondary",
    category: "Acids",
    bondType: "Polar covalent",
    description: "Strong acid in your stomach (diluted!) — polar H–Cl bond.",
    facts: [
      "HCl dissolves in water to form H⁺ and Cl⁻ ions.",
      "Stomach acid helps digest food (pH ~1.5–3.5).",
      "Used industrially to clean metals and make PVC.",
    ],
    atoms: [
      { element: "H", position: [-0.8 * s, 0, 0] },
      { element: "Cl", position: [0.8 * s, 0, 0] },
    ],
    bonds: [{ from: 0, to: 1, order: 1 }],
  },
  {
    id: "ethanol",
    name: "Ethanol",
    formula: "C₂H₅OH",
    grade: "secondary",
    category: "Organic",
    bondType: "Covalent",
    description: "Alcohol found in beverages and hand sanitizer — contains an –OH group.",
    facts: [
      "–OH (hydroxyl) group makes ethanol soluble in water.",
      "Used as fuel additive and disinfectant.",
      "Metabolized in the liver (ethanol → acetaldehyde).",
    ],
    atoms: [
      { element: "C", position: [-0.75 * s, 0, 0] },
      { element: "C", position: [0.75 * s, 0, 0] },
      { element: "O", position: [1.35 * s, 0.9 * s, 0] },
      { element: "H", position: [-1.25 * s, 0.9 * s, 0] },
      { element: "H", position: [-1.25 * s, -0.5 * s, 0.5 * s] },
      { element: "H", position: [-1.25 * s, -0.5 * s, -0.5 * s] },
      { element: "H", position: [1.25 * s, -0.5 * s, 0] },
      { element: "H", position: [1.25 * s, 0.5 * s, 0] },
      { element: "H", position: [2.0 * s, 0.7 * s, 0] },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
      { from: 0, to: 5, order: 1 },
      { from: 1, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 },
      { from: 2, to: 8, order: 1 },
    ],
  },
  {
    id: "ethene",
    name: "Ethene (Ethylene)",
    formula: "C₂H₄",
    grade: "senior",
    category: "Organic",
    bondType: "Covalent (double bond)",
    description: "Simplest alkene — contains a C=C double bond. Ripens fruit!",
    facts: [
      "Planar molecule — all atoms in one plane.",
      "Double bond = 1 sigma + 1 pi bond.",
      "Plants release ethene gas to ripen fruit.",
    ],
    atoms: [
      { element: "C", position: [-0.67 * s, 0, 0] },
      { element: "C", position: [0.67 * s, 0, 0] },
      { element: "H", position: [-1.2 * s, 0.93 * s, 0] },
      { element: "H", position: [-1.2 * s, -0.93 * s, 0] },
      { element: "H", position: [1.2 * s, 0.93 * s, 0] },
      { element: "H", position: [1.2 * s, -0.93 * s, 0] },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 1, to: 4, order: 1 },
      { from: 1, to: 5, order: 1 },
    ],
  },
  {
    id: "glucose",
    name: "Glucose (simplified)",
    formula: "C₆H₁₂O₆",
    grade: "senior",
    category: "Biochemistry",
    bondType: "Covalent",
    description: "Primary sugar used in cellular respiration — simplified ring representation.",
    facts: [
      "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP (respiration).",
      "Plants make glucose via photosynthesis.",
      "Blood sugar (glucose) fuels your brain and muscles.",
    ],
    atoms: [
      { element: "O", position: [0, 1.2 * s, 0] },
      { element: "C", position: [1.0 * s, 0.6 * s, 0] },
      { element: "C", position: [1.0 * s, -0.6 * s, 0] },
      { element: "C", position: [0, -1.2 * s, 0] },
      { element: "C", position: [-1.0 * s, -0.6 * s, 0] },
      { element: "C", position: [-1.0 * s, 0.6 * s, 0] },
      { element: "O", position: [2.0 * s, 1.0 * s, 0] },
      { element: "H", position: [0, 2.0 * s, 0] },
      { element: "H", position: [1.8 * s, 0.2 * s, 0] },
      { element: "H", position: [1.8 * s, -1.0 * s, 0] },
      { element: "H", position: [0, -2.0 * s, 0] },
      { element: "H", position: [-1.8 * s, -1.0 * s, 0] },
      { element: "H", position: [-1.8 * s, 0.2 * s, 0] },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 1 },
      { from: 2, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 },
      { from: 4, to: 5, order: 1 },
      { from: 5, to: 0, order: 1 },
      { from: 1, to: 6, order: 1 },
      { from: 0, to: 7, order: 1 },
      { from: 1, to: 8, order: 1 },
      { from: 2, to: 9, order: 1 },
      { from: 3, to: 10, order: 1 },
      { from: 4, to: 11, order: 1 },
      { from: 5, to: 12, order: 1 },
    ],
  },
  {
    id: "h2so4",
    name: "Sulfuric Acid",
    formula: "H₂SO₄",
    grade: "secondary",
    category: "Acids",
    bondType: "Covalent",
    description:
      "A strong diprotic acid — central sulfur with two S=O bonds and two –OH groups. Used in car batteries and industry.",
    facts: [
      "H₂SO₄ is one of the most important industrial chemicals worldwide.",
      "Concentrated sulfuric acid is highly corrosive — always add acid to water, never water to acid!",
      "Reacts with metals to produce hydrogen gas (with caution).",
    ],
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
  },
  {
    id: "hno3",
    name: "Nitric Acid",
    formula: "HNO₃",
    grade: "secondary",
    category: "Acids",
    bondType: "Covalent",
    description: "Strong monoprotic acid with a trigonal planar nitrate group — used in fertilizers and gold mining.",
    facts: [
      "Aqua regia (HNO₃ + HCl) can dissolve gold!",
      "Used to make explosives like TNT and nitroglycerin.",
      "Turns skin yellow due to xanthoproteic reaction with proteins.",
    ],
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
  },
];

export const BUILDER_ELEMENTS: ElementSymbol[] = ["H", "C", "N", "O", "Cl", "Na", "S"];

export const QUIZ_QUESTIONS = [
  {
    id: "q1",
    question: "Which molecule has a bent (angular) shape?",
    options: ["CO₂", "H₂O", "CH₄", "NaCl"],
    answer: 1,
    hint: "Think about lone pairs on the central atom.",
  },
  {
    id: "q2",
    question: "What type of bond holds NaCl together?",
    options: ["Covalent", "Ionic", "Metallic", "Hydrogen"],
    answer: 1,
    hint: "Electrons are transferred, not shared.",
  },
  {
    id: "q3",
    question: "Which gas do plants absorb for photosynthesis?",
    options: ["O₂", "N₂", "CO₂", "CH₄"],
    answer: 2,
    hint: "It's a greenhouse gas with two oxygen atoms.",
  },
];

export function getMoleculeById(id: string): MoleculeDef | undefined {
  return MOLECULES.find((m) => m.id === id);
}

export function cloneMolecule(m: MoleculeDef): { atoms: AtomDef[]; bonds: BondDef[] } {
  return {
    atoms: m.atoms.map((a) => ({ ...a, position: [...a.position] as [number, number, number] })),
    bonds: m.bonds.map((b) => ({ ...b })),
  };
}
