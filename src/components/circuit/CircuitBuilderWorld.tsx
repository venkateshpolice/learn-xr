"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  type PlacedPart,
  type WireLink,
  type TerminalId,
  type PartType,
  type BuilderSimResult,
  snapGrid,
  gridToWorld,
  terminalWorldPos,
  partTerminals,
  isGridOccupied,
  BOARD,
} from "@/lib/circuitBuilder";
import { clientToGrid } from "@/lib/boardRaycast";
import {
  OnBoardPart,
  TerminalPin,
} from "@/components/circuit/CircuitParts";
import { RealisticBreadboard } from "@/components/circuit/RealisticBreadboard";
import { ConductorWire } from "@/components/circuit/ConductorWire";
import { StableLine } from "@/components/three/StableLine";

const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -BOARD.surfaceY);
const _hit = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();

function DropPreviewPart({ type, gridX, gridZ, valid }: { type: PartType; gridX: number; gridZ: number; valid: boolean }) {
  const pos = gridToWorld(gridX, gridZ);
  return (
    <group position={pos}>
      <mesh position={[0, 0.5, 0]}>
        <ringGeometry args={[0.5, 0.58, 32]} />
        <meshBasicMaterial color={valid ? "#22d3ee" : "#ef4444"} transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <group scale={0.92}>
        <OnBoardPart type={type} brightness={0} />
      </group>
    </group>
  );
}

function PaletteDropHandler({
  paletteDragType,
  parts,
  dropPreview,
  onPreviewChange,
  onDrop,
  onDragEnd,
}: {
  paletteDragType: PartType | null;
  parts: PlacedPart[];
  dropPreview: { gridX: number; gridZ: number } | null;
  onPreviewChange: (preview: { gridX: number; gridZ: number } | null) => void;
  onDrop: (type: PartType, gridX: number, gridZ: number) => void;
  onDragEnd: () => void;
}) {
  const { camera, gl } = useThree();

  useEffect(() => {
    if (!paletteDragType) {
      onPreviewChange(null);
      return;
    }
    const canvas = gl.domElement;
    document.body.style.cursor = "grabbing";

    const onMove = (e: PointerEvent) => {
      const grid = clientToGrid(e.clientX, e.clientY, canvas, camera);
      onPreviewChange(grid);
    };

    const onUp = (e: PointerEvent) => {
      const grid = clientToGrid(e.clientX, e.clientY, canvas, camera);
      if (grid && !isGridOccupied(parts, grid.gridX, grid.gridZ)) {
        onDrop(paletteDragType, grid.gridX, grid.gridZ);
      }
      onPreviewChange(null);
      onDragEnd();
      document.body.style.cursor = "";
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.cursor = "";
    };
  }, [paletteDragType, camera, gl, parts, onPreviewChange, onDrop, onDragEnd]);

  if (!paletteDragType || !dropPreview) return null;
  const valid = !isGridOccupied(parts, dropPreview.gridX, dropPreview.gridZ);
  return <DropPreviewPart type={paletteDragType} gridX={dropPreview.gridX} gridZ={dropPreview.gridZ} valid={valid} />;
}

function WirePreviewLine({
  pendingTerminal,
  parts,
}: {
  pendingTerminal: { partId: string; terminal: TerminalId } | null;
  parts: PlacedPart[];
}) {
  const { camera, gl } = useThree();
  const [cursor, setCursor] = useState<[number, number, number] | null>(null);

  useEffect(() => {
    if (!pendingTerminal) {
      setCursor(null);
      return;
    }
    const canvas = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const grid = clientToGrid(e.clientX, e.clientY, canvas, camera);
      setCursor(grid ? [grid.gridX, BOARD.surfaceY + 0.2, grid.gridZ] : null);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [pendingTerminal, camera, gl]);

  if (!pendingTerminal || !cursor) return null;
  const part = parts.find((p) => p.id === pendingTerminal.partId);
  if (!part) return null;
  const from = terminalWorldPos(part, pendingTerminal.terminal);
  return <StableLine points={[from, cursor]} color="#38bdf8" opacity={0.65} />;
}

function DraggablePart({
  part,
  brightness,
  wireMode,
  pendingTerminal,
  simLive,
  onDrag,
  onTerminalClick,
  onToggleSwitch,
  selected,
  onSelect,
}: {
  part: PlacedPart;
  brightness: number;
  wireMode: boolean;
  pendingTerminal: { partId: string; terminal: TerminalId } | null;
  simLive: boolean;
  selected: boolean;
  onDrag: (id: string, gridX: number, gridZ: number) => void;
  onTerminalClick: (partId: string, terminal: TerminalId) => void;
  onToggleSwitch: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const { camera, gl } = useThree();
  const dragging = useRef(false);
  const pos = gridToWorld(part.gridX, part.gridZ);

  const pointerToGrid = useCallback(
    (clientX: number, clientY: number) => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      _raycaster.setFromCamera(ndc, camera);
      _raycaster.ray.intersectPlane(_plane, _hit);
      return snapGrid(_hit.x, _hit.z);
    },
    [camera, gl],
  );

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (wireMode) return;
    e.stopPropagation();
    onSelect(part.id);
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return;
    e.stopPropagation();
    const { gridX, gridZ } = pointerToGrid(e.clientX, e.clientY);
    onDrag(part.id, gridX, gridZ);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const terminals = partTerminals(part.type);

  return (
    <group
      position={pos}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {selected && (
        <mesh position={[0, 0.38, 0]}>
          <ringGeometry args={[0.38, 0.44, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} toneMapped={false} />
        </mesh>
      )}
      <OnBoardPart
        type={part.type}
        brightness={brightness}
        switchClosed={part.switchClosed}
        onToggleSwitch={() => onToggleSwitch(part.id)}
      />

      {terminals.map((t) => {
        const tp = terminalWorldPos(part, t);
        const local: [number, number, number] = [tp[0] - pos[0], tp[1] - pos[1], tp[2] - pos[2]];
        const selected = pendingTerminal?.partId === part.id && pendingTerminal.terminal === t;
        return (
          <TerminalPin
            key={t}
            position={local}
            active={wireMode || simLive}
            selected={selected}
            onClick={() => onTerminalClick(part.id, t)}
            size={0.045}
          />
        );
      })}
    </group>
  );
}

export function CircuitBuilderWorld({
  parts,
  wires,
  sim,
  wireMode,
  pendingTerminal,
  paletteDragType,
  dropPreview,
  onDropPreviewChange,
  onPaletteDrop,
  onPaletteDragEnd,
  onPartsChange,
  onWiresChange,
  onPendingTerminal,
  selectedPartId,
  onSelectPart,
}: {
  parts: PlacedPart[];
  wires: WireLink[];
  sim: BuilderSimResult;
  wireMode: boolean;
  pendingTerminal: { partId: string; terminal: TerminalId } | null;
  paletteDragType: PartType | null;
  dropPreview: { gridX: number; gridZ: number } | null;
  onDropPreviewChange: (preview: { gridX: number; gridZ: number } | null) => void;
  onPaletteDrop: (type: PartType, gridX: number, gridZ: number) => void;
  onPaletteDragEnd: () => void;
  selectedPartId: string | null;
  onPartsChange: (parts: PlacedPart[]) => void;
  onWiresChange: (wires: WireLink[]) => void;
  onPendingTerminal: (t: { partId: string; terminal: TerminalId } | null) => void;
  onSelectPart: (id: string | null) => void;
}) {
  const handleDrag = useCallback(
    (id: string, gridX: number, gridZ: number) => {
      onPartsChange(parts.map((p) => (p.id === id ? { ...p, gridX, gridZ } : p)));
    },
    [parts, onPartsChange],
  );

  const handleTerminal = useCallback(
    (partId: string, terminal: TerminalId) => {
      if (!wireMode) return;
      if (!pendingTerminal) {
        onPendingTerminal({ partId, terminal });
        return;
      }
      if (pendingTerminal.partId === partId && pendingTerminal.terminal === terminal) {
        onPendingTerminal(null);
        return;
      }
      const exists = wires.some(
        (w) =>
          (w.fromPart === pendingTerminal.partId &&
            w.fromTerminal === pendingTerminal.terminal &&
            w.toPart === partId &&
            w.toTerminal === terminal) ||
          (w.fromPart === partId &&
            w.fromTerminal === terminal &&
            w.toPart === pendingTerminal.partId &&
            w.toTerminal === pendingTerminal.terminal),
      );
      if (!exists) {
        onWiresChange([
          ...wires,
          {
            id: `w-${Date.now()}`,
            fromPart: pendingTerminal.partId,
            fromTerminal: pendingTerminal.terminal,
            toPart: partId,
            toTerminal: terminal,
          },
        ]);
      }
      onPendingTerminal(null);
    },
    [wireMode, pendingTerminal, wires, onWiresChange, onPendingTerminal],
  );

  const handleToggleSwitch = useCallback(
    (id: string) => {
      onPartsChange(
        parts.map((p) => (p.id === id && p.type === "switch" ? { ...p, switchClosed: !p.switchClosed } : p)),
      );
    },
    [parts, onPartsChange],
  );

  const wireSegments = useMemo(() => {
    return wires
      .map((w) => {
        const a = parts.find((p) => p.id === w.fromPart);
        const b = parts.find((p) => p.id === w.toPart);
        if (!a || !b) return null;
        return {
          id: w.id,
          from: terminalWorldPos(a, w.fromTerminal),
          to: terminalWorldPos(b, w.toTerminal),
          live: sim.wireLive[w.id] ?? sim.electronsFlow,
        };
      })
      .filter(Boolean) as {
      id: string;
      from: [number, number, number];
      to: [number, number, number];
      live: boolean;
    }[];
  }, [wires, parts, sim]);

  return (
    <group>
      <RealisticBreadboard />
      <PaletteDropHandler
        paletteDragType={paletteDragType}
        parts={parts}
        dropPreview={dropPreview}
        onPreviewChange={onDropPreviewChange}
        onDrop={onPaletteDrop}
        onDragEnd={onPaletteDragEnd}
      />
      {wireMode && pendingTerminal && <WirePreviewLine pendingTerminal={pendingTerminal} parts={parts} />}
      {wireSegments.map((w) => (
        <ConductorWire key={w.id} from={w.from} to={w.to} live={w.live} />
      ))}
      {parts.map((part) => (
        <DraggablePart
          key={part.id}
          part={part}
          brightness={sim.bulbBrightness[part.id] ?? 0}
          wireMode={wireMode}
          pendingTerminal={pendingTerminal}
          simLive={sim.electronsFlow}
          selected={selectedPartId === part.id}
          onDrag={handleDrag}
          onTerminalClick={handleTerminal}
          onToggleSwitch={handleToggleSwitch}
          onSelect={onSelectPart}
        />
      ))}
    </group>
  );
}
