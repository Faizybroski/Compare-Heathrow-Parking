"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { DashboardStats } from "@/types";
import { formatPrice } from "@/lib/utils";
import { BUSINESSES, BusinessConfig } from "@/lib/businesses";
import {
  ClipboardList,
  Car,
  BadgeDollarSign,
  CalendarDays,
  ToggleRight,
  ToggleLeft,
  CreditCard,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

const realBusinesses = BUSINESSES.filter((b) => b.businessId !== null) as (BusinessConfig & {
  businessId: string;
})[];

type BizData = {
  stats: DashboardStats | null;
  toggleEnabled: boolean;
  loadingToggle: boolean;
  error: boolean;
};

export default function DashboardPage() {
  const [bizData, setBizData] = useState<Record<string, BizData>>(() =>
    Object.fromEntries(
      realBusinesses.map((b) => [
        b.businessId,
        { stats: null, toggleEnabled: true, loadingToggle: false, error: false },
      ]),
    ),
  );
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled(
      realBusinesses.map((b) =>
        Promise.all([
          api.getDashboard(b.businessId),
          api.getBookingToggle(b.businessId),
        ]),
      ),
    );

    setBizData((prev) => {
      const next = { ...prev };
      realBusinesses.forEach((b, i) => {
        const result = results[i];
        if (result.status === "fulfilled") {
          const [dashRes, toggleRes] = result.value;
          next[b.businessId] = {
            stats: dashRes.data,
            toggleEnabled: toggleRes.data.bookingEnabled,
            loadingToggle: false,
            error: false,
          };
        } else {
          next[b.businessId] = {
            ...prev[b.businessId],
            error: true,
            loadingToggle: false,
          };
        }
      });
      return next;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleToggle = async (businessId: string, newValue: boolean) => {
    setBizData((prev) => ({
      ...prev,
      [businessId]: { ...prev[businessId], loadingToggle: true },
    }));
    try {
      await api.setBookingToggle(newValue, businessId);
      setBizData((prev) => ({
        ...prev,
        [businessId]: { ...prev[businessId], toggleEnabled: newValue, loadingToggle: false },
      }));
    } catch {
      setBizData((prev) => ({
        ...prev,
        [businessId]: { ...prev[businessId], loadingToggle: false },
      }));
    }
  };

  // Aggregate across all businesses
  const allStats = realBusinesses
    .map((b) => bizData[b.businessId]?.stats)
    .filter(Boolean) as DashboardStats[];

  const aggregate = {
    totalBookings: allStats.reduce((s, x) => s + x.totalBookings, 0),
    activeBookings: allStats.reduce((s, x) => s + x.activeBookings, 0),
    totalRevenue: allStats.reduce((s, x) => s + x.totalRevenue, 0),
    todayBookings: allStats.reduce((s, x) => s + x.todayBookings, 0),
    stripeRevenue: allStats.reduce((s, x) => s + x.stripeRevenue, 0),
    upcomingBookings: allStats.reduce((s, x) => s + x.upcomingBookings, 0),
    completedBookings: allStats.reduce((s, x) => s + x.completedBookings, 0),
    cancelledBookings: allStats.reduce((s, x) => s + x.cancelledBookings, 0),
  };

  const topKpis = [
    {
      label: "Total Bookings",
      value: aggregate.totalBookings.toLocaleString(),
      icon: ClipboardList,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Active Parkings",
      value: aggregate.activeBookings.toLocaleString(),
      icon: Car,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Total Revenue",
      value: formatPrice(aggregate.totalRevenue),
      icon: BadgeDollarSign,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Today's Bookings",
      value: aggregate.todayBookings.toLocaleString(),
      icon: CalendarDays,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl animate-pulse"
              style={{ background: "var(--border)" }}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl animate-pulse"
              style={{ background: "var(--border)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
            Overview — All Businesses
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Showing only bookings made via Heathrow Compare
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:shadow-sm"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Aggregate KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topKpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border p-5 transition-all hover:shadow-md"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {kpi.label}
                </span>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg}`}
                >
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Aggregate revenue + status strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue */}
        <div
          className="rounded-2xl border p-6"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Combined Revenue
          </h3>
          <div className="space-y-3">
            <div
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: "var(--muted)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    Stripe Payments
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Collected online at checkout
                  </p>
                </div>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {formatPrice(aggregate.stripeRevenue)}
              </p>
            </div>
            <div
              className="border-t pt-3 flex items-center justify-between"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                  Total Revenue
                </p>
              </div>
              <p className="text-xl font-bold text-yellow-600">
                {formatPrice(aggregate.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        {/* Status overview */}
        <div
          className="rounded-2xl border p-6"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Booking Status Overview
          </h3>
          <div className="space-y-3">
            {[
              { label: "Upcoming", value: aggregate.upcomingBookings, color: "#3b82f6" },
              { label: "Active", value: aggregate.activeBookings, color: "#10b981" },
              { label: "Completed", value: aggregate.completedBookings, color: "#6b7280" },
              { label: "Cancelled", value: aggregate.cancelledBookings, color: "#ef4444" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {item.label}
                  </span>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div
            className="mt-4 pt-4 border-t grid grid-cols-2 gap-3"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="p-3 rounded-xl" style={{ background: "var(--muted)" }}>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Today&apos;s Bookings
              </p>
              <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                {aggregate.todayBookings}
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: "var(--muted)" }}>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Avg. Revenue / Booking
              </p>
              <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                {aggregate.completedBookings + aggregate.activeBookings > 0
                  ? formatPrice(
                      aggregate.totalRevenue /
                        (aggregate.completedBookings + aggregate.activeBookings),
                    )
                  : "£0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Per-business cards */}
      <div>
        <h2 className="text-base font-bold mb-4" style={{ color: "var(--foreground)" }}>
          Per-Business Breakdown
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {realBusinesses.map((biz) => {
            const data = bizData[biz.businessId];
            const s = data?.stats;

            return (
              <div
                key={biz.businessId}
                className="rounded-2xl border overflow-hidden"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                {/* Business header */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden ${biz.bg ?? "bg-gray-100"}`}
                    >
                      <Image
                        src={biz.img}
                        alt={biz.name}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--foreground)" }}
                      >
                        {biz.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {biz.distance} · {biz.type}
                      </p>
                    </div>
                  </div>

                  {/* Booking toggle */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-medium"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Bookings
                    </span>
                    <button
                      disabled={data?.loadingToggle}
                      onClick={() => handleToggle(biz.businessId, !data?.toggleEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                        data?.toggleEnabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          data?.toggleEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-xs font-semibold ${data?.toggleEnabled ? "text-green-600" : "text-red-500"}`}
                    >
                      {data?.loadingToggle ? "…" : data?.toggleEnabled ? "On" : "Off"}
                    </span>
                  </div>
                </div>

                {data?.error ? (
                  <div className="px-5 py-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    Failed to load stats for this business.
                  </div>
                ) : !s ? (
                  <div className="px-5 py-6 grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-14 rounded-xl animate-pulse"
                        style={{ background: "var(--border)" }}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Mini KPI grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y" style={{ borderColor: "var(--border)" }}>
                      {[
                        { label: "Total", value: s.totalBookings, color: "text-blue-600" },
                        { label: "Active", value: s.activeBookings, color: "text-green-600" },
                        { label: "Today", value: s.todayBookings, color: "text-purple-600" },
                        { label: "Revenue", value: formatPrice(s.totalRevenue), color: "text-yellow-600" },
                      ].map((kpi, ki) => (
                        <div key={ki} className="p-4" style={{ borderColor: "var(--border)" }}>
                          <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                            {kpi.label}
                          </p>
                          <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Status bar */}
                    <div
                      className="px-5 py-4 flex items-center gap-4 border-t flex-wrap"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {[
                        { label: "Upcoming", value: s.upcomingBookings, color: "#3b82f6" },
                        { label: "Completed", value: s.completedBookings, color: "#6b7280" },
                        { label: "Cancelled", value: s.cancelledBookings, color: "#ef4444" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: item.color }}
                          />
                          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            {item.label}
                          </span>
                          <span
                            className="text-xs font-bold ml-0.5"
                            style={{ color: "var(--foreground)" }}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                      <Link
                        href={`/admin/bookings`}
                        className="ml-auto text-xs font-semibold underline opacity-60 hover:opacity-100"
                        style={{ color: "var(--foreground)" }}
                      >
                        View bookings →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
