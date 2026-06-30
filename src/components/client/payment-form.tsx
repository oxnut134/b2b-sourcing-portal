"use client";

import { useState, useEffect, useRef } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentFormProps {
  orderId: string;
  amount: string;
  currency: string;
}

function CheckoutForm({ orderId, amount, currency }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentIntentId: paymentIntent.id }),
      });
      router.push(`/orders/${orderId}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-[rgba(148,163,184,0.18)] bg-[#253448]/50 p-4">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 animate-fade-in">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full gap-2 h-11 text-base"
        disabled={!stripe || processing}
        variant="premium"
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing payment…
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Pay {formatCurrency(amount, currency)} securely
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-[#64748b]">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        Secured by Stripe · 256-bit TLS encryption · PCI DSS compliant
      </div>
    </form>
  );
}

export function PaymentForm({ orderId, amount, currency }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setError("Could not initialize payment session.");
      })
      .catch(() => setError("Network error. Please refresh and try again."));
  }, [orderId]);

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-4 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm text-[#64748b]">Preparing secure payment session…</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/20">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <CardTitle>Secure Checkout</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Elements
          stripe={getStripe()}
          options={{
            clientSecret,
            locale: "en",
            appearance: {
              theme: "night",
              variables: {
                colorPrimary: "#6366f1",
                colorBackground: "#1e2d42",
                colorText: "#e2e8f0",
                colorDanger: "#f43f5e",
                colorTextSecondary: "#94a3b8",
                borderRadius: "8px",
                fontFamily: "var(--font-geist-sans), Inter, -apple-system, sans-serif",
                spacingUnit: "4px",
              },
              rules: {
                ".Input": {
                  border: "1px solid rgba(148,163,184,0.18)",
                  backgroundColor: "rgba(37,52,72,0.6)",
                  color: "#e2e8f0",
                  boxShadow: "none",
                },
                ".Input:focus": {
                  border: "1px solid rgba(99,102,241,0.5)",
                  boxShadow: "0 0 0 3px rgba(99,102,241,0.12)",
                },
                ".Label": {
                  color: "#64748b",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: "600",
                },
                ".Tab": {
                  border: "1px solid rgba(148,163,184,0.18)",
                  backgroundColor: "#253448",
                },
                ".Tab--selected": {
                  border: "1px solid rgba(99,102,241,0.4)",
                  backgroundColor: "rgba(99,102,241,0.08)",
                },
              },
            },
          }}
        >
          <CheckoutForm orderId={orderId} amount={amount} currency={currency} />
        </Elements>
      </CardContent>
    </Card>
  );
}
