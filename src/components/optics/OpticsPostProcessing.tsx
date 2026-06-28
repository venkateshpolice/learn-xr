"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import * as THREE from "three";

interface OpticsPostProcessingProps {
  strength?: number;
  threshold?: number;
}

/** Bloom post-process — use sparingly; doubles GPU framebuffer cost. */
export function OpticsPostProcessing({
  strength = 0.75,
  threshold = 0.9,
}: OpticsPostProcessingProps) {
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
      0.35,
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

export const OPTICS_GL = {
  antialias: false,
  powerPreference: "default" as const,
  stencil: false,
  alpha: false,
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1.1,
};

export const LIGHT_GL = {
  antialias: false,
  powerPreference: "default" as const,
  stencil: false,
  alpha: false,
  toneMapping: THREE.NoToneMapping,
};
