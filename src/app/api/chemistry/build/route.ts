import { NextRequest, NextResponse } from "next/server";
import {
  buildFromFormulaLocal,
  parseFormulaInput,
  compositionToHill,
  formatConventionalFormula,
  formatFormulaDisplay,
} from "@/lib/formula-builder";
import { fetchPubChem3DStructure } from "@/lib/pubchem-structure";
import { generateGenericMolecule } from "@/lib/molecule-generator";
import { generateSmiles } from "@/lib/molecule-chemistry";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("formula") ?? "";
  const counts = parseFormulaInput(raw);

  if (!counts) {
    return NextResponse.json(
      { ok: false, error: "Invalid formula. Try nh4no3, c6h12o6, h2so4 (any case)." },
      { status: 400 },
    );
  }

  const hill = compositionToHill(counts);
  const conventional = formatConventionalFormula(counts);
  const formulaDisplay = formatFormulaDisplay(conventional);
  const expectedAtoms = [...counts.values()].reduce((a, b) => a + b, 0);

  const local = buildFromFormulaLocal(raw);
  if (local.ok && local.atoms.length === expectedAtoms) {
    return NextResponse.json({ ...local, cid: undefined });
  }

  try {
    const smiles = local.ok ? generateSmiles(local.atoms, local.bonds) : null;
    const pubchem = await fetchPubChem3DStructure(hill, smiles, conventional);

    if (pubchem && pubchem.atoms.length > 0) {
      return NextResponse.json({
        ok: true,
        atoms: pubchem.atoms,
        bonds: pubchem.bonds,
        formula: hill,
        formulaConventional: conventional,
        formulaDisplay,
        source: "pubchem",
        cid: pubchem.cid,
        molecule: local.ok ? local.molecule : undefined,
      });
    }
  } catch {
    /* fall through to generic */
  }

  const generic = generateGenericMolecule(counts, hill);
  if (generic.atoms.length === expectedAtoms) {
    return NextResponse.json({
      ok: true,
      atoms: generic.atoms,
      bonds: generic.bonds,
      formula: hill,
      formulaConventional: conventional,
      formulaDisplay,
      source: "generated",
      molecule: local.ok ? local.molecule : undefined,
    });
  }

  if (local.ok) {
    return NextResponse.json({ ...local, cid: undefined });
  }

  return NextResponse.json({
    ok: false,
    error: `Could not parse or build ${raw}. Check the formula uses valid element symbols.`,
  });
}
