"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Booking } from "@/types";
import PageHero from "@/components/shared/PageHero";
import {
  formatDayCount,
  formatDateTime,
  formatDuration,
  formatPrice,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function TrackContent() {
  const searchParams = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(
    searchParams.get("number") || "",
  );
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const fetchBooking = async (
    trackingValue: string,
    showLoader: boolean = true,
  ) => {
    const normalizedTracking = trackingValue.trim().toUpperCase();
    if (!normalizedTracking) return;

    if (showLoader) {
      setLoading(true);
      setBooking(null);
    }

    setError("");
    setSearched(true);

    try {
      const res = await api.trackBooking(normalizedTracking);
      setBooking(res.data);
    } catch (err: unknown) {
      if (showLoader) {
        setBooking(null);
      }
      setError(err instanceof Error ? err.message : "Booking not found");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const initialNumber = searchParams.get("number");
    if (initialNumber) {
      void fetchBooking(initialNumber);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!booking) return;

    const intervalId = window.setInterval(() => {
      void fetchBooking(booking.trackingNumber, false);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [booking]);

  const handleSearch = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    await fetchBooking(trackingNumber);
  };

  const statusLabel = booking
    ? (booking.statusLabel ?? getStatusLabel(booking.status))
    : "";
  const currentTotalPrice =
    booking?.currentTotalPrice ?? booking?.totalPrice ?? 0;
  const uptimeDays = booking?.uptimeDays ?? 0;
  const uptimePrice = booking?.uptimePrice ?? 0;

  return (
    <>
      <PageHero
        title="Track Your Booking"
        subtitle="Enter your tracking number to view your booking status"
      />
      <div
        className="min-h-screen py-12"
        style={{ background: "var(--muted)" }}
      >
        <div className="mx-auto max-w-2xl px-4">

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <Input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
              placeholder="e.g. PPK-A3B4C5"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full px-8 py-3.5 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 bg-primary"
            >
              {loading ? "..." : "Track"}
            </button>
          </div>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {booking && (
          <div className="space-y-4 animate-fade-in">
            <Card className="flex flex-col items-center rounded-2xl border border-primary bg-card p-6 text-center text-card-foreground ring-0 lg:p-8">
              <Badge
                className={`inline-flex rounded-full p-4 text-sm font-bold uppercase ${getStatusColor(booking.status)}`}
              >
                {statusLabel}
              </Badge>
              <p
                className="text-3xl font-bold tracking-wider"
                style={{ color: "var(--primary)" }}
              >
                {booking.trackingNumber}
              </p>

              {booking.status === "active" && (
                <div
                  className="mt-4 rounded-xl p-3"
                  style={{ background: "var(--muted)" }}
                >
                  {booking.isOvertimeRunning && uptimeDays > 0 ? (
                    <>
                      <p className="font-semibold text-red-600">
                        Extra days running: {formatDayCount(uptimeDays)}
                      </p>
                      <p className="mt-1 text-sm text-red-600">
                        Extra payment due: {formatPrice(uptimePrice)}
                      </p>
                    </>
                  ) : (booking.timeRemainingHours ?? 0) > 0 ? (
                    <p className="font-semibold text-green-600">
                      Time remaining:{" "}
                      {formatDuration(booking.timeRemainingHours ?? 0)}
                    </p>
                  ) : (
                    <p className="font-semibold text-amber-600">
                      Pickup time reached. Awaiting admin completion.
                    </p>
                  )}
                </div>
              )}
            </Card>

            <Card className="rounded-2xl border border-primary bg-card p-6 text-card-foreground ring-0 lg:p-8">
              <CardHeader className="p-0">
                <CardTitle className="text-lg font-bold">
                  Booking Details
                </CardTitle>
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
                {booking.actualExitTime && (
                  <DetailRow
                    label="Actual Exit"
                    value={formatDateTime(booking.actualExitTime)}
                  />
                )}
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
                <DetailRow
                  label="Booked Price"
                  value={formatPrice(booking.price)}
                />
                {uptimeDays > 0 && (
                  <DetailRow
                    label={
                      booking.lateChargeMode === "pending"
                        ? "Extra Days (estimated)"
                        : "Extra Days"
                    }
                    value={`${formatDayCount(uptimeDays)} (+${formatPrice(uptimePrice)})`}
                  />
                )}
                <div className="flex justify-between pt-3">
                  <span className="font-bold text-primary-light">
                    Total Price
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(currentTotalPrice)}
                  </span>
                </div>
                {booking.lateChargeMode === "pending" && (
                  <div className="text-xs text-amber-600">
                    Extra day charges are collected manually by admin at pickup.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {searched && !booking && !loading && !error && (
          <Alert variant="destructive">
            <AlertDescription className="text-center">
              No booking found for this tracking number
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-primary-light">{label}</span>
      <span className="text-right text-sm font-semibold text-primary">
        {value}
      </span>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
