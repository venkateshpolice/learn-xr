export type EclipseMode = "solar" | "lunar";

export interface EclipseStage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  funFact: string;
  mode: EclipseMode | "both";
  moonAngle: number;
  showInclination: boolean;
  camera: [number, number, number];
  lookAt: [number, number, number];
}

export const ECLIPSE_STAGES: EclipseStage[] = [
  {
    id: "overview",
    title: "Solar & Lunar Eclipses",
    subtitle: "When three bodies align",
    description:
      "An eclipse happens when the Sun, Moon, and Earth line up. A solar eclipse occurs when the Moon passes between the Sun and Earth, casting a shadow on Earth. A lunar eclipse happens when Earth passes between the Sun and Moon, blocking sunlight from reaching the Moon.",
    funFact:
      "Total solar eclipses are rare at any one spot — they happen somewhere on Earth only about every 18 months!",
    mode: "both",
    moonAngle: Math.PI * 0.85,
    showInclination: false,
    camera: [0, 6, 22],
    lookAt: [0, 0, 0],
  },
  {
    id: "orbits",
    title: "Why Eclipses Are Rare",
    subtitle: "The Moon's tilted orbit",
    description:
      "The Moon orbits Earth every 27.3 days, so you might expect an eclipse every month. But the Moon's orbit is tilted about 5° relative to Earth's orbit around the Sun. Most months, the Moon passes above or below the Sun-Earth line and no eclipse occurs.",
    funFact:
      "The Moon's orbital plane wobbles over an 18.6-year cycle called the lunar nodal precession.",
    mode: "both",
    moonAngle: Math.PI * 0.65,
    showInclination: true,
    camera: [4, 10, 14],
    lookAt: [0, 0, 0],
  },
  {
    id: "solar-alignment",
    title: "Solar Eclipse Alignment",
    subtitle: "Moon between Sun and Earth",
    description:
      "During a new moon, when the Moon is between the Sun and Earth and the orbits align, the Moon blocks some or all of the Sun's light. Observers in the Moon's shadow on Earth see the Sun go dark — a solar eclipse.",
    funFact:
      "The Sun is about 400 times larger than the Moon, but also about 400 times farther away — so they appear nearly the same size in our sky!",
    mode: "solar",
    moonAngle: Math.PI,
    showInclination: false,
    camera: [-6, 2, 10],
    lookAt: [-4, 0, 0],
  },
  {
    id: "umbra-penumbra",
    title: "Umbra & Penumbra",
    subtitle: "Two shadow zones",
    description:
      "The Moon casts two shadows. The umbra is the dark inner cone where the Sun is completely blocked — observers here see a total solar eclipse. The penumbra is the lighter outer shadow where only part of the Sun is blocked — a partial eclipse.",
    funFact:
      "The umbra on Earth's surface is only about 100–270 km wide during a total solar eclipse.",
    mode: "solar",
    moonAngle: Math.PI,
    showInclination: false,
    camera: [-2, 3, 8],
    lookAt: [0, 0, 0],
  },
  {
    id: "solar-types",
    title: "Types of Solar Eclipses",
    subtitle: "Total, partial & annular",
    description:
      "A total eclipse happens when the Moon fully covers the Sun. A partial eclipse occurs when they are only partly aligned. An annular eclipse happens when the Moon is farther from Earth and appears smaller, leaving a bright ring — the 'ring of fire' — around the Moon.",
    funFact:
      "During totality, you can briefly see the Sun's corona — its outer atmosphere, normally hidden by glare.",
    mode: "solar",
    moonAngle: Math.PI,
    showInclination: false,
    camera: [-8, 1, 6],
    lookAt: [-5, 0, 0],
  },
  {
    id: "lunar-eclipse",
    title: "Lunar Eclipse",
    subtitle: "Earth's shadow on the Moon",
    description:
      "During a full moon, when Earth is between the Sun and Moon, our planet blocks direct sunlight from reaching the Moon. The Moon doesn't go completely black — Earth's atmosphere bends red light into the shadow, giving a 'blood moon' during totality.",
    funFact:
      "Unlike solar eclipses, a lunar eclipse can be seen from anywhere on the night side of Earth.",
    mode: "lunar",
    moonAngle: 0,
    showInclination: false,
    camera: [6, 3, 10],
    lookAt: [2, 0, 0],
  },
  {
    id: "explore",
    title: "Explore & Experiment",
    subtitle: "Drag the Moon into position",
    description:
      "Use the alignment slider to move the Moon around Earth. Try to create a solar eclipse (Moon between Sun and Earth) or a lunar eclipse (Moon behind Earth). Toggle orbit inclination to see why perfect alignment is uncommon.",
    funFact:
      "The next total solar eclipse visible from the continental US will be on August 23, 2044.",
    mode: "both",
    moonAngle: Math.PI * 0.5,
    showInclination: false,
    camera: [0, 8, 18],
    lookAt: [0, 0, 0],
  },
];
