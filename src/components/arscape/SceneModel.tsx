"use client";

import { useEffect, useState } from "react";
import { useGLTF, TransformControls } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import type { Group } from "three";
import type { ARScapeObject } from "@/types/arscape";

interface SceneModelProps {
  object: ARScapeObject;
  selected: boolean;
  transformMode: "translate" | "rotate" | "scale";
  onSelect: (id: string) => void;
  onTransformChange: (id: string, patch: Partial<ARScapeObject>) => void;
}

export default function SceneModel({
  object,
  selected,
  transformMode,
  onSelect,
  onTransformChange,
}: SceneModelProps) {
  const [group, setGroup] = useState<Group | null>(null);
  const { scene } = useGLTF(object.modelUrl);

  useEffect(() => {
    if (group) {
      group.position.set(...object.position);
      group.rotation.set(...object.rotation);
      group.scale.set(...object.scale);
    }
  }, [object.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <group
        ref={setGroup}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(object.id);
        }}
      >
        <primitive object={scene.clone()} />
      </group>
      {selected && group && (
        <TransformControls
          key={`${object.id}-${transformMode}`}
          object={group}
          mode={transformMode}
          onMouseUp={() => {
            onTransformChange(object.id, {
              position: [group.position.x, group.position.y, group.position.z],
              rotation: [group.rotation.x, group.rotation.y, group.rotation.z],
              scale: [group.scale.x, group.scale.y, group.scale.z],
            });
          }}
        />
      )}
    </>
  );
}
