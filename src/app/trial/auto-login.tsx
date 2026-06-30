"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Package, Loader2 } from "lucide-react";

export default function TrialAutoLogin() {
  const router = useRouter();

  useEffect(() => {
    signIn("credentials", {
      email: "demo@example.com",
      password: "demo2026",
      redirect: false,
    }).then((result) => {
      router.push(result?.ok ? "/dashboard" : "/login");
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center gap-6">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{
          background: "linear-gradient(135deg, #6366f1, #06b6d4)",
          boxShadow: "0 0 30px rgba(99,102,241,0.4)",
        }}
      >
        <Package className="h-6 w-6 text-white" />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2 text-[#e2e8f0]">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
          <span className="text-sm font-medium">Setting up your demo…</span>
        </div>
        <p className="text-xs text-[#64748b]">You'll be redirected to the dashboard shortly.</p>
      </div>
    </div>
  );
}
