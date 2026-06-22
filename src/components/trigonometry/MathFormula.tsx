"use client";

import { useEffect, useRef, useId } from "react";

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      startup?: { promise?: Promise<void>; typeset?: boolean };
      tex?: { inlineMath: string[][]; displayMath: string[][] };
    };
  }
}

let loadPromise: Promise<void> | null = null;

function loadMathJax(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.MathJax?.typesetPromise) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (!window.MathJax) {
      window.MathJax = {
        tex: {
          inlineMath: [
            ["\\(", "\\)"],
            ["$", "$"],
          ],
          displayMath: [
            ["\\[", "\\]"],
            ["$$", "$$"],
          ],
        },
        startup: { typeset: false },
      };
    }
    const existing = document.querySelector('script[data-mathjax="true"]');
    if (existing) {
      window.MathJax?.startup?.promise?.then(() => resolve()).catch(reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
    script.async = true;
    script.dataset.mathjax = "true";
    script.onload = () => {
      window.MathJax?.startup?.promise?.then(() => resolve()).catch(reject);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return loadPromise;
}

interface MathFormulaProps {
  children: string;
  display?: boolean;
  className?: string;
}

export default function MathFormula({ children, display = false, className = "" }: MathFormulaProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    let cancelled = false;
    loadMathJax()
      .then(() => {
        if (cancelled || !ref.current) return;
        ref.current.innerHTML = display ? `\\[${children}\\]` : `\\(${children}\\)`;
        return window.MathJax?.typesetPromise?.([ref.current]);
      })
      .catch(() => {
        if (ref.current) ref.current.textContent = children;
      });
    return () => {
      cancelled = true;
    };
  }, [children, display, id]);

  return (
    <span
      ref={ref}
      className={`math-formula text-slate-100 ${display ? "block my-2 text-center" : "inline"} ${className}`}
    />
  );
}

export function MathBlock({ children, className = "" }: { children: string; className?: string }) {
  return <MathFormula display className={className}>{children}</MathFormula>;
}
