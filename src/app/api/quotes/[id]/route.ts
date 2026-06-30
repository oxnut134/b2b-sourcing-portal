import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { quotes, rfqs, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "accept") {
    // Client accepts a quote -> create order
    const [updatedQuote] = await db
      .update(quotes)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();

    const [order] = await db
      .insert(orders)
      .values({
        id: randomUUID(),
        quoteId: quote.id,
        clientId: session.user.id,
        totalAmount: quote.totalPrice,
        currency: quote.currency,
        status: "pending_payment",
      })
      .returning();

    return NextResponse.json({ quote: updatedQuote, order });
  }

  if (action === "reject") {
    const [updatedQuote] = await db
      .update(quotes)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    return NextResponse.json(updatedQuote);
  }

  // Generic update (admin)
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [updated] = await db
    .update(quotes)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(quotes.id, id))
    .returning();

  return NextResponse.json(updated);
}
