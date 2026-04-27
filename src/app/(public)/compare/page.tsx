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
  Star,
  ArrowRight,
  RefreshCw,
  Car,
  Ban,
  MapPin,
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

  const [startDate, setStartDate] = useState(searchParams.get("start") || "");
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

            {/* Row 1: first two cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {BUSINESSES.slice(0, 2).map((b) => (
                <ProviderCard
                  key={b.id}
                  b={b}
                  bp={bizPrices[b.id]}
                  hasDates={hasDates}
                  onBook={handleBook}
                />
              ))}
            </div>

            {/* Row 2: third card centered */}
            {BUSINESSES.length > 2 && (
              <div className="flex justify-center">
                <div className="w-full sm:w-1/2">
                  <ProviderCard
                    b={BUSINESSES[2]}
                    bp={bizPrices[BUSINESSES[2].id]}
                    hasDates={hasDates}
                    onBook={handleBook}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const ACCENT: Record<string, string> = {
  parkease: "#155263",
  parkpro: "#e8825e",
  heathrow: "#0694a2",
};

function ProviderCard({
  b,
  bp,
  hasDates,
  onBook,
}: {
  b: BusinessConfig;
  bp: BizPrice;
  hasDates: boolean;
  onBook: (id: string) => void;
}) {
  const isDummy = b.businessId === null;
  const hasPrice = !isDummy && bp.totalPrice !== null && bp.totalDays !== null;
  const disabled = isDummy || !hasDates || bp.loading;
  const accent = ACCENT[b.id] ?? "var(--color-primary)";

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden bg-card border flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
        b.highlighted ? "border-primary/60" : "border-border"
      }`}
    >
      {/* Accent top bar */}
      <div className="h-1.5 w-full" style={{ background: accent }} />

      {/* Best-deal ribbon */}
      {b.highlighted && (
        <div
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white"
          style={{ background: accent }}
        >
          <Star className="h-3.5 w-3.5 fill-white" />
          Best Deal
        </div>
      )}

      <div className="p-6 flex flex-col flex-1 gap-5">
        {/* Logo + name + rating */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: `${accent}22` }}
          >
            <Image src={b.img} alt={b.name} width={32} height={32} />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-foreground text-lg leading-tight">
              {b.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                {b.rating}
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {b.tags.map((t) => (
            <Badge
              key={t}
              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
              style={{
                color: accent,
                background: `${accent}18`,
                borderColor: `${accent}40`,
              }}
            >
              {t}
            </Badge>
          ))}
          {isDummy && (
            <Badge variant="secondary" className="text-[11px] px-2.5 py-0.5 rounded-full">
              Coming Soon
            </Badge>
          )}
        </div>

        {/* Feature bullet list */}
        <ul className="space-y-2 flex-1">
          {b.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2
                className="h-4 w-4 shrink-0 mt-0.5"
                style={{ color: accent }}
              />
              <span className="text-foreground/80 leading-snug">{f}</span>
            </li>
          ))}
        </ul>

        {/* Quick-info pills */}
        <div className="grid grid-cols-2 gap-2">
          <FeaturePill icon={<Clock className="h-3.5 w-3.5" />} label={`${b.transfer} transfer`} accent={accent} />
          <FeaturePill icon={<Car className="h-3.5 w-3.5" />} label={b.type} accent={accent} />
          <FeaturePill icon={<CheckCircle2 className="h-3.5 w-3.5" />} label={`${b.cancellation} cancel`} accent={accent} />
          <FeaturePill icon={<Shield className="h-3.5 w-3.5" />} label={b.security} accent={accent} />
        </div>

        {/* Price + CTA */}
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              {isDummy ? (
                <p className="text-sm text-muted-foreground">
                  from £{b.dummyStartingPrice?.toFixed(2)}/day
                </p>
              ) : !hasDates ? (
                <p className="text-xs text-muted-foreground">
                  Select dates for price
                </p>
              ) : bp.loading ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Calculating…
                </div>
              ) : bp.error ? (
                <p className="text-sm text-destructive">Unavailable</p>
              ) : hasPrice ? (
                <>
                  <p className="text-3xl font-extrabold leading-none" style={{ color: accent }}>
                    {formatPrice(bp.totalPrice!)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDayCount(bp.totalDays!)}
                  </p>
                </>
              ) : null}
            </div>
            {hasDates && hasPrice && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {b.distance}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={() => b.businessId && onBook(b.businessId)}
            className={`relative w-full inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold py-3 transition-all overflow-hidden
              ${disabled ? "cursor-not-allowed" : "hover:opacity-90 cursor-pointer"}`}
            style={
              disabled
                ? { background: "#e5e7eb", color: "#9ca3af" }
                : { background: accent, color: "#fff" }
            }
          >
            {!disabled && (
              <div className="absolute inset-0 z-0 pointer-events-none">
                <NoiseTexture frequency={1} octaves={10} slope={0.6} noiseOpacity={0.5} />
              </div>
            )}
            <span className="relative z-10 flex items-center gap-2">
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
    </div>
  );
}

function FeaturePill({
  icon,
  label,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  accent: string;
}) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-foreground/80"
      style={{ background: `${accent}12` }}
    >
      <span style={{ color: accent }} className="shrink-0">
        {icon}
      </span>
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
