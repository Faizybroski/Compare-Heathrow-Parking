"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, Star, BadgeDollarSign } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import Link from "next/link";
import { NoiseTexture } from "@/components/ui/noise-texture";
import { ArrowRight } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const items = [
  {
    icon: ShieldCheck,
    title: "24/7 Security",
    desc: "CCTV monitored with regular security patrols around the clock.",
  },
  {
    icon: Star,
    title: "50,000+ Happy Customers",
    desc: "Trusted by thousands of travellers every year across all terminals.",
  },
  {
    icon: BadgeDollarSign,
    title: "Best Price Guarantee",
    desc: "Competitive rates with transparent, no-hidden-fee pricing.",
  },
];

function InView({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="About Heathrow Safe Parking"
        subtitle="Your trusted airport parking partner"
      />

      <section className="py-16 sm:py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Mission card */}
          <InView>
            <div className="rounded-2xl border border-primary/15 bg-white shadow-sm p-8">
              <h2 className="font-roboto text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Our <span className="text-primary">Mission</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base">
                At Heathrow Safe Parking, we believe airport parking should be
                simple, affordable, and stress-free. We provide secure, monitored
                parking spaces with a seamless online booking experience — no
                accounts, no hassle. Just book, park, and fly.
              </p>
              <motion.div
                className="mt-6"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/compare"
                  className="bg-purple-grad relative inline-flex items-center gap-2 px-7 py-3 rounded-md text-white font-semibold text-sm overflow-hidden shadow-lg"
                >
                  <div className="absolute inset-0 pointer-events-none">
                    <NoiseTexture frequency={1} octaves={10} slope={0.6} noiseOpacity={1} />
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
            </div>
          </InView>

          {/* Stat cards */}
          <motion.div
            className="grid sm:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 28, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease } },
                  }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-primary/10 bg-white px-5 py-7 text-center shadow-lg shadow-black/5 cursor-default"
                >
                  <motion.div
                    className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center"
                    whileHover={{ borderRadius: "50%", backgroundColor: "rgba(var(--color-primary), 0.18)" }}
                    transition={{ stiffness: 350 }}
                  >
                    <Icon className="w-6 h-6 text-primary" />
                  </motion.div>
                  <p className="font-bold text-foreground text-sm">{item.title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </section>
    </div>
  );
}
