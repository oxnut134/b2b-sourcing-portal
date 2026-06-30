import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { PaymentForm } from "@/components/client/payment-form";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const session = await getServerSession(authOptions);

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.clientId, session!.user.id)))
    .limit(1);

  if (!order) notFound();
  if (order.status !== "pending_payment") redirect(`/orders/${orderId}`);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Complete Payment</h1>
        <p className="text-sm text-[#94a3b8] mt-1">
          Order #{order.id.slice(0, 8).toUpperCase()} —{" "}
          <span className="font-semibold text-[#f1f5f9]">
            {formatCurrency(order.totalAmount, order.currency)}
          </span>
        </p>
      </div>

      <PaymentForm
        orderId={order.id}
        amount={order.totalAmount}
        currency={order.currency}
      />
    </div>
  );
}
