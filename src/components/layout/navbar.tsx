"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Building2, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = session?.user?.role === "admin";
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#f1f5f9] tracking-tight">B2B Portal</span>
          </Link>

          {session ? (
            <div className="flex items-center gap-2">
              <Link href={dashboardHref}>
                <Button variant="ghost" size="sm" className="text-sm h-8 text-[#94a3b8] hover:text-[#f1f5f9]">
                  {isAdmin ? "Admin" : "Dashboard"}
                </Button>
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-[#94a3b8] transition-all duration-150",
                    "hover:bg-[#253448] hover:text-[#f1f5f9]",
                    menuOpen && "bg-[#253448] text-[#f1f5f9]"
                  )}
                >
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-white text-[11px] font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)" }}
                  >
                    {(session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-[120px] truncate">
                    {session.user.name ?? session.user.email}
                  </span>
                  <ChevronDown className={cn("h-3 w-3 shrink-0 transition-transform duration-200", menuOpen && "rotate-180")} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-scale-in"
                    style={{ background: "#253448", border: "1px solid rgba(148,163,184,0.18)" }}>
                    <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(148,163,184,0.10)" }}>
                      <p className="text-sm font-medium text-[#f1f5f9] truncate">{session.user.name}</p>
                      <p className="text-xs text-[#64748b] truncate mt-0.5">{session.user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                          "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1 ring-inset tracking-wide",
                          isAdmin
                            ? "bg-amber-500/10 text-amber-300 ring-amber-500/25"
                            : "bg-indigo-500/10 text-indigo-300 ring-indigo-500/25"
                        )}>
                          {isAdmin ? "ADMIN" : "CLIENT"}
                        </span>
                        {session.user.company && (
                          <span className="text-xs text-[#64748b] truncate">{session.user.company}</span>
                        )}
                      </div>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm h-8 text-[#94a3b8] hover:text-[#f1f5f9]">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="h-8 text-sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
