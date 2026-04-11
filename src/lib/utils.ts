import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PricingRule } from "@/types";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateChargeableDays(
  start: string | Date,
  end: string | Date,
): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatPrice(price: number): string {
  return currencyFormatter.format(price ?? 0);
}

export function formatDuration(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0m";

  const totalMinutes = Math.round(hours * 60);
  const days = Math.floor(totalMinutes / (24 * 60));
  const remainingMinutesAfterDays = totalMinutes % (24 * 60);
  const wholeHours = Math.floor(remainingMinutesAfterDays / 60);
  const minutes = remainingMinutesAfterDays % 60;
  const parts: string[] = [];

  if (days > 0) parts.push(`${days}d`);
  if (wholeHours > 0) parts.push(`${wholeHours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(" ");
}

export function formatDayCount(days: number): string {
  const normalizedDays = Number.isFinite(days) ? days : 0;
  return `${normalizedDays} day${normalizedDays !== 1 ? "s" : ""}`;
}

export function calculatePriceFromRules(
  totalDays: number,
  pricingRules: PricingRule[],
): number {
  if (totalDays <= 0) {
    return 0;
  }

  const rule = pricingRules.find(
    (currentRule) =>
      totalDays >= currentRule.startDay &&
      (currentRule.endDay == null || totalDays <= currentRule.endDay),
  );

  if (!rule) {
    return 0;
  }

  return rule.basePrice + (totalDays - rule.startDay) * rule.dailyIncrement;
}

export function getStatusLabel(status: string): string {
  return status === "active" ? "activated" : status;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "upcoming":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "active":
    case "activated":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "completed":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getPaymentStatusLabel(paymentStatus?: string): string {
  switch (paymentStatus) {
    case "paid":
      return "Paid";
    case "awaiting_payment":
      return "Awaiting payment";
    default:
      return "Unknown";
  }
}

export function getPaymentStatusColor(paymentStatus?: string): string {
  switch (paymentStatus) {
    case "paid":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "awaiting_payment":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
