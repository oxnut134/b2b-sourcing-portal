import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { rfqs, orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { FileText, ShoppingBag, CreditCard, Plus, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, RFQ_STATUS_LABELS } from "@/lib/utils";

type BV = "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "violet" | "outline";
const rfqV: Record<string, BV> = { submitted: "default", reviewing: "warning", quoted: "success", closed: "secondary", draft: "secondary" };
const orderV: Record<string, BV> = { pending_payment: "warning", paid: "info", processing: "default", shipped: "violet", delivered: "success", cancelled: "destructive" };

export default async function ClientDashboardPage() {
  const session = await getServerSession(authOptions);
  const clientId = session!.user.id;

  const [rfqList, orderList] = await Promise.all([
    db.select().from(rfqs).where(eq(rfqs.clientId, clientId)).orderBy(desc(rfqs.createdAt)).limit(5),
    db.select().from(orders).where(eq(orders.clientId, clientId)).orderBy(desc(orders.createdAt)).limit(5),
  ]);

  const pendingPayment = orderList.filter((o) => o.status === "pending_payment");
  const quoted = rfqList.filter((r) => r.status === "quoted");

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#f1f5f9] tracking-tight">
            Good morning, {session?.user.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-sm text-[#e2e8f0] mt-0.5">Here&apos;s your procurement overview</p>
        </div>
        <Link href="/rfq/new">
          <Button size="sm" className="gap-1.5 text-sm">
            <Plus className="h-3.5 w-3.5" />New RFQ
          </Button>
        </Link>
      </div>

      {/* Action alerts */}
      {(pendingPayment.length > 0 || quoted.length > 0) && (
        <div className="space-y-2">
          {pendingPayment.map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)" }}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="text-sm text-amber-300 font-medium">
                  Order #{o.id.slice(0, 8).toUpperCase()} awaiting payment —{" "}
                  <strong>{formatCurrency(o.totalAmount, o.currency)}</strong>
                </span>
              </div>
              <Link href={`/payment/${o.id}`}>
                <Button size="sm" className="h-7 text-xs">Pay now</Button>
              </Link>
            </div>
          ))}
          {quoted.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-sm text-emerald-300 font-medium">Quote ready for &quot;{r.title}&quot;</span>
              </div>
              <Link href={`/rfq/${r.id}`}>
                <Button variant="outline" size="sm" className="h-7 text-xs"
                  style={{ borderColor: "rgba(16,185,129,0.25)", color: "#6ee7b7" }}>
                  Review quote
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total RFQs",       value: rfqList.length,        icon: FileText,    color: "#6366f1", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.2)" },
          { label: "Orders",           value: orderList.length,      icon: ShoppingBag, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.18)" },
          { label: "Pending Payment",  value: pendingPayment.length, icon: CreditCard,  color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.18)" },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className="stat-card card-gradient rounded-xl">
            <div className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: bg, border: `1px solid ${border}` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#f1f5f9] leading-none tabular-nums">{value}</p>
                <p className="text-xs text-[#64748b] mt-0.5 font-medium">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lists */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent RFQs</CardTitle>
              <Link href="/rfq" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {rfqList.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3"
                  style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                  <FileText className="h-5 w-5 text-indigo-500" />
                </div>
                <p className="text-sm text-[#64748b] mb-3">No RFQs yet</p>
                <Link href="/rfq/new"><Button size="sm" variant="secondary">Submit first RFQ</Button></Link>
              </div>
            ) : (
              <div className="space-y-0.5">
                {rfqList.map((rfq) => (
                  <Link key={rfq.id} href={`/rfq/${rfq.id}`}>
                    <div className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[#2d3c52] transition-colors group cursor-pointer">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#94a3b8] truncate group-hover:text-[#f1f5f9] transition-colors">{rfq.title}</p>
                        <p className="text-xs text-[#64748b] mt-0.5">{rfq.category} · {formatDate(rfq.createdAt)}</p>
                      </div>
                      <Badge variant={rfqV[rfq.status] ?? "secondary"}>{RFQ_STATUS_LABELS[rfq.status]}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/orders" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {orderList.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3"
                  style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)" }}>
                  <ShoppingBag className="h-5 w-5 text-cyan-500" />
                </div>
                <p className="text-sm text-[#64748b]">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {orderList.map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[#2d3c52] transition-colors group cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-[#94a3b8] group-hover:text-[#f1f5f9] transition-colors font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-[#64748b] mt-0.5">{formatCurrency(order.totalAmount, order.currency)}</p>
                      </div>
                      <Badge variant={orderV[order.status] ?? "secondary"}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
