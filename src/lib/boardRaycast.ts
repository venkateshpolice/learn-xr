import * as THREE from "three";
import { BOARD, snapGrid } from "@/lib/circuitBuilder";

const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -BOARD.surfaceY);
const _hit = new THREE.Vector3();
const _ndc = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

export function clientToGrid(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  camera: THREE.Camera,
): { gridX: number; gridZ: number } | null {
  const rect = canvas.getBoundingClientRect();
  if (
    clientX < rect.left ||
    clientX > rect.right ||
    clientY < rect.top ||
    clientY > rect.bottom
  ) {
    return null;
  }
  _ndc.set(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1,
  );
  _raycaster.setFromCamera(_ndc, camera);
  if (!_raycaster.ray.intersectPlane(_plane, _hit)) return null;
  return snapGrid(_hit.x, _hit.z);
}
