export interface NurseryPuzzle {
  id: string;
  title: string;
  emoji: string;
  ages: string;
  description: string;
  href: string;
  gradient: string;
  skills: string[];
}

export const NURSERY_PUZZLES: NurseryPuzzle[] = [
  {
    id: "shape-matching",
    title: "Shape Matching",
    emoji: "🧩",
    ages: "3–6 yrs",
    description: "Drag 3D shapes into the right holes on the board.",
    href: "/shape-matching",
    gradient: "from-amber-500 to-orange-500",
    skills: ["Shapes", "Fine motor"],
  },
  {
    id: "color-sort",
    title: "Color Sort",
    emoji: "🎨",
    ages: "3–5 yrs",
    description: "Drop each picture into the matching color basket.",
    href: "/nursery/puzzles/color-sort",
    gradient: "from-pink-500 to-rose-500",
    skills: ["Colors", "Sorting"],
  },
  {
    id: "shadow-match",
    title: "Shadow Match",
    emoji: "🌓",
    ages: "4–6 yrs",
    description: "Which shadow belongs to each object?",
    href: "/nursery/puzzles/shadow-match",
    gradient: "from-indigo-500 to-violet-500",
    skills: ["Observation", "Matching"],
  },
  {
    id: "count-fun",
    title: "Count & Pick",
    emoji: "🔢",
    ages: "4–7 yrs",
    description: "Count the objects and tap the correct number.",
    href: "/nursery/puzzles/count-fun",
    gradient: "from-emerald-500 to-teal-500",
    skills: ["Counting", "Numbers 1–5"],
  },
];

export function getPuzzleById(id: string): NurseryPuzzle | undefined {
  return NURSERY_PUZZLES.find((p) => p.id === id);
}
