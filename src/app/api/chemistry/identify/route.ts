import { NextRequest, NextResponse } from "next/server";

const PUG = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";

/** Fast-path CIDs for common classroom molecules (PubChem). */
const KNOWN_CIDS: Record<string, number> = {
  H2O: 962,
  HCl: 313,
  CO2: 280,
  CH4: 297,
  NH3: 222,
  O2: 977,
  NaCl: 5234,
  C2H6O: 702,
  C2H4: 6325,
  C6H12O6: 5793,
  H2O4S: 1118,
  HNO3: 944,
  H2O2: 784,
  H2: 783,
  Cl2: 24526,
  SO2: 1119,
  H2S: 402,
  CaO: 14778,
  CaCO3: 10112,
};

interface PubChemPropertyRow {
  CID: number;
  MolecularFormula?: string;
  IUPACName?: string;
  MolecularWeight?: number;
  Title?: string;
}

async function pubchemFetch<T>(path: string, retries = 3): Promise<T | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(`${PUG}${path}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) return null;
      const data = (await res.json()) as T & { Waiting?: { ListKey: string } };
      if (data && typeof data === "object" && "Waiting" in data && data.Waiting?.ListKey) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        continue;
      }
      return data;
    } catch {
      if (attempt === retries - 1) return null;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return null;
}

function pickBestName(synonyms: string[], formula: string): string {
  const skip = /^(CID \d+|UNII-|SCHEMBL|DTXSID|CHEBI:|HMDB|KEGG|EINECS|MFCD)/i;
  const prefer = /hydrochloric|water|methane|ammonia|ethanol|glucose|oxygen|carbon dioxide/i;

  const scored = synonyms
    .filter((s) => s && !skip.test(s) && s.length < 80)
    .map((s) => {
      let score = 0;
      if (prefer.test(s)) score += 5;
      if (/acid/i.test(s)) score += 3;
      if (new RegExp(`^${formula}$`, "i").test(s)) score -= 3;
      if (s.split(" ").length <= 4) score += 2;
      if (/^[A-Z][a-z]/.test(s)) score += 1;
      if (/^\d/.test(s)) score -= 5;
      return { s, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.s ?? synonyms.find((s) => !skip.test(s)) ?? formula;
}

async function resolveByCid(cid: number, formula: string) {
  const [props, synData, descData] = await Promise.all([
    pubchemFetch<{ PropertyTable: { Properties: PubChemPropertyRow[] } }>(
      `/compound/cid/${cid}/property/MolecularFormula,IUPACName,MolecularWeight,Title/JSON`,
    ),
    pubchemFetch<{ InformationList: { Information: { Synonym: string[] }[] } }>(
      `/compound/cid/${cid}/synonyms/JSON`,
    ),
    pubchemFetch<{ Record: { Description?: string }[] }>(`/compound/cid/${cid}/description/JSON`),
  ]);

  const row = props?.PropertyTable?.Properties?.[0];
  const synonyms = synData?.InformationList?.Information?.[0]?.Synonym ?? [];
  const description = descData?.Record?.[0]?.Description;

  const commonName =
    row?.Title ||
    pickBestName(synonyms, formula) ||
    row?.IUPACName ||
    formula;

  return {
    name: commonName,
    iupacName: row?.IUPACName,
    formula: row?.MolecularFormula ?? formula,
    description: description?.slice(0, 500),
    synonyms: synonyms.slice(0, 8),
    cid,
    molecularWeight: row?.MolecularWeight != null ? Number(row.MolecularWeight) : undefined,
    source: "pubchem" as const,
  };
}

async function cidsFromSmiles(smiles: string): Promise<number[]> {
  const encoded = encodeURIComponent(smiles);
  const data = await pubchemFetch<{ IdentifierList: { CID: number[] } }>(
    `/compound/smiles/${encoded}/cids/JSON`,
  );
  return data?.IdentifierList?.CID ?? [];
}

async function cidsFromFormula(formula: string): Promise<number[]> {
  const data = await pubchemFetch<{ IdentifierList: { CID: number[] } }>(
    `/compound/formula/${encodeURIComponent(formula)}/cids/JSON`,
  );
  return data?.IdentifierList?.CID ?? [];
}

export async function GET(request: NextRequest) {
  const smiles = request.nextUrl.searchParams.get("smiles");
  const formula = request.nextUrl.searchParams.get("formula") ?? "";

  if (!formula && !smiles) {
    return NextResponse.json({ error: "formula or smiles required" }, { status: 400 });
  }

  let cid: number | undefined = KNOWN_CIDS[formula];

  if (!cid && smiles) {
    const cids = await cidsFromSmiles(smiles);
    cid = cids[0];
  }
  if (!cid && formula) {
    const cids = await cidsFromFormula(formula);
    cid = cids[0];
  }

  if (!cid) {
    return NextResponse.json({
      name: formula || "Unknown",
      formula,
      formulaDisplay: formula,
      source: "unknown",
    });
  }

  const result = await resolveByCid(cid, formula);
  return NextResponse.json({
    ...result,
    formulaDisplay: result.formula,
  });
}
