"use client";

import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export type LabBackgroundPreset = "optics-lab" | "lens-lab" | "space" | "electric-lab" | "fluid-lab";

const PRESET_META: Record<
  LabBackgroundPreset,
  { fog: string; wall: boolean; dome: boolean }
> = {
  "optics-lab": { fog: "#0a1524", wall: true, dome: true },
  "lens-lab": { fog: "#080a14", wall: true, dome: true },
  space: { fog: "#030008", wall: false, dome: true },
  "electric-lab": { fog: "#080a12", wall: true, dome: true },
  "fluid-lab": { fog: "#0a1628", wall: true, dome: true },
};

function drawOpticsLab(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(0, "#1e3a5f");
  sky.addColorStop(0.45, "#2d4a72");
  sky.addColorStop(1, "#1a2d4a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.62);

  for (let col = 0; col < 4; col++) {
    const wx = w * 0.12 + col * w * 0.19;
    const wy = h * 0.1;
    const ww = w * 0.11;
    const wh = h * 0.34;
    const glow = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
    glow.addColorStop(0, "rgba(186,230,253,0.55)");
    glow.addColorStop(0.5, "rgba(125,211,252,0.35)");
    glow.addColorStop(1, "rgba(56,189,248,0.2)");
    ctx.fillStyle = glow;
    ctx.fillRect(wx, wy, ww, wh);
    ctx.strokeStyle = "rgba(226,232,240,0.55)";
    ctx.lineWidth = Math.max(2, w * 0.002);
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.beginPath();
    ctx.moveTo(wx + ww / 2, wy);
    ctx.lineTo(wx + ww / 2, wy + wh);
    ctx.moveTo(wx, wy + wh / 2);
    ctx.lineTo(wx + ww, wy + wh / 2);
    ctx.stroke();
  }

  const wall = ctx.createLinearGradient(0, h * 0.48, 0, h * 0.82);
  wall.addColorStop(0, "#334155");
  wall.addColorStop(1, "#1e293b");
  ctx.fillStyle = wall;
  ctx.fillRect(0, h * 0.48, w, h * 0.34);

  const bx = w * 0.06;
  const by = h * 0.5;
  const bw = w * 0.34;
  const bh = h * 0.24;
  ctx.fillStyle = "#14532d";
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = Math.max(3, w * 0.003);
  ctx.strokeRect(bx - 6, by - 6, bw + 12, bh + 12);
  ctx.strokeStyle = "rgba(187,247,208,0.35)";
  ctx.lineWidth = Math.max(1.5, w * 0.0015);
  for (let i = 0; i < 5; i++) {
    const y = by + bh * 0.2 + i * bh * 0.15;
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.08, y);
    ctx.lineTo(bx + bw * (0.55 + i * 0.07), y);
    ctx.stroke();
  }
  ctx.font = `${Math.round(h * 0.035)}px sans-serif`;
  ctx.fillStyle = "rgba(187,247,208,0.45)";
  ctx.fillText("n₁ sin θ₁ = n₂ sin θ₂", bx + bw * 0.08, by + bh * 0.82);

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(w * 0.52, h * 0.52, w * 0.38, h * 0.08);
  ctx.fillRect(w * 0.55, h * 0.62, w * 0.12, h * 0.14);
  ctx.fillRect(w * 0.72, h * 0.6, w * 0.14, h * 0.16);

  const floor = ctx.createLinearGradient(0, h * 0.78, 0, h);
  floor.addColorStop(0, "#1e293b");
  floor.addColorStop(1, "#0f172a");
  ctx.fillStyle = floor;
  ctx.fillRect(0, h * 0.78, w, h * 0.22);
  ctx.strokeStyle = "rgba(148,163,184,0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 14; i++) {
    const x = (i / 13) * w;
    ctx.beginPath();
    ctx.moveTo(x, h * 0.78);
    ctx.lineTo(x - w * 0.08, h);
    ctx.stroke();
  }

  for (let i = 0; i < 3; i++) {
    const lx = w * (0.25 + i * 0.25);
    const rg = ctx.createRadialGradient(lx, h * 0.06, 0, lx, h * 0.35, h * 0.28);
    rg.addColorStop(0, "rgba(255,255,255,0.18)");
    rg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h * 0.55);
  }
}

function drawLensLab(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#1e1b4b");
  bg.addColorStop(0.35, "#312e81");
  bg.addColorStop(0.65, "#1e293b");
  bg.addColorStop(1, "#0f172a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#334155";
  ctx.fillRect(w * 0.08, h * 0.72, w * 0.84, h * 0.04);
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(w * (0.12 + i * 0.13), h * 0.66, w * 0.025, h * 0.06);
  }

  const cx = w * 0.5;
  const cy = h * 0.42;
  ctx.strokeStyle = "rgba(165,180,252,0.45)";
  ctx.lineWidth = Math.max(2, w * 0.003);
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.08, cy - h * 0.12);
  ctx.quadraticCurveTo(cx - w * 0.02, cy, cx - w * 0.08, cy + h * 0.12);
  ctx.moveTo(cx + w * 0.08, cy - h * 0.12);
  ctx.quadraticCurveTo(cx + w * 0.02, cy, cx + w * 0.08, cy + h * 0.12);
  ctx.stroke();
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = "rgba(251,191,36,0.35)";
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.22, cy);
  ctx.lineTo(cx + w * 0.22, cy);
  ctx.stroke();
  ctx.setLineDash([]);

  const spec = ctx.createLinearGradient(w * 0.15, h * 0.18, w * 0.85, h * 0.18);
  spec.addColorStop(0, "#ef4444");
  spec.addColorStop(0.2, "#f97316");
  spec.addColorStop(0.4, "#eab308");
  spec.addColorStop(0.6, "#22c55e");
  spec.addColorStop(0.8, "#3b82f6");
  spec.addColorStop(1, "#a855f7");
  ctx.fillStyle = spec;
  ctx.fillRect(w * 0.15, h * 0.16, w * 0.7, h * 0.025);

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.45);
  glow.addColorStop(0, "rgba(129,140,248,0.25)");
  glow.addColorStop(1, "rgba(129,140,248,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.font = `${Math.round(h * 0.028)}px sans-serif`;
  ctx.fillStyle = "rgba(199,210,254,0.5)";
  ctx.fillText("1/f = 1/u + 1/v", w * 0.12, h * 0.28);
}

function drawSpace(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#020014";
  ctx.fillRect(0, 0, w, h);

  const nebulae: [number, number, number, string][] = [
    [0.22, 0.35, 0.28, "rgba(88,28,135,0.55)"],
    [0.65, 0.28, 0.32, "rgba(30,58,138,0.5)"],
    [0.48, 0.62, 0.25, "rgba(136,19,55,0.35)"],
    [0.82, 0.55, 0.2, "rgba(67,56,202,0.4)"],
  ];
  for (const [nx, ny, nr, color] of nebulae) {
    const g = ctx.createRadialGradient(nx * w, ny * h, 0, nx * w, ny * h, nr * w);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  for (let i = 0; i < 420; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 1.8 + 0.2;
    const a = 0.2 + Math.random() * 0.75;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fill();
  }

  ctx.save();
  ctx.translate(w * 0.5, h * 0.5);
  ctx.rotate(-0.35);
  const band = ctx.createLinearGradient(-w * 0.5, 0, w * 0.5, 0);
  band.addColorStop(0, "rgba(255,255,255,0)");
  band.addColorStop(0.5, "rgba(226,232,240,0.08)");
  band.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = band;
  ctx.fillRect(-w * 0.55, -h * 0.06, w * 1.1, h * 0.12);
  ctx.restore();
}

function drawElectricLab(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const ceiling = ctx.createLinearGradient(0, 0, 0, h * 0.55);
  ceiling.addColorStop(0, "#0c1220");
  ceiling.addColorStop(0.35, "#141c2e");
  ceiling.addColorStop(1, "#1a2236");
  ctx.fillStyle = ceiling;
  ctx.fillRect(0, 0, w, h * 0.55);

  for (let i = 0; i < 4; i++) {
    const lx = w * (0.18 + i * 0.22);
    const rg = ctx.createRadialGradient(lx, h * 0.04, 0, lx, h * 0.38, h * 0.32);
    rg.addColorStop(0, "rgba(255,214,130,0.22)");
    rg.addColorStop(0.45, "rgba(251,191,36,0.08)");
    rg.addColorStop(1, "rgba(251,191,36,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h * 0.55);
  }

  const cyanGlow = ctx.createRadialGradient(w * 0.78, h * 0.22, 0, w * 0.78, h * 0.22, w * 0.22);
  cyanGlow.addColorStop(0, "rgba(56,189,248,0.12)");
  cyanGlow.addColorStop(1, "rgba(56,189,248,0)");
  ctx.fillStyle = cyanGlow;
  ctx.fillRect(0, 0, w, h * 0.5);

  const wall = ctx.createLinearGradient(0, h * 0.42, 0, h * 0.78);
  wall.addColorStop(0, "#1e293b");
  wall.addColorStop(1, "#111827");
  ctx.fillStyle = wall;
  ctx.fillRect(0, h * 0.42, w, h * 0.36);

  const boardX = w * 0.08;
  const boardY = h * 0.44;
  const boardW = w * 0.38;
  const boardH = h * 0.28;
  ctx.fillStyle = "#0f2a1a";
  ctx.fillRect(boardX, boardY, boardW, boardH);
  ctx.strokeStyle = "rgba(74,222,128,0.35)";
  ctx.lineWidth = Math.max(2, w * 0.002);
  ctx.strokeRect(boardX, boardY, boardW, boardH);

  ctx.strokeStyle = "rgba(187,247,208,0.55)";
  ctx.lineWidth = Math.max(2.5, w * 0.0025);
  const cx = boardX + boardW * 0.18;
  const cy = boardY + boardH * 0.55;
  const bx = boardX + boardW * 0.55;
  const by = boardY + boardH * 0.55;
  const sx = boardX + boardW * 0.78;
  const sy = boardY + boardH * 0.55;
  ctx.beginPath();
  ctx.moveTo(cx - boardW * 0.06, cy);
  ctx.lineTo(bx - boardW * 0.08, by);
  ctx.lineTo(bx + boardW * 0.08, by);
  ctx.lineTo(sx, sy);
  ctx.lineTo(sx, sy + boardH * 0.18);
  ctx.lineTo(cx - boardW * 0.06, cy + boardH * 0.18);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = "rgba(250,204,21,0.85)";
  ctx.beginPath();
  ctx.arc(bx, by, boardH * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(187,247,208,0.45)";
  ctx.beginPath();
  ctx.moveTo(bx - boardW * 0.04, by - boardH * 0.04);
  ctx.lineTo(bx + boardW * 0.04, by + boardH * 0.04);
  ctx.moveTo(bx + boardW * 0.04, by - boardH * 0.04);
  ctx.lineTo(bx - boardW * 0.04, by + boardH * 0.04);
  ctx.stroke();

  ctx.font = `${Math.round(h * 0.028)}px sans-serif`;
  ctx.fillStyle = "rgba(187,247,208,0.5)";
  ctx.fillText("V = IR", boardX + boardW * 0.08, boardY + boardH * 0.22);
  ctx.fillText("Series · Parallel", boardX + boardW * 0.08, boardY + boardH * 0.88);

  const shelfX = w * 0.58;
  const shelfY = h * 0.46;
  ctx.fillStyle = "#334155";
  ctx.fillRect(shelfX, shelfY, w * 0.32, h * 0.025);
  ctx.fillRect(shelfX, shelfY + h * 0.12, w * 0.32, h * 0.025);
  ctx.fillStyle = "#475569";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(shelfX + w * 0.04 + i * w * 0.055, shelfY - h * 0.055, w * 0.018, h * 0.05);
  }
  ctx.fillStyle = "#1e40af";
  ctx.fillRect(shelfX + w * 0.06, shelfY + h * 0.07, w * 0.035, h * 0.055);
  ctx.fillStyle = "#ca8a04";
  ctx.beginPath();
  ctx.arc(shelfX + w * 0.18, shelfY + h * 0.095, h * 0.022, 0, Math.PI * 2);
  ctx.fill();

  const meterX = w * 0.72;
  const meterY = h * 0.48;
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(meterX, meterY, w * 0.18, h * 0.14);
  ctx.strokeStyle = "rgba(148,163,184,0.45)";
  ctx.lineWidth = Math.max(2, w * 0.002);
  ctx.strokeRect(meterX, meterY, w * 0.18, h * 0.14);
  ctx.fillStyle = "rgba(34,197,94,0.35)";
  ctx.fillRect(meterX + w * 0.02, meterY + h * 0.03, w * 0.14, h * 0.055);
  ctx.font = `${Math.round(h * 0.022)}px monospace`;
  ctx.fillStyle = "rgba(74,222,128,0.7)";
  ctx.fillText("3.00 V", meterX + w * 0.035, meterY + h * 0.075);
  ctx.fillStyle = "rgba(148,163,184,0.55)";
  ctx.font = `${Math.round(h * 0.018)}px sans-serif`;
  ctx.fillText("DMM", meterX + w * 0.02, meterY + h * 0.125);

  const bench = ctx.createLinearGradient(0, h * 0.72, 0, h * 0.82);
  bench.addColorStop(0, "#334155");
  bench.addColorStop(1, "#1e293b");
  ctx.fillStyle = bench;
  ctx.fillRect(0, h * 0.72, w, h * 0.1);

  const floor = ctx.createLinearGradient(0, h * 0.8, 0, h);
  floor.addColorStop(0, "#151b28");
  floor.addColorStop(1, "#0a0e16");
  ctx.fillStyle = floor;
  ctx.fillRect(0, h * 0.8, w, h * 0.2);

  ctx.strokeStyle = "rgba(100,116,139,0.12)";
  ctx.lineWidth = 1;
  const gridTop = h * 0.82;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 28; col++) {
      const gx = w * 0.08 + col * (w * 0.032);
      const gy = gridTop + row * (h * 0.028);
      ctx.beginPath();
      ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = "rgba(251,191,36,0.08)";
  ctx.lineWidth = Math.max(1, w * 0.001);
  for (let i = 0; i < 10; i++) {
    const x = (i / 9) * w;
    ctx.beginPath();
    ctx.moveTo(x, h * 0.8);
    ctx.lineTo(x - w * 0.06, h);
    ctx.stroke();
  }
}

function drawFluidLab(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
  sky.addColorStop(0, "#0c4a6e");
  sky.addColorStop(0.5, "#155e75");
  sky.addColorStop(1, "#164e63");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.55);

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.2, 0, w * 0.5, h * 0.2, w * 0.35);
  glow.addColorStop(0, "rgba(125,211,252,0.2)");
  glow.addColorStop(1, "rgba(125,211,252,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h * 0.55);

  const wall = ctx.createLinearGradient(0, h * 0.45, 0, h * 0.78);
  wall.addColorStop(0, "#1e3a5f");
  wall.addColorStop(1, "#0f172a");
  ctx.fillStyle = wall;
  ctx.fillRect(0, h * 0.45, w, h * 0.33);

  ctx.fillStyle = "#0c4a6e";
  ctx.fillRect(w * 0.1, h * 0.48, w * 0.35, h * 0.22);
  ctx.strokeStyle = "rgba(125,211,252,0.4)";
  ctx.lineWidth = Math.max(2, w * 0.002);
  ctx.strokeRect(w * 0.1, h * 0.48, w * 0.35, h * 0.22);
  ctx.font = `${Math.round(h * 0.032)}px sans-serif`;
  ctx.fillStyle = "rgba(186,230,253,0.55)";
  ctx.fillText("P = ρgh", w * 0.14, h * 0.58);
  ctx.fillText("v = √(2gh)", w * 0.14, h * 0.64);

  for (let i = 0; i < 8; i++) {
    const tx = w * 0.62 + (i % 4) * w * 0.07;
    const ty = h * 0.52 + Math.floor(i / 4) * h * 0.12;
    ctx.beginPath();
    ctx.ellipse(tx, ty, w * 0.018, h * 0.028, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(56,189,248,0.35)";
    ctx.fill();
  }

  const floor = ctx.createLinearGradient(0, h * 0.78, 0, h);
  floor.addColorStop(0, "#1e293b");
  floor.addColorStop(1, "#0f172a");
  ctx.fillStyle = floor;
  ctx.fillRect(0, h * 0.78, w, h * 0.22);

  ctx.strokeStyle = "rgba(100,116,139,0.15)";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 20; col++) {
      const fx = col * (w / 20);
      const fy = h * 0.78 + row * (h * 0.025);
      ctx.strokeRect(fx, fy, w / 20, h * 0.025);
    }
  }
}

function buildSceneImageTexture(preset: LabBackgroundPreset): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  if (preset === "optics-lab") drawOpticsLab(ctx, canvas.width, canvas.height);
  else if (preset === "lens-lab") drawLensLab(ctx, canvas.width, canvas.height);
  else if (preset === "electric-lab") drawElectricLab(ctx, canvas.width, canvas.height);
  else if (preset === "fluid-lab") drawFluidLab(ctx, canvas.width, canvas.height);
  else drawSpace(ctx, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function BackdropDome({ texture }: { texture: THREE.Texture }) {
  return (
    <mesh renderOrder={-1000} frustumCulled={false}>
      <sphereGeometry args={[55, 48, 24]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function BackdropWall({ texture }: { texture: THREE.Texture }) {
  return (
    <mesh position={[0, 1.5, -14]} renderOrder={-999} frustumCulled={false}>
      <planeGeometry args={[34, 18]} />
      <meshBasicMaterial map={texture} depthWrite={false} fog={false} toneMapped={false} />
    </mesh>
  );
}

export function LabSceneBackground({ preset = "optics-lab" }: { preset?: LabBackgroundPreset }) {
  const { scene } = useThree();
  const meta = PRESET_META[preset];

  const texture = useMemo(() => buildSceneImageTexture(preset), [preset]);
  const textureRef = useRef(texture);
  textureRef.current = texture;

  useEffect(() => {
    scene.background = texture;
    return () => {
      if (scene.background === texture) scene.background = null;
    };
  }, [scene, texture]);

  useEffect(
    () => () => {
      textureRef.current.dispose();
    },
    [],
  );

  return (
    <>
      {meta.dome && <BackdropDome texture={texture} />}
      {meta.wall && <BackdropWall texture={texture} />}
    </>
  );
}

export function fogColorForPreset(preset: LabBackgroundPreset): string {
  return PRESET_META[preset].fog;
}
