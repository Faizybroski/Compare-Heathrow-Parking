"use client";

import { Suspense, useEffect, useState } from "react";
import { PriceCalculation } from "@/types";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { BUSINESSES, fetchForBusiness } from "@/lib/businesses";
import { formatDayCount, formatPrice } from "@/lib/utils";
import { DateTimePicker } from "@/components/ui/DatePicker";
import PageHero from "@/components/shared/PageHero";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NoiseTexture } from "@/components/ui/noise-texture";
import {
  CalendarClock,
  User,
  Mail,
  Phone,
  Car,
  Hash,
  Palette,
  PlaneTakeoff,
  PlaneLanding,
  Loader2,
  AlertCircle,
  Tag,
  Ban,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";

// ─── regex patterns ───────────────────────────────────────────────
const FLIGHT_REGEX = /^[A-Z]{2,3}\d{1,4}[A-Z]?$/i;
const TERMINAL_REGEX = /^T\d{1,2}$/i;
const CAR_NUMBER_REGEX = /^[A-Z0-9][A-Z0-9 -]{3,10}[A-Z0-9]$/i;
const PHONE_REGEX = /^\+?[\d\s()-]{8,18}$/;

// ─── zod schema ───────────────────────────────────────────────────
const bookingSchema = z
  .object({
    userName: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100),
    userEmail: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    userPhone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .regex(PHONE_REGEX, "Enter a valid phone number (e.g. +44 7700 900000)"),
    carMake: z.string().trim().min(1, "Car make is required").max(50),
    carModel: z.string().trim().min(1, "Car model is required").max(50),
    carNumber: z
      .string()
      .trim()
      .min(1, "Registration number is required")
      .regex(CAR_NUMBER_REGEX, "Enter a valid registration (e.g. AB12 CDE)"),
    carColor: z.string().trim().min(1, "Car colour is required").max(30),
    bookedStartTime: z
      .string()
      .min(1, "Drop-off date & time is required")
      .refine(
        (v) => new Date(v) > new Date(),
        "Drop-off must be in the future",
      ),
    bookedEndTime: z.string().min(1, "Pick-up date & time is required"),
    departureTerminal: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => !v || TERMINAL_REGEX.test(v),
        "Invalid terminal (e.g. T1, T2)",
      ),
    departureFlightNo: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => !v || FLIGHT_REGEX.test(v),
        "Invalid flight number (e.g. BA123)",
      ),
    arrivalTerminal: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => !v || TERMINAL_REGEX.test(v),
        "Invalid terminal (e.g. T1, T5)",
      ),
    arrivalFlightNo: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => !v || FLIGHT_REGEX.test(v),
        "Invalid flight number (e.g. BA456)",
      ),
  })
  .refine(
    (d) =>
      !d.bookedStartTime ||
      !d.bookedEndTime ||
      new Date(d.bookedEndTime) > new Date(d.bookedStartTime),
    { message: "Pick-up must be after drop-off", path: ["bookedEndTime"] },
  )
  .refine(
    (d) => {
      if (!d.bookedStartTime || !d.bookedEndTime) return true;
      return (
        new Date(d.bookedEndTime).getTime() -
          new Date(d.bookedStartTime).getTime() >=
        3_600_000
      );
    },
    {
      message:
        "Booking must be at least 1 hour. Partial days are charged as full days.",
      path: ["bookedEndTime"],
    },
  );

type BookingFormValues = z.infer<typeof bookingSchema>;

// ─── per-business price state ────────────────────────────────────
type BizPrice = {
  totalPrice: number | null;
  totalDays: number | null;
  loading: boolean;
  error: boolean;
};

// ─── main form component ─────────────────────────────────────────
function BookingFormContent() {
  const searchParams = useSearchParams();
  const [pricePreview, setPricePreview] = useState<boolean | null>(null);

  // pre-selected business from /compare
  const selectedBusinessId = searchParams.get("business");
  const visibleBusinesses = selectedBusinessId
    ? BUSINESSES.filter((b) => b.businessId === selectedBusinessId)
    : BUSINESSES;

  // booking-enabled guard (still uses default business for the toggle check)
  const [bookingEnabled, setBookingEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    api
      .getBookingStatus()
      .then((res) => setBookingEnabled(res.data.bookingEnabled))
      .catch(() => setBookingEnabled(true));
  }, []);

  // per-business price previews
  const [bizPrices, setBizPrices] = useState<Record<string, BizPrice>>(() =>
    Object.fromEntries(
      BUSINESSES.map((b) => [
        b.id,
        { totalPrice: null, totalDays: null, loading: false, error: false },
      ]),
    ),
  );

  // which business checkout is pending (controls per-button loading spinner)
  const [pendingBiz, setPendingBiz] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      userName: "",
      userEmail: "",
      userPhone: "",
      carMake: "",
      carModel: "",
      carNumber: "",
      carColor: "",
      bookedStartTime: searchParams.get("start") || "",
      bookedEndTime: searchParams.get("end") || "",
      departureTerminal: "",
      departureFlightNo: "",
      arrivalTerminal: "",
      arrivalFlightNo: "",
    },
    mode: "onBlur",
  });

  const startTime = form.watch("bookedStartTime");
  const endTime = form.watch("bookedEndTime");


  const selectedBiz = visibleBusinesses?.[0];

const localDays =
  selectedBiz && bizPrices[selectedBiz.id]?.totalDays !== null
    ? bizPrices[selectedBiz.id]?.totalDays
    : null;

const localPrice =
  selectedBiz && bizPrices[selectedBiz.id]?.totalPrice !== null
    ? bizPrices[selectedBiz.id]?.totalPrice
    : null;

  // fetch prices for all real businesses when dates change
  useEffect(() => {
    if (!startTime || !endTime) return;
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) return;

    const startIso = start.toISOString();
    const endIso = end.toISOString();

    BUSINESSES.forEach((b) => {
      if (!b.businessId) return; // ParkEase is dummy — skip
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
          setPricePreview(true);
        })
        .catch(() => {
          (setBizPrices((prev) => ({
            ...prev,
            [b.id]: { ...prev[b.id], loading: false, error: true },
          })),
            setPricePreview(null));
        });
    });
  }, [startTime, endTime]);

  // ── per-business checkout ─────────────────────────────────────
  const handleBookWith = async (businessId: string) => {
    setCheckoutError(null);
    const valid = await form.trigger();
    if (!valid) return;

    const data = form.getValues();
    setPendingBiz(businessId);
    try {
      const res = await api.createCheckoutSessionForBusiness(businessId, {
        ...data,
        bookedStartTime: new Date(data.bookedStartTime).toISOString(),
        bookedEndTime: new Date(data.bookedEndTime).toISOString(),
      });
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      setCheckoutError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setPendingBiz(null);
    }
  };

  // ── booking disabled guard ────────────────────────────────────
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

  // ── helper: price label for a given business ──────────────────
  const hasDates =
    !!startTime && !!endTime && new Date(endTime) > new Date(startTime);

  return (
    <>
      <PageHero
        title="Book Your Parking"
        subtitle="Fill in your details, compare prices, and choose your preferred provider"
      />
      <div className="min-h-screen py-10 bg-muted/40">
        <div className="max-w-3xl mx-auto px-4">
          <Form {...form}>
            {/* The <form> wrapper is kept for field-level validation UX;
                submission is driven by per-business buttons, not a submit event. */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-6"
              noValidate
            >
              {/* ── checkout error ──────────────────────────── */}
              {checkoutError && (
                <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* {selectedBusinessId && visibleBusinesses && ( */}
                <Card className="rounded-2xl p-5 bg-primary/5 text-card-foreground border border-primary ring-0">
                  <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        <p className="font-bold text-foreground">
                          {visibleBusinesses[0].name}
                        </p>
                      </div>
                      {localDays !== null && localPrice !== null && (
                        <p className="text-sm text-muted-foreground pl-7">
                          {formatDayCount(localDays)} ·{" "}
                          <span className="font-semibold text-primary">
                            {formatPrice(localPrice)}
                          </span>{" "}
                          total
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/compare?start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`}
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline shrink-0"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Change tier
                    </Link>
                  </CardContent>
                </Card>
              {/* )} */}

              {/* ══════════════════════════════════════════════ */}
              {/*  DATES SECTION                                */}
              {/* ══════════════════════════════════════════════ */}
              <Card className="rounded-2xl p-6 lg:p-8 bg-card text-card-foreground border border-primary ring-0">
                <CardHeader className="p-0">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold mb-4">
                    <CalendarClock className="h-6 w-6 text-primary" />
                    Parking Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-5 p-0">
                  {/* Drop-off */}
                  <FormField
                    control={form.control}
                    name="bookedStartTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Drop-off Date &amp; Time
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <DateTimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pick-up */}
                  <FormField
                    control={form.control}
                    name="bookedEndTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Pick-up Date &amp; Time
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <DateTimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* ══════════════════════════════════════════════ */}
              {/*  PRICE COMPARISON — all businesses            */}
              {/* ══════════════════════════════════════════════ */}
              {/* {pricePreview && (
                <Card className="rounded-2xl p-6 lg:p-8 bg-card text-card-foreground border border-primary ring-0">
                  <CardHeader className="p-0">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold mb-1">
                      <Star className="h-6 w-6 text-primary" />
                      Choose Your Provider
                    </CardTitle>
                    <CardDescription>
                      {hasDates
                        ? "Prices calculated for your selected dates — click a button to proceed to payment."
                        : "Select your dates above to see live prices for each provider."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 mt-5 flex flex-col gap-3">
                    {BUSINESSES.map((b) => {
                      const bp = bizPrices[b.id];
                      const isDummy = b.businessId === null;
                      const isPending = pendingBiz === b.businessId;

                      // build the price label
                      let priceLabel = "";
                      let daysLabel = "";
                      if (isDummy) {
                        priceLabel = `from £${b.dummyStartingPrice!.toFixed(2)}/day`;
                      } else if (!hasDates) {
                        priceLabel = "Select dates to see price";
                      } else if (bp.loading) {
                        priceLabel = "Calculating…";
                      } else if (bp.error) {
                        priceLabel = "Price unavailable";
                      } else if (
                        bp.totalPrice !== null &&
                        bp.totalDays !== null
                      ) {
                        priceLabel = formatPrice(bp.totalPrice);
                        daysLabel = formatDayCount(bp.totalDays);
                      }

                      // button text
                      const btnText = isDummy
                        ? `${b.name} — Coming Soon`
                        : bp.loading
                          ? "Calculating…"
                          : bp.totalPrice !== null && bp.totalDays !== null
                            ? `${formatPrice(bp.totalPrice)} for ${formatDayCount(bp.totalDays)}`
                            : `Book with ${b.name}`;

                      return (
                        <div
                          key={b.id}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 sm:p-5 transition-colors ${
                            b.highlighted
                              ? "border-primary/40 bg-primary/[0.02]"
                              : "border-border bg-background"
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-full  flex items-center justify-center shrink-0 ${b.bg}`}
                            >
                              
                              <Image
                                src={b.img}
                                alt={b.name}
                                width={20}
                                height={20}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-foreground text-sm">
                                  {b.name}
                                </p>
                                {b.tags.map((t) => (
                                  <Badge
                                    key={t}
                                    className="text-primary bg-primary/10 border-primary/20 text-[10px] px-2 py-0"
                                  >
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {b.rating} · {b.transfer} transfer · {b.type}
                              </p>
                              <p className="text-sm font-semibold text-primary mt-1">
                                {priceLabel}
                                {daysLabel && (
                                  <span className="text-muted-foreground font-normal text-xs ml-1">
                                    ({daysLabel})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={
                              isDummy ||
                              isPending ||
                              bp.loading ||
                              !hasDates ||
                              true
                            }
                            className={`relative overflow-hidden cursor-not-allowed shrink-0 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold px-5 py-2.5 transition-opacity whitespace-nowrap
                            ${
                              isDummy
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : !hasDates
                                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                                  : "text-white hover:opacity-90 cursor-pointer"
                            }`}
                            style={
                              isDummy || !hasDates
                                ? {
                                    background: "#e5e7eb", // muted fallback
                                  }
                                : {
                                    background: `
            radial-gradient(ellipse 80% 120% at 50% -10%, #AA10EC 2%, var(--color-primary) 100%)
          `,
                                  }
                            }
                          >
                            {!(isDummy || !hasDates) && (
                              <div className="absolute inset-0 z-0 pointer-events-none">
                                <NoiseTexture
                                  frequency={1}
                                  octaves={10}
                                  slope={0.6}
                                  noiseOpacity={1}
                                />
                              </div>
                            )}
                            <span className="relative z-10 flex items-center">
                              {isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Redirecting…
                                </>
                              ) : bp.loading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Calculating…
                                </>
                              ) : (
                                btnText
                              )}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )} */}
              {/* <Card className="rounded-2xl p-6 lg:p-8 bg-card text-card-foreground border border-primary ring-0">
                <CardHeader className="p-0">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold mb-1">
                    Select Provider &amp; Pay
                  </CardTitle>
                  <CardDescription>
                    {hasDates
                      ? "Review the price and click to proceed to secure checkout."
                      : "Enter your parking dates to enable booking."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 mt-5 flex flex-col gap-3">
                  {visibleBusinesses.map((b) => {
                    const bp = bizPrices[b.id];
                    const isDummy = b.businessId === null;
                    const isPending = pendingBiz === b.businessId;
                    const hasPrice =
                      !isDummy &&
                      bp.totalPrice !== null &&
                      bp.totalDays !== null;

                    return (
                      <button
                        key={b.id}
                        type="button"
                        disabled={
                          isDummy ||
                          isPending ||
                          bp.loading ||
                          !hasDates ||
                          !!pendingBiz
                        }
                        onClick={() =>
                          b.businessId && handleBookWith(b.businessId)
                        }
                        className={`relative w-full inline-flex items-center justify-center gap-2 rounded-xl text-base font-semibold px-6 py-3.5 transition-opacity overflow-hidden
                          ${
                            isDummy
                              ? "bg-muted text-muted-foreground cursor-not-allowed"
                              : !hasDates || (!!pendingBiz && !isPending)
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-white hover:opacity-90"
                          }`}
                        style={
                          isDummy || !hasDates || (!!pendingBiz && !isPending)
                            ? {
                                background: "#e5e7eb", // muted fallback
                              }
                            : {
                                background: `
            radial-gradient(ellipse 80% 120% at 50% -10%, #AA10EC 2%, var(--color-primary) 100%)
          `,
                              }
                        }
                      >
                        {!(
                          isDummy ||
                          !hasDates ||
                          (!!pendingBiz && !isPending)
                        ) && (
                          <div className="absolute inset-0 z-0 pointer-events-none">
                            <NoiseTexture
                              frequency={1}
                              octaves={10}
                              slope={0.6}
                              noiseOpacity={1}
                            />
                          </div>
                        )}
                        {isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Redirecting to {b.name}…
                          </>
                        ) : isDummy ? (
                          `${b.name} — Coming Soon`
                        ) : !hasDates ? (
                          `Book with ${b.name} — Select dates first`
                        ) : bp.loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {`Book with ${b.name} — Calculating price…`}
                          </>
                        ) : hasPrice ? (
                          `Book with ${b.name} · ${formatPrice(bp.totalPrice!)} for ${formatDayCount(bp.totalDays!)}`
                        ) : (
                          `Book with ${b.name}`
                        )}
                      </button>
                    );
                  })}
                </CardContent>
              </Card> */}

              {/* ══════════════════════════════════════════════ */}
              {/*  PERSONAL DETAILS SECTION                     */}
              {/* ══════════════════════════════════════════════ */}
              <Card className="rounded-2xl p-6 lg:p-8 bg-card text-card-foreground border border-primary ring-0">
                <CardHeader className="p-0">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold mb-4">
                    <User className="h-6 w-6 text-primary" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-5 p-0">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Full Name<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              placeholder="John Smith"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="userEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email Address<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="userPhone"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>
                          Phone Number<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              type="tel"
                              placeholder="+44 7700 900000"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* ══════════════════════════════════════════════ */}
              {/*  VEHICLE DETAILS SECTION                      */}
              {/* ══════════════════════════════════════════════ */}
              <Card className="rounded-2xl p-6 lg:p-8 bg-card text-card-foreground border border-primary ring-0">
                <CardHeader className="p-0">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold mb-4">
                    <Car className="h-6 w-6 text-primary" />
                    Vehicle Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-5 p-0">
                  <FormField
                    control={form.control}
                    name="carMake"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Car Make<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              placeholder="e.g. Toyota"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="carModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Car Model<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              placeholder="e.g. Corolla"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="carNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Registration Number
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              placeholder="e.g. AB12 CDE"
                              className="pl-9 uppercase"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="carColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Car Color<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              placeholder="e.g. Silver"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* ══════════════════════════════════════════════ */}
              {/*  FLIGHT DETAILS (OPTIONAL)                    */}
              {/* ══════════════════════════════════════════════ */}
              <Card className="rounded-2xl p-6 lg:p-8 bg-card text-card-foreground border border-primary ring-0">
                <CardHeader className="p-0">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold mb-4">
                    <PlaneTakeoff className="h-6 w-6 text-primary" />
                    Flight Details
                  </CardTitle>
                  <CardDescription>
                    Optional — helps us coordinate your parking
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-5 p-0">
                  <FormField
                    control={form.control}
                    name="departureTerminal"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Departure Terminal</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <PlaneTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              placeholder="e.g. T2"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="arrivalTerminal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arrival Terminal</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <PlaneLanding className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              placeholder="e.g. T5"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="arrivalFlightNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arrival Flight No.</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <PlaneLanding className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              placeholder="e.g. BA456"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
               {visibleBusinesses.map((b) => {
                    const bp = bizPrices[b.id];
                    const isDummy = b.businessId === null;
                    const isPending = pendingBiz === b.businessId;
                    const hasPrice =
                      !isDummy &&
                      bp.totalPrice !== null &&
                      bp.totalDays !== null;

                    return (
                      <button
                        key={b.id}
                        type="button"
                        disabled={
                          isDummy ||
                          isPending ||
                          bp.loading ||
                          !hasDates ||
                          !!pendingBiz
                        }
                        onClick={() =>
                          b.businessId && handleBookWith(b.businessId)
                        }
                        className={`relative w-full inline-flex items-center justify-center gap-2 rounded-xl text-base font-semibold px-6 py-3.5 transition-opacity overflow-hidden
                          ${
                            isDummy
                              ? "bg-muted text-muted-foreground cursor-not-allowed"
                              : !hasDates || (!!pendingBiz && !isPending)
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-white hover:opacity-90"
                          }`}
                        style={
                          isDummy || !hasDates || (!!pendingBiz && !isPending)
                            ? {
                                background: "#e5e7eb", // muted fallback
                              }
                            : {
                                background: `
            radial-gradient(ellipse 80% 120% at 50% -10%, #AA10EC 2%, var(--color-primary) 100%)
          `,
                              }
                        }
                      >
                        {!(
                          isDummy ||
                          !hasDates ||
                          (!!pendingBiz && !isPending)
                        ) && (
                          <div className="absolute inset-0 z-0 pointer-events-none">
                            <NoiseTexture
                              frequency={1}
                              octaves={10}
                              slope={0.6}
                              noiseOpacity={1}
                            />
                          </div>
                        )}
                        {isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Redirecting to {b.name}…
                          </>
                        ) : isDummy ? (
                          `${b.name} — Coming Soon`
                        ) : !hasDates ? (
                          `Book with ${b.name} — Select dates first`
                        ) : bp.loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {`Book with ${b.name} — Calculating price…`}
                          </>
                        ) : hasPrice ? (
                          `Book with ${b.name} · ${formatPrice(bp.totalPrice!)} for ${formatDayCount(bp.totalDays!)}`
                        ) : (
                          `Book with ${b.name}`
                        )}
                      </button>
                    );
                  })}

              {/* ══════════════════════════════════════════════ */}
              {/*  PAYMENT BUTTONS — one per real business      */}
              {/* ══════════════════════════════════════════════ */}
              {/* <Card className="rounded-2xl p-6 lg:p-8 bg-card text-card-foreground border border-primary ring-0">
                <CardHeader className="p-0">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold mb-1">
                    Select Provider &amp; Pay
                  </CardTitle>
                  <CardDescription>
                    {hasDates
                      ? "Review the prices above and click to proceed to secure checkout."
                      : "Enter your parking dates to enable booking."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 mt-5 flex flex-col gap-3">
                  {BUSINESSES.map((b) => {
                    const bp = bizPrices[b.id];
                    const isDummy = b.businessId === null;
                    const isPending = pendingBiz === b.businessId;
                    const hasPrice =
                      !isDummy &&
                      bp.totalPrice !== null &&
                      bp.totalDays !== null;

                    return (
                      <button
                        key={b.id}
                        type="button"
                        disabled={
                          isDummy ||
                          isPending ||
                          bp.loading ||
                          !hasDates ||
                          !!pendingBiz
                        }
                        onClick={() =>
                          b.businessId && handleBookWith(b.businessId)
                        }
                        className={`relative w-full inline-flex items-center justify-center gap-2 rounded-xl text-base font-semibold px-6 py-3.5 transition-opacity overflow-hidden
                          ${
                            isDummy
                              ? "bg-muted text-muted-foreground cursor-not-allowed"
                              : !hasDates || (!!pendingBiz && !isPending)
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-white hover:opacity-90"
                          }`}
                        style={
                          isDummy || !hasDates || (!!pendingBiz && !isPending)
                            ? {
                                background: "#e5e7eb", // muted fallback
                              }
                            : {
                                background: `
            radial-gradient(ellipse 80% 120% at 50% -10%, #AA10EC 2%, var(--color-primary) 100%)
          `,
                              }
                        }
                      >
                        {!(
                          isDummy ||
                          !hasDates ||
                          (!!pendingBiz && !isPending)
                        ) && (
                          <div className="absolute inset-0 z-0 pointer-events-none">
                            <NoiseTexture
                              frequency={1}
                              octaves={10}
                              slope={0.6}
                              noiseOpacity={1}
                            />
                          </div>
                        )}
                        {isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Redirecting to {b.name}…
                          </>
                        ) : isDummy ? (
                          `${b.name} — Coming Soon`
                        ) : !hasDates ? (
                          `Book with ${b.name} — Select dates first`
                        ) : bp.loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {`Book with ${b.name} — Calculating price…`}
                          </>
                        ) : hasPrice ? (
                          `Book with ${b.name} · ${formatPrice(bp.totalPrice!)} for ${formatDayCount(bp.totalDays!)}`
                        ) : (
                          `Book with ${b.name}`
                        )}
                      </button>
                    );
                  })}
                </CardContent>
              </Card> */}
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}

// ─── page wrapper with suspense ───────────────────────────────────
export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <BookingFormContent />
    </Suspense>
  );
}
