"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  BookOpen,
  Globe2,
  Heart,
  Lightbulb,
  MapPin,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { siteImages } from "@/data/site-images";

const values = [
  {
    icon: Lightbulb,
    title: "Curiosity First",
    description:
      "Every experience is designed to spark wonder — turning \"I have to learn this\" into \"I want to explore this.\"",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Globe2,
    title: "Accessible Everywhere",
    description:
      "From low-end phones to VR headsets — Nexscape runs in the browser, in classrooms, and at home.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: BookOpen,
    title: "Curriculum Aligned",
    description:
      "NCERT-aligned content from nursery through Class 12, mapped to real textbooks and exam patterns.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Shield,
    title: "Safe to Explore",
    description:
      "Virtual labs mean no broken glassware, no dangerous chemicals — just pure, repeatable learning.",
    gradient: "from-violet-500 to-purple-500",
  },
];

const milestones = [
  {
    year: "2025",
    title: "The Spark",
    description: "Nexscape began as a classroom experiment — could AR make abstract science feel real?",
  },
  {
    year: "2026",
    title: "First Labs Ship",
    description: "Solar System, Water Cycle, and Chemistry Lab launched to pilot schools in tier-2 cities ",
  },
  {
    year: "2026",
    title: "The Nexscape Era",
    description: "Rebranded and rebuilt — a unified immersive learning platform for every learner in tier-2 cities.",
  },
];

const team = [
 
  {
    name: "Prasuna Parvathi",
    role: "Co-Founder & CEO",
    bio: "Founder of Nexscape. Passionate about making education accessible to all.",
    initials: "PP",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    name: "Venkatesh P",
    role: "Co-Founder & CTO",
    bio: "Former Project Lead at PlugXR and Wipro. Passionate about building scalable platforms, AI-powered applications, and immersive 3D/XR experiences.",
    initials: "VP",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    name: "Ganesh K",
    role: "Senior Software Engineer",
    bio: "Experienced software engineer with a passion for building scalable and efficient systems.",
    initials: "GK",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    name: "Namdev G",
      role: "AI/ML Engineer",
      bio: "AI/ML Engineer with a passion for building intelligent systems.",
    initials: "NG",
    gradient: "from-fuchsia-500 to-pink-500",
  },
];

const stats = [
  { value: "1K+", label: "Active Students", icon: Users },
  { value: "10+", label: "Partner Schools", icon: MapPin },
  { value: "50+", label: "Interactive Labs", icon: Rocket },
  { value: "12", label: "XR Experiences", icon: Sparkles },
];

function PageBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[min(900px,120vw)] h-[400px] bg-indigo-600/15 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -left-32 w-[350px] h-[350px] bg-fuchsia-600/10 rounded-full blur-[100px]" />
    </div>
  );
}

function ValueCard({
  value,
  index,
}: {
  value: (typeof values)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group glass-card rounded-2xl p-6 sm:p-7 hover:bg-white/[0.07] hover:border-indigo-500/25 transition-all duration-300 h-full"
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}
      >
        <value.icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{value.description}</p>
    </motion.div>
  );
}

function TimelineItem({
  item,
  index,
  isLast,
}: {
  item: (typeof milestones)[0];
  index: number;
  isLast: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex gap-6 sm:gap-8 pb-10 sm:pb-12 last:pb-0"
    >
      {!isLast && (
        <div className="absolute left-[19px] sm:left-[23px] top-12 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 to-transparent" />
      )}
      <div className="relative shrink-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center ring-4 ring-slate-950">
          <span className="text-[10px] sm:text-xs font-bold text-white">{item.year.slice(2)}</span>
        </div>
      </div>
      <div className="pt-1 sm:pt-2 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
          {item.year}
        </p>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{item.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
      </div>
    </motion.div>
  );
}

function TeamCard({
  member,
  index,
}: {
  member: (typeof team)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group glass-card rounded-2xl p-6 text-center hover:bg-white/[0.07] hover:border-indigo-500/20 transition-all duration-300"
    >
      <div
        className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-lg`}
      >
        <span className="text-2xl font-bold text-white">{member.initials}</span>
      </div>
      <h3 className="text-base font-bold text-white mb-0.5">{member.name}</h3>
      <p className="text-xs font-medium text-indigo-400 mb-3">{member.role}</p>
      <p className="text-sm text-slate-400 leading-relaxed">{member.bio}</p>
    </motion.div>
  );
}

export default function AboutContent() {
  const storyRef = useRef(null);
  const storyInView = useInView(storyRef, { once: true, margin: "-80px" });
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-60px" });

  return (
    <div className="relative bg-slate-950">
      <PageBackground />

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-6 sm:mb-8">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-xs sm:text-sm font-medium text-indigo-200/90 tracking-wide">
              About Nexscape
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            <span className="text-white">We&apos;re on a mission to make</span>
            <br />
            <span className="gradient-text">learning unforgettable</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Nexscape is an immersive education platform that brings textbooks to life
            through AR, VR, and interactive 3D — so every student can see, touch, and
            truly understand the world around them.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/labs"
              className="group inline-flex items-center justify-center gap-2 min-h-[48px] px-8 py-3.5 rounded-xl bg-white text-slate-950 font-semibold text-sm sm:text-base hover:bg-slate-100 transition-all"
            >
              Explore Our Labs
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#team"
              className="inline-flex items-center justify-center min-h-[48px] px-8 py-3.5 rounded-xl font-semibold text-sm sm:text-base border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] transition-all"
            >
              Meet the Team
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            ref={storyRef}
            initial={{ opacity: 0, y: 32 }}
            animate={storyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
          >
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-1 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500/30 via-cyan-400/20 to-fuchsia-500/30 blur-md opacity-70" />
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10">
                <Image
                  src={siteImages.audienceExploreLearn}
                  alt="Students exploring immersive 3D learning environments"
                  width={700}
                  height={500}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Our north star</p>
                    <p className="text-sm font-semibold text-white">
                      Every child deserves to learn by doing
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Our Story
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 leading-tight">
                  From a single classroom to{" "}
                  <span className="gradient-text">thousands of learners</span>
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  It started when a group of teachers and engineers asked a simple question:
                  why do students memorize formulas they never truly see? We built the first
                  prototype — a 3D solar system students could fly through — and watched
                  engagement soar overnight.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-5">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-3">
                    <Target className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">Mission</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Democratize immersive learning so geography, income, or device never
                    limits a child&apos;s curiosity.
                  </p>
                </div>
                <div className="glass-card rounded-xl p-5">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">Vision</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    A world where every school has a virtual lab as rich as any physical one
                    — and every student is an explorer.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 24 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-10"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                className="text-center"
              >
                <Icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
                  {value}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wide">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="What We Stand For"
            eyebrowColor="text-emerald-400"
            title={
              <>
                Values that guide{" "}
                <span className="gradient-text">everything we build</span>
              </>
            }
            description="These principles shape every lab, every lesson, and every interaction on Nexscape."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((value, i) => (
              <ValueCard key={value.title} value={value} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <SectionHeader
              align="left"
              eyebrow="Our Journey"
              eyebrowColor="text-indigo-400"
              title={
                <>
                  Milestones on the path to{" "}
                  <span className="gradient-text">immersive education</span>
                </>
              }
              description="From a weekend hackathon to a platform trusted by schools nationwide."
              className="mb-0 lg:sticky lg:top-32"
            />
            <div className="lg:pt-4">
              {milestones.map((item, i) => (
                <TimelineItem
                  key={`${item.year}-${item.title}`}
                  item={item}
                  index={i}
                  isLast={i === milestones.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="relative z-10 py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="The People Behind Nexscape"
            eyebrowColor="text-fuchsia-400"
            title={
              <>
                Educators, engineers &{" "}
                <span className="gradient-text">dreamers</span>
              </>
            }
            description="A small, passionate team united by one belief — technology should make learning more human, not less."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {team.map((member, i) => (
              <TeamCard key={member.name} member={member} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 min-h-[360px] sm:min-h-[420px] flex items-center">
            <Image
              src={siteImages.audienceClassroom}
              alt="Classroom using Nexscape immersive learning"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30" />

            <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400 mb-4 block">
                Join the Movement
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                Ready to bring{" "}
                <span className="gradient-text">Nexscape to your school?</span>
              </h2>
              <p className="text-slate-300 mb-8 leading-relaxed max-w-lg">
                Whether you&apos;re a teacher, principal, or parent — we&apos;d love to
                show you how immersive learning can transform your classroom.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/labs"
                  className="group inline-flex items-center justify-center gap-2 min-h-[48px] px-8 py-3.5 rounded-xl bg-white text-slate-950 font-semibold hover:bg-slate-100 transition-all"
                >
                  Browse Labs
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/contact?subject=schools"
                  className="inline-flex items-center justify-center min-h-[48px] px-8 py-3.5 rounded-xl font-semibold border border-white/20 bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-sm transition-all"
                >
                  Request a Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
