import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { rfqs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const createRFQSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(1),
  quantity: z.number().int().positive(),
  unit: z.string().default("pcs"),
  targetPrice: z.string().optional().transform(v => v === "" ? undefined : v),
  currency: z.string().default("USD"),
  deliveryDate: z.string().optional().transform(v => v === "" ? undefined : v),
  shippingAddress: z.string().optional().transform(v => v === "" ? undefined : v),
  notes: z.string().optional().transform(v => v === "" ? undefined : v),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.role === "admin";
  const rows = isAdmin
    ? await db.select().from(rfqs).orderBy(desc(rfqs.createdAt))
    : await db
        .select()
        .from(rfqs)
        .where(eq(rfqs.clientId, session.user.id))
        .orderBy(desc(rfqs.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createRFQSchema.parse(body);

    const [rfq] = await db
      .insert(rfqs)
      .values({
        ...data,
        clientId: session.user.id,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        status: "submitted",
      })
      .returning();

    return NextResponse.json(rfq, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
