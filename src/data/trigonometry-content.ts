export interface TrigFormula {
  id: string;
  title: string;
  category: string;
  latex: string;
  note?: string;
}

export interface TrigQuizQuestion {
  id: string;
  question: string;
  formula?: string;
  options: string[];
  answer: number;
  hint?: string;
}

export interface TrigChallenge {
  id: string;
  prompt: string;
  formula?: string;
  answer: number | string;
}

export const TRIG_FORMULAS: TrigFormula[] = [
  { id: "pyth", title: "Pythagorean Identity", category: "Identities", latex: "\\sin^2\\theta + \\cos^2\\theta = 1" },
  { id: "tan-def", title: "Tangent Definition", category: "Basic", latex: "\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}" },
  { id: "cot-def", title: "Cotangent", category: "Basic", latex: "\\cot\\theta = \\frac{\\cos\\theta}{\\sin\\theta} = \\frac{1}{\\tan\\theta}" },
  { id: "double-sin", title: "Double Angle — Sine", category: "Identities", latex: "\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta" },
  { id: "double-cos", title: "Double Angle — Cosine", category: "Identities", latex: "\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta" },
  { id: "sum-sin", title: "Sum — Sine", category: "Identities", latex: "\\sin(A+B) = \\sin A \\cos B + \\cos A \\sin B" },
  { id: "sum-cos", title: "Sum — Cosine", category: "Identities", latex: "\\cos(A+B) = \\cos A \\cos B - \\sin A \\sin B" },
  { id: "law-sines", title: "Law of Sines", category: "Triangles", latex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}" },
  { id: "law-cosines", title: "Law of Cosines", category: "Triangles", latex: "c^2 = a^2 + b^2 - 2ab\\cos C" },
  { id: "unit-circle", title: "Unit Circle", category: "Basic", latex: "x = \\cos\\theta,\\; y = \\sin\\theta,\\; x^2+y^2=1" },
  { id: "euler", title: "Euler's Formula", category: "Complex", latex: "e^{i\\theta} = \\cos\\theta + i\\sin\\theta" },
  { id: "de-moivre", title: "De Moivre's Theorem", category: "Complex", latex: "(\\cos\\theta + i\\sin\\theta)^n = \\cos(n\\theta) + i\\sin(n\\theta)" },
  { id: "wave", title: "Sine Wave", category: "Graphs", latex: "y = A\\sin(Bx + C) + D", note: "A=amplitude, B=frequency, C=phase, D=shift" },
  { id: "period", title: "Period", category: "Graphs", latex: "T = \\frac{2\\pi}{B}" },
  { id: "polar", title: "Polar ↔ Cartesian", category: "Polar", latex: "x = r\\cos\\theta,\\; y = r\\sin\\theta,\\; r^2 = x^2+y^2" },
  { id: "spherical", title: "Spherical Coordinates", category: "3D", latex: "x = r\\cos\\theta\\cos\\phi,\\; y = r\\sin\\theta,\\; z = r\\cos\\theta\\sin\\phi" },
  { id: "dot", title: "Dot Product Angle", category: "Vectors", latex: "\\cos\\theta = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}||\\vec{b}|}" },
  { id: "arcsin", title: "Inverse Sine", category: "Inverse", latex: "\\arcsin(x) \\in \\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]" },
  { id: "arccos", title: "Inverse Cosine", category: "Inverse", latex: "\\arccos(x) \\in [0, \\pi]" },
  { id: "arctan", title: "Inverse Tangent", category: "Inverse", latex: "\\arctan(x) \\in \\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)" },
  { id: "half-sin", title: "Half Angle — Sine", category: "Identities", latex: "\\sin^2\\frac{\\theta}{2} = \\frac{1-\\cos\\theta}{2}" },
  { id: "half-cos", title: "Half Angle — Cosine", category: "Identities", latex: "\\cos^2\\frac{\\theta}{2} = \\frac{1+\\cos\\theta}{2}" },
];

export const TRIG_QUIZ: TrigQuizQuestion[] = [
  {
    id: "q1",
    question: "What is sin(90°)?",
    options: ["0", "1", "-1", "undefined"],
    answer: 1,
    hint: "On the unit circle, 90° is at the top — the y-coordinate is 1.",
  },
  {
    id: "q2",
    question: "What is cos(0°)?",
    options: ["0", "1", "-1", "0.5"],
    answer: 1,
  },
  {
    id: "q3",
    question: "Which identity is always true?",
    formula: "\\sin^2\\theta + \\cos^2\\theta = ?",
    options: ["0", "1", "2", "tan θ"],
    answer: 1,
  },
  {
    id: "q4",
    question: "In a right triangle, sin θ equals:",
    options: ["adjacent/hypotenuse", "opposite/hypotenuse", "opposite/adjacent", "hypotenuse/opposite"],
    answer: 1,
  },
  {
    id: "q5",
    question: "What is tan(45°)?",
    options: ["0", "1", "√2", "undefined"],
    answer: 1,
    hint: "At 45°, opposite and adjacent sides are equal.",
  },
  {
    id: "q6",
    question: "The period of y = sin(x) is:",
    options: ["π", "2π", "π/2", "4π"],
    answer: 1,
  },
  {
    id: "q7",
    question: "What is cos(180°)?",
    options: ["1", "0", "-1", "0.5"],
    answer: 2,
  },
  {
    id: "q8",
    question: "arcsin(1) equals:",
    options: ["0", "π/2", "π", "2π"],
    answer: 1,
  },
];

export const TRIG_CHALLENGES: TrigChallenge[] = [
  { id: "c1", prompt: "sin(30°) = ?", answer: 0.5 },
  { id: "c2", prompt: "cos(60°) = ?", answer: 0.5 },
  { id: "c3", prompt: "tan(45°) = ?", answer: 1 },
  { id: "c4", prompt: "sin(90°) = ?", answer: 1 },
  { id: "c5", prompt: "cos(0°) = ?", answer: 1 },
  { id: "c6", prompt: "sin²(30°) + cos²(30°) = ?", answer: 1 },
  { id: "c7", prompt: "Period of sin(2x) in radians?", formula: "T = 2\\pi/B", answer: 3.14159 },
  { id: "c8", prompt: "√3/2 = sin of how many degrees?", answer: 60 },
];
