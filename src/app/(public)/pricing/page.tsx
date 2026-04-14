"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { BUSINESSES, fetchForBusiness } from "@/lib/businesses";
import { formatPrice } from "@/lib/utils";
import { PricingBreakdown } from "@/types";

// Number of days to show in the table
const DISPLAY_DAYS = 30;

type BizPricing = {
  breakdown: PricingBreakdown | null;
  loading: boolean;
  error: boolean;
};

// Only real businesses (not dummies)
const REAL_BUSINESSES = BUSINESSES.filter((b) => b.businessId !== null);

export default function PricingPage() {
  const [pricingData, setPricingData] = useState<Record<string, BizPricing>>(
    () =>
      Object.fromEntries(
        REAL_BUSINESSES.map((b) => [
          b.id,
          { breakdown: null, loading: true, error: false },
        ]),
      ),
  );

  useEffect(() => {
    REAL_BUSINESSES.forEach((b) => {
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

  const allLoaded = REAL_BUSINESSES.every(
    (b) => !pricingData[b.id].loading,
  );

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
          <div className="grid sm:grid-cols-2 gap-4">
            {REAL_BUSINESSES.map((b) => {
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
          </div>

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
                        {REAL_BUSINESSES.map((b) => (
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
                        const prices = REAL_BUSINESSES.map((b) => {
                          const bd = pricingData[b.id].breakdown;
                          return bd?.breakdown.find((e) => e.day === day)?.price ?? null;
                        });
                        const validPrices = prices.filter((p): p is number => p !== null);
                        const minPrice = validPrices.length ? Math.min(...validPrices) : null;

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
                            {REAL_BUSINESSES.map((b, idx) => {
                              const bd = pricingData[b.id].breakdown;
                              const entry = bd?.breakdown.find((e) => e.day === day);
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
                                    <span className="text-muted-foreground">—</span>
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
            All prices include VAT. Prices are for the total stay, not per night.
            Actual price is calculated at checkout based on your exact dates.
          </p>
        </div>
      </div>
    </>
  );
}
