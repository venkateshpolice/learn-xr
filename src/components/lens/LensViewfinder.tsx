"use client";

import type { LensImageResult, LensType } from "@/lib/lensPhysics";
import { buildLensSilhouettePath } from "@/lib/lensGeometry";

function ArrowSvg({
  cx,
  baseY,
  height,
  color,
  opacity = 1,
  dashed = false,
}: {
  cx: number;
  baseY: number;
  height: number;
  color: string;
  opacity?: number;
  dashed?: boolean;
}) {
  const h = Math.abs(height);
  const dir = height >= 0 ? -1 : 1;
  const tipY = baseY + dir * h;
  const headW = Math.max(6, h * 0.35);

  return (
    <g opacity={opacity} strokeDasharray={dashed ? "3 2" : undefined}>
      <line x1={cx} y1={baseY} x2={cx} y2={tipY + dir * headW * 0.6} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <polygon
        points={`${cx},${tipY} ${cx - headW},${tipY + dir * headW} ${cx + headW},${tipY + dir * headW}`}
        fill={color}
      />
    </g>
  );
}

export function LensViewfinder({
  result,
  lensType,
}: {
  result: LensImageResult;
  lensType: LensType;
}) {
  const axisY = 72;
  const lensX = 80;
  const objX = 28;
  const lensPath = buildLensSilhouettePath(lensType, lensX, axisY, 76);

  const mag = Number.isFinite(result.magnification) ? Math.abs(result.magnification) : 3;
  const objH = 28;
  const imgH = Math.min(mag * objH, 52) * (result.isInverted ? -1 : 1);

  const imgX = result.isVirtual
    ? lensX - 18 - Math.min(mag * 8, 24)
    : lensX + 28 + Math.min(mag * 6, 20);

  return (
    <svg viewBox="0 0 160 120" className="w-full h-full bg-[#0a1020]" aria-hidden>
      <path
        d={lensPath}
        fill="rgba(148,163,184,0.2)"
        stroke="rgba(226,232,240,0.75)"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      {lensType === "convex" ? (
        <text x={lensX} y={axisY + 46} textAnchor="middle" fill="rgba(196,181,253,0.55)" fontSize={7} fontWeight={600}>
          CONVEX
        </text>
      ) : (
        <text x={lensX} y={axisY + 46} textAnchor="middle" fill="rgba(148,163,184,0.55)" fontSize={7} fontWeight={600}>
          CONCAVE
        </text>
      )}
      <line x1={8} y1={axisY} x2={152} y2={axisY} stroke="#334155" strokeWidth={1} />
      <ArrowSvg cx={objX} baseY={axisY} height={objH} color="#f97316" />
      {Number.isFinite(result.di) && (
        <ArrowSvg
          cx={imgX}
          baseY={axisY}
          height={imgH}
          color={result.isVirtual ? "#a78bfa" : "#4ade80"}
          opacity={result.isVirtual ? 0.75 : 0.95}
          dashed={result.isVirtual}
        />
      )}
      {result.isVirtual && Number.isFinite(result.di) && (
        <line
          x1={lensX}
          y1={axisY - 8}
          x2={imgX}
          y2={axisY + imgH * (result.isInverted ? 1 : -1) * 0.5}
          stroke="#a78bfa"
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.4}
        />
      )}
      {result.isReal && (
        <line x1={145} y1={axisY - 35} x2={145} y2={axisY + 35} stroke="#64748b" strokeWidth={2} opacity={0.6} />
      )}
    </svg>
  );
}
