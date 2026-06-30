import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { rfqs } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const isAdmin = session.user.role === "admin";

  const [rfq] = await db
    .select()
    .from(rfqs)
    .where(
      isAdmin
        ? eq(rfqs.id, id)
        : and(eq(rfqs.id, id), eq(rfqs.clientId, session.user.id))
    )
    .limit(1);

  if (!rfq) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rfq);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const isAdmin = session.user.role === "admin";
  const body = await req.json();

  const [updated] = await db
    .update(rfqs)
    .set({ ...body, updatedAt: new Date() })
    .where(
      isAdmin
        ? eq(rfqs.id, id)
        : and(eq(rfqs.id, id), eq(rfqs.clientId, session.user.id))
    )
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
