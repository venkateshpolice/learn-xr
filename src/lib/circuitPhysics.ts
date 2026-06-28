import type { CircuitLayout } from "@/data/circuit-stages";

export const CELL_VOLTAGE = 3;

export interface CircuitInput {
  layout: CircuitLayout;
  switchClosed: boolean;
  bulbCount: number;
  insulatorInPath: boolean;
}

export interface CircuitResult {
  isComplete: boolean;
  current: number;
  totalResistance: number;
  bulbBrightness: number[];
  layoutLabel: string;
  summary: string;
  electronsFlow: boolean;
}

export function simulateCircuit(input: CircuitInput): CircuitResult {
  const bulbs = Math.max(1, Math.min(3, Math.round(input.bulbCount)));
  const R_BULB = 6;

  if (!input.switchClosed) {
    return offResult(bulbs, "Switch is OPEN — circuit broken, no current flows.");
  }

  if (input.insulatorInPath) {
    return offResult(bulbs, "Insulator in the path — charges cannot pass, circuit is open.");
  }

  if (input.layout === "basic" || input.layout === "insulator") {
    const R = R_BULB;
    const I = CELL_VOLTAGE / R;
    return {
      isComplete: true,
      current: I,
      totalResistance: R,
      bulbBrightness: [Math.min(I / 0.5, 1)],
      layoutLabel: "Simple circuit",
      summary: `I = ${I.toFixed(2)} A · One bulb at full brightness`,
      electronsFlow: true,
    };
  }

  if (input.layout === "series") {
    const R = bulbs * R_BULB;
    const I = CELL_VOLTAGE / R;
    const singleI = CELL_VOLTAGE / R_BULB;
    const brightness = Math.min(I / singleI, 1);
    return {
      isComplete: true,
      current: I,
      totalResistance: R,
      bulbBrightness: Array.from({ length: bulbs }, () => brightness),
      layoutLabel: "Series circuit",
      summary: `I = ${I.toFixed(2)} A · ${bulbs} bulbs in one loop — each dimmer (shared voltage)`,
      electronsFlow: true,
    };
  }

  // parallel
  const R_eq = R_BULB / bulbs;
  const I_total = CELL_VOLTAGE / R_eq;
  return {
    isComplete: true,
    current: I_total,
    totalResistance: R_eq,
    bulbBrightness: Array.from({ length: bulbs }, () => 1),
    layoutLabel: "Parallel circuit",
    summary: `I_total = ${I_total.toFixed(2)} A · Each branch gets full ${CELL_VOLTAGE} V — bright bulbs`,
    electronsFlow: true,
  };
}

function offResult(bulbs: number, summary: string): CircuitResult {
  return {
    isComplete: false,
    current: 0,
    totalResistance: Infinity,
    bulbBrightness: Array.from({ length: bulbs }, () => 0),
    layoutLabel: "Open circuit",
    summary,
    electronsFlow: false,
  };
}

export interface WireSegment {
  points: [number, number, number][];
  live: boolean;
  isInsulator?: boolean;
}

export interface CircuitGeometry {
  cellPos: [number, number, number];
  switchPos: [number, number, number];
  bulbPositions: [number, number, number][];
  insulatorPos?: [number, number, number];
  wires: WireSegment[];
}

export function buildCircuitGeometry(
  layout: CircuitLayout,
  bulbCount: number,
  showInsulator: boolean,
  insulatorInPath: boolean,
): CircuitGeometry {
  const n = Math.max(1, Math.min(3, Math.round(bulbCount)));

  if (layout === "parallel") {
    return buildParallelGeometry(n);
  }
  if (layout === "series") {
    return buildSeriesGeometry(n);
  }
  return buildBasicGeometry(showInsulator && insulatorInPath);
}

function buildBasicGeometry(showInsulator: boolean): CircuitGeometry {
  const cell: [number, number, number] = [-2.8, 0.25, 0];
  const sw: [number, number, number] = [-1.2, 0.22, 0];
  const bulb: [number, number, number] = [0.8, 0.45, 0];
  const insulator: [number, number, number] = [-0.1, 0.18, 0];

  const wires: WireSegment[] = showInsulator
    ? [
        { points: [terminal(cell, "+"), terminal(sw, "in")], live: true },
        { points: [terminal(sw, "out"), [insulator[0] - 0.3, insulator[1], 0]], live: true },
        { points: [[insulator[0] + 0.3, insulator[1], 0], terminal(bulb, "in")], live: true },
        { points: [terminal(bulb, "out"), [bulb[0], 0.08, 0], [cell[0], 0.08, 0], terminal(cell, "-")], live: true },
        { points: [[insulator[0] - 0.3, insulator[1], 0], [insulator[0] + 0.3, insulator[1], 0]], live: false, isInsulator: true },
      ]
    : [
        { points: [terminal(cell, "+"), terminal(sw, "in")], live: true },
        { points: [terminal(sw, "out"), terminal(bulb, "in")], live: true },
        { points: [terminal(bulb, "out"), [bulb[0], 0.08, 0], [cell[0], 0.08, 0], terminal(cell, "-")], live: true },
      ];

  return {
    cellPos: cell,
    switchPos: sw,
    bulbPositions: [bulb],
    insulatorPos: showInsulator ? insulator : undefined,
    wires,
  };
}

function buildSeriesGeometry(n: number): CircuitGeometry {
  const cell: [number, number, number] = [-3.2, 0.25, 0];
  const sw: [number, number, number] = [-1.8, 0.22, 0];
  const spacing = 1.6;
  const startX = -0.2;
  const bulbs: [number, number, number][] = Array.from({ length: n }, (_, i) => [
    startX + i * spacing,
    0.45,
    0,
  ]);

  const wires: WireSegment[] = [
    { points: [terminal(cell, "+"), terminal(sw, "in")], live: true },
    { points: [terminal(sw, "out"), terminal(bulbs[0], "in")], live: true },
  ];

  for (let i = 0; i < n - 1; i++) {
    wires.push({ points: [terminal(bulbs[i], "out"), terminal(bulbs[i + 1], "in")], live: true });
  }

  const last = bulbs[n - 1];
  wires.push({
    points: [terminal(last, "out"), [last[0], 0.08, 0], [cell[0], 0.08, 0], terminal(cell, "-")],
    live: true,
  });

  return {
    cellPos: cell,
    switchPos: sw,
    bulbPositions: bulbs,
    wires,
  };
}

function buildParallelGeometry(n: number): CircuitGeometry {
  const cell: [number, number, number] = [-3, 0.25, 0];
  const sw: [number, number, number] = [-1.6, 0.22, 0];
  const junctionIn: [number, number, number] = [-0.4, 0.22, 0];
  const junctionOut: [number, number, number] = [2.4, 0.22, 0];

  const bulbs: [number, number, number][] = [];
  if (n >= 1) bulbs.push([1.2, 0.85, 0]);
  if (n >= 2) bulbs.push([1.2, -0.35, 0]);
  if (n >= 3) bulbs.push([1.2, 0.25, 0.6]);

  const wires: WireSegment[] = [
    { points: [terminal(cell, "+"), terminal(sw, "in")], live: true },
    { points: [terminal(sw, "out"), junctionIn], live: true },
  ];

  bulbs.forEach((b) => {
    wires.push({ points: [junctionIn, [junctionIn[0] + 0.5, junctionIn[1], 0], terminal(b, "in")], live: true });
    wires.push({ points: [terminal(b, "out"), [junctionOut[0] - 0.5, b[1], 0], junctionOut], live: true });
  });

  wires.push({
    points: [junctionOut, [junctionOut[0], 0.08, 0], [cell[0], 0.08, 0], terminal(cell, "-")],
    live: true,
  });

  return { cellPos: cell, switchPos: sw, bulbPositions: bulbs, wires };
}

function terminal(
  pos: [number, number, number],
  kind: "+" | "-" | "in" | "out",
): [number, number, number] {
  if (kind === "+") return [pos[0] + 0.35, pos[1], pos[2]];
  if (kind === "-") return [pos[0] - 0.35, pos[1], pos[2]];
  if (kind === "in") return [pos[0] - 0.22, pos[1], pos[2]];
  return [pos[0] + 0.22, pos[1], pos[2]];
}
