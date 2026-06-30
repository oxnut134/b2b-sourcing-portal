import { db } from "@/db";
import { orders, orderHistory, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";
import { UpdateOrderForm } from "@/components/admin/update-order-form";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "violet" | "outline";
const statusVariant: Record<string, BadgeVariant> = {
  pending_payment: "warning", paid: "info", processing: "default",
  shipped: "violet", delivered: "success", cancelled: "destructive",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [row] = await db
    .select({
      order: orders,
      clientName: users.name,
      clientEmail: users.email,
      clientCompany: users.company,
    })
    .from(orders)
    .leftJoin(users, eq(orders.clientId, users.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!row) notFound();
  const { order, clientName, clientEmail, clientCompany } = row;

  const history = await db
    .select()
    .from(orderHistory)
    .where(eq(orderHistory.orderId, id));

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon-sm" className="mt-0.5">
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
          <p className="text-sm text-[#94a3b8] mt-0.5">
            {clientName ?? clientEmail}
            {clientCompany && ` · ${clientCompany}`}
            {" · "}{formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Details */}
      <Card>
        <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Total Amount</p>
              <p className="text-xl font-bold text-[#f1f5f9]">{formatCurrency(order.totalAmount, order.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Client</p>
              <p className="text-sm text-[#cbd5e1]">{clientName}</p>
              <p className="text-sm text-[#94a3b8]">{clientEmail}</p>
            </div>
            {order.paidAt && (
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Paid On</p>
                <p className="text-sm text-[#cbd5e1]">{formatDate(order.paidAt)}</p>
              </div>
            )}
            {order.stripePaymentIntentId && (
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Stripe PI</p>
                <p className="text-sm text-[#94a3b8] font-mono truncate">{order.stripePaymentIntentId}</p>
              </div>
            )}
            {order.trackingNumber && (
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Tracking</p>
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
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Ship To</p>
                <p className="text-sm text-[#cbd5e1]">{order.shippingAddress}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <UpdateOrderForm
        orderId={order.id}
        currentStatus={order.status}
        currentTracking={order.trackingNumber ?? ""}
        currentCarrier={order.carrier ?? ""}
      />

      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Status History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.map((h, i) => (
                <div key={h.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#253448] border border-[rgba(148,163,184,0.18)]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#94a3b8]" />
                    </div>
                    {i < history.length - 1 && <div className="w-px flex-1 mt-1.5 bg-[rgba(148,163,184,0.12)]" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-[#cbd5e1]">{ORDER_STATUS_LABELS[h.status]}</p>
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
