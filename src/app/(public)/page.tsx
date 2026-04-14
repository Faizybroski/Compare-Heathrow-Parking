"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  BUSINESSES,
  fetchForBusiness,
  type BusinessConfig,
} from "@/lib/businesses";
import {
  Star,
  MapPin,
  Bus,
  Car,
  Shield,
  ShieldCheck,
  Zap,
  Check,
  Bookmark,
  ChevronDown,
  Mail,
  Phone,
  LayoutGrid,
  List,
  PiggyBank,
  XCircle,
  CalendarDays,
  BadgeCheck,
  Target,
  ShieldAlert,
  Search,
  SlidersHorizontal,
  CircleCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

// ─── Figma image assets (valid for 7 days) ────────────────────────────────────
const imgSubtract =
  "https://www.figma.com/api/mcp/asset/2ef271c2-274d-4c93-a665-38c0bedf1f80";
const imgRectangle1 =
  "https://www.figma.com/api/mcp/asset/78e1b05f-05a8-4102-9e94-ed993695dae0";
const imgRectangle2 =
  "https://www.figma.com/api/mcp/asset/3216232e-af87-4a07-9e7a-2806971a1652";
const imgSarahJenkins =
  "https://www.figma.com/api/mcp/asset/9b8b8edb-9810-4ba1-a890-cf8f2d68f9f3";
const imgDavidChen =
  "https://www.figma.com/api/mcp/asset/ff12d629-64b6-43a8-80c5-8fbccba38709";
const imgEmmaThompson =
  "https://www.figma.com/api/mcp/asset/002688f5-16f8-4700-b4f1-abf7763067e5";

// ─── Types ────────────────────────────────────────────────────────────────────
type BusinessPrice = {
  startingPrice: number | null;
  totalPrice: number | null;
  totalDays: number | null;
  loading: boolean;
};

const steps = [
  {
    icon: <Search className="w-8 h-8 text-primary" />,
    title: "We fetch prices",
    desc: "Our engine scans real-time availability.",
  },
  {
    icon: <SlidersHorizontal className="w-8 h-8 text-primary" />,
    title: "Compare in real-time",
    desc: "Filter by price, transfer time, or rating.",
  },
  {
    icon: <CircleCheck className="w-8 h-8 text-primary" />,
    title: "You choose",
    desc: "Select the deal that perfectly fits your needs.",
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: "Secure booking",
    desc: "Redirect to provider for a safe checkout.",
  },
];

const whyCards = [
  {
    icon: <Target className="w-6 h-6 text-primary" />,
    title: "Best Price Comparison",
    desc: "See prices side-by-side to guarantee the best deal.",
  },
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: "Fast Results",
    desc: "Our engine queries live availability in milliseconds.",
  },
  {
    icon: <ShieldAlert className="w-6 h-6 text-primary" />,
    title: "Trusted Providers",
    desc: "Every car park is vetted for security and service.",
  },
  {
    icon: <BadgeCheck className="w-6 h-6 text-primary" />,
    title: "Easy Booking",
    desc: "Seamless handover to the provider's secure checkout.",
  },
];

const providers = [
  {
    initials: "PP",
    img: "https://parkpro.uk/logo.svg",
    bg: "bg-[#ffeada]",
    name: "ParkPro",
    desc: "Premium park and ride services with frequent shuttles and top-tier security.",
  },
  {
    initials: "HS",
    img: "https://heathrowsafeparking.com/favicon.svg",
    bg: "bg-[#d3eff4]",
    name: "Heathrow Safe Parking",
    desc: "Award-winning meet and greet service directly at the terminal.",
  },
  {
    initials: "PE",
    img: "/parkease_logo.svg",
    bg: "bg-[#155263]",
    name: "ParkEase",
    desc: "Budget-friendly options without compromising on safety or convenience.",
  },
];

const testimonials = [
  {
    quote:
      "Saved £45 on my 2-week trip to Dubai. The site is incredibly easy to use and ParkEase was fantastic. Highly recommended!",
    name: "Sarah Jenkins",
    role: "Business Traveler",
    avatar: imgSarahJenkins,
  },
  {
    quote:
      "Found a great Meet & Greet deal for Terminal 5. Traveling with 3 kids is hard enough, this made it stress-free and cheap.",
    name: "David Chen",
    role: "Family Holiday",
    avatar: imgDavidChen,
  },
  {
    quote:
      "Much better than booking direct with the airport. It took 30 seconds to find a secure park and ride that was half the price.",
    name: "Emma Thompson",
    role: "Weekend Getaway",
    avatar: imgEmmaThompson,
  },
];

const faqs = [
  "How does the comparison work?",
  "Is my booking secure?",
  "Do prices change?",
  "Are there any hidden fees?",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PrimaryButton({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-purple-grad inline-flex items-center justify-center rounded-full text-white font-semibold hover:opacity-90 transition-opacity px-4 py-3 text-sm ${className}`}
    >
      {children}
    </button>
  );
}

function ParkingCard({
  business,
  price,
  datesSelected,
}: {
  business: BusinessConfig;
  price: BusinessPrice;
  datesSelected: boolean;
}) {
  const p = business;

  const priceDisplay = (() => {
    if (p.businessId === null) {
      // Dummy business
      return {
        main: `£${p.dummyStartingPrice!.toFixed(2)}`,
        sub: "/day",
        label: "from",
      };
    }
    if (price.loading) return { main: "...", sub: "/day", label: "from" };
    if (
      datesSelected &&
      price.totalPrice !== null &&
      price.totalDays !== null
    ) {
      const perDay = price.totalPrice / price.totalDays;
      return {
        main: `£${price.totalPrice.toFixed(2)}`,
        sub: `£${perDay.toFixed(2)}/day`,
        label: `${price.totalDays} day${price.totalDays !== 1 ? "s" : ""} total`,
      };
    }
    if (price.startingPrice !== null) {
      return {
        main: `£${price.startingPrice.toFixed(2)}`,
        sub: "/day",
        label: "from",
      };
    }
    return { main: "—", sub: "/day", label: "from" };
  })();

  const handleBook = () => {
    if (!p.bookingUrl) return;
    window.open(p.bookingUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Card
      className={`overflow-hidden ${
        p.highlighted ? "border-primary/40 shadow-md bg-primary/[0.02]" : ""
      }`}
    >
      <CardContent className="p-0 flex flex-col sm:flex-row">
        {/* Main content */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Top row */}
          <div className="flex flex-wrap items-start justify-between mb-3 gap-2">
            <div>
              <h3 className="font-bold text-xl text-foreground">{p.name}</h3>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-primary" fill="currentColor" />
                  <span className="text-sm text-muted-foreground">
                    {p.rating}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {p.distance}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {p.tags.map((t) => (
                <Badge
                  key={t}
                  className="text-primary bg-primary/10 border-primary/20 hover:bg-primary/15"
                >
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          {/* Details row */}
          <div className="border-t border-b py-3 sm:py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: "Transfer",
                value: p.transfer,
                icon: <Bus className="w-4 h-4 text-muted-foreground" />,
              },
              {
                label: "Type",
                value: p.type,
                icon: <Car className="w-4 h-4 text-muted-foreground" />,
              },
              {
                label: "Cancellation",
                value: p.cancellation,
                valueClass: "text-emerald-600",
              },
              { label: "Security", value: p.security },
            ].map(({ label, value, icon, valueClass }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <div className="flex items-center gap-1">
                  {icon}
                  <span
                    className={`text-sm font-medium ${valueClass ?? "text-foreground"}`}
                  >
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="w-full sm:w-52 bg-muted/30 border-t sm:border-t-0 sm:border-l flex flex-col items-center sm:items-end justify-center p-4 sm:p-6 gap-1">
          <p className="text-sm text-muted-foreground capitalize">
            {priceDisplay.label}
          </p>
          <p className="text-3xl font-extrabold text-foreground">
            {priceDisplay.main}
          </p>
          <p className="text-sm font-medium text-primary">{priceDisplay.sub}</p>
          {p.bookingUrl ? (
            <PrimaryButton
              onClick={handleBook}
              className="mt-3 w-full text-sm font-bold"
            >
              Book Now
            </PrimaryButton>
          ) : (
            <button
              disabled
              className="mt-3 w-full text-sm font-bold inline-flex items-center justify-center rounded-full text-muted-foreground bg-muted px-4 py-3 cursor-not-allowed"
            >
              Coming Soon
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CompareHeathrowParking() {
  const [dropOff, setDropOff] = useState("");
  const [pickUp, setPickUp] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // prices keyed by business id
  const [prices, setPrices] = useState<Record<string, BusinessPrice>>(() =>
    Object.fromEntries(
      BUSINESSES.map((b) => [
        b.id,
        {
          startingPrice: b.dummyStartingPrice ?? null,
          totalPrice: null,
          totalDays: null,
          loading: b.businessId !== null,
        },
      ]),
    ),
  );

  // fetch starting (day-1) price for each real business on mount
  useEffect(() => {
    BUSINESSES.forEach((b) => {
      if (!b.businessId) return;
      fetchForBusiness<number>("/bookings/pricePerHour", b.businessId)
        .then((price) =>
          setPrices((prev) => ({
            ...prev,
            [b.id]: { ...prev[b.id], startingPrice: price, loading: false },
          })),
        )
        .catch(() =>
          setPrices((prev) => ({
            ...prev,
            [b.id]: { ...prev[b.id], loading: false },
          })),
        );
    });
  }, []);

  // recalculate prices whenever both dates are chosen
  const fetchCalculatedPrices = useCallback(
    (dropOffDate: string, pickUpDate: string) => {
      if (!dropOffDate || !pickUpDate) return;
      const startTime = new Date(dropOffDate).toISOString();
      const endTime = new Date(pickUpDate).toISOString();

      BUSINESSES.forEach((b) => {
        if (!b.businessId) return;
        setPrices((prev) => ({
          ...prev,
          [b.id]: { ...prev[b.id], loading: true },
        }));
        fetchForBusiness<{ finalPrice: number; totalDays: number }>(
          `/bookings/price?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
          b.businessId,
        )
          .then((calc) =>
            setPrices((prev) => ({
              ...prev,
              [b.id]: {
                ...prev[b.id],
                totalPrice: calc.finalPrice,
                totalDays: calc.totalDays,
                loading: false,
              },
            })),
          )
          .catch(() =>
            setPrices((prev) => ({
              ...prev,
              [b.id]: { ...prev[b.id], loading: false },
            })),
          );
      });
    },
    [],
  );

  const handleDropOffChange = (val: string) => {
    setDropOff(val);
    if (val && pickUp) fetchCalculatedPrices(val, pickUp);
  };

  const handlePickUpChange = (val: string) => {
    setPickUp(val);
    if (dropOff && val) fetchCalculatedPrices(dropOff, val);
  };

  const datesSelected = Boolean(dropOff && pickUp);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative  bg-[url('/hero.svg')] object-cover bg-cover pointer-events-none ">
        <div className="absolute -left-12 -top-20 w-[500px] h-[380px] rounded-full bg-primary/10 blur-[50px]" />
        <div className="absolute right-0 top-0 w-[380px] h-[290px] rounded-full bg-primary/10 blur-[50px]" />

        <div className=" flex items-center overflow-hidden relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 pt-20 pb-12 sm:pt-24 sm:pb-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left */}
          <div className="flex-1 max-w-[540px] text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1 mb-6 sm:mb-8">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Trusted by 50,000+ UK Travelers
              </span>
            </div>

            <h1 className="font-bold text-4xl sm:text-5xl lg:text-[60px] lg:leading-[66px] tracking-tight text-[#140d26] mb-4">
              Compare Heathrow
              <br />
              Parking Prices in
              <br />
              <span className="text-primary">Seconds</span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-[500px] mx-auto lg:mx-0">
              Instantly find the best deal from trusted providers. Save up to
              60% on secure, verified airport parking without the hidden fees.
            </p>

            <PrimaryButton className="px-8 text-base font-bold">
              Compare Prices Now
            </PrimaryButton>
          </div>

          {/* Right – Live Prices card */}
          <div className="flex-1 w-full max-w-[580px]">
            <Card className="backdrop-blur-md bg-white/60 border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-lg">
                    Live Prices
                  </h3>
                  <Badge variant="secondary">8 days parking</Badge>
                </div>

                {/* Best deal – ParkEase (dummy) */}
                <div className="border-2 border-primary/50 rounded-2xl overflow-hidden shadow-sm mb-3 relative">
                  <div className="bg-purple-grad absolute top-0 right-0 px-3 py-1 rounded-bl-xl rounded-tr-xl text-[10px] font-bold text-white">
                    BEST DEAL
                  </div>
                  <div className="flex items-center justify-between px-4 py-4">
                    <div>
                      <p className="font-bold text-foreground">ParkEase</p>
                      <p className="text-xs text-muted-foreground">
                        Meet &amp; Greet
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-2xl text-primary">£4.90</p>
                      <p className="text-xs text-muted-foreground">from /day</p>
                    </div>
                  </div>
                </div>

                {/* Other providers – live prices */}
                {BUSINESSES.filter((b) => b.businessId !== null).map((b) => {
                  const p = prices[b.id];
                  const displayPrice = p?.loading
                    ? "..."
                    : p?.startingPrice != null
                      ? `£${p.startingPrice.toFixed(2)}`
                      : "—";
                  return (
                    <div
                      key={b.id}
                      className="flex items-center justify-between border rounded-2xl px-4 py-3 mb-2 bg-background shadow-sm"
                    >
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {b.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {b.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {displayPrice}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          from /day
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── SEARCH FORM ────────────────────────────────────────────────────── */}
        <section className="z-20 flex justify-center mt-8 px-4 sm:px-6 mb-12">
          <Card className="w-full max-w-4xl backdrop-blur-md bg-background/95 border-white/20 shadow-2xl">
            <CardContent className="p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row items-end gap-4 mb-6">
                <div className="flex-1 w-full">
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Drop-off Date
                  </Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="date"
                      value={dropOff}
                      onChange={(e) => handleDropOffChange(e.target.value)}
                      className="rounded-full pl-10"
                    />
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Pick-up Date
                  </Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="date"
                      value={pickUp}
                      onChange={(e) => handlePickUpChange(e.target.value)}
                      className="rounded-full pl-10"
                    />
                  </div>
                </div>
                <PrimaryButton className="w-full sm:w-auto px-8 text-base font-semibold whitespace-nowrap">
                  Search
                </PrimaryButton>
              </div>

              <div className="border-t pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium">
                    Filter by:
                  </span>
                  {["Meet & Greet", "Park & Ride", "On-Airport"].map((f) => (
                    <Button
                      key={f}
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-primary bg-primary/5 hover:bg-primary/10 text-xs"
                    >
                      {f}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-primary bg-primary/5 text-xs gap-1.5"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" /> Card View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg text-muted-foreground text-xs gap-1.5"
                  >
                    <List className="w-3.5 h-3.5" /> List View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-12 sm:py-16 px-4 sm:px-6 text-center bg-[url('/merged_circles.svg')] overflow-hidden bg-no-repeat bg-position-[center_-10%]"
      >
        <h2 className="font-semibold text-foreground text-2xl sm:text-3xl mb-2">
          Smart decisions, simplified.
        </h2>
        <p className="text-muted-foreground text-base mb-10 sm:mb-12 max-w-[506px] mx-auto">
          Our comparison engine does the heavy lifting so you don&apos;t have
          to.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center">
                {s.icon}
              </div>
              <p className="font-bold text-foreground text-base leading-tight">
                {s.title}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── RESULTS SECTION ────────────────────────────────────────────────── */}
      {/* <section
        id="compare"
        className="bg-muted/30 border-t border-primary/40 rounded-tl-[40px] sm:rounded-tl-[80px] rounded-tr-[40px] sm:rounded-tr-[80px] py-12 sm:py-16 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-foreground text-xl sm:text-2xl">
              {datesSelected
                ? `Prices for your ${prices["parkpro"]?.totalDays ?? "—"} day stay`
                : "Compare Heathrow Parking Providers"}
            </h2>
            <Badge variant="secondary" className="shrink-0">
              {BUSINESSES.length} providers
            </Badge>
          </div>

          <div className="flex flex-col gap-4">
            {BUSINESSES.map((b) => (
              <ParkingCard
                key={b.id}
                business={b}
                price={prices[b.id]}
                datesSelected={datesSelected}
              />
            ))}
          </div>
        </div>
      </section>*/}
      <section className="bg-purple-grad -mx-4 sm:-mx-6 px-4 sm:px-8 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-around gap-6 sm:gap-4">
        {[
          {
            icon: <PiggyBank className="w-8 h-8 text-white" />,
            title: "Users saved up to £42",
            sub: "this week alone",
          },
          {
            icon: <ShieldCheck className="w-8 h-8 text-white" />,
            title: "Trusted Providers",
            sub: "Fully vetted & secure",
          },
          {
            icon: <XCircle className="w-8 h-8 text-white" />,
            title: "No Hidden Fees",
            sub: "What you see is what you pay",
          },
        ].map((stat) => (
          <div key={stat.title} className="flex items-center gap-4">
            {stat.icon}
            <div>
              <p className="text-white font-bold text-lg">{stat.title}</p>
              <p className="text-white/80 text-sm">{stat.sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── OUR MISSION / WHY USE US ───────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 lg:px-16 max-w-7xl oveflow-hidden mx-auto bg-[url('/circles.svg')] bg-no-repeat bg-position-[center_-10%]">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-16 sm:mb-20 items-center lg:items-start">
          <div className="flex-1">
            <h2 className="font-bold text-foreground text-3xl sm:text-4xl mb-4">
              Our Mission
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              CompareHeathrowParking.uk helps travelers find the best parking
              deals quickly and easily. We believe that airport parking
              shouldn&apos;t cost more than your flight.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed">
              We cut through the noise, aggregating real-time prices from
              trusted local operators to give you transparent, side-by-side
              comparisons. No bias, just the best deals for your specific dates.
            </p>
          </div>
          <div className="relative shrink-0 hidden lg:block">
            {/* <div className="absolute inset-0 rounded-lg" /> */}

            {/* <div className="absolute inset-0 rounded-lg border-4 border-primary translate-x-3 translate-y-3" /> */}
            <div className="relative rounded-lg overflow-hidden w-full sm:w-[480px] xl:w-[544px] h-[220px] sm:h-[301px] ">
              <Image
                src={"/mission.svg"}
                alt="Airport parking"
                fill
                sizes="(max-width: 640px) 100vw, 544px"
              />
            </div>
          </div>
        </div>

        <h2 className="font-bold text-foreground text-3xl sm:text-4xl text-center mb-2">
          Why Use Us
        </h2>
        <p className="text-muted-foreground text-lg text-center mb-10">
          We do the heavy lifting so you can focus on packing your bags.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyCards.map((c, i) => (
            <Card key={i} className="border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-4">
                  {c.icon}
                </div>
                <h3 className="font-bold text-foreground text-base mb-2">
                  {c.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {c.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── PROVIDERS ──────────────────────────────────────────────────────── */}
      <section
        id="providers"
        className="bg-[#F8FAFC] border-t border-b py-12 sm:py-16 px-4 sm:px-8 lg:px-16"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-10 sm:mb-12 gap-4">
            <div>
              <h2 className="font-bold text-foreground text-3xl sm:text-4xl mb-3">
                Only the Best Providers
              </h2>
              <p className="text-muted-foreground text-lg max-w-[620px]">
                We only compare parking operators that meet our strict security
                and customer service standards.
              </p>
            </div>
            <Button variant="outline" className="shrink-0 rounded-full gap-2">
              <Check className="w-4 h-4 text-green-600" /> 100% Verified
              Partners
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {providers.map((p) => (
              <Card key={p.name} className="border">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div
                    className={`w-10 h-10 rounded-full ${p.bg} flex items-center justify-center mx-auto mb-4`}
                  >
                    <Image
                      src={p.img}
                      alt={p.name}
                      width={20}
                      height={20}
                      className="text-xl font-bold text-primary"
                    />
                    {/* {p.initials} */}
                  </div>
                  <h3 className="font-bold text-foreground text-xl mb-3">
                    {p.name}
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {p.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-[url('/separate_circles.svg')] bg-no-repeat bg-center">
        {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 px-4 sm:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-bold text-foreground text-3xl sm:text-4xl text-center mb-2">
              Travelers Love Us
            </h2>
            <p className="text-muted-foreground text-lg text-center mb-10 sm:mb-12">
              Join thousands of smart travelers who never overpay for parking.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <Card key={t.name} className="border">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-500 fill-yellow-500"
                        />
                      ))}
                    </div>
                    <p className="text-foreground/90 text-base italic leading-relaxed mb-6">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover border-2 border-primary/10"
                      />
                      <div>
                        <p className="font-bold text-foreground text-sm">
                          {t.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────────────── */}
        <section id="faq" className="py-16 sm:py-20 px-4 sm:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-10 items-start">
            <div className="flex-1">
              <h2 className="font-bold text-foreground text-3xl sm:text-4xl mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Everything you need to know about comparing and booking.
              </p>

              <div className="flex flex-col">
                {faqs.map((q, i) => (
                  <div key={i} className="border-b">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between py-3 text-left"
                    >
                      <span className="font-semibold text-foreground text-base sm:text-lg pr-4">
                        {q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                          openFaq === i ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openFaq === i && (
                      <p className="text-muted-foreground text-sm pb-4 leading-relaxed">
                        We compare prices from all major trusted Heathrow
                        parking providers in real-time. Enter your dates, hit
                        Search, and within seconds you&apos;ll see a ranked list
                        of available options with transparent pricing — no
                        hidden costs.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right image – hidden on mobile */}
            <div className="relative shrink-0 hidden lg:block">
              <div className="relative rounded-lg overflow-hidden w-full sm:w-120 xl:w-[544px] h-[220px] sm:h-[301px] ">
                <Image
                  src={"/faqs.svg"}
                  alt="Airport parking"
                  fill
                  sizes="(max-width: 640px) 100vw, 544px"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT ────────────────────────────────────────────────────────── */}
        <section
          id="contact"
          className="py-16 sm:py-20 px-4 sm:px-8 lg:px-16 bg-muted/10"
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16">
            <div className="flex-1 max-w-[560px]">
              <h2 className="font-bold text-foreground text-3xl sm:text-4xl mb-4">
                Get in Touch
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 sm:mb-10">
                Have a question about our comparison tool? Want to partner with
                us? Drop us a message and our team will get back to you within
                24 hours.
              </p>

              <div className="flex flex-col gap-6">
                {[
                  {
                    icon: <Mail className="w-5 h-5 text-primary" />,
                    label: "Email Us",
                    value: "support@compareheathrowparking.uk",
                  },
                  {
                    icon: <Phone className="w-5 h-5 text-primary" />,
                    label: "Call Us",
                    value: "+44 800 123 4567 (Mon-Fri, 9am-5pm)",
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{label}</p>
                      <p className="text-muted-foreground text-sm">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 max-w-[576px]">
              <Card className="shadow-xl rounded-[2rem] sm:rounded-[2.4rem]">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col gap-4">
                    <div>
                      <Label className="text-xs font-medium mb-1 block">
                        Full Name
                      </Label>
                      <Input
                        placeholder="John Doe"
                        className="rounded-full mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1 block">
                        Email Address
                      </Label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        className="rounded-full mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1 block">
                        Message
                      </Label>
                      <Textarea
                        rows={5}
                        placeholder="How can we help you?"
                        className="rounded-2xl mt-1 resize-none"
                      />
                    </div>
                    <PrimaryButton className="w-full text-base font-semibold">
                      Send Message
                    </PrimaryButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ─────────────────────────────────────────────────────── */}
        <section className="py-10 sm:py-12 px-4 sm:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto rounded-[2rem] overflow-hidden relative py-12 sm:py-16 text-center">
            <div className="absolute inset-0" />
            <div className="absolute inset-0 overflow-hidden">
              {/* <Image src={"/cta.svg"} alt="" fill /> */}
              <div className="relative rounded-[38px] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(140%_64%_at_0%_63%,#AA10EC_2%,#641188_100%)]" />
                <svg width="0" height="0" style={{ position: "absolute" }}>
                  <filter id="noiseFilter">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.8"
                      numOctaves="4"
                      stitchTiles="stitch"
                    />
                    <feColorMatrix type="saturate" values="0" />
                  </filter>
                </svg>
                <Image
                  src="/cta1.svg"
                  width={300}
                  height={200}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                  alt={"cta"}
                />

                <div
                  className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-soft-light"
                  style={{ filter: "url(#noiseFilter)" }}
                />
              </div>
            </div>
            {/* <div className="absolute -right-32 -top-32 w-64 h-64 rounded-full bg-white/10 blur-[32px]" />
          <div className="absolute -left-32 -bottom-32 w-64 h-64 rounded-full bg-black/10 blur-[32px]" /> */}

            <div className="relative z-10 px-4">
              <h2 className="font-bold text-white text-2xl sm:text-[35px] sm:leading-[48px] mb-4">
                Find the Best Heathrow Parking Deal Today
              </h2>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-[716px] mx-auto mb-8">
                Stop searching multiple sites. Enter your dates once and let us
                find the cheapest, most secure parking for your trip.
              </p>
              <button className="bg-white text-primary font-semibold text-base sm:text-lg px-8 py-3 sm:py-4 rounded-full shadow-xl hover:bg-white/90 transition-colors">
                Compare Prices Now
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
