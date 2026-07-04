import { LABS } from "@/data/labs-data";
import { NURSERY_PUZZLES } from "@/data/nursery-puzzles";
import { TRIGONOMETRY_MODULES } from "@/data/trigonometry-modules";
import type { LessonSubject, TeacherLesson } from "@/types/teacher";

const SUBJECT_LABELS: Record<LessonSubject, string> = {
  physics: "Physics",
  chemistry: "Chemistry",
  biology: "Biology",
  math: "Math",
  nursery: "Nursery",
  trigonometry: "Trigonometry",
};

export { SUBJECT_LABELS };

const DEFAULT_NOTES = [
  "Introduce the concept with a real-world example before launching the 3D model.",
  "Ask students to predict what will happen, then explore the simulation together.",
  "Pause at key moments and have students explain what they observe.",
  "Wrap up with 2–3 quick check questions before assigning independent practice.",
];

function labLessons(): TeacherLesson[] {
  const subjectMap: Record<string, LessonSubject> = {
    physics: "physics",
    chemistry: "chemistry",
    biology: "biology",
    math: "math",
  };

  return LABS.flatMap((lab) =>
    lab.experiments
      .filter((exp) => exp.status === "available" && exp.link)
      .map((exp) => ({
        id: exp.id,
        title: exp.name,
        description: exp.desc,
        subject: subjectMap[lab.id] ?? "physics",
        grades: lab.id === "math" ? "Grade 6–12" : lab.id === "biology" ? "Grade 5–10" : "Grade 6–12",
        durationMinutes: 25,
        link: exp.link!,
        has3D: true,
        hasXR: ["/solar-system", "/vernier-caliper", "/chemistry-lab", "/trigonometry"].includes(exp.link!),
        tags: [lab.title.replace(" Lab", ""), "3D Lab", "Interactive"],
        presenterNotes: [
          `Open with: "Today we explore ${exp.name.toLowerCase()}."`,
          `Launch the 3D experience and walk through the first interactive step together.`,
          `Give students 5 minutes to explore independently on their devices.`,
          `Discuss observations and connect back to the textbook concept.`,
        ],
      })),
  );
}

function trigLessons(): TeacherLesson[] {
  return TRIGONOMETRY_MODULES.filter((m) => m.has3D || m.hasXR).map((mod) => ({
    id: `trig-${mod.id}`,
    title: mod.title,
    description: mod.description,
    subject: "trigonometry" as const,
    grades: mod.grades,
    durationMinutes: 20,
    link: `/trigonometry/${mod.id}`,
    has3D: mod.has3D,
    hasXR: mod.hasXR,
    tags: ["Trigonometry", mod.category, ...(mod.hasXR ? ["XR"] : [])],
    presenterNotes: [
      `Module focus: ${mod.subtitle}`,
      "Demonstrate on the smart board, then let students try on tablets.",
      mod.hasXR ? "Optional: switch to AR/VR mode for advanced learners." : "Use the 3D view to visualize the concept spatially.",
      "Assign the module as homework for reinforcement.",
    ],
  }));
}

function nurseryLessons(): TeacherLesson[] {
  return [
    ...NURSERY_PUZZLES.map((puzzle) => ({
      id: puzzle.id,
      title: puzzle.title,
      description: puzzle.description,
      subject: "nursery" as const,
      grades: puzzle.ages,
      durationMinutes: 15,
      link: puzzle.href,
      has3D: true,
      hasXR: false,
      tags: ["Nursery", ...puzzle.skills],
      presenterNotes: DEFAULT_NOTES,
    })),
    {
      id: "alphabet-adventure",
      title: "Alphabet Adventure",
      description: "Drag-and-drop A–Z with 3D letters and voice learning.",
      subject: "nursery" as const,
      grades: "3–6 yrs",
      durationMinutes: 20,
      link: "/alphabet-adventure",
      has3D: true,
      hasXR: false,
      tags: ["Nursery", "Alphabet", "Literacy"],
      presenterNotes: DEFAULT_NOTES,
    },
    {
      id: "nursery-ar",
      title: "Nursery AR Categories",
      description: "Scan flashcards to reveal 3D animals, vehicles, and everyday objects.",
      subject: "nursery" as const,
      grades: "3–5 yrs",
      durationMinutes: 20,
      link: "/nursery",
      has3D: true,
      hasXR: true,
      tags: ["Nursery", "AR", "Flashcards"],
      presenterNotes: DEFAULT_NOTES,
    },
  ];
}

export const TEACHER_LESSONS: TeacherLesson[] = [
  ...labLessons(),
  ...trigLessons(),
  ...nurseryLessons(),
];

export function getLessonById(id: string): TeacherLesson | undefined {
  return TEACHER_LESSONS.find((l) => l.id === id);
}

export function searchLessons(query: string, subject?: LessonSubject | "all"): TeacherLesson[] {
  const q = query.trim().toLowerCase();
  return TEACHER_LESSONS.filter((lesson) => {
    if (subject && subject !== "all" && lesson.subject !== subject) return false;
    if (!q) return true;
    return (
      lesson.title.toLowerCase().includes(q) ||
      lesson.description.toLowerCase().includes(q) ||
      lesson.tags.some((t) => t.toLowerCase().includes(q)) ||
      lesson.grades.toLowerCase().includes(q)
    );
  });
}

export function getLessonsByIds(ids: string[]): TeacherLesson[] {
  return ids.map((id) => getLessonById(id)).filter(Boolean) as TeacherLesson[];
}
