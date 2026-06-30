import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import * as schema from "./schema";

const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "admin1234";
const ADMIN_NAME     = process.env.SEED_ADMIN_NAME     ?? "Admin";

const DEMO_EMAIL    = "demo@example.com";
const DEMO_PASSWORD = "demo2026";
const DEMO_NAME     = "Demo User";

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // --- Admin user ---
  let [admin] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, ADMIN_EMAIL))
    .limit(1);

  if (!admin) {
    const adminId = randomUUID();
    await db.insert(schema.users).values({
      id: adminId,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: await hash(ADMIN_PASSWORD, 12),
      role: "admin",
    });
    admin = { id: adminId };
    console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
  }

  // --- Demo user ---
  const [existingDemo] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, DEMO_EMAIL))
    .limit(1);

  if (existingDemo) {
    console.log(`Demo user already exists: ${DEMO_EMAIL}`);
    await pool.end();
    return;
  }

  const demoId = randomUUID();
  await db.insert(schema.users).values({
    id: demoId,
    name: DEMO_NAME,
    email: DEMO_EMAIL,
    password: await hash(DEMO_PASSWORD, 12),
    role: "client",
    company: "Acme Manufacturing Co.",
    phone: "+1 312 555 0100",
  });
  console.log(`Demo user created: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);

  // --- Sample RFQ (status: quoted) ---
  const rfqId = randomUUID();
  await db.insert(schema.rfqs).values({
    id: rfqId,
    clientId: demoId,
    title: "Industrial Fasteners – Bulk Order",
    description:
      "M8x25mm stainless steel hex bolts with matching nuts and washers for our assembly line. Require ASTM A193 B8 certification and full material traceability.",
    category: "Hardware & Fasteners",
    quantity: 5000,
    unit: "pcs",
    targetPrice: "0.80",
    currency: "USD",
    deliveryDate: new Date("2026-08-15"),
    shippingAddress: "123 Factory Lane, Chicago, IL 60601, USA",
    status: "quoted",
    notes: "Prefer vendors with ISO 9001 certification.",
  });

  // --- Sample Quote (status: sent) ---
  const quoteId = randomUUID();
  await db.insert(schema.quotes).values({
    id: quoteId,
    rfqId,
    adminId: admin.id,
    unitPrice: "0.85",
    totalPrice: "4250.00",
    currency: "USD",
    leadTimeDays: 14,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    terms: "Net 30. FOB origin. Price firm for 30 days.",
    notes: "Grade 304 stainless steel. ASTM A193 B8 certified. Full MTR included.",
    status: "sent",
  });

  // --- Sample Order (status: pending_payment) ---
  await db.insert(schema.orders).values({
    id: randomUUID(),
    quoteId,
    clientId: demoId,
    totalAmount: "4250.00",
    currency: "USD",
    status: "pending_payment",
    shippingAddress: "123 Factory Lane, Chicago, IL 60601, USA",
  });

  // --- Second RFQ (status: reviewing) ---
  await db.insert(schema.rfqs).values({
    id: randomUUID(),
    clientId: demoId,
    title: "CNC Machined Aluminum Brackets",
    description:
      "Custom 6061-T6 aluminum mounting brackets per attached drawing. Tolerances ±0.05 mm. Anodized finish (black, Type III).",
    category: "Machined Parts",
    quantity: 200,
    unit: "pcs",
    targetPrice: "18.00",
    currency: "USD",
    deliveryDate: new Date("2026-09-01"),
    shippingAddress: "123 Factory Lane, Chicago, IL 60601, USA",
    status: "reviewing",
  });

  console.log("Demo seed complete.");
  await pool.end();
}

seed().catch((e) => { console.error(e); process.exit(1); });
