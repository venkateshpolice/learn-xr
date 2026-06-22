"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <span className="text-xl font-bold">
                Learn<span className="text-indigo-400">XR</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Making education immersive, interactive, and unforgettable through
              AR & VR technology.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  For Students
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  For Schools
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  For Teachers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Subjects</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Science
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  History
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Mathematics
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Geography
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} LearnXR. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
