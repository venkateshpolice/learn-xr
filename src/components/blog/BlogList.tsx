"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, Tag } from "lucide-react";
import { BLOG_POSTS } from "@/data/blog-posts";

export default function BlogList() {
  return (
    <div className="relative bg-slate-950">
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
      </div>

      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 mb-6">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span className="text-xs sm:text-sm font-medium text-violet-200/90">Nexscape Blog</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="text-white">Insights on </span>
            <span className="gradient-text">immersive education</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Research-backed perspectives on AR, VR, and interactive teaching methods for modern classrooms.
          </p>
        </motion.div>

        <div className="space-y-6">
          {BLOG_POSTS.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group block glass-card rounded-2xl p-6 sm:p-8 hover:bg-white/[0.07] hover:border-indigo-500/25 transition-all"
              >
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 font-medium">
                    {post.category}
                  </span>
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readMinutes} min read
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors leading-snug">
                  {post.title}
                </h2>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-4">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-500"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 group-hover:gap-2.5 transition-all">
                  Read article
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
