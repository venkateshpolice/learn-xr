"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import * as THREE from "three";

export function CircuitBloom({
  strength = 0.95,
  threshold = 0.82,
}: {
  strength?: number;
  threshold?: number;
}) {
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomRef = useRef<UnrealBloomPass | null>(null);
  const { gl, scene, camera, size } = useThree();

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    const renderPass = new RenderPass(scene, camera);
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      strength,
      0.4,
      threshold,
    );
    composer.addPass(renderPass);
    composer.addPass(bloom);
    composerRef.current = composer;
    bloomRef.current = bloom;
    return () => {
      renderPass.dispose();
      bloom.dispose();
      composer.dispose();
      composerRef.current = null;
      bloomRef.current = null;
    };
  }, [gl, scene, camera, strength, threshold]);

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height);
    bloomRef.current?.setSize(size.width, size.height);
  }, [size.width, size.height]);

  useFrame(() => {
    composerRef.current?.render();
  }, 1);

  return null;
}

export const CIRCUIT_GL = {
  antialias: false,
  powerPreference: "default" as const,
  stencil: false,
  alpha: false,
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1.05,
};
