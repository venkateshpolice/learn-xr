import type { LensType } from "@/lib/lensPhysics";

/** Cross-section radii for lathe/side-view silhouettes (y = height along lens, x = radius). */
export const LENS_PROFILE = {
  convex: { halfH: 2.2, edgeR: 0.16, apexR: 0.78 },
  concave: { halfH: 2.2, waistR: 0.12, edgeR: 0.62 },
} as const;

export function lensRadiusAtHeight(lensType: LensType, y: number): number {
  const halfH = LENS_PROFILE[lensType].halfH;
  const norm = Math.min(Math.abs(y) / halfH, 1);

  if (lensType === "convex") {
    const { edgeR, apexR } = LENS_PROFILE.convex;
    return edgeR + (apexR - edgeR) * (1 - norm * norm);
  }

  const { waistR, edgeR } = LENS_PROFILE.concave;
  return waistR + (edgeR - waistR) * (norm * norm);
}

export function buildLensProfile2D(lensType: LensType, steps = 32): { x: number; y: number }[] {
  const halfH = LENS_PROFILE[lensType].halfH;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = -halfH + t * 2 * halfH;
    pts.push({ x: lensRadiusAtHeight(lensType, y), y });
  }
  return pts;
}

export function buildLensSilhouettePath(
  lensType: LensType,
  cx: number,
  cy: number,
  heightPx: number,
  steps = 28,
): string {
  const profile = buildLensProfile2D(lensType, steps);
  const halfH = LENS_PROFILE[lensType].halfH;
  const scale = heightPx / (2 * halfH);

  let d = "";
  for (let i = 0; i < profile.length; i++) {
    const px = cx - profile[i].x * scale;
    const py = cy + profile[i].y * scale;
    d += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
  }
  for (let i = profile.length - 1; i >= 0; i--) {
    const px = cx + profile[i].x * scale;
    const py = cy + profile[i].y * scale;
    d += ` L ${px} ${py}`;
  }
  return `${d} Z`;
}

export function lensHolderRadius(lensType: LensType): number {
  return lensType === "convex"
    ? LENS_PROFILE.convex.apexR * 3.05
    : LENS_PROFILE.concave.edgeR * 3.55;
}
