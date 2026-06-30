import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { rfqs, quotes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, RFQ_STATUS_LABELS, QUOTE_STATUS_LABELS } from "@/lib/utils";
import { AcceptQuoteButton } from "@/components/client/accept-quote-button";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "violet" | "outline";

const rfqStatusVariant: Record<string, BadgeVariant> = {
  submitted: "default", reviewing: "warning", quoted: "success", closed: "secondary",
};
const quoteStatusVariant: Record<string, BadgeVariant> = {
  sent: "default", accepted: "success", rejected: "destructive", expired: "secondary", draft: "secondary",
};

export default async function RFQDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const [rfq] = await db
    .select()
    .from(rfqs)
    .where(and(eq(rfqs.id, id), eq(rfqs.clientId, session!.user.id)))
    .limit(1);

  if (!rfq) notFound();

  const quoteList = await db.select().from(quotes).where(eq(quotes.rfqId, id));

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/rfq">
          <Button variant="ghost" size="icon-sm" className="mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-[#f1f5f9] truncate">{rfq.title}</h1>
            <Badge variant={rfqStatusVariant[rfq.status] ?? "secondary"}>
              {RFQ_STATUS_LABELS[rfq.status]}
            </Badge>
          </div>
          <p className="text-sm text-[#94a3b8] mt-0.5">
            Submitted {formatDate(rfq.createdAt)} · {rfq.category}
          </p>
        </div>
      </div>

      {/* RFQ Details */}
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Category</p>
              <p className="text-[#cbd5e1]">{rfq.category}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Quantity</p>
              <p className="text-[#cbd5e1]">{rfq.quantity} {rfq.unit}</p>
            </div>
            {rfq.targetPrice && (
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Target Price</p>
                <p className="text-[#cbd5e1]">{formatCurrency(rfq.targetPrice, rfq.currency)}</p>
              </div>
            )}
            {rfq.deliveryDate && (
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Required By</p>
                <p className="text-[#cbd5e1]">{formatDate(rfq.deliveryDate)}</p>
              </div>
            )}
            <div className="sm:col-span-2">
              <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Specifications</p>
              <p className="text-[#cbd5e1] whitespace-pre-wrap leading-relaxed">{rfq.description}</p>
            </div>
            {rfq.shippingAddress && (
              <div className="sm:col-span-2">
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Shipping Address</p>
                <p className="text-[#cbd5e1]">{rfq.shippingAddress}</p>
              </div>
            )}
            {rfq.notes && (
              <div className="sm:col-span-2">
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Notes</p>
                <p className="text-[#cbd5e1]">{rfq.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status info */}
      {(rfq.status === "submitted" || rfq.status === "reviewing") && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/8 px-5 py-4 flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/20">
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-300">
              {rfq.status === "submitted" ? "RFQ submitted successfully" : "Under review"}
            </p>
            <p className="text-sm text-indigo-400/70 mt-0.5">
              Our procurement team is evaluating your request. You&apos;ll receive a quote within 1–2 business days.
            </p>
          </div>
        </div>
      )}

      {/* Quotes */}
      {quoteList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-[#f1f5f9]">
              {quoteList.length} Quote{quoteList.length > 1 ? "s" : ""} Received
            </h2>
          </div>

          {quoteList.map((quote) => (
            <Card
              key={quote.id}
              className={quote.status === "accepted" ? "border-emerald-500/25 bg-emerald-950/10" : ""}
            >
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xl font-bold text-[#f1f5f9] tracking-tight">
                      {formatCurrency(quote.totalPrice, quote.currency)}
                    </p>
                    <p className="text-sm text-[#94a3b8] mt-0.5">
                      {formatCurrency(quote.unitPrice, quote.currency)} / unit × {rfq.quantity} {rfq.unit}
                    </p>
                  </div>
                  <Badge variant={quoteStatusVariant[quote.status] ?? "secondary"}>
                    {QUOTE_STATUS_LABELS[quote.status]}
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Lead Time</p>
                    <p className="text-sm text-[#cbd5e1] font-medium">{quote.leadTimeDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Valid Until</p>
                    <p className="text-sm text-[#cbd5e1] font-medium">{formatDate(quote.validUntil)}</p>
                  </div>
                  {quote.terms && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Terms</p>
                      <p className="text-sm text-[#94a3b8]">{quote.terms}</p>
                    </div>
                  )}
                  {quote.notes && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Notes</p>
                      <p className="text-sm text-[#94a3b8]">{quote.notes}</p>
                    </div>
                  )}
                </div>

                {quote.status === "sent" && <AcceptQuoteButton quoteId={quote.id} />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
