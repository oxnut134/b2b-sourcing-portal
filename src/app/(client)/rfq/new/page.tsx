"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, Send, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Please describe your requirements in detail"),
  category: z.string().min(1, "Select a category"),
  quantity: z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, {
    message: "Quantity must be a positive integer",
  }),
  unit: z.string(),
  targetPrice: z.string().optional(),
  currency: z.string(),
  deliveryDate: z.string().optional(),
  shippingAddress: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = [
  "Electronics", "Mechanical Parts", "Raw Materials",
  "Packaging", "Chemicals", "Textiles", "Food & Beverage", "Other",
];

export default function NewRFQPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { unit: "pcs", currency: "USD" },
  });

  async function onSubmit(data: FormData) {
    setServerError("");
    const res = await fetch("/api/rfq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, quantity: parseInt(data.quantity, 10) }),
    });

    if (!res.ok) {
      const err = await res.json();
      setServerError(err.error ?? "Failed to submit RFQ");
      return;
    }

    const rfq = await res.json();
    router.push(`/rfq/${rfq.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/rfq">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-[#f1f5f9]">New Request for Quotation</h1>
          <p className="text-sm text-[#e2e8f0] mt-0.5">
            Fill in your requirements. We&apos;ll send competitive quotes within 48h.
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 text-sm text-[#64748b]">
        <span className="text-indigo-400 font-medium">RFQ Details</span>
        <ChevronRight className="h-3 w-3" />
        <span>Review</span>
        <ChevronRight className="h-3 w-3" />
        <span>Quote</span>
        <ChevronRight className="h-3 w-3" />
        <span>Payment</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sourcing Requirements</CardTitle>
          <CardDescription className="text-[#e2e8f0]">Be as specific as possible to receive accurate quotes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 animate-fade-in">
                {serverError}
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="e.g. Custom PCB Boards — 500 units"
                {...register("title")}
              />
              {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Specifications <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Detailed specifications, materials, dimensions, tolerances, quality requirements, certifications needed..."
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
            </div>

            {/* Category + Qty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category <span className="text-red-500">*</span></Label>
                <Select onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-400">{errors.category.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    placeholder="500"
                    className="flex-1"
                    {...register("quantity")}
                  />
                  <Select defaultValue="pcs" onValueChange={(v) => setValue("unit", v)}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["pcs", "kg", "m", "m²", "L", "set"].map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.quantity && <p className="text-xs text-red-400">{errors.quantity.message}</p>}
              </div>
            </div>

            {/* Price + Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="targetPrice">Target Unit Price</Label>
                <Input
                  id="targetPrice"
                  placeholder="e.g. 12.50"
                  {...register("targetPrice")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select defaultValue="USD" onValueChange={(v) => setValue("currency", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["USD", "EUR", "GBP", "JPY", "CNY"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Delivery date */}
            <div className="space-y-1.5">
              <Label htmlFor="deliveryDate">Required Delivery Date</Label>
              <Input id="deliveryDate" type="date" lang="en" {...register("deliveryDate")} />
            </div>

            {/* Shipping address */}
            <div className="space-y-1.5">
              <Label htmlFor="shippingAddress">Shipping Address</Label>
              <Textarea
                id="shippingAddress"
                rows={2}
                placeholder="Full delivery address including country"
                {...register("shippingAddress")}
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Any other requirements, special certifications, preferred suppliers, etc."
                {...register("notes")}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1 border-t border-[rgba(148,163,184,0.12)]">
              <Button type="submit" variant="premium" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit RFQ
                  </>
                )}
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
