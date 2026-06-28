export type OpticsMode = "reflection" | "refraction" | "tir";

export interface OpticsStage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  funFact: string;
  mode: OpticsMode;
  angle: number;
  materialId: string;
  camera: [number, number, number];
  lookAt: [number, number, number];
}

export const OPTICS_STAGES: OpticsStage[] = [
  {
    id: "overview",
    title: "Light: Reflection & Refraction",
    subtitle: "How light bounces and bends",
    description:
      "Light travels in straight lines until it hits a surface or passes into a new material. Reflection sends light bouncing back, while refraction bends light as it enters a denser or less dense medium. These two phenomena explain mirrors, lenses, rainbows, and fiber optics.",
    funFact: "Light travels at about 300,000 km/s in a vacuum — the fastest speed possible in the universe!",
    mode: "reflection",
    angle: 35,
    materialId: "glass",
    camera: [0, 3, 10],
    lookAt: [0, 0, 0],
  },
  {
    id: "reflection-law",
    title: "Law of Reflection",
    subtitle: "Angle in = Angle out",
    description:
      "When light hits a smooth surface like a mirror, it reflects. The angle of incidence (θi) — measured from the normal (perpendicular line) — always equals the angle of reflection (θr). This is why you see your face in a mirror at the same angle you look into it.",
    funFact: "Smooth surfaces give specular reflection (clear images). Rough surfaces scatter light in many directions — diffuse reflection.",
    mode: "reflection",
    angle: 45,
    materialId: "glass",
    camera: [-4, 2, 8],
    lookAt: [0, 0, 0],
  },
  {
    id: "normal",
    title: "The Normal Line",
    subtitle: "Perpendicular to the surface",
    description:
      "All angles in optics are measured from the normal — an imaginary line drawn perpendicular to the surface at the point where light hits. The incident ray, reflected ray, and normal all lie in the same plane.",
    funFact: "The word 'normal' in geometry means perpendicular — it comes from the Latin 'normalis' meaning made with a carpenter's square.",
    mode: "reflection",
    angle: 60,
    materialId: "glass",
    camera: [3, 1, 7],
    lookAt: [0, 0, 0],
  },
  {
    id: "refraction",
    title: "Refraction",
    subtitle: "Light bends entering a new medium",
    description:
      "When light passes from air into water, glass, or another material, it slows down and bends toward the normal. Snell's Law describes this: n₁ sin θ₁ = n₂ sin θ₂, where n is the refractive index of each material.",
    funFact: "A straw in a glass of water looks bent because light from the straw refracts at the air-water boundary before reaching your eyes.",
    mode: "refraction",
    angle: 40,
    materialId: "water",
    camera: [-3, 2, 9],
    lookAt: [0, -0.5, 0],
  },
  {
    id: "snell",
    title: "Snell's Law in Action",
    subtitle: "Denser media bend light more",
    description:
      "Each material has a refractive index (n). Air ≈ 1.0, water ≈ 1.33, glass ≈ 1.5, diamond ≈ 2.42. Higher n means light travels slower. Try different materials — diamond bends light much more than water!",
    funFact: "Snell's Law was discovered independently by Willebrord Snell in 1621 and René Descartes in 1637.",
    mode: "refraction",
    angle: 50,
    materialId: "diamond",
    camera: [4, 3, 8],
    lookAt: [0, -0.5, 0],
  },
  {
    id: "tir",
    title: "Total Internal Reflection",
    subtitle: "When light cannot escape",
    description:
      "When light travels from a denser medium (like glass) into a less dense one (air) at a steep angle, it can reflect completely back into the glass instead of refracting out. This is total internal reflection — the principle behind fiber-optic cables.",
    funFact: "Fiber-optic internet cables use total internal reflection to carry data as light pulses over thousands of kilometers.",
    mode: "tir",
    angle: 50,
    materialId: "glass",
    camera: [-2, -1, 9],
    lookAt: [0, 0.5, 0],
  },
  {
    id: "explore",
    title: "Explore & Experiment",
    subtitle: "Adjust angle and materials",
    description:
      "Use the controls to change the angle of incidence and switch between reflection, refraction, and total internal reflection modes. Watch how the rays respond in real time and read the live Snell's Law values.",
    funFact: "Rainbows form because sunlight refracts, reflects inside water droplets, and refracts again as it exits — a double application of these laws!",
    mode: "refraction",
    angle: 30,
    materialId: "glass",
    camera: [0, 2, 11],
    lookAt: [0, 0, 0],
  },
];

export interface OpticalMaterial {
  id: string;
  name: string;
  n: number;
  color: string;
  emissive: string;
}

export const MATERIALS: OpticalMaterial[] = [
  { id: "air", name: "Air", n: 1.0, color: "#1a1a2e", emissive: "#000000" },
  { id: "water", name: "Water", n: 1.33, color: "#0ea5e9", emissive: "#0369a1" },
  { id: "glass", name: "Glass", n: 1.5, color: "#94a3b8", emissive: "#475569" },
  { id: "diamond", name: "Diamond", n: 2.42, color: "#e2e8f0", emissive: "#cbd5e1" },
];
