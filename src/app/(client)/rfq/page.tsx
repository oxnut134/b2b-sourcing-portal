import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { rfqs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Plus, FileText, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, RFQ_STATUS_LABELS } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "violet" | "outline";

const rfqVariant: Record<string, BadgeVariant> = {
  submitted: "default",
  reviewing: "warning",
  quoted: "success",
  closed: "secondary",
  draft: "secondary",
};

export default async function RFQListPage() {
  const session = await getServerSession(authOptions);
  const rfqList = await db
    .select()
    .from(rfqs)
    .where(eq(rfqs.clientId, session!.user.id))
    .orderBy(desc(rfqs.createdAt));

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#f1f5f9]">My RFQs</h1>
          <p className="text-sm text-[#94a3b8] mt-0.5">{rfqList.length} request{rfqList.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link href="/rfq/new">
          <Button size="sm" variant="premium" className="gap-2">
            <Plus className="h-3.5 w-3.5" />
            New RFQ
          </Button>
        </Link>
      </div>

      {rfqList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[rgba(148,163,184,0.15)] border-dashed bg-[#253448]/30 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#253448] border border-[rgba(148,163,184,0.18)] mb-4">
            <FileText className="h-6 w-6 text-[#475569]" />
          </div>
          <p className="text-sm font-medium text-[#94a3b8] mb-1">No RFQs yet</p>
          <p className="text-sm text-[#64748b] max-w-xs mb-6">
            Submit your first request for quotation and receive competitive supplier bids within 48 hours.
          </p>
          <Link href="/rfq/new">
            <Button size="sm" variant="premium">Submit first RFQ</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rfqList.map((rfq) => (
            <Link key={rfq.id} href={`/rfq/${rfq.id}`}>
              <div className="flex items-center justify-between rounded-xl border border-[rgba(148,163,184,0.18)] bg-[#253448]/50 px-5 py-4 hover:border-[rgba(148,163,184,0.28)] hover:bg-[#2d3c52] transition-all duration-150 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <p className="text-sm font-medium text-[#e2e8f0] truncate group-hover:text-[#f1f5f9] transition-colors">
                      {rfq.title}
                    </p>
                    {rfq.status === "quoted" && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#64748b]">
                    <span>{rfq.category}</span>
                    <span>Qty: {rfq.quantity} {rfq.unit}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(rfq.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <Badge variant={rfqVariant[rfq.status] ?? "secondary"}>
                    {RFQ_STATUS_LABELS[rfq.status]}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-[#475569] group-hover:text-[#94a3b8] transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
