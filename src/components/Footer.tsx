"use client";

import Link from "next/link";
import Image from "next/image";
import { siteImages } from "@/data/site-images";
import FooterAuthLinks from "@/components/auth/FooterAuthLinks";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 pt-12 sm:pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1.2fr_2fr] gap-10 lg:gap-12 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <span className="text-xl font-bold">
                Nex<span className="text-indigo-400">scape</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              Making education immersive, interactive, and unforgettable through
              AR & VR technology.
            </p>
            
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10">
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm">Platform</h4>
              <FooterAuthLinks />
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm">Study</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "NCERT Books (Class 1–12)", href: "/study" },
                  { label: "Nursery AR", href: "/nursery" },
                  { label: "Puzzle Games", href: "/nursery/puzzles" },
                  { label: "Trigonometry", href: "/trigonometry" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-slate-400 hover:text-white transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm">Subjects</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Science", href: "/labs" },
                  { label: "Mathematics", href: "/trigonometry" },
                  { label: "Chemistry", href: "/chemistry-lab" },
                  { label: "Biology", href: "/photosynthesis" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-slate-400 hover:text-white transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm">Company</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Careers", href: "#" },
                  { label: "Blog", href: "/blog" },
                  { label: "Contact Us", href: "/contact" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-slate-400 hover:text-white transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} Nexscape. All rights reserved.
          </p>
          <div className="flex items-center gap-5 sm:gap-6">
            <Link href="#" className="text-xs sm:text-sm text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs sm:text-sm text-slate-500 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
