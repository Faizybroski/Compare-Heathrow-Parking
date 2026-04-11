import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Heathrow Safe Parking - Secure Airport Parking",
  description:
    "Book secure, affordable airport parking with Heathrow Safe Parking. Guaranteed spaces, competitive prices, and hassle-free parking.",
  keywords: "airport parking, car park, booking, secure parking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        {/* <LayoutClient> */}
        {children}
        {/* </LayoutClient> */}
        {/* {admin ? null : <Navbar />}
        <main className="flex-1 pt-16">{children}</main>
        {admin ? null : <Footer />} */}
      </body>
    </html>
  );
}
