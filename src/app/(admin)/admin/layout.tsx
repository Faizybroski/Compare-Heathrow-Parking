"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ClipboardList,
  BadgeDollarSign,
  LogOut,
} from "lucide-react";
import { api } from "@/lib/api";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/pricing", label: "Pricing", icon: BadgeDollarSign },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName] = useState(() => {
    if (typeof window === "undefined") return "Admin";

    try {
      const admin = localStorage.getItem("parkpro_admin");
      return admin ? JSON.parse(admin).name || "Admin" : "Admin";
    } catch {
      return "Admin";
    }
  });

  if (pathname === "/login") return <>{children}</>;

  const handleLogout = async () => {
    await api.logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`absolute inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 bg-primary ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:w-64 flex-shrink-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              {/* <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                style={{ background: "linear-gradient(135deg, #3b82f6, #60a5fa)" }}
              >
                PP
              </div>
              <span className="text-lg font-bold text-white">Heathrow Safe Parking</span> */}
              <Image src="/white_logo.svg" alt="Logo" width={200} height={50} />
              {/* <p className="flex items-center text-lg text-primary uppercase leading-none">
                <span className="font-bold">Park</span>
                <span className="font-normal">Pro</span>
              </p> */}
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {sidebarLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  pathname === href
                    ? "bg-white/60 text-primary border-white/90 border-l-5"
                    : "text-white hover:bg-white/50 hover:text-primary"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header
          className="h-16 border-b flex items-center px-4 lg:px-8 flex-shrink-0"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4 p-2 rounded-lg"
            style={{ color: "var(--foreground)" }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {sidebarLinks.find((l) => l.href === pathname)?.label || "Admin"}
          </h2>
          <div className="px-4 py-4 self-end ml-auto ">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold "
                style={{ background: "#3b82f6" }}
              >
                {adminName.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-medium text-white truncate flex-1">
                {adminName}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-primary hover:text-primary/50 hover:bg-primary/5 transition-all text-left"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
