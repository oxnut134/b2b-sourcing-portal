"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Loader2, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const perks = [
  "Submit unlimited RFQs",
  "Competitive quotes in 48h",
  "Stripe-secured payments",
  "Live order tracking",
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", company: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, company: form.company, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(typeof data.error === "string" ? data.error : "Registration failed."); return; }
    router.push("/login?registered=1");
  }

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 8 ? 1 : form.password.length < 12 ? 2 : 3;

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden flex-col p-12"
        style={{ background: "linear-gradient(135deg, #090d1a 0%, #0c1220 100%)" }}>
        <div className="absolute inset-0 bg-dot-grid opacity-60 pointer-events-none" />
        <div className="absolute top-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full orb-indigo opacity-40 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[350px] h-[350px] rounded-full orb-cyan opacity-30 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[rgba(148,163,184,0.08)] to-transparent" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-[#e2e8f0]">B2B Portal</span>
        </div>

        <div className="relative mt-12 space-y-3">
          <h2 className="text-lg font-semibold text-[#e2e8f0] tracking-tight mb-6">
            Source smarter starting today
          </h2>
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <CheckCircle className="h-3 w-3 text-emerald-400" />
              </div>
              <span className="text-sm text-[#e2e8f0]">{perk}</span>
            </div>
          ))}
        </div>

        <div className="relative mt-auto rounded-xl p-5"
          style={{ background: "rgba(13,20,36,0.6)", border: "1px solid rgba(148,163,184,0.07)" }}>
          <p className="text-[11px] text-[#1e3048] mb-3 uppercase tracking-widest font-semibold">Trusted by</p>
          <div className="flex items-center gap-4">
            {["Manufacturing", "Electronics", "Logistics"].map((c) => (
              <span key={c} className="text-xs font-semibold text-[#3d5068]">{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}>
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#e2e8f0]">B2B Portal</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#e2e8f0] tracking-[-0.03em]">Create your account</h1>
            <p className="text-sm text-[#e2e8f0] mt-1.5">Start sourcing smarter today — free forever</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border px-4 py-3 text-xs text-rose-300 animate-fade-in"
                style={{ background: "rgba(244,63,94,0.08)", borderColor: "rgba(244,63,94,0.2)" }}>
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Your full name" value={form.name} onChange={update("name")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="Your company" value={form.company} onChange={update("company")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={form.email} onChange={update("email")} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPw ? "text" : "password"} placeholder="Min. 8 characters"
                  value={form.password} onChange={update("password")} required minLength={8} className="pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1e3048] hover:text-[#3d5068] transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password && (
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-0.5 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background: pwStrength >= n
                          ? n === 1 ? "#f43f5e" : n === 2 ? "#f59e0b" : "#10b981"
                          : "rgba(148,163,184,0.08)"
                      }} />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" placeholder="••••••••"
                value={form.confirm} onChange={update("confirm")} required
                style={form.confirm && form.confirm !== form.password ? { borderColor: "rgba(244,63,94,0.4)" } : {}} />
            </div>

            <Button type="submit" className="w-full gap-2 group mt-2" disabled={loading} size="lg">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</> :
                <>Create account<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>}
            </Button>

            <p className="text-xs text-[#e2e8f0] text-center mt-2">
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#e2e8f0]">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
