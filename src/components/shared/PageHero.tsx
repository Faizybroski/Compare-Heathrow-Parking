"use client";

import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  subtitle?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/hero.svg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/50" />

      {/* Ambient glows matching homepage */}
      <motion.div
        className="absolute -left-20 top-1/4 w-80 h-80 rounded-full bg-primary/25 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 bottom-0 w-64 h-64 rounded-full bg-primary/15 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.22, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 pt-32 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
          className="font-roboto text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow-lg"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.15 }}
            className="text-lg opacity-85 max-w-xl mx-auto drop-shadow"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
