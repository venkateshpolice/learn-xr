export type LensType = "convex" | "concave";

export interface RaySegment {
  points: [number, number, number][];
  color: string;
  dashed?: boolean;
}

export interface LensImageResult {
  do: number;
  di: number;
  f: number;
  magnification: number;
  imageX: number;
  imageY: number;
  objectHeight: number;
  imageHeight: number;
  isVirtual: boolean;
  isInverted: boolean;
  isReal: boolean;
  description: string;
  rays: RaySegment[];
}

const FOCAL_LENGTH = 2.8;

export function getFocalLength() {
  return FOCAL_LENGTH;
}

function lineAtX(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x: number,
): number {
  if (Math.abs(x1 - x0) < 1e-9) return y0;
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

function clipRay(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  xMin: number,
  xMax: number,
): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    if (x >= xMin && x <= xMax) pts.push([x, y, 0.02]);
  }
  return pts.length >= 2 ? pts : [[x0, y0, 0.02], [x1, y1, 0.02]];
}

export function computeLensImage(
  lensType: LensType,
  objectDistance: number,
  objectHeight: number,
): LensImageResult {
  const doDist = Math.max(objectDistance, 0.35);
  const f = lensType === "convex" ? FOCAL_LENGTH : -FOCAL_LENGTH;
  const objectX = -doDist;
  const objectY = objectHeight;

  const invDi = 1 / f - 1 / doDist;
  const atFocus = Math.abs(invDi) < 0.002;
  const di = atFocus ? Infinity : 1 / invDi;

  const magnification = atFocus ? Infinity : -di / doDist;
  const imageHeight = atFocus ? objectHeight * 8 : magnification * objectHeight;
  const imageX = atFocus ? FOCAL_LENGTH * 4 : di;
  const imageY = imageHeight;

  const isVirtual = !atFocus && di < 0;
  const isReal = !atFocus && di > 0;
  const isInverted = magnification < 0;

  const fObj = lensType === "convex" ? -FOCAL_LENGTH : FOCAL_LENGTH;
  const fImg = lensType === "convex" ? FOCAL_LENGTH : -FOCAL_LENGTH;

  const yAtLensRay1 = objectY;
  const yAtLensRay3 = lineAtX(objectX, objectY, fObj, 0, 0);

  const rays: RaySegment[] = [];

  // Ray 1: parallel → through image-side focus
  rays.push({
    color: "#ffd080",
    points: [
      [objectX, objectY, 0.02],
      [0, yAtLensRay1, 0.02],
      ...clipRay(0, yAtLensRay1, fImg, 0, 0.05, 8).slice(1),
    ],
  });

  // Ray 2: through optical center
  const ray2EndX = isVirtual ? objectX + 6 : Math.min(imageX + 1, 8);
  const ray2EndY = lineAtX(objectX, objectY, 0, 0, ray2EndX);
  rays.push({
    color: "#ff9944",
    points: [
      [objectX, objectY, 0.02],
      [0, 0, 0.02],
      [ray2EndX, ray2EndY, 0.02],
    ],
  });

  // Ray 3: through object-side focus → parallel exit
  rays.push({
    color: "#66ddff",
    points: [
      [objectX, objectY, 0.02],
      [0, yAtLensRay3, 0.02],
      [8, yAtLensRay3, 0.02],
    ],
  });

  if (!atFocus) {
    // Extensions to image (dashed if virtual)
    rays.push({
      color: isVirtual ? "#a78bfa" : "#4ade80",
      dashed: isVirtual,
      points: [
        [0, yAtLensRay1, 0.02],
        [imageX, imageY, 0.02],
      ],
    });
    rays.push({
      color: isVirtual ? "#a78bfa" : "#4ade80",
      dashed: isVirtual,
      points: [
        [0, yAtLensRay3, 0.02],
        [imageX, imageY, 0.02],
      ],
    });
  }

  let description: string;
  if (atFocus) {
    description = "Object at focal point — rays emerge parallel; no sharp image forms on a screen.";
  } else if (lensType === "convex") {
    if (doDist > 2 * FOCAL_LENGTH) {
      description = "Real, inverted, diminished image — object beyond 2F (like a camera).";
    } else if (doDist > FOCAL_LENGTH) {
      description = "Real, inverted, magnified image — object between F and 2F.";
    } else {
      description = "Virtual, upright, magnified image — object inside F (magnifying glass).";
    }
  } else if (isVirtual) {
    description = "Virtual, upright, diminished image — concave lenses always diverge light.";
  } else {
    description = "Image formed by concave lens.";
  }

  return {
    do: doDist,
    di: atFocus ? Infinity : di,
    f,
    magnification: atFocus ? Infinity : magnification,
    imageX: atFocus ? FOCAL_LENGTH * 3 : imageX,
    imageY,
    objectHeight,
    imageHeight,
    isVirtual,
    isInverted,
    isReal,
    description,
    rays,
  };
}

export const LENS_STAGES = [
  {
    id: "intro",
    title: "Convex & Concave Lenses",
    subtitle: "How lenses bend light to form images",
    description:
      "Lenses refract light to converge or diverge rays. A convex (converging) lens can project real images on a screen. A concave (diverging) lens always creates a virtual, upright image. Move the object to explore.",
    lensType: "convex" as LensType,
    objectDistance: 7,
  },
  {
    id: "convex-far",
    title: "Convex: Object Far Away",
    subtitle: "Real inverted image",
    description:
      "When the object is farther than 2F, the image is real, inverted, and smaller — like a camera focusing on a distant scene.",
    lensType: "convex" as LensType,
    objectDistance: 8,
  },
  {
    id: "convex-near",
    title: "Convex: Object Near Lens",
    subtitle: "Virtual magnified image",
    description:
      "Inside the focal length F, rays diverge after the lens. Your eye traces them back to a virtual, upright, enlarged image — how a magnifying glass works.",
    lensType: "convex" as LensType,
    objectDistance: 1.8,
  },
  {
    id: "concave",
    title: "Concave Lens",
    subtitle: "Always virtual & diminished",
    description:
      "Concave lenses spread parallel rays as if from a virtual focus. The image stays upright, smaller, and on the same side as the object — used in glasses for myopia.",
    lensType: "concave" as LensType,
    objectDistance: 5,
  },
  {
    id: "explore",
    title: "Explore",
    subtitle: "Move the object yourself",
    description:
      "Drag the object distance slider and switch lens types. Watch rays, image position, and the live viewfinder update in real time.",
    lensType: "convex" as LensType,
    objectDistance: 5,
  },
];
