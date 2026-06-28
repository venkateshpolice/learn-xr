import type { MachineType } from "@/data/simple-machines-stages";

export const BEAM_HALF = 3;

export interface MachineInput {
  machine: MachineType;
  fulcrumPos: number;
  loadWeight: number;
  effortWeight: number;
  pulleyCount: number;
  effortPull: number;
  rampAngle: number;
  blockWeight: number;
}

export interface MachineResult {
  mechanicalAdvantage: number;
  requiredEffort: number;
  effortArm: number;
  loadArm: number;
  leverTilt: number;
  loadLift: number;
  rampLength: number;
  rampHeight: number;
  isBalanced: boolean;
  canLift: boolean;
  summary: string;
}

export function computeSimpleMachine(input: MachineInput): MachineResult {
  if (input.machine === "lever") {
    return computeLever(input);
  }
  if (input.machine === "pulley") {
    return computePulley(input);
  }
  return computeInclined(input);
}

function computeLever(input: MachineInput): MachineResult {
  const fulcrumX = -BEAM_HALF + input.fulcrumPos * BEAM_HALF * 2;
  const effortArm = fulcrumX - -BEAM_HALF;
  const loadArm = BEAM_HALF - fulcrumX;
  const ma = loadArm / Math.max(effortArm, 0.15);
  const requiredEffort = input.loadWeight / ma;
  const torqueDiff = input.effortWeight * effortArm - input.loadWeight * loadArm;
  const maxTilt = 0.28;
  const leverTilt = THREE_CLAMP(torqueDiff * 0.022, -maxTilt, maxTilt);
  const canLift = input.effortWeight >= requiredEffort * 0.98;
  const isBalanced = Math.abs(torqueDiff) < 0.35;

  return {
    mechanicalAdvantage: ma,
    requiredEffort,
    effortArm,
    loadArm,
    leverTilt,
    loadLift: canLift ? 0.15 : isBalanced ? 0.05 : 0,
    rampLength: 0,
    rampHeight: 0,
    isBalanced,
    canLift,
    summary: canLift
      ? `MA = ${ma.toFixed(1)} · Effort ${input.effortWeight.toFixed(1)} kg lifts ${input.loadWeight.toFixed(1)} kg load`
      : `Need at least ${requiredEffort.toFixed(1)} kg effort to lift the load`,
  };
}

function computePulley(input: MachineInput): MachineResult {
  const segments = Math.max(1, Math.round(input.pulleyCount));
  const ma = segments;
  const requiredEffort = input.loadWeight / ma;
  const loadLift = Math.min(input.effortPull / ma, 0.85);
  const canLift = input.effortPull * ma >= 0.08;

  return {
    mechanicalAdvantage: ma,
    requiredEffort,
    effortArm: 0,
    loadArm: 0,
    leverTilt: 0,
    loadLift,
    rampLength: 0,
    rampHeight: 0,
    isBalanced: Math.abs(input.effortWeight - requiredEffort) < 0.4,
    canLift,
    summary: `MA = ${ma} · Pull ${requiredEffort.toFixed(1)} kg to hold ${input.loadWeight.toFixed(1)} kg crate`,
  };
}

function computeInclined(input: MachineInput): MachineResult {
  const rad = (input.rampAngle * Math.PI) / 180;
  const rampLength = 7.5;
  const rampHeight = rampLength * Math.sin(rad);
  const ma = rampLength / Math.max(rampHeight, 0.01);
  const requiredEffort = input.blockWeight / ma;
  const canLift = input.effortWeight >= requiredEffort * 0.95;
  const slide = canLift ? Math.min(input.effortWeight / requiredEffort, 1) * 0.55 : 0.05;

  return {
    mechanicalAdvantage: ma,
    requiredEffort,
    effortArm: 0,
    loadArm: 0,
    leverTilt: 0,
    loadLift: slide,
    rampLength,
    rampHeight,
    isBalanced: Math.abs(input.effortWeight - requiredEffort) < 0.35,
    canLift,
    summary: `MA = ${ma.toFixed(1)} · Push ${requiredEffort.toFixed(1)} kg parallel to ramp for ${input.blockWeight.toFixed(1)} kg box`,
  };
}

function THREE_CLAMP(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
