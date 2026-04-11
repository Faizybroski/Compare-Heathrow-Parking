"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Booking } from "@/types";
import { api } from "@/lib/api";
import { formatDateTime, formatDayCount, formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found. Please contact support.");
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 8;
    const delay = 2000; // 2s between attempts (webhook may be slightly delayed)

    const poll = async () => {
      attempts++;
      try {
        const res = await api.getBookingBySession(sessionId);
        setBooking(res.data);
        setLoading(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        // 402 = payment not yet confirmed by webhook — keep polling
        if (message.includes("402") && attempts < maxAttempts) {
          setTimeout(poll, delay);
        } else {
          setError("Could not load booking details. Your payment was received — check your email for confirmation or track your booking.");
          setLoading(false);
        }
      }
    };

    poll();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Confirming your payment…</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen py-20 bg-muted/40 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Payment Received</h1>
          <p className="text-muted-foreground text-sm">
            {error ?? "Your payment was successful. Check your email for confirmation."}
          </p>
          <Button asChild>
            <Link href="/track">Track Your Booking</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-muted pt-24">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Success header */}
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="text-green-500 w-10 h-10 mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">Payment Confirmed!</h1>
          <p className="text-muted-foreground text-sm">
            A confirmation email has been sent to {booking.userEmail}
          </p>
        </div>

        {/* Tracking number */}
        <Card className="rounded-2xl p-6 text-center flex flex-col items-center lg:p-8 bg-card text-card-foreground border border-primary ring-0">
          <CardContent className="p-0 space-y-2">
            <p className="text-sm text-muted-foreground font-medium">
              YOUR TRACKING NUMBER
            </p>
            <p className="text-4xl font-bold tracking-widest text-primary">
              {booking.trackingNumber}
            </p>
            <p className="text-xs text-muted-foreground">
              Save this number to track your booking anytime
            </p>
          </CardContent>
        </Card>

        {/* Booking details */}
        <Card className="rounded-2xl p-6 lg:p-8 bg-card text-card-foreground border border-primary ring-0">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-bold">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 p-0">
            <DetailRow
              label="Drop-off"
              value={formatDateTime(booking.bookedStartTime)}
            />
            <DetailRow
              label="Pick-up"
              value={formatDateTime(booking.bookedEndTime)}
            />
            <DetailRow
              label="Booked Days"
              value={formatDayCount(booking.bookedDays)}
            />
            <DetailRow
              label="Vehicle"
              value={`${booking.carMake} ${booking.carModel} (${booking.carColor})`}
            />
            <DetailRow label="Registration" value={booking.carNumber} />

            <Separator className="bg-primary-light" />

            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Paid</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(booking.totalPrice)}
                </span>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {formatDayCount(booking.bookedDays)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild className="flex-1">
            <Link href={`/track?number=${booking.trackingNumber}`}>
              Track Booking
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 rounded-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-primary-light">{label}</span>
      <span className="text-sm font-semibold text-primary">{value}</span>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
