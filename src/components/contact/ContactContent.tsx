"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  User,
} from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "info@nexscape.in",
    href: "mailto:info@nexscape.in",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 8374576310",
    href: "tel:+918374576310",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Hyderabad, Telangana, India",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Clock,
    label: "Response time",
    value: "Within 1–2 business days",
    gradient: "from-amber-500 to-orange-500",
  },
];

const subjects = [
  { value: "general", label: "General inquiry" },
  { value: "schools", label: "School / institution" },
  { value: "support", label: "Technical support" },
  { value: "partnership", label: "Partnership" },
  { value: "feedback", label: "Product feedback" },
];

const roles = ["Student", "Teacher", "School admin", "Parent", "Other"];

export default function ContactContent() {
  const searchParams = useSearchParams();
  const formRef = useRef(null);
  const formInView = useInView(formRef, { once: true, margin: "-60px" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    if (
      subjectParam &&
      ["general", "schools", "support", "partnership", "feedback"].includes(subjectParam)
    ) {
      setSubject(subjectParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, role, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setSent(true);
      setName("");
      setEmail("");
      setPhone("");
      setRole("");
      setSubject("general");
      setMessage("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-12 sm:pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-6">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span className="text-xs sm:text-sm font-medium text-cyan-200/90">Get in Touch</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="text-white">We&apos;d love to </span>
            <span className="gradient-text">hear from you</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Questions about Nexscape for your school, technical support, or partnership
            opportunities — our team is here to help.
          </p>
        </motion.div>
      </section>

      {/* Contact cards */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
              className="glass-card rounded-2xl p-5 hover:bg-white/[0.07] transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3`}
              >
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{item.label}</p>
              {item.href ? (
                <a href={item.href} className="text-sm font-medium text-white hover:text-indigo-300 transition-colors">
                  {item.value}
                </a>
              ) : (
                <p className="text-sm font-medium text-white">{item.value}</p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, x: -20 }}
            animate={formInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
            id="contact-form"
          >
            <div className="rounded-2xl border border-white/15 bg-[#0c1222] p-6 sm:p-8 shadow-xl shadow-black/30">
              {sent ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Message sent!</h2>
                  <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                    Thanks for reaching out. We&apos;ll get back to you at your email within 1–2 business days.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="text-sm text-indigo-400 hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-1">Send us a message</h2>
                  <p className="text-sm text-slate-500 mb-6">All fields marked with * are required.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Full name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
                            placeholder="Your name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
                            placeholder="you@school.edu"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Mobile number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          inputMode="tel"
                          autoComplete="tel"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">I am a…</label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
                        >
                          <option value="">Select (optional)</option>
                          {roles.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Subject *</label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
                        >
                          {subjects.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Message *</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={5}
                        maxLength={2000}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 resize-none"
                        placeholder="Tell us how we can help…"
                      />
                      <p className="text-[10px] text-slate-600 mt-1 text-right">{message.length}/2000</p>
                    </div>

                    {error && (
                      <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 font-semibold text-sm transition-colors"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Send Message
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={formInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold">For schools & institutions</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Interested in bringing Nexscape to your classrooms? We offer demos,
                pilot programs, and NCERT-aligned curriculum mapping for K–12 schools.
              </p>
              <Link
                href="#contact-form"
                className="text-sm text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Fill out the form below →
              </Link>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-4">Common questions</h3>
              <ul className="space-y-4 text-sm">
                {[
                  {
                    q: "Is Nexscape free for students?",
                    a: "Yes — individual students can access labs and study materials for free.",
                  },
                  {
                    q: "What devices are supported?",
                    a: "Any modern browser on phones, tablets, laptops, and VR headsets.",
                  },
                  {
                    q: "Do you support NCERT curriculum?",
                    a: "Yes, Class 1–12 NCERT books, MCQs, and aligned 3D labs are built in.",
                  },
                ].map((faq) => (
                  <li key={faq.q}>
                    <p className="font-medium text-white mb-0.5">{faq.q}</p>
                    <p className="text-slate-500 leading-relaxed">{faq.a}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-indigo-500/20 bg-indigo-500/5">
              <p className="text-xs text-indigo-400 uppercase tracking-wide mb-2">Teachers</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                Already using Nexscape? Visit the{" "}
                <Link href="/teacher" className="text-indigo-400 hover:underline">
                  Teacher Hub
                </Link>{" "}
                for lesson search, smart board mode, and assignment tools.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
