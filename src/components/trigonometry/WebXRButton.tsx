"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { ARButton, VRButton } from "three-stdlib";

interface WebXRButtonProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  mode: "ar" | "vr" | "both";
}

export function WebXRButton({ containerRef, mode }: WebXRButtonProps) {
  const { gl } = useThree();

  useEffect(() => {
    gl.xr.enabled = true;
    const container = containerRef.current;
    if (!container) return;

    const buttons: HTMLElement[] = [];

    if (mode === "ar" || mode === "both") {
      const arBtn = ARButton.createButton(gl, {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay"],
        domOverlay: { root: container },
      }) as HTMLButtonElement;
      arBtn.className =
        "absolute bottom-4 left-4 z-40 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold border border-emerald-400/40 shadow-lg transition-colors";
      arBtn.textContent = "Enter AR";
      container.appendChild(arBtn);
      buttons.push(arBtn);
    }

    if (mode === "vr" || mode === "both") {
      const vrBtn = VRButton.createButton(gl, {
        optionalFeatures: ["local-floor", "bounded-floor"],
      }) as HTMLButtonElement;
      vrBtn.className =
        "absolute bottom-4 right-4 z-40 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold border border-cyan-400/40 shadow-lg transition-colors";
      vrBtn.textContent = "Enter VR";
      container.appendChild(vrBtn);
      buttons.push(vrBtn);
    }

    return () => {
      buttons.forEach((b) => b.remove());
    };
  }, [gl, containerRef, mode]);

  return null;
}
