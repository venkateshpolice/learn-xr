"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

export type Point3 = readonly [number, number, number];

interface StableLineProps {
  points: Point3[];
  color: string;
  opacity?: number;
}

/** Lightweight THREE.Line — avoids drei Line GPU buffer leaks. */
export function StableLine({ points, color, opacity = 1 }: StableLineProps) {
  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color,
        transparent: opacity < 1,
        opacity,
        toneMapped: false,
      }),
    [color, opacity],
  );
  const line = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);

  useEffect(() => {
    const arr = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      arr[i * 3] = points[i][0];
      arr[i * 3 + 1] = points[i][1];
      arr[i * 3 + 2] = points[i][2];
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    geometry.computeBoundingSphere();
  }, [points, geometry]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <primitive object={line} />;
}

export function segment(sx: number, sy: number, sz: number, ex: number, ey: number, ez: number): Point3[] {
  return [
    [sx, sy, sz],
    [ex, ey, ez],
  ];
}
