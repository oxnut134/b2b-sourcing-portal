"use client";

import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PayNowButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  return (
    <Button
      size="sm"
      className="h-7 text-xs gap-1.5"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/payment/${orderId}`);
      }}
    >
      <CreditCard className="h-3 w-3" />
      Pay now
    </Button>
  );
}
