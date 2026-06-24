"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Baby, BookOpen, GraduationCap, School, Building2, Home, Users, Layers,
} from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import SectionImage from "@/components/ui/SectionImage";
import { siteImages } from "@/data/site-images";

const students = [
  { icon: Baby, label: "Nursery", age: "3–5 years", color: "from-pink-500 to-rose-500" },
  { icon: Baby, label: "Kindergarten", age: "5–6 years", color: "from-amber-500 to-orange-500" },
  { icon: BookOpen, label: "Primary School", age: "6–10 years", color: "from-emerald-500 to-green-500" },
  { icon: Layers, label: "Middle School", age: "11–13 years", color: "from-cyan-500 to-blue-500" },
  { icon: GraduationCap, label: "High School", age: "14–18 years", color: "from-indigo-500 to-violet-500" },
];

const institutions = [
  { icon: School, label: "Schools", desc: "K-12 curriculum integration" },
  { icon: Building2, label: "Coaching Centers", desc: "Competitive exam prep" },
  { icon: GraduationCap, label: "Colleges", desc: "Higher education labs" },
  { icon: Home, label: "Homeschool Programs", desc: "Self-paced learning at home" },
];

export default function TargetAudience() {
  const cardsRef = useRef(null);
  const cardsInView = useInView(cardsRef, { once: true, margin: "-60px" });

  return (
    <section id="audience" className="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Who Is It For"
          eyebrowColor="text-purple-400"
          title={<>Built for Every <span className="gradient-text">Learner & Institution</span></>}
          description="From nursery toddlers to college students — immersive learning for classrooms, coaching centers, and homes."
        />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-12 sm:mb-16">
          <SectionImage
            src={siteImages.audienceClassroom}
            alt="Children using AR markers in a classroom with 3D models"
            aspectClass="aspect-[4/3] sm:aspect-[3/2]"
          />
          <motion.div
            ref={cardsRef}
            initial={{ opacity: 0, x: 20 }}
            animate={cardsInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-indigo-400" />
                Students
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                {students.map((item, i) => (
                  <div
                    key={item.label}
                    className="glass-card rounded-xl p-3 sm:p-4 text-center hover:bg-white/[0.07] transition-colors"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-2`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-white text-xs sm:text-sm">{item.label}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{item.age}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-4 sm:mb-6">
            <Building2 className="w-5 h-5 text-cyan-400" />
            Institutions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {institutions.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:bg-white/[0.07] transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-cyan-300" />
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1">{item.label}</h4>
                <p className="text-xs sm:text-sm text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
