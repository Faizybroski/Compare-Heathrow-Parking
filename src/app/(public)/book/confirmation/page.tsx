"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Booking } from "@/types";
import { formatDateTime, formatDayCount, formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function ConfirmationPage() {
  const router = useRouter();
  const [booking] = useState<Booking | null>(() => {
    if (typeof window === "undefined") return null;

    try {
      const data = sessionStorage.getItem("lastBooking");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!booking) {
      router.push("/book");
    }
  }, [booking, router]);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-muted">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Success header */}
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="text-green-500 w-10 h-10 mx-auto" />
          <h1 className="text-3xl font-bold  text-foreground">
            Booking Confirmed!
          </h1>
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
              <span className="font-semibold">Total Price</span>

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

          <Button asChild variant="outline" className="flex-1">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-primary-light">{label}</span>
      <span
        className={`text-sm font-semibold text-primary ${highlight ? "px-3 py-1 rounded-full text-white bg-primary" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
