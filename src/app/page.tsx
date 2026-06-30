import Link from "next/link";
import { ArrowRight, Package, Shield, Globe, CheckCircle, Lock, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

/*
  Landing page uses a lighter dark palette (slate-800 range):
  - Base bg:   #1e293b  (slate-800)
  - Surface:   #253448  (card backgrounds)
  - Elevated:  #2d3c52  (hover / raised)
  - Section:   #162030  (alternating darker sections)
  Primary text #f1f5f9, secondary #94a3b8, muted #64748b
*/

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: "#1e293b" }}>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-nav-slate">
        <div className="mx-auto max-w-7xl px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#f1f5f9] tracking-tight">B2B Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <button className="px-3 h-8 rounded-lg text-xs text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#253448] transition-all">Sign in</button>
            </Link>
            <Link href="/register">
              <button className="px-4 h-8 rounded-lg text-xs text-white font-medium btn-premium">Get started free</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-14">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Orbs — higher opacity for lighter bg */}
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full animate-glow-pulse"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)" }} />
          <div className="absolute top-[15%] left-[-5%] w-[450px] h-[450px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)" }} />
          <div className="absolute top-[8%] right-[-8%] w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
          {/* Dot grid — more visible on lighter bg */}
          <div className="bg-dot-grid-md absolute inset-0" />
          {/* Soft fade at center so text pops */}
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 65% 55% at 50% 40%, rgba(30,41,59,0.85), transparent 80%)" }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          {/* Eyebrow pill */}
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-8"
            style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.30)", color: "#a5b4fc" }}>
            <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            Enterprise B2B Procurement Platform
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up delay-100 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.04em] leading-[1.05]">
            <span className="text-[#f1f5f9]">Source smarter,</span>
            <br />
            <span className="gradient-text-dual">ship faster.</span>
          </h1>

          <p className="animate-fade-up delay-200 mt-6 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
            style={{ color: "#94a3b8" }}>
            Streamline your entire procurement cycle — from RFQ to delivery — with a single platform built for modern B2B teams.
          </p>

          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link href="/register">
              <button className="inline-flex items-center gap-2 px-6 h-12 rounded-xl text-sm font-semibold text-white btn-premium">
                Start for free <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/login">
              <button className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(37,52,72,0.9)",
                  border: "1px solid rgba(148,163,184,0.18)",
                  color: "#cbd5e1",
                }}>
                Sign in to portal
              </button>
            </Link>
          </div>

          {/* Trust bar */}
          <div className="animate-fade-up delay-400 mt-12 flex flex-wrap items-center justify-center gap-6 text-[11px]"
            style={{ color: "#64748b" }}>
            {["No credit card required", "SOC 2 compliant", "Enterprise-grade security"].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-emerald-400/70" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <section className="relative py-14 border-y"
        style={{
          background: "linear-gradient(180deg, #1e293b, #1a2840, #1e293b)",
          borderColor: "rgba(148,163,184,0.10)",
        }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "2,400+", label: "Active vendors" },
            { value: "$2.1B",  label: "Transactions processed" },
            { value: "98.7%",  label: "On-time delivery" },
            { value: "< 24h",  label: "Quote turnaround" },
          ].map(({ value, label }, i) => (
            <div key={i} className={`animate-fade-up delay-${(i + 1) * 100}`}>
              <p className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] gradient-text-primary">{value}</p>
              <p className="text-xs mt-1.5 font-medium" style={{ color: "#64748b" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ backgroundColor: "#1e293b" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Platform features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em]" style={{ color: "#f1f5f9" }}>
              Everything procurement needs
            </h2>
            <p className="text-sm mt-3 max-w-md mx-auto leading-relaxed" style={{ color: "#94a3b8" }}>
              One unified workspace for sourcing, quoting, ordering, and tracking.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap,       color: "#818cf8", bg: "rgba(99,102,241,0.14)",  border: "rgba(99,102,241,0.28)",  label: "Instant RFQ",      desc: "Submit sourcing requests in minutes with structured templates" },
              { icon: BarChart3, color: "#22d3ee", bg: "rgba(6,182,212,0.10)",   border: "rgba(6,182,212,0.25)",   label: "Real-time Quotes", desc: "Competitive quotes from verified suppliers within 24 hours" },
              { icon: Shield,    color: "#a78bfa", bg: "rgba(124,58,237,0.12)",  border: "rgba(124,58,237,0.25)",  label: "Secure Payments",  desc: "Stripe-powered payments with end-to-end encryption" },
              { icon: Globe,     color: "#34d399", bg: "rgba(16,185,129,0.10)",  border: "rgba(16,185,129,0.25)",  label: "Order Tracking",   desc: "Full supply chain visibility from payment to delivery" },
            ].map(({ icon: Icon, color, bg, border, label, desc }, i) => (
              <div key={i}
                className={`animate-fade-up delay-${(i + 1) * 100} card-slate rounded-xl p-5 group hover:scale-[1.015] transition-transform duration-200`}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg mb-4"
                  style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <p className="text-sm font-semibold mb-2" style={{ color: "#f1f5f9" }}>{label}</p>
                <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-20 px-6"
        style={{ background: "linear-gradient(180deg, #1e293b, #192030, #1e293b)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-3xl font-bold tracking-[-0.03em]" style={{ color: "#f1f5f9" }}>
              How it works
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { step: "01", color: "#818cf8", title: "Submit an RFQ",  desc: "Describe your product, quantity, and requirements. Takes less than 2 minutes." },
              { step: "02", color: "#22d3ee", title: "Receive Quotes", desc: "Our team reviews your request and responds with competitive pricing within 24 hours." },
              { step: "03", color: "#a78bfa", title: "Pay & Track",    desc: "Accept a quote, complete secure payment, and track your order in real-time." },
            ].map(({ step, color, title, desc }, i) => (
              <div key={i}
                className={`animate-fade-up delay-${(i + 1) * 150} card-slate rounded-xl p-5 flex gap-5 items-start`}>
                <div className="shrink-0 text-xs font-bold tracking-widest mt-0.5" style={{ color }}>{step}</div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#f1f5f9" }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: "#1e293b" }}>
        <div className="max-w-2xl mx-auto text-center card-slate-strong rounded-2xl p-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl mx-auto mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(6,182,212,0.12))",
              border: "1px solid rgba(99,102,241,0.35)",
            }}>
            <Lock className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] mb-3" style={{ color: "#f1f5f9" }}>
            Ready to modernize procurement?
          </h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: "#94a3b8" }}>
            Join hundreds of businesses streamlining their sourcing operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <button className="inline-flex items-center gap-2 px-6 h-11 rounded-xl text-sm font-semibold text-white btn-premium">
                Create free account <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/login">
              <button className="inline-flex items-center justify-center px-6 h-11 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(45,60,82,0.8)",
                  border: "1px solid rgba(148,163,184,0.18)",
                  color: "#cbd5e1",
                }}>
                Sign in
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="py-8 px-6" style={{ borderTop: "1px solid rgba(148,163,184,0.10)", backgroundColor: "#1e293b" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded"
              style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}>
              <Package className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium" style={{ color: "#64748b" }}>B2B Sourcing Portal</span>
          </div>
          <p className="text-[11px]" style={{ color: "#475569" }}>© 2026 · All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
