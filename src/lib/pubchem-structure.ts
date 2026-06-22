import type { AtomDef, BondDef, ElementSymbol } from "@/data/molecules-data";

const PUG = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";

const ATOMIC_NUMBER_TO_SYMBOL: Record<number, ElementSymbol> = {
  1: "H", 6: "C", 7: "N", 8: "O", 9: "F", 11: "Na", 15: "P", 16: "S", 17: "Cl", 20: "Ca",
};

/** Hill / conventional formula → PubChem CID */
const KNOWN_CIDS: Record<string, number> = {
  H2O: 962, HCl: 313, CO2: 280, CH4: 297, NH3: 222, O2: 977, NaCl: 5234,
  C2H6O: 702, C2H4: 6325, C6H12O6: 5793, H2O4S: 1118, HNO3: 944,
  H2S: 402, SO2: 1119, Cl2: 24526, N2: 947, CaCO3: 10112,
  H4N2O3: 22985, H8N2O4: 22985, CaO: 14778, H2O2: 784, NaOH: 14798,
  KCl: 4873, MgO: 14792, Fe2O3: 14829, CuSO4: 24462,
};

/** Hill formula → PubChem name search fallback */
const FORMULA_NAMES: Record<string, string> = {
  H4N2O3: "ammonium nitrate",
  H8N2O4: "ammonium nitrate",
  H2O4S: "sulfuric acid",
  HNO3: "nitric acid",
  C6H12O6: "glucose",
  C2H6O: "ethanol",
  NaCl: "sodium chloride",
  CaCO3: "calcium carbonate",
};

export interface PubChemStructure {
  atoms: AtomDef[];
  bonds: BondDef[];
  cid: number;
}

interface PubChem3DRecord {
  PC_Compounds?: {
    id?: { id?: { cid?: number } };
    atoms?: { aid?: number[]; element?: number[] };
    bonds?: { aid1?: number[]; aid2?: number[]; order?: number[] };
    coords?: {
      aid?: number[];
      conformers?: { x?: number[]; y?: number[]; z?: number[] }[];
    }[];
  }[];
  Fault?: { Code?: string; Message?: string };
}

async function fetchJson<T>(url: string, retries = 5): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!res.ok) return null;
      const data = (await res.json()) as T & { Waiting?: { ListKey: string } };
      if (data && typeof data === "object" && "Waiting" in data && (data as { Waiting?: unknown }).Waiting) {
        await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
        continue;
      }
      return data;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return null;
}

async function cidsFromFormula(formula: string): Promise<number[]> {
  const data = await fetchJson<{ IdentifierList?: { CID: number[] } }>(
    `${PUG}/compound/formula/${encodeURIComponent(formula)}/cids/JSON`,
  );
  return data?.IdentifierList?.CID ?? [];
}

async function cidsFromName(name: string): Promise<number[]> {
  const data = await fetchJson<{ IdentifierList?: { CID: number[] } }>(
    `${PUG}/compound/name/${encodeURIComponent(name)}/cids/JSON`,
  );
  return data?.IdentifierList?.CID ?? [];
}

async function cidsFromSmiles(smiles: string): Promise<number[]> {
  const data = await fetchJson<{ IdentifierList?: { CID: number[] } }>(
    `${PUG}/compound/smiles/${encodeURIComponent(smiles)}/cids/JSON`,
  );
  return data?.IdentifierList?.CID ?? [];
}

export async function resolveCid(
  hillFormula: string,
  conventional?: string,
  smiles?: string | null,
): Promise<number | null> {
  if (KNOWN_CIDS[hillFormula]) return KNOWN_CIDS[hillFormula];
  if (conventional && KNOWN_CIDS[conventional]) return KNOWN_CIDS[conventional];

  if (smiles) {
    const cids = await cidsFromSmiles(smiles);
    if (cids[0]) return cids[0];
  }

  let cids = await cidsFromFormula(hillFormula);
  if (cids[0]) return cids[0];

  if (conventional && conventional !== hillFormula) {
    cids = await cidsFromFormula(conventional);
    if (cids[0]) return cids[0];
  }

  const name = FORMULA_NAMES[hillFormula] ?? FORMULA_NAMES[conventional ?? ""];
  if (name) {
    cids = await cidsFromName(name);
    if (cids[0]) return cids[0];
  }

  return null;
}

function centerAndScale(atoms: AtomDef[], targetSpan = 5.5): AtomDef[] {
  if (atoms.length === 0) return atoms;

  let cx = 0, cy = 0, cz = 0;
  for (const a of atoms) {
    cx += a.position[0];
    cy += a.position[1];
    cz += a.position[2];
  }
  cx /= atoms.length;
  cy /= atoms.length;
  cz /= atoms.length;

  let maxDist = 0;
  for (const a of atoms) {
    const dx = a.position[0] - cx;
    const dy = a.position[1] - cy;
    const dz = a.position[2] - cz;
    maxDist = Math.max(maxDist, Math.sqrt(dx * dx + dy * dy + dz * dz));
  }
  const scale = maxDist > 0.01 ? targetSpan / (2 * maxDist) : 1;

  return atoms.map((a) => ({
    ...a,
    position: [
      (a.position[0] - cx) * scale,
      (a.position[1] - cy) * scale,
      (a.position[2] - cz) * scale,
    ] as [number, number, number],
  }));
}

function hasRealCoords(atoms: AtomDef[]): boolean {
  return atoms.some((a) => Math.abs(a.position[0]) + Math.abs(a.position[1]) + Math.abs(a.position[2]) > 0.001);
}

export function parsePubChem3DRecord(data: PubChem3DRecord, cid: number): PubChemStructure | null {
  const compound = data.PC_Compounds?.[0];
  const atomBlock = compound?.atoms;
  if (!atomBlock?.element?.length) return null;

  const coordBlock = compound?.coords?.[0];
  const conformer = coordBlock?.conformers?.[0];
  const xs = conformer?.x;
  const ys = conformer?.y;
  const zs = conformer?.z;

  const atoms: AtomDef[] = [];
  for (let i = 0; i < atomBlock.element.length; i++) {
    const atomicNum = atomBlock.element[i];
    const sym = ATOMIC_NUMBER_TO_SYMBOL[atomicNum];
    if (!sym) continue;
    atoms.push({
      element: sym,
      position: [xs?.[i] ?? 0, ys?.[i] ?? 0, zs?.[i] ?? 0],
    });
  }

  if (atoms.length === 0) return null;

  const bonds: BondDef[] = [];
  const bondBlock = compound?.bonds;
  if (bondBlock?.aid1?.length) {
    const aidToIndex = new Map<number, number>();
    atomBlock.aid?.forEach((aid, idx) => aidToIndex.set(aid, idx));

    for (let i = 0; i < bondBlock.aid1.length; i++) {
      const a1 = aidToIndex.get(bondBlock.aid1[i] ?? 0);
      const a2 = aidToIndex.get(bondBlock.aid2?.[i] ?? 0);
      if (a1 === undefined || a2 === undefined) continue;
      const order = Math.min(3, Math.max(1, bondBlock.order?.[i] ?? 1)) as 1 | 2 | 3;
      const dup = bonds.some(
        (b) => (b.from === a1 && b.to === a2) || (b.from === a2 && b.to === a1),
      );
      if (!dup) bonds.push({ from: a1, to: a2, order });
    }
  }

  const scaled = centerAndScale(atoms);
  if (!hasRealCoords(scaled)) return null;

  return { atoms: scaled, bonds, cid };
}

async function fetchRecord(cid: number, recordType?: "3d"): Promise<PubChem3DRecord | null> {
  const suffix = recordType ? `?record_type=${recordType}` : "";
  return fetchJson<PubChem3DRecord>(`${PUG}/compound/cid/${cid}/record/JSON${suffix}`);
}

export async function fetchPubChem3DStructure(
  hillFormula: string,
  smiles?: string | null,
  conventional?: string,
): Promise<PubChemStructure | null> {
  const cid = await resolveCid(hillFormula, conventional, smiles);
  if (!cid) return null;

  const record3d = await fetchRecord(cid, "3d");
  if (record3d && !record3d.Fault) {
    const parsed = parsePubChem3DRecord(record3d, cid);
    if (parsed) return parsed;
  }

  const recordDefault = await fetchRecord(cid);
  if (recordDefault && !recordDefault.Fault) {
    return parsePubChem3DRecord(recordDefault, cid);
  }

  return null;
}
