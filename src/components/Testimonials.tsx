"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

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
      "We implemented LearnXR across all our science classes. Test scores improved by 40% and student engagement went through the roof.",
    rating: 5,
  },
];

const stats = [
  { number: "95%", label: "Student Engagement" },
  { number: "40%", label: "Better Retention" },
  { number: "500+", label: "Schools Onboarded" },
  { number: "1M+", label: "Lessons Completed" },
];

export default function Testimonials() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, margin: "-50px" });

  return (
    <section id="testimonials" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isStatsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center glass-card rounded-2xl p-6"
            >
              <div className="text-3xl md:text-4xl font-black gradient-text">
                {stat.number}
              </div>
              <div className="text-sm text-slate-400 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-pink-400 uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Loved by{" "}
            <span className="gradient-text">Students & Teachers</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => {
            const TestimonialCard = () => {
              const ref = useRef(null);
              const isInView = useInView(ref, {
                once: true,
                margin: "-50px",
              });

              return (
                <motion.div
                  ref={ref}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="glass-card rounded-2xl p-8 hover:bg-white/[0.08] transition-all duration-300"
                >
                  <Quote className="w-8 h-8 text-indigo-400/50 mb-4" />
                  <p className="text-slate-300 leading-relaxed mb-6">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-400">
                      {testimonial.role}
                    </div>
                  </div>
                </motion.div>
              );
            };

            return <TestimonialCard key={testimonial.name} />;
          })}
        </div>
      </div>
    </section>
  );
}
