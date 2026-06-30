"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDER_STATUS_LABELS } from "@/lib/utils";

const ORDER_STATUSES = [
  "pending_payment", "paid", "processing", "shipped", "delivered", "cancelled",
] as const;

interface Props {
  orderId: string;
  currentStatus: string;
  currentTracking: string;
  currentCarrier: string;
}

export function UpdateOrderForm({ orderId, currentStatus, currentTracking, currentCarrier }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(currentTracking);
  const [carrier, setCarrier] = useState(currentCarrier);
  const [note, setNote] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        trackingNumber: tracking || undefined,
        carrier: carrier || undefined,
        estimatedDelivery: estimatedDelivery || undefined,
        note: note || undefined,
      }),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setNote("");
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <Card className="border-[rgba(148,163,184,0.18)] bg-[#253448]/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2d3c52] border border-[rgba(148,163,184,0.18)]">
            <RefreshCw className="h-3.5 w-3.5 text-[#94a3b8]" />
          </div>
          <CardTitle>Update Order</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400 animate-fade-in">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Order updated successfully
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="1Z999AA10123456784"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="carrier">Carrier</Label>
              <Input
                id="carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="UPS, FedEx, DHL…"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
            <Input
              id="estimatedDelivery"
              type="date"
              lang="en"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Status Note</Label>
            <Textarea
              id="note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for update, additional context…"
            />
          </div>

          <Button type="submit" variant="secondary" disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Update Order
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
