import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";
import { ShoppingBag, ChevronRight, Clock } from "lucide-react";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "violet" | "outline";
const statusVariant: Record<string, BadgeVariant> = {
  pending_payment: "warning", paid: "info", processing: "default",
  shipped: "violet", delivered: "success", cancelled: "destructive",
};

export default async function AdminOrdersPage() {
  const orderList = await db
    .select({
      id: orders.id,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      status: orders.status,
      trackingNumber: orders.trackingNumber,
      createdAt: orders.createdAt,
      paidAt: orders.paidAt,
      clientName: users.name,
      clientEmail: users.email,
      clientCompany: users.company,
    })
    .from(orders)
    .leftJoin(users, eq(orders.clientId, users.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-lg font-semibold text-[#f1f5f9]">Order Management</h1>
        <p className="text-sm text-[#94a3b8] mt-0.5">{orderList.length} total orders</p>
      </div>

      {orderList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[rgba(148,163,184,0.15)] border-dashed bg-[#253448]/30 py-20 text-center">
          <ShoppingBag className="h-10 w-10 text-[#475569] mb-3" />
          <p className="text-sm text-[#94a3b8]">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orderList.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`}>
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
                    <span className="text-[#94a3b8]">
                      {order.clientName ?? order.clientEmail}
                      {order.clientCompany && ` · ${order.clientCompany}`}
                    </span>
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
