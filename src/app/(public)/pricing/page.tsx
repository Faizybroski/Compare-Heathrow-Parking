"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarClock,
  Shield,
  CheckCircle2,
  Clock,
  Loader2,
  Star,
  ArrowRight,
  RefreshCw,
  Car,
  AlertCircle,
  Ban,
  MapPin,
} from "lucide-react";
import {
  BUSINESSES,
  fetchForBusiness,
  type BusinessConfig,
} from "@/lib/businesses";
import { formatPrice } from "@/lib/utils";
import { PricingBreakdown } from "@/types";

// Number of days to show in the table
const DISPLAY_DAYS = 30;

type BizPricing = {
  breakdown: PricingBreakdown | null;
  loading: boolean;
  error: boolean;
};

type BizPrice = {
  totalPrice: number | null;
  totalDays: number | null;
  loading: boolean;
  error: boolean;
};

export default function PricingPage() {
  const [pricingData, setPricingData] = useState<Record<string, BizPricing>>(
    () =>
      Object.fromEntries(
        BUSINESSES.map((b) => [
          b.id,
          { breakdown: null, loading: true, error: false },
        ]),
      ),
  );

  const [bizPrices, setBizPrices] = useState<Record<string, BizPrice>>(() =>
    Object.fromEntries(
      BUSINESSES.map((b) => [
        b.id,
        { totalPrice: null, totalDays: null, loading: false, error: false },
      ]),
    ),
  );

  useEffect(() => {
    BUSINESSES.forEach((b) => {
      fetchForBusiness<PricingBreakdown>(
        `/bookings/pricing?days=${DISPLAY_DAYS}`,
        b.businessId!,
      )
        .then((data) => {
          setPricingData((prev) => ({
            ...prev,
            [b.id]: { breakdown: data, loading: false, error: false },
          }));
        })
        .catch(() => {
          setPricingData((prev) => ({
            ...prev,
            [b.id]: { breakdown: null, loading: false, error: true },
          }));
        });
    });
  }, []);

  const allLoaded = BUSINESSES.every((b) => !pricingData[b.id].loading);

  // Build rows: day 1..DISPLAY_DAYS
  const rows = Array.from({ length: DISPLAY_DAYS }, (_, i) => i + 1);

  return (
    <>
      <PageHero
        title="Parking Prices"
        subtitle="Compare daily parking rates for each provider at a glance"
      />

      <div className="min-h-screen py-10 bg-muted/40">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          {/* Provider cards */}
          {/* <div className="grid sm:grid-cols-2 gap-4">
            {BUSINESSES.map((b) => {
              const pd = pricingData[b.id];
              return (
                <Card
                  key={b.id}
                  className="rounded-2xl border border-primary bg-card ring-0"
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${b.bg}`}
                      >
                        <Image
                          src={b.img}
                          alt={b.name}
                          width={20}
                          height={20}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">
                          {b.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {b.rating} · {b.transfer} transfer · {b.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {b.tags.map((t) => (
                        <Badge
                          key={t}
                          className="text-primary bg-primary/10 border-primary/20 text-[10px] px-2 py-0"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    {pd.loading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading prices…
                      </div>
                    ) : pd.error ? (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        Prices unavailable
                      </div>
                    ) : pd.breakdown ? (
                      <p className="text-sm text-muted-foreground">
                        Starting from{" "}
                        <span className="font-bold text-primary text-base">
                          {formatPrice(pd.breakdown.breakdown[0]?.price ?? 0)}
                        </span>{" "}
                        / day
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {BUSINESSES.slice(0, 2).map((b) => (
              <ProviderCard
                key={b.id}
                b={b}
                pd={pricingData[b.id]}
              />
            ))}
          </div>

          {/* Row 2: third card centered */}
          {BUSINESSES.length > 2 && (
            <div className="flex justify-center">
              <div className="w-full sm:w-1/2">
                <ProviderCard
                  b={BUSINESSES[2]}
                  pd={pricingData[BUSINESSES[2].id]}
                />
              </div>
            </div>
          )}

          {/* Comparison table */}
          {!allLoaded ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="rounded-2xl border border-primary bg-card ring-0 overflow-hidden">
              <CardHeader className="p-5 pb-4">
                <CardTitle className="text-lg font-bold">
                  Day-by-Day Price Comparison
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Total cumulative price for each number of days parked
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-5 py-3 text-left font-semibold text-muted-foreground w-24">
                          Days
                        </th>
                        {BUSINESSES.map((b) => (
                          <th
                            key={b.id}
                            className="px-5 py-3 text-center font-semibold text-foreground"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${b.bg}`}
                              >
                                <Image
                                  src={b.img}
                                  alt={b.name}
                                  width={12}
                                  height={12}
                                />
                              </div>
                              {b.name}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((day) => {
                        // Find the cheapest price for this row to highlight
                        const prices = BUSINESSES.map((b) => {
                          const bd = pricingData[b.id]?.breakdown;
                          return (
                            bd?.breakdown.find((e) => e.day === day)?.price ??
                            null
                          );
                        });
                        const validPrices = prices.filter(
                          (p): p is number => p !== null,
                        );
                        const minPrice = validPrices.length
                          ? Math.min(...validPrices)
                          : null;

                        return (
                          <tr
                            key={day}
                            className={`border-b border-border last:border-0 transition-colors hover:bg-muted/30 ${
                              day % 2 === 0 ? "bg-muted/10" : ""
                            }`}
                          >
                            <td className="px-5 py-3 font-medium text-muted-foreground">
                              {day} day{day !== 1 ? "s" : ""}
                            </td>
                            {BUSINESSES.map((b, idx) => {
                              const bd = pricingData[b.id].breakdown;
                              const entry = bd?.breakdown.find(
                                (e) => e.day === day,
                              );
                              const price = entry?.price ?? null;
                              const isCheapest =
                                price !== null &&
                                minPrice !== null &&
                                price === minPrice &&
                                validPrices.length > 1;

                              return (
                                <td
                                  key={b.id}
                                  className="px-5 py-3 text-center"
                                >
                                  {pricingData[b.id].error ? (
                                    <span className="text-muted-foreground">
                                      —
                                    </span>
                                  ) : price !== null ? (
                                    <span
                                      className={`font-semibold ${
                                        isCheapest
                                          ? "text-green-600"
                                          : "text-foreground"
                                      }`}
                                    >
                                      {formatPrice(price)}
                                      {isCheapest && (
                                        <span className="ml-1 text-[10px] font-bold text-green-600 bg-green-100 rounded px-1">
                                          BEST
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    <Loader2 className="h-3 w-3 animate-spin mx-auto text-muted-foreground" />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <p className="text-xs text-center text-muted-foreground pb-4">
            All prices include VAT. Prices are for the total stay, not per
            night. Actual price is calculated at checkout based on your exact
            dates.
          </p>
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
  pd,
}: {
  b: BusinessConfig;
  pd: BizPricing;
}) {
  const isDummy = b.businessId === null;
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
            <Badge
              variant="secondary"
              className="text-[11px] px-2.5 py-0.5 rounded-full"
            >
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
          <FeaturePill
            icon={<Clock className="h-3.5 w-3.5" />}
            label={`${b.transfer} transfer`}
            accent={accent}
          />
          <FeaturePill
            icon={<Car className="h-3.5 w-3.5" />}
            label={b.type}
            accent={accent}
          />
          <FeaturePill
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            label={`${b.cancellation} cancel`}
            accent={accent}
          />
          <FeaturePill
            icon={<Shield className="h-3.5 w-3.5" />}
            label={b.security}
            accent={accent}
          />
        </div>

        {/* Price + CTA */}
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              {pd.loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading prices…
                </div>
              ) : pd.error ? (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Prices unavailable
                </div>
              ) : pd.breakdown ? (
                <p className="text-sm text-muted-foreground">
                  Starting from{" "}
                  <span className="font-bold text-primary text-base">
                    {formatPrice(pd.breakdown.breakdown[0]?.price ?? 0)}
                  </span>{" "}
                  / day
                </p>
              ) : null}
            </div>
          </div>

          {/* <button
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
                <NoiseTexture
                  frequency={1}
                  octaves={10}
                  slope={0.6}
                  noiseOpacity={0.5}
                />
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
          </button> */}
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
