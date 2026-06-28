export type PartType = "cell" | "bulb" | "switch" | "insulator";

export type TerminalId = "pos" | "neg" | "a" | "b" | "in" | "out";

export interface PlacedPart {
  id: string;
  type: PartType;
  gridX: number;
  gridZ: number;
  switchClosed: boolean;
}

export interface WireLink {
  id: string;
  fromPart: string;
  fromTerminal: TerminalId;
  toPart: string;
  toTerminal: TerminalId;
}

export interface BuilderSimResult {
  isComplete: boolean;
  current: number;
  layoutLabel: string;
  summary: string;
  electronsFlow: boolean;
  bulbBrightness: Record<string, number>;
  wireLive: Record<string, boolean>;
}

export const GRID = {
  minX: -4,
  maxX: 4,
  minZ: -1.2,
  maxZ: 1.2,
  step: 0.55,
  /** @deprecated use BOARD.surfaceY */
  y: -0.252,
};

/** Breadboard geometry constants (world space) */
export const BOARD = {
  originY: -0.32,
  surfaceOffset: 0.068,
  get surfaceY() {
    return this.originY + this.surfaceOffset;
  },
};

/** Scale factor for components placed on the breadboard */
export const ON_BOARD = {
  scale: 0.68,
  /** Local Y bottom of each part mesh (before scale) */
  rawBottom: {
    cell: 0.425,
    bulb: 0.26,
    switch: 0.14,
    insulator: 0.08,
  } as Record<PartType, number>,
  lift(type: PartType): number {
    return this.rawBottom[type] * this.scale;
  },
};

function rawTerminalLocal(type: PartType, terminal: TerminalId): [number, number, number] {
  switch (type) {
    case "cell":
      return terminal === "pos" ? [0.38, 0.15, 0] : [-0.38, -0.1, 0];
    case "bulb":
      return terminal === "a" ? [-0.22, 0.05, 0] : [0.22, 0.05, 0];
    case "switch":
      return terminal === "in" ? [-0.28, 0.05, 0] : [0.28, 0.05, 0];
    case "insulator":
      return terminal === "a" ? [-0.28, 0.05, 0] : [0.28, 0.05, 0];
    default:
      return [0, 0, 0];
  }
}

export function terminalWorldOffset(
  type: PartType,
  terminal: TerminalId,
  onBoard = true,
): [number, number, number] {
  const [lx, ly, lz] = rawTerminalLocal(type, terminal);
  if (!onBoard) return [lx, ly, lz];
  const s = ON_BOARD.scale;
  const lift = ON_BOARD.lift(type);
  return [lx * s, lift + ly * s, lz * s];
}

export const CELL_VOLTAGE = 3;
const R_BULB = 6;

export function snapGrid(x: number, z: number): { gridX: number; gridZ: number } {
  const gridX = Math.round(x / GRID.step) * GRID.step;
  const gridZ = Math.round(z / GRID.step) * GRID.step;
  return {
    gridX: Math.max(GRID.minX, Math.min(GRID.maxX, gridX)),
    gridZ: Math.max(GRID.minZ, Math.min(GRID.maxZ, gridZ)),
  };
}

export function gridToWorld(gridX: number, gridZ: number): [number, number, number] {
  return [gridX, BOARD.surfaceY, gridZ];
}

export function terminalWorldPos(part: PlacedPart, terminal: TerminalId): [number, number, number] {
  const [wx, wy, wz] = gridToWorld(part.gridX, part.gridZ);
  const [ox, oy, oz] = terminalWorldOffset(part.type, terminal, true);
  return [wx + ox, wy + oy, wz + oz];
}

type NetKey = string;

function termKey(partId: string, terminal: TerminalId): NetKey {
  return `${partId}:${terminal}`;
}

function find(parent: Map<NetKey, NetKey>, k: NetKey): NetKey {
  const p = parent.get(k) ?? k;
  if (p === k) return k;
  const root = find(parent, p);
  parent.set(k, root);
  return root;
}

function union(parent: Map<NetKey, NetKey>, a: NetKey, b: NetKey) {
  const ra = find(parent, a);
  const rb = find(parent, b);
  if (ra !== rb) parent.set(rb, ra);
}

export function simulateBuilder(parts: PlacedPart[], wires: WireLink[]): BuilderSimResult {
  const emptyBrightness: Record<string, number> = {};
  const off = (summary: string): BuilderSimResult => ({
    isComplete: false,
    current: 0,
    layoutLabel: "Open circuit",
    summary,
    electronsFlow: false,
    bulbBrightness: emptyBrightness,
    wireLive: {},
  });

  const cell = parts.find((p) => p.type === "cell");
  if (!cell) return off("Add a cell to power the circuit.");
  if (parts.filter((p) => p.type === "bulb").length === 0) return off("Add at least one bulb.");

  const parent = new Map<NetKey, NetKey>();

  for (const part of parts) {
    if (part.type === "bulb") {
      union(parent, termKey(part.id, "a"), termKey(part.id, "b"));
    } else if (part.type === "switch" && part.switchClosed) {
      union(parent, termKey(part.id, "in"), termKey(part.id, "out"));
    }
  }

  for (const w of wires) {
    const fromPart = parts.find((p) => p.id === w.fromPart);
    const toPart = parts.find((p) => p.id === w.toPart);
    if (!fromPart || !toPart) continue;
    if (fromPart.type === "insulator" || toPart.type === "insulator") continue;
    union(parent, termKey(w.fromPart, w.fromTerminal), termKey(w.toPart, w.toTerminal));
  }

  const posNet = find(parent, termKey(cell.id, "pos"));
  const negNet = find(parent, termKey(cell.id, "neg"));

  const openSwitch = parts.some((p) => p.type === "switch" && !p.switchClosed);
  if (openSwitch) return off("Switch is OPEN — close it to complete the circuit.");

  const insulatorInWires = parts.some(
    (p) =>
      p.type === "insulator" &&
      wires.some((w) => w.fromPart === p.id || w.toPart === p.id),
  );
  if (insulatorInWires) return off("Insulator blocks current — replace with wire.");

  if (posNet !== negNet) {
    return off("Connect cell + to cell − through components with wires.");
  }

  if (wires.length < 2) return off("Connect parts with wires — enable Wire tool, click two terminals.");

  const bulbs = parts.filter((p) => p.type === "bulb");
  const bulbNets = bulbs.map((b) => ({
    id: b.id,
    a: find(parent, termKey(b.id, "a")),
    b: find(parent, termKey(b.id, "b")),
  }));

  const isParallel =
    bulbs.length >= 2 &&
    bulbNets.every((b) => {
      const others = bulbNets.filter((o) => o.id !== b.id);
      return others.some((o) => {
        const shareHigh = b.a === o.a || b.a === o.b;
        const shareLow = b.b === o.a || b.b === o.b;
        return shareHigh && shareLow;
      });
    });

  let current = 0;
  let layoutLabel = "Custom circuit";
  const bulbBrightness: Record<string, number> = {};

  if (isParallel) {
    const R_eq = R_BULB / bulbs.length;
    current = CELL_VOLTAGE / R_eq;
    layoutLabel = "Parallel circuit";
    bulbs.forEach((b) => {
      bulbBrightness[b.id] = 1;
    });
  } else {
    const R = bulbs.length * R_BULB;
    current = CELL_VOLTAGE / R;
    layoutLabel = bulbs.length > 1 ? "Series circuit" : "Simple circuit";
    const bright = Math.min(current / (CELL_VOLTAGE / R_BULB), 1);
    bulbs.forEach((b) => {
      bulbBrightness[b.id] = bright;
    });
  }

  const wireLive: Record<string, boolean> = {};
  wires.forEach((w) => {
    wireLive[w.id] = current > 0;
  });

  return {
    isComplete: current > 0,
    current,
    layoutLabel,
    summary: `I = ${current.toFixed(2)} A · ${layoutLabel} · ${bulbs.length} bulb(s)`,
    electronsFlow: current > 0,
    bulbBrightness,
    wireLive,
  };
}

export function isGridOccupied(
  parts: PlacedPart[],
  gridX: number,
  gridZ: number,
  excludeId?: string,
): boolean {
  return parts.some(
    (p) => p.id !== excludeId && p.gridX === gridX && p.gridZ === gridZ,
  );
}

export function createPart(type: PartType, gridX: number, gridZ: number): PlacedPart {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    gridX,
    gridZ,
    switchClosed: type === "switch" ? true : false,
  };
}

export const SERIES_PRESET: { parts: Omit<PlacedPart, "id">[]; wires: Omit<WireLink, "id">[] } = {
  parts: [
    { type: "cell", gridX: -3.3, gridZ: 0, switchClosed: true },
    { type: "switch", gridX: -2.2, gridZ: 0, switchClosed: true },
    { type: "bulb", gridX: -0.55, gridZ: 0, switchClosed: true },
    { type: "bulb", gridX: 1.1, gridZ: 0, switchClosed: true },
  ],
  wires: [
    { fromPart: "cell-0", fromTerminal: "pos", toPart: "switch-0", toTerminal: "in" },
    { fromPart: "switch-0", fromTerminal: "out", toPart: "bulb-0", toTerminal: "a" },
    { fromPart: "bulb-0", fromTerminal: "b", toPart: "bulb-1", toTerminal: "a" },
    { fromPart: "bulb-1", fromTerminal: "b", toPart: "cell-0", toTerminal: "neg" },
  ],
};

export function loadPreset(
  preset: "series" | "parallel" | "basic",
): { parts: PlacedPart[]; wires: WireLink[] } {
  if (preset === "basic") {
    const cell = createPart("cell", -2.5, 0);
    const sw = createPart("switch", -1.2, 0);
    const bulb = createPart("bulb", 0.6, 0);
    return {
      parts: [cell, sw, bulb],
      wires: [
        {
          id: "w1",
          fromPart: cell.id,
          fromTerminal: "pos",
          toPart: sw.id,
          toTerminal: "in",
        },
        {
          id: "w2",
          fromPart: sw.id,
          fromTerminal: "out",
          toPart: bulb.id,
          toTerminal: "a",
        },
        {
          id: "w3",
          fromPart: bulb.id,
          fromTerminal: "b",
          toPart: cell.id,
          toTerminal: "neg",
        },
      ],
    };
  }

  if (preset === "series") {
    const cell = createPart("cell", -3.3, 0);
    const sw = createPart("switch", -2.2, 0);
    const b1 = createPart("bulb", -0.55, 0);
    const b2 = createPart("bulb", 1.1, 0);
    return {
      parts: [cell, sw, b1, b2],
      wires: [
        { id: "w1", fromPart: cell.id, fromTerminal: "pos", toPart: sw.id, toTerminal: "in" },
        { id: "w2", fromPart: sw.id, fromTerminal: "out", toPart: b1.id, toTerminal: "a" },
        { id: "w3", fromPart: b1.id, fromTerminal: "b", toPart: b2.id, toTerminal: "a" },
        { id: "w4", fromPart: b2.id, fromTerminal: "b", toPart: cell.id, toTerminal: "neg" },
      ],
    };
  }

  const cell = createPart("cell", -3, 0);
  const sw = createPart("switch", -2, 0);
  const b1 = createPart("bulb", 0.5, 0.55);
  const b2 = createPart("bulb", 0.5, -0.55);
  const junctionPos = createPart("switch", 0, 0);
  junctionPos.type = "insulator";
  void junctionPos;
  return {
    parts: [cell, sw, b1, b2],
    wires: [
      { id: "w1", fromPart: cell.id, fromTerminal: "pos", toPart: sw.id, toTerminal: "in" },
      { id: "w2", fromPart: sw.id, fromTerminal: "out", toPart: b1.id, toTerminal: "a" },
      { id: "w3", fromPart: sw.id, fromTerminal: "out", toPart: b2.id, toTerminal: "a" },
      { id: "w4", fromPart: b1.id, fromTerminal: "b", toPart: cell.id, toTerminal: "neg" },
      { id: "w5", fromPart: b2.id, fromTerminal: "b", toPart: cell.id, toTerminal: "neg" },
    ],
  };
}

export function partTerminals(type: PartType): TerminalId[] {
  switch (type) {
    case "cell":
      return ["pos", "neg"];
    case "bulb":
      return ["a", "b"];
    case "switch":
      return ["in", "out"];
    case "insulator":
      return ["a", "b"];
  }
}
