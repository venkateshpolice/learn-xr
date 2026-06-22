import {
  FlaskConical,
  Calculator,
  Atom,
  Beaker,
  Ruler,
  Magnet,
  Zap,
  Waves,
  TestTube,
  Pi,
  Triangle,
  Sigma,
  Globe,
  Droplets,
  Hash,
  Leaf,
  Bug,
  TreePine,
  Dna,
  type LucideIcon,
} from "lucide-react";

export interface Experiment {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  link?: string;
  status: "available" | "coming-soon";
  gradient?: string;
}

export interface Lab {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  bgGlow: string;
  borderColor: string;
  experiments: Experiment[];
}

export const LABS: Lab[] = [
  {
    id: "physics",
    title: "Physics Lab",
    subtitle: "Forces, Motion & Energy",
    description: "Experiment with gravity, electricity, magnetism, and optics in a virtual physics laboratory. No equipment needed — just curiosity!",
    icon: Zap,
    gradient: "from-blue-500 to-indigo-600",
    bgGlow: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    experiments: [
      {
        id: "solar-system",
        icon: Globe,
        name: "Explore the Solar System",
        desc: "Walk among planets, witness orbits, moons & stellar phenomena in interactive 3D",
        link: "/solar-system",
        status: "available",
        gradient: "from-blue-500 to-cyan-500",
      },
      {
        id: "magnetism",
        icon: Magnet,
        name: "Magnetism",
        desc: "Drag two bar magnets — watch opposite poles attract and like poles repel",
        link: "/magnetism",
        status: "available",
        gradient: "from-indigo-500 to-violet-500",
      },
      {
        id: "waves",
        icon: Waves,
        name: "Wave Motion",
        desc: "Swimming pool with clear water, caustics, lane lines & ripple physics",
        link: "/wave-motion",
        status: "available",
        gradient: "from-sky-500 to-blue-500",
      },
      {
        id: "vernier-caliper",
        icon: Ruler,
        name: "Vernier Caliper",
        desc: "Interactive 3D caliper with play/pause jaw animation & AR",
        link: "/vernier-caliper",
        status: "available",
        gradient: "from-cyan-500 to-blue-500",
      },
      {
        id: "electricity",
        icon: Zap,
        name: "Electricity",
        desc: "Build circuits and measure current",
        status: "coming-soon",
        gradient: "from-yellow-500 to-amber-500",
      },
      {
        id: "mechanics",
        icon: Ruler,
        name: "Mechanics",
        desc: "Newton's laws of motion in action",
        status: "coming-soon",
        gradient: "from-slate-500 to-zinc-500",
      },
    ],
  },
  {
    id: "chemistry",
    title: "Chemistry Lab",
    subtitle: "Reactions, Elements & Bonds",
    description: "Mix chemicals, observe reactions, and explore molecular structures safely in 3D. Learn bonding, acids/bases, and the periodic table.",
    icon: FlaskConical,
    gradient: "from-emerald-500 to-teal-600",
    bgGlow: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    experiments: [
      {
        id: "periodic-table",
        icon: Atom,
        name: "3D Periodic Table",
        desc: "Explore all 118 elements with atomic details and narration",
        link: "/periodic-table",
        status: "available",
        gradient: "from-cyan-500 to-blue-500",
      },
      {
        id: "water-cycle",
        icon: Droplets,
        name: "Water Cycle",
        desc: "Evaporation, condensation, precipitation & collection in 3D",
        link: "/water-cycle",
        status: "available",
        gradient: "from-sky-500 to-indigo-500",
      },
      {
        id: "acid-base",
        icon: TestTube,
        name: "Acid-Base Reactions",
        desc: "pH indicators and neutralization experiments",
        status: "coming-soon",
        gradient: "from-green-500 to-emerald-500",
      },
      {
        id: "molecular-3d",
        icon: Atom,
        name: "Interactive Chemistry Lab",
        desc: "Build, visualize & learn about molecules in 3D with WebXR support",
        link: "/chemistry-lab",
        status: "available",
        gradient: "from-teal-500 to-cyan-500",
      },
      {
        id: "reactions",
        icon: FlaskConical,
        name: "Chemical Reactions",
        desc: "Exothermic and endothermic reactions",
        status: "coming-soon",
        gradient: "from-lime-500 to-green-500",
      },
      {
        id: "solutions",
        icon: Beaker,
        name: "Solutions & Mixtures",
        desc: "Solvents, solutes, and concentration",
        status: "coming-soon",
        gradient: "from-emerald-500 to-teal-500",
      },
    ],
  },
  {
    id: "biology",
    title: "Biology Lab",
    subtitle: "Plants, Life Cycles & Living Systems",
    description: "Explore how plants make food, watch complete metamorphosis, and journey from seed to tree — all in immersive 3D with step-by-step narration.",
    icon: Dna,
    gradient: "from-green-500 to-lime-600",
    bgGlow: "bg-green-500/10",
    borderColor: "border-green-500/20",
    experiments: [
      {
        id: "photosynthesis",
        icon: Leaf,
        name: "Photosynthesis",
        desc: "Watch how plants convert sunlight, water & CO₂ into food and oxygen",
        link: "/photosynthesis",
        status: "available",
        gradient: "from-green-500 to-emerald-500",
      },
      {
        id: "butterfly-lifecycle",
        icon: Bug,
        name: "Butterfly Life Cycle",
        desc: "Complete metamorphosis from egg to caterpillar, chrysalis & butterfly in 3D",
        link: "/butterfly-lifecycle",
        status: "available",
        gradient: "from-purple-500 to-pink-500",
      },
      {
        id: "plant-lifecycle",
        icon: TreePine,
        name: "Plant Life Cycle",
        desc: "Journey from seed to towering tree — germination, growth, flowering & aging",
        link: "/plant-lifecycle",
        status: "available",
        gradient: "from-lime-500 to-green-600",
      },
    ],
  },
  {
    id: "math",
    title: "Math Lab",
    subtitle: "Geometry, Algebra & Calculus",
    description: "Visualize mathematical concepts in 3D — see graphs come alive, manipulate geometric shapes, and understand calculus intuitively.",
    icon: Calculator,
    gradient: "from-purple-500 to-pink-600",
    bgGlow: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    experiments: [
      {
        id: "number-adventure",
        icon: Hash,
        name: "Number Adventure",
        desc: "Arrange numbers 0–10 in order with 3D drag and drop",
        link: "/number-adventure",
        status: "available",
        gradient: "from-cyan-500 to-teal-500",
      },
      {
        id: "trigonometry",
        icon: Pi,
        name: "Trigonometry Laboratory",
        desc: "17 interactive modules — unit circle, graphs, waves, polar coords, quiz, AR & VR",
        link: "/trigonometry",
        status: "available",
        gradient: "from-fuchsia-500 to-pink-500",
      },
      {
        id: "geometry",
        icon: Triangle,
        name: "Geometry Editor",
        desc: "Pick 3D shapes and adjust radius, diameter, height & more in real time",
        link: "/geometry-editor",
        status: "available",
        gradient: "from-violet-500 to-purple-500",
      },
      {
        id: "calculus",
        icon: Sigma,
        name: "Calculus",
        desc: "Derivatives and integrals visualized",
        status: "coming-soon",
        gradient: "from-purple-500 to-indigo-500",
      },
      {
        id: "algebra",
        icon: Calculator,
        name: "Algebra",
        desc: "Graph equations in 3D space",
        status: "coming-soon",
        gradient: "from-rose-500 to-red-500",
      },
    ],
  },
];

export function getLabById(id: string): Lab | undefined {
  return LABS.find((lab) => lab.id === id);
}
