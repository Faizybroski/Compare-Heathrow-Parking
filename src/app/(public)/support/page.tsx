"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, HelpCircle, Mail, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { NoiseTexture } from "@/components/ui/noise-texture";
import PageHero from "@/components/shared/PageHero";

const ease = [0.22, 1, 0.36, 1] as const;

const quickLinks = [
  {
    href: "/track",
    icon: MapPin,
    label: "Track My Booking",
    desc: "Check your booking status with your tracking number",
  },
  {
    href: "/faqs",
    icon: HelpCircle,
    label: "FAQs",
    desc: "Find answers to common questions",
  },
  {
    href: "/contact",
    icon: Mail,
    label: "Contact Us",
    desc: "Get in touch directly",
  },
];

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <PageHero title="Support" subtitle="Need help? We're here for you" />

      <section className="py-16 sm:py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">

            {/* Left column */}
            <motion.div
              className="space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {/* Quick Help */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -28 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease } },
                }}
                className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm"
              >
                <h2 className="font-roboto text-lg font-bold text-foreground mb-4">
                  Quick Help
                </h2>
                <div className="space-y-3">
                  {quickLinks.map(({ href, icon: Icon, label, desc }) => (
                    <motion.div
                      key={href}
                      whileHover={{ x: 4, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 320, damping: 20 }}
                    >
                      <Link
                        href={href}
                        className="flex items-start gap-3 p-4 rounded-xl border border-primary/10 bg-background hover:border-primary/30 hover:shadow-md transition-shadow duration-200 group"
                      >
                        <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                            {label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Emergency contact */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -28 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease } },
                }}
                className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">Emergency Contact</h3>
                </div>
                <p className="text-sm text-muted-foreground">For urgent matters, call us at:</p>
                <p className="text-xl font-bold mt-1 text-primary">07508624155</p>
                <p className="text-xs text-muted-foreground mt-0.5">Available 24/7</p>
              </motion.div>
            </motion.div>

            {/* Support request form */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease }}
              className="rounded-2xl border border-primary/15 bg-white p-6 sm:p-8 shadow-sm"
            >
              <h2 className="font-roboto text-lg font-bold text-foreground mb-6">
                Submit a Support Request
              </h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease }}
                  className="text-center py-10"
                >
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7 text-green-500" />
                  </div>
                  <p className="font-bold text-foreground">Request submitted!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We&apos;ll respond within 4 hours.
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                  className="space-y-4"
                >
                  {[
                    { type: "text", placeholder: "Your Name", required: true },
                    { type: "email", placeholder: "Your Email", required: true },
                    { type: "text", placeholder: "Tracking Number (if applicable)", required: false },
                  ].map((inp, i) => (
                    <input
                      key={i}
                      type={inp.type}
                      placeholder={inp.placeholder}
                      required={inp.required}
                      className="w-full px-4 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                  ))}

                  <select
                    required
                    className="w-full px-4 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  >
                    <option value="">Select Issue Type</option>
                    <option value="booking">Booking Issue</option>
                    <option value="payment">Payment Issue</option>
                    <option value="parking">Parking Issue</option>
                    <option value="other">Other</option>
                  </select>

                  <textarea
                    rows={4}
                    placeholder="Describe your issue"
                    required
                    className="w-full px-4 py-2.5 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <button
                      type="submit"
                      className="bg-purple-grad relative w-full inline-flex items-center justify-center gap-2 py-3 rounded-md text-white font-semibold text-sm overflow-hidden shadow-md"
                    >
                      <div className="absolute inset-0 pointer-events-none">
                        <NoiseTexture frequency={1} octaves={10} slope={0.6} noiseOpacity={1} />
                      </div>
                      <span className="relative z-10 flex items-center gap-2">
                        Submit Request
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  </motion.div>
                </form>
              )}
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
