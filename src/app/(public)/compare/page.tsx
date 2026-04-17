"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  BUSINESSES,
  fetchForBusiness,
  type BusinessConfig,
} from "@/lib/businesses";
import { PriceCalculation } from "@/types";
import { formatDayCount, formatPrice } from "@/lib/utils";
import { DateTimePicker } from "@/components/ui/DatePicker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NoiseTexture } from "@/components/ui/noise-texture";
import {
  CalendarClock,
  Shield,
  Loader2,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  RefreshCw,
  Car,
  Ban,
} from "lucide-react";
import { api } from "@/lib/api";

type BizPrice = {
  totalPrice: number | null;
  totalDays: number | null;
  loading: boolean;
  error: boolean;
};

function ComparePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [startDate, setStartDate] = useState(
    searchParams.get("start") || "",
  );
  const [endDate, setEndDate] = useState(searchParams.get("end") || "");

  const [bookingEnabled, setBookingEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    api
      .getBookingStatus()
      .then((res) => setBookingEnabled(res.data.bookingEnabled))
      .catch(() => setBookingEnabled(true));
  }, []);

  const [bizPrices, setBizPrices] = useState<Record<string, BizPrice>>(() =>
    Object.fromEntries(
      BUSINESSES.map((b) => [
        b.id,
        { totalPrice: null, totalDays: null, loading: false, error: false },
      ]),
    ),
  );

  const fetchPrices = useCallback((start: string, end: string) => {
    if (!start || !end) return;
    const s = new Date(start);
    const e = new Date(end);
    if (e <= s) return;

    const startIso = s.toISOString();
    const endIso = e.toISOString();

    BUSINESSES.forEach((b) => {
      if (!b.businessId) return;
      setBizPrices((prev) => ({
        ...prev,
        [b.id]: { ...prev[b.id], loading: true, error: false },
      }));
      fetchForBusiness<PriceCalculation>(
        `/bookings/price?startTime=${encodeURIComponent(startIso)}&endTime=${encodeURIComponent(endIso)}`,
        b.businessId,
      )
        .then((calc) => {
          setBizPrices((prev) => ({
            ...prev,
            [b.id]: {
              totalPrice: calc.finalPrice,
              totalDays: calc.totalDays,
              loading: false,
              error: false,
            },
          }));
        })
        .catch(() => {
          setBizPrices((prev) => ({
            ...prev,
            [b.id]: { ...prev[b.id], loading: false, error: true },
          }));
        });
    });
  }, []);

  // Fetch on mount if dates come from URL
  useEffect(() => {
    if (startDate && endDate) {
      fetchPrices(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasDates =
    !!startDate && !!endDate && new Date(endDate) > new Date(startDate);

  const handleBook = (businessId: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);
    params.set("business", businessId);
    router.push(`/book?${params.toString()}`);
  };

  if (bookingEnabled === false) {
    return (
      <div className="min-h-screen py-20 bg-muted/40 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-5">
            <Ban className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Bookings Temporarily Unavailable
          </h1>
          <p className="text-muted-foreground mb-6">
            We are not accepting new parking reservations at the moment. Please
            check back soon or contact us for assistance.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Contact Us
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[url('/hero.svg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 pt-32 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 drop-shadow-lg">
            Compare Parking Prices
          </h1>
          <p className="text-lg opacity-85 max-w-xl mx-auto drop-shadow">
            Select your dates and choose the best deal from our trusted
            providers
          </p>
        </div>
      </section>

      <div className="min-h-screen bg-muted/40 py-10">
        <div className="max-w-4xl mx-auto px-4 space-y-6">

          {/* ── DATE SELECTOR ──────────────────────────────────────────────── */}
          <Card className="rounded-2xl p-6 lg:p-8 bg-card border border-primary">
            <CardHeader className="p-0">
              <CardTitle className="flex items-center gap-2 text-lg font-bold mb-4">
                <CalendarClock className="h-6 w-6 text-primary" />
                Your Parking Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Drop-off Date &amp; Time
                  </Label>
                  <DateTimePicker
                    value={startDate}
                    onChange={(val) => {
                      setStartDate(val);
                      if (val && endDate) fetchPrices(val, endDate);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Pick-up Date &amp; Time
                  </Label>
                  <DateTimePicker
                    value={endDate}
                    onChange={(val) => {
                      setEndDate(val);
                      if (startDate && val) fetchPrices(startDate, val);
                    }}
                  />
                </div>
              </div>
              {hasDates && (
                <p className="mt-4 text-sm text-muted-foreground flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Prices updated for your selected dates
                </p>
              )}
            </CardContent>
          </Card>

          {/* ── PROVIDER CARDS ─────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-bold text-foreground">
                {hasDates ? "Available Providers" : "Our Providers"}
              </h2>
              {hasDates && (
                <Badge variant="secondary" className="text-xs">
                  {BUSINESSES.filter((b) => b.businessId).length} providers
                </Badge>
              )}
            </div>

            {BUSINESSES.map((b) => {
              const bp = bizPrices[b.id];
              const isDummy = b.businessId === null;
              const hasPrice =
                !isDummy && bp.totalPrice !== null && bp.totalDays !== null;

              return (
                <Card
                  key={b.id}
                  className={`rounded-2xl overflow-hidden border transition-shadow hover:shadow-md ${
                    b.highlighted ? "border-primary/60" : "border-border"
                  }`}
                >
                  {b.highlighted && (
                    <div className="bg-primary text-white text-xs font-bold px-4 py-1.5 flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-white" />
                      Best Deal
                    </div>
                  )}

                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-5">
                      {/* Left: logo + info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${b.bg}`}
                        >
                          <Image
                            src={b.img}
                            alt={b.name}
                            width={24}
                            height={24}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-foreground text-base">
                              {b.name}
                            </h3>
                            {b.tags.map((t) => (
                              <Badge
                                key={t}
                                className="text-primary bg-primary/10 border-primary/20 text-[10px] px-2 py-0"
                              >
                                {t}
                              </Badge>
                            ))}
                            {isDummy && (
                              <Badge variant="secondary" className="text-[10px] px-2 py-0">
                                Coming Soon
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {b.rating}
                          </p>

                          {/* Feature grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <FeaturePill icon={<Clock className="h-3.5 w-3.5" />} label={`${b.transfer} transfer`} />
                            <FeaturePill icon={<Car className="h-3.5 w-3.5" />} label={b.type} />
                            <FeaturePill icon={<CheckCircle2 className="h-3.5 w-3.5" />} label={`${b.cancellation} cancel`} />
                            <FeaturePill icon={<Shield className="h-3.5 w-3.5" />} label={b.security} />
                          </div>
                        </div>
                      </div>

                      {/* Right: price + CTA */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:min-w-[160px]">
                        <div className="text-right">
                          {isDummy ? (
                            <p className="text-sm text-muted-foreground">
                              from £{b.dummyStartingPrice?.toFixed(2)}/day
                            </p>
                          ) : !hasDates ? (
                            <p className="text-sm text-muted-foreground">
                              Select dates for price
                            </p>
                          ) : bp.loading ? (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Calculating…
                            </div>
                          ) : bp.error ? (
                            <p className="text-sm text-destructive">
                              Price unavailable
                            </p>
                          ) : hasPrice ? (
                            <>
                              <p className="text-2xl font-bold text-primary leading-none">
                                {formatPrice(bp.totalPrice!)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDayCount(bp.totalDays!)}
                              </p>
                            </>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          disabled={isDummy || !hasDates || bp.loading}
                          onClick={() =>
                            b.businessId && handleBook(b.businessId)
                          }
                          className={`relative shrink-0 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold px-5 py-2.5 transition-opacity overflow-hidden whitespace-nowrap
                            ${
                              isDummy || !hasDates || bp.loading
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "text-white hover:opacity-90 cursor-pointer"
                            }`}
                          style={
                            isDummy || !hasDates || bp.loading
                              ? { background: "#e5e7eb" }
                              : {
                                  background: `radial-gradient(ellipse 80% 120% at 50% -10%, #AA10EC 2%, var(--color-primary) 100%)`,
                                }
                          }
                        >
                          {!(isDummy || !hasDates || bp.loading) && (
                            <div className="absolute inset-0 z-0 pointer-events-none">
                              <NoiseTexture
                                frequency={1}
                                octaves={10}
                                slope={0.6}
                                noiseOpacity={1}
                              />
                            </div>
                          )}
                          <span className="relative z-10 flex items-center gap-1.5">
                            {isDummy ? (
                              "Coming Soon"
                            ) : !hasDates ? (
                              "Select Dates"
                            ) : bp.loading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading…
                              </>
                            ) : (
                              <>
                                Book Now
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function FeaturePill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-muted/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground/80">
      <span className="text-primary shrink-0">{icon}</span>
      {label}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
