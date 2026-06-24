"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FlaskConical } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { siteImages } from "@/data/site-images";
import { LABS } from "@/data/labs-data";

export default function Labs() {
  const contentRef = useRef(null);
  const inView = useInView(contentRef, { once: true, margin: "-60px" });

  const totalExperiments = LABS.reduce((sum, lab) => sum + lab.experiments.length, 0);
  const liveCount = LABS.reduce(
    (sum, lab) => sum + lab.experiments.filter((e) => e.status === "available").length,
    0,
  );

  return (
    <section id="labs" className="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="STEM Labs"
          eyebrowColor="text-cyan-400"
          title={<>Virtual <span className="gradient-text">Science & Math Labs</span></>}
          description="Conduct experiments, visualize concepts, and learn by doing — physics, chemistry, biology, and math in immersive 3D."
        />

        <div ref={contentRef} className="space-y-10 sm:space-y-12 lg:space-y-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative group w-full"
          >
            <div className="absolute -inset-1 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-cyan-500/25 via-indigo-500/15 to-emerald-500/25 blur-md opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none" />
            <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-slate-950/80">
              <div
                className="absolute inset-0 opacity-[0.3]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.1) 1px, transparent 0)",
                  backgroundSize: "28px 28px",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10 pointer-events-none" />
              <div className="relative w-full flex items-center justify-center p-3 sm:p-5 lg:p-6">
                <Image
                  src={siteImages.stemLabsInteractive}
                  alt="Students exploring interactive STEM labs in 3D with virtual experiments"
                  width={1400}
                  height={900}
                  sizes="100vw"
                  className="relative z-[1] w-full h-auto object-contain"
                />
              </div>
              <div className="relative z-20 border-t border-white/[0.06] px-4 sm:px-6 py-3 sm:py-4 bg-slate-950/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs sm:text-sm font-semibold text-white">Interactive STEM Environment</span>
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  {liveCount} live · {totalExperiments} total
                </span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
            {LABS.map((lab, i) => {
              const available = lab.experiments.filter((e) => e.status === "available").length;
              return (
                <motion.div
                  key={lab.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                >
                  <Link
                    href={`/labs/${lab.id}`}
                    className="group flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 h-full"
                  >
                    <div
                      className={`shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${lab.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}
                    >
                      <lab.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-white">{lab.title}</h3>
                          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{lab.subtitle}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 shrink-0 transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-2 line-clamp-2">
                        {lab.description}
                      </p>
                      <p className="text-[10px] sm:text-xs text-cyan-400/80 mt-2 font-medium">
                        {available} experiment{available !== 1 ? "s" : ""} ready
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              href="/labs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-sm sm:text-base font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Browse All Labs
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
