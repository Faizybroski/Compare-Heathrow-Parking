"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";


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
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="bg-purple-grad sticky top-0 z-50 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo.svg" alt="Logo" width={150} height={40} />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-white text-sm font-medium hover:text-white/80 transition-colors"
            >
              {label}
            </Link>
          ))}
          <button type="button" className="bg-white text-primary text-sm font-bold px-6 py-2 rounded-full shadow-[0_0_20px_rgba(122,63,255,0.3)] hover:bg-white/90 transition-colors">
            Compare Now
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="lg:hidden border-t border-white/10 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="text-white/90 text-sm font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                {label}
              </a>
            ))}
            <button type="button" className="mt-2 bg-white text-primary text-sm font-bold px-6 py-3 rounded-full hover:bg-white/90 transition-colors w-full">
              Compare Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
