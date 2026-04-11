"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { XCircle, Loader2 } from "lucide-react";

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  // Preserve any date params from the original booking URL so the user can
  // jump straight back to the form with dates pre-filled.
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const bookAgainHref =
    start && end ? `/book?start=${start}&end=${end}` : "/book";

  return (
    <div className="min-h-screen py-20 bg-muted/40 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground text-sm">
            Your payment was not completed and no charge has been made. Your
            reservation has been released — you can try again whenever you are
            ready.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href={bookAgainHref}>Try Again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentCancelledContent />
    </Suspense>
  );
}
