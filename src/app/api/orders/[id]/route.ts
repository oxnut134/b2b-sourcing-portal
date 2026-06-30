import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderHistory } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const isAdmin = session.user.role === "admin";

  const [order] = await db
    .select()
    .from(orders)
    .where(
      isAdmin
        ? eq(orders.id, id)
        : and(eq(orders.id, id), eq(orders.clientId, session.user.id))
    )
    .limit(1);

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const history = await db
    .select()
    .from(orderHistory)
    .where(eq(orderHistory.orderId, id));

  return NextResponse.json({ ...order, history });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, note, trackingNumber, carrier, estimatedDelivery } = body;

  const [updated] = await db
    .update(orders)
    .set({
      status,
      trackingNumber,
      carrier,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.insert(orderHistory).values({
    id: randomUUID(),
    orderId: id,
    status,
    note,
    createdBy: session.user.id,
  });

  return NextResponse.json(updated);
}
