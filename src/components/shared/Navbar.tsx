"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NoiseTexture } from "@/components/ui/noise-texture";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book Now" },
  { href: "/pricing", label: "Pricing" },
  { href: "/track", label: "Track Booking" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faqs", label: "FAQs" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const linkColor = pastHero ? "text-primary hover:text-primary/70" : "text-white hover:text-white/80";
  const iconColor = pastHero ? "bg-primary text-white hover:text-primary hover:bg-white" : "text-primary bg-white hover:text-white hover:bg-primary";
  const navBg    = pastHero ? "bg-white/95 border-primary/20" : "bg-transparent border-primary/50";
  const navLogo = pastHero ? "/purple_logo.svg" : "/logo.svg";

  return (
    <nav className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-7xl w-[94%] rounded-full backdrop-blur-sm shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.06),0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] border transition-colors duration-300 ${navBg}`}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image src={navLogo} alt="Logo" width={150} height={40} />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors duration-300 ${linkColor}`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/compare"
            className={`relative text-sm font-bold px-6 py-2 rounded-md shadow-[0_0_20px_rgba(122,63,255,0.3)] hover:opacity-90 transition-opacity overflow-hidden ${iconColor}`}
          >
            {/* <div className="absolute inset-0 pointer-events-none">
              <NoiseTexture frequency={1} octaves={10} slope={0.6} noiseOpacity={0.6} />
            </div> */}
            <span className="relative z-10">Compare Now</span>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${iconColor} `}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
            className="relative z-10 lg:hidden border-t border-primary/10"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <motion.a
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className={`text-sm font-medium px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-primary/10 ${pastHero ? "text-primary" : "text-white/90"}`}
                >
                  {label}
                </motion.a>
              ))}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="mt-2"
              >
                <Link
                  href="/compare"
                  onClick={() => setIsOpen(false)}
                  className="bg-purple-grad relative flex items-center justify-center gap-2 px-6 py-3 rounded-md text-white font-semibold text-sm overflow-hidden shadow-md"
                >
                  <div className="absolute inset-0 pointer-events-none">
                    <NoiseTexture frequency={1} octaves={10} slope={0.6} noiseOpacity={0.6} />
                  </div>
                  <span className="relative z-10">Compare Now</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
