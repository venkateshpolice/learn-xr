"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { TrigModuleDef } from "@/data/trigonometry-modules";

interface TrigModuleShellProps {
  module: TrigModuleDef;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
}

export default function TrigModuleShell({
  module,
  sidebar,
  children,
  headerExtra,
}: TrigModuleShellProps) {
  const Icon = module.icon;

  return (
    <div className="h-screen bg-[#070714] text-white flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-white/10 bg-[#0c0c1a]/95 backdrop-blur-md z-30">
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/trigonometry"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Trig Lab</span>
            </Link>
            <div className="h-5 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${module.gradient} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm sm:text-base truncate">{module.title}</h1>
                <p className="text-xs text-slate-400 truncate hidden sm:block">{module.subtitle}</p>
              </div>
            </div>
          </div>
          {headerExtra && <div className="flex items-center gap-2 shrink-0">{headerExtra}</div>}
        </div>
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 relative min-h-0 min-w-0">{children}</div>
        <aside className="w-full max-w-[320px] shrink-0 border-l border-white/10 bg-[#0c0c1a]/95 overflow-y-auto overscroll-y-contain hidden md:block">
          <div className="p-4 space-y-5">{sidebar}</div>
        </aside>
      </div>

      <div className="md:hidden shrink-0 border-t border-white/10 bg-[#0c0c1a]/95 max-h-[38vh] overflow-y-auto p-4">
        {sidebar}
      </div>
    </div>
  );
}

export function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</p>
      {children}
    </section>
  );
}

export function StatRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-sm font-mono font-semibold ${accent ?? "text-violet-300"}`}>{value}</span>
    </div>
  );
}

export function TrigSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="font-mono text-fuchsia-300">
          {Number.isInteger(step) && step >= 1 ? Math.round(value) : value.toFixed(2)}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-fuchsia-500 cursor-pointer"
      />
    </div>
  );
}
