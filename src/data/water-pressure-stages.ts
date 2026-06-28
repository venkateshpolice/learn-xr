export interface WaterPressureStage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  funFact: string;
  camera: [number, number, number];
  lookAt: [number, number, number];
  fillLevel: number;
  holes: number[];
}

export const WATER_PRESSURE_STAGES: WaterPressureStage[] = [
  {
    id: "intro",
    title: "Water Pressure Lab",
    subtitle: "Pressure grows with depth",
    description:
      "Fill the transparent tank and poke holes at different heights. Water shoots out faster when the hole is deeper — that’s hydrostatic pressure!",
    funFact: "Scuba divers feel more pressure on their ears the deeper they swim — same physics!",
    camera: [2.8, 2.2, 5.5],
    lookAt: [0.4, 1.1, 0],
    fillLevel: 0.75,
    holes: [0.25],
  },
  {
    id: "fill-tank",
    title: "Fill the Tank",
    subtitle: "More water = more depth",
    description:
      "Raise the water level with the slider. The deeper the water above a hole, the greater the pressure pushing out.",
    funFact: "Pressure at depth depends on the weight of water above you, not the total tank size.",
    camera: [2.2, 1.8, 5],
    lookAt: [0, 1, 0],
    fillLevel: 0.5,
    holes: [0.3],
  },
  {
    id: "two-holes",
    title: "Compare Two Depths",
    subtitle: "Lower hole wins",
    description:
      "Watch jets from a high hole and a low hole. The lower hole has more water above it, so pressure and jet speed are higher.",
    funFact: "Torricelli’s law: exit speed v = √(2gh) where h is depth below the water surface.",
    camera: [3.5, 1.5, 4.5],
    lookAt: [0.8, 0.9, 0],
    fillLevel: 0.85,
    holes: [0.75, 0.2],
  },
  {
    id: "above-water",
    title: "Hole Above Water",
    subtitle: "No depth → no jet",
    description:
      "A hole above the water line has zero depth below the surface — no pressure difference, so no jet!",
    funFact: "Ship designers place hull openings carefully so they stay below the waterline.",
    camera: [2.5, 2.4, 5],
    lookAt: [0.2, 1.3, 0],
    fillLevel: 0.4,
    holes: [0.55, 0.15],
  },
  {
    id: "three-depths",
    title: "Three Depths",
    subtitle: "Pressure ladder",
    description:
      "Add holes at low, middle, and high positions. Compare pressure (Pa), speed (m/s), and how far each jet travels.",
    funFact: "At 10 m depth in water, gauge pressure is about 100 kPa — roughly one atmosphere extra!",
    camera: [4, 1.4, 5],
    lookAt: [1, 0.8, 0],
    fillLevel: 1,
    holes: [0.15, 0.45, 0.75],
  },
  {
    id: "explore",
    title: "Free Explore",
    subtitle: "Your experiment",
    description:
      "Set the water level, add or remove holes anywhere, and discover how depth controls water pressure.",
    funFact: "Dam engineers use these same ideas to calculate force on walls and gates.",
    camera: [3, 2, 5.5],
    lookAt: [0.5, 1.1, 0],
    fillLevel: 0.7,
    holes: [0.2, 0.5],
  },
];
