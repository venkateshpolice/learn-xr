export const TANK = {
  width: 1.35,
  depth: 0.6,
  height: 2.5,
  wall: 0.045,
};

export const RHO = 1000;
export const G = 9.8;

/** Circular hole radius (m) — small bore for demo tank */
export const HOLE_RADIUS = 0.005;
export const HOLE_AREA = Math.PI * HOLE_RADIUS * HOLE_RADIUS;

/** Speed up drainage for classroom demo (real emptying would take much longer) */
export const DRAIN_TIME_SCALE = 750;

export function tankInnerWidth(): number {
  return TANK.width - TANK.wall * 2.4;
}

export function tankInnerDepth(): number {
  return TANK.depth - TANK.wall * 2.4;
}

export function tankInnerCrossSection(): number {
  return tankInnerWidth() * tankInnerDepth();
}

export function tankMaxVolume(): number {
  return tankInnerCrossSection() * TANK.height;
}

/** Current water volume (m³) */
export function waterVolume(fillLevel: number): number {
  return Math.max(0, Math.min(1, fillLevel)) * tankMaxVolume();
}

/** Volume flow rate through one hole (m³/s) — Q = A·v */
export function holeOutflowRate(fillLevel: number, hole: TankHole): number {
  const v = jetSpeed(fillLevel, hole);
  if (v <= 0) return 0;
  return HOLE_AREA * v;
}

/** Total outflow from all submerged holes (m³/s) */
export function totalOutflowRate(fillLevel: number, holes: TankHole[]): number {
  return holes.reduce((sum, h) => sum + holeOutflowRate(fillLevel, h), 0);
}

/** How fast fillLevel (0–1) drops per second */
export function fillLevelDrainRate(fillLevel: number, holes: TankHole[]): number {
  if (fillLevel <= 0) return 0;
  const q = totalOutflowRate(fillLevel, holes);
  if (q <= 0) return 0;
  return (q / tankMaxVolume()) * DRAIN_TIME_SCALE;
}

/** Advance fill level after dt seconds of draining */
export function drainFillLevel(fillLevel: number, holes: TankHole[], dt: number): number {
  const rate = fillLevelDrainRate(fillLevel, holes);
  if (rate <= 0) return fillLevel;
  return Math.max(0, fillLevel - rate * dt);
}

export function formatVolumeLiters(m3: number): string {
  return `${(m3 * 1000).toFixed(1)} L`;
}

export function formatFlowRate(m3s: number): string {
  const Ls = m3s * 1000;
  if (Ls < 0.01) return `${(Ls * 1000).toFixed(1)} mL/s`;
  return `${Ls.toFixed(2)} L/s`;
}

export interface TankHole {
  id: string;
  /** 0 = bottom, 1 = top of tank */
  heightFraction: number;
}

export function waterSurfaceHeight(fillLevel: number): number {
  return Math.max(0, Math.min(1, fillLevel)) * TANK.height;
}

export function holeHeight(hole: TankHole): number {
  return hole.heightFraction * TANK.height;
}

/** Gauge pressure at hole (Pa) — P = ρgh, h = depth below surface */
export function pressureAtHole(fillLevel: number, hole: TankHole): number {
  const surface = waterSurfaceHeight(fillLevel);
  const hy = holeHeight(hole);
  const depth = surface - hy;
  if (depth <= 0) return 0;
  return RHO * G * depth;
}

/** Torricelli exit speed (m/s) — v = √(2gh) */
export function jetSpeed(fillLevel: number, hole: TankHole): number {
  const surface = waterSurfaceHeight(fillLevel);
  const hy = holeHeight(hole);
  const depth = surface - hy;
  if (depth <= 0) return 0;
  return Math.sqrt(2 * G * depth);
}

/** Horizontal range on level ground (m) — R = 2√(H(H−h)) for hole h below surface H */
export function jetRange(fillLevel: number, hole: TankHole): number {
  const H = waterSurfaceHeight(fillLevel);
  const h = holeHeight(hole);
  const depth = H - h;
  if (depth <= 0 || H <= 0) return 0;
  return 2 * Math.sqrt(H * depth);
}

export function formatPressure(pa: number): string {
  if (pa >= 1000) return `${(pa / 1000).toFixed(2)} kPa`;
  return `${Math.round(pa)} Pa`;
}

export function formatSpeed(ms: number): string {
  return `${ms.toFixed(2)} m/s`;
}

export function formatDepth(m: number): string {
  return `${m.toFixed(2)} m`;
}

export function createHole(heightFraction: number): TankHole {
  return {
    id: `hole-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    heightFraction: Math.max(0.08, Math.min(0.92, heightFraction)),
  };
}

export interface HoleReading {
  hole: TankHole;
  depthBelowSurface: number;
  pressurePa: number;
  speedMs: number;
  rangeM: number;
  flowing: boolean;
}

export function computeHoleReadings(fillLevel: number, holes: TankHole[]): HoleReading[] {
  const surface = waterSurfaceHeight(fillLevel);
  return holes.map((hole) => {
    const hy = holeHeight(hole);
    const depth = surface - hy;
    const flowing = depth > 0.02;
    return {
      hole,
      depthBelowSurface: Math.max(0, depth),
      pressurePa: pressureAtHole(fillLevel, hole),
      speedMs: jetSpeed(fillLevel, hole),
      rangeM: jetRange(fillLevel, hole),
      flowing,
    };
  });
}
