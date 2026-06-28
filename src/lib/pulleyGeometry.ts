/** Rope paths and pulley positions for classroom-style pulley rigs (front view, z=0). */

export const PULLEY_CFG = {
  ceilingY: 4.05,
  wheelR: 0.26,
  loadBaseY: 0.45,
  maxLift: 2.1,
};

export interface PulleyWheelSpec {
  id: string;
  position: [number, number, number];
  radius: number;
  fixed: boolean;
}

export interface PulleyRigSpec {
  wheels: PulleyWheelSpec[];
  rope: [number, number, number][];
  loadPosition: [number, number, number];
  effortPosition: [number, number, number];
  ropeAnchor: [number, number, number];
  label: string;
}

function lerpY(lift: number) {
  return PULLEY_CFG.loadBaseY + lift * PULLEY_CFG.maxLift;
}

function effortY(lift: number, segments: number, effortPull: number) {
  const pullTravel = lift * PULLEY_CFG.maxLift * segments + effortPull * 0.9;
  return PULLEY_CFG.ceilingY - 0.55 - pullTravel;
}

/** Arc over pulley from angle a0 to a1 (radians, 0 = right, PI = left). */
function wheelArc(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
  steps = 10,
): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = a0 + (a1 - a0) * t;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0]);
  }
  return pts;
}

function line(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): [number, number, number][] {
  return [
    [x0, y0, 0],
    [x1, y1, 0],
  ];
}

function concat(...parts: [number, number, number][][]): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (const p of parts) {
    if (out.length && p.length) {
      const last = out[out.length - 1];
      const first = p[0];
      if (last[0] === first[0] && last[1] === first[1]) {
        out.push(...p.slice(1));
      } else {
        out.push(...p);
      }
    } else {
      out.push(...p);
    }
  }
  return out;
}

/** Single fixed pulley — changes direction only (MA = 1). */
function layoutFixedOnly(lift: number, effortPull: number): PulleyRigSpec {
  const { ceilingY, wheelR } = PULLEY_CFG;
  const cx = 0;
  const loadY = lerpY(lift);
  const hookY = loadY + 0.55;
  const effY = effortY(lift, 1, effortPull);

  const wheels: PulleyWheelSpec[] = [
    { id: "fixed", position: [cx, ceilingY, 0], radius: wheelR, fixed: true },
  ];

  const rope = concat(
    line(0.75, hookY, cx - wheelR, ceilingY),
    wheelArc(cx, ceilingY, wheelR, Math.PI, 0, 14),
    line(cx + wheelR, ceilingY, -0.85, effY),
  );

  return {
    wheels,
    rope,
    loadPosition: [0.75, loadY, 0],
    effortPosition: [-0.85, effY, 0],
    ropeAnchor: [0.75, hookY, 0],
    label: "Fixed pulley",
  };
}

/** Fixed + movable pulley — classic MA = 2. */
function layoutMovablePair(lift: number, effortPull: number): PulleyRigSpec {
  const { ceilingY, wheelR } = PULLEY_CFG;
  const loadY = lerpY(lift);
  const movY = loadY + 0.52;
  const effY = effortY(lift, 2, effortPull);
  const anchorX = -1.05;

  const wheels: PulleyWheelSpec[] = [
    { id: "fixed", position: [0, ceilingY, 0], radius: wheelR, fixed: true },
    { id: "movable", position: [0.42, movY, 0], radius: wheelR * 0.92, fixed: false },
  ];

  const rope = concat(
    line(anchorX, ceilingY, anchorX, movY),
    line(anchorX, movY, 0.42 - wheelR * 0.92, movY),
    wheelArc(0.42, movY, wheelR * 0.92, Math.PI, 0, 12),
    line(0.42 + wheelR * 0.92, movY, 0, ceilingY - wheelR),
    wheelArc(0, ceilingY, wheelR, Math.PI, 0, 14),
    line(0 + wheelR, ceilingY, -0.75, effY),
  );

  return {
    wheels,
    rope,
    loadPosition: [0.42, loadY, 0],
    effortPosition: [-0.75, effY, 0],
    ropeAnchor: [anchorX, ceilingY, 0],
    label: "Fixed + movable",
  };
}

/** One fixed double + movable — 3 supporting rope segments (MA = 3). */
function layoutTriple(lift: number, effortPull: number): PulleyRigSpec {
  const { ceilingY, wheelR } = PULLEY_CFG;
  const loadY = lerpY(lift);
  const movY = loadY + 0.5;
  const effY = effortY(lift, 3, effortPull);
  const anchorX = -1.15;

  const wheels: PulleyWheelSpec[] = [
    { id: "fixed-a", position: [-0.35, ceilingY, 0], radius: wheelR * 0.9, fixed: true },
    { id: "fixed-b", position: [0.35, ceilingY, 0], radius: wheelR * 0.9, fixed: true },
    { id: "movable", position: [0.38, movY, 0], radius: wheelR * 0.88, fixed: false },
  ];

  const rM = wheelR * 0.88;
  const rF = wheelR * 0.9;
  const movX = 0.38;

  const rope = concat(
    line(anchorX, ceilingY, anchorX, movY),
    line(anchorX, movY, movX - rM, movY),
    wheelArc(movX, movY, rM, Math.PI, 0, 10),
    line(movX + rM, movY, 0.35, ceilingY - rF),
    wheelArc(0.35, ceilingY, rF, -Math.PI / 2, Math.PI / 2, 10),
    line(0.35 - rF, ceilingY, -0.35 + rF, ceilingY),
    wheelArc(-0.35, ceilingY, rF, 0, Math.PI, 10),
    line(-0.35 - rF, ceilingY, -0.8, effY),
  );

  return {
    wheels,
    rope,
    loadPosition: [0.38, loadY, 0],
    effortPosition: [-0.8, effY, 0],
    ropeAnchor: [anchorX, ceilingY, 0],
    label: "3-segment tackle",
  };
}

/** Block & tackle — 4 supporting segments (MA = 4). */
function layoutQuad(lift: number, effortPull: number): PulleyRigSpec {
  const { ceilingY, wheelR } = PULLEY_CFG;
  const loadY = lerpY(lift);
  const movY = loadY + 0.48;
  const effY = effortY(lift, 4, effortPull);
  const anchorX = -1.2;

  const wheels: PulleyWheelSpec[] = [
    { id: "fixed-a", position: [-0.38, ceilingY, 0], radius: wheelR * 0.88, fixed: true },
    { id: "fixed-b", position: [0.38, ceilingY, 0], radius: wheelR * 0.88, fixed: true },
    { id: "movable-a", position: [-0.2, movY, 0], radius: wheelR * 0.82, fixed: false },
    { id: "movable-b", position: [0.42, movY, 0], radius: wheelR * 0.82, fixed: false },
  ];

  const rF = wheelR * 0.88;
  const rM = wheelR * 0.82;

  const rope = concat(
    line(anchorX, ceilingY, anchorX, movY),
    line(anchorX, movY, -0.2 - rM, movY),
    wheelArc(-0.2, movY, rM, Math.PI, 0, 8),
    line(-0.2 + rM, movY, 0.38, ceilingY - rF),
    wheelArc(0.38, ceilingY, rF, -Math.PI / 2, Math.PI / 2, 10),
    line(0.38 - rF, ceilingY, 0.42 + rM, movY),
    wheelArc(0.42, movY, rM, 0, Math.PI, 8),
    line(0.42 - rM, movY, -0.38, ceilingY - rF),
    wheelArc(-0.38, ceilingY, rF, Math.PI / 2, Math.PI, 8),
    line(-0.38 - rF, ceilingY, -0.78, effY),
  );

  return {
    wheels,
    rope,
    loadPosition: [0.1, loadY, 0],
    effortPosition: [-0.78, effY, 0],
    ropeAnchor: [anchorX, ceilingY, 0],
    label: "Block & tackle",
  };
}

export function computePulleyRig(
  segments: number,
  lift: number,
  effortPull: number,
): PulleyRigSpec {
  const n = Math.max(1, Math.min(4, Math.round(segments)));
  if (n === 1) return layoutFixedOnly(lift, effortPull);
  if (n === 2) return layoutMovablePair(lift, effortPull);
  if (n === 3) return layoutTriple(lift, effortPull);
  return layoutQuad(lift, effortPull);
}
