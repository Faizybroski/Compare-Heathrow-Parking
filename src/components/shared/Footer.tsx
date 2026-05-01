"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="relative rounded-tl-[42px] rounded-tr-[42px] ring ring-white/20 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image src={"/footer.svg"} alt="" fill className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-black/10 rounded-tl-[42px] rounded-tr-[42px]" />

      <div className="relative z-10 px-4 sm:px-8 lg:px-10 pt-8 sm:pt-10 pb-6">
        {/* Top white card */}
        <div className="bg-transparent backdrop-blur-xs ring ring-white/20 rounded-[24px] sm:rounded-[34px] p-6 sm:p-10 mb-8 sm:mb-10 grid grid-cols-2  lg:grid-cols-4 gap-6 ">
          {/* Brand – spans full width on mobile, 2 cols on sm, 1 col on lg */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-flex mb-5">
              <Image
                // src="/purple_logo.svg"
                src="/logo.svg"

                alt="Logo"
                width={200}
                height={80}
              />
            </Link>
            <p className="text-white text-sm leading-relaxed max-w-[252px] mb-6">
              The smart way to find, compare, and save on airport parking at
              London Heathrow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-base mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/book", label: "Book Parking" },
                { href: "/track", label: "Track Booking" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-white opacity-70 hover:opacity-100 transition"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white text-base mb-4">
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/faqs", label: "FAQs" },
                { href: "/contact", label: "Contact Us" },
                // { href: "/support", label: "Support" },
                { href: "/about", label: "About Us" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-white opacity-70 hover:opacity-100 transition"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white text-base mb-4">
              Contact Us
            </h4>
            <div className="space-y-3 text-sm">
              {/* <div className="flex items-start gap-3 opacity-70 hover:opacity-100 transition">
                <a
                  href="https://maps.app.goo.gl/5Kpmej29MWZ5qRbD7"
                  target="_blank"
                  className="leading-snug"
                >
                  103 Pennine Way <br /> UB3 5LJ
                </a>
              </div> */}

              <div className="flex items-center gap-3 text-white opacity-70 hover:opacity-100 transition">
                <a href="tel:07508624155">07508624155</a>
              </div>

              <div className="flex items-center gap-3 text-white opacity-70 hover:opacity-100 transition">
                <a href="mailto:info@compareheathrowparking.uk">
                  info@compareheathrowparking.uk
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-between text-white text-xs border-t border-white/10 pt-4 gap-2 text-center sm:text-left">
          <p>
            Made with ❤️{" "}
            <a
              href="https://thesocialnexus.co.uk"
              className="underline hover:opacity-100 transition"
            >
              TSN
            </a>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center sm:justify-between text-white text-xs pt-4 gap-2 text-center sm:text-left">
          <p>© 2026 CompareHeathrowParking.uk. All rights reserved.</p>
          <p>Privacy policy · SSL Secure · Verified Providers</p>
        </div>
      </div>
    </footer>
  );
}
