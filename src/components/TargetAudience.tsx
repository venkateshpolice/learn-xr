"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Baby,
  BookOpen,
  GraduationCap,
  School,
  Building2,
  Home,
  Users,
  Layers,
} from "lucide-react";

const students = [
  { icon: Baby, label: "Nursery", age: "3-5 years", color: "from-pink-500 to-rose-500" },
  { icon: Baby, label: "Kindergarten", age: "5-6 years", color: "from-amber-500 to-orange-500" },
  { icon: BookOpen, label: "Primary School", age: "6-10 years", color: "from-emerald-500 to-green-500" },
  { icon: Layers, label: "Middle School", age: "11-13 years", color: "from-cyan-500 to-blue-500" },
  { icon: GraduationCap, label: "High School", age: "14-18 years", color: "from-indigo-500 to-violet-500" },
];

const institutions = [
  { icon: School, label: "Schools", desc: "K-12 curriculum integration" },
  { icon: Building2, label: "Coaching Centers", desc: "Competitive exam prep" },
  { icon: GraduationCap, label: "Colleges", desc: "Higher education labs" },
  { icon: Home, label: "Homeschool Programs", desc: "Self-paced learning at home" },
];

export default function TargetAudience() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section id="audience" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
            Who Is It For
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Built for Every{" "}
            <span className="gradient-text">Learner & Institution</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            From nursery toddlers to college students, and from schools to
            coaching centers — immersive learning for everyone.
          </p>
        </motion.div>

        {/* Students */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-400" />
            Students
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {students.map((item, index) => {
              const CardWrapper = () => {
                const ref = useRef(null);
                const isInView = useInView(ref, { once: true, margin: "-50px" });
                return (
                  <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass-card rounded-2xl p-6 text-center hover:bg-white/[0.08] transition-all duration-300 hover:scale-105"
                  >
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4`}
                    >
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-white mb-1">{item.label}</h4>
                    <p className="text-xs text-slate-400">{item.age}</p>
                  </motion.div>
                );
              };
              return <CardWrapper key={item.label} />;
            })}
          </div>
        </div>

        {/* Institutions */}
        <div>
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Building2 className="w-6 h-6 text-cyan-400" />
            Institutions
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {institutions.map((item, index) => {
              const CardWrapper = () => {
                const ref = useRef(null);
                const isInView = useInView(ref, { once: true, margin: "-50px" });
                return (
                  <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass-card rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-cyan-300" />
                    </div>
                    <h4 className="font-semibold text-white mb-1">{item.label}</h4>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </motion.div>
                );
              };
              return <CardWrapper key={item.label} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
