"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { ARButton, VRButton } from "three-stdlib";

interface WebXRButtonProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  mode: "ar" | "vr" | "both";
}

const BTN_BASE =
  "shrink-0 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-lg transition-colors border";

const TOOLBAR_CLASS =
  "absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-[calc(100%-1.5rem)] pb-[max(0px,env(safe-area-inset-bottom))] pointer-events-none";

function styleButton(el: HTMLButtonElement, classes: string) {
  el.className = `${BTN_BASE} pointer-events-auto ${classes}`;
  el.style.position = "static";
  el.style.margin = "0";
  el.style.inset = "auto";
}

async function checkXrSupport(mode: WebXRButtonProps["mode"]) {
  if (typeof navigator === "undefined" || !navigator.xr) {
    return { ar: false, vr: false };
  }

  const wantAr = mode === "ar" || mode === "both";
  const wantVr = mode === "vr" || mode === "both";

  const [ar, vr] = await Promise.all([
    wantAr
      ? navigator.xr.isSessionSupported("immersive-ar").catch(() => false)
      : Promise.resolve(false),
    wantVr
      ? navigator.xr.isSessionSupported("immersive-vr").catch(() => false)
      : Promise.resolve(false),
  ]);

  return { ar, vr };
}

export function WebXRButton({ containerRef, mode }: WebXRButtonProps) {
  const { gl } = useThree();

  useEffect(() => {
    gl.xr.enabled = true;
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let toolbar: HTMLDivElement | null = null;

    (async () => {
      const { ar: arSupported, vr: vrSupported } = await checkXrSupport(mode);
      if (cancelled || (!arSupported && !vrSupported)) return;

      toolbar = document.createElement("div");
      toolbar.className = TOOLBAR_CLASS;
      container.appendChild(toolbar);

      if (arSupported) {
        const arBtn = ARButton.createButton(gl, {
          requiredFeatures: ["hit-test"],
          optionalFeatures: ["dom-overlay"],
          domOverlay: { root: container },
        }) as HTMLButtonElement;
        styleButton(arBtn, "bg-emerald-600 hover:bg-emerald-500 border-emerald-400/40");
        arBtn.textContent = "Enter AR";
        toolbar.appendChild(arBtn);
      }

      if (vrSupported) {
        const vrBtn = VRButton.createButton(gl, {
          optionalFeatures: ["local-floor", "bounded-floor"],
        }) as HTMLButtonElement;
        styleButton(vrBtn, "bg-cyan-600 hover:bg-cyan-500 border-cyan-400/40");
        vrBtn.textContent = "Enter VR";
        toolbar.appendChild(vrBtn);
      }

      if (toolbar.childElementCount === 0) {
        toolbar.remove();
        toolbar = null;
      }
    })();

    return () => {
      cancelled = true;
      toolbar?.remove();
    };
  }, [gl, containerRef, mode]);

  return null;
}
