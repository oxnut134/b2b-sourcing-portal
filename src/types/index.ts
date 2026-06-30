import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "client" | "admin";
      company?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    company?: string;
  }
}

export type UserRole = "client" | "admin";

export type RFQStatus = "draft" | "submitted" | "reviewing" | "quoted" | "closed";
export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
