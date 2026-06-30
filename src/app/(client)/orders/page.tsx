import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";
import { ShoppingBag, ChevronRight, Clock } from "lucide-react";
import { PayNowButton } from "@/components/client/pay-now-button";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "violet" | "outline";

const statusVariant: Record<string, BadgeVariant> = {
  pending_payment: "warning",
  paid: "info",
  processing: "default",
  shipped: "violet",
  delivered: "success",
  cancelled: "destructive",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const orderList = await db
    .select()
    .from(orders)
    .where(eq(orders.clientId, session!.user.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-lg font-semibold text-[#f1f5f9]">Orders</h1>
        <p className="text-sm text-[#94a3b8] mt-0.5">{orderList.length} order{orderList.length !== 1 ? "s" : ""} total</p>
      </div>

      {orderList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[rgba(148,163,184,0.15)] border-dashed bg-[#253448]/30 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#253448] border border-[rgba(148,163,184,0.18)] mb-4">
            <ShoppingBag className="h-6 w-6 text-[#475569]" />
          </div>
          <p className="text-sm font-medium text-[#94a3b8] mb-1">No orders yet</p>
          <p className="text-sm text-[#64748b] max-w-xs mb-6">
            Accept a quote to place your first order.
          </p>
          <Link href="/rfq/new">
            <Button size="sm" variant="premium">Submit an RFQ</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {orderList.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="flex items-center justify-between rounded-xl border border-[rgba(148,163,184,0.18)] bg-[#253448]/50 px-5 py-4 hover:border-[rgba(148,163,184,0.28)] hover:bg-[#2d3c52] transition-all duration-150 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <p className="text-sm font-medium text-[#e2e8f0] font-mono group-hover:text-[#f1f5f9] transition-colors">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    {order.status === "pending_payment" && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#64748b]">
                    <span className="font-medium text-[#94a3b8]">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(order.createdAt)}
                    </span>
                    {order.trackingNumber && (
                      <span>Track: {order.trackingNumber}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {order.status === "pending_payment" && (
                    <PayNowButton orderId={order.id} />
                  )}
                  <Badge variant={statusVariant[order.status] ?? "secondary"}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-[#475569] group-hover:text-[#94a3b8] transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
