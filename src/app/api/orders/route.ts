import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.role === "admin";
  const rows = isAdmin
    ? await db.select().from(orders).orderBy(desc(orders.createdAt))
    : await db
        .select()
        .from(orders)
        .where(eq(orders.clientId, session.user.id))
        .orderBy(desc(orders.createdAt));

  return NextResponse.json(rows);
}
