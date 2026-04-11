"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const client = new QueryClient();

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <QueryClientProvider client={client}>
        <Navbar />
        <main className={`flex-1`}>{children}</main>
        <Footer />
      </QueryClientProvider>
    </>
  );
}
