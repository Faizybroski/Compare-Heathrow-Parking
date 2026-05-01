"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { BUSINESSES, fetchForBusiness } from "@/lib/businesses";
import {
  Star,
  ShieldCheck,
  Zap,
  ChevronDown,
  PiggyBank,
  XCircle,
  BadgeCheck,
  Target,
  ShieldAlert,
  Search,
  SlidersHorizontal,
  CircleCheck,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/DatePicker";
import AirportPopover from "@/components/ui/AirportPicker";
import { NoiseTexture } from "@/components/ui/noise-texture";

// ── Easing ─────────────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const;

// ── Types ──────────────────────────────────────────────────────────────────
type BusinessPrice = {
  startingPrice: number | null;
  totalPrice: number | null;
  totalDays: number | null;
  loading: boolean;
};

// ── Static data ────────────────────────────────────────────────────────────
const steps = [
  {
    icon: <Search className="w-5 h-5 text-primary" />,
    title: "We fetch prices",
    desc: "Our engine scans real-time availability.",
  },
  {
    icon: <SlidersHorizontal className="w-5 h-5 text-primary" />,
    title: "Compare in real-time",
    desc: "Filter by price, transfer time, or rating.",
  },
  {
    icon: <CircleCheck className="w-5 h-5 text-primary" />,
    title: "You choose",
    desc: "Select the deal that perfectly fits your needs.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-primary" />,
    title: "Secure booking",
    desc: "Redirect to provider for a safe checkout.",
  },
];

// Desktop: pin-center y in viewBox(0 0 1000 300), container h-[340px] → scale=1.133
// rendered y = svgCy * 1.133 → pin top = rendered_y - 18 (half of 36px pin)
const STEP_POSITIONS = [
  { left: "12.5%", top: 33, svgCy: 45 },
  { left: "37.5%", top: 237, svgCy: 225 },
  { left: "62.5%", top: 33, svgCy: 45 },
  { left: "87.5%", top: 237, svgCy: 225 },
] as const;

// Step reveal delays: synced with wave draw (1.6s total)
const STEP_DELAYS = [0.05, 0.58, 1.12, 1.52];

const whyCards = [
  {
    icon: <ShieldAlert className="w-5 h-5 text-primary" />,
    title: "Trusted Providers",
    desc: "Every car park is vetted for security and service.",
  },
  {
    icon: <Target className="w-5 h-5 text-primary" />,
    title: "Best Price Comparison",
    desc: "See prices side-by-side to guarantee the best deal.",
  },
  {
    icon: <BadgeCheck className="w-5 h-5 text-primary" />,
    title: "Easy Booking",
    desc: "Seamless handover to the provider's secure checkout.",
  },
  {
    icon: <Zap className="w-5 h-5 text-primary" />,
    title: "Fast Results",
    desc: "Our engine queries live availability in milliseconds.",
  },
];

const testimonials = [
  {
    stars: 5,
    quote:
      "Saved £45 on my 2-week trip to Dubai. The site is incredibly easy to use and ParkEase was fantastic. Highly recommended!",
    name: "Sarah Jenkins",
    role: "Business Traveler",
    avatar: "/Sarah Jenkins.svg",
  },
  {
    stars: 5,
    quote:
      "Found a great Meet & Greet deal for Terminal 5. Traveling with 3 kids is hard enough, this made it stress-free and cheap.",
    name: "David Chen",
    role: "Family Holiday",
    avatar: "/David Chen.svg",
  },
  {
    stars: 4,
    quote:
      "Much better than booking direct with the airport. It took 30 seconds to find a secure park and ride that was half the price.",
    name: "Emma Thompson",
    role: "Weekend Getaway",
    avatar: "/Emma Thompson.svg",
  },
];

const faqs = [
  {
    q: "How does Heathrow Safe Parking comparison work?",
    a: "Simply enter your departure airport, drop-off, and pick-up dates. We query our extensive database of trusted parking providers to show you real-time availability and prices, allowing you to choose the best option.",
  },
  {
    q: "Are there any hidden booking fees?",
    a: "None from us. We show the total price including all fees. Some providers may charge for extras like entry/exit management, which are always displayed upfront.",
  },
  {
    q: "Can I cancel or amend my booking?",
    a: "Most providers offer free cancellation. Cancellation terms are shown clearly on each provider's booking page before you confirm.",
  },
  {
    q: "Is my car secure while I am away?",
    a: "All parking providers we list offer 24/7 security patrols, CCTV surveillance, and are fully insured. Your vehicle is in safe hands.",
  },
];

// ── Animated section wrapper ───────────────────────────────────────────────
function InView({
  children,
  className = "",
  delay = 0,
  from = "bottom",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const initial =
    from === "left"
      ? { opacity: 0, x: -40 }
      : from === "right"
        ? { opacity: 0, x: 40 }
        : { opacity: 0, y: 36 };
  const visible = { opacity: 1, x: 0, y: 0 };
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? visible : initial}
      transition={{ duration: 0.7, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── How It Works – animated wave section ───────────────────────────────────
function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-20 px-4 sm:px-8 lg:px-16 text-center overflow-hidden bg-[url('/flow.svg')] bg-no-repeat bg-right"
    >
      {/* Title */}
      <InView className="mb-14 sm:mb-16 text-left ">
        <h2 className=" mb-3  font-roboto text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.05]">
          Smart decisions,{" "}
          <em className="text-primary not-italic">simplified.</em>
        </h2>
        <p className="text-muted-foreground text-base max-w-md ">
          Our comparison engine does the heavy lifting so you don&apos;t have
          to.
        </p>
      </InView>

      {/* Mobile grid (2-col, no wave) */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:hidden max-w-2xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-3 text-center"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.13, duration: 0.55, ease }}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              {step.icon}
            </div>
            <p className="font-bold text-foreground text-sm">{step.title}</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Desktop wave layout */}
      <div
        ref={ref}
        className="hidden lg:block relative max-w-7xl mx-auto h-[340px] overflow-visible"
      >
        {/* SVG wave – drawn behind step items */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 125,45
            C 270,45 270,225 375,225
            C 480,225 480,45 625,45
            C 760,45 760,225 875,225"
            stroke="var(--color-primary)"
            strokeWidth="7"
            strokeDasharray="0.1 15"
            strokeLinecap="round"
            fill="none"
            initial={{ opacity: 0, strokeDashoffset: 0 }}
            animate={
              inView
                ? { opacity: 1, strokeDashoffset: [0, -15.1] }
                : { opacity: 0 }
            }
            transition={{
              opacity: { duration: 0.9, ease: "easeIn" },
              strokeDashoffset: {
                duration: 1.4,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          />
        </svg>

        {/* Step items – pin on the wave, icon box + text below */}
        {steps.map((step, i) => {
          const pos = STEP_POSITIONS[i];
          return (
            <motion.div
              key={i}
              className="absolute flex flex-col items-center text-center w-44 -translate-x-1/2"
              style={{ left: pos.left, top: pos.top }}
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{
                delay: STEP_DELAYS[i],
                duration: 0.5,
                ease,
                scale: { type: "spring", stiffness: 340, damping: 22 },
              }}
            >
              {/* Map pin — sits on the wave path */}
              <motion.div
                whileHover={{ scale: 1.18, y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="mb-2"
              >
                <MapPin
                  className="w-9 h-9 text-primary drop-shadow-md"
                  fill="currentColor"
                  strokeWidth={1.2}
                  stroke="white"
                />
              </motion.div>

              {/* Feature icon box */}
              <motion.div
                className="w-12 h-12 rounded-md bg-primary/7  shadow-sm flex items-center justify-center mb-3"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(var(--color-primary), 0.15)",
                }}
                transition={{ type: "spring", stiffness: 380 }}
              >
                {step.icon}
              </motion.div>

              {/* Text – fades in slightly after pin */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  delay: STEP_DELAYS[i] + 0.18,
                  duration: 0.45,
                  ease,
                }}
              >
                <p className="font-bold text-foreground text-sm mb-1">
                  {step.title}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CompareHeathrowParking() {
  const router = useRouter();
  const [searchError, setSearchError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [clickedCard, setClickedCard] = useState<string | null>(null);

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

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (startDate && endDate) {
      router.push(`/compare?start=${startDate}&end=${endDate}`);
    } else {
      router.push("/compare");
    }
  };

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

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ══════════════════════════════════════════════════════════════════════
          HERO  —  dark parking-lot background  +  booking card on the right
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[600px] sm:min-h-[680px] flex items-center bg-[url('/hero.svg')] bg-cover bg-center overflow-hidden">
        {/* Dark overlay */}
        {/* <div className="absolute inset-0 bg-[#0d0d1a]/70" /> */}

        {/* Animated purple glows */}
        <motion.div
          className="absolute -left-16 top-1/4 w-96 h-96 rounded-full  pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 bottom-0 w-80 h-80 rounded-full  pointer-events-none"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-20 sm:py-24 flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
          {/* ── Left: headline ── */}
          <motion.div
            className="flex-1 max-w-[540px] text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {/* Badge */}
            {/* <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-6"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Shield className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-white/90">
                Trusted by 50,000+ UK Travelers
              </span>
            </motion.div> */}

            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.65, ease },
                },
              }}
              className="font-roboto text-4xl sm:text-5xl lg:text-[58px] lg:leading-[64px] tracking-tight text-white mb-5"
            >
              Compare Heathrow
              <br />
              Parking Prices in
              <br />
              Seconds
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease },
                },
              }}
              className="text-white/75 text-base sm:text-lg leading-relaxed mb-8 max-w-[460px] mx-auto lg:mx-0"
            >
              Instantly find the best deal from trusted providers. Save up to
              60% on secure, verified airport parking without the hidden fees.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease },
                },
              }}
              className="flex flex-col sm:flex-row items-center lg:items-start gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/compare"
                  className="bg-purple-grad relative inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-white font-semibold text-base overflow-hidden"
                >
                  <div className="absolute inset-0 pointer-events-none">
                    <NoiseTexture
                      frequency={1}
                      octaves={10}
                      slope={0.6}
                      noiseOpacity={1}
                    />
                  </div>
                  <span className="relative z-10 flex items-center gap-2">
                    Compare Prices Now
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </span>
                </Link>
              </motion.div>

              {/* Social proof avatars */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    "/Sarah Jenkins.svg",
                    "/David Chen.svg",
                    "/Emma Thompson.svg",
                  ].map((src, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.8 + i * 0.1,
                        type: "spring",
                        stiffness: 400,
                      }}
                      className="w-8 h-8 rounded-full border-2 border-white/40 overflow-hidden bg-white/20"
                    >
                      <Image
                        src={src}
                        alt="reviewer"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </motion.div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-white/70 text-xs mt-0.5">
                    4.9 · 2,400+ reviews
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Book Your Parking card ── */}
          <motion.div
            className="flex-1 w-full max-w-[480px]"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, ease, delay: 0.3 }}
          >
            <Card className="bg-transparent backdrop-blur-sm ring ring-white/20 shadow-2xl rounded-2xl">
              <CardHeader className="p-6 sm:p-7 pb-0 sm:pb-0">
                <h3 className="font-roboto text-white text-xl">
                  Book Your Parking
                </h3>
              </CardHeader>
              <CardContent className="p-6 sm:p-7 t-0 sm:pt-0">
                <form onSubmit={handleSearch} className="flex flex-col gap-4">
                  {/* Airport */}
                  <div>
                    <Label className="text-xs font-semibold text-white mb-1.5 block uppercase tracking-wide">
                      Select Airport
                    </Label>
                    <AirportPopover />
                  </div>

                  {/* Drop-off */}
                  <div>
                    <Label className="text-xs font-semibold text-white mb-1.5 block uppercase tracking-wide">
                      Drop-off Date &amp; Time
                    </Label>
                    <DateTimePicker
                      homepage
                      value={startDate}
                      onChange={(val) => {
                        setSearchError("");
                        setStartDate(val);
                        if (val && endDate) fetchCalculatedPrices(val, endDate);
                      }}
                    />
                  </div>

                  {/* Pick-up */}
                  <div>
                    <Label className="text-xs font-semibold text-white mb-1.5 block uppercase tracking-wide">
                      Pick-up Date &amp; Time
                    </Label>
                    <DateTimePicker
                      homepage
                      value={endDate}
                      onChange={(val) => {
                        setSearchError("");
                        setEndDate(val);
                        if (startDate && val)
                          fetchCalculatedPrices(startDate, val);
                      }}
                    />
                  </div>

                  <AnimatePresence>
                    {searchError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-destructive flex items-center gap-1.5 overflow-hidden"
                      >
                        <XCircle className="w-4 h-4 shrink-0" />
                        {searchError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="bg-purple-grad relative w-full py-3 text-base font-semibold overflow-hidden rounded-xl"
                    >
                      <div className="absolute inset-0 pointer-events-none">
                        <NoiseTexture
                          frequency={1}
                          octaves={10}
                          slope={0.6}
                          noiseOpacity={1}
                        />
                      </div>
                      <span className="relative z-10">Compare Prices Now</span>
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-purple-grad relative overflow-hidden">
        <div className="absolute inset-0 z-10 pointer-events-none">
          <NoiseTexture
            frequency={1}
            octaves={10}
            slope={0.6}
            noiseOpacity={1}
          />
        </div>
        <motion.div
          className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 flex flex-col sm:flex-row items-center justify-around gap-5 sm:gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {[
            {
              icon: <PiggyBank className="w-7 h-7 text-white" />,
              title: "Users saved up to £42",
              sub: "this week alone",
            },
            {
              icon: <ShieldCheck className="w-7 h-7 text-white" />,
              title: "Trusted Providers",
              sub: "Fully vetted & secure",
            },
            {
              icon: <XCircle className="w-7 h-7 text-white" />,
              title: "No Hidden Fees",
              sub: "What you see is what you pay",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, ease },
                },
              }}
              className="flex items-center gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: 8 }}
                transition={{ type: "spring", stiffness: 380 }}
              >
                {s.icon}
              </motion.div>
              <div>
                <p className="text-white font-bold text-base">{s.title}</p>
                <p className="text-white/75 text-xs">{s.sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <div className="bg-[url('/separate_circles.svg')] bg-no-repeat bg-position-[left_50%]">
        {/* ══════════════════════════════════════════════════════════════════════
          HOW IT WORKS  — animated wave + staggered step reveal
          ══════════════════════════════════════════════════════════════════════ */}
        <HowItWorksSection />

        {/* ══════════════════════════════════════════════════════════════════════
          OUR MISSION
          ══════════════════════════════════════════════════════════════════════ */}

        <section className="relative overflow-hidden py-16 sm:py-20 px-4 sm:px-8 lg:px-16">
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* ── LEFT: text content ── */}
              <div className="space-y-8 max-w-xl">
                {/* Heading */}
                <InView>
                  <h2 className="font-roboto text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.05]">
                    <span className="text-foreground">Our </span>
                    <span className="text-primary">Mission</span>
                  </h2>
                </InView>

                {/* Intro */}
                <InView delay={0.08}>
                  <p className="text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">
                    CompareHeathrowParking.uk helps travelers find the best
                    parking deals quickly and easily. We believe airport parking
                    should never cost more than your flight.
                  </p>
                </InView>
                <motion.div
                  className="relative flex items-end justify-center lg:justify-end"
                  initial={{ opacity: 0, x: 48 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.85 }}
                >
                  <img
                    src="/about.svg"
                    alt="Heathrow parking car illustration"
                    className="lg:hidden 
            w-full 
            max-w-[420px] sm:max-w-[520px] 
            lg:max-w-none lg:w-[600px] xl:w-[800px] 
            object-contain drop-shadow-xl
          "
                  />
                </motion.div>
                {/* Paragraph 1 */}
                <InView delay={0.16}>
                  <p className="text-sm sm:text-base leading-7 text-muted-foreground">
                    We cut through the noise by aggregating real-time prices
                    from trusted local operators, giving you transparent,
                    side-by-side comparisons. No bias — just the best deals
                    tailored to your travel dates.
                  </p>
                </InView>

                {/* Paragraph 2 */}
                <InView delay={0.2}>
                  <p className="text-sm sm:text-base leading-7 text-muted-foreground">
                    Our platform makes Heathrow parking fast, simple, and
                    reliable — helping you book secure parking in just a few
                    clicks without unnecessary friction.
                  </p>
                </InView>

                {/* CTA */}
                <InView delay={0.28}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-block"
                  >
                    <Link
                      href="/compare"
                      className="bg-purple-grad relative inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-md font-semibold text-white shadow-xl overflow-hidden text-sm sm:text-base"
                    >
                      <div className="absolute inset-0 pointer-events-none">
                        <NoiseTexture
                          frequency={1}
                          octaves={10}
                          slope={0.6}
                          noiseOpacity={1}
                        />
                      </div>
                      <span className="relative z-10 flex items-center gap-2">
                        Compare Prices Now
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.span>
                      </span>
                    </Link>
                  </motion.div>
                </InView>
              </div>

              {/* ── RIGHT: illustration ── */}
              <motion.div
                className="relative flex items-end justify-center lg:justify-end"
                initial={{ opacity: 0, x: 48 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.85 }}
              >
                <img
                  src="/about.svg"
                  alt="Heathrow parking car illustration"
                  className="hidden lg:block
            w-full 
            max-w-[420px] sm:max-w-[520px] 
            lg:max-w-none lg:w-[600px] xl:w-[700px] 
            object-contain drop-shadow-xl
          "
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
          WHY CHOOSE US
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative py-16 sm:py-20 px-4 sm:px-8 lg:px-16">
          <InView className="text-center mb-8">
            <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl mb-3 font-roboto">
              Why Choose <span className="text-primary">Us</span>
            </h2>
            <p className="text-muted-foreground text-base">
              We do the heavy lifting so you can focus on packing your bags.
            </p>
          </InView>

          {/* Banner image strip */}
          <InView className="relative h-56 overflow-hidden rounded-[2rem] sm:h-72 max-w-7xl mx-auto sm:rounded-[2.5rem] lg:h-[320px]">
            {/* <div className="absolute inset-0 z-10" /> */}
            <Image
              src="/choose.svg"
              alt="Parking lot"
              fill
              className="object-cover object-center scale-105"
              sizes="100vw"
            />
          </InView>

          <motion.div
            className="relative z-20 mx-auto -mt-12 grid max-w-6xl grid-cols-1 gap-4 px-2 sm:-mt-16 sm:grid-cols-2 sm:gap-6 sm:px-6 xl:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {whyCards.map((c, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.55, ease },
                  },
                }}
                whileHover={{ scale: 1.04, y: -6 }}
                className="flex flex-col items-center gap-3 rounded-2xl border border-primary/10 bg-white px-5 py-6 text-center shadow-lg shadow-black/5"
              >
                <motion.div
                  className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center"
                  whileHover={{
                    borderRadius: "50%",
                  }}
                  transition={{ stiffness: 350 }}
                >
                  {c.icon}
                </motion.div>
                <div>
                  <p className="font-bold text-foreground text-sm">{c.title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>

      <div className="bg-[url('/circles.svg')] bg-no-repeat bg-[length:auto_95%] bg-position-[center_80%] ">
        {/* ══════════════════════════════════════════════════════════════════════
          ONLY THE BEST PROVIDERS
          ══════════════════════════════════════════════════════════════════════ */}

        <section
          id="providers"
          className="py-16 sm:py-20 px-4 sm:px-8 lg:px-16 "
        >
          <div className="max-w-7xl mx-auto">
            <InView className="text-center mb-10">
              <h2 className="font-boldtext-3xl sm:text-4xl lg:text-5xl mb-3 font-roboto">
                Only The <span className="text-primary">Best</span> Providers
              </h2>
              <p className="text-muted-foreground text-base max-w-lg mx-auto">
                We do the heavy lifting so you can focus on packing your bags.
              </p>
            </InView>

            <motion.div
              className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 lg:gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={{ visible: { transition: { staggerChildren: 0.13 } } }}
            >
              {BUSINESSES.filter((b) => b.businessId !== null).map((b, i) => {
                const p = prices[b.id];
                const price = p?.totalPrice ?? p?.startingPrice;
                const displayPrice =
                  price != null ? `£${price.toFixed(2)}` : null;

                const isActive = clickedCard === b.id;
                return (
                  <motion.div
                    key={b.id}
                    variants={{
                      hidden: { opacity: 0, y: 32, scale: 0.95 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { duration: 0.55, ease },
                      },
                    }}
                  >
                    {/*
                     * z-0  back wall  — parking image, full folder height
                     * z-10 inner card — half-peeking at rest, rises out on hover/click
                     * z-20 front wall — parking image + white overlay, always visible,
                     *                   card simply rises above it geometrically
                     */}
                    <div
                      className="relative h-[310px] cursor-pointer select-none"
                      // style={{ perspective: 1200 }}
                      onClick={() => setClickedCard(isActive ? null : b.id)}
                    >
                      {/* ── Folder tab ── */}
                      {/* <div className="absolute top-0 left-5 w-28 h-[26px] z-30 rounded-t-2xl overflow-hidden border border-b-0 border-white/30 shadow-sm">
                      <div className="absolute inset-0 bg-[url('/hero.svg')] bg-cover bg-center scale-110" />
                      <div className="absolute inset-0 bg-primary/30" />
                    </div> */}

                      {/* ── Back wall — parking image fills it ── */}
                      <div className="absolute inset-x-0 top-[22px] bottom-0 rounded-2xl  z-0 overflow-hidden border border-primarylight shadow-md">
                        <div className="absolute inset-0 bg-[url('/hero.svg')] bg-cover bg-center" />
                        {/* tint so the card pops against it */}
                        <div className="absolute inset-0 bg-white/90" />
                      </div>

                      {/* ── Inner card — half-inside at rest, pops out on interact ── */}
                      <motion.div
                        className="absolute inset-x-4 z-10"
                        style={{ top: 46 }}
                        animate={{
                          y: isActive ? -70 : 0,
                          scale: isActive ? 1.03 : 1,
                          rotateX: isActive ? -12 : 0,
                          rotateY: isActive ? -6 : 0,
                          // rotateZ: isActive ? -1.5 : 0,
                          filter: isActive
                            ? "drop-shadow(0 24px 36px rgba(0,0,0,0.30))"
                            : "drop-shadow(0 4px 10px rgba(0,0,0,0.14))",
                        }}
                        whileHover={{
                          y: -70,
                          scale: 1.03,
                          rotateX: -12,
                          rotateY: -6,
                          // rotateZ: isActive ? -1.5 : 0,
                          filter: "drop-shadow(0 24px 36px rgba(0,0,0,0.30))",
                        }}
                        transition={{
                          stiffness: 220,
                          damping: 18,
                        }}
                      >
                        <div className="overflow-hidden rounded-[20px]">
                          {/* Full-bleed primarylight with radial white glow */}
                          <div className="relative bg-primary overflow-hidden px-6 pt-6 pb-6 flex flex-col gap-4">
                            {/* Noise grain */}
                            {/* <div className="absolute inset-0 pointer-events-none">
                            <NoiseTexture
                              frequency={1}
                              octaves={10}
                              slope={0.5}
                              noiseOpacity={0.7}
                            />
                          </div> */}
                            {/* Radial glow — top-left */}
                            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,255,255,0.55),transparent_58%)]" />

                            {/* Price heading */}
                            <div className="relative z-10">
                              <p className="text-white/60 text-[10px] font-semibold text-center  uppercase tracking-[0.2em] mb-2">
                                Starting From
                              </p>
                              <p className="text-white font-bold text-[2.8rem] text-center leading-none">
                                {p?.loading ? (
                                  <span className="w-28 h-11 bg-white/20 animate-pulse rounded inline-block" />
                                ) : displayPrice ? (
                                  displayPrice
                                ) : (
                                  <span className="text-2xl opacity-60">
                                    Fetching…
                                  </span>
                                )}
                              </p>
                            </div>

                            {/* Get Started */}
                            <Link
                              href="/compare"
                              className="relative z-10 block w-full bg-white text-primary font-bold text-sm text-center py-[11px] rounded-2xl shadow hover:bg-white/92 active:scale-[0.97] transition-all duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Get Started
                            </Link>
                          </div>
                        </div>
                      </motion.div>

                      {/* ── Front wall — fixed, always visible, card rises above it ── */}
                      <div className="absolute inset-x-0 bottom-0 h-[132px] rounded-b-2xl z-20 pointer-events-none overflow-hidden border border-primarylight/50">
                        {/* Parking image behind white wash */}
                        <div className="absolute inset-0 bg-[url('/hero.svg')] bg-cover bg-center" />
                        {/* White wash — heavier at bottom, lighter at top edge */}
                        <div className="absolute inset-0 bg-white/90" />
                        {/* Depth lip at the top of the front wall */}
                        {/* <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary/20" /> */}
                        {/* <div className="absolute top-[3px] left-0 right-0 h-5 bg-gradient-to-b from-black/[0.07] to-transparent" /> */}
                        {/* Provider info */}
                        <div className="relative z-10 px-5 pt-5 ">
                          <span className="inline-block text-[11px] font-semibold text-muted-foreground  py-[3px] rounded-full">
                            {b.type}
                          </span>
                          <div>
                            <span className="text-xl text-primary/80 font-bold ">
                              Live Price of{" "}
                            </span>
                            <span className="font-bold text-primary text-2xl leading-snug">
                              {b.name.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
          TRAVELERS LOVE US
      ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 px-4 sm:px-8 lg:px-16 lg:mb-10">
          <div className="max-w-7xl mx-auto">
            <InView className="text-center mb-10 sm:mb-12">
              <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl mb-2 font-roboto">
                Travelers Love <span className="text-primary">Us</span>
              </h2>
              <p className="text-muted-foreground text-base">
                Join thousands of smart travelers who never overpay for parking.
              </p>
            </InView>

            <motion.div
              className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={{ visible: { transition: { staggerChildren: 0.13 } } }}
            >
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease },
                    },
                  }}
                >
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}
                    className="h-full"
                  >
                    <Card className="h-full border border-primarylight/50 hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        {/* Stars */}
                        <div className="flex gap-0.5 mb-4">
                          {[...Array(5)].map((_, si) => (
                            <motion.div
                              key={si}
                              initial={{ opacity: 0, scale: 0 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{
                                delay: 0.3 + si * 0.07,
                                type: "spring",
                                stiffness: 400,
                              }}
                            >
                              <Star
                                className={`w-4 h-4 ${si < t.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-200"}`}
                              />
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-foreground/85 text-sm italic leading-relaxed mb-5">
                          &ldquo;{t.quote}&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                          <Image
                            src={t.avatar}
                            alt={t.name}
                            width={40}
                            height={40}
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
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          FREQUENTLY ASKED QUESTIONS
          Image LEFT  ·  Accordion RIGHT
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="faq"
        className="relative px-4 py-16 sm:px-8 sm:py-20 lg:px-16 bg-[url('/faqs.svg')] bg-no-repeat "
      >
        <div className="relative max-w-7xl mx-auto ">
          <InView className="mb-10 text-center sm:mb-12">
            <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl mb-2 font-roboto ">
              Frequently Asked{" "}
              <em className="text-primary/90 not-italic">Questions</em>
            </h2>
            <p className="text-muted-foreground text-base text-center">
              Everything you need to know about comparing and booking.
            </p>
          </InView>

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
            {/* Left: image */}
            <InView className="hidden lg:block" from="left">
              <div className="relative overflow-hidden rounded-[2rem] ">
                {/* <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.14),transparent_38%)]" />
                <div className="relative mx-auto aspect-[4/5] w-full max-w-[440px]">
                  <Image
                    src="/faqs.svg"
                    alt="Heathrow parking frequently asked questions illustration"
                    fill
                    sizes="440px"
                    className="object-contain"
                  />
                </div> */}
              </div>
            </InView>

            {/* Right: accordion */}
            <div className="flex flex-col gap-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  className="border border-primarylight/50 bg-white  rounded-xl"
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left group"
                  >
                    <span className="font-semibold text-foreground text-base pr-4 group-hover:text-primary transition-colors duration-200">
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.28 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <p className="text-muted-foreground text-sm p-4 pt-0 leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════════════════════ */}
      {/* <section className="py-8 sm:py-12 px-4 sm:px-8 lg:px-16">
        <motion.div
          className="max-w-6xl mx-auto rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden relative min-h-[260px] sm:min-h-[300px] flex items-center justify-center text-center"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="absolute inset-0">
            <Image
              src="/Background+Shadow.svg"
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1152px"
              className="bg-purple-grad object-cover"
              priority={false}
            />
            <div className="absolute inset-0 opacity-80 bg-primary" />
            <NoiseTexture
              frequency={1}
              octaves={10}
              slope={0.6}
              noiseOpacity={1}
            />
          </div>

          <div className="relative z-10 px-6 sm:px-12 py-10 sm:py-0 w-full">
            <motion.h2
              className="font-bold text-white text-2xl sm:text-[35px] sm:leading-[46px] mb-3 sm:mb-4 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.6, ease }}
            >
              Find the Best Heathrow Parking Deal Today
            </motion.h2>
            <motion.p
              className="text-white/85 text-sm sm:text-base leading-relaxed max-w-[600px] mx-auto mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.6, ease }}
            >
              Stop searching multiple sites. Enter your dates once and let us
              find the cheapest, most secure parking for your trip.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.6, ease }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/compare"
                className="inline-block bg-white text-primary font-bold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-xl hover:bg-white/90 transition-colors"
              >
                Compare Prices Now
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section> */}
    </div>
  );
}
