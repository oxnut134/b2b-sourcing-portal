"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, XCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AcceptQuoteButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  async function handleAction(action: "accept" | "reject") {
    setLoading(action);
    const res = await fetch(`/api/quotes/${quoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      const data = await res.json();
      if (action === "accept" && data.order) {
        router.push(`/payment/${data.order.id}`);
      } else {
        router.refresh();
      }
    }
    setLoading(null);
  }

  return (
    <div className="flex gap-2.5 pt-4 border-t border-[rgba(148,163,184,0.12)]">
      <Button
        onClick={() => handleAction("accept")}
        disabled={!!loading}
        variant="premium"
        className="gap-2"
      >
        {loading === "accept" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        Accept & Pay
      </Button>
      <Button
        variant="outline"
        onClick={() => handleAction("reject")}
        disabled={!!loading}
        className="gap-2 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300"
      >
        {loading === "reject" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        Decline
      </Button>
    </div>
  );
}
