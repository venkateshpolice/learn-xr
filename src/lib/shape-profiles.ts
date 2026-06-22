import * as THREE from "three";

const DEG = Math.PI / 180;

/** Arrow corner loop (right-pointing), used for reliable rim / outline triangulation. */
const ARROW_VERTS: ReadonlyArray<readonly [number, number]> = [
  [-0.38, -0.12],
  [0.05, -0.12],
  [0.05, -0.28],
  [0.42, 0],
  [0.05, 0.28],
  [0.05, 0.12],
  [-0.38, 0.12],
];

function bboxCenter(shape: THREE.Shape): { cx: number; cy: number } {
  const geo = new THREE.ShapeGeometry(shape);
  geo.computeBoundingBox();
  const box = geo.boundingBox!;
  const cx = (box.min.x + box.max.x) * 0.5;
  const cy = (box.min.y + box.max.y) * 0.5;
  geo.dispose();
  return { cx, cy };
}

function scalePolyline(
  verts: ReadonlyArray<readonly [number, number]>,
  scale: number,
  cx: number,
  cy: number,
): THREE.Vector2[] {
  return verts.map(([x, y]) => new THREE.Vector2(cx + (x - cx) * scale, cy + (y - cy) * scale));
}

function signedArea2D(pts: THREE.Vector2[]): number {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i]!.x * pts[j]!.y - pts[j]!.x * pts[i]!.y;
  }
  return area * 0.5;
}

function dedupeLoop(pts: THREE.Vector2[]): THREE.Vector2[] {
  if (pts.length < 2) return pts;
  const first = pts[0]!;
  const last = pts[pts.length - 1]!;
  if (first.distanceToSquared(last) < 1e-10) return pts.slice(0, -1);
  return pts;
}

/** Moon profile as two arcs (not circle-with-hole) so outlines and rims render correctly. */
function buildCrescentShape(s: number): THREE.Shape {
  const Ro = 0.4 * s;
  const Ri = 0.32 * s;
  const ox = 0.14 * s;
  const d = ox;
  const a = (Ro * Ro - Ri * Ri + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, Ro * Ro - a * a));
  const t1 = Math.atan2(h, a);
  const t2 = Math.atan2(-h, a);
  const p2 = Math.atan2(-h, a - ox);
  const p1 = Math.atan2(h, a - ox);

  const sh = new THREE.Shape();
  sh.moveTo(a, h);
  sh.absarc(0, 0, Ro, t1, t2, false);
  sh.absarc(ox, 0, Ri, p2, p1, true);
  sh.closePath();
  return sh;
}

/** Right-pointing arrow — explicit path so hole rim and outline match the piece. */
function buildArrowShape(s: number): THREE.Shape {
  const sh = new THREE.Shape();
  const [first, ...rest] = ARROW_VERTS;
  sh.moveTo(first![0] * s, first![1] * s);
  rest.forEach(([x, y]) => sh.lineTo(x * s, y * s));
  sh.closePath();
  return sh;
}

function getBaseProfile(id: string): THREE.Shape {
  if (id === "crescent") return buildCrescentShape(1);
  if (id === "arrow") return buildArrowShape(1);
  return getShapeProfile(id, 1);
}

/** Scale a closed profile uniformly around its bounding-box center. */
function scaleShapeFromCenter(base: THREE.Shape, scale: number, segments = 64): THREE.Shape {
  const { shape: pts, holes } = base.extractPoints(segments);
  if (pts.length === 0) return new THREE.Shape();

  const { cx, cy } = bboxCenter(base);

  const scaled = new THREE.Shape();
  pts.forEach((p, i) => {
    const x = cx + (p.x - cx) * scale;
    const y = cy + (p.y - cy) * scale;
    if (i === 0) scaled.moveTo(x, y);
    else scaled.lineTo(x, y);
  });
  scaled.closePath();

  for (const holePts of holes) {
    if (holePts.length === 0) continue;
    const hole = new THREE.Path();
    holePts.forEach((p, i) => {
      const x = cx + (p.x - cx) * scale;
      const y = cy + (p.y - cy) * scale;
      if (i === 0) hole.moveTo(x, y);
      else hole.lineTo(x, y);
    });
    hole.closePath();
    scaled.holes.push(hole);
  }

  return scaled;
}

/** Manual ring mesh — avoids ShapeGeometry earcut failures on arrow-like polygons. */
function buildRingBufferGeometry(outer: THREE.Vector2[], inner: THREE.Vector2[], cx: number, cy: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const n = outer.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ox0 = outer[i]!.x - cx;
    const oy0 = outer[i]!.y - cy;
    const ox1 = outer[j]!.x - cx;
    const oy1 = outer[j]!.y - cy;
    const ix0 = inner[i]!.x - cx;
    const iy0 = inner[i]!.y - cy;
    const ix1 = inner[j]!.x - cx;
    const iy1 = inner[j]!.y - cy;

    positions.push(ox0, oy0, 0, ox1, oy1, 0, ix1, iy1, 0);
    positions.push(ox0, oy0, 0, ix1, iy1, 0, ix0, iy0, 0);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  orientShapeGeometry(geo);
  return geo;
}

function regularPolygon(sides: number, radius: number, rotation = -90 * DEG): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i <= sides; i++) {
    const a = rotation + (i / sides) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return shape;
}

export function getShapeProfile(id: string, scale = 1): THREE.Shape {
  const s = scale;
  switch (id) {
    case "circle":
      return new THREE.Shape().absarc(0, 0, 0.38 * s, 0, Math.PI * 2, false);
    case "square":
      return (() => {
        const r = 0.36 * s;
        const sh = new THREE.Shape();
        sh.moveTo(-r, -r);
        sh.lineTo(r, -r);
        sh.lineTo(r, r);
        sh.lineTo(-r, r);
        sh.closePath();
        return sh;
      })();
    case "rectangle": {
      const sh = new THREE.Shape();
      sh.moveTo(-0.48 * s, -0.3 * s);
      sh.lineTo(0.48 * s, -0.3 * s);
      sh.lineTo(0.48 * s, 0.3 * s);
      sh.lineTo(-0.48 * s, 0.3 * s);
      sh.closePath();
      return sh;
    }
    case "triangle":
      return regularPolygon(3, 0.42 * s, -90 * DEG);
    case "oval": {
      const sh = new THREE.Shape();
      sh.absellipse(0, 0, 0.48 * s, 0.3 * s, 0, Math.PI * 2, false, 0);
      return sh;
    }
    case "star": {
      const sh = new THREE.Shape();
      const outer = 0.42 * s;
      const inner = 0.18 * s;
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) sh.moveTo(x, y);
        else sh.lineTo(x, y);
      }
      sh.closePath();
      return sh;
    }
    case "pentagon":
      return regularPolygon(5, 0.4 * s, -90 * DEG);
    case "hexagon":
      return regularPolygon(6, 0.4 * s, 0);
    case "diamond": {
      const sh = new THREE.Shape();
      sh.moveTo(0, 0.44 * s);
      sh.lineTo(0.32 * s, 0);
      sh.lineTo(0, -0.44 * s);
      sh.lineTo(-0.32 * s, 0);
      sh.closePath();
      return sh;
    }
    case "heart": {
      const sh = new THREE.Shape();
      const x = 0;
      const y = 0;
      sh.moveTo(x, y + 0.12 * s);
      sh.bezierCurveTo(x, y + 0.12 * s, -0.34 * s, y + 0.42 * s, -0.34 * s, y + 0.08 * s);
      sh.bezierCurveTo(-0.34 * s, y - 0.18 * s, x, y - 0.32 * s, x, y - 0.48 * s);
      sh.bezierCurveTo(x, y - 0.32 * s, 0.34 * s, y - 0.18 * s, 0.34 * s, y + 0.08 * s);
      sh.bezierCurveTo(0.34 * s, y + 0.42 * s, x, y + 0.12 * s, x, y + 0.12 * s);
      return sh;
    }
    case "crescent":
      return buildCrescentShape(s);
    case "trapezium": {
      const sh = new THREE.Shape();
      sh.moveTo(-0.28 * s, -0.32 * s);
      sh.lineTo(0.28 * s, -0.32 * s);
      sh.lineTo(0.44 * s, 0.32 * s);
      sh.lineTo(-0.44 * s, 0.32 * s);
      sh.closePath();
      return sh;
    }
    case "parallelogram": {
      const sh = new THREE.Shape();
      sh.moveTo(-0.38 * s, -0.28 * s);
      sh.lineTo(0.22 * s, -0.28 * s);
      sh.lineTo(0.38 * s, 0.28 * s);
      sh.lineTo(-0.22 * s, 0.28 * s);
      sh.closePath();
      return sh;
    }
    case "arrow":
      return buildArrowShape(s);
    case "cloud": {
      const sh = new THREE.Shape();
      sh.moveTo(-0.35 * s, 0);
      sh.bezierCurveTo(-0.35 * s, 0.22 * s, -0.12 * s, 0.28 * s, 0, 0.22 * s);
      sh.bezierCurveTo(0.08 * s, 0.38 * s, 0.32 * s, 0.36 * s, 0.38 * s, 0.14 * s);
      sh.bezierCurveTo(0.52 * s, 0.08 * s, 0.48 * s, -0.14 * s, 0.28 * s, -0.18 * s);
      sh.bezierCurveTo(0.22 * s, -0.34 * s, -0.02 * s, -0.32 * s, -0.12 * s, -0.18 * s);
      sh.bezierCurveTo(-0.28 * s, -0.28 * s, -0.42 * s, -0.14 * s, -0.35 * s, 0);
      return sh;
    }
    default:
      return new THREE.Shape().absarc(0, 0, 0.3, 0, Math.PI * 2, false);
  }
}

export function createExtrudedShape(id: string, depth: number, scale = 1): THREE.ExtrudeGeometry {
  const shape = scaleShapeFromCenter(getBaseProfile(id), scale);
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 24,
  });
}

/** Ring profile for puzzle-hole rim (outer minus inner silhouette). */
export function createRingProfile(id: string, outerScale: number, innerScale: number): THREE.Shape {
  const base = getBaseProfile(id);
  const { cx, cy } = bboxCenter(base);
  const outerPts = dedupeLoop(scaleShapeFromCenter(base, outerScale, 8).extractPoints(8).shape);
  let innerPts = dedupeLoop(scaleShapeFromCenter(base, innerScale, 8).extractPoints(8).shape);

  if (signedArea2D(outerPts) < 0) outerPts.reverse();
  if (signedArea2D(innerPts) > 0) innerPts.reverse();

  const centered = new THREE.Shape();
  outerPts.forEach((p, i) => {
    const x = p.x - cx;
    const y = p.y - cy;
    if (i === 0) centered.moveTo(x, y);
    else centered.lineTo(x, y);
  });
  centered.closePath();

  const centeredHole = new THREE.Path();
  innerPts.forEach((p, i) => {
    const x = p.x - cx;
    const y = p.y - cy;
    if (i === 0) centeredHole.moveTo(x, y);
    else centeredHole.lineTo(x, y);
  });
  centeredHole.closePath();
  centered.holes.push(centeredHole);
  return centered;
}

/** Rim mesh for board holes — manual triangulation for arrow, ShapeGeometry for others. */
export function createHoleRimGeometry(id: string, outerScale: number, innerScale: number): THREE.BufferGeometry {
  const base = getBaseProfile(id);

  if (id === "arrow") {
    const { cx, cy } = bboxCenter(base);
    const outer = scalePolyline(ARROW_VERTS, outerScale, cx, cy);
    const inner = scalePolyline(ARROW_VERTS, innerScale, cx, cy);
    return buildRingBufferGeometry(outer, inner, cx, cy);
  }

  const ring = createRingProfile(id, outerScale, innerScale);
  return orientShapeGeometry(new THREE.ShapeGeometry(ring, 16)) as THREE.BufferGeometry;
}

/** Shared XZ orientation used by puzzle pieces and board holes. */
export function orientShapeGeometry(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  geo.center();
  geo.rotateX(-Math.PI / 2);
  return geo;
}

/** Centered outline points in the board XZ plane (matches oriented piece geometry). */
export function getShapeOutlinePoints(id: string, scale = 1, segments = 56): THREE.Vector3[] {
  const base = getBaseProfile(id);
  const { cx, cy } = bboxCenter(base);

  let pts: THREE.Vector2[];
  if (id === "arrow") {
    pts = scalePolyline(ARROW_VERTS, scale, cx, cy);
  } else {
    const shape = scale === 1 ? base : scaleShapeFromCenter(base, scale, segments);
    pts = dedupeLoop(shape.extractPoints(segments).shape);
  }

  const vectors = pts.map((p) => new THREE.Vector3(p.x - cx, 0, -(p.y - cy)));
  if (vectors.length > 0) vectors.push(vectors[0]!.clone());
  return vectors;
}

/** Extruded cavity walls opening downward (top face at local y = 0, centered on XZ). */
export function createCavityGeometry(id: string, depth: number, scale = 1): THREE.ExtrudeGeometry {
  const geo = new THREE.ExtrudeGeometry(scaleShapeFromCenter(getBaseProfile(id), scale), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.011,
    bevelSegments: 3,
    curveSegments: 28,
  });
  orientShapeGeometry(geo);
  geo.computeBoundingBox();
  const box = geo.boundingBox!;
  geo.translate(0, -box.max.y, 0);
  geo.computeBoundingBox();
  return geo;
}

export function createFlatShapeGeometry(id: string, scale = 1, segments = 28): THREE.ShapeGeometry {
  return orientShapeGeometry(
    new THREE.ShapeGeometry(scaleShapeFromCenter(getBaseProfile(id), scale), segments),
  ) as THREE.ShapeGeometry;
}
