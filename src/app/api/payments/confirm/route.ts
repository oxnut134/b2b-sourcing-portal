import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderHistory } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe-server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId, paymentIntentId } = await req.json();

  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (pi.status !== "succeeded") {
    return NextResponse.json({ error: "Payment not succeeded" }, { status: 400 });
  }

  if (pi.metadata?.orderId !== orderId) {
    return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
  }

  await db
    .update(orders)
    .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.clientId, session.user.id)));

  await db.insert(orderHistory).values({
    id: randomUUID(),
    orderId,
    status: "paid",
    note: "Payment confirmed via Stripe",
  });

  return NextResponse.json({ success: true });
}
