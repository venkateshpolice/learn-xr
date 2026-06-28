export type CircuitLayout = "basic" | "series" | "parallel" | "insulator";

export interface CircuitStage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  funFact: string;
  layout: CircuitLayout;
  camera: [number, number, number];
  lookAt: [number, number, number];
  switchClosed: boolean;
  bulbCount: number;
  showInsulator: boolean;
  insulatorInPath: boolean;
}

export const CIRCUIT_STAGES: CircuitStage[] = [
  {
    id: "intro",
    title: "Electric Circuits",
    subtitle: "A closed loop of conductors",
    description:
      "Electricity flows when charges move through a complete path from the cell, through components, and back. Build and test circuits in 3D!",
    funFact: "Lightning is a giant natural electric circuit between clouds and the ground.",
    layout: "basic",
    camera: [0, 3.5, 9],
    lookAt: [0, 0.4, 0],
    switchClosed: true,
    bulbCount: 1,
    showInsulator: false,
    insulatorInPath: false,
  },
  {
    id: "cell",
    title: "The Cell (Battery)",
    subtitle: "Source of electrical energy",
    description:
      "A cell pushes electric charge around the circuit. The positive (+) terminal sends current out; the negative (−) terminal receives it back.",
    funFact: "The first battery was invented by Alessandro Volta in 1800 using copper and zinc discs.",
    layout: "basic",
    camera: [-1.5, 2.8, 7],
    lookAt: [-2, 0.3, 0],
    switchClosed: true,
    bulbCount: 1,
    showInsulator: false,
    insulatorInPath: false,
  },
  {
    id: "bulb",
    title: "The Bulb",
    subtitle: "Electrical energy → light + heat",
    description:
      "When current passes through the thin filament inside a bulb, it glows white-hot. No current means no light.",
    funFact: "Modern LED bulbs use far less energy than old filament bulbs.",
    layout: "basic",
    camera: [0.5, 2.5, 7],
    lookAt: [0.5, 0.5, 0],
    switchClosed: true,
    bulbCount: 1,
    showInsulator: false,
    insulatorInPath: false,
  },
  {
    id: "switch",
    title: "The Switch",
    subtitle: "Open or close the path",
    description:
      "A switch is a gate. Closed = complete circuit, bulbs glow. Open = broken path, current stops instantly.",
    funFact: "Your bedroom light switch breaks just one wire in the circuit — that's enough to stop the flow.",
    layout: "basic",
    camera: [0, 2.8, 8],
    lookAt: [0, 0.35, 0],
    switchClosed: false,
    bulbCount: 1,
    showInsulator: false,
    insulatorInPath: false,
  },
  {
    id: "conductors",
    title: "Conductors",
    subtitle: "Copper wires carry current",
    description:
      "Conductors let charges move easily. Metal wires connect the cell, switch, and bulb into one continuous path.",
    funFact: "Silver is the best conductor, but copper is used in wires because it's cheaper and still excellent.",
    layout: "basic",
    camera: [0, 3, 9],
    lookAt: [0, 0.3, 0],
    switchClosed: true,
    bulbCount: 1,
    showInsulator: false,
    insulatorInPath: false,
  },
  {
    id: "insulators",
    title: "Insulators",
    subtitle: "Rubber & plastic stop the flow",
    description:
      "Insulators block electric current. Replace a wire section with rubber and the circuit breaks — the bulb goes dark.",
    funFact: "Plastic coating on wires protects you from shock — it's an insulator.",
    layout: "insulator",
    camera: [0, 2.8, 8],
    lookAt: [0, 0.35, 0],
    switchClosed: true,
    bulbCount: 1,
    showInsulator: true,
    insulatorInPath: true,
  },
  {
    id: "series",
    title: "Series Circuit",
    subtitle: "One single loop",
    description:
      "In series, components share one path. Current is the same everywhere, but each bulb gets less voltage — they glow dimmer.",
    funFact: "Old Christmas light strings used series — if one bulb broke, the whole string went dark!",
    layout: "series",
    camera: [0, 3.2, 10],
    lookAt: [0, 0.4, 0],
    switchClosed: true,
    bulbCount: 2,
    showInsulator: false,
    insulatorInPath: false,
  },
  {
    id: "parallel",
    title: "Parallel Circuit",
    subtitle: "Split paths, same voltage",
    description:
      "In parallel, each bulb has its own branch from the cell. Every bulb gets full voltage and shines bright independently.",
    funFact: "Home wiring uses parallel so turning off one lamp doesn't darken the rest of the house.",
    layout: "parallel",
    camera: [0, 3.5, 10],
    lookAt: [0, 0.5, 0],
    switchClosed: true,
    bulbCount: 2,
    showInsulator: false,
    insulatorInPath: false,
  },
  {
    id: "explore",
    title: "Circuit Builder",
    subtitle: "Design your own circuit",
    description:
      "Toggle the switch, pick series or parallel, add an insulator, and watch current, voltage, and bulb brightness update live.",
    funFact: "Engineers use circuit diagrams with symbols — the same ideas you see here in 3D.",
    layout: "series",
    camera: [0, 3.2, 10],
    lookAt: [0, 0.4, 0],
    switchClosed: true,
    bulbCount: 2,
    showInsulator: false,
    insulatorInPath: false,
  },
];
