"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) { setError("Invalid email or password. Please try again."); return; }
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    router.push(session?.user?.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col p-12"
        style={{ background: "linear-gradient(135deg, #090d1a 0%, #0c1220 60%, #0a0f1e 100%)" }}>
        <div className="absolute inset-0 bg-dot-grid opacity-60 pointer-events-none" />
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full orb-indigo opacity-40 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full orb-cyan opacity-30 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[rgba(148,163,184,0.08)] to-transparent" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-[#e2e8f0]">B2B Portal</span>
        </div>

        <div className="relative mt-auto">
          <div className="mb-6 h-px w-12" style={{ background: "linear-gradient(90deg, #6366f1, transparent)" }} />
          <blockquote className="space-y-4">
            <p className="text-xl font-medium text-[#e2e8f0] leading-snug tracking-tight">
              "We cut our sourcing cycle from 3 weeks to{" "}
              <span className="gradient-text-dual">3 days</span> using B2B Portal."
            </p>
            <footer className="text-xs text-[#e2e8f0]">
              <strong className="text-[#e2e8f0]">Procurement Director</strong> · Manufacturing Industry
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-16">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}>
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#e2e8f0]">B2B Portal</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#e2e8f0] tracking-[-0.03em]">Welcome back</h1>
            <p className="text-sm text-[#e2e8f0] mt-1.5">Sign in to your procurement dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border px-4 py-3 text-xs text-rose-300 animate-fade-in"
                style={{ background: "rgba(244,63,94,0.08)", borderColor: "rgba(244,63,94,0.2)" }}>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#e2e8f0]">Email address</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#e2e8f0]">Password</Label>
              <div className="relative">
                <Input id="password" type={showPw ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password" className="pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1e3048] hover:text-[#3d5068] transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full gap-2 group mt-2" disabled={loading} size="lg">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</> :
                <>Sign in<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#e2e8f0]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
