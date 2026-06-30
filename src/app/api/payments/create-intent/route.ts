import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe-server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await req.json();

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.clientId, session.user.id)))
    .limit(1);

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "pending_payment") {
    return NextResponse.json({ error: "Order not payable" }, { status: 400 });
  }

  const amount = Math.round(parseFloat(order.totalAmount) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: order.currency.toLowerCase(),
    metadata: {
      orderId: order.id,
      clientId: session.user.id,
    },
  });

  await db
    .update(orders)
    .set({ stripePaymentIntentId: paymentIntent.id, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
