import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  pgEnum,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";

// --- Enums ---
export const userRoleEnum = pgEnum("user_role", ["client", "admin"]);
export const rfqStatusEnum = pgEnum("rfq_status", [
  "draft",
  "submitted",
  "reviewing",
  "quoted",
  "closed",
]);
export const quoteStatusEnum = pgEnum("quote_status", [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

// --- NextAuth tables ---
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  role: userRoleEnum("role").default("client").notNull(),
  company: text("company"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// --- RFQ (Request for Quotation) ---
export const rfqs = pgTable("rfqs", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull().default("pcs"),
  targetPrice: decimal("target_price", { precision: 12, scale: 2 }),
  currency: text("currency").default("USD").notNull(),
  deliveryDate: timestamp("delivery_date", { mode: "date" }),
  shippingAddress: text("shipping_address"),
  attachments: text("attachments").array(),
  status: rfqStatusEnum("status").default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// --- Quotes ---
export const quotes = pgTable("quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  rfqId: uuid("rfq_id")
    .notNull()
    .references(() => rfqs.id, { onDelete: "cascade" }),
  adminId: text("admin_id")
    .notNull()
    .references(() => users.id),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  leadTimeDays: integer("lead_time_days").notNull(),
  validUntil: timestamp("valid_until", { mode: "date" }).notNull(),
  terms: text("terms"),
  notes: text("notes"),
  status: quoteStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// --- Orders ---
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  quoteId: uuid("quote_id")
    .notNull()
    .references(() => quotes.id),
  clientId: text("client_id")
    .notNull()
    .references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeCustomerId: text("stripe_customer_id"),
  status: orderStatusEnum("status").default("pending_payment").notNull(),
  shippingAddress: text("shipping_address"),
  trackingNumber: text("tracking_number"),
  carrier: text("carrier"),
  estimatedDelivery: timestamp("estimated_delivery", { mode: "date" }),
  paidAt: timestamp("paid_at", { mode: "date" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// --- Order status history ---
export const orderHistory = pgTable("order_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  note: text("note"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// --- Types ---
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RFQ = typeof rfqs.$inferSelect;
export type NewRFQ = typeof rfqs.$inferInsert;
export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
