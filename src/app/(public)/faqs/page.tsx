"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import Link from "next/link";
import { NoiseTexture } from "@/components/ui/noise-texture";
import { ArrowRight } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const faqs = [
  {
    q: "How do I book a parking space?",
    a: "Simply visit our booking page, enter your drop-off and pick-up dates, fill in your personal and vehicle details, and confirm your booking. You'll receive an instant confirmation with your tracking number.",
  },
  {
    q: "Do I need to create an account?",
    a: "No! We've made it simple — no account needed. Just book and go. You'll get a tracking number to manage your booking.",
  },
  {
    q: "How is the price calculated?",
    a: "Our pricing is based on chargeable days. Days 1 to 10 use the admin-set prices, day 11 to 30 adds £3 per extra day, and day 31 onward adds £2 per extra day.",
  },
  {
    q: "Can I track my booking?",
    a: "Yes! Use your unique tracking number on our Track Booking page to check your booking status, slot number, and time remaining at any time.",
  },
  {
    q: "What happens if I pick up my car late?",
    a: "If you keep the car beyond the booked period and cross into extra chargeable days, the total is recalculated using the same day-based pricing and collected when you pick up the car.",
  },
  {
    q: "Is the car park secure?",
    a: "Absolutely. Our facility has 24/7 CCTV surveillance, security patrols, and controlled access. Your vehicle is in safe hands.",
  },
  {
    q: "Can I cancel or modify my booking?",
    a: "Please contact our support team with your tracking number and we'll be happy to assist with any changes or cancellations.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards. Payment is processed securely at the time of booking.",
  },
];

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions"
      />

      <section className="py-16 sm:py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto">

          <motion.div
            className="flex flex-col gap-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, x: 24 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
                }}
                className="border border-primary/15 bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left group"
                >
                  <span className="font-semibold text-foreground text-sm sm:text-base pr-4 group-hover:text-primary transition-colors duration-200">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.28, ease }}
                    className="shrink-0"
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <p className="text-muted-foreground text-sm px-5 pb-5 pt-0 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
          >
            <p className="text-muted-foreground text-sm mb-4">
              Still have questions? We&apos;re happy to help.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/contact"
                className="bg-purple-grad relative inline-flex items-center gap-2 px-7 py-3 rounded-md text-white font-semibold text-sm overflow-hidden shadow-lg"
              >
                <div className="absolute inset-0 pointer-events-none">
                  <NoiseTexture frequency={1} octaves={10} slope={0.6} noiseOpacity={1} />
                </div>
                <span className="relative z-10 flex items-center gap-2">
                  Contact Us
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
