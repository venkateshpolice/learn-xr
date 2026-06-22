import { ELEMENTS, type AtomDef, type BondDef, type ElementSymbol } from "@/data/molecules-data";

const SCALE = 1.35;

const MAX_VALENCE: Partial<Record<ElementSymbol, number>> = {
  H: 1, C: 4, N: 4, O: 2, F: 1, Cl: 1, Na: 1, S: 6, P: 5, Ca: 2,
};

const METALS = new Set<ElementSymbol>(["Na", "Ca"]);

function fibonacciPosition(i: number, n: number, radius: number): [number, number, number] {
  if (n <= 1) return [0, 0, 0];
  const phi = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (i / (n - 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = phi * i;
  return [Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius];
}

function dist(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function inferBondsFromGeometry(atoms: AtomDef[]): BondDef[] {
  const bonds: BondDef[] = [];
  const used = new Array(atoms.length).fill(0);

  const pairs: { i: number; j: number; d: number }[] = [];
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      pairs.push({ i, j, d: dist(atoms[i].position, atoms[j].position) });
    }
  }
  pairs.sort((a, b) => a.d - b.d);

  for (const { i, j, d } of pairs) {
    const ri = ELEMENTS[atoms[i].element].radius * SCALE;
    const rj = ELEMENTS[atoms[j].element].radius * SCALE;
    const maxD = (ri + rj) * 1.35;
    if (d > maxD) continue;

    const vi = MAX_VALENCE[atoms[i].element] ?? 4;
    const vj = MAX_VALENCE[atoms[j].element] ?? 4;
    if (used[i] >= vi || used[j] >= vj) continue;

    const dup = bonds.some(
      (b) => (b.from === i && b.to === j) || (b.from === j && b.to === i),
    );
    if (dup) continue;

    bonds.push({ from: i, to: j, order: 1 });
    used[i]++;
    used[j]++;
  }
  return bonds;
}

/** NH₄⁺ tetrahedron + NO₃⁻ trigonal planar (ionic pair). */
function ammoniumNitrate(): { atoms: AtomDef[]; bonds: BondDef[] } {
  const s = SCALE;
  const atoms: AtomDef[] = [
    { element: "N", position: [-1.8 * s, 0, 0] },
    { element: "H", position: [-1.8 * s, 0.75 * s, 0.75 * s] },
    { element: "H", position: [-1.8 * s, -0.75 * s, 0.75 * s] },
    { element: "H", position: [-1.8 * s, -0.75 * s, -0.75 * s] },
    { element: "H", position: [-1.8 * s, 0.75 * s, -0.75 * s] },
    { element: "N", position: [1.5 * s, 0, 0] },
    { element: "O", position: [2.2 * s, 0.9 * s, 0] },
    { element: "O", position: [2.2 * s, -0.45 * s, 0.78 * s] },
    { element: "O", position: [2.2 * s, -0.45 * s, -0.78 * s] },
  ];
  const bonds: BondDef[] = [
    { from: 0, to: 1, order: 1 }, { from: 0, to: 2, order: 1 },
    { from: 0, to: 3, order: 1 }, { from: 0, to: 4, order: 1 },
    { from: 5, to: 6, order: 1 }, { from: 5, to: 7, order: 1 }, { from: 5, to: 8, order: 1 },
  ];
  return { atoms, bonds };
}

const COMPOSITION_TEMPLATES: Record<string, () => { atoms: AtomDef[]; bonds: BondDef[] }> = {
  H4N2O3: ammoniumNitrate,
};

/** Always produces a 3D model for any valid element composition. */
export function generateGenericMolecule(
  counts: Map<ElementSymbol, number>,
  hillFormula: string,
): { atoms: AtomDef[]; bonds: BondDef[] } {
  const template = COMPOSITION_TEMPLATES[hillFormula];
  if (template) return template();

  const atomList: ElementSymbol[] = [];
  for (const [element, count] of counts) {
    for (let i = 0; i < count; i++) atomList.push(element);
  }

  const n = atomList.length;
  const hasMetal = atomList.some((e) => METALS.has(e));
  const radius = 1.2 + n * 0.08;

  const atoms: AtomDef[] = atomList.map((element, i) => ({
    element,
    position: fibonacciPosition(i, n, radius),
  }));

  if (hasMetal && n === 2) {
    atoms[0].position = [-1.4 * SCALE, 0, 0];
    atoms[1].position = [1.4 * SCALE, 0, 0];
    return { atoms, bonds: [{ from: 0, to: 1, order: 1 }] };
  }

  return { atoms, bonds: inferBondsFromGeometry(atoms) };
}
