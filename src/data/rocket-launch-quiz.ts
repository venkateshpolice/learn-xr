import type { McqQuestion } from "@/data/ncert-mcq";

/** Quiz covering all 10 launch stages — pad through satellite deploy */
export const ROCKET_LAUNCH_QUIZ: McqQuestion[] = [
  {
    id: "rl-1",
    question: "On the launch pad, what makes up most of a fully fueled rocket's mass?",
    options: ["The satellite payload", "Propellant (fuel + oxidizer)", "The launch tower", "Avionics computers"],
    answer: 1,
    hint: "About 96% of a Falcon 9's mass at liftoff is fuel!",
  },
  {
    id: "rl-2",
    question: "Which two propellants do SpaceX Falcon 9 rockets primarily use?",
    options: ["Hydrogen and oxygen", "Liquid oxygen (LOX) and RP-1 kerosene", "Solid fuel pellets", "Nitrogen and methane"],
    answer: 1,
    hint: "RP-1 is a highly refined form of kerosene.",
  },
  {
    id: "rl-3",
    question: "At T-0 engine ignition, combustion chamber temperatures can reach approximately:",
    options: ["500°C", "1,000°C", "3,300°C", "10,000°C"],
    answer: 2,
    hint: "Rocket engines are among the hottest machines humans have built.",
  },
  {
    id: "rl-4",
    question: "What physics law explains why exhaust pushing down makes the rocket rise?",
    options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Gravitation"],
    answer: 2,
    hint: "Every action has an equal and opposite reaction.",
  },
  {
    id: "rl-5",
    question: "Why does the rocket perform a 'gravity turn' instead of flying straight up?",
    options: [
      "To avoid the launch tower",
      "It is the most fuel-efficient path to orbit",
      "To reduce engine temperature",
      "To deploy the fairing early",
    ],
    answer: 1,
    hint: "Orbit requires horizontal speed, not just altitude.",
  },
  {
    id: "rl-6",
    question: "What is Max-Q?",
    options: [
      "Maximum engine thrust",
      "Maximum aerodynamic pressure on the rocket",
      "Maximum satellite mass",
      "Maximum fuel consumption rate",
    ],
    answer: 1,
    hint: "Atmospheric pressure peaks around 12 km altitude during ascent.",
  },
  {
    id: "rl-7",
    question: "During stage separation, what happens to the first-stage booster?",
    options: [
      "It continues to orbit with the payload",
      "It detaches and falls away while the second stage ignites",
      "It becomes the fairing",
      "It deploys the satellite",
    ],
    answer: 1,
    hint: "Multi-stage rockets shed dead weight to reach orbit efficiently.",
  },
  {
    id: "rl-8",
    question: "At roughly what altitude does first-stage separation typically occur?",
    options: ["5 km", "70 km", "400 km", "1,000 km"],
    answer: 1,
    hint: "This is near the edge of the upper atmosphere.",
  },
  {
    id: "rl-9",
    question: "Why is the payload fairing jettisoned in space?",
    options: [
      "It runs out of fuel",
      "Air resistance is gone — the nose cone is no longer needed",
      "The satellite is too heavy",
      "It blocks the engine exhaust",
    ],
    answer: 1,
    hint: "Fairings protect the payload from aerodynamic heating during ascent.",
  },
  {
    id: "rl-10",
    question: "What orbital speed is needed for a satellite in low Earth orbit (~400 km)?",
    options: ["340 m/s", "1,000 m/s", "7.66 km/s", "50 km/s"],
    answer: 2,
    hint: "That's about 27,600 km/h — roughly 25 times the speed of sound.",
  },
  {
    id: "rl-11",
    question: "What deploys from the satellite after separation to generate power?",
    options: ["Rocket boosters", "Solar panels", "The payload fairing", "Landing legs"],
    answer: 1,
    hint: "Satellites unfold solar wings to capture sunlight in orbit.",
  },
  {
    id: "rl-12",
    question: "Put these events in the correct order during a launch:",
    options: [
      "Liftoff → Countdown → Orbit → Ignition",
      "Countdown → Ignition → Liftoff → Stage Separation → Orbit",
      "Orbit → Fairing Sep → Liftoff → Pad",
      "Deploy → Max-Q → Ignition → Pad",
    ],
    answer: 1,
    hint: "Think through the 10 stages you just experienced in order.",
  },
  {
    id: "rl-13",
    question: "The Kármán line (edge of space) is internationally recognized at:",
    options: ["12 km", "50 km", "100 km", "400 km"],
    answer: 2,
    hint: "Above 100 km, aerodynamic flight by wings is no longer possible.",
  },
  {
    id: "rl-14",
    question: "What holds the rocket on the pad until engines reach full thrust?",
    options: ["Umbilical fuel lines", "Hold-down clamps", "The fairing", "Grid fins"],
    answer: 1,
    hint: "Clamps release only when thrust exceeds the rocket's weight.",
  },
  {
    id: "rl-15",
    question: "After satellite deploy, the spent second stage typically:",
    options: [
      "Returns to the launch pad",
      "Drifts away while the satellite begins its mission",
      "Re-enters immediately as the payload",
      "Becomes a permanent space station module",
    ],
    answer: 1,
    hint: "Watch the deploy animation — the satellite pushes away from the spent stage.",
  },
];

export const ROCKET_LAUNCH_QUIZ_TITLE = "Launch Sequence Quiz";
