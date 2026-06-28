export type MachineType = "lever" | "pulley" | "inclined";

export interface SimpleMachineStage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  funFact: string;
  machine: MachineType;
  camera: [number, number, number];
  lookAt: [number, number, number];
  fulcrumPos: number;
  loadWeight: number;
  effortWeight: number;
  pulleyCount: number;
  effortPull: number;
  rampAngle: number;
  blockWeight: number;
}

export const SIMPLE_MACHINE_STAGES: SimpleMachineStage[] = [
  {
    id: "intro",
    title: "Simple Machines",
    subtitle: "Work smarter, not harder",
    description:
      "Simple machines help us lift, move, and push things using less force. Explore a lever, pulley, and inclined plane in 3D!",
    funFact: "A bicycle uses levers (pedals), pulleys (chain), and wheels (inclined planes wrapped in a circle)!",
    machine: "lever",
    camera: [0, 3.5, 10],
    lookAt: [0, 0.5, 0],
    fulcrumPos: 0.5,
    loadWeight: 4,
    effortWeight: 4,
    pulleyCount: 2,
    effortPull: 0.35,
    rampAngle: 20,
    blockWeight: 6,
  },
  {
    id: "lever-basics",
    title: "The Lever",
    subtitle: "Fulcrum · Load · Effort",
    description:
      "A lever is a stiff bar on a fulcrum (pivot). Push down on the effort side to lift the load on the other side.",
    funFact: "A seesaw is a lever! The middle support is the fulcrum.",
    machine: "lever",
    camera: [0, 2.8, 9],
    lookAt: [0, 0.4, 0],
    fulcrumPos: 0.5,
    loadWeight: 5,
    effortWeight: 5,
    pulleyCount: 2,
    effortPull: 0.3,
    rampAngle: 20,
    blockWeight: 6,
  },
  {
    id: "lever-ma",
    title: "Lever Mechanical Advantage",
    subtitle: "Longer load arm = easier lift",
    description:
      "Move the fulcrum closer to the load. The load arm gets longer, so you need less effort force — that’s mechanical advantage!",
    funFact: "Crowbars use this trick — a small push creates a big lift.",
    machine: "lever",
    camera: [0, 2.5, 8.5],
    lookAt: [0.3, 0.3, 0],
    fulcrumPos: 0.72,
    loadWeight: 8,
    effortWeight: 3,
    pulleyCount: 2,
    effortPull: 0.3,
    rampAngle: 20,
    blockWeight: 6,
  },
  {
    id: "pulley-single",
    title: "Fixed Pulley",
    subtitle: "Changes direction only",
    description:
      "A single fixed pulley lets you pull down to lift a crate up. It does not reduce force — mechanical advantage is 1.",
    funFact: "Sailors use pulleys on ships to hoist heavy sails.",
    machine: "pulley",
    camera: [0, 2.4, 9],
    lookAt: [0, 2, 0],
    fulcrumPos: 0.5,
    loadWeight: 6,
    effortWeight: 6,
    pulleyCount: 1,
    effortPull: 0.45,
    rampAngle: 20,
    blockWeight: 6,
  },
  {
    id: "pulley-multiple",
    title: "Pulley Systems",
    subtitle: "More pulleys · less pull",
    description:
      "Each supporting rope segment shares the load. With 3 supporting segments, you only need one-third the force!",
    funFact: "Construction cranes use many pulleys to lift steel beams.",
    machine: "pulley",
    camera: [0, 2.5, 10],
    lookAt: [0, 2.2, 0],
    fulcrumPos: 0.5,
    loadWeight: 9,
    effortWeight: 3,
    pulleyCount: 3,
    effortPull: 0.55,
    rampAngle: 20,
    blockWeight: 6,
  },
  {
    id: "inclined-gentle",
    title: "Inclined Plane",
    subtitle: "A ramp spreads work over distance",
    description:
      "Push a box up a gentle ramp instead of lifting straight up. The ramp is longer but you use less force.",
    funFact: "Wheelchair ramps are inclined planes that make buildings accessible.",
    machine: "inclined",
    camera: [0, 3, 11],
    lookAt: [0, 0.8, 0],
    fulcrumPos: 0.5,
    loadWeight: 4,
    effortWeight: 2,
    pulleyCount: 2,
    effortPull: 0.3,
    rampAngle: 18,
    blockWeight: 8,
  },
  {
    id: "inclined-steep",
    title: "Steep vs Gentle",
    subtitle: "Lower angle = bigger advantage",
    description:
      "A steep ramp has less mechanical advantage — you need more force. A gentle slope makes heavy loads easier to move.",
    funFact: "Ancient Egyptians may have used long earthen ramps to move pyramid stones.",
    machine: "inclined",
    camera: [0, 3.5, 10],
    lookAt: [0, 1, 0],
    fulcrumPos: 0.5,
    loadWeight: 4,
    effortWeight: 4,
    pulleyCount: 2,
    effortPull: 0.3,
    rampAngle: 38,
    blockWeight: 8,
  },
  {
    id: "explore",
    title: "Free Explore",
    subtitle: "Try all three machines",
    description:
      "Switch machines and adjust sliders. Watch mechanical advantage and required effort update in real time!",
    funFact: "Every complex machine is built from these simple building blocks.",
    machine: "lever",
    camera: [0, 3.2, 10],
    lookAt: [0, 0.6, 0],
    fulcrumPos: 0.55,
    loadWeight: 6,
    effortWeight: 3,
    pulleyCount: 2,
    effortPull: 0.4,
    rampAngle: 25,
    blockWeight: 7,
  },
];
