"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

type SectionHeaderProps = {
  eyebrow: string;
  eyebrowColor?: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  eyebrowColor = "text-indigo-400",
  title,
  description,
  align = "center",
  className = "",
}: SectionHeaderProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className={`${align === "center" ? "text-center mx-auto" : "text-left"} max-w-3xl mb-10 sm:mb-12 lg:mb-14 ${className}`}
    >
      <span className={`text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] ${eyebrowColor}`}>
        {eyebrow}
      </span>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 sm:mt-4 mb-4 sm:mb-5 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-sm sm:text-base lg:text-lg text-slate-400 leading-relaxed">{description}</p>
      )}
    </motion.div>
  );
}
