import { db } from "@/db";
import { rfqs, quotes, orders, users } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import Link from "next/link";
import { Users, FileText, ShoppingBag, TrendingUp, ChevronRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, RFQ_STATUS_LABELS } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "violet" | "outline";
const rfqVariant: Record<string, BadgeVariant> = {
  submitted: "default", reviewing: "warning", quoted: "success", closed: "secondary",
};
const orderVariant: Record<string, BadgeVariant> = {
  pending_payment: "warning", paid: "info", processing: "default",
  shipped: "violet", delivered: "success", cancelled: "destructive",
};

export default async function AdminDashboardPage() {
  const [
    totalClients,
    totalRFQs,
    totalOrders,
    recentRFQs,
    recentOrders,
  ] = await Promise.all([
    db.select({ count: count() }).from(users).where(eq(users.role, "client")),
    db.select({ count: count() }).from(rfqs),
    db.select({ count: count() }).from(orders),
    db.select().from(rfqs).orderBy(desc(rfqs.createdAt)).limit(6),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
  ]);

  const pendingRFQs = recentRFQs.filter((r) => r.status === "submitted").length;
  const pendingPayments = recentOrders.filter((o) => o.status === "pending_payment").length;

  const stats = [
    {
      label: "Total Clients",
      value: totalClients[0].count,
      icon: Users,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      href: "/admin/clients",
    },
    {
      label: "Total RFQs",
      value: totalRFQs[0].count,
      icon: FileText,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      href: "/admin/rfqs",
      badge: pendingRFQs > 0 ? `${pendingRFQs} pending` : null,
    },
    {
      label: "Total Orders",
      value: totalOrders[0].count,
      icon: ShoppingBag,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      href: "/admin/orders",
      badge: pendingPayments > 0 ? `${pendingPayments} unpaid` : null,
    },
    {
      label: "Active This Week",
      value: recentRFQs.filter((r) => r.status !== "closed").length,
      icon: TrendingUp,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-lg font-semibold text-[#f1f5f9]">Admin Dashboard</h1>
        <p className="text-sm text-[#94a3b8] mt-0.5">Platform overview and activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, border, href, badge }) => (
          <Card key={label} glow className="group">
            <CardContent className="py-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} border ${border}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                {href && (
                  <Link href={href}>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#475569] group-hover:text-[#94a3b8] transition-colors" />
                  </Link>
                )}
              </div>
              <p className="text-2xl font-bold text-[#f1f5f9] leading-none">{value}</p>
              <p className="text-xs text-[#94a3b8] mt-1">{label}</p>
              {badge && (
                <div className="mt-2">
                  <Badge variant="warning">{badge}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent RFQs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent RFQs</CardTitle>
              <Link href="/admin/rfqs" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentRFQs.map((rfq) => (
                <Link key={rfq.id} href={`/admin/rfqs/${rfq.id}`}>
                  <div className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[#2d3c52] transition-colors group">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#cbd5e1] truncate group-hover:text-[#f1f5f9] transition-colors">
                        {rfq.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-[#64748b]">{formatDate(rfq.createdAt)}</p>
                        {rfq.status === "submitted" && (
                          <span className="text-xs text-amber-400 font-medium">· Action required</span>
                        )}
                      </div>
                    </div>
                    <Badge variant={rfqVariant[rfq.status] ?? "secondary"}>
                      {RFQ_STATUS_LABELS[rfq.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}>
                  <div className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[#2d3c52] transition-colors group">
                    <div>
                      <p className="text-sm font-medium text-[#cbd5e1] font-mono group-hover:text-[#f1f5f9] transition-colors">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </p>
                    </div>
                    <Badge variant={orderVariant[order.status] ?? "secondary"}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
