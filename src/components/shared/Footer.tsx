"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const imgGradientBg =
  "https://www.figma.com/api/mcp/asset/d3f0dc2f-5c9f-4084-aa74-c1c48c2fbe1a";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="relative mt-4 rounded-tl-[42px] rounded-tr-[42px] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image src={imgGradientBg} alt="" fill className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-black/50 rounded-tl-[42px] rounded-tr-[42px]" />

      <div className="relative z-10 px-4 sm:px-8 lg:px-10 pt-8 sm:pt-10 pb-6">
        {/* Top white card */}
        <div className="bg-white rounded-[24px] sm:rounded-[34px] p-6 sm:p-10 mb-8 sm:mb-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
          {/* Brand – spans full width on mobile, 2 cols on sm, 1 col on lg */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-flex mb-5">
              <Image src="/purple_logo.svg" alt="Logo" width={200} height={80} />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[252px] mb-6">
              The smart way to find, compare, and save on airport parking at
              London Heathrow.
            </p>
            <div className="flex gap-2">
              {["f", "t", "in"].map((s) => (
                <div
                  key={s}
                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-foreground text-base mb-4">Services</h4>
            {["Meet & Greet", "Park & Ride", "On-Airport Parking", "Long Stay"].map(
              (l) => (
                <p key={l} className="text-muted-foreground text-sm mb-2">
                  {l}
                </p>
              ),
            )}
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-foreground text-base mb-4">Company</h4>
            {["About Us", "Providers", "Contact", "Blog"].map((l) => (
              <p key={l} className="text-muted-foreground text-sm mb-2">
                {l}
              </p>
            ))}
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-foreground text-base mb-4">Legal</h4>
            {["Terms of Service", "Privacy Policy", "Cookie Policy", "FAQ"].map(
              (l) => (
                <p key={l} className="text-muted-foreground text-sm mb-2">
                  {l}
                </p>
              ),
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:items-start lg:items-end">
            <button className="bg-purple-grad text-white text-sm font-semibold px-6 py-2 rounded-full mb-4 hover:opacity-90 transition-opacity">
              Request a call
            </button>
            <div className="flex flex-col items-start sm:items-start lg:items-end gap-1">
              <p className="font-semibold text-foreground text-sm">07508624155</p>
              <p className="font-semibold text-foreground text-sm">info@compareheathrowparking.uk</p>
            </div>
          </div>
        </div>

        {/* Newsletter row */}
        {/* <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-12 mb-8">
          <h3 className="font-extrabold text-white text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight lg:max-w-[480px] xl:max-w-[647px]">
            Still Looking for the Perfect Parking Deal?
          </h3>
          <div className="w-full lg:max-w-[520px] xl:max-w-[672px]">
            <p className="text-white text-sm font-medium mb-3">
              Just send us your contact email and we will contact you.
            </p>
            <div className="flex items-center justify-between border border-white/60 rounded-xl px-4 py-3 gap-4">
              <div className="min-w-0">
                <p className="text-white/50 text-[10px] uppercase tracking-wider font-medium mb-1">
                  Your email
                </p>
                <p className="text-white text-sm sm:text-base truncate">
                  you@example.com
                </p>
              </div>
              <button className="bg-purple-grad shrink-0 text-white text-sm font-semibold px-4 sm:px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
          </div>
        </div> */}

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-between text-white text-xs border-t border-white/10 pt-4 gap-2 text-center sm:text-left">
          <p>© 2026 CompareHeathrowParking.uk. All rights reserved.</p>
          <p>Privacy policy · SSL Secure · Verified Providers</p>
        </div>
      </div>
    </footer>
  );
}
