import {
  Circle,
  LineChart,
  Triangle,
  Waves,
  FunctionSquare,
  RotateCcw,
  Equal,
  Move,
  Compass,
  Sigma,
  Box,
  ArrowUpRight,
  HelpCircle,
  Trophy,
  BookOpen,
  Glasses,
  Scan,
  type LucideIcon,
} from "lucide-react";

export type TrigModuleId =
  | "unit-circle"
  | "trig-functions"
  | "right-triangle"
  | "graph-explorer"
  | "wave-simulator"
  | "inverse-trig"
  | "identities"
  | "transformations"
  | "polar-coordinates"
  | "complex-plane"
  | "trig-3d"
  | "vector-trig"
  | "quiz"
  | "challenge"
  | "formula-library"
  | "ar-mode"
  | "vr-mode";

export type TrigModuleCategory = "core" | "advanced" | "practice" | "immersive";

export interface TrigModuleDef {
  id: TrigModuleId;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  category: TrigModuleCategory;
  grades: string;
  has3D: boolean;
  hasXR: boolean;
}

export const TRIG_CATEGORIES: Record<TrigModuleCategory, string> = {
  core: "Core Concepts",
  advanced: "Advanced Topics",
  practice: "Practice & Reference",
  immersive: "Immersive XR",
};

export const TRIGONOMETRY_MODULES: TrigModuleDef[] = [
  {
    id: "unit-circle",
    title: "Unit Circle Explorer",
    subtitle: "Angles, sin, cos & tan",
    description: "Drag the angle around the unit circle and watch sin, cos, and tan update in real time with 3D visualization.",
    icon: Circle,
    gradient: "from-violet-500 to-purple-600",
    category: "core",
    grades: "Grade 8+",
    has3D: true,
    hasXR: true,
  },
  {
    id: "trig-functions",
    title: "Trigonometric Functions",
    subtitle: "sin, cos, tan compared",
    description: "Overlay sine, cosine, and tangent on the same axes and explore how they relate on the unit circle.",
    icon: FunctionSquare,
    gradient: "from-fuchsia-500 to-pink-600",
    category: "core",
    grades: "Grade 9+",
    has3D: true,
    hasXR: false,
  },
  {
    id: "right-triangle",
    title: "Right Triangle Solver",
    subtitle: "SOH · CAH · TOA",
    description: "Interactive right triangle — adjust angles and sides to see opposite, adjacent, and hypotenuse relationships.",
    icon: Triangle,
    gradient: "from-cyan-500 to-blue-600",
    category: "core",
    grades: "Grade 8+",
    has3D: true,
    hasXR: false,
  },
  {
    id: "graph-explorer",
    title: "Graph Explorer",
    subtitle: "Amplitude, frequency & phase",
    description: "Build y = A·sin(Bx + C) + D and watch the graph transform live with labeled parameters.",
    icon: LineChart,
    gradient: "from-indigo-500 to-violet-600",
    category: "core",
    grades: "Grade 10+",
    has3D: true,
    hasXR: false,
  },
  {
    id: "wave-simulator",
    title: "Wave Simulator",
    subtitle: "Sound & light waves",
    description: "Simulate traveling sine waves in 3D — adjust wavelength, frequency, and amplitude.",
    icon: Waves,
    gradient: "from-sky-500 to-cyan-600",
    category: "core",
    grades: "Grade 10+",
    has3D: true,
    hasXR: true,
  },
  {
    id: "inverse-trig",
    title: "Inverse Trigonometry",
    subtitle: "arcsin, arccos, arctan",
    description: "Explore inverse functions — given a ratio, find the angle. Restricted domains visualized on graphs.",
    icon: RotateCcw,
    gradient: "from-rose-500 to-red-600",
    category: "advanced",
    grades: "Grade 11+",
    has3D: true,
    hasXR: false,
  },
  {
    id: "identities",
    title: "Identities Lab",
    subtitle: "Pythagorean & double-angle",
    description: "Interactive proofs and sliders that verify sin²θ + cos²θ = 1 and other key identities.",
    icon: Equal,
    gradient: "from-amber-500 to-orange-600",
    category: "advanced",
    grades: "Grade 10+",
    has3D: false,
    hasXR: false,
  },
  {
    id: "transformations",
    title: "Transformations",
    subtitle: "Shift, stretch & reflect",
    description: "See how vertical/horizontal shifts, stretches, and reflections change trig graphs step by step.",
    icon: Move,
    gradient: "from-teal-500 to-emerald-600",
    category: "advanced",
    grades: "Grade 10+",
    has3D: true,
    hasXR: false,
  },
  {
    id: "polar-coordinates",
    title: "Polar Coordinates",
    subtitle: "r and θ",
    description: "Plot polar curves r = f(θ) — roses, cardioids, and spirals in an interactive polar grid.",
    icon: Compass,
    gradient: "from-blue-500 to-indigo-600",
    category: "advanced",
    grades: "Grade 11+",
    has3D: true,
    hasXR: false,
  },
  {
    id: "complex-plane",
    title: "Complex Plane",
    subtitle: "e^(iθ) & De Moivre",
    description: "Visualize complex numbers on the Argand plane — multiply, rotate, and see Euler's formula in action.",
    icon: Sigma,
    gradient: "from-purple-500 to-fuchsia-600",
    category: "advanced",
    grades: "Grade 11+",
    has3D: true,
    hasXR: false,
  },
  {
    id: "trig-3d",
    title: "3D Trigonometry",
    subtitle: "Spherical coordinates",
    description: "Explore angles in 3D space — elevation, azimuth, and distances on a sphere.",
    icon: Box,
    gradient: "from-slate-500 to-zinc-600",
    category: "advanced",
    grades: "University",
    has3D: true,
    hasXR: true,
  },
  {
    id: "vector-trig",
    title: "Vector Trigonometry",
    subtitle: "Dot product & angles",
    description: "Two vectors in 3D — measure the angle between them using cos θ = (a·b)/(|a||b|).",
    icon: ArrowUpRight,
    gradient: "from-lime-500 to-green-600",
    category: "advanced",
    grades: "Grade 11+",
    has3D: true,
    hasXR: false,
  },
  {
    id: "quiz",
    title: "Quiz Mode",
    subtitle: "Test your knowledge",
    description: "Multiple-choice questions on unit circle values, identities, and triangle solving with instant feedback.",
    icon: HelpCircle,
    gradient: "from-pink-500 to-rose-600",
    category: "practice",
    grades: "All levels",
    has3D: false,
    hasXR: false,
  },
  {
    id: "challenge",
    title: "Challenge Mode",
    subtitle: "Timed problems",
    description: "Race against the clock — solve trig problems and climb the leaderboard.",
    icon: Trophy,
    gradient: "from-yellow-500 to-amber-600",
    category: "practice",
    grades: "All levels",
    has3D: false,
    hasXR: false,
  },
  {
    id: "formula-library",
    title: "Formula Library",
    subtitle: "Complete reference",
    description: "Searchable library of every trig formula — unit circle, identities, laws of sines & cosines.",
    icon: BookOpen,
    gradient: "from-violet-500 to-indigo-600",
    category: "practice",
    grades: "All levels",
    has3D: false,
    hasXR: false,
  },
  {
    id: "ar-mode",
    title: "AR Mode",
    subtitle: "Augmented reality",
    description: "Place the unit circle and trig graphs in your real environment using WebXR AR.",
    icon: Scan,
    gradient: "from-emerald-500 to-teal-600",
    category: "immersive",
    grades: "All levels",
    has3D: true,
    hasXR: true,
  },
  {
    id: "vr-mode",
    title: "VR Mode",
    subtitle: "Virtual reality lab",
    description: "Step inside a virtual trig laboratory — walk around 3D graphs and the unit circle in VR.",
    icon: Glasses,
    gradient: "from-blue-500 to-cyan-600",
    category: "immersive",
    grades: "All levels",
    has3D: true,
    hasXR: true,
  },
];

export function getTrigModule(id: string): TrigModuleDef | undefined {
  return TRIGONOMETRY_MODULES.find((m) => m.id === id);
}

export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

export function clampAngleDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

export function formatTrigValue(v: number, decimals = 3): string {
  if (Math.abs(v) < 1e-10) return "0";
  return v.toFixed(decimals);
}
