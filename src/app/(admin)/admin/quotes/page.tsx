import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { rfqs, quotes, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, QUOTE_STATUS_LABELS } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "violet" | "outline";

const quoteStatusVariant: Record<string, BadgeVariant> = {
  sent: "default", accepted: "success", rejected: "destructive", expired: "secondary", draft: "secondary",
};

export default async function AdminQuotesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return null;

  const quoteList = await db
    .select({
      id: quotes.id,
      rfqId: quotes.rfqId,
      totalPrice: quotes.totalPrice,
      currency: quotes.currency,
      leadTimeDays: quotes.leadTimeDays,
      validUntil: quotes.validUntil,
      status: quotes.status,
      createdAt: quotes.createdAt,
      rfqTitle: rfqs.title,
      clientName: users.name,
      clientEmail: users.email,
    })
    .from(quotes)
    .innerJoin(rfqs, eq(quotes.rfqId, rfqs.id))
    .innerJoin(users, eq(rfqs.clientId, users.id))
    .orderBy(desc(quotes.createdAt));

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-up">
      <div>
        <h1 className="text-lg font-semibold text-[#f1f5f9]">Quote Management</h1>
        <p className="text-sm text-[#94a3b8] mt-0.5">All quotes sent to clients</p>
      </div>

      {quoteList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[rgba(148,163,184,0.15)] bg-[#253448]/30 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#253448] border border-[rgba(148,163,184,0.18)] mb-4">
            <FileText className="h-6 w-6 text-[#475569]" />
          </div>
          <p className="text-sm font-medium text-[#94a3b8] mb-1">No quotes yet</p>
          <p className="text-sm text-[#64748b] max-w-xs">
            Quotes sent to clients will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {quoteList.map((quote) => (
            <Link key={quote.id} href={`/admin/rfqs/${quote.rfqId}`}>
              <div className="group flex items-center gap-4 rounded-xl border border-[rgba(148,163,184,0.18)] bg-[#253448]/50 px-4 py-3.5 transition-all duration-150 hover:border-[rgba(148,163,184,0.28)] hover:bg-[#2d3c52]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#e2e8f0] truncate group-hover:text-[#f1f5f9]">
                    {quote.rfqTitle}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#64748b] mt-1">
                    <span className="text-[#94a3b8]">{quote.clientName ?? quote.clientEmail}</span>
                    <span className="font-medium text-[#94a3b8]">
                      {formatCurrency(quote.totalPrice, quote.currency)}
                    </span>
                    <span>Lead time: {quote.leadTimeDays}d</span>
                    <span>Valid until {formatDate(quote.validUntil)}</span>
                  </div>
                </div>
                <Badge variant={quoteStatusVariant[quote.status] ?? "secondary"}>
                  {QUOTE_STATUS_LABELS[quote.status]}
                </Badge>
                <ChevronRight className="h-4 w-4 text-[#475569] group-hover:text-[#94a3b8] shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
