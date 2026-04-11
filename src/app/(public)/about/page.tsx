import type { Metadata } from "next";
import { ShieldCheck, Star, BadgeDollarSign } from "lucide-react";
import PageHero from "@/components/shared/PageHero";

export const metadata: Metadata = {
  title: "About Us - Heathrow Safe Parking",
  description: "Learn about Heathrow Safe Parking airport parking services.",
};

const items = [
  {
    icon: ShieldCheck,
    title: "24/7 Security",
    desc: "CCTV monitored with regular security patrols",
    color: "text-white",
    bg: "bg-gradient-to-br from-green-500 to-green-200",
  },
  {
    icon: Star,
    title: "50,000+ Happy Customers",
    desc: "Trusted by thousands of travellers every year",
    color: "text-white",
    bg: "bg-gradient-to-br from-yellow-500 to-yellow-200",
  },
  {
    icon: BadgeDollarSign,
    title: "Best Price Guarantee",
    desc: "Competitive rates with transparent pricing",
    color: "text-white",
    bg: "bg-gradient-to-br from-blue-500 to-blue-200",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="About Heathrow Safe Parking"
        subtitle="Your trusted airport parking partner"
      />
      <div className="relative min-h-screen overflow-hidden bg-white">
        {/* Diagonal Background */}
        {/* <div className="absolute inset-0"> */}
        {/* Main diagonal block */}
        {/* <div className="absolute inset-0 bg-primary-light/20 clip-main"></div> */}
        {/* <div className="pointer-events-none absolute inset-0 z-0 diagonal-bg" /> */}
        {/* <div className="absolute inset-0 pointer-events-none zigzag-svg z-0" /> */}
        {/* Thin stripe */}
        {/* <div className="absolute inset-0 bg-primary-light/20 clip-stripe"></div> */}
        {/* </div> */}
        {/* <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 18px,
            var(--primary) 18px,
            var(--primary) 20px
          )`,
          }}
        /> */}
        <section className="relative py-16 max-w-4xl mx-auto px-4 z-10">
          {/* <DiagonalStripesBg /> */}
          {/* <div className="pointer-events-none absolute -right-28 top-1/2 h-[500px] w-64 -translate-y-1/2 rotate-[18deg] rounded bg-orange-100/50" /> */}
          {/* Content */}
          {/* <div className=""> */}
          <div className="space-y-8">
            <div
              className="rounded-2xl border p-8"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "var(--foreground)" }}
              >
                Our Mission
              </h2>
              <p
                className="leading-relaxed"
                style={{ color: "var(--muted-foreground)" }}
              >
                At Heathrow Safe Parking, we believe airport parking should be simple,
                affordable, and stress-free. We provide secure, monitored
                parking spaces with a seamless online booking experience — no
                accounts, no hassle. Just book, park, and fly.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {items.map((item, i) => {
                const Icon = item.icon;

                return (
                  <div
                    key={i}
                    className="rounded-2xl border p-6 text-center"
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div
                      className={`w-14 h-14 mx-auto flex items-center justify-center rounded-xl mb-4 ${item.bg} group-hover:scale-110 transition`}
                    >
                      <Icon className={`w-7 h-7 ${item.color}`} />
                    </div>
                    {/* <div className="text-4xl mb-3">{item.icon}</div> */}
                    <h3
                      className="font-bold mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          {/* </div> */}
        </section>
      </div>
    </div>
  );
}
