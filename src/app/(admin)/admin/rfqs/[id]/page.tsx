import { db } from "@/db";
import { rfqs, quotes, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, RFQ_STATUS_LABELS, QUOTE_STATUS_LABELS } from "@/lib/utils";
import { CreateQuoteForm } from "@/components/admin/create-quote-form";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "violet" | "outline";
const rfqVariant: Record<string, BadgeVariant> = {
  submitted: "default", reviewing: "warning", quoted: "success", closed: "secondary",
};
const quoteVariant: Record<string, BadgeVariant> = {
  sent: "default", accepted: "success", rejected: "destructive", expired: "secondary", draft: "secondary",
};

export default async function AdminRFQDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [row] = await db
    .select({
      rfq: rfqs,
      client: { name: users.name, email: users.email, company: users.company },
    })
    .from(rfqs)
    .leftJoin(users, eq(rfqs.clientId, users.id))
    .where(eq(rfqs.id, id))
    .limit(1);

  if (!row) notFound();
  const { rfq, client } = row;

  const quoteList = await db.select().from(quotes).where(eq(quotes.rfqId, id));

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/admin/rfqs">
          <Button variant="ghost" size="icon-sm" className="mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-[#f1f5f9] truncate">{rfq.title}</h1>
            <Badge variant={rfqVariant[rfq.status] ?? "secondary"}>
              {RFQ_STATUS_LABELS[rfq.status]}
            </Badge>
          </div>
          <p className="text-sm text-[#94a3b8] mt-0.5">
            {client?.name ?? client?.email}
            {client?.company && ` · ${client.company}`}
            {" · "}{formatDate(rfq.createdAt)}
          </p>
        </div>
      </div>

      {/* Client + RFQ details */}
      <Card>
        <CardHeader><CardTitle>Request Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Client</p>
              <p className="text-[#cbd5e1]">{client?.name}</p>
              <p className="text-sm text-[#94a3b8]">{client?.email}</p>
              {client?.company && <p className="text-sm text-[#64748b]">{client.company}</p>}
            </div>
            <div>
              <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Quantity</p>
              <p className="text-[#cbd5e1] font-medium">{rfq.quantity} {rfq.unit}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Category</p>
              <p className="text-[#cbd5e1]">{rfq.category}</p>
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
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Ship To</p>
                <p className="text-[#cbd5e1]">{rfq.shippingAddress}</p>
              </div>
            )}
            {rfq.notes && (
              <div className="sm:col-span-2">
                <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium mb-1">Notes</p>
                <p className="text-[#94a3b8]">{rfq.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing quotes */}
      {quoteList.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#cbd5e1]">Quotes Sent ({quoteList.length})</h2>
          {quoteList.map((q) => (
            <Card key={q.id} className={q.status === "accepted" ? "border-emerald-500/20" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xl font-bold text-[#f1f5f9]">{formatCurrency(q.totalPrice, q.currency)}</p>
                    <p className="text-sm text-[#94a3b8] mt-0.5">
                      {formatCurrency(q.unitPrice, q.currency)} / unit · {q.leadTimeDays} days lead time · Valid until {formatDate(q.validUntil)}
                    </p>
                  </div>
                  <Badge variant={quoteVariant[q.status] ?? "secondary"}>
                    {QUOTE_STATUS_LABELS[q.status]}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create quote form */}
      {rfq.status !== "closed" && rfq.status !== "quoted" && (
        <CreateQuoteForm
          rfqId={id}
          quantity={rfq.quantity}
          currency={rfq.currency}
        />
      )}
    </div>
  );
}
