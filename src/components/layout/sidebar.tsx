"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, ClipboardList, ShoppingBag, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const clientLinks: Array<{ href: string; icon: React.ComponentType<{ className?: string }>; label: string; accent?: boolean }> = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/rfq/new",   icon: Plus,            label: "New RFQ",       accent: true },
  { href: "/rfq",       icon: ClipboardList,   label: "My RFQs" },
  { href: "/quotes",    icon: FileText,         label: "Quotes" },
  { href: "/orders",    icon: ShoppingBag,     label: "Orders" },
];

const adminLinks: Array<{ href: string; icon: React.ComponentType<{ className?: string }>; label: string; accent?: boolean }> = [
  { href: "/admin",         icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/rfqs",    icon: ClipboardList,   label: "RFQ Management" },
  { href: "/admin/quotes",  icon: FileText,         label: "Quotes" },
  { href: "/admin/orders",  icon: ShoppingBag,     label: "Orders" },
  { href: "/admin/clients", icon: Users,            label: "Clients" },
];

interface SidebarProps { role: "client" | "admin"; }

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : clientLinks;

  return (
    <aside className="relative w-60 shrink-0 min-h-screen border-r"
      style={{ backgroundColor: "#192030", borderColor: "rgba(148,163,184,0.12)" }}>
      <nav className="flex flex-col gap-0.5 p-3 pt-5">
        {links.map(({ href, icon: Icon, label, accent }) => {
          const isActive = href === "/dashboard" || href === "/admin"
            ? pathname === href
            : pathname.startsWith(href);

          if (accent && !isActive) {
            return (
              <Link key={href} href={href}>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150"
                  style={{ color: "#818cf8", background: "rgba(99,102,241,0.08)" }}>
                  <div className="flex h-5 w-5 items-center justify-center rounded-md"
                    style={{ background: "rgba(99,102,241,0.18)" }}>
                    <Icon className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                  {label}
                </div>
              </Link>
            );
          }

          return (
            <Link key={href} href={href}>
              <div className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive ? "sidebar-active text-[#f1f5f9]" : "text-[#64748b] hover:text-[#94a3b8] hover:bg-[#253448]"
              )}>
                <Icon className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-indigo-400" : "text-[#475569]"
                )} />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 w-60 p-3 border-t" style={{ borderColor: "rgba(148,163,184,0.08)" }}>
        <div className="rounded-lg px-3 py-2" style={{ background: "rgba(37,52,72,0.5)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#475569" }}>
            {role === "admin" ? "Admin Panel" : "Client Portal"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#334155" }}>v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
