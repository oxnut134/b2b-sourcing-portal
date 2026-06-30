"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const schema = z.object({
  unitPrice: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
    message: "Enter a valid price",
  }),
  leadTimeDays: z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, {
    message: "Must be a positive integer",
  }),
  validUntil: z.string().min(1, "Required"),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  rfqId: string;
  quantity: number;
  currency: string;
}

export function CreateQuoteForm({ rfqId, quantity, currency }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) as never });

  const unitPrice = watch("unitPrice");
  const total =
    unitPrice && !isNaN(parseFloat(unitPrice))
      ? formatCurrency((parseFloat(unitPrice) * quantity).toFixed(2), currency)
      : "—";

  async function onSubmit(data: FormData) {
    setError("");
    const totalPrice = (parseFloat(data.unitPrice) * quantity).toFixed(2);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rfqId,
        ...data,
        totalPrice,
        currency,
        leadTimeDays: parseInt(data.leadTimeDays, 10),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Failed to create quote");
      return;
    }

    router.refresh();
  }

  return (
    <Card className="border-indigo-500/20 bg-indigo-950/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/20">
            <Send className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <CardTitle>Create & Send Quote</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 animate-fade-in">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="unitPrice">Unit Price ({currency}) <span className="text-red-500">*</span></Label>
              <Input id="unitPrice" placeholder="12.50" {...register("unitPrice")} />
              {errors.unitPrice && <p className="text-xs text-red-400">{errors.unitPrice.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Total ({quantity} units)</Label>
              <div className="flex h-9 items-center rounded-lg border border-[rgba(148,163,184,0.18)] bg-[#253448]/50 px-3 text-sm font-semibold text-[#cbd5e1]">
                <Calculator className="h-3.5 w-3.5 text-[#64748b] mr-2" />
                {total}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="leadTimeDays">Lead Time (days) <span className="text-red-500">*</span></Label>
              <Input id="leadTimeDays" type="number" min={1} placeholder="30" {...register("leadTimeDays")} />
              {errors.leadTimeDays && <p className="text-xs text-red-400">{errors.leadTimeDays.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="validUntil">Valid Until <span className="text-red-500">*</span></Label>
              <Input id="validUntil" type="date" {...register("validUntil")} />
              {errors.validUntil && <p className="text-xs text-red-400">{errors.validUntil.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea id="terms" rows={2} placeholder="Payment terms, incoterms, warranty..." {...register("terms")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes for Client</Label>
            <Textarea id="notes" rows={2} placeholder="Any notes to accompany the quote..." {...register("notes")} />
          </div>

          <Button type="submit" variant="premium" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Quote to Client
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
