"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronRight, FlaskConical, Lock } from "lucide-react";
import { getLabById } from "@/data/labs-data";

export default function LabDetailPage() {
  const params = useParams();
  const labId = params.labId as string;
  const lab = getLabById(labId);

  if (!lab) {
    return (
      <div className="min-h-screen bg-[#060a14] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Lab not found</h1>
          <Link href="/labs" className="text-cyan-400 hover:text-cyan-300 text-sm">
            ← Back to Labs
          </Link>
        </div>
      </div>
    );
  }

  const available = lab.experiments.filter((e) => e.status === "available");
  const upcoming = lab.experiments.filter((e) => e.status === "coming-soon");

  return (
    <div className="min-h-screen w-full text-white relative overflow-hidden bg-[#060a14]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] ${lab.bgGlow} rounded-full blur-3xl opacity-60`} />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 pt-6 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <Link href="/labs" className="inline-flex items-center gap-1.5 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all mb-8">
            <ArrowLeft className="w-3.5 h-3.5" /> All Labs
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${lab.gradient} flex items-center justify-center shadow-lg`}>
                <lab.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{lab.title}</h1>
                <p className="text-slate-400">{lab.subtitle}</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">{lab.description}</p>
            <div className="flex items-center gap-3 mt-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
                {available.length} Available
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs">
                {upcoming.length} Coming Soon
              </span>
            </div>
          </motion.div>

          {/* Available experiments */}
          {available.length > 0 && (
            <section className="mb-12">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-400" />
                Available Experiments
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {available.map((exp, idx) => (
                  <motion.div key={exp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
                    <Link href={exp.link!} className="block group">
                      <div className={`relative rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] hover:border-white/20 transition-all overflow-hidden`}>
                        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${exp.gradient || lab.gradient}`} />
                        <div className="flex items-start gap-4">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${exp.gradient || lab.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                            <exp.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white mb-1 group-hover:text-cyan-200 transition-colors">{exp.name}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">{exp.desc}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Coming soon */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Coming Soon
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcoming.map((exp, idx) => (
                  <motion.div key={exp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + idx * 0.05 }} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 opacity-70">
                    <exp.icon className="w-5 h-5 text-slate-600 mb-2" />
                    <h3 className="text-sm font-semibold text-slate-500 mb-0.5">{exp.name}</h3>
                    <p className="text-[10px] text-slate-600 leading-tight">{exp.desc}</p>
                    <span className="inline-block mt-2 text-[9px] px-2 py-0.5 rounded bg-white/5 text-slate-600">Coming Soon</span>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
