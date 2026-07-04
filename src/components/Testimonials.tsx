"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Star, Quote } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { siteImages } from "@/data/site-images";

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "Science Teacher, Delhi Public School",
    content:
      "My students' understanding of molecular structures improved dramatically. They can now visualize what was previously just abstract diagrams in textbooks.",
    rating: 5,
  },
  {
    name: "Rahul Mehta",
    role: "Student, Class 10",
    content:
      "History used to be my least favorite subject. Now I've 'visited' the Colosseum and walked through ancient Harappa. It's like time travel!",
    rating: 5,
  },
  {
    name: "Anita Reddy",
    role: "Principal, Greenfield International",
    content:
      "We implemented Nexscape across all our science classes. Test scores improved by 40% and student engagement went through the roof.",
    rating: 5,
  },
];

const stats = [
  { number: "95%", label: "Student Engagement" },
  { number: "40%", label: "Better Retention" },
  { number: "500+", label: "Schools Onboarded" },
  { number: "1M+", label: "Lessons Completed" },
];

function TestimonialCard({ testimonial, index }: { testimonial: (typeof testimonials)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:bg-white/[0.07] transition-colors h-full flex flex-col"
    >
      <Quote className="w-7 h-7 text-indigo-400/40 mb-3 shrink-0" />
      <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4 flex-1">
        &ldquo;{testimonial.content}&rdquo;
      </p>
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <div>
        <div className="font-semibold text-white text-sm sm:text-base">{testimonial.name}</div>
        <div className="text-xs sm:text-sm text-slate-400">{testimonial.role}</div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-50px" });
  const imageRef = useRef(null);
  const imageInView = useInView(imageRef, { once: true, margin: "-60px" });

  return (
    <section id="testimonials" className="relative py-16 sm:py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 24 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={statsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="text-center glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-black gradient-text">{stat.number}</div>
              <div className="text-[11px] sm:text-sm text-slate-400 mt-1.5">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-8 lg:gap-12 items-start">
          <div>
            <SectionHeader
              align="left"
              eyebrow="Testimonials"
              eyebrowColor="text-pink-400"
              title={<>Loved by <span className="gradient-text">Students & Teachers</span></>}
              description="Schools and learners worldwide are transforming education with immersive XR."
              className="mb-6 sm:mb-8 !max-w-none"
            />
            <motion.div
              ref={imageRef}
              initial={{ opacity: 0, y: 24 }}
              animate={imageInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="relative hidden sm:block"
            >
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-pink-500/20 to-indigo-500/20 blur-sm" />
              <div className="relative rounded-2xl overflow-hidden border border-white/10">
                <Image
                  src={siteImages.anatomyClassroom}
                  alt="Students learning human anatomy with interactive 3D AR"
                  width={800}
                  height={600}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-1 gap-4 sm:gap-5">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.name} testimonial={t} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
