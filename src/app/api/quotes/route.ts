import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { quotes, rfqs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const createQuoteSchema = z.object({
  rfqId: z.string().uuid(),
  unitPrice: z.string(),
  totalPrice: z.string(),
  currency: z.string().default("USD"),
  leadTimeDays: z.number().int().positive(),
  validUntil: z.string(),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "admin") {
    const rows = await db
      .select()
      .from(quotes)
      .orderBy(desc(quotes.createdAt));
    return NextResponse.json(rows);
  }

  // Clients see only quotes for their RFQs
  const clientRFQs = await db
    .select({ id: rfqs.id })
    .from(rfqs)
    .where(eq(rfqs.clientId, session.user.id));

  const rfqIds = clientRFQs.map((r) => r.id);
  if (!rfqIds.length) return NextResponse.json([]);

  const rows = await db
    .select()
    .from(quotes)
    .where(eq(quotes.rfqId, rfqIds[0]))
    .orderBy(desc(quotes.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = createQuoteSchema.parse(body);

    const [quote] = await db
      .insert(quotes)
      .values({
        ...data,
        adminId: session.user.id,
        validUntil: new Date(data.validUntil),
        status: "sent",
      })
      .returning();

    // Update RFQ status
    await db
      .update(rfqs)
      .set({ status: "quoted", updatedAt: new Date() })
      .where(eq(rfqs.id, data.rfqId));

    return NextResponse.json(quote, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
