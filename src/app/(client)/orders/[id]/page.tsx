import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderHistory } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Circle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";

const STATUS_STEPS = ["pending_payment", "paid", "processing", "shipped", "delivered"] as const;

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "violet" | "outline";
const statusVariant: Record<string, BadgeVariant> = {
  pending_payment: "warning", paid: "info", processing: "default",
  shipped: "violet", delivered: "success", cancelled: "destructive",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.clientId, session!.user.id)))
    .limit(1);

  if (!order) notFound();

  const history = await db
    .select()
    .from(orderHistory)
    .where(eq(orderHistory.orderId, id));

  const currentStep = STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]);

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/orders">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-[#f1f5f9] font-mono">
              #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <Badge variant={statusVariant[order.status] ?? "secondary"}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className="text-sm text-[#94a3b8] mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Pending payment alert */}
      {order.status === "pending_payment" && (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/8 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm text-amber-300 font-medium">
              Payment required · {formatCurrency(order.totalAmount, order.currency)}
            </span>
          </div>
          <Link href={`/payment/${order.id}`}>
            <Button size="sm" className="gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Pay now
            </Button>
          </Link>
        </div>
      )}

      {/* Progress tracker */}
      {order.status !== "cancelled" && (
        <Card>
          <CardHeader><CardTitle>Shipment Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-start gap-0">
              {STATUS_STEPS.map((step, idx) => {
                const done = idx <= currentStep;
                const active = idx === currentStep;
                const isLast = idx === STATUS_STEPS.length - 1;
                return (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all z-10 ${
                        done
                          ? active
                            ? "border-indigo-500 bg-indigo-500 shadow-lg shadow-indigo-500/30"
                            : "border-emerald-600 bg-emerald-600"
                          : "border-[rgba(148,163,184,0.25)] bg-[#253448]"
                      }`}>
                        {done && !active ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <Circle className={`h-3 w-3 ${active ? "text-white fill-white" : "text-[#475569]"}`} />
                        )}
                      </div>
                      {!isLast && (
                        <div className={`h-0.5 flex-1 transition-all ${
                          idx < currentStep ? "bg-emerald-600" : "bg-[rgba(148,163,184,0.15)]"
                        }`} />
                      )}
                    </div>
                    <p className={`mt-2 text-xs text-center font-medium transition-colors ${
                      active ? "text-indigo-400" : done ? "text-[#94a3b8]" : "text-[#475569]"
                    }`}>
                      {ORDER_STATUS_LABELS[step]}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details */}
      <Card>
        <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Total Amount</p>
              <p className="text-xl font-bold text-[#f1f5f9]">{formatCurrency(order.totalAmount, order.currency)}</p>
            </div>
            {order.paidAt && (
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Paid On</p>
                <p className="text-sm text-[#cbd5e1]">{formatDate(order.paidAt)}</p>
              </div>
            )}
            {order.trackingNumber && (
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Tracking Number</p>
                <p className="text-sm text-[#cbd5e1] font-mono">{order.trackingNumber}</p>
              </div>
            )}
            {order.carrier && (
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Carrier</p>
                <p className="text-sm text-[#cbd5e1]">{order.carrier}</p>
              </div>
            )}
            {order.estimatedDelivery && (
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Est. Delivery</p>
                <p className="text-sm text-[#cbd5e1]">{formatDate(order.estimatedDelivery)}</p>
              </div>
            )}
            {order.shippingAddress && (
              <div className="sm:col-span-2">
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Shipping Address</p>
                <p className="text-sm text-[#cbd5e1]">{order.shippingAddress}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Activity Log</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.map((h, i) => (
                <div key={h.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    </div>
                    {i < history.length - 1 && (
                      <div className="w-px flex-1 mt-1.5 bg-[rgba(148,163,184,0.12)]" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-[#cbd5e1]">
                      {ORDER_STATUS_LABELS[h.status]}
                    </p>
                    {h.note && <p className="text-sm text-[#64748b] mt-0.5">{h.note}</p>}
                    <p className="text-xs text-[#475569] mt-1">{formatDate(h.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
