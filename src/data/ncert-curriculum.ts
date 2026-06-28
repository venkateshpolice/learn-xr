import { makeTextbook, ncertPortalUrl } from "./ncert-utils";

export type MaterialType =
  | "syllabus"
  | "exemplar"
  | "notes"
  | "worksheet"
  | "sample-paper";

export interface NcertChapter {
  id: string;
  number: number;
  title: string;
  pdfUrl: string;
}

export interface NcertTextbook {
  id: string;
  title: string;
  bookCode: string;
  language: "English" | "Hindi" | "Urdu";
  chapters: NcertChapter[];
  fullBookZip: string;
  ncertPortalUrl: string;
}

export interface NcertMaterial {
  id: string;
  title: string;
  type: MaterialType;
  description: string;
  url: string;
}

export interface NcertSubject {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  description: string;
  stream?: "Science" | "Commerce" | "Arts" | "Language" | "Core";
  textbooks: NcertTextbook[];
  materials: NcertMaterial[];
}

export interface NcertClass {
  id: string;
  grade: number;
  label: string;
  ageRange: string;
  color: string;
  description: string;
  subjects: NcertSubject[];
}

const portal = ncertPortalUrl();

function stdMaterials(classLabel: string, subjectName: string): NcertMaterial[] {
  return [
    {
      id: "syllabus",
      title: `${classLabel} ${subjectName} Syllabus`,
      type: "syllabus",
      description: "Official CBSE / NCERT curriculum outline for this class.",
      url: "https://cbseacademic.nic.in/web_material/CurriculumMain26.html",
    },
    {
      id: "exemplar",
      title: `${subjectName} Exemplar Problems`,
      type: "exemplar",
      description: "NCERT Exemplar book for extra practice and competitive exam prep.",
      url: "https://ncert.nic.in/exemplar-problems.php?ln=",
    },
    {
      id: "sample-paper",
      title: "Sample Question Paper",
      type: "sample-paper",
      description: "Practice with CBSE sample papers and marking schemes.",
      url: "https://cbseacademic.nic.in/SQP_classxii_2025-26.html",
    },
  ];
}

function primarySubjects(grade: number): NcertSubject[] {
  const cls = `Class ${grade}`;
  const chapters5 = ["Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5"];
  const chapters8 = [
    "Chapter 1",
    "Chapter 2",
    "Chapter 3",
    "Chapter 4",
    "Chapter 5",
    "Chapter 6",
    "Chapter 7",
    "Chapter 8",
  ];

  const bookCodes: Record<number, { en: string; hi: string; ma: string; ev: string }> = {
    1: { en: "aeap1", hi: "aehr1", ma: "aejm1", ev: "aevp1" },
    2: { en: "beap1", hi: "behr1", ma: "bejm1", ev: "bevp1" },
    3: { en: "ceap1", hi: "cehr1", ma: "cejm1", ev: "cevp1" },
    4: { en: "deap1", hi: "dehr1", ma: "dejm1", ev: "devp1" },
    5: { en: "eeap1", hi: "eehr1", ma: "eejm1", ev: "eevp1" },
  };
  const codes = bookCodes[grade];

  return [
    {
      id: "english",
      name: "English",
      emoji: "📖",
      gradient: "from-indigo-500 to-violet-500",
      description: "Reading, grammar, and stories from the NCERT English textbook.",
      stream: "Language",
      textbooks: [
        makeTextbook("english-main", `English Textbook — ${cls}`, codes.en, "English", chapters5),
      ],
      materials: stdMaterials(cls, "English"),
    },
    {
      id: "hindi",
      name: "Hindi",
      emoji: "🇮🇳",
      gradient: "from-orange-500 to-amber-500",
      description: "Hindi poems, stories, and language skills.",
      stream: "Language",
      textbooks: [
        makeTextbook("hindi-main", `Hindi Textbook — ${cls}`, codes.hi, "Hindi", chapters5),
      ],
      materials: stdMaterials(cls, "Hindi"),
    },
    {
      id: "mathematics",
      name: "Mathematics",
      emoji: "🔢",
      gradient: "from-emerald-500 to-teal-500",
      description: "Numbers, shapes, patterns, and problem solving.",
      stream: "Core",
      textbooks: [
        makeTextbook("math-main", `Mathematics — ${cls}`, codes.ma, "English", chapters5),
      ],
      materials: stdMaterials(cls, "Mathematics"),
    },
    {
      id: "evs",
      name: "EVS / Environmental Studies",
      emoji: "🌿",
      gradient: "from-green-500 to-lime-500",
      description: "Nature, family, community, and our surroundings.",
      stream: "Core",
      textbooks: [
        makeTextbook("evs-main", `EVS Textbook — ${cls}`, codes.ev, "English", chapters5),
      ],
      materials: stdMaterials(cls, "EVS"),
    },
  ];
}

function middleSubjects(grade: number): NcertSubject[] {
  const cls = `Class ${grade}`;
  const codes: Record<number, { hi: string; en: string; ma: string; sc: string; ss: string }> = {
    6: { hi: "fehp1", en: "feap1", ma: "fegp1", sc: "fepr1", ss: "fehi1" },
    7: { hi: "gehp1", en: "geap1", ma: "gegp1", sc: "gepr1", ss: "gehi1" },
    8: { hi: "hehp1", en: "heap1", ma: "hegp1", sc: "hepr1", ss: "hehi1" },
  };
  const c = codes[grade];
  const ch10 = Array.from({ length: 10 }, (_, i) => `Chapter ${i + 1}`);
  const ch12 = Array.from({ length: 12 }, (_, i) => `Chapter ${i + 1}`);

  return [
    {
      id: "hindi",
      name: "Hindi",
      emoji: "🇮🇳",
      gradient: "from-orange-500 to-amber-500",
      description: "Hindi literature and language for middle school.",
      stream: "Language",
      textbooks: [makeTextbook("hindi-main", `Hindi — ${cls}`, c.hi, "Hindi", ch10)],
      materials: stdMaterials(cls, "Hindi"),
    },
    {
      id: "english",
      name: "English",
      emoji: "📖",
      gradient: "from-indigo-500 to-violet-500",
      description: "Prose, poetry, and grammar from NCERT English.",
      stream: "Language",
      textbooks: [makeTextbook("english-main", `English — ${cls}`, c.en, "English", ch10)],
      materials: stdMaterials(cls, "English"),
    },
    {
      id: "mathematics",
      name: "Mathematics",
      emoji: "🔢",
      gradient: "from-emerald-500 to-teal-500",
      description: "Algebra, geometry, and data handling.",
      stream: "Core",
      textbooks: [makeTextbook("math-main", `Mathematics — ${cls}`, c.ma, "English", ch12)],
      materials: stdMaterials(cls, "Mathematics"),
    },
    {
      id: "science",
      name: "Science",
      emoji: "🔬",
      gradient: "from-cyan-500 to-blue-500",
      description: "Physics, chemistry, and biology concepts.",
      stream: "Core",
      textbooks: [makeTextbook("science-main", `Science — ${cls}`, c.sc, "English", ch12)],
      materials: stdMaterials(cls, "Science"),
    },
    {
      id: "social-science",
      name: "Social Science",
      emoji: "🌍",
      gradient: "from-rose-500 to-pink-500",
      description: "History, geography, and civics.",
      stream: "Core",
      textbooks: [makeTextbook("ss-main", `Social Science — ${cls}`, c.ss, "English", ch10)],
      materials: stdMaterials(cls, "Social Science"),
    },
  ];
}

function secondarySubjects(grade: number): NcertSubject[] {
  const cls = `Class ${grade}`;
  const codes =
    grade === 9
      ? { hi: "iehp1", en: "ieap1", ma: "iemh1", sc: "iesc1", ss: "iess4" }
      : { hi: "jehp1", en: "jeap1", ma: "jemh1", sc: "jesc1", ss: "jess4" };
  const ch15 = Array.from({ length: 15 }, (_, i) => `Chapter ${i + 1}`);

  return [
    {
      id: "hindi",
      name: "Hindi",
      emoji: "🇮🇳",
      gradient: "from-orange-500 to-amber-500",
      description: "Hindi Course A / B textbook.",
      stream: "Language",
      textbooks: [makeTextbook("hindi-main", `Hindi — ${cls}`, codes.hi, "Hindi", ch15)],
      materials: stdMaterials(cls, "Hindi"),
    },
    {
      id: "english",
      name: "English",
      emoji: "📖",
      gradient: "from-indigo-500 to-violet-500",
      description: "First Flight / Footprints supplementary reader.",
      stream: "Language",
      textbooks: [
        makeTextbook("english-main", `English — ${cls}`, codes.en, "English", ch15),
        makeTextbook(
          "english-supplementary",
          `English Supplementary — ${cls}`,
          grade === 9 ? "iebe1" : "jeff1",
          "English",
          Array.from({ length: 10 }, (_, i) => `Chapter ${i + 1}`),
        ),
      ],
      materials: stdMaterials(cls, "English"),
    },
    {
      id: "mathematics",
      name: "Mathematics",
      emoji: "🔢",
      gradient: "from-emerald-500 to-teal-500",
      description: "Algebra, trigonometry, and coordinate geometry.",
      stream: "Core",
      textbooks: [makeTextbook("math-main", `Mathematics — ${cls}`, codes.ma, "English", ch15)],
      materials: stdMaterials(cls, "Mathematics"),
    },
    {
      id: "science",
      name: "Science",
      emoji: "🔬",
      gradient: "from-cyan-500 to-blue-500",
      description: "Physics, chemistry, and biology for CBSE.",
      stream: "Core",
      textbooks: [makeTextbook("science-main", `Science — ${cls}`, codes.sc, "English", ch15)],
      materials: stdMaterials(cls, "Science"),
    },
    {
      id: "social-science",
      name: "Social Science",
      emoji: "🌍",
      gradient: "from-rose-500 to-pink-500",
      description: "History, geography, economics, and political science.",
      stream: "Core",
      textbooks: [makeTextbook("ss-main", `Social Science — ${cls}`, codes.ss, "English", ch15)],
      materials: stdMaterials(cls, "Social Science"),
    },
  ];
}

function seniorSecondarySubjects(grade: number): NcertSubject[] {
  const cls = `Class ${grade}`;
  const ch15 = Array.from({ length: 15 }, (_, i) => `Chapter ${i + 1}`);

  const subjects: NcertSubject[] = [
    {
      id: "physics",
      name: "Physics",
      emoji: "⚡",
      gradient: "from-yellow-500 to-orange-500",
      description: "Mechanics, optics, electricity, and modern physics.",
      stream: "Science",
      textbooks: [
        makeTextbook("physics-1", `Physics Part I — ${cls}`, grade === 11 ? "keph1" : "leph1", "English", ch15),
        makeTextbook("physics-2", `Physics Part II — ${cls}`, grade === 11 ? "keph2" : "leph2", "English", ch15),
      ],
      materials: stdMaterials(cls, "Physics"),
    },
    {
      id: "chemistry",
      name: "Chemistry",
      emoji: "⚗️",
      gradient: "from-purple-500 to-fuchsia-500",
      description: "Physical, organic, and inorganic chemistry.",
      stream: "Science",
      textbooks: [
        makeTextbook("chemistry-1", `Chemistry Part I — ${cls}`, grade === 11 ? "kech1" : "lech1", "English", ch15),
        makeTextbook("chemistry-2", `Chemistry Part II — ${cls}`, grade === 11 ? "kech2" : "lech2", "English", ch15),
      ],
      materials: stdMaterials(cls, "Chemistry"),
    },
    {
      id: "biology",
      name: "Biology",
      emoji: "🧬",
      gradient: "from-green-500 to-emerald-500",
      description: "Botany, zoology, and human physiology.",
      stream: "Science",
      textbooks: [
        makeTextbook("biology-main", `Biology — ${cls}`, grade === 11 ? "kebo1" : "lebo1", "English", ch15),
      ],
      materials: stdMaterials(cls, "Biology"),
    },
    {
      id: "mathematics",
      name: "Mathematics",
      emoji: "📐",
      gradient: "from-emerald-500 to-teal-500",
      description: "Calculus, algebra, and probability.",
      stream: "Science",
      textbooks: [
        makeTextbook("math-1", `Mathematics Part I — ${cls}`, grade === 11 ? "kemh1" : "lemh1", "English", ch15),
        makeTextbook("math-2", `Mathematics Part II — ${cls}`, grade === 11 ? "kemh2" : "lemh2", "English", ch15),
      ],
      materials: stdMaterials(cls, "Mathematics"),
    },
    {
      id: "accountancy",
      name: "Accountancy",
      emoji: "📊",
      gradient: "from-blue-500 to-indigo-500",
      description: "Financial accounting and partnership accounts.",
      stream: "Commerce",
      textbooks: [
        makeTextbook("accounts-1", `Accountancy Part I — ${cls}`, grade === 11 ? "keac1" : "leac1", "English", ch15),
        makeTextbook("accounts-2", `Accountancy Part II — ${cls}`, grade === 11 ? "keac2" : "leac2", "English", ch15),
      ],
      materials: stdMaterials(cls, "Accountancy"),
    },
    {
      id: "business-studies",
      name: "Business Studies",
      emoji: "💼",
      gradient: "from-slate-500 to-zinc-500",
      description: "Principles of management and business environment.",
      stream: "Commerce",
      textbooks: [
        makeTextbook("bst-1", `Business Studies Part I — ${cls}`, grade === 11 ? "kebs1" : "lebs1", "English", ch15),
        makeTextbook("bst-2", `Business Studies Part II — ${cls}`, grade === 11 ? "kebs2" : "lebs2", "English", ch15),
      ],
      materials: stdMaterials(cls, "Business Studies"),
    },
    {
      id: "economics",
      name: "Economics",
      emoji: "💰",
      gradient: "from-amber-500 to-yellow-500",
      description: "Microeconomics, macroeconomics, and Indian economy.",
      stream: "Commerce",
      textbooks: [
        makeTextbook("eco-main", `Economics — ${cls}`, grade === 11 ? "keec1" : "leec1", "English", ch15),
        makeTextbook("eco-indian", `Indian Economic Development — ${cls}`, grade === 11 ? "keec2" : "leec2", "English", ch15),
      ],
      materials: stdMaterials(cls, "Economics"),
    },
    {
      id: "history",
      name: "History",
      emoji: "🏛️",
      gradient: "from-amber-700 to-orange-600",
      description: "Themes in Indian and world history.",
      stream: "Arts",
      textbooks: [
        makeTextbook("history-main", `Themes in Indian History — ${cls}`, grade === 11 ? "kehs1" : "lehs1", "English", ch15),
      ],
      materials: stdMaterials(cls, "History"),
    },
    {
      id: "geography",
      name: "Geography",
      emoji: "🗺️",
      gradient: "from-teal-500 to-cyan-500",
      description: "Physical and human geography of India and the world.",
      stream: "Arts",
      textbooks: [
        makeTextbook("geo-main", `Fundamentals of Human Geography — ${cls}`, grade === 11 ? "kegy2" : "legy2", "English", ch15),
        makeTextbook("geo-india", `India: People and Economy — ${cls}`, grade === 11 ? "kegy3" : "legy3", "English", ch15),
      ],
      materials: stdMaterials(cls, "Geography"),
    },
    {
      id: "political-science",
      name: "Political Science",
      emoji: "⚖️",
      gradient: "from-red-500 to-rose-500",
      description: "Indian constitution and political theory.",
      stream: "Arts",
      textbooks: [
        makeTextbook("pol-sci-1", `Political Science Part I — ${cls}`, grade === 11 ? "keps1" : "leps1", "English", ch15),
        makeTextbook("pol-sci-2", `Political Science Part II — ${cls}`, grade === 11 ? "keps2" : "leps2", "English", ch15),
      ],
      materials: stdMaterials(cls, "Political Science"),
    },
    {
      id: "english",
      name: "English",
      emoji: "📖",
      gradient: "from-indigo-500 to-violet-500",
      description: "Hornbill, Snapshots, and writing skills.",
      stream: "Language",
      textbooks: [
        makeTextbook("english-main", `English — ${cls}`, grade === 11 ? "kehb1" : "lehb1", "English", ch15),
      ],
      materials: stdMaterials(cls, "English"),
    },
    {
      id: "hindi",
      name: "Hindi",
      emoji: "🇮🇳",
      gradient: "from-orange-500 to-amber-500",
      description: "Hindi core and elective literature.",
      stream: "Language",
      textbooks: [
        makeTextbook("hindi-main", `Hindi — ${cls}`, grade === 11 ? "kehi1" : "lehi1", "Hindi", ch15),
      ],
      materials: stdMaterials(cls, "Hindi"),
    },
    {
      id: "computer-science",
      name: "Computer Science",
      emoji: "💻",
      gradient: "from-violet-500 to-purple-500",
      description: "Programming in Python and computer fundamentals.",
      stream: "Science",
      textbooks: [
        makeTextbook("cs-main", `Computer Science — ${cls}`, grade === 11 ? "kecs1" : "lecs1", "English", ch15),
      ],
      materials: stdMaterials(cls, "Computer Science"),
    },
  ];

  return subjects.map((s) => ({
    ...s,
    materials: [
      ...s.materials,
      {
        id: "ncert-portal",
        title: "Browse on NCERT Portal",
        type: "notes" as MaterialType,
        description: "Open the official NCERT textbook portal for this class.",
        url: portal,
      },
    ],
  }));
}

function buildClass(grade: number): NcertClass {
  const colors = [
    "from-pink-500 to-rose-400",
    "from-amber-500 to-orange-400",
    "from-emerald-500 to-teal-400",
    "from-cyan-500 to-blue-400",
    "from-indigo-500 to-violet-400",
    "from-purple-500 to-fuchsia-400",
  ];
  const ageRanges: Record<number, string> = {
    1: "6–7 years",
    2: "7–8 years",
    3: "8–9 years",
    4: "9–10 years",
    5: "10–11 years",
    6: "11–12 years",
    7: "12–13 years",
    8: "13–14 years",
    9: "14–15 years",
    10: "15–16 years",
    11: "16–17 years",
    12: "17–18 years",
  };

  let subjects: NcertSubject[];
  if (grade <= 5) subjects = primarySubjects(grade);
  else if (grade <= 8) subjects = middleSubjects(grade);
  else if (grade <= 10) subjects = secondarySubjects(grade);
  else subjects = seniorSecondarySubjects(grade);

  return {
    id: `class-${grade}`,
    grade,
    label: `Class ${grade}`,
    ageRange: ageRanges[grade],
    color: colors[(grade - 1) % colors.length],
    description: `NCERT textbooks, study materials, and MCQ practice for Class ${grade}.`,
    subjects,
  };
}

export const NCERT_CLASSES: NcertClass[] = Array.from({ length: 12 }, (_, i) => buildClass(i + 1));

export function getClassById(classId: string): NcertClass | undefined {
  return NCERT_CLASSES.find((c) => c.id === classId);
}

export function getSubjectById(classId: string, subjectId: string): NcertSubject | undefined {
  return getClassById(classId)?.subjects.find((s) => s.id === subjectId);
}

export function getTextbookById(
  classId: string,
  subjectId: string,
  bookId: string,
): NcertTextbook | undefined {
  return getSubjectById(classId, subjectId)?.textbooks.find((b) => b.id === bookId);
}

export function getClassesForGradeBand(bandId: string): NcertClass[] {
  const bands: Record<string, number[]> = {
    nursery: [],
    "grade-1-3": [1, 2, 3],
    "grade-4-5": [4, 5],
    "grade-6-8": [6, 7, 8],
    "grade-9-10": [9, 10],
    "grade-11-12": [11, 12],
  };
  const grades = bands[bandId] ?? [];
  return NCERT_CLASSES.filter((c) => grades.includes(c.grade));
}

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  syllabus: "Syllabus",
  exemplar: "Exemplar",
  notes: "Reference",
  worksheet: "Worksheet",
  "sample-paper": "Sample Paper",
};

export const STREAM_LABELS = ["Core", "Language", "Science", "Commerce", "Arts"] as const;
