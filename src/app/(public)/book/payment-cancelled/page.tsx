"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { XCircle, Loader2 } from "lucide-react";
import { getBrandByBusinessId } from "@/lib/businesses";
import { NoiseTexture } from "@/components/ui/noise-texture";

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const brandId = searchParams.get("brand");
  const bookAgainHref =
    start && end ? `/book?start=${start}&end=${end}` : "/book";

  const brand = brandId ? getBrandByBusinessId(brandId) : undefined;

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

        {/* Service provider note */}
        {brand && (
          <div className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-left">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${brand.bg}`}>
              <Image src={brand.img} alt={brand.name} width={18} height={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-900">
                Service provided by {brand.name}
              </p>
              <p className="text-xs text-purple-600">Booked via Heathrow Compare Parking</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="relative overflow-hidden">
            <Link href={bookAgainHref}>
            <div className="absolute inset-0 z-0 pointer-events-none">
                          <NoiseTexture
                            frequency={1}
                            octaves={10}
                            slope={0.6}
                            noiseOpacity={1}
                          />
                        </div>Try Again</Link>
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
