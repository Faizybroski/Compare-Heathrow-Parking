"use client";

import Image from "next/image";

interface PageHeroProps {
  title: string;
  subtitle?: string;
}

/**
 * Shared hero banner for all sub-pages.
 * Uses the same parking-lot background image + diagonal orange strips as the
 * homepage hero so every page feels visually consistent.
 */
export default function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* ─ Background image ─ */}
      <div className="absolute inset-0 bg-[url('/hero.svg')] bg-cover bg-center" />

      {/* ─ Dark overlay for readability ─ */}
      <div className="absolute inset-0 bg-black/40" />

      {/* ─ Diagonal orange accent strips (same SVG as homepage) ─ */}
      {/* <Image
        src="/hero_strips.svg"
        alt=""
        width={1440}
        height={900}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover "
      /> */}

      {/* ─ Content ─ */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 pt-32 text-center text-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow-lg animate-slide-up">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg opacity-85 max-w-xl mx-auto animate-fade-in drop-shadow">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
