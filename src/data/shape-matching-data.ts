export type ShapeId =
  | "circle"
  | "square"
  | "rectangle"
  | "triangle"
  | "oval"
  | "star"
  | "pentagon"
  | "hexagon"
  | "diamond"
  | "heart"
  | "crescent"
  | "trapezium"
  | "parallelogram"
  | "arrow"
  | "cloud";

export interface ShapeInfo {
  id: ShapeId;
  name: string;
  color: string;
  sides: number | string;
  corners: number | string;
  examples: string;
  successPhrases: string[];
}

export const PLACE_THRESHOLD = 0.48;
export const SHAPE_DEPTH = 0.14;
export const SHAPE_SCALE = 0.88;
export const BOARD_THICKNESS = 0.1;
export const HOLE_DEPTH = 0.082;
export const TABLE_Y = 0.78;
/** Red mat / table container width — board + gap + tray fit inside with side padding. */
export const TABLE_WIDTH = 11.0;
export const TABLE_SIDE_PAD = 0.4;
export const TABLE_END_PAD = 0.7;
export const PANEL_GAP = 0.4;
export const PLAY_CENTER_X = 0;

export const BOARD_WIDTH = 4.9;
export const BOARD_DEPTH = 3.1;
export const SLOT_SPACING_X = 0.94;
export const SLOT_SPACING_Z = 0.92;

const PLAY_AREA_WIDTH = TABLE_WIDTH - 2 * TABLE_SIDE_PAD;
export const TRAY_WIDTH = PLAY_AREA_WIDTH - BOARD_WIDTH - PANEL_GAP;
export const TRAY_DEPTH = BOARD_DEPTH;
export const TRAY_SPACING_X = 0.94;
export const TRAY_SPACING_Z = 0.92;

const BOARD_CENTER_X = -PLAY_AREA_WIDTH / 2 + BOARD_WIDTH / 2;
const TRAY_CENTER_X = PLAY_AREA_WIDTH / 2 - TRAY_WIDTH / 2;

export const TABLE_DEPTH = BOARD_DEPTH + 2 * TABLE_END_PAD;
export const TABLE_BODY_HEIGHT = 0.28;
export const TABLE_MAT_THICKNESS = 0.05;

/** Both panels share the same table Y origin and thickness. */
export const BOARD_CENTER: [number, number, number] = [BOARD_CENTER_X, TABLE_Y, 0];
export const TRAY_CENTER: [number, number, number] = [TRAY_CENTER_X, TABLE_Y, 0];

/** Top surface of puzzle board / shape tray (shapes rest on this). */
export function getPanelSurfaceY(): number {
  return TABLE_Y + BOARD_THICKNESS;
}

/** World Y for shapes resting on the tray — matches board snap height. */
export function getTrayShapeY(): number {
  return getPanelSurfaceY() + SHAPE_DEPTH / 2 - 0.01;
}

/** Half-extent of shape collider on XZ — keeps dragged shapes inside the table mat. */
export const SHAPE_DRAG_RADIUS = 0.38;
export const DRAG_BOUND_PAD = 0.06;

export function clampToTableSurface(x: number, z: number): { x: number; z: number } {
  const maxX = TABLE_WIDTH / 2 - SHAPE_DRAG_RADIUS - DRAG_BOUND_PAD;
  const maxZ = TABLE_DEPTH / 2 - SHAPE_DRAG_RADIUS - DRAG_BOUND_PAD;
  return {
    x: Math.max(-maxX, Math.min(maxX, x)),
    z: Math.max(-maxZ, Math.min(maxZ, z)),
  };
}
export const CONTAINER_GAP = 0.08;
export const CONTAINER_HEIGHT = 0.88;
export const CONTAINER_CENTER: [number, number, number] = [
  BOARD_CENTER[0],
  TABLE_Y - CONTAINER_GAP - CONTAINER_HEIGHT / 2,
  BOARD_CENTER[2],
];
export const CONTAINER_DIMS = { width: BOARD_WIDTH, height: CONTAINER_HEIGHT, depth: BOARD_DEPTH };

export function getContainerTopY(): number {
  return CONTAINER_CENTER[1] + CONTAINER_DIMS.height / 2;
}

export const SHAPES: ShapeInfo[] = [
  {
    id: "circle",
    name: "Circle",
    color: "#FF6B6B",
    sides: 0,
    corners: 0,
    examples: "Wheels, coins, and the Sun",
    successPhrases: ["Excellent!", "Great job!", "You found the Circle!"],
  },
  {
    id: "square",
    name: "Square",
    color: "#4ECDC4",
    sides: 4,
    corners: 4,
    examples: "Windows, crackers, and board game tiles",
    successPhrases: ["Wonderful!", "Perfect Square!", "You found the Square!"],
  },
  {
    id: "rectangle",
    name: "Rectangle",
    color: "#FFE66D",
    sides: 4,
    corners: 4,
    examples: "Doors, books, and phones",
    successPhrases: ["Amazing!", "Great job!", "You found the Rectangle!"],
  },
  {
    id: "triangle",
    name: "Triangle",
    color: "#A78BFA",
    sides: 3,
    corners: 3,
    examples: "Road signs, roofs, and pizza slices",
    successPhrases: ["Excellent!", "Super!", "You found the Triangle!"],
  },
  {
    id: "oval",
    name: "Oval",
    color: "#F472B6",
    sides: 0,
    corners: 0,
    examples: "Eggs, mirrors, and rugby balls",
    successPhrases: ["Nice work!", "Great job!", "You found the Oval!"],
  },
  {
    id: "star",
    name: "Star",
    color: "#FBBF24",
    sides: 10,
    corners: 10,
    examples: "Night sky, badges, and decorations",
    successPhrases: ["You're a star!", "Brilliant!", "You found the Star!"],
  },
  {
    id: "pentagon",
    name: "Pentagon",
    color: "#34D399",
    sides: 5,
    corners: 5,
    examples: "Home plate in baseball and some buildings",
    successPhrases: ["Fantastic!", "Great job!", "You found the Pentagon!"],
  },
  {
    id: "hexagon",
    name: "Hexagon",
    color: "#60A5FA",
    sides: 6,
    corners: 6,
    examples: "Honeycomb cells and nuts & bolts",
    successPhrases: ["Sweet!", "Excellent!", "You found the Hexagon!"],
  },
  {
    id: "diamond",
    name: "Diamond",
    color: "#E879F9",
    sides: 4,
    corners: 4,
    examples: "Kites, gem stones, and card suits",
    successPhrases: ["Sparkling work!", "Great job!", "You found the Diamond!"],
  },
  {
    id: "heart",
    name: "Heart",
    color: "#FB7185",
    sides: "Curved",
    corners: 1,
    examples: "Valentine cards, love symbols, and leaves",
    successPhrases: ["Lovely!", "Wonderful!", "You found the Heart!"],
  },
  {
    id: "crescent",
    name: "Crescent",
    color: "#94A3B8",
    sides: "Curved",
    corners: 2,
    examples: "The Moon, croissants, and horns",
    successPhrases: ["Moon-tastic!", "Great job!", "You found the Crescent!"],
  },
  {
    id: "trapezium",
    name: "Trapezium",
    color: "#FB923C",
    sides: 4,
    corners: 4,
    examples: "Table tops, bags, and bridge sides",
    successPhrases: ["Well done!", "Excellent!", "You found the Trapezium!"],
  },
  {
    id: "parallelogram",
    name: "Parallelogram",
    color: "#2DD4BF",
    sides: 4,
    corners: 4,
    examples: "Tiles, slanted windows, and erasers",
    successPhrases: ["Super!", "Great job!", "You found the Parallelogram!"],
  },
  {
    id: "arrow",
    name: "Arrow",
    color: "#818CF8",
    sides: 7,
    corners: 7,
    examples: "Signs, directions, and pointers",
    successPhrases: ["Right on target!", "Great job!", "You found the Arrow!"],
  },
  {
    id: "cloud",
    name: "Cloud",
    color: "#E2E8F0",
    sides: "Curved",
    corners: 0,
    examples: "Sky, weather, and fluffy pillows",
    successPhrases: ["Sky high!", "Excellent!", "You found the Cloud!"],
  },
];

export function getShapeInfo(id: ShapeId): ShapeInfo {
  return SHAPES.find((s) => s.id === id)!;
}

/** Slot positions on puzzle board (local XZ, y added at runtime). */
export function getBoardSlotLocalPositions(): { id: ShapeId; x: number; z: number }[] {
  const cols = 5;
  const rows = 3;
  const startX = -((cols - 1) * SLOT_SPACING_X) / 2;
  const startZ = -((rows - 1) * SLOT_SPACING_Z) / 2;
  return SHAPES.map((s, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return { id: s.id, x: startX + col * SLOT_SPACING_X, z: startZ + row * SLOT_SPACING_Z };
  });
}

/** World Y for a shape snapped flush on the puzzle board. */
export function getBoardSnapY(): number {
  return getPanelSurfaceY() + SHAPE_DEPTH / 2 - 0.01;
}

/** Resting position for a shape inside the glass jar — same column as its board hole. */
export function getContainerSlotPosition(shapeId: ShapeId): [number, number, number] {
  const slots = getBoardSlotLocalPositions();
  const slot = slots.find((s) => s.id === shapeId);
  const floorY =
    CONTAINER_CENTER[1] - CONTAINER_DIMS.height / 2 + SHAPE_DEPTH / 2 + 0.05;
  if (!slot) {
    return [CONTAINER_CENTER[0], floorY, CONTAINER_CENTER[2]];
  }
  return [BOARD_CENTER[0] + slot.x, floorY, CONTAINER_CENTER[2] + slot.z];
}

/** Hole-top world position used for snap + drop start. */
export function getHoleWorldPosition(slotX: number, slotZ: number): [number, number, number] {
  return [BOARD_CENTER[0] + slotX, getBoardSnapY(), BOARD_CENTER[2] + slotZ];
}

/** Neat 5×3 tray grid with shuffled shape slots. */
export function createTrayLayout(): Map<ShapeId, [number, number, number]> {
  const cols = 5;
  const rows = 3;
  const startX = TRAY_CENTER[0] - ((cols - 1) * TRAY_SPACING_X) / 2;
  const startZ = TRAY_CENTER[2] - ((rows - 1) * TRAY_SPACING_Z) / 2;
  const y = getTrayShapeY();

  const grid: [number, number, number][] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      grid.push([startX + col * TRAY_SPACING_X, y, startZ + row * TRAY_SPACING_Z]);
    }
  }

  for (let i = grid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [grid[i], grid[j]] = [grid[j]!, grid[i]!];
  }

  const map = new Map<ShapeId, [number, number, number]>();
  SHAPES.forEach((shape, i) => map.set(shape.id, grid[i]!));
  return map;
}

/** @deprecated Use createTrayLayout */
export function shuffleTrayPositions(count: number): [number, number, number][] {
  const layout = createTrayLayout();
  return SHAPES.slice(0, count).map((s) => layout.get(s.id)!);
}

export const TRY_AGAIN_PHRASES = ["Try again!", "Look carefully!", "Find the matching shape!"];
