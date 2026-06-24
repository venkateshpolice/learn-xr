"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { LABS } from "@/data/labs-data";
import { siteImages } from "@/data/site-images";

export default function LabsPage() {
  const totalExperiments = LABS.reduce((sum, lab) => sum + lab.experiments.length, 0);
  const liveCount = LABS.reduce(
    (sum, lab) => sum + lab.experiments.filter((e) => e.status === "available").length,
    0,
  );

  return (
    <div className="min-h-screen w-full text-white relative overflow-hidden bg-[#060a14]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 pt-6 px-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all mb-8">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 mb-4">
              <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
              Virtual Laboratories
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">Science & Math</span>{" "}
              <span className="text-white">Labs</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Step into our virtual laboratories. Conduct experiments, visualize concepts, and learn by doing — all in immersive 3D environments.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative group w-full mb-12 sm:mb-16"
          >
            <div className="absolute -inset-1 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-cyan-500/25 via-indigo-500/15 to-emerald-500/25 blur-md opacity-60 pointer-events-none" />
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
                  priority
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
        </div>
      </div>

      <div className="relative z-10 px-6 pb-20">
        <div className="max-w-6xl mx-auto space-y-8">
          {LABS.map((lab, idx) => {
            const availableCount = lab.experiments.filter((e) => e.status === "available").length;
            return (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className={`relative rounded-3xl border ${lab.borderColor} ${lab.bgGlow} backdrop-blur-sm overflow-hidden group`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${lab.gradient}`} />

                <div className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lab.gradient} flex items-center justify-center shadow-lg`}>
                          <lab.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">{lab.title}</h2>
                          <p className="text-sm text-slate-400">{lab.subtitle}</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-4 max-w-lg">{lab.description}</p>
                      <p className="text-xs text-slate-500 mb-6">
                        {availableCount} experiment{availableCount !== 1 ? "s" : ""} ready · {lab.experiments.length} total
                      </p>
                      <Link
                        href={`/labs/${lab.id}`}
                        className={`inline-flex px-6 py-3 rounded-xl bg-gradient-to-r ${lab.gradient} text-white font-semibold text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]`}
                      >
                        Enter Lab →
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:min-w-[320px]">
                      {lab.experiments.slice(0, 4).map((exp) => {
                        const card = (
                          <div className={`bg-white/5 rounded-xl p-3 border border-white/5 transition-all ${exp.status === "available" ? "hover:bg-white/10 hover:border-emerald-500/30 cursor-pointer" : "hover:bg-white/10 hover:border-white/15"}`}>
                            <exp.icon className="w-5 h-5 text-slate-400 mb-2" />
                            <h4 className="text-xs font-semibold text-white mb-0.5">{exp.name}</h4>
                            <p className="text-[10px] text-slate-500 leading-tight">{exp.desc}</p>
                            {exp.status === "available" && (
                              <span className="inline-block mt-1.5 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Live</span>
                            )}
                          </div>
                        );
                        return exp.link ? (
                          <Link key={exp.id} href={exp.link}>{card}</Link>
                        ) : (
                          <div key={exp.id}>{card}</div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="max-w-6xl mx-auto mt-16 text-center">
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-2 text-white">More Labs Coming Soon</h3>
            <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">Computer Science coding lab and Environmental Science lab are currently in development.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {["💻 CS", "🌍 Environment"].map((l) => (
                <span key={l} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400">{l}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
