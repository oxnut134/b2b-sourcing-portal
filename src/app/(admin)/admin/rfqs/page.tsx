import { db } from "@/db";
import { rfqs, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate, RFQ_STATUS_LABELS } from "@/lib/utils";
import { ClipboardList, ChevronRight, Clock, AlertCircle } from "lucide-react";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "violet" | "outline";
const rfqVariant: Record<string, BadgeVariant> = {
  submitted: "default", reviewing: "warning", quoted: "success", closed: "secondary", draft: "secondary",
};

export default async function AdminRFQsPage() {
  const rfqList = await db
    .select({
      id: rfqs.id,
      title: rfqs.title,
      category: rfqs.category,
      quantity: rfqs.quantity,
      unit: rfqs.unit,
      status: rfqs.status,
      createdAt: rfqs.createdAt,
      clientName: users.name,
      clientEmail: users.email,
      clientCompany: users.company,
    })
    .from(rfqs)
    .leftJoin(users, eq(rfqs.clientId, users.id))
    .orderBy(desc(rfqs.createdAt));

  const pending = rfqList.filter((r) => r.status === "submitted").length;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#f1f5f9]">RFQ Management</h1>
          <p className="text-sm text-[#94a3b8] mt-0.5">
            {rfqList.length} total · {pending} requiring action
          </p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">{pending} pending</span>
          </div>
        )}
      </div>

      {rfqList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[rgba(148,163,184,0.15)] border-dashed bg-[#253448]/30 py-20 text-center">
          <ClipboardList className="h-10 w-10 text-[#475569] mb-3" />
          <p className="text-sm text-[#94a3b8]">No RFQs yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rfqList.map((rfq) => (
            <Link key={rfq.id} href={`/admin/rfqs/${rfq.id}`}>
              <div className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-all duration-150 group ${
                rfq.status === "submitted"
                  ? "border-amber-500/20 bg-amber-950/10 hover:border-amber-500/30 hover:bg-amber-950/20"
                  : "border-[rgba(148,163,184,0.18)] bg-[#253448]/50 hover:border-[rgba(148,163,184,0.28)] hover:bg-[#2d3c52]"
              }`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <p className="text-sm font-medium text-[#e2e8f0] truncate group-hover:text-[#f1f5f9] transition-colors">
                      {rfq.title}
                    </p>
                    {rfq.status === "submitted" && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#64748b]">
                    <span className="text-[#94a3b8]">
                      {rfq.clientName || rfq.clientEmail}
                      {rfq.clientCompany && ` · ${rfq.clientCompany}`}
                    </span>
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
