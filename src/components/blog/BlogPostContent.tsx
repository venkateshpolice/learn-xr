"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Tag, User } from "lucide-react";
import type { BlogPost } from "@/data/blog-posts";

export default function BlogPostContent({ post }: { post: BlogPost }) {
  return (
    <article className="relative bg-slate-950">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-12"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
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
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {post.author}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] mb-5">
            {post.title}
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed border-l-2 border-indigo-500/50 pl-4">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap gap-2 mt-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="prose prose-invert prose-slate max-w-none"
        >
          <div className="space-y-10">
            {post.sections.map((section, i) => (
              <section key={i}>
                {section.heading && (
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-snug">
                    {section.heading}
                  </h2>
                )}
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-slate-300 text-base sm:text-lg leading-relaxed mb-4 last:mb-0">
                    {p}
                  </p>
                ))}
                {section.highlight && (
                  <blockquote className="my-6 pl-5 border-l-4 border-cyan-500/60 bg-cyan-500/5 rounded-r-xl py-4 pr-4">
                    <p className="text-cyan-100/90 text-base sm:text-lg font-medium leading-relaxed m-0">
                      {section.highlight}
                    </p>
                  </blockquote>
                )}
                {section.bullets && (
                  <ul className="mt-4 space-y-2">
                    {section.bullets.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-slate-300 text-base leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </motion.div>

        <div className="mt-14 pt-8 border-t border-white/10">
          <p className="text-sm text-slate-500 mb-4">Ready to bring immersive learning to your classroom?</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact?subject=schools"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-colors"
            >
              Request a School Demo
            </Link>
            <Link
              href="/labs"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 font-semibold text-sm transition-colors"
            >
              Explore Labs
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
