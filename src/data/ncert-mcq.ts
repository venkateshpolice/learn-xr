export interface McqQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  hint?: string;
}

const mathQuestions: McqQuestion[] = [
  {
    id: "m1",
    question: "What is 25 + 17?",
    options: ["40", "42", "43", "41"],
    answer: 1,
    hint: "Add the ones place first, then the tens.",
  },
  {
    id: "m2",
    question: "Which shape has 4 equal sides and 4 right angles?",
    options: ["Triangle", "Circle", "Square", "Rectangle"],
    answer: 2,
  },
  {
    id: "m3",
    question: "What is 7 × 8?",
    options: ["54", "56", "58", "48"],
    answer: 1,
    hint: "7 × 8 = 56",
  },
  {
    id: "m4",
    question: "Which fraction is equal to 1/2?",
    options: ["2/4", "1/3", "3/5", "2/3"],
    answer: 0,
  },
  {
    id: "m5",
    question: "What is the value of x if x + 5 = 12?",
    options: ["5", "6", "7", "8"],
    answer: 2,
  },
  {
    id: "m6",
    question: "What is the area of a rectangle with length 8 cm and width 5 cm?",
    options: ["13 cm²", "26 cm²", "40 cm²", "80 cm²"],
    answer: 2,
    hint: "Area = length × width",
  },
];

const scienceQuestions: McqQuestion[] = [
  {
    id: "s1",
    question: "Which gas do plants take in during photosynthesis?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
    answer: 1,
  },
  {
    id: "s2",
    question: "What is the boiling point of water at sea level?",
    options: ["90°C", "100°C", "110°C", "80°C"],
    answer: 1,
  },
  {
    id: "s3",
    question: "Which organ pumps blood through the body?",
    options: ["Lungs", "Brain", "Heart", "Liver"],
    answer: 2,
  },
  {
    id: "s4",
    question: "What type of energy does the Sun provide?",
    options: ["Nuclear", "Light and heat", "Sound", "Magnetic"],
    answer: 1,
  },
  {
    id: "s5",
    question: "Which state of matter has a fixed shape and volume?",
    options: ["Solid", "Liquid", "Gas", "Plasma"],
    answer: 0,
  },
  {
    id: "s6",
    question: "What is the chemical symbol for water?",
    options: ["O₂", "H₂O", "CO₂", "NaCl"],
    answer: 1,
  },
];

const englishQuestions: McqQuestion[] = [
  {
    id: "e1",
    question: "Which word is a noun?",
    options: ["Run", "Beautiful", "School", "Quickly"],
    answer: 2,
    hint: "A noun names a person, place, or thing.",
  },
  {
    id: "e2",
    question: "Choose the correct spelling:",
    options: ["Recieve", "Receive", "Receve", "Recive"],
    answer: 1,
  },
  {
    id: "e3",
    question: "What is the past tense of 'go'?",
    options: ["Goed", "Gone", "Went", "Going"],
    answer: 2,
  },
  {
    id: "e4",
    question: "Which sentence is correct?",
    options: ["She don't like tea.", "She doesn't like tea.", "She not like tea.", "She no like tea."],
    answer: 1,
  },
  {
    id: "e5",
    question: "What is a synonym for 'happy'?",
    options: ["Sad", "Joyful", "Angry", "Tired"],
    answer: 1,
  },
];

const hindiQuestions: McqQuestion[] = [
  {
    id: "h1",
    question: "'पुस्तक' शब्द का अर्थ क्या है?",
    options: ["Book", "Pen", "School", "Teacher"],
    answer: 0,
  },
  {
    id: "h2",
    question: "कौन-सा शब्द संज्ञा है?",
    options: ["खेलना", "लाल", "बच्चा", "धीरे"],
    answer: 2,
    hint: "संज्ञा किसी व्यक्ति, वस्तु या स्थान का नाम होता है।",
  },
  {
    id: "h3",
    question: "हिंदी वर्णमाला में स्वर कितने होते हैं?",
    options: ["10", "11", "12", "13"],
    answer: 1,
  },
  {
    id: "h4",
    question: "'गाय' का लिंग क्या है?",
    options: ["पुल्लिंग", "स्त्रीलिंग", "नपुंसकलिंग", "कोई नहीं"],
    answer: 1,
  },
  {
    id: "h5",
    question: "'सुंदर' शब्द की विलोम शब्द क्या है?",
    options: ["अच्छा", "बुरा", "कुरूप", "छोटा"],
    answer: 2,
  },
];

const evsQuestions: McqQuestion[] = [
  {
    id: "ev1",
    question: "Which of these is a natural resource?",
    options: ["Plastic bottle", "Water", "Mobile phone", "Toy car"],
    answer: 1,
  },
  {
    id: "ev2",
    question: "We should save water because —",
    options: ["It is unlimited", "It is precious", "It is not needed", "It is dirty"],
    answer: 1,
  },
  {
    id: "ev3",
    question: "Which animal gives us milk?",
    options: ["Dog", "Cow", "Cat", "Lion"],
    answer: 1,
  },
  {
    id: "ev4",
    question: "Trees help us by giving —",
    options: ["Plastic", "Oxygen", "Smoke", "Noise"],
    answer: 1,
  },
  {
    id: "ev5",
    question: "Which season comes after winter in India?",
    options: ["Monsoon", "Summer", "Autumn", "Spring"],
    answer: 1,
  },
];

const socialQuestions: McqQuestion[] = [
  {
    id: "ss1",
    question: "Who is known as the Father of the Nation in India?",
    options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Subhash Chandra Bose", "B.R. Ambedkar"],
    answer: 1,
  },
  {
    id: "ss2",
    question: "How many states are there in India (2024)?",
    options: ["28", "29", "30", "36"],
    answer: 0,
    hint: "India has 28 states and 8 union territories.",
  },
  {
    id: "ss3",
    question: "The Tropic of Cancer passes through which country?",
    options: ["India", "Australia", "Canada", "Russia"],
    answer: 0,
  },
  {
    id: "ss4",
    question: "What is the capital of India?",
    options: ["Mumbai", "Kolkata", "New Delhi", "Chennai"],
    answer: 2,
  },
  {
    id: "ss5",
    question: "Democracy means rule by —",
    options: ["King", "Military", "The people", "Rich people"],
    answer: 2,
  },
];

const physicsQuestions: McqQuestion[] = [
  {
    id: "p1",
    question: "What is the SI unit of force?",
    options: ["Joule", "Newton", "Watt", "Pascal"],
    answer: 1,
  },
  {
    id: "p2",
    question: "Speed = ?",
    options: ["Distance × Time", "Distance / Time", "Time / Distance", "Mass × Velocity"],
    answer: 1,
  },
  {
    id: "p3",
    question: "Which lens is used to correct myopia?",
    options: ["Convex", "Concave", "Plano-convex", "Cylindrical"],
    answer: 1,
  },
  {
    id: "p4",
    question: "Ohm's law is V = ?",
    options: ["IR", "I/R", "R/I", "I + R"],
    answer: 0,
  },
  {
    id: "p5",
    question: "The rate of change of velocity is called —",
    options: ["Speed", "Acceleration", "Momentum", "Force"],
    answer: 1,
  },
];

const chemistryQuestions: McqQuestion[] = [
  {
    id: "c1",
    question: "What is the atomic number of Carbon?",
    options: ["6", "8", "12", "14"],
    answer: 0,
  },
  {
    id: "c2",
    question: "Which gas is released when metals react with acids?",
    options: ["Oxygen", "Hydrogen", "Nitrogen", "Chlorine"],
    answer: 1,
  },
  {
    id: "c3",
    question: "pH of pure water is —",
    options: ["0", "7", "14", "1"],
    answer: 1,
  },
  {
    id: "c4",
    question: "Which bond is formed by sharing of electrons?",
    options: ["Ionic", "Covalent", "Metallic", "Hydrogen"],
    answer: 1,
  },
  {
    id: "c5",
    question: "Avogadro number is approximately —",
    options: ["6.022 × 10²³", "3.14 × 10²", "9.8 × 10²", "1.6 × 10⁻¹⁹"],
    answer: 0,
  },
];

const biologyQuestions: McqQuestion[] = [
  {
    id: "b1",
    question: "The powerhouse of the cell is —",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi body"],
    answer: 1,
  },
  {
    id: "b2",
    question: "Which blood group is universal donor?",
    options: ["A", "B", "AB", "O"],
    answer: 3,
  },
  {
    id: "b3",
    question: "Photosynthesis occurs in which organelle?",
    options: ["Chloroplast", "Mitochondria", "Nucleus", "Vacuole"],
    answer: 0,
  },
  {
    id: "b4",
    question: "DNA stands for —",
    options: ["Deoxyribonucleic acid", "Dinitrogen acid", "Dynamic nuclear acid", "None of these"],
    answer: 0,
  },
  {
    id: "b5",
    question: "Which vitamin is produced when skin is exposed to sunlight?",
    options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
    answer: 3,
  },
];

const commerceQuestions: McqQuestion[] = [
  {
    id: "co1",
    question: "Assets = Liabilities + ?",
    options: ["Expenses", "Capital", "Revenue", "Profit"],
    answer: 1,
    hint: "This is the accounting equation.",
  },
  {
    id: "co2",
    question: "GDP stands for —",
    options: ["Gross Domestic Product", "General Domestic Price", "Global Development Plan", "Gross Debt Payment"],
    answer: 0,
  },
  {
    id: "co3",
    question: "Which is a direct tax?",
    options: ["GST", "Income Tax", "Customs duty", "Excise duty"],
    answer: 1,
  },
  {
    id: "co4",
    question: "A debit note is issued when —",
    options: ["Goods returned to supplier", "Payment received", "Salary paid", "Loan taken"],
    answer: 0,
  },
  {
    id: "co5",
    question: "Planning, Organising, Staffing, Directing, Controlling are functions of —",
    options: ["Marketing", "Management", "Accounting", "Production"],
    answer: 1,
  },
];

const artsQuestions: McqQuestion[] = [
  {
    id: "a1",
    question: "The Indus Valley Civilization was discovered in —",
    options: ["1921", "1857", "1947", "1905"],
    answer: 0,
  },
  {
    id: "a2",
    question: "Which article of the Indian Constitution abolishes untouchability?",
    options: ["Article 14", "Article 17", "Article 21", "Article 32"],
    answer: 1,
  },
  {
    id: "a3",
    question: "The Himalayas are an example of —",
    options: ["Block mountains", "Fold mountains", "Volcanic mountains", "Plateau"],
    answer: 1,
  },
  {
    id: "a4",
    question: "Fundamental Rights are enshrined in Part — of the Constitution.",
    options: ["Part II", "Part III", "Part IV", "Part V"],
    answer: 1,
  },
  {
    id: "a5",
    question: "Who wrote 'Discovery of India'?",
    options: ["Gandhi", "Nehru", "Tagore", "Ambedkar"],
    answer: 1,
  },
];

const csQuestions: McqQuestion[] = [
  {
    id: "cs1",
    question: "Which of these is a programming language?",
    options: ["HTML", "Python", "CSS", "JSON"],
    answer: 1,
  },
  {
    id: "cs2",
    question: "What does CPU stand for?",
    options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"],
    answer: 0,
  },
  {
    id: "cs3",
    question: "In Python, print('Hello') will —",
    options: ["Delete Hello", "Display Hello", "Save Hello", "Nothing"],
    answer: 1,
  },
  {
    id: "cs4",
    question: "Binary number 101 equals decimal —",
    options: ["3", "4", "5", "6"],
    answer: 2,
    hint: "101₂ = 1×4 + 0×2 + 1×1 = 5",
  },
  {
    id: "cs5",
    question: "Which is volatile memory?",
    options: ["ROM", "Hard disk", "RAM", "SSD"],
    answer: 2,
  },
];

const SUBJECT_BANK: Record<string, McqQuestion[]> = {
  mathematics: mathQuestions,
  science: scienceQuestions,
  english: englishQuestions,
  hindi: hindiQuestions,
  evs: evsQuestions,
  "social-science": socialQuestions,
  physics: physicsQuestions,
  chemistry: chemistryQuestions,
  biology: biologyQuestions,
  accountancy: commerceQuestions,
  "business-studies": commerceQuestions,
  economics: commerceQuestions,
  history: artsQuestions,
  geography: artsQuestions,
  "political-science": artsQuestions,
  "computer-science": csQuestions,
};

export function getMcqForSubject(classId: string, subjectId: string): McqQuestion[] {
  const bank = SUBJECT_BANK[subjectId];
  if (!bank) {
    return [
      {
        id: "default-1",
        question: "NCERT textbooks are published by which organisation?",
        options: ["CBSE", "NCERT", "ICSE", "NIOS"],
        answer: 1,
      },
      {
        id: "default-2",
        question: "How many chapters are typically in an NCERT textbook?",
        options: ["Varies by subject", "Always 5", "Always 20", "None"],
        answer: 0,
      },
      {
        id: "default-3",
        question: "NCERT books are available in which format online?",
        options: ["PDF", "Audio only", "Video only", "Not available"],
        answer: 0,
      },
    ];
  }
  return bank.map((q) => ({ ...q, id: `${classId}-${subjectId}-${q.id}` }));
}

export function getMcqCount(classId: string, subjectId: string): number {
  return getMcqForSubject(classId, subjectId).length;
}
